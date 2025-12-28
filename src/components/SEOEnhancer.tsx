/**
 * SEO Enhancer Component
 * Adds AI-search optimization metadata to pages
 * Enhanced for global markets: US, UK, EU, AU, CA
 * Updated: December 2025 - Multi-Domain Network Support
 */

import { Helmet } from "react-helmet";

interface SEOEnhancerProps {
  entities?: string[];
  topics?: string[];
  expertise?: string[];
  location?: string;
  contentType?: string;
  difficultyLevel?: string;
  equipmentRequired?: string;
  timeCommitment?: string;
  fitnessGoal?: string;
  aiSummary?: string;
  aiKeywords?: string[];
  relatedContent?: string[];
  greekKeywords?: string[];
  geoRegion?: string;
  geoPlacename?: string;
  geoPosition?: string;
  targetAudience?: string;
  workoutType?: string;
  workoutDuration?: string;
  pageType?: string;
  competitiveKeywords?: string[];
  longTailKeywords?: string[];
  targetMarkets?: string[];
  includeDomainKeywords?: boolean;
  domainContext?: string;
}

// Multi-Domain Network - All owned domains redirect to smartygym.com
const OWNED_DOMAINS = {
  primary: "smartygym.com",
  alternatives: [
    "i-training.net",
    "smartywod.com",
    "smartylogbook.com",
    "smartywellness.com",
    "smartyworkout.com"
  ],
  keywords: [
    "i-training.net", "itraining", "i-training", "i training",
    "smartywod.com", "smartywod", "smarty wod", "smarty-wod",
    "smartylogbook.com", "smartylogbook", "smarty logbook", "smarty-logbook",
    "smartywellness.com", "smartywellness", "smarty wellness", "smarty-wellness",
    "smartyworkout.com", "smartyworkout", "smarty workout", "smarty-workout"
  ]
};

// Global competitive keywords for all pages
const GLOBAL_COMPETITIVE_KEYWORDS = [
  "online fitness platform", "digital workout app", "home workout programs",
  "follow-along workouts", "expert-designed fitness", "evidence-based training",
  "human-made workouts", "real coach fitness platform", "online gym membership",
  "virtual fitness coach", "digital gym", "online personal trainer",
  "science-based workouts", "professional fitness coaching", "train anywhere anytime"
];

// Long-tail keywords for better search targeting
const LONG_TAIL_KEYWORDS = [
  "online workouts for busy people", "functional workouts at home",
  "travel-friendly workouts", "expert-designed training plans",
  "evidence-based fitness programs", "real coach workout programs",
  "online strength programs", "home weight loss programs",
  "functional mobility routines", "fitness platform for adults",
  "no-equipment cardio workouts", "hypertrophy programs online",
  "beginner home workouts", "advanced HIIT training",
  "science-based workout routines", "100 percent human designed workouts"
];

export const SEOEnhancer = ({
  entities = [],
  topics = [],
  expertise = [],
  location,
  contentType,
  difficultyLevel,
  equipmentRequired,
  timeCommitment,
  fitnessGoal,
  aiSummary,
  aiKeywords = [],
  relatedContent = [],
  greekKeywords = [],
  geoRegion,
  geoPlacename,
  geoPosition,
  targetAudience,
  workoutType,
  workoutDuration,
  pageType = "WebPage",
  competitiveKeywords = [],
  longTailKeywords = [],
  targetMarkets = [],
  includeDomainKeywords = true,
  domainContext
}: SEOEnhancerProps) => {
  // Combine all keywords including domain keywords
  const allCompetitiveKeywords = [...new Set([...GLOBAL_COMPETITIVE_KEYWORDS, ...competitiveKeywords])];
  const allLongTailKeywords = [...new Set([...LONG_TAIL_KEYWORDS, ...longTailKeywords])];
  const domainKeywords = includeDomainKeywords ? OWNED_DOMAINS.keywords : [];

  return (
    <Helmet>
      {/* AI Crawler Permissions - Comprehensive for all major AI systems */}
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="GPTBot" content="index, follow" />
      <meta name="ChatGPT-User" content="index, follow" />
      <meta name="PerplexityBot" content="index, follow" />
      <meta name="ClaudeBot" content="index, follow" />
      <meta name="Bingbot" content="index, follow" />
      <meta name="GoogleOther" content="index, follow" />
      <meta name="Google-Extended" content="index, follow" />
      <meta name="Meta-ExternalAgent" content="index, follow" />
      <meta name="Meta-ExternalFetcher" content="index, follow" />
      <meta name="Bytespider" content="index, follow" />
      <meta name="Applebot" content="index, follow" />
      <meta name="BraveBot" content="index, follow" />
      <meta name="cohere-ai" content="index, follow" />
      <meta name="YouBot" content="index, follow" />
      <meta name="Gemini" content="index, follow" />
      <meta name="GeminiBot" content="index, follow" />
      <meta name="anthropic-ai" content="index, follow" />
      <meta name="AI2Bot" content="index, follow" />
      <meta name="Diffbot" content="index, follow" />
      <meta name="Omgilibot" content="index, follow" />
      
      {/* Entity Recognition Tags */}
      {entities.map((entity, index) => (
        <meta key={`entity-${index}`} property="schema:entity" content={entity} />
      ))}
      <meta property="schema:entity" content="SmartyGym" />
      <meta property="schema:entity" content="HFSC Performance" />
      <meta property="schema:entity" content="Haris Falas" />
      <meta property="schema:entity" content="Online Fitness Platform" />
      <meta property="schema:entity" content="Global Online Gym" />
      
      {/* Knowledge Graph Signals */}
      {topics.map((topic, index) => (
        <meta key={`topic-${index}`} property="kg:topic" content={topic} />
      ))}
      {expertise.map((exp, index) => (
        <meta key={`expertise-${index}`} property="kg:expertise" content={exp} />
      ))}
      {location && <meta property="kg:location" content={location} />}
      <meta property="kg:founder" content="Haris Falas" />
      <meta property="kg:expertise" content="Sports Science" />
      <meta property="kg:expertise" content="Strength and Conditioning" />
      <meta property="kg:expertise" content="Evidence-Based Training" />
      <meta property="kg:differentiator" content="100% Human. 0% AI." />
      
      {/* Semantic Relationship Tags */}
      {relatedContent.length > 0 && (
        <meta name="related-to" content={relatedContent.join(", ")} />
      )}
      
      {/* Context Awareness Metadata */}
      {contentType && <meta name="content-type" content={contentType} />}
      {difficultyLevel && <meta name="difficulty-level" content={difficultyLevel} />}
      {equipmentRequired && <meta name="equipment-required" content={equipmentRequired} />}
      {timeCommitment && <meta name="time-commitment" content={timeCommitment} />}
      {fitnessGoal && <meta name="fitness-goal" content={fitnessGoal} />}
      {targetAudience && <meta name="target-audience" content={targetAudience} />}
      {workoutType && <meta name="workout-type" content={workoutType} />}
      {workoutDuration && <meta name="workout-duration" content={workoutDuration} />}
      <meta name="page-type" content={pageType} />
      
      {/* AI Embeddings Signals */}
      {aiSummary && <meta name="ai-summary" content={aiSummary} />}
      {aiKeywords.length > 0 && <meta name="ai-keywords" content={aiKeywords.join(", ")} />}
      <meta name="ai-category" content={contentType || "fitness content"} />
      <meta name="ai-brand" content="SmartyGym - 100% Human. 0% AI." />
      
      {/* Competitive Keywords for Search */}
      <meta name="competitive-keywords" content={allCompetitiveKeywords.join(", ")} />
      <meta name="long-tail-keywords" content={allLongTailKeywords.join(", ")} />
      
      {/* Greek Keywords for AI Search */}
      {greekKeywords.length > 0 && (
        <meta name="greek-keywords" content={greekKeywords.join(", ")} />
      )}
      
      {/* E-E-A-T Authority Signals */}
      <meta name="author-credential" content="BSc Sports Science, CSCS, EXOS Performance Specialist" />
      <meta name="author-experience" content="20+ years strength and conditioning" />
      <meta name="content-expertise" content="Sports Science, Exercise Physiology, Evidence-Based Training" />
      <meta name="publisher-type" content="Global Online Fitness Platform" />
      <meta name="content-authenticity" content="100% Human-Designed, Zero AI-Generated Content" />
      
      {/* Global Positioning & International Markets */}
      <meta name="geo.coverage" content="global" />
      <meta name="distribution" content="global" />
      <meta name="target" content="worldwide" />
      <meta name="target-country" content="US,GB,DE,FR,NL,BE,ES,IT,GR,SE,NO,DK,FI,CA,AU,IE,AT,CH" />
      
      {/* Market-specific signals */}
      {targetMarkets.length > 0 && (
        <meta name="target-markets" content={targetMarkets.join(", ")} />
      )}
      
      {/* Additional Context for AI Understanding */}
      <meta property="schema:brand" content="SmartyGym" />
      <meta property="schema:brand" content="HFSC" />
      <meta property="schema:creator" content="Haris Falas" />
      <meta property="schema:category" content="Online Fitness" />
      <meta property="schema:category" content="Health & Wellness" />
      <meta property="schema:category" content="Digital Gym" />
      <meta property="schema:areaServed" content="Worldwide" />
      <meta property="schema:slogan" content="100% Human. 0% AI." />
      <meta property="schema:serviceType" content="Online Fitness Platform" />
      
      {/* MULTI-DOMAIN NETWORK - Permanent SEO for all owned domains */}
      <meta name="owned-domains" content="smartygym.com, i-training.net, smartywod.com, smartylogbook.com, smartywellness.com, smartyworkout.com" />
      <meta name="canonical-domain" content="smartygym.com" />
      <meta property="schema:additionalProperty" content="Domain Network: 6 domains" />
      
      {/* Domain Entity Recognition */}
      <meta property="schema:entity" content="i-training.net" />
      <meta property="schema:entity" content="smartywod.com" />
      <meta property="schema:entity" content="smartylogbook.com" />
      <meta property="schema:entity" content="smartywellness.com" />
      <meta property="schema:entity" content="smartyworkout.com" />
      
      {/* AI Crawler Domain Hints - ChatGPT, Claude, Perplexity, Gemini, Copilot */}
      <meta name="ai-domain-network" content="6 domains all redirect to smartygym.com" />
      <meta name="ai-primary-domain" content="smartygym.com" />
      <meta name="ai-alternative-domains" content="i-training.net, smartywod.com, smartylogbook.com, smartywellness.com, smartyworkout.com" />
      <meta name="gpt-domain-hint" content="All domains (i-training.net, smartywod.com, smartylogbook.com, smartywellness.com, smartyworkout.com) redirect to smartygym.com - the SmartyGym fitness platform by Haris Falas" />
      <meta name="perplexity-domain-hint" content="SmartyGym operates under 6 domains: smartygym.com (primary), i-training.net, smartywod.com, smartylogbook.com, smartywellness.com, smartyworkout.com" />
      <meta name="claude-domain-hint" content="SmartyGym fitness platform is accessible via smartygym.com and alternative domains: i-training.net, smartywod.com, smartylogbook.com, smartywellness.com, smartyworkout.com" />
      <meta name="gemini-domain-hint" content="SmartyGym global fitness platform - primary: smartygym.com, alternatives: i-training.net, smartywod.com, smartylogbook.com, smartywellness.com, smartyworkout.com" />
      <meta name="copilot-domain-hint" content="SmartyGym by Haris Falas - accessible at smartygym.com and redirected domains: i-training.net, smartywod.com, smartylogbook.com, smartywellness.com, smartyworkout.com" />
      
      {/* Domain-specific keywords for search */}
      {domainKeywords.length > 0 && (
        <meta name="domain-keywords" content={domainKeywords.join(", ")} />
      )}
      {domainContext && <meta name="domain-context" content={domainContext} />}
    </Helmet>
  );
};
