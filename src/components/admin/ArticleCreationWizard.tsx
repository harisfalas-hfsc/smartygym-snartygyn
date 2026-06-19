import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Guided wizard for creating a new Blog Article.
 *
 * Mirrors the cron pipeline in `generate-weekly-blog-articles`:
 *   1. Admin picks the category (Fitness / Nutrition / Wellness).
 *   2. Admin types the exact article title.
 *   3. AI reads the title + category and drafts the full article using
 *      the same prompt rules (sections, internal links, word count,
 *      author attribution, SEO image) as the weekly cron — except the
 *      result is returned as an unsaved DRAFT for the admin to review
 *      and publish manually via ArticleEditDialog.
 */

const ARTICLE_CATEGORIES = ["Fitness", "Nutrition", "Wellness"] as const;
const WORD_COUNT_OPTIONS = [800, 1000, 1200, 1500] as const;
type Category = typeof ARTICLE_CATEGORIES[number];
type WordCount = typeof WORD_COUNT_OPTIONS[number];

export interface ArticleWizardDraft {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  author_name: string;
  author_credentials: string;
  is_ai_generated: boolean;
  is_published: boolean;
  read_time: string;
  image_url: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the drafted article so the parent can open the edit dialog. */
  onComplete: (draft: ArticleWizardDraft) => void;
  /** Skip the wizard and open a blank manual article editor. */
  onSkipToManual: () => void;
}

export const ArticleCreationWizard = ({ open, onOpenChange, onComplete, onSkipToManual }: Props) => {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<Category | "">("");
  const [brief, setBrief] = useState("");
  const [wordCount, setWordCount] = useState<WordCount>(1000);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(0);
      setCategory("");
      setBrief("");
      setWordCount(1000);
      setGenerating(false);
    }
  }, [open]);

  const steps = [
    { key: "category", title: "Category" },
    { key: "brief", title: "Brief" },
    { key: "wordCount", title: "Word Count" },
    { key: "review", title: "Review" },
  ];
  const currentKey = steps[step].key;
  const totalSteps = steps.length;

  const canContinue = () => {
    if (currentKey === "category") return !!category;
    if (currentKey === "brief") return brief.trim().length >= 15;
    return true;
  };

  const goNext = () => step < totalSteps - 1 && setStep(step + 1);
  const goBack = () => step > 0 && setStep(step - 1);

  const handleGenerate = async () => {
    if (!category || !brief.trim()) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-admin-article", {
        body: { brief: brief.trim(), category, wordCount },
      });
      if (error) throw error;
      if (!data?.ok || !data?.draft) throw new Error(data?.error || "Generation failed");

      toast({
        title: "Article drafted",
        description: `"${data.draft.title}" is ready — review and click Save to publish.`,
      });
      onComplete(data.draft as ArticleWizardDraft);
      onOpenChange(false);
    } catch (e: any) {
      console.error("[ArticleWizard] generate failed", e);
      let message = e?.message || "Could not generate the article. Please try again.";
      if (e?.context && typeof e.context.json === "function") {
        try {
          const backendError = await e.context.json();
          message = backendError?.error || message;
        } catch {
          // keep SDK message
        }
      }
      toast({ title: "Generation failed", description: message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden px-3 sm:px-6">
        <DialogHeader>
          <DialogTitle>Create New Article</DialogTitle>
          <DialogDescription>
            Step {step + 1} of {totalSteps} — {steps[step].title}. The AI will read your title
            and draft the full article using the same rules as the weekly cron pipeline. Nothing
            is saved until you review and click <strong>Save</strong> in the editor.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-end -mt-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-primary"
            onClick={() => {
              onSkipToManual();
              onOpenChange(false);
            }}
          >
            Skip wizard — open manual editor →
          </Button>
        </div>

        <div className="flex items-center gap-1.5 my-3">
          {steps.map((s, i) => (
            <div
              key={s.key}
              className={
                "h-1.5 rounded-full flex-1 transition " +
                (i < step ? "bg-primary" : i === step ? "bg-primary/70" : "bg-muted")
              }
            />
          ))}
        </div>

        <div className="space-y-4">
          {currentKey === "category" && (
            <div className="grid gap-2 grid-cols-1 sm:grid-cols-3">
              {ARTICLE_CATEGORIES.map((c) => {
                const active = category === c;
                return (
                  <Card
                    key={c}
                    role="button"
                    tabIndex={0}
                    onClick={() => setCategory(c)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setCategory(c);
                      }
                    }}
                    className={
                      "p-4 cursor-pointer transition border-2 " +
                      (active
                        ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                        : "border-border hover:border-primary/50")
                    }
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold">{c}</div>
                      {active && <Check className="w-4 h-4 text-primary" />}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {currentKey === "brief" && (
            <div className="space-y-2">
              <Label htmlFor="article-brief">What is this article about?</Label>
              <Textarea
                id="article-brief"
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder={
                  "Describe the article like a prompt. Examples:\n" +
                  "• Topic / angle / audience (e.g. men over 50 losing belly fat)\n" +
                  "• Keywords to include\n" +
                  "• References, studies, or sources to lean on\n" +
                  "• Anything to avoid\n\n" +
                  "The AI will read this brief and craft the title + full article around it."
                }
                autoFocus
                rows={9}
                maxLength={2000}
                className="min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground">
                Minimum ~15 characters. The more context, keywords and references you give, the
                more on-point the article will be. The AI will craft the SEO title from your brief.
              </p>
            </div>
          )}

          {currentKey === "wordCount" && (
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
              {WORD_COUNT_OPTIONS.map((count) => {
                const active = wordCount === count;
                return (
                  <Card
                    key={count}
                    role="button"
                    tabIndex={0}
                    onClick={() => setWordCount(count)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setWordCount(count);
                      }
                    }}
                    className={
                      "p-4 cursor-pointer transition border-2 " +
                      (active
                        ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                        : "border-border hover:border-primary/50")
                    }
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold">{count}</div>
                      {active && <Check className="w-4 h-4 text-primary" />}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">words</div>
                  </Card>
                );
              })}
            </div>
          )}

          {currentKey === "review" && (
            <Card className="p-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 font-semibold text-base mb-1">
                <FileText className="w-4 h-4" /> New Blog Article
              </div>
              <Row label="Category" value={category || "—"} />
              <Row label="Brief" value={brief.trim() || "—"} />
              <Row label="Length" value={`${wordCount} words`} />
              <p className="text-xs text-muted-foreground pt-2 border-t mt-3">
                <strong>Generate &amp; Review</strong> drafts the full article ({wordCount} words,
                AI-crafted SEO title from your brief, section headings, internal links, featured
                image, SEO read time) using the same pipeline as the weekly cron, then opens it
                in the editor. Nothing is published until you click <strong>Save</strong> there.
              </p>
            </Card>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t">
          <Button variant="outline" onClick={goBack} disabled={step === 0 || generating}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <Badge variant="outline" className="text-xs">
            {step + 1} / {totalSteps}
          </Badge>
          {currentKey === "review" ? (
            <Button onClick={handleGenerate} disabled={generating || !category || !brief.trim()}>
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Generating…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-1" /> Generate &amp; Review
                </>
              )}
            </Button>
          ) : (
            <Button onClick={goNext} disabled={!canContinue()}>
              Next <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-3 py-1">
    <span className="text-muted-foreground shrink-0">{label}</span>
    <span className="font-medium text-right break-words">{value}</span>
  </div>
);