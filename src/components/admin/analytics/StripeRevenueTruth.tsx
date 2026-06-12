import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { Download, RefreshCw, Receipt, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Payment {
  id: string;
  amount: number;
  gross: number;
  refunded: number;
  currency: string;
  date: string;
  customer: string | null;
  email: string | null;
  description: string | null;
  productName: string | null;
  productId: string | null;
  contentType: string | null;
  recurring: boolean;
}

type Category = "Premium Plan" | "Standalone Workout" | "Standalone Training Program";

const CATEGORY_COLORS: Record<Category, string> = {
  "Premium Plan": "hsl(var(--primary))",
  "Standalone Workout": "hsl(var(--chart-2))",
  "Standalone Training Program": "hsl(var(--chart-3))",
};

function categorize(p: Payment): Category {
  const ct = (p.contentType || "").toLowerCase();
  const name = (p.productName || "").toLowerCase();
  if (ct.includes("training program") || ct === "program" || /training program/.test(name)) {
    return "Standalone Training Program";
  }
  if (ct === "workout" || ct === "micro-workout" || /\bworkout\b/.test(name)) {
    return "Standalone Workout";
  }
  // Everything else (recurring subscriptions, lifetime, gold, platinum, premium) = Premium Plan
  return "Premium Plan";
}

export function StripeRevenueTruth() {
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalCollected, setTotalCollected] = useState(0);
  const [totalRefunded, setTotalRefunded] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [unattributed, setUnattributed] = useState(0);
  const [unattributedAmount, setUnattributedAmount] = useState(0);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-stripe-revenue");
      if (error) throw error;
      setPayments(data.payments || []);
      setTotalCollected(data.totalCollected || 0);
      setTotalRefunded(data.totalRefunded || 0);
      setSkipped(data.skippedNonSmartyGym || 0);
      setUnattributed(data.unattributed || 0);
      setUnattributedAmount(data.unattributedAmount || 0);
    } catch (e: any) {
      toast.error(`Failed to load Stripe revenue: ${e?.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const enriched = useMemo(
    () => payments.map(p => ({ ...p, category: categorize(p) as Category })),
    [payments],
  );

  const byCategory = useMemo(() => {
    const m = new Map<Category, { revenue: number; count: number }>();
    for (const p of enriched) {
      const cur = m.get(p.category) || { revenue: 0, count: 0 };
      cur.revenue += p.amount;
      cur.count += 1;
      m.set(p.category, cur);
    }
    return Array.from(m.entries())
      .map(([category, v]) => ({ category, ...v }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [enriched]);

  const bestSellersByCategory = useMemo(() => {
    const m = new Map<string, { name: string; category: Category; revenue: number; sales: number }>();
    for (const p of enriched) {
      const key = `${p.category}::${p.productName || "Unknown"}`;
      const cur = m.get(key) || { name: p.productName || "Unknown", category: p.category, revenue: 0, sales: 0 };
      cur.revenue += p.amount;
      cur.sales += 1;
      m.set(key, cur);
    }
    const all = Array.from(m.values());
    const grouped: Record<Category, typeof all> = {
      "Premium Plan": [],
      "Standalone Workout": [],
      "Standalone Training Program": [],
    };
    for (const item of all) grouped[item.category].push(item);
    (Object.keys(grouped) as Category[]).forEach(k =>
      grouped[k].sort((a, b) => b.revenue - a.revenue),
    );
    return grouped;
  }, [enriched]);

  const byMonth = useMemo(() => {
    const m = new Map<string, Record<string, number>>();
    for (const p of enriched) {
      const month = p.date.slice(0, 7);
      const row = m.get(month) || {};
      row[p.category] = (row[p.category] || 0) + p.amount;
      m.set(month, row);
    }
    return Array.from(m.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, vals]) => ({ month, ...vals }));
  }, [enriched]);

  const filtered = useMemo(() => {
    return enriched.filter(p => {
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (!search.trim()) return true;
      const s = search.toLowerCase();
      return (
        (p.email || "").toLowerCase().includes(s) ||
        (p.productName || "").toLowerCase().includes(s) ||
        (p.description || "").toLowerCase().includes(s) ||
        p.id.toLowerCase().includes(s)
      );
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [enriched, search, categoryFilter]);

  const exportCSV = () => {
    const rows = [
      ["Date", "Category", "Product", "Customer Email", "Amount (€)", "Refunded (€)", "Recurring", "Charge ID"],
      ...filtered.map(p => [
        new Date(p.date).toISOString(),
        p.category,
        p.productName || "",
        p.email || "",
        p.amount.toFixed(2),
        p.refunded.toFixed(2),
        p.recurring ? "yes" : "no",
        p.id,
      ]),
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `stripe-revenue-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" /> Stripe Revenue — Source of Truth
            </CardTitle>
            <CardDescription>
              Every successful, non-refunded SmartyGym charge straight from Stripe (project=SMARTYGYM metadata).
              Numbers below = sum of these exact payments.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button size="sm" variant="outline" onClick={exportCSV} disabled={!filtered.length}>
              <Download className="h-4 w-4 mr-1" /> Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Headline totals */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">Total Collected (net)</div>
                <p className="text-2xl font-bold">€{totalCollected.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{payments.length} payments</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">Refunded</div>
                <p className="text-2xl font-bold">€{totalRefunded.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">Excluded (non‑SmartyGym)</div>
                <p className="text-2xl font-bold">{skipped}</p>
                <p className="text-xs text-muted-foreground">charges in other projects</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  {unattributed > 0 && <AlertCircle className="h-3 w-3 text-orange-500" />} Unattributed
                </div>
                <p className="text-2xl font-bold">{unattributed}</p>
                <p className="text-xs text-muted-foreground">€{unattributedAmount.toFixed(2)} no product match</p>
              </CardContent>
            </Card>
          </div>

          {/* Breakdown by category */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Breakdown by Category</CardTitle>
              <CardDescription className="text-xs">
                This is exactly where the total above comes from.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Payments</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">% of total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byCategory.map(row => (
                    <TableRow key={row.category}>
                      <TableCell>
                        <span
                          className="inline-block w-2 h-2 rounded-full mr-2 align-middle"
                          style={{ background: CATEGORY_COLORS[row.category] }}
                        />
                        {row.category}
                      </TableCell>
                      <TableCell className="text-right">{row.count}</TableCell>
                      <TableCell className="text-right font-semibold">€{row.revenue.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        {totalCollected > 0 ? ((row.revenue / totalCollected) * 100).toFixed(1) : "0"}%
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/40 font-bold">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">{payments.length}</TableCell>
                    <TableCell className="text-right">€{totalCollected.toFixed(2)}</TableCell>
                    <TableCell className="text-right">100%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Monthly stacked chart */}
          {byMonth.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Monthly Revenue by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={byMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `€${v}`} />
                    <Tooltip formatter={(v: any) => `€${Number(v).toFixed(2)}`} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {(Object.keys(CATEGORY_COLORS) as Category[]).map(cat => (
                      <Bar key={cat} dataKey={cat} stackId="r" fill={CATEGORY_COLORS[cat]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Best sellers per category */}
          <div className="grid md:grid-cols-2 gap-4">
            {(Object.keys(bestSellersByCategory) as Category[])
              .filter(cat => bestSellersByCategory[cat].length > 0)
              .map(cat => (
                <Card key={cat}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ background: CATEGORY_COLORS[cat] }}
                      />
                      Best sellers — {cat}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-right">Sales</TableHead>
                          <TableHead className="text-right">Revenue</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bestSellersByCategory[cat].slice(0, 10).map((row, i) => (
                          <TableRow key={i}>
                            <TableCell className="max-w-[260px] truncate">{row.name}</TableCell>
                            <TableCell className="text-right">{row.sales}</TableCell>
                            <TableCell className="text-right font-medium">€{row.revenue.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
          </div>

          {/* Every single payment */}
          <Card>
            <CardHeader className="pb-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <CardTitle className="text-sm">Every Payment (drill‑down)</CardTitle>
                <CardDescription className="text-xs">
                  Click‑level transparency: each row is one Stripe charge that adds to the total above.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[220px] h-9 text-sm">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {(Object.keys(CATEGORY_COLORS) as Category[]).map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search email, product, charge id…"
                  className="h-9 w-[260px]"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Refunded</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No payments match your filter.
                        </TableCell>
                      </TableRow>
                    )}
                    {filtered.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="whitespace-nowrap">{new Date(p.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" style={{ borderColor: CATEGORY_COLORS[p.category] }}>
                            {p.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[260px] truncate" title={p.productName || p.description || ""}>
                          {p.productName || p.description || <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{p.email || "—"}</TableCell>
                        <TableCell>
                          {p.recurring ? (
                            <Badge variant="secondary">Recurring</Badge>
                          ) : (
                            <Badge variant="outline">One‑off</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">€{p.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {p.refunded > 0 ? `€${p.refunded.toFixed(2)}` : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}