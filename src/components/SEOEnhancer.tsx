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
}

export const SEOEnhancer = ({
  entities = [],
  topics = [],
  expertise = [],
  location = "Cyprus",
  contentType,
  difficultyLevel,
  equipmentRequired,
  timeCommitment,
  fitnessGoal,
  aiSummary,
  aiKeywords = [],
  relatedContent = []
}: SEOEnhancerProps) => {
  return (
    <Helmet>
      {/* Entity Recognition Tags */}
      {entities.map((entity, index) => (
        <meta key={`entity-${index}`} property="schema:entity" content={entity} />
      ))}
      
      {/* Knowledge Graph Signals */}
      {topics.map((topic, index) => (
        <meta key={`topic-${index}`} property="kg:topic" content={topic} />
      ))}
      {expertise.map((exp, index) => (
        <meta key={`expertise-${index}`} property="kg:expertise" content={exp} />
      ))}
      {location && <meta property="kg:location" content={location} />}
      <meta property="kg:founder" content="Haris Falas" />
      
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
      
      {/* AI Embeddings Signals */}
      {aiSummary && <meta name="ai-summary" content={aiSummary} />}
      {aiKeywords.length > 0 && <meta name="ai-keywords" content={aiKeywords.join(", ")} />}
      <meta name="ai-category" content={contentType || "fitness content"} />
      
      {/* Additional Context for AI Understanding */}
      <meta property="schema:brand" content="SmartyGym" />
      <meta property="schema:creator" content="Haris Falas" />
      <meta property="schema:category" content="Online Fitness" />
    </Helmet>
  );
};
