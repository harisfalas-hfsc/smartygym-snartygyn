// Parse workout HTML into a linear list of playable steps.
// Each step corresponds to one {{exercise:ID:Name}} placeholder, plus the
// prescription text (reps/time/rest) taken from its surrounding list item
// or paragraph. Section headings (h2/h3) become section labels.

export interface WorkoutStep {
  exerciseId: string | null;
  name: string;
  prescription: string; // e.g. "10 reps", "30 sec", "3 sets x 12"
  section?: string; // e.g. "Warm-up", "Main Workout"
}

const EXERCISE_RE = /\{\{exercise:([^:}]+):([^}]*)\}\}/gi;

function stripHtml(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent || "").replace(/\s+/g, " ").trim();
}

function extractPrescription(text: string, exerciseName: string): string {
  // Remove the exercise name from the text; what's left is the prescription
  const cleaned = text
    .replace(new RegExp(exerciseName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), "")
    .replace(/^[\s\-–—:•·|,.]+|[\s\-–—:•·|,.]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned;
}

export function parseWorkoutSteps(html: string): WorkoutStep[] {
  if (!html || typeof document === "undefined") return [];

  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.body.firstChild as HTMLElement | null;
  if (!root) return [];

  const steps: WorkoutStep[] = [];
  let currentSection: string | undefined;

  // Walk in document order
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);
  const visited = new Set<Element>();

  let node: Node | null = walker.currentNode;
  while (node) {
    const el = node as Element;
    const tag = el.tagName?.toLowerCase();

    if (tag && ["h1", "h2", "h3", "h4"].includes(tag)) {
      currentSection = stripHtml(el.innerHTML) || currentSection;
    }

    if (tag && ["li", "p"].includes(tag) && !visited.has(el)) {
      const inner = el.innerHTML;
      const matches = Array.from(inner.matchAll(EXERCISE_RE));
      if (matches.length > 0) {
        // mark ancestors visited to avoid duplicate p-inside-li
        visited.add(el);
        el.querySelectorAll("p, li").forEach(child => visited.add(child));

        const rawText = stripHtml(inner);
        // If multiple exercises in one line, split by the placeholders
        if (matches.length === 1) {
          const m = matches[0];
          const id = m[1]?.trim() || null;
          const name = m[2]?.trim() || "Exercise";
          steps.push({
            exerciseId: id && id !== "null" ? id : null,
            name,
            prescription: extractPrescription(rawText, name),
            section: currentSection,
          });
        } else {
          for (const m of matches) {
            const id = m[1]?.trim() || null;
            const name = m[2]?.trim() || "Exercise";
            steps.push({
              exerciseId: id && id !== "null" ? id : null,
              name,
              prescription: "",
              section: currentSection,
            });
          }
        }
      }
    }

    node = walker.nextNode();
  }

  return steps;
}
