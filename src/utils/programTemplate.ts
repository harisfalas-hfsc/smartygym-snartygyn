// ═══════════════════════════════════════════════════════════════════════════════
// STANDARDIZED TRAINING PROGRAM TEMPLATE
// Mirrors supabase/functions/_shared/program-template.ts — keep in sync.
// Used by the admin editor "Standardized Training Program Format" button.
// ═══════════════════════════════════════════════════════════════════════════════

export type ProgramCategory =
  | "FUNCTIONAL STRENGTH"
  | "MUSCLE HYPERTROPHY"
  | "CARDIO ENDURANCE"
  | "WEIGHT LOSS"
  | "MOBILITY & STABILITY"
  | "LOW BACK PAIN"
  | string;

const DAY_NUMERALS = ["①", "②", "③", "④", "⑤", "⑥"];

const DAY_TITLE_PRESETS: Record<string, string[]> = {
  "FUNCTIONAL STRENGTH": ["Lower Body Strength", "Upper Body Strength", "Conditioning", "Full Body Strength", "Power & Carries", "Movement Quality"],
  "MUSCLE HYPERTROPHY": ["Chest & Triceps", "Back & Biceps", "Lower Body", "Shoulders & Core", "Full Body Hypertrophy", "Arms & Accessory"],
  "CARDIO ENDURANCE": ["Aerobic Base Development", "Tempo Conditioning", "Interval Training", "Long Duration Cardio", "Recovery Run", "Mixed Modal"],
  "WEIGHT LOSS": ["Metabolic Conditioning", "Calorie Burn Circuit", "Strength Endurance", "Fat Loss Challenge", "Cardio Endurance", "Full Body Burn"],
  "MOBILITY & STABILITY": ["Hip Mobility", "Thoracic Mobility", "Core Stability", "Movement Control", "Shoulder Mobility", "Full Body Flow"],
  "LOW BACK PAIN": ["Core Activation", "Spinal Stability", "Hip Mobility", "Functional Movement Restoration", "Posterior Chain", "Gentle Strength"],
};

function dayTitlesFor(category: string, daysPerWeek: number): string[] {
  const key = (category || "").toUpperCase();
  const preset = Object.keys(DAY_TITLE_PRESETS).find((k) => key.includes(k));
  const list = preset ? DAY_TITLE_PRESETS[preset] : ["Training Day"];
  const titles: string[] = [];
  for (let i = 0; i < daysPerWeek; i++) titles.push(list[i % list.length]);
  return titles;
}

function weeklyObjectiveFor(category: string, weekIndex: number, totalWeeks: number): string {
  const phase = phaseLabel(weekIndex, totalWeeks);
  switch (phase) {
    case "Foundation":
      return "Establish proper technique, movement quality, and baseline training volume.";
    case "Progressive Overload":
      return "Increase total training volume and improve exercise execution through progressive overload.";
    case "Peak":
      return "Maximize training stimulus through higher intensity and density.";
    case "Deload":
      return "Reduce fatigue and enhance recovery through a deload week.";
    case "Final Challenge":
      return "Apply all previous adaptations in the highest-performance week of the program.";
    default:
      return "Continue progressive development with consistent execution.";
  }
}

export function phaseLabel(weekIndex: number, totalWeeks: number): string {
  // weekIndex is 1-based
  if (totalWeeks >= 12) {
    if (weekIndex <= 3) return "Foundation";
    if (weekIndex <= 7) return "Progressive Overload";
    if (weekIndex === 8) return "Deload";
    if (weekIndex <= 11) return "Peak";
    return "Final Challenge";
  }
  if (totalWeeks >= 8) {
    if (weekIndex <= 2) return "Foundation";
    if (weekIndex <= Math.ceil(totalWeeks * 0.6)) return "Progressive Overload";
    if (weekIndex === totalWeeks) return "Final Challenge";
    return "Peak";
  }
  // 4-6 week programs
  if (weekIndex === 1) return "Foundation";
  if (weekIndex === totalWeeks) return "Final Challenge";
  return "Progressive Overload";
}

export interface SkeletonInput {
  category: string;
  weeks: number;
  daysPerWeek: number;
  /** Optional library exercises to pre-fill training day bullets. */
  exercisesPerDay?: string[][][]; // exercisesPerDay[weekIndex0][dayIndex0] => list of session lines (headings + {{exercise:ID:Name}} bullets)
}

function formatSessionLine(line: string): string {
  const text = (line || "").trim();
  if (!text) return "";
  if (text.startsWith("•") || text.startsWith("<")) return text;
  return `• ${text}`;
}

function defaultSessionTemplate(): string[] {
  return [
    "<strong>Estimated session time: 35–45 minutes</strong>",
    "<strong>Warm-Up — 6–8 minutes</strong>",
    "• Raise body temperature and rehearse the first movement pattern.",
    "<strong>Main Block — 24–30 minutes</strong>",
    "• Exercise 1 — sets × reps, rest period",
    "• Exercise 2 — sets × reps, rest period",
    "• Exercise 3 — sets × reps, rest period",
    "• Exercise 4 — sets × reps, rest period",
    "• Exercise 5 — sets × reps, rest period",
    "<strong>Finisher — 4–6 minutes</strong>",
    "• Short conditioning finisher or loaded carry sequence.",
    "<strong>Cool Down — 5 minutes</strong>",
    "• Lower intensity gradually, then stretch the trained areas.",
  ];
}

/**
 * Build the standardized program skeleton.
 * Output is a clean HTML string compatible with the existing RichTextEditor / WorkoutDisplay renderer.
 */
export function buildProgramSkeleton(input: SkeletonInput): string {
  const { category, weeks, daysPerWeek, exercisesPerDay } = input;
  const totalDays = 7;
  const trainingDays = Math.min(daysPerWeek, 6);
  const titles = dayTitlesFor(category, trainingDays);
  const sep = '<hr class="program-divider" />';
  const out: string[] = [];

  for (let w = 1; w <= weeks; w++) {
    const objective = weeklyObjectiveFor(category, w, weeks);
    const phase = phaseLabel(w, weeks);
    out.push(`<p class="tiptap-paragraph"><strong>📅 WEEK ${w}</strong> <em>(${phase})</em></p>`);
    out.push(`<p class="tiptap-paragraph"><strong>🎯 Objective</strong></p>`);
    out.push(`<p class="tiptap-paragraph">${objective}</p>`);
    out.push(sep);

    for (let d = 1; d <= trainingDays; d++) {
      const numeral = DAY_NUMERALS[d - 1] || `${d}.`;
      const title = titles[d - 1] || "Training Day";
      out.push(`<p class="tiptap-paragraph"><strong>${numeral} DAY ${d} – ${title}</strong></p>`);

      const dayBullets =
        exercisesPerDay?.[w - 1]?.[d - 1] && exercisesPerDay[w - 1][d - 1].length
          ? exercisesPerDay[w - 1][d - 1]
          : defaultSessionTemplate();

      for (const line of dayBullets) {
        const text = formatSessionLine(line);
        out.push(`<p class="tiptap-paragraph">${text}</p>`);
      }
      out.push(sep);
    }

    // Recovery day (always present if trainingDays < 7)
    const recoveryDay = trainingDays + 1;
    if (recoveryDay <= totalDays) {
      out.push(`<p class="tiptap-paragraph"><strong>😴 DAY ${recoveryDay} – Active Recovery</strong></p>`);
      out.push(`<p class="tiptap-paragraph">• Walking</p>`);
      out.push(`<p class="tiptap-paragraph">• Mobility</p>`);
      out.push(`<p class="tiptap-paragraph">• Stretching</p>`);
      out.push(sep);
    }

    // Rest days
    for (let r = recoveryDay + 1; r <= totalDays; r++) {
      out.push(`<p class="tiptap-paragraph"><strong>🏁 DAY ${r} – Rest</strong></p>`);
      out.push(sep);
    }

    if (w < weeks) out.push(`<p class="tiptap-paragraph"></p>`);
  }

  return out.join("\n");
}

/**
 * Build the periodization phase summary for the `program_structure` / "Instructions" block.
 */
export function buildPhaseInstructions(weeks: number, category: string): string {
  const lines: string[] = [];
  lines.push(`<p class="tiptap-paragraph"><strong>📝 Program Periodization</strong></p>`);

  const phases: Array<{ range: string; name: string; desc: string }> = [];
  if (weeks >= 12) {
    phases.push({ range: "Weeks 1–3", name: "Foundation Phase", desc: "Focus on movement quality, exercise mastery, and building a foundation for future progression." });
    phases.push({ range: "Weeks 4–7", name: "Progressive Overload Phase", desc: "Gradually increase loads, repetitions, or total volume whenever all prescribed sets can be completed with excellent technique." });
    phases.push({ range: "Week 8", name: "Recovery & Deload Phase", desc: "Reduce training volume by approximately 40–50% while maintaining movement quality and technique." });
    phases.push({ range: "Weeks 9–11", name: "Peak Phase", desc: "Increase training density, intensity, and total workload to maximize adaptations." });
    phases.push({ range: "Week 12", name: "Final Challenge Phase", desc: "Apply all previous adaptations and complete the highest-performance training week of the program." });
  } else if (weeks >= 8) {
    phases.push({ range: "Weeks 1–2", name: "Foundation Phase", desc: "Build technique and baseline volume." });
    phases.push({ range: `Weeks 3–${Math.ceil(weeks * 0.6)}`, name: "Progressive Overload Phase", desc: "Increase loads and volume with quality technique." });
    phases.push({ range: `Weeks ${Math.ceil(weeks * 0.6) + 1}–${weeks - 1}`, name: "Peak Phase", desc: "Maximize training intensity and stimulus." });
    phases.push({ range: `Week ${weeks}`, name: "Final Challenge Phase", desc: "Highest-performance week — apply all adaptations." });
  } else {
    phases.push({ range: "Week 1", name: "Foundation Phase", desc: "Establish technique and baseline volume." });
    phases.push({ range: `Weeks 2–${weeks - 1}`, name: "Progressive Overload Phase", desc: "Increase loads and volume progressively." });
    phases.push({ range: `Week ${weeks}`, name: "Final Challenge Phase", desc: "Highest performance week of the program." });
  }

  for (const p of phases) {
    lines.push(`<p class="tiptap-paragraph"><strong>${p.range} — ${p.name}</strong></p>`);
    lines.push(`<p class="tiptap-paragraph">${p.desc}</p>`);
  }

  lines.push(`<p class="tiptap-paragraph"></p>`);
  lines.push(`<p class="tiptap-paragraph"><strong>General Guidelines</strong></p>`);
  lines.push(`<p class="tiptap-paragraph">• Perform a complete warm-up before every session.</p>`);
  lines.push(`<p class="tiptap-paragraph">• Use loads that allow completion of all prescribed repetitions with proper technique.</p>`);
  lines.push(`<p class="tiptap-paragraph">• Increase resistance by approximately 2–5% when all repetitions can be completed comfortably.</p>`);
  lines.push(`<p class="tiptap-paragraph">• Rest 60–90 seconds between most exercises (longer for heavy strength work).</p>`);
  lines.push(`<p class="tiptap-paragraph">• Prioritize sleep, hydration, and recovery.</p>`);
  lines.push(`<p class="tiptap-paragraph">• Complete all ${weeks} weeks before evaluating results.</p>`);

  return lines.join("\n");
}

export function buildDefaultTips(category: string): string {
  return [
    `<p class="tiptap-paragraph"><strong>💡 Tips</strong></p>`,
    `<p class="tiptap-paragraph">• Focus on quality repetitions rather than simply lifting heavier weights.</p>`,
    `<p class="tiptap-paragraph">• Leave approximately 1–2 repetitions in reserve on most working sets.</p>`,
    `<p class="tiptap-paragraph">• Control the lowering phase of every repetition.</p>`,
    `<p class="tiptap-paragraph">• Recovery is where adaptation occurs — respect your recovery days.</p>`,
    `<p class="tiptap-paragraph">• Track your body weight, measurements, and progress photos every two weeks.</p>`,
    `<p class="tiptap-paragraph">• Do not compare week-to-week changes. Evaluate progress over the full program.</p>`,
    `<p class="tiptap-paragraph">• Consistency will produce dramatically better results than occasional high-effort sessions.</p>`,
  ].join("\n");
}