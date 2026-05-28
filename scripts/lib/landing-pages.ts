/**
 * Keyword-targeted SEO landing pages and topic hubs.
 *
 * Pure-data catalog (no Node-only imports) so both the build-time
 * prerenderer and the runtime React fallback page can share it.
 *
 * Each landing targets a specific commercial-intent keyword cluster.
 * The match() predicate decides which visible workouts / programs /
 * articles should appear in its "browse" list — used by both the
 * prerendered ItemList JSON-LD and the React UI.
 */

export interface LandingPage {
  /** URL slug under /workouts/ or /topics/ — no slash. */
  slug: string;
  /** Primary keyword phrase the page targets. */
  primaryKeyword: string;
  /** <title> string, keyword-first, ≤60 chars target. */
  title: string;
  /** <meta description>, keyword + benefit + brand, ≤160 chars. */
  description: string;
  /** Visible H1 (no brand suffix). */
  h1: string;
  /** 2–3 intro paragraphs, plain text — rendered as <p> blocks. */
  intro: string[];
  /** 3–5 FAQ Q&A — used in FAQPage JSON-LD AND visible on the page. */
  faq: Array<{ q: string; a: string }>;
  /** Predicate over a visible-content row (workout, program or article). */
  match: (row: LandingMatchRow) => boolean;
  /** Optional list of related landing slugs for internal linking. */
  related?: string[];
}

export interface TopicPage extends Omit<LandingPage, "slug"> {
  slug: string;
}

/** Shape every match() predicate works on. */
export interface LandingMatchRow {
  kind: "workout" | "program" | "article";
  name: string;
  category?: string | null;
  format?: string | null;
  equipment?: string | null;
  difficulty?: string | null;
  duration?: string | null;
  description?: string | null;
}

const upper = (s: string | null | undefined) => (s || "").toUpperCase();
const matchAny = (haystack: string, needles: string[]) => {
  const up = haystack.toUpperCase();
  return needles.some((n) => up.includes(n.toUpperCase()));
};

/** Extract minutes integer from things like "15 min", "20 min", "30-min". */
function parseMinutes(duration: string | null | undefined): number | null {
  if (!duration) return null;
  const m = String(duration).match(/(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

/* ──────────────────────────────────────────────────────────────────
 * Workout-format landings  (AMRAP / EMOM / Tabata / For Time / etc.)
 * ────────────────────────────────────────────────────────────────── */
function formatLanding(opts: {
  slug: string;
  primaryKeyword: string;
  title: string;
  description: string;
  h1: string;
  intro: string[];
  faq: Array<{ q: string; a: string }>;
  needles: string[];
  related?: string[];
}): LandingPage {
  return {
    ...opts,
    match: (r) => {
      if (r.kind === "article") return matchAny(r.name + " " + (r.description || ""), opts.needles);
      const text = `${r.name} ${r.format || ""} ${r.description || ""}`;
      return matchAny(text, opts.needles);
    },
  };
}

function goalLanding(opts: {
  slug: string;
  primaryKeyword: string;
  title: string;
  description: string;
  h1: string;
  intro: string[];
  faq: Array<{ q: string; a: string }>;
  workoutCats?: string[];
  programCats?: string[];
  keywords?: string[];
  related?: string[];
}): LandingPage {
  return {
    slug: opts.slug,
    primaryKeyword: opts.primaryKeyword,
    title: opts.title,
    description: opts.description,
    h1: opts.h1,
    intro: opts.intro,
    faq: opts.faq,
    related: opts.related,
    match: (r) => {
      const text = `${r.name} ${r.description || ""}`;
      if (opts.keywords && matchAny(text, opts.keywords)) return true;
      if (r.kind === "workout" && opts.workoutCats?.some((c) => upper(r.category).includes(c))) return true;
      if (r.kind === "program" && opts.programCats?.some((c) => upper(r.category).includes(c))) return true;
      return false;
    },
  };
}

/* ──────────────────────────────────────────────────────────────────
 * The full catalog
 * ────────────────────────────────────────────────────────────────── */

export const LANDING_PAGES: LandingPage[] = [
  // ── FORMATS ───────────────────────────────────────────────────
  formatLanding({
    slug: "amrap",
    primaryKeyword: "AMRAP workout",
    title: "AMRAP Workouts — Real Sessions Built by a Sports Scientist",
    description: "Free AMRAP workouts designed by Sports Scientist Haris Falas. As-many-rounds-as-possible sessions for strength, fat loss and conditioning.",
    h1: "AMRAP Workouts",
    intro: [
      "AMRAP — As Many Rounds As Possible — is one of the most honest tests of conditioning in the gym. You set a clock, pick 2–5 exercises, and grind through as many rounds as your engine allows. No coasting, no padding the rest, no hiding behind a heavy single.",
      "Every AMRAP on SmartyGym is built by Sports Scientist Haris Falas with intentional movement pairings, scaled rep schemes, and a stimulus that matches its time domain. 6-minute AMRAPs hit metabolic conditioning. 20-minute AMRAPs build pure aerobic capacity. Both are real training, not random.",
    ],
    faq: [
      { q: "What does AMRAP mean in a workout?", a: "AMRAP stands for As Many Rounds As Possible. You complete the prescribed exercises in order, then loop back and repeat until the clock hits zero. Your score is total rounds + extra reps." },
      { q: "How long should an AMRAP workout be?", a: "Short AMRAPs (4–8 minutes) target lactic capacity. Medium (10–15 minutes) hit mixed conditioning. Long (20+ minutes) build aerobic base. SmartyGym ships AMRAPs across all three windows so you can pick by goal." },
      { q: "Are AMRAP workouts good for fat loss?", a: "Yes. AMRAPs keep your heart rate elevated for the full window, drive up post-exercise oxygen consumption, and double as muscular endurance work. Pair 2–3 AMRAPs per week with strength training and you have a strong fat-loss stimulus." },
      { q: "Can beginners do AMRAP workouts?", a: "Absolutely — with scaled reps and lighter loads. Start with 6–10 minute AMRAPs using bodyweight movements, focus on quality reps, and add time or load gradually. SmartyGym tags every workout by difficulty." },
    ],
    needles: ["AMRAP", "AS MANY ROUNDS"],
    related: ["emom", "tabata", "for-time", "hiit", "to-burn-fat"],
  }),
  formatLanding({
    slug: "emom",
    primaryKeyword: "EMOM workout",
    title: "EMOM Workouts — Every-Minute-On-the-Minute Sessions",
    description: "Free EMOM workouts by Sports Scientist Haris Falas. Every-minute-on-the-minute training for strength endurance, conditioning and skill work.",
    h1: "EMOM Workouts",
    intro: [
      "EMOM — Every Minute On the Minute — is a clock-controlled format where every minute starts a fixed amount of work. Finish your reps, the rest of the minute is recovery. The clock keeps you honest.",
      "EMOMs are how Haris Falas builds repeatable power, strength endurance, and skill density without crushing your nervous system. The work-to-rest ratio is dialed by the prescription, not your willpower — exactly why they work for adults who can't afford a wrecked recovery day.",
    ],
    faq: [
      { q: "What is an EMOM workout?", a: "EMOM = Every Minute On the Minute. At the top of each minute you perform a prescribed set, then rest for the remainder of that minute. Common formats are 10, 15 or 20 minutes long." },
      { q: "How do you scale EMOM workouts?", a: "Reduce reps per minute or use lighter loads so you finish each round with at least 15–20 seconds of rest. If you can't recover by the next bell, the dose is too high." },
      { q: "What's the difference between EMOM and AMRAP?", a: "EMOM controls your pace (clock-driven rest). AMRAP removes that control and asks for max output within a window. EMOM builds repeatability; AMRAP tests it." },
    ],
    needles: ["EMOM", "EVERY MINUTE"],
    related: ["amrap", "tabata", "for-time", "to-get-stronger"],
  }),
  formatLanding({
    slug: "tabata",
    primaryKeyword: "Tabata workout",
    title: "Tabata Workouts — 4-Minute Conditioning Sessions",
    description: "Free Tabata workouts by Sports Scientist Haris Falas. 20-on/10-off intervals for maximum conditioning in the smallest possible time window.",
    h1: "Tabata Workouts",
    intro: [
      "Tabata is the original 20-on/10-off interval — 8 rounds, 4 minutes total. Dr Izumi Tabata showed it can raise both anaerobic and aerobic capacity faster than steady-state cardio, but only at true near-max output. Half-effort Tabata is a warm-up, not a workout.",
      "Every SmartyGym Tabata uses bodyweight or single-implement movements you can sustain at hard effort without form collapse. No machines, no skill lifts at high speed — exactly the equipment constraint that keeps the format effective.",
    ],
    faq: [
      { q: "How long is a Tabata workout?", a: "One Tabata round is exactly 4 minutes (20 seconds work, 10 seconds rest, 8 rounds). A full Tabata session usually stacks 2–6 rounds with longer rest between blocks, totaling 15–30 minutes." },
      { q: "Does Tabata actually work for fat loss?", a: "Yes — when performed at true high intensity. Tabata drives EPOC (post-workout calorie burn) and improves VO₂ max, both of which support body composition when paired with strength training and a calorie-controlled diet." },
      { q: "What exercises work best for Tabata?", a: "Simple, sustainable movements: squats, push-ups, mountain climbers, kettlebell swings, burpees, jump rope. Avoid complex barbell lifts at Tabata speed — fatigue + load + speed is how people get hurt." },
    ],
    needles: ["TABATA"],
    related: ["amrap", "emom", "hiit", "for-weight-loss"],
  }),
  formatLanding({
    slug: "for-time",
    primaryKeyword: "for time workout",
    title: "For Time Workouts — Race the Clock Conditioning",
    description: "Free For-Time workouts by Sports Scientist Haris Falas. Set rep schemes, race the clock, log your time — pure measurable conditioning.",
    h1: "For Time Workouts",
    intro: [
      "For Time workouts give you a fixed amount of work and ask one question: how fast can you finish it cleanly? They are the cleanest test of conditioning we have, because the rep total is constant — only your output changes.",
      "Every For Time workout on SmartyGym is built around honest, scalable movements. The prescribed reps assume good technique, not survival reps. Log your time, repeat the workout in 4–6 weeks, and you have one of the simplest measurable progress signals in fitness.",
    ],
    faq: [
      { q: "What does 'for time' mean in a workout?", a: "It means the rep scheme is fixed (e.g. 21-15-9 thrusters and pull-ups) and you complete the entire list as fast as possible. Your score is the total time on the clock." },
      { q: "How often should I repeat the same For Time workout?", a: "Repeating a benchmark every 4–8 weeks is plenty to see progress. Track the time, sleep, fuel and warm-up — a faster time only counts if conditions were comparable." },
      { q: "Is For Time good for beginners?", a: "Yes, with scaled reps and lighter loads. Pick a version you can finish in 6–15 minutes with good form. Anything that turns into a 30-minute survival session is too heavy or too long." },
    ],
    needles: ["FOR TIME", "FT)", "FT "],
    related: ["amrap", "emom", "circuit", "hiit"],
  }),
  formatLanding({
    slug: "circuit",
    primaryKeyword: "circuit training workout",
    title: "Circuit Training Workouts at Home and the Gym",
    description: "Free circuit training workouts by Sports Scientist Haris Falas. Full-body strength + conditioning circuits scaled for every level.",
    h1: "Circuit Training Workouts",
    intro: [
      "Circuit training stitches 4–8 exercises into a continuous loop with short rest between movements. It's how military, team-sport and general-population coaches have built engine and strength in the same hour for decades — because it works.",
      "Smarty circuits rotate stimulus on purpose: a push, a pull, a lower-body, a core, sometimes a cardio piece. That sequencing lets one muscle group recover while another works, so you can keep the heart rate up without form collapse.",
    ],
    faq: [
      { q: "What is a circuit workout?", a: "A series of exercises performed back-to-back with minimal rest, then repeated for 2–5 rounds. Each station targets a different movement pattern so the working muscles get partial recovery while the heart rate stays elevated." },
      { q: "Is circuit training better than cardio for fat loss?", a: "For most adults, yes — circuit training preserves muscle, raises strength, and burns comparable calories to steady-state cardio per session, plus a meaningful EPOC. Pair with 1–2 dedicated cardio days for a complete plan." },
      { q: "How long should a circuit workout be?", a: "Most effective circuits land between 25–45 minutes total work, including warm-up and cool-down. Anything longer usually slips into junk volume." },
    ],
    needles: ["CIRCUIT"],
    related: ["amrap", "hiit", "to-burn-fat", "supersets"],
  }),
  formatLanding({
    slug: "hiit",
    primaryKeyword: "HIIT workout",
    title: "HIIT Workouts — High-Intensity Interval Training",
    description: "Free HIIT workouts by Sports Scientist Haris Falas. True high-intensity interval training — work-to-rest ratios that actually deliver.",
    h1: "HIIT Workouts",
    intro: [
      "HIIT — High-Intensity Interval Training — is short bursts of near-maximum effort separated by purposeful rest. Done correctly, 20 minutes of HIIT delivers comparable VO₂ improvements to 45 minutes of moderate cardio.",
      "The catch: most 'HIIT' online is moderate-intensity continuous training in a HIIT costume. Smarty HIIT uses real 1:1 to 1:3 work-rest ratios and clear effort prescriptions — RPE 8–9, not jogging in place.",
    ],
    faq: [
      { q: "What counts as a real HIIT workout?", a: "Sets of 10–60 seconds at near-maximal effort (RPE 8–9), with rest periods 1×–3× the work duration. If you can hold a conversation during the work interval, it isn't HIIT." },
      { q: "How often should I do HIIT per week?", a: "2–3 sessions per week is the sweet spot for most adults. More than that interferes with recovery and strength progress without delivering extra benefit." },
      { q: "Is HIIT safe over 40?", a: "Yes — once you have a baseline of conditioning and no contraindicated conditions. Start with lower-impact modalities (rowing, bike, kettlebell swings), longer rest intervals, and shorter sessions. Always clear new exercise with your doctor." },
    ],
    needles: ["HIIT", "HIGH INTENSITY", "HIGH-INTENSITY"],
    related: ["tabata", "amrap", "circuit", "to-burn-fat"],
  }),
  formatLanding({
    slug: "supersets",
    primaryKeyword: "superset workout",
    title: "Superset Workouts — Pair Lifts, Save Time, Build Muscle",
    description: "Free superset workouts by Sports Scientist Haris Falas. Antagonist and same-muscle supersets that double your work density without sacrificing form.",
    h1: "Superset Workouts",
    intro: [
      "A superset pairs two exercises performed back-to-back with little or no rest between them. Antagonist pairs (push/pull) let you keep training while one side recovers. Same-muscle pairs amplify time-under-tension for hypertrophy.",
      "Every SmartyGym superset specifies which type, why, and what rest interval to take between paired sets — because random supersets usually just trash your form.",
    ],
    faq: [
      { q: "What is a superset in weight training?", a: "Two exercises performed back-to-back with no rest in between, counting as one set. Common pairings are antagonist (bench + row), same-muscle (curl + hammer curl), or compound + isolation (squat + leg extension)." },
      { q: "Are supersets better than straight sets?", a: "For time efficiency and hypertrophy, often yes. For maximal strength on a single lift, no — straight sets with full rest still win. SmartyGym uses supersets in accessory work and conditioning blocks, not on the main strength lift." },
      { q: "How long should I rest between supersets?", a: "60–120 seconds after the paired set, depending on intent. Shorter for endurance/density. Longer for hypertrophy when both lifts are demanding." },
    ],
    needles: ["SUPERSET", "SUPER SET", "SUPER-SET"],
    related: ["to-get-stronger", "for-muscle-gain", "dumbbell-only"],
  }),

  // ── GOALS ─────────────────────────────────────────────────────
  goalLanding({
    slug: "for-weight-loss",
    primaryKeyword: "workouts for weight loss",
    title: "Workouts for Weight Loss — Real Plans, No Magic",
    description: "Workouts for weight loss by Sports Scientist Haris Falas. Combine strength + metabolic conditioning the way coaches actually program for fat loss.",
    h1: "Workouts for Weight Loss",
    intro: [
      "Weight loss happens at the kitchen table. Workouts decide what shape you arrive in. Lose 10 kg without training and you'll look smaller and weaker. Lose 10 kg with structured strength and conditioning and you'll look — and move — like a different person.",
      "Haris Falas built this collection around the only sequence that consistently works for adults: keep the muscle, raise the calorie ceiling, train hard enough to drive adaptation without wrecking recovery. Pair it with a sustainable calorie deficit and the math takes care of itself.",
    ],
    faq: [
      { q: "What workouts burn the most fat?", a: "There is no 'fat-burning' workout — there are workouts that drive enough total energy expenditure and preserve enough muscle that the calorie deficit translates into fat loss. Strength training + 2–3 metabolic sessions per week is the highest-leverage combination." },
      { q: "How many workouts per week to lose weight?", a: "3–5 sessions per week is the realistic range. Two strength + two conditioning + one optional active recovery covers all the bases. More than 5 hard sessions usually backfires through fatigue and increased hunger." },
      { q: "Can I lose weight with bodyweight workouts only?", a: "Yes — if intensity and progression are right. Bodyweight training works for fat loss; it just stops working for strength once you outgrow the load. SmartyGym ships both." },
    ],
    workoutCats: ["CALORIE BURNING", "METABOLIC", "CARDIO"],
    programCats: ["WEIGHT LOSS"],
    keywords: ["WEIGHT LOSS", "FAT LOSS", "FAT BURN", "LEAN"],
    related: ["to-burn-fat", "hiit", "circuit", "for-busy-professionals"],
  }),
  goalLanding({
    slug: "to-burn-fat",
    primaryKeyword: "workouts to burn fat",
    title: "Workouts to Burn Fat — High-Output Conditioning",
    description: "High-output workouts to burn fat by Sports Scientist Haris Falas. Real metabolic conditioning, not jumping jacks in place.",
    h1: "Workouts to Burn Fat",
    intro: [
      "Fat-burning workouts work for one reason: they raise your total daily energy expenditure enough that your nutrition deficit actually shows on the scale. Anything sold as 'targeted fat loss' is marketing — spot reduction is a myth.",
      "Smarty fat-burning workouts stack big compound movements, short rest intervals, and full-body recruitment patterns. High output, measurable, repeatable, and brutally honest about what your nutrition needs to look like to make it count.",
    ],
    faq: [
      { q: "Does sweating mean you're burning more fat?", a: "No. Sweat is thermoregulation, not calories. A 45-minute strength session can burn more fat than 90 minutes of low-effort cardio that left you drenched." },
      { q: "Is fasted cardio better for fat loss?", a: "Not meaningfully. Studies show total calorie balance over 24 hours matters far more than meal timing. Train fasted if you prefer it; don't expect it to be a shortcut." },
      { q: "How long until fat-burning workouts show results?", a: "Visible changes typically take 6–12 weeks of consistent training plus a sensible deficit. Anything advertising faster results is either dehydration or a lie." },
    ],
    workoutCats: ["CALORIE BURNING", "METABOLIC"],
    keywords: ["FAT BURN", "FAT LOSS", "BURN CALORIES"],
    related: ["for-weight-loss", "hiit", "tabata"],
  }),
  goalLanding({
    slug: "to-get-stronger",
    primaryKeyword: "workouts to get stronger",
    title: "Workouts to Get Stronger — Real Strength Training",
    description: "Workouts to get stronger by Sports Scientist Haris Falas. Compound lifts, progressive overload, and the rep schemes that actually build force.",
    h1: "Workouts to Get Stronger",
    intro: [
      "Getting stronger is the most leveraged thing you can do for your body — for fat loss, posture, healthy aging, bone density, joint integrity, and the basic dignity of carrying your own groceries when you're 75.",
      "Smarty strength workouts use the rep schemes the research keeps confirming: 3–6 sets, 3–8 reps, near-maximal loads, full recovery between sets. No magic ranges. Just the volume, intensity and progression that turn into measurable strength over months.",
    ],
    faq: [
      { q: "How long does it take to get noticeably stronger?", a: "Beginners see strength gains in 4–6 weeks, mostly neural. Hypertrophy-driven strength shows up around 8–12 weeks of consistent training. Year-on-year progress requires structured periodization." },
      { q: "How many days a week should I lift to get stronger?", a: "3–4 strength sessions per week is the sweet spot for most adults. Two sessions can maintain or build slowly; five+ requires recovery infrastructure most non-athletes don't have." },
      { q: "Can I get stronger with dumbbells only?", a: "Yes — up to a meaningful ceiling. Most adults are nowhere near that ceiling. SmartyGym has dumbbell-only workouts that work for years before equipment becomes a limiter." },
    ],
    workoutCats: ["STRENGTH"],
    programCats: ["FUNCTIONAL STRENGTH", "MUSCLE HYPERTROPHY"],
    keywords: ["STRENGTH", "STRONGER", "POWER"],
    related: ["for-muscle-gain", "dumbbell-only", "kettlebell", "supersets"],
  }),
  goalLanding({
    slug: "for-muscle-gain",
    primaryKeyword: "workouts for muscle gain",
    title: "Workouts for Muscle Gain — Hypertrophy Done Right",
    description: "Hypertrophy workouts by Sports Scientist Haris Falas. Volume, tempo and progression that turn into actual muscle — not just a pump.",
    h1: "Workouts for Muscle Gain",
    intro: [
      "Muscle gain is the most neglected goal in adult fitness. Most people 'lose weight' when what they actually want is to build muscle, look strong, and not feel fragile. The training stimulus is different — and it matters.",
      "Smarty hypertrophy work hits the volume bands the research keeps confirming: 10–20 hard sets per muscle group per week, with controlled tempo, full ROM, and progressive overload tracked across blocks.",
    ],
    faq: [
      { q: "How much muscle can you gain per month?", a: "Beginner adults can gain 0.5–1 kg of muscle per month with optimal training, nutrition and sleep. Intermediates closer to 0.25 kg/month. Anyone promising 5 kg/month is selling something." },
      { q: "Do I need protein supplements to build muscle?", a: "No. You need adequate total protein — about 1.6–2.2 g per kg of bodyweight per day. Supplements are a convenience, not a requirement. Real food works fine." },
      { q: "Is full-body or split better for muscle gain?", a: "Both work. Full-body 3×/week and upper/lower 4×/week are the two most reliable structures for adults. SmartyGym ships both." },
    ],
    workoutCats: ["STRENGTH"],
    programCats: ["MUSCLE HYPERTROPHY"],
    keywords: ["HYPERTROPHY", "MUSCLE", "BUILD MUSCLE", "MASS"],
    related: ["to-get-stronger", "supersets", "dumbbell-only"],
  }),
  goalLanding({
    slug: "for-endurance",
    primaryKeyword: "workouts for endurance",
    title: "Workouts for Endurance — Build Your Aerobic Engine",
    description: "Endurance workouts by Sports Scientist Haris Falas. Aerobic base + threshold + VO₂ work programmed the way endurance coaches actually do it.",
    h1: "Workouts for Endurance",
    intro: [
      "Endurance is a three-layer stack: aerobic base (zone 2), lactate threshold (zone 3–4), and VO₂ work (zone 5). Skip the base and the higher zones don't build. Skip the top zones and you cap your ceiling.",
      "Smarty endurance workouts and the Cardio Endurance Program respect that hierarchy — long, easy efforts to build the engine, threshold pieces to expand the floor, and short hard intervals to raise the roof.",
    ],
    faq: [
      { q: "How long does it take to build endurance?", a: "Aerobic adaptations show up in 4–6 weeks of consistent base work. Meaningful changes to threshold and VO₂ take 8–16 weeks. Twelve weeks is a realistic block." },
      { q: "Can you build endurance and strength at the same time?", a: "Yes — with intentional programming. The conflict ('concurrent training') only shows up when both are pushed near maximum simultaneously. Most adults are nowhere near that interference point." },
      { q: "How often should I do cardio?", a: "3–5 sessions per week for general fitness. Most of those should be easy aerobic work, with 1–2 harder sessions for threshold and VO₂." },
    ],
    workoutCats: ["CARDIO"],
    programCats: ["CARDIO ENDURANCE"],
    keywords: ["ENDURANCE", "AEROBIC", "ZONE 2", "VO2"],
    related: ["for-weight-loss", "hiit", "15-minute"],
  }),
  goalLanding({
    slug: "for-mobility",
    primaryKeyword: "mobility workout",
    title: "Mobility Workouts — Joint Health, Range and Control",
    description: "Mobility workouts by Sports Scientist Haris Falas. CARs, end-range strength and dynamic flows that actually fix stiff hips, shoulders and ankles.",
    h1: "Mobility Workouts",
    intro: [
      "Mobility is not flexibility. Flexibility is passive range. Mobility is the range you can produce force in. Without strength at end range, your 'mobility' is just a stretch you can't use.",
      "Smarty mobility uses CARs (controlled articular rotations), end-range isometrics, and loaded stretching to build usable range. The kind that survives a long-haul flight, a heavy deadlift, or a 50-year-old hip.",
    ],
    faq: [
      { q: "How often should I do mobility work?", a: "Daily for short sessions (5–10 minutes), or 2–3 dedicated 20–30 minute sessions per week. Mobility responds to frequency more than to volume per session." },
      { q: "Is stretching the same as mobility?", a: "No. Static stretching changes tolerance to stretch. Mobility builds active control of joint range. Both are useful; only one transfers to performance and longevity." },
      { q: "Can mobility work fix low back pain?", a: "Mobility plus strength frequently helps non-specific low back pain. SmartyGym has a dedicated low back program — pair it with the mobility library for the strongest signal." },
    ],
    workoutCats: ["MOBILITY", "MOBILITY & STABILITY"],
    programCats: ["MOBILITY", "MOBILITY & STABILITY"],
    keywords: ["MOBILITY", "FLEXIBILITY", "RANGE OF MOTION", "CARS"],
    related: ["for-low-back-pain", "for-women-over-40", "for-men-over-40"],
  }),
  goalLanding({
    slug: "for-low-back-pain",
    primaryKeyword: "workouts for low back pain",
    title: "Workouts for Low Back Pain — Strengthen, Don't Stretch",
    description: "Low back pain workouts by Sports Scientist Haris Falas. Evidence-based strength + mobility protocols that actually help non-specific lumbar pain.",
    h1: "Workouts for Low Back Pain",
    intro: [
      "Most non-specific low back pain responds to one thing: building strength and motor control around the lumbar spine, hips and core. Stretching alone rarely fixes it. Lying in bed makes it worse.",
      "Smarty's low back protocol follows the McGill big-three foundation (curl-up, side bridge, bird-dog), adds hip-hinge progressions and posterior chain strength, and times mobility work around the strength piece — not in place of it. Always clear back pain with a clinician first.",
    ],
    faq: [
      { q: "Should I exercise with low back pain?", a: "In most non-specific cases, yes — gentle movement and graded loading recover the back faster than rest. Sharp or referred pain (numbness, leg symptoms) requires clinical evaluation first." },
      { q: "Are sit-ups bad for the lower back?", a: "Traditional sit-ups load the discs in repeated flexion under load — high-risk for many adults. The McGill curl-up trains anterior core without that flexion load and is the better default." },
      { q: "How long until back pain workouts help?", a: "Most people feel a difference in 2–4 weeks of consistent work. Structural improvement (strength + endurance) takes 8–12 weeks." },
    ],
    programCats: ["LOW BACK PAIN"],
    workoutCats: ["MOBILITY", "MOBILITY & STABILITY", "RECOVERY"],
    keywords: ["LOW BACK", "LOWER BACK", "LUMBAR", "BACK PAIN"],
    related: ["for-mobility", "for-men-over-40", "for-women-over-40"],
  }),

  // ── AUDIENCE ─────────────────────────────────────────────────
  goalLanding({
    slug: "for-men-over-40",
    primaryKeyword: "workouts for men over 40",
    title: "Workouts for Men Over 40 — Strength, Mobility, Longevity",
    description: "Workouts for men over 40 by Sports Scientist Haris Falas. Strength + mobility + recovery programmed for adults who refuse to slow down.",
    h1: "Workouts for Men Over 40",
    intro: [
      "After 40 the math changes. Recovery is slower. Joints have a memory. Pretending you're 25 in the gym is how you end up sidelined for a quarter. Smart training over 40 is not less training — it's more intentional training.",
      "This collection prioritizes strength (the single biggest aging mitigator), mobility (so the strength stays usable), recovery (so the work compounds), and intelligent conditioning (so the heart and metabolism keep up).",
    ],
    faq: [
      { q: "How should men over 40 train differently?", a: "Bias the work toward strength, mobility and aerobic base. Reduce maximal joint impact. Extend warm-ups. Plan one extra recovery day per week vs your 25-year-old self. Sleep matters more, not less." },
      { q: "How often should men over 40 lift weights?", a: "3–4 strength sessions per week is the sweet spot. Two sessions maintains; five+ requires recovery infrastructure most non-athletes can't sustain." },
      { q: "Can men over 40 still build muscle?", a: "Yes. Anabolic response is slightly slower but absolutely present into the 60s and beyond. Adequate protein (1.6–2.2 g/kg/day), progressive overload, and sleep are the inputs that matter." },
    ],
    workoutCats: ["STRENGTH", "MOBILITY", "MOBILITY & STABILITY", "RECOVERY"],
    programCats: ["FUNCTIONAL STRENGTH", "MOBILITY", "MOBILITY & STABILITY"],
    keywords: ["OVER 40", "OVER 50", "MEN OVER", "AGING"],
    related: ["for-mobility", "to-get-stronger", "for-low-back-pain"],
  }),
  goalLanding({
    slug: "for-women-over-40",
    primaryKeyword: "workouts for women over 40",
    title: "Workouts for Women Over 40 — Strength, Bone Density, Mobility",
    description: "Workouts for women over 40 by Sports Scientist Haris Falas. Bone density, lean mass and mobility — the three things that decide how you age.",
    h1: "Workouts for Women Over 40",
    intro: [
      "Three numbers shape how women age past 40: lean mass, bone density, and joint mobility. Strength training is the only intervention that defends all three at once. Cardio alone won't.",
      "Smarty programming for women 40+ prioritizes loaded compound lifts (for bone density and lean mass), mobility flows (for joint integrity), and conditioning sessions that complement rather than compete with the strength work.",
    ],
    faq: [
      { q: "Should women over 40 lift heavy?", a: "Yes — assuming form and clearance are in place. Lifting near 75–90% of your capacity is what drives the muscle and bone density adaptations that matter for healthy aging. Light weights for hundreds of reps does not." },
      { q: "Does strength training help with menopause symptoms?", a: "Evidence supports strength training for vasomotor symptoms, mood, body composition and bone density during peri- and post-menopause. It does not replace medical care, but it is consistently helpful." },
      { q: "How can I avoid losing muscle after 40?", a: "Lift 2–4 times per week with progressive overload, eat 1.6–2.2 g of protein per kg of bodyweight per day, sleep 7–9 hours, and keep stress in a manageable range. That stack works." },
    ],
    workoutCats: ["STRENGTH", "MOBILITY", "MOBILITY & STABILITY", "RECOVERY"],
    programCats: ["FUNCTIONAL STRENGTH", "MOBILITY", "MOBILITY & STABILITY"],
    keywords: ["OVER 40", "OVER 50", "WOMEN OVER", "MENOPAUSE", "POSTMENOPAUSE"],
    related: ["for-mobility", "to-get-stronger", "for-low-back-pain"],
  }),
  goalLanding({
    slug: "for-beginners",
    primaryKeyword: "workouts for beginners",
    title: "Workouts for Beginners — Start Without Getting Hurt",
    description: "Workouts for beginners by Sports Scientist Haris Falas. Foundational strength + conditioning sessions designed to build a real base.",
    h1: "Workouts for Beginners",
    intro: [
      "The biggest mistake beginners make is starting with the workouts they see on Instagram. Random hard sessions build random results — usually injury and dropout.",
      "Smarty beginner workouts focus on the basics: hip hinge, squat, push, pull, carry. Built so you can repeat them, track them, and progress from them for 12–24 months before needing anything more advanced.",
    ],
    faq: [
      { q: "How many days a week should a beginner work out?", a: "3 sessions per week is the right starting dose. It builds the habit without overwhelming recovery, and leaves room for active recovery days. Move to 4 sessions after 2–3 months." },
      { q: "Should beginners do cardio or strength first?", a: "Both — but strength gives a beginner more leverage. Strength training preserves muscle, raises the calorie ceiling, and improves cardio capacity at the same time when programmed correctly." },
      { q: "How long until beginners see results?", a: "Strength and conditioning measurably improve in 4–6 weeks. Visible body composition changes typically take 8–12 weeks with consistent training and nutrition." },
    ],
    workoutCats: [],
    keywords: ["BEGINNER", "STARTER", "INTRODUCTION"],
    related: ["for-busy-professionals", "15-minute", "no-equipment"],
  }),
  goalLanding({
    slug: "for-busy-professionals",
    primaryKeyword: "workouts for busy professionals",
    title: "Workouts for Busy Professionals — Real Results in 30 Minutes",
    description: "Workouts for busy professionals by Sports Scientist Haris Falas. 30-minute sessions that deliver strength, conditioning and recovery without overtime.",
    h1: "Workouts for Busy Professionals",
    intro: [
      "If your week has 4 unpredictable hours for training, you need workouts that use every minute. Smarty 'busy professional' sessions are 20–35 minutes door-to-door, programmed for density, and built so missing a session doesn't unravel the week.",
      "The format favors compound movements, supersets, and AMRAP/EMOM density — the formats that deliver the highest training stimulus per minute of work.",
    ],
    faq: [
      { q: "Can you get fit in 30 minutes a day?", a: "Yes — 4–5 dense 30-minute sessions per week is enough for most adults to build measurable strength, conditioning and body composition over 12 weeks. Quality and consistency beat duration." },
      { q: "What's the most efficient workout format?", a: "Full-body strength + short metabolic finisher. Compound lifts cover the most muscle in the least time; the finisher closes out the cardio bucket." },
      { q: "Should I train every day if I'm busy?", a: "No. 4 quality sessions per week beats 7 mediocre ones for almost everyone. Recovery is when adaptation happens — schedule it." },
    ],
    workoutCats: ["STRENGTH", "METABOLIC", "CALORIE BURNING"],
    keywords: ["BUSY", "OFFICE", "PROFESSIONAL"],
    related: ["15-minute", "20-minute", "30-minute", "no-equipment"],
  }),
  goalLanding({
    slug: "for-travelers",
    primaryKeyword: "hotel room workout",
    title: "Hotel Room Workouts — Train Anywhere, No Equipment",
    description: "Hotel room and travel workouts by Sports Scientist Haris Falas. 15–30 minute bodyweight sessions you can do in any room.",
    h1: "Workouts for Travelers",
    intro: [
      "Travel is where most fitness routines die. A week away, then two, and the habit is gone. Smarty travel workouts are 15–30 minute bodyweight-only sessions that need a 2-meter square of floor and a wall.",
      "These are the same workouts Haris uses on the road — programmed, scaled by difficulty, and integrated with the Daily Smarty Ritual so the habit survives jet lag and hotel coffee.",
    ],
    faq: [
      { q: "Can you really stay fit while traveling?", a: "Yes — for trips up to a few weeks, 3–4 bodyweight sessions per week and basic mobility work maintain almost all your fitness. The trade-off is that maximal strength on barbell lifts will dip slightly." },
      { q: "What's the best workout for a hotel room?", a: "A 20–30 minute full-body circuit: squat variation, push-up variation, hinge or single-leg variation, core variation, and a short conditioning piece. Repeat 3–5 rounds." },
      { q: "Do you need equipment to train while traveling?", a: "No. Bodyweight + a doorway + a wall covers almost every movement pattern. A travel band is a nice addition but not required." },
    ],
    workoutCats: ["MICRO-WORKOUTS"],
    keywords: ["TRAVEL", "HOTEL", "ON THE ROAD"],
    related: ["no-equipment", "bodyweight", "15-minute"],
  }),

  // ── DURATION / EQUIPMENT ──────────────────────────────────────
  {
    slug: "15-minute",
    primaryKeyword: "15 minute workout",
    title: "15 Minute Workouts — Real Sessions, Real Stimulus",
    description: "15 minute workouts by Sports Scientist Haris Falas. Dense full-body sessions when 15 minutes is all you have — and you want it to count.",
    h1: "15 Minute Workouts",
    intro: [
      "Fifteen minutes is more than enough for a meaningful training stimulus if the design is right. Smarty 15-minute workouts use circuits, AMRAPs and supersets to maximize density without sacrificing form.",
      "These are the workouts that keep a streak alive on the worst day of the week — and they still build measurable conditioning and strength endurance over months.",
    ],
    faq: [
      { q: "Are 15 minute workouts enough to see results?", a: "Yes, when programmed for density and done consistently. Daily 15-minute sessions deliver more progress than weekly hour-long ones that get skipped half the time." },
      { q: "What can you do in a 15 minute workout?", a: "A short warm-up + 10–12 minutes of dense work + 1–2 minutes of cool-down. Full-body circuit, EMOM, or AMRAP formats fit the window perfectly." },
      { q: "Are 15 minute workouts good for weight loss?", a: "Yes — when stacked 4–5 days per week and paired with sensible nutrition. The total weekly volume is what matters." },
    ],
    match: (r) => parseMinutes(r.duration) !== null && parseMinutes(r.duration)! <= 15,
    related: ["for-busy-professionals", "for-travelers", "no-equipment", "20-minute"],
  },
  {
    slug: "20-minute",
    primaryKeyword: "20 minute workout",
    title: "20 Minute Workouts — Dense, Effective, Repeatable",
    description: "20 minute workouts by Sports Scientist Haris Falas. Strength, metabolic and HIIT sessions designed to fit a busy schedule without dilution.",
    h1: "20 Minute Workouts",
    intro: [
      "Twenty minutes is the sweet spot for most adults: long enough for a real warm-up + 12–15 minutes of work + a cool-down, short enough to fit every day. Smarty 20-minute workouts respect that math.",
      "Expect dense circuits, EMOMs, and strength sessions that hit a full-body stimulus without bloated rest periods.",
    ],
    faq: [
      { q: "Is 20 minutes of exercise per day enough?", a: "Yes — for general fitness, body composition and health markers. Programs requiring 60+ minutes per day are usually selling something." },
      { q: "What's the best 20 minute workout?", a: "Full-body strength session 3 days, metabolic conditioning 2 days. Mobility on remaining days. That weekly stack covers almost every adult goal." },
      { q: "Can 20 minute workouts build muscle?", a: "Yes, when programmed for volume and progressive overload across the week. Five 20-minute strength sessions can deliver the weekly volume needed for hypertrophy." },
    ],
    match: (r) => {
      const m = parseMinutes(r.duration);
      return m !== null && m > 15 && m <= 22;
    },
    related: ["15-minute", "30-minute", "for-busy-professionals"],
  },
  {
    slug: "30-minute",
    primaryKeyword: "30 minute workout",
    title: "30 Minute Workouts — Strength + Conditioning Built for Adults",
    description: "30 minute workouts by Sports Scientist Haris Falas. Strength, metabolic and recovery sessions sized for a real adult schedule.",
    h1: "30 Minute Workouts",
    intro: [
      "Thirty minutes is the most popular workout length for a reason: it's long enough to cover warm-up, main work and cool-down without compromise, and short enough to repeat 4–5 times per week.",
      "Every Smarty 30-minute workout is built around a clear stimulus — strength, conditioning or recovery — with no junk volume to pad the clock.",
    ],
    faq: [
      { q: "Are 30 minute workouts effective?", a: "Yes. 30 minutes is the most validated workout length in the research literature for both fitness and body composition outcomes." },
      { q: "How many 30 minute workouts per week?", a: "3–5 sessions per week is the realistic sweet spot. Two strength + two conditioning + one mobility covers the bases." },
      { q: "Can I lose belly fat with 30 minute workouts?", a: "Yes — when paired with a calorie deficit and consistent training over 8–12 weeks. Spot reduction is a myth; total body fat goes down evenly." },
    ],
    match: (r) => {
      const m = parseMinutes(r.duration);
      return m !== null && m > 22 && m <= 35;
    },
    related: ["20-minute", "for-busy-professionals", "for-weight-loss"],
  },
  {
    slug: "no-equipment",
    primaryKeyword: "no equipment workout",
    title: "No Equipment Workouts — Bodyweight Sessions, Built Properly",
    description: "No-equipment workouts by Sports Scientist Haris Falas. Bodyweight strength + conditioning sessions you can do anywhere.",
    h1: "No Equipment Workouts",
    intro: [
      "Bodyweight workouts work — when they're programmed with intent. Most 'no equipment' content online is random calisthenics. Smarty bodyweight sessions follow the same strength + conditioning logic as the equipped versions.",
      "Use them at home, in a hotel, in a park. They're the backbone of the Smarty 'Backup Plan' positioning — fitness that survives travel, missed gym days, and unpredictable weeks.",
    ],
    faq: [
      { q: "Can you build muscle with no equipment?", a: "Yes — to a meaningful ceiling. Bodyweight progressions (single-leg, tempo, lever variations) drive hypertrophy for years. Beyond a certain strength level, added load becomes the easier path." },
      { q: "Are bodyweight workouts as good as gym workouts?", a: "For general fitness, fat loss and conditioning — essentially equivalent. For maximal strength on barbell lifts, no. SmartyGym ships both." },
      { q: "How often should I do bodyweight workouts?", a: "4–6 sessions per week is sustainable because of the lower joint load. Mix strength-biased and conditioning-biased sessions across the week." },
    ],
    match: (r) => matchAny(`${r.equipment || ""} ${r.name}`, ["BODYWEIGHT", "NO EQUIPMENT", "BODY-WEIGHT"]),
    related: ["bodyweight", "for-travelers", "for-busy-professionals", "15-minute"],
  },
  {
    slug: "bodyweight",
    primaryKeyword: "bodyweight workout",
    title: "Bodyweight Workouts — Strength and Conditioning Without Gear",
    description: "Bodyweight workouts by Sports Scientist Haris Falas. Calisthenics + conditioning + mobility — programmed like every other Smarty workout.",
    h1: "Bodyweight Workouts",
    intro: [
      "Bodyweight training is the most portable form of strength and conditioning ever invented. Smarty bodyweight workouts cover squat, hinge, push, pull and core patterns — with real progressions, not random push-up variations.",
    ],
    faq: [
      { q: "Can bodyweight workouts replace the gym?", a: "For most adult goals — yes. The exceptions are maximal strength and serious hypertrophy beyond a certain ceiling." },
      { q: "What's a good bodyweight workout schedule?", a: "Full-body bodyweight strength 3 days + conditioning 2 days + mobility 1 day. Repeat." },
    ],
    match: (r) => matchAny(`${r.equipment || ""}`, ["BODYWEIGHT", "BODY-WEIGHT"]),
    related: ["no-equipment", "for-travelers", "for-beginners"],
  },
  {
    slug: "dumbbell-only",
    primaryKeyword: "dumbbell only workout",
    title: "Dumbbell-Only Workouts — Full Strength with One Pair",
    description: "Dumbbell-only workouts by Sports Scientist Haris Falas. Full-body strength + conditioning sessions that only need a pair of dumbbells.",
    h1: "Dumbbell-Only Workouts",
    intro: [
      "A pair of dumbbells covers more strength territory than most people realize. Smarty dumbbell-only workouts hit squat, hinge, press, row and carry patterns — for years of progress before the dumbbell becomes a limiter.",
    ],
    faq: [
      { q: "Can you build muscle with dumbbells only?", a: "Yes — to a high ceiling. Most adults will progress for 12–24+ months on dumbbells alone with smart programming and progressive overload." },
      { q: "What weight dumbbells should I buy?", a: "Adjustable dumbbells covering 5–25 kg per hand cover almost every home-training scenario for adults. Fixed sets are cheaper but less flexible." },
    ],
    match: (r) => matchAny(`${r.equipment || ""}`, ["DUMBBELL", "DUMBBELLS", "DB"]),
    related: ["to-get-stronger", "for-muscle-gain", "supersets"],
  },
  {
    slug: "kettlebell",
    primaryKeyword: "kettlebell workout",
    title: "Kettlebell Workouts — Swing, Snatch, Squat, Strong",
    description: "Kettlebell workouts by Sports Scientist Haris Falas. Real kettlebell programming — swings, presses, get-ups and complexes that build strength and conditioning at once.",
    h1: "Kettlebell Workouts",
    intro: [
      "Kettlebells are the most under-used tool in adult fitness. One bell covers hinge, squat, press, pull and carry patterns and doubles as a conditioning implement. Smarty kettlebell workouts respect both halves.",
      "Expect swings, cleans, snatches, presses, Turkish get-ups and complexes — programmed for strength endurance, conditioning, or hypertrophy depending on the session intent.",
    ],
    faq: [
      { q: "What kettlebell weight should I start with?", a: "Most adult men start with 16 kg, most adult women with 8–12 kg. Heavier than you think — kettlebells are leveraged differently than dumbbells." },
      { q: "Are kettlebell swings good for fat loss?", a: "Yes. Heavy kettlebell swings deliver one of the highest calorie outputs per minute of any exercise, while also building posterior chain strength." },
      { q: "How often should I do kettlebell workouts?", a: "3–4 sessions per week works for most adults. Kettlebell volume taxes the grip and posterior chain heavily — recovery matters." },
    ],
    match: (r) => matchAny(`${r.equipment || ""} ${r.name}`, ["KETTLEBELL", "KB"]),
    related: ["to-get-stronger", "for-muscle-gain", "to-burn-fat"],
  },
];

/* ──────────────────────────────────────────────────────────────────
 * Topic hub pages
 * ────────────────────────────────────────────────────────────────── */

export const TOPIC_PAGES: TopicPage[] = [
  {
    slug: "weight-loss",
    primaryKeyword: "weight loss",
    title: "Weight Loss — Training, Nutrition, Real Expectations",
    description: "The SmartyGym weight loss hub: workouts, the Weight Loss Program, evidence-based articles, and the math that actually delivers fat loss.",
    h1: "Weight Loss",
    intro: [
      "Weight loss is solved at the kitchen table and reinforced in the gym. Anyone telling you otherwise is selling something. The SmartyGym weight loss hub gathers every workout, program and article on the topic, organized so you can build a real plan instead of chasing trends.",
    ],
    faq: [
      { q: "What's the fastest way to lose weight safely?", a: "A sustained 300–700 kcal/day deficit, 3–5 training sessions per week (at least 2 strength), 1.6–2.2 g protein per kg of bodyweight, and 7–9 hours of sleep. Sustainable rate is 0.5–1% bodyweight per week." },
      { q: "Do I need cardio to lose weight?", a: "No, but it helps. Cardio extends your calorie ceiling so the diet feels easier and supports cardiovascular health. Strength is the non-negotiable — it preserves muscle through the deficit." },
    ],
    match: (r) => {
      const t = `${r.name} ${r.description || ""} ${r.category || ""}`;
      return matchAny(t, ["WEIGHT LOSS", "FAT LOSS", "CALORIE", "METABOLIC", "LEAN", "BURN"]);
    },
    related: ["for-weight-loss", "to-burn-fat", "hiit", "tabata"],
  },
  {
    slug: "strength",
    primaryKeyword: "strength training",
    title: "Strength Training — The Foundation of Healthy Aging",
    description: "The SmartyGym strength hub: strength workouts, multi-week programs, and articles on what actually builds force over years.",
    h1: "Strength Training",
    intro: [
      "Strength is the most leveraged adaptation you can build as an adult. It protects bone density, defends muscle mass, raises metabolic rate, fixes posture, and keeps you self-sufficient as you age. Every Smarty strength workout and program is built around progressive overload, not novelty.",
    ],
    faq: [
      { q: "How many days a week should I strength train?", a: "3–4 sessions per week is the sweet spot for most adults. Two maintains; five+ requires recovery infrastructure most non-athletes don't have." },
      { q: "Is strength training enough on its own?", a: "Strength + 2 weekly conditioning sessions + daily walking is the most evidence-supported general-fitness stack for adults. Strength is the foundation." },
    ],
    match: (r) => {
      const t = `${r.name} ${r.description || ""} ${r.category || ""}`;
      return matchAny(t, ["STRENGTH", "HYPERTROPHY", "FORCE", "STRONGER", "MUSCLE"]);
    },
    related: ["to-get-stronger", "for-muscle-gain", "dumbbell-only", "kettlebell"],
  },
  {
    slug: "mobility",
    primaryKeyword: "mobility",
    title: "Mobility — Joint Health, Range, and Force Production",
    description: "The SmartyGym mobility hub: mobility workouts, the Mobility & Stability Program, and articles on building usable range — not just stretching.",
    h1: "Mobility",
    intro: [
      "Mobility is the range you can produce force in. Smarty mobility content covers CARs, end-range strength, dynamic flows, and the daily ritual that keeps a 40+ body moving like it should.",
    ],
    faq: [
      { q: "How is mobility different from flexibility?", a: "Flexibility is passive range. Mobility is active control of that range under load. The former is a stretch; the latter is training." },
    ],
    match: (r) => {
      const t = `${r.name} ${r.description || ""} ${r.category || ""}`;
      return matchAny(t, ["MOBILITY", "FLEXIBILITY", "RANGE", "CARS", "STABILITY"]);
    },
    related: ["for-mobility", "for-low-back-pain", "for-men-over-40", "for-women-over-40"],
  },
  {
    slug: "recovery",
    primaryKeyword: "recovery training",
    title: "Recovery — Where Training Adaptations Actually Happen",
    description: "The SmartyGym recovery hub: recovery workouts, the Daily Smarty Ritual, and articles on the rest of the equation that most training plans ignore.",
    h1: "Recovery",
    intro: [
      "Training is the stimulus. Recovery is where the adaptation happens. Skip the second half and the first half stops working. Smarty recovery content covers active recovery sessions, breathwork, mobility flows, sleep, and the periodization tools that keep adaptation alive.",
    ],
    faq: [
      { q: "How many recovery days per week do I need?", a: "Most adults need 1–2 deliberate recovery days per week. Recovery doesn't mean lying on the couch — it means lighter movement that doesn't add to fatigue." },
    ],
    match: (r) => {
      const t = `${r.name} ${r.description || ""} ${r.category || ""}`;
      return matchAny(t, ["RECOVERY", "BREATHWORK", "MOBILITY", "MOBILITY & STABILITY", "RITUAL"]);
    },
    related: ["for-mobility", "for-low-back-pain"],
  },
  {
    slug: "healthy-aging",
    primaryKeyword: "fitness for healthy aging",
    title: "Healthy Aging — Train for the Next 30 Years",
    description: "The SmartyGym healthy aging hub: workouts, programs and articles built on the simple principle that aging is not optional, but how you age is.",
    h1: "Healthy Aging",
    intro: [
      "Aging is not optional. How you age is. Strength, mobility, conditioning, sleep, nutrition — these are the levers. Smarty healthy-aging content is the curated library of workouts and articles that move those levers in the right direction, for the rest of your life.",
    ],
    faq: [
      { q: "What's the single most important exercise as you age?", a: "Strength training. It defends muscle mass, bone density, balance, joint integrity and metabolic health simultaneously. No other intervention covers as much ground." },
    ],
    match: (r) => {
      const t = `${r.name} ${r.description || ""} ${r.category || ""}`;
      return matchAny(t, ["AGING", "OVER 40", "OVER 50", "LONGEVITY", "STRENGTH", "MOBILITY"]);
    },
    related: ["for-men-over-40", "for-women-over-40", "for-mobility", "to-get-stronger"],
  },
];

/* ──────────────────────────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────────────────────────── */

export function findLandingBySlug(slug: string): LandingPage | undefined {
  return LANDING_PAGES.find((l) => l.slug === slug);
}
export function findTopicBySlug(slug: string): TopicPage | undefined {
  return TOPIC_PAGES.find((t) => t.slug === slug);
}

/** Cross-link target for an existing workout: returns the top N matching
 * landing-page slugs ranked by predicate hits. Used by the internal-link
 * engine in the prerender. */
export function landingsMatchingRow(row: LandingMatchRow, limit = 3): LandingPage[] {
  const hits: LandingPage[] = [];
  for (const lp of LANDING_PAGES) {
    if (lp.match(row)) hits.push(lp);
    if (hits.length >= limit) break;
  }
  return hits;
}

export function topicsMatchingRow(row: LandingMatchRow, limit = 2): TopicPage[] {
  const hits: TopicPage[] = [];
  for (const tp of TOPIC_PAGES) {
    if (tp.match(row)) hits.push(tp);
    if (hits.length >= limit) break;
  }
  return hits;
}