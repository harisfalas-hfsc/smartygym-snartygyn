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
  exercisesPerDay?: string[][][]; // exercisesPerDay[templateIndex0][dayIndex0] => Week A/B session lines
}

function formatSessionLine(line: string): string {
  const text = (line || "").trim();
  if (!text) return "";
  if (text.startsWith("•") || text.startsWith("<")) return text;
  return `• ${text}`;
}

function defaultSessionTemplate(): string[] {
  return [
    "<em>Template session — coach the intent, execution standard, and fatigue target for this day.</em>",
    "<strong>Estimated session time: 55–65 minutes</strong>",
    "<strong>🔥 Soft Tissue Preparation — 3–5 minutes</strong>",
    "• 1–2 min foam roll quads, glutes, lats, t-spine",
    "• 1 min targeted self-massage on tight spots feeding today's main movements",
    "<strong>⚡ Activation / Warm-Up — 6–8 minutes</strong>",
    "• 3 min easy cardio (row, bike, rope skips)",
    "• Dynamic mobility: hip openers, t-spine rotations, scapular CARs × 8/side",
    "• 2 ramp-up sets of the first main lift at 40% and 60% of working load",
    "<strong>🏋 Main Workout — 30–38 minutes</strong>",
    "• Exercise 1 — sets × reps, rest period",
    "• Exercise 2 — sets × reps, rest period",
    "• Exercise 3 — sets × reps, rest period",
    "• Exercise 4 — sets × reps, rest period",
    "• Exercise 5 — sets × reps, rest period",
    "• Exercise 6 — sets × reps, rest period",
    "• Exercise 7 — sets × reps, rest period",
    "<strong>💥 Finisher — 4–8 minutes</strong>",
    "• Conditioning circuit or loaded carry — 2 rounds",
    "<strong>🧘 Cool Down — 5 minutes</strong>",
    "• 3 min easy walk; static stretches for trained areas 30 sec × 2 each",
    "• 6 cycles of 4-sec inhale / 6-sec exhale",
  ];
}

function templateDefinitions(totalWeeks: number): Array<{ key: "A" | "B"; range: string; objective: string }> {
  if (totalWeeks <= 4) {
    return [
      { key: "A", range: "Weeks 1–2", objective: "Foundation template: learn the workouts, establish baseline loads, and repeat the same sessions with controlled progression." },
      { key: "B", range: `Weeks 3–${totalWeeks}`, objective: "Build template: use the second set of workouts and progress through density, load, volume, or complexity rules." },
    ];
  }
  if (totalWeeks <= 6) {
    return [
      { key: "A", range: "Weeks 1–2", objective: "Foundation template: repeat the same workouts for two weeks while technique, pacing, and baseline capacity are built." },
      { key: "B", range: `Weeks 3–${totalWeeks}`, objective: "Progressive template: repeat these workouts for the remaining weeks while the progression rules create the overload." },
    ];
  }
  return [
    { key: "A", range: "Weeks 1–2", objective: "Foundation template: repeat the same workouts, build quality, and set conservative baselines." },
    { key: "B", range: `Weeks 3–${totalWeeks}`, objective: "Build and peak template: repeat these workouts while progressing load, density, volume, or difficulty according to the weekly rules." },
  ];
}

function categoryProgressionRule(category: string): string {
  const cat = category.toUpperCase();
  if (cat.includes("HYPERTROPHY")) return "Progress primarily by load: Week 1 uses about 65% 1RM, Week 2 about 70%, Week 3 about 75%, Week 4 about 80%; later weeks repeat Week B with small load, set, or rep increases without breaking tempo.";
  if (cat.includes("WEIGHT LOSS")) return "Progress primarily by density: increase work periods by about 10%, reduce rest by about 10%, then add one round or choose the harder listed variation while keeping movement quality realistic.";
  if (cat.includes("CARDIO")) return "Progress primarily by aerobic volume and interval quality: extend work intervals, reduce recovery slightly, or add one interval while preserving sustainable pacing.";
  if (cat.includes("FUNCTIONAL STRENGTH")) return "Progress primarily by load and movement quality: add 2–5% load when all reps are clean, then add one set or carry distance before increasing complexity.";
  if (cat.includes("LOW BACK")) return "Progress only through pain-free control: increase range, time under tension, and stability demand before adding load; never chase fatigue or pain.";
  if (cat.includes("MOBILITY")) return "Progress through range, control, hold duration, and balance complexity; never force depth or speed.";
  return "Progress by repeating the same templates and applying small weekly increases in load, volume, density, or movement quality.";
}

function progressionLines(totalWeeks: number, category: string): string[] {
  const cat = category.toUpperCase();
  const hypertrophy = cat.includes("HYPERTROPHY");
  const weightLoss = cat.includes("WEIGHT LOSS");
  const base = [
    "• Week 1 — Perform Week A exactly as written. Learn pacing, technique, and baseline loads.",
    hypertrophy
      ? "• Week 2 — Repeat Week A with load raised toward 70% 1RM where form allows."
      : weightLoss
        ? "• Week 2 — Repeat Week A; increase work periods by 10% or reduce rest by 10%."
        : "• Week 2 — Repeat Week A; add a small load, rep, time, or control increase only where quality stays high.",
    hypertrophy
      ? "• Week 3 — Move to Week B at roughly 75% 1RM on the main lifts."
      : "• Week 3 — Move to Week B. New workouts, same professional session structure.",
    hypertrophy
      ? "• Week 4 — Repeat Week B at roughly 80% 1RM or add one controlled set to the first main movement."
      : weightLoss
        ? "• Week 4 — Repeat Week B; add one round to each main circuit or reduce rest slightly."
        : "• Week 4 — Repeat Week B; progress load, total reps, time under tension, or density.",
  ];
  if (totalWeeks >= 6) {
    base.push(weightLoss
      ? "• Week 5 — Repeat Week B with harder-but-realistic variations or another small density increase."
      : "• Week 5 — Repeat Week B with advanced progression: add one set, add 2–5% load, or increase the hardest safe variation.");
    base.push("• Week 6 — Repeat Week B as peak week: complete the maximum planned volume without technical failure.");
  }
  if (totalWeeks >= 8) {
    base.push("• Week 7 — Repeat Week B with the strongest sustainable progression; reduce volume if recovery drops.");
    base.push("• Week 8 — Repeat Week B as final peak/testing week, then evaluate results after recovery.");
  }
  return base;
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

  out.push(`<p class="tiptap-paragraph"><strong>🎯 Program Goal</strong></p>`);
  out.push(`<p class="tiptap-paragraph">Complete ${weeks} weeks by repeating only the Week A and Week B workout templates. The weekly progression rules create the full program; the app must not list a brand-new workout for every calendar week.</p>`);
  out.push(`<p class="tiptap-paragraph"><strong>🧭 Program Instructions</strong></p>`);
  out.push(`<p class="tiptap-paragraph">${categoryProgressionRule(category)}</p>`);
  out.push(`<p class="tiptap-paragraph"><strong>📈 Program Progression</strong></p>`);
  for (const line of progressionLines(weeks, category)) out.push(`<p class="tiptap-paragraph">${line}</p>`);
  out.push(sep);

  const templates = templateDefinitions(weeks);
  for (let t = 0; t < templates.length; t++) {
    const template = templates[t];
    out.push(`<p class="tiptap-paragraph"><strong>📅 WEEK ${template.key} TEMPLATE</strong> <em>(${template.range})</em></p>`);
    out.push(`<p class="tiptap-paragraph"><strong>🎯 Objective</strong></p>`);
    out.push(`<p class="tiptap-paragraph">${template.objective}</p>`);
    out.push(sep);

    for (let d = 1; d <= trainingDays; d++) {
      const numeral = DAY_NUMERALS[d - 1] || `${d}.`;
      const title = titles[d - 1] || "Training Day";
      out.push(`<p class="tiptap-paragraph"><strong>${numeral} DAY ${d} – ${title}</strong></p>`);

      const dayBullets =
        exercisesPerDay?.[t]?.[d - 1] && exercisesPerDay[t][d - 1].length
          ? exercisesPerDay[t][d - 1]
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

    if (t < templates.length - 1) out.push(`<p class="tiptap-paragraph"></p>`);
  }

  return out.join("\n");
}

/**
 * Build the periodization phase summary for the `program_structure` / "Instructions" block.
 */
export function buildPhaseInstructions(weeks: number, category: string): string {
  const lines: string[] = [];
  lines.push(`<p class="tiptap-paragraph"><strong>📝 Compact Program Instructions</strong></p>`);
  lines.push(`<p class="tiptap-paragraph">This is a professional repeat-and-progress training plan. It contains Week A and Week B templates only; the athlete repeats those workouts and follows the progression rules instead of scrolling through ${weeks * Math.min(daysPerWeekForInstructionsPlaceholder, 6)} separate daily workouts.</p>`);
  lines.push(`<p class="tiptap-paragraph">${categoryProgressionRule(category)}</p>`);
  lines.push(`<p class="tiptap-paragraph"><strong>Weekly Progression Rules</strong></p>`);
  for (const line of progressionLines(weeks, category)) lines.push(`<p class="tiptap-paragraph">${line}</p>`);

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