// Parse workout HTML into a linear list of playable steps.
// Each step corresponds to one {{exercise:ID:Name}} placeholder, plus the
// prescription text (reps/time/rest) taken from its surrounding list item
// or paragraph. Section headings (h2/h3) become section labels.

export interface WorkoutStep {
  exerciseId: string | null;
  name: string;
  prescription: string; // e.g. "10 reps", "30 sec", "3 sets x 12"
  section?: string; // e.g. "Warm-up", "Main Workout"
  subSection?: string; // e.g. "Tabata Block 1"
}

const EXERCISE_RE = /\{\{exercise:([^:}]+):([^}]*)\}\}/gi;

function stripHtml(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent || "").replace(/\s+/g, " ").trim();
}

function extractPrescription(text: string, exerciseName: string): string {
  // Strip any raw exercise placeholders first
  let cleaned = text.replace(/\{\{exercise:[^}]*\}\}/gi, " ");
  if (exerciseName) {
    cleaned = cleaned.replace(
      new RegExp(exerciseName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
      ""
    );
  }
  return cleaned
    .replace(/^[\s\-–—:•·|,.]+|[\s\-–—:•·|,.]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getCanonicalWorkoutSection(text: string): string | undefined {
  const cleaned = text
    .toLowerCase()
    .replace(/[()\[\]{}:]/g, " ")
    .replace(/\d+\s*(?:'|minutes?|mins?|m)\b/g, " ")
    .replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (/soft\s*tissue|tissue\s*preparation|prep\b/.test(cleaned)) return "Soft Tissue Preparation";
  if (/activation/.test(cleaned)) return "Activation";
  if (/warm\s*-?\s*up|warmup/.test(cleaned)) return "Warm-up";
  if (/main\s*workout|main\s*block/.test(cleaned)) return "Main Workout";
  if (/finisher/.test(cleaned)) return "Finisher";
  if (/cool\s*-?\s*down|cooldown/.test(cleaned) || cleaned === "cool") return "Cool-down";

  return undefined;
}

function getWorkoutSubSection(text: string): string | undefined {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned || cleaned.length > 90) return undefined;
  if (/\b(?:tabata|amrap|emom|circuit|block\s*\d+|round\s*\d+)\b/i.test(cleaned)) {
    return cleaned.replace(/^[^a-zA-Z0-9]+/, "").trim();
  }
  return undefined;
}

export function parseWorkoutSteps(html: string): WorkoutStep[] {
  if (!html || typeof document === "undefined") return [];

  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.body.firstChild as HTMLElement | null;
  if (!root) return [];

  const steps: WorkoutStep[] = [];
  let currentSection: string | undefined;
  let currentSubSection: string | undefined;

  // Walk in document order
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);
  const visited = new Set<Element>();

  let node: Node | null = walker.currentNode;
  while (node) {
    const el = node as Element;
    const tag = el.tagName?.toLowerCase();

    if (tag && ["h1", "h2", "h3", "h4"].includes(tag)) {
      const heading = stripHtml(el.innerHTML);
      const canonicalSection = getCanonicalWorkoutSection(heading);
      if (canonicalSection) {
        currentSection = canonicalSection;
        currentSubSection = undefined;
      } else {
        currentSubSection = getWorkoutSubSection(heading) || currentSubSection;
      }
    }

    if (tag && ["li", "p"].includes(tag) && !visited.has(el)) {
      const inner = el.innerHTML;
      const matches = Array.from(inner.matchAll(EXERCISE_RE));
      const rawText = stripHtml(inner);

      if (matches.length === 0) {
        const canonicalSection = getCanonicalWorkoutSection(rawText);
        if (canonicalSection) {
          currentSection = canonicalSection;
          currentSubSection = undefined;
        } else {
          currentSubSection = getWorkoutSubSection(rawText) || currentSubSection;
        }
      }

      if (matches.length > 0) {
        // mark ancestors visited to avoid duplicate p-inside-li
        visited.add(el);
        el.querySelectorAll("p, li").forEach(child => visited.add(child));

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
            subSection: currentSubSection,
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
              subSection: currentSubSection,
            });
          }
        }
      }
    }

    node = walker.nextNode();
  }

  return steps;
}
