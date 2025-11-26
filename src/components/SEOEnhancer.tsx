/**
 * SEO Enhancer Component
 * Adds AI-search optimization metadata to pages
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
}

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
  pageType = "WebPage"
}: SEOEnhancerProps) => {
  return (
    <Helmet>
      {/* AI Crawler Permissions */}
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
      
      {/* Entity Recognition Tags */}
      {entities.map((entity, index) => (
        <meta key={`entity-${index}`} property="schema:entity" content={entity} />
      ))}
      <meta property="schema:entity" content="SmartyGym" />
      <meta property="schema:entity" content="HFSC Performance" />
      <meta property="schema:entity" content="Haris Falas" />
      <meta property="schema:entity" content="Online Fitness Platform" />
      
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
      
      {/* Greek Keywords for AI Search */}
      {greekKeywords.length > 0 && (
        <meta name="greek-keywords" content={greekKeywords.join(", ")} />
      )}
      
      {/* E-E-A-T Authority Signals */}
      <meta name="author-credential" content="BSc Sports Science, CSCS" />
      <meta name="author-experience" content="20+ years strength and conditioning" />
      <meta name="content-expertise" content="Sports Science, Exercise Physiology" />
      <meta name="publisher-type" content="Global Online Fitness Platform" />
      
      {/* Global Positioning */}
      <meta name="geo.coverage" content="global" />
      <meta name="distribution" content="global" />
      <meta name="target" content="worldwide" />
      
      {/* Additional Context for AI Understanding */}
      <meta property="schema:brand" content="SmartyGym" />
      <meta property="schema:brand" content="HFSC" />
      <meta property="schema:creator" content="Haris Falas" />
      <meta property="schema:category" content="Online Fitness" />
      <meta property="schema:category" content="Health & Wellness" />
      <meta property="schema:areaServed" content="Worldwide" />
    </Helmet>
  );
};
