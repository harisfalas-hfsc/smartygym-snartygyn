import { Helmet } from "react-helmet";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";

/**
 * Pillar page: /research
 * Plain-language digest of the training science SmartyGym's human coaches
 * rely on when programming workouts and training programs.
 */

const URL = "https://smartygym.com/research";

const DIGESTS = [
  {
    title: "Progressive Overload Is the Non-Negotiable Driver of Strength",
    summary:
      "Decades of resistance-training studies converge on one point: strength and hypertrophy adaptations require you to gradually increase demand — load, reps, sets, ROM or technical quality — over time. SmartyGym programs are built around structured progression, not random workout stacking.",
  },
  {
    title: "Volume Drives Hypertrophy, but Recovery Sets the Ceiling",
    summary:
      "Meta-analyses on training volume show a dose–response relationship between weekly hard sets per muscle and hypertrophy — up to the point where recovery, sleep and nutrition can no longer keep up. Our training programs prescribe volume in ranges tuned to real, busy adults, not competitive lifters.",
  },
  {
    title: "Frequency of 2× per Week per Muscle Beats 1× per Week",
    summary:
      "When total volume is equated, training a muscle at least twice per week tends to produce more hypertrophy than once-a-week body-part splits. That's why most SmartyGym programs use full-body, upper/lower or push/pull/legs splits rather than classic bro-splits.",
  },
  {
    title: "Zone 2 Cardio Builds the Aerobic Base Everyone Needs",
    summary:
      "Conversational, steady-state cardio (Zone 2) improves mitochondrial density, fat oxidation, VO2 max ceiling and recovery between hard sessions. SmartyGym conditioning programs blend Zone 2 work with harder intervals rather than defaulting to constant HIIT.",
  },
  {
    title: "Mobility Is Trained, Not Stretched",
    summary:
      "Modern research on joint health and range of motion favors loaded end-range work, controlled articular rotations (CARs) and full-ROM strength training over passive static stretching alone. SmartyGym's Daily Ritual and mobility workouts reflect this shift.",
  },
  {
    title: "Protein Intake in the 1.6–2.2 g/kg Range Supports Muscle Retention",
    summary:
      "Systematic reviews on protein and resistance training place the practical sweet spot for muscle protein synthesis around 1.6–2.2 g of protein per kg of bodyweight per day, split across 3–5 meals. Our macro tools default to this evidence-based range.",
  },
  {
    title: "Sleep Quality Predicts Training Adaptation",
    summary:
      "Restricted or poor-quality sleep reliably blunts strength gains, hypertrophy, testosterone and cognitive performance. SmartyGym's Daily Ritual, check-ins and habit design put sleep on the same tier as sets and reps.",
  },
  {
    title: "Consistency Compounds — Program Design Is Downstream of Adherence",
    summary:
      "The best training program is the one you actually complete. SmartyGym's coaching philosophy prioritizes realistic session lengths, clear equipment options and repeatable weekly structure so consistency — not novelty — drives your results.",
  },
];

const Research = () => {
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${URL}#collection`,
    url: URL,
    name: "SmartyGym Training Research Digest",
    description:
      "A plain-language digest of the strength, hypertrophy, conditioning, mobility, nutrition and recovery research SmartyGym's human coaches rely on when programming.",
    inLanguage: "en",
    isPartOf: { "@type": "WebSite", "@id": "https://smartygym.com/#website" },
    hasPart: DIGESTS.map((d) => ({
      "@type": "CreativeWork",
      headline: d.title,
      abstract: d.summary,
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://smartygym.com/" },
      { "@type": "ListItem", position: 2, name: "Research", item: URL },
    ],
  };

  return (
    <>
      <Helmet>
        <title>Training Research Digest | Evidence Behind SmartyGym Programs</title>
        <meta
          name="description"
          content="The training science behind SmartyGym — progressive overload, volume, frequency, Zone 2, mobility, protein, sleep and adherence, translated into plain English by real coaches."
        />
        <meta
          name="keywords"
          content="training research, strength training research, hypertrophy research, progressive overload, training volume, training frequency, zone 2 cardio, mobility research, protein intake, sleep and training, adherence, evidence-based training, SmartyGym"
        />
        <link rel="canonical" href={URL} />
        <meta property="og:title" content="Training Research Digest | SmartyGym" />
        <meta property="og:description" content="The evidence-based principles behind human-designed SmartyGym programming." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={URL} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Training Research Digest | SmartyGym" />
        <meta name="twitter:description" content="The evidence behind human-designed SmartyGym programming." />
        <script type="application/ld+json">{JSON.stringify(collectionSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <main className="container mx-auto max-w-4xl px-4 py-8">
        <PageBreadcrumbs items={[{ label: "Research" }]} />
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Training Research Digest
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            The training science behind every SmartyGym workout and program — translated
            into plain English by real coaches, not generated by algorithms.
            <strong> 100% human. 0% AI.</strong>
          </p>
        </header>

        <section className="space-y-6">
          {DIGESTS.map((d) => (
            <article key={d.title} className="rounded-lg border border-border p-5 bg-card">
              <h2 className="text-xl font-semibold text-foreground">{d.title}</h2>
              <p className="mt-2 text-muted-foreground">{d.summary}</p>
            </article>
          ))}
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-foreground mb-3">Explore Further</h2>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li><a className="text-primary hover:underline" href="/fitness-training">Human-Designed Fitness Training</a></li>
            <li><a className="text-primary hover:underline" href="/glossary">Fitness Training Glossary</a></li>
            <li><a className="text-primary hover:underline" href="/blog">Smarty Blog</a></li>
            <li><a className="text-primary hover:underline" href="/faq">Frequently Asked Questions</a></li>
          </ul>
        </section>
      </main>
    </>
  );
};

export default Research;