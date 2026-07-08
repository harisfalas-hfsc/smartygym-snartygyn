import { Helmet } from "react-helmet";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";

/**
 * Pillar page: /glossary
 * Entity-rich glossary of real strength & conditioning terms coach-crafted
 * for SmartyGym. Emits DefinedTermSet + DefinedTerm[] schema for semantic
 * search and knowledge-graph pickup.
 */

const URL = "https://smartygym.com/glossary";

const TERMS: Array<{ term: string; def: string }> = [
  { term: "Progressive Overload", def: "The gradual, planned increase of demand on the body — more load, more reps, more sets, better technique or shorter rest — that drives long-term strength and hypertrophy adaptations." },
  { term: "RPE (Rate of Perceived Exertion)", def: "A 1–10 subjective scale used to gauge how hard a set felt. Coaches use RPE to autoregulate load when a fixed percentage of 1RM is not appropriate." },
  { term: "RIR (Reps in Reserve)", def: "How many additional reps you could have performed before technical failure. Programming to 1–3 RIR is a common way to prescribe hypertrophy volume." },
  { term: "Deload", def: "A planned week of reduced volume or intensity that lets fatigue dissipate while preserving skill and fitness, so the next block starts from a stronger baseline." },
  { term: "Training Split", def: "How training days are organized across a week — full body, upper/lower, push/pull/legs, body-part split. Splits balance frequency, volume and recovery." },
  { term: "Compound Lift", def: "A multi-joint exercise (squat, deadlift, bench press, overhead press, row, pull-up) that recruits large amounts of muscle and forms the backbone of strength programs." },
  { term: "Accessory Exercise", def: "A single-joint or targeted movement (curl, lateral raise, leg extension, face pull) used to drive extra volume to a specific muscle or weak link." },
  { term: "Tempo", def: "The prescribed speed of each phase of a rep — usually written as four numbers for eccentric, bottom pause, concentric, top pause. Controlled tempo increases time under tension and technical precision." },
  { term: "ROM (Range of Motion)", def: "The distance a joint or barbell travels through a rep. Training through full, controlled ROM is one of the strongest drivers of hypertrophy and joint health." },
  { term: "Mobility", def: "Active, usable range of motion at a joint. Different from passive flexibility, mobility combines range, control and strength — trained through drills like CARs and end-range holds." },
  { term: "Warm-Up", def: "A structured 5–10 minute sequence that raises tissue temperature, primes the nervous system and rehearses the day's movement patterns before the working sets." },
  { term: "Cooldown", def: "A short post-workout sequence of low-intensity movement, breathing and light mobility that helps you transition out of training and into recovery." },
  { term: "AMRAP (As Many Reps/Rounds As Possible)", def: "A conditioning format where you complete as many quality reps or rounds of a fixed circuit as you can inside a set time cap." },
  { term: "EMOM (Every Minute On the Minute)", def: "An interval format where a prescribed set of work starts at the top of every minute — the leftover time in each minute is your rest." },
  { term: "Tabata", def: "A 4-minute conditioning protocol of eight rounds: 20 seconds of maximal effort work, 10 seconds of rest. Best used with simple, safe movements." },
  { term: "Periodization", def: "The long-term organization of training into blocks with distinct goals (hypertrophy, strength, peaking, deload) so adaptations compound instead of stalling." },
  { term: "Volume", def: "The total amount of work performed — usually counted as hard sets per muscle per week. It is the primary driver of hypertrophy once technique and load are in place." },
  { term: "Intensity", def: "In strength training, intensity refers to load relative to 1RM (heavier = higher intensity), not to how tired you feel." },
  { term: "Superset", def: "Two exercises performed back-to-back with little or no rest — often paired as antagonists (push/pull) to save time without sacrificing quality." },
  { term: "Circuit", def: "A sequence of three or more exercises performed one after the other with minimal rest, used to build conditioning and work capacity." },
  { term: "1RM (One-Rep Max)", def: "The maximum load you can lift for a single repetition with correct technique. Coaches use 1RM percentages to prescribe training loads." },
  { term: "Time Under Tension", def: "The total seconds a muscle is loaded during a set. Slower tempos and full ROM increase time under tension without needing heavier weight." },
  { term: "Cardio Zone 2", def: "A low-to-moderate steady-state effort you can hold conversationally for 30–60 minutes. It builds aerobic base and supports recovery between hard sessions." },
  { term: "HIIT (High-Intensity Interval Training)", def: "Short, hard work intervals alternated with rest, designed to push the anaerobic and cardiovascular systems in a compressed session." },
];

const Glossary = () => {
  const definedTermSetSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": `${URL}#glossary`,
    name: "SmartyGym Fitness Training Glossary",
    description:
      "Plain-language definitions of real strength, hypertrophy, conditioning and mobility terms as used by SmartyGym's human coaches.",
    url: URL,
    hasDefinedTerm: TERMS.map((t) => ({
      "@type": "DefinedTerm",
      name: t.term,
      description: t.def,
      inDefinedTermSet: { "@id": `${URL}#glossary` },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://smartygym.com/" },
      { "@type": "ListItem", position: 2, name: "Glossary", item: URL },
    ],
  };

  return (
    <>
      <Helmet>
        <title>Fitness Training Glossary | Real Terms, Coach-Explained | SmartyGym</title>
        <meta
          name="description"
          content="A plain-language glossary of strength, hypertrophy, conditioning and mobility terms — RPE, RIR, progressive overload, periodization, splits and more, explained by SmartyGym's human coaches."
        />
        <meta
          name="keywords"
          content="fitness glossary, strength training terms, hypertrophy terms, progressive overload, RPE, RIR, deload, training split, compound lift, accessory exercise, tempo, ROM, mobility, warm-up, cooldown, AMRAP, EMOM, tabata, periodization, volume, intensity, superset, circuit, 1RM, time under tension, zone 2, HIIT, SmartyGym"
        />
        <link rel="canonical" href={URL} />
        <meta property="og:title" content="Fitness Training Glossary | SmartyGym" />
        <meta property="og:description" content="Real S&C terms, plain-language definitions — coach-crafted, not auto-generated." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={URL} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Fitness Training Glossary | SmartyGym" />
        <meta name="twitter:description" content="Real S&C terms, plain-language definitions." />
        <script type="application/ld+json">{JSON.stringify(definedTermSetSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <main className="container mx-auto max-w-4xl px-4 py-8">
        <PageBreadcrumbs items={[{ label: "Glossary" }]} />
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Fitness Training Glossary
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Real terms the SmartyGym coaching team uses every day — defined in plain English
            so you can train, program and read fitness research with confidence. Every entry
            is coach-written. <strong>100% human. 0% AI.</strong>
          </p>
        </header>

        <dl className="space-y-6">
          {TERMS.map((t) => (
            <div key={t.term} className="rounded-lg border border-border p-5 bg-card">
              <dt className="text-xl font-semibold text-foreground">{t.term}</dt>
              <dd className="mt-2 text-muted-foreground">{t.def}</dd>
            </div>
          ))}
        </dl>
      </main>
    </>
  );
};

export default Glossary;