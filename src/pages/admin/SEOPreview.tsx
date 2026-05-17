import { useState } from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";

interface MetaTag {
  name?: string;
  property?: string;
  content: string;
}

interface ParseResult {
  fetchedUrl: string;
  title: string;
  description: string;
  canonical: string;
  metas: MetaTag[];
  jsonLd: { raw: string; parsed: any | null; error?: string }[];
  duplicates: string[];
}

function normalizePath(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "/";
  try {
    // Accept full URLs; we only fetch the path on the current origin.
    const u = new URL(trimmed, window.location.origin);
    return u.pathname + u.search;
  } catch {
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  }
}

function parseHtml(html: string, fetchedUrl: string): ParseResult {
  const doc = new DOMParser().parseFromString(html, "text/html");

  const title = doc.querySelector("title")?.textContent?.trim() ?? "";
  const description = doc.querySelector('meta[name="description"]')?.getAttribute("content") ?? "";
  const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? "";

  const metas: MetaTag[] = [];
  doc.querySelectorAll("meta").forEach((m) => {
    const content = m.getAttribute("content");
    if (!content) return;
    const name = m.getAttribute("name") || undefined;
    const property = m.getAttribute("property") || undefined;
    if (!name && !property) return;
    metas.push({ name, property, content });
  });

  const jsonLd: ParseResult["jsonLd"] = [];
  doc.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
    const raw = s.textContent ?? "";
    try {
      jsonLd.push({ raw, parsed: JSON.parse(raw) });
    } catch (e: any) {
      jsonLd.push({ raw, parsed: null, error: e?.message ?? "Invalid JSON" });
    }
  });

  // Flag duplicate top-level @types (e.g. two FAQPage blocks).
  const typeCounts: Record<string, number> = {};
  for (const block of jsonLd) {
    if (!block.parsed) continue;
    const collect = (node: any) => {
      if (!node) return;
      if (Array.isArray(node)) return node.forEach(collect);
      if (node["@type"]) {
        const t = Array.isArray(node["@type"]) ? node["@type"].join(",") : String(node["@type"]);
        typeCounts[t] = (typeCounts[t] || 0) + 1;
      }
      if (node["@graph"]) collect(node["@graph"]);
    };
    collect(block.parsed);
  }
  const duplicates = Object.entries(typeCounts)
    .filter(([, n]) => n > 1)
    .map(([t, n]) => `${t} (×${n})`);

  return { fetchedUrl, title, description, canonical, metas, jsonLd, duplicates };
}

export default function SEOPreview() {
  const [input, setInput] = useState("/");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ParseResult | null>(null);

  const handleFetch = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    const path = normalizePath(input);
    const fetchUrl = `${window.location.origin}${path}`;
    try {
      const res = await fetch(fetchUrl, { credentials: "omit", headers: { Accept: "text/html" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      setResult(parseHtml(html, fetchUrl));
    } catch (e: any) {
      setError(e?.message || "Failed to fetch page");
    } finally {
      setLoading(false);
    }
  };

  const richResultsUrl = result
    ? `https://search.google.com/test/rich-results?url=${encodeURIComponent(result.fetchedUrl)}`
    : null;

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      <Helmet>
        <title>SEO Preview - Admin - SmartyGym</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div>
        <h1 className="text-3xl font-bold">SEO Schema Preview</h1>
        <p className="text-muted-foreground mt-1">
          Inspect the meta tags and JSON-LD schemas served for any path on this site.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inspect a page</CardTitle>
          <CardDescription>
            Enter a path (e.g. <code>/</code>, <code>/blog</code>) or a full smartygym.com URL.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="/"
              onKeyDown={(e) => e.key === "Enter" && handleFetch()}
            />
            <Button onClick={handleFetch} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Inspect"}
            </Button>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Summary</span>
                {richResultsUrl && (
                  <Button asChild variant="outline" size="sm">
                    <a href={richResultsUrl} target="_blank" rel="noopener noreferrer">
                      Google Rich Results Test <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                )}
              </CardTitle>
              <CardDescription className="break-all">{result.fetchedUrl}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Field label="Title" value={result.title} />
              <Field label="Description" value={result.description} />
              <Field label="Canonical" value={result.canonical} />
              <div className="flex gap-2 flex-wrap pt-2">
                <Badge variant="secondary">{result.metas.length} meta tags</Badge>
                <Badge variant="secondary">{result.jsonLd.length} JSON-LD blocks</Badge>
                {result.duplicates.length > 0 ? (
                  <Badge variant="destructive">
                    Duplicate @type: {result.duplicates.join(", ")}
                  </Badge>
                ) : (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> No duplicate @types
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>JSON-LD ({result.jsonLd.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.jsonLd.length === 0 && (
                <p className="text-sm text-muted-foreground">No JSON-LD blocks found.</p>
              )}
              {result.jsonLd.map((block, i) => (
                <div key={i} className="border rounded-md">
                  <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/50">
                    <span className="text-sm font-medium">
                      Block #{i + 1}
                      {block.parsed && (
                        <span className="text-muted-foreground ml-2">
                          @type:{" "}
                          {Array.isArray(block.parsed["@type"])
                            ? block.parsed["@type"].join(", ")
                            : block.parsed["@type"] || (block.parsed["@graph"] ? "@graph" : "?")}
                        </span>
                      )}
                    </span>
                    {block.error && <Badge variant="destructive">Invalid JSON</Badge>}
                  </div>
                  <pre className="text-xs p-3 overflow-auto max-h-96 bg-muted/20">
                    {block.error
                      ? `${block.error}\n\n${block.raw}`
                      : JSON.stringify(block.parsed, null, 2)}
                  </pre>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Meta tags ({result.metas.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-3">Key</th>
                      <th className="py-2">Content</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.metas.map((m, i) => (
                      <tr key={i} className="border-b last:border-b-0">
                        <td className="py-1.5 pr-3 font-mono text-xs whitespace-nowrap align-top">
                          {m.property || m.name}
                        </td>
                        <td className="py-1.5 break-all">{m.content}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-mono text-sm break-all">{value || <span className="text-muted-foreground">(empty)</span>}</div>
    </div>
  );
}
