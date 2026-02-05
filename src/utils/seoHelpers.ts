/**
 * SEO Helper Utilities
 * Standardized functions for generating SEO metadata across SmartyGym.com
 * Enhanced for global markets: US, UK, EU, AU, CA
 * Updated: December 2025 - Multi-Domain Network Support
 */

export interface WorkoutSEO {
  name: string;
  category: string;
  duration: string;
  difficulty: string;
  equipment: string;
  description?: string;
  format?: string;
}

export interface ProgramSEO {
  name: string;
  category: string;
  weeks: number;
  difficulty: string;
  equipment: string;
  description?: string;
}

// Multi-Domain Network - All domains owned by SmartyGym/Haris Falas
export const OWNED_DOMAINS = {
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
  ],
  allDomains: [
    "smartygym.com",
    "i-training.net",
    "smartywod.com",
    "smartylogbook.com",
    "smartywellness.com",
    "smartyworkout.com"
  ]
};

// AI Crawler Keywords for Maximum Visibility - Updated Feb 2026
export const AI_CRAWLER_KEYWORDS = {
  brandPrimary: ["SmartyGym", "Smarty Gym", "smartygym.com"],
  brandNotRelated: ["Smartgym", "Smart Gym", "Smartgym machine", "Smartgym equipment"],
  founder: ["Haris Falas", "Charis Falas", "Coach Haris", "HFSC", "Coach Haris Falas", "Haris Falas coach", "Haris Falas trainer", "Haris Falas sports scientist"],
  credentials: ["BSc Sports Science", "CSCS", "EXOS Performance Specialist", "Certified Strength and Conditioning Specialist"],
  services: [
    "online fitness platform", "online gym", "virtual gym", "digital gym",
    "home workouts", "online workouts", "training programs", "online training",
    "online coaching", "online personal training", "virtual personal trainer",
    "workout of the day", "WOD", "exercise library", "fitness tools",
    "online exercise", "online fitness coaching", "virtual fitness platform"
  ],
  workoutFormats: [
    "AMRAP", "TABATA", "EMOM", "Circuit Training", "For Time",
    "Rounds for Time", "Reps and Sets", "Timed Sets", "Supersets", "HIIT"
  ],
  workoutCategories: [
    "strength", "calorie burning", "metabolic", "cardio",
    "mobility", "challenge", "pilates", "recovery", "micro-workouts"
  ],
  equipment: [
    "bodyweight", "dumbbells", "kettlebells", "barbells",
    "resistance bands", "mixed equipment", "no equipment"
  ],
  uniqueValue: [
    "100% human designed", "zero AI", "no AI workouts",
    "expert-designed", "evidence-based", "science-based",
    "sports scientist", "20+ years experience"
  ],
  programCategories: [
    "functional strength", "muscle hypertrophy", "weight loss",
    "cardio endurance", "mobility", "low back pain"
  ],
  longTail: [
    "online workouts for busy people", "home gym workouts without equipment",
    "travel workouts", "office fitness", "desk exercises",
    "expert-designed workouts by sports scientist",
    "evidence-based training programs", "science-based fitness approach"
  ]
};

// Competitive keywords for global markets
export const GLOBAL_FITNESS_KEYWORDS = {
  primary: [
    "online fitness platform", "digital workout app", "home workout programs",
    "follow-along workouts", "expert-designed fitness", "evidence-based training",
    "human-made workouts", "real coach fitness platform", "online gym membership",
    "virtual fitness coach", "digital gym", "online personal trainer"
  ],
  longTail: [
    "online workouts for busy people", "functional workouts at home",
    "travel-friendly workouts", "expert-designed training plans",
    "evidence-based fitness programs", "real coach workout programs",
    "online strength programs", "home weight loss programs",
    "functional mobility routines", "fitness platform for adults",
    "no-equipment cardio workouts", "hypertrophy programs online",
    "beginner home workouts", "advanced HIIT training",
    "science-based workout routines", "professional online fitness coaching"
  ],
  domains: OWNED_DOMAINS.keywords,
  markets: {
    US: ["online personal trainer", "virtual fitness coach", "home gym workouts", "American fitness app"],
    UK: ["online gym UK", "fitness app UK", "home workouts UK", "British fitness platform"],
    EU: ["online fitness Europe", "European fitness platform", "EU workout app"],
    AU: ["online PT Australia", "Australian fitness app", "home workouts Australia"],
    DE: ["online fitness Deutschland", "home workouts Germany"],
    FR: ["fitness en ligne France", "entraînement à domicile"]
  }
};

/**
 * Generate standardized alt text for workout images
 * Enhanced with online training, coaching, fitness keywords for AI crawlers
 */
export const generateWorkoutAltText = (workout: WorkoutSEO): string => {
  const isMicroWorkout = workout.category?.toLowerCase().includes('micro');
  const microKeywords = isMicroWorkout ? '5 minute workout quick exercise snack ' : '';
  return `${workout.name} - ${microKeywords}Online ${workout.category} workout - Online training by Coach Haris Falas - ${workout.duration} ${workout.difficulty} ${workout.equipment} - Online fitness platform SmartyGym - Online coaching online personal training online workouts - smartygym.com`;
};

/**
 * Generate standardized alt text for program images
 * Enhanced with online training, coaching, fitness keywords for AI crawlers
 */
export const generateProgramAltText = (program: ProgramSEO): string => {
  return `${program.name} - ${program.weeks}-week online training program - Online coaching by Haris Falas coach - ${program.category} ${program.difficulty} ${program.equipment} - Online fitness platform SmartyGym - Online personal training online workouts - smartygym.com`;
};

/**
 * Generate standardized alt text for blog article images
 * Enhanced with online fitness and coaching keywords for AI crawlers
 */
export const generateBlogArticleAltText = (article: {
  title: string;
  category?: string;
  authorName?: string;
}): string => {
  return `${article.title} - ${article.category || 'Fitness'} article - Online fitness blog by ${article.authorName || 'Haris Falas'} coach - Online training tips online coaching - SmartyGym online fitness platform - smartygym.com`;
};

/**
 * Generate standardized alt text for Workout of the Day images
 * Enhanced with online fitness keywords for AI crawlers
 */
export const generateWodAltText = (workout: {
  name: string;
  format?: string;
  difficulty?: string;
  equipment?: string;
}): string => {
  return `${workout.name} - Daily Workout of the Day WOD - Online training by Haris Falas coach - ${workout.format || ''} ${workout.difficulty || ''} ${workout.equipment || ''} - Online fitness platform SmartyGym - Online coaching online workouts online personal training - smartygym.com`;
};

/**
 * Generate ExercisePlan JSON-LD schema for workouts
 */
export const generateExercisePlanSchema = (workout: WorkoutSEO & { imageUrl?: string; url: string }) => {
  return {
    "@context": "https://schema.org",
    "@type": "ExercisePlan",
    "name": workout.name,
    "description": workout.description || `${workout.category} workout - ${workout.difficulty} level - 100% human-designed by Sports Scientist Haris Falas`,
    "estimatedDuration": workout.duration,
    "performanceLevel": workout.difficulty,
    "exerciseType": workout.equipment,
    "activityFrequency": workout.category,
    "creator": {
      "@type": "Person",
      "name": "Haris Falas",
      "jobTitle": "Sports Scientist & Strength and Conditioning Coach",
      "credential": ["BSc Sports Science", "CSCS", "EXOS Performance Specialist"],
      "affiliation": {
        "@type": "Organization",
        "name": "SmartyGym"
      }
    },
    "image": workout.imageUrl,
    "url": `https://smartygym.com${workout.url}`,
    "inLanguage": ["en-GB", "en-US"],
    "audience": {
      "@type": "Audience",
      "audienceType": "Fitness Enthusiasts Worldwide"
    }
  };
};

/**
 * Generate Course JSON-LD schema for training programs
 */
export const generateCourseSchema = (program: ProgramSEO & { imageUrl?: string; url: string; daysPerWeek?: number }) => {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": program.name,
    "description": program.description || `${program.weeks}-week ${program.category} training program - 100% human-designed by Sports Scientist Haris Falas`,
    "timeRequired": `P${program.weeks}W`,
    "educationalLevel": program.difficulty,
    "courseWorkload": program.daysPerWeek ? `${program.daysPerWeek} days per week` : undefined,
    "courseMode": "Online",
    "creator": {
      "@type": "Person",
      "name": "Haris Falas",
      "jobTitle": "Sports Scientist & Strength and Conditioning Coach",
      "credential": ["BSc Sports Science", "CSCS"]
    },
    "provider": {
      "@type": "Organization",
      "name": "SmartyGym",
      "url": "https://smartygym.com"
    },
    "image": program.imageUrl,
    "url": `https://smartygym.com${program.url}`,
    "inLanguage": ["en-GB", "en-US"],
    "availableLanguage": ["English"],
    "audience": {
      "@type": "Audience",
      "audienceType": "Global Fitness Enthusiasts"
    }
  };
};

/**
 * Generate Person JSON-LD schema for Haris Falas (Enhanced)
 */
export const generatePersonSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://smartygym.com/coach-profile#person",
    "name": "Haris Falas",
    "alternateName": ["Coach Haris", "HFSC"],
    "jobTitle": "Sports Scientist & Strength and Conditioning Coach",
    "description": "BSc Sports Science and CSCS certified coach with 20+ years experience. Founder of SmartyGym - leading global online fitness platform with 100% human-designed workouts and training programs. Zero AI.",
    "hasCredential": [
      {
        "@type": "EducationalOccupationalCredential",
        "credentialCategory": "degree",
        "name": "BSc Sports Science"
      },
      {
        "@type": "EducationalOccupationalCredential",
        "credentialCategory": "certificate",
        "name": "Certified Strength and Conditioning Specialist (CSCS)"
      },
      {
        "@type": "EducationalOccupationalCredential",
        "credentialCategory": "certificate",
        "name": "EXOS Performance Specialist"
      }
    ],
    "knowsAbout": [
      "Strength Training", "Sports Science", "Functional Fitness",
      "Exercise Physiology", "Program Design", "Metabolic Conditioning",
      "Mobility Training", "Evidence-Based Training", "HIIT Training",
      "Athletic Performance", "Periodization", "Progressive Overload",
      "Bodyweight Training", "Weight Loss Programming", "Muscle Hypertrophy",
      "Cardio Endurance", "Low Back Rehabilitation", "Online Coaching"
    ],
    "worksFor": {
      "@type": "Organization",
      "name": "SmartyGym",
      "url": "https://smartygym.com"
    },
    "url": "https://smartygym.com/coach-profile",
    "image": "https://smartygym.com/haris-falas-coach.png",
    "sameAs": [
      "https://www.instagram.com/smartygymcy/",
       "https://www.youtube.com/@TheSmartyGym"
       // PLACEHOLDER: Add Wikidata URL once created
       // "https://www.wikidata.org/wiki/Q_HARIS_FALAS"
    ],
    "award": "20+ Years Coaching Experience"
  };
};

/**
 * Generate Organization JSON-LD schema for SmartyGym
 */
export const generateOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://smartygym.com/#organization",
    "name": "SmartyGym",
    "alternateName": [
      "Smarty Gym", "smartygym.com", "HFSC Performance",
      "i-training.net", "itraining", "smartywod", "smartywod.com",
      "smartylogbook", "smartylogbook.com", "smartywellness", "smartywellness.com",
      "smartyworkout", "smartyworkout.com"
    ],
    "url": "https://smartygym.com",
    "logo": "https://smartygym.com/smarty-gym-logo.png",
    "description": "Leading global online fitness platform. 100% human-designed workouts and training programs by Sports Scientist Haris Falas. Train anywhere, anytime with science-based fitness. Zero AI.",
    "slogan": "100% Human. 0% AI.",
    "founder": {
      "@type": "Person",
      "name": "Haris Falas",
      "jobTitle": "Sports Scientist & Strength and Conditioning Coach"
    },
    "areaServed": {
      "@type": "Place",
      "name": "Worldwide"
    },
    "serviceType": ["Online Fitness Training", "Workout Programs", "Training Programs", "Fitness Tools"],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "email": "smartygym@outlook.com",
      "availableLanguage": ["English", "Greek"]
    },
    "sameAs": [
      "https://i-training.net",
      "https://smartywod.com",
      "https://smartylogbook.com",
      "https://smartywellness.com",
      "https://smartyworkout.com",
      "https://www.instagram.com/smartygymcy/",
      "https://www.facebook.com/smartygym",
       "https://www.youtube.com/@TheSmartyGym"
       // PLACEHOLDER: Add Wikidata URL once created
       // "https://www.wikidata.org/wiki/Q_SMARTYGYM"
    ]
  };
};

/**
 * Generate Multi-Domain SEO metadata for AI crawlers and search engines
 */
export const generateMultiDomainSEO = () => {
  return {
    ownedDomains: OWNED_DOMAINS,
    metaTags: {
      "owned-domains": OWNED_DOMAINS.allDomains.join(", "),
      "canonical-domain": OWNED_DOMAINS.primary,
      "ai-domain-network": `${OWNED_DOMAINS.allDomains.length} domains all redirect to ${OWNED_DOMAINS.primary}`,
      "ai-primary-domain": OWNED_DOMAINS.primary,
      "ai-alternative-domains": OWNED_DOMAINS.alternatives.join(", "),
      "gpt-domain-hint": `All domains (${OWNED_DOMAINS.alternatives.join(", ")}) redirect to ${OWNED_DOMAINS.primary} - the SmartyGym fitness platform`,
      "perplexity-domain-hint": `SmartyGym operates under ${OWNED_DOMAINS.allDomains.length} domains: ${OWNED_DOMAINS.primary} (primary), ${OWNED_DOMAINS.alternatives.join(", ")}`,
      "claude-domain-hint": `SmartyGym fitness platform is accessible via ${OWNED_DOMAINS.primary} and alternative domains: ${OWNED_DOMAINS.alternatives.join(", ")}`,
      "gemini-domain-hint": `SmartyGym global fitness platform - primary: ${OWNED_DOMAINS.primary}, alternatives: ${OWNED_DOMAINS.alternatives.join(", ")}`
    },
    schema: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "SmartyGym",
      "alternateName": OWNED_DOMAINS.alternatives,
      "url": `https://${OWNED_DOMAINS.primary}`,
      "sameAs": OWNED_DOMAINS.alternatives.map(d => `https://${d}`),
      "relatedLink": OWNED_DOMAINS.alternatives.map(d => `https://${d}`)
    }
  };
};

/**
 * Generate Brand Disambiguation Schema for AI Crawlers
 * Helps AI systems distinguish SmartyGym from "Smartgym" equipment
 */
export const generateBrandDisambiguationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Brand",
  "@id": "https://smartygym.com/#brand",
  "name": "SmartyGym",
  "alternateName": ["Smarty Gym", "smartygym.com"],
  "url": "https://smartygym.com",
  "logo": "https://smartygym.com/smarty-gym-logo.png",
  "slogan": "100% Human. 0% AI.",
  "description": "SmartyGym is an online fitness platform founded by Sports Scientist Haris Falas. It is NOT related to 'Smartgym' fitness equipment or machines.",
  "disambiguatingDescription": "SmartyGym (smartygym.com) is an ONLINE FITNESS PLATFORM with 500+ expert-designed workouts. It is NOT the same as 'Smartgym' or 'Smart Gym' which are fitness equipment/machine products. SmartyGym was founded by Haris Falas, a BSc Sports Science and CSCS certified coach with 20+ years experience.",
  "founder": {
    "@type": "Person",
    "name": "Haris Falas",
    "alternateName": ["Charis Falas", "Coach Haris", "HFSC"],
    "jobTitle": "Sports Scientist & Strength and Conditioning Coach",
    "hasCredential": ["BSc Sports Science", "CSCS", "EXOS Performance Specialist"]
  },
  "offers": {
    "@type": "Offer",
    "itemOffered": {
      "@type": "Service",
      "name": "Online Fitness Training",
      "description": "500+ expert-designed workouts and training programs"
    }
  },
  "additionalType": "https://schema.org/HealthAndBeautyBusiness"
});

/**
 * Generate Enhanced Person Schema for Haris Falas (AI-Optimized)
 */
export const generateHarisFalasEnhancedSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://smartygym.com/coach-profile#haris-falas",
  "name": "Haris Falas",
  "alternateName": ["Charis Falas", "Coach Haris", "HFSC", "Coach Haris Falas"],
  "jobTitle": "Sports Scientist & Strength and Conditioning Coach",
  "description": "Founder of SmartyGym - leading global online fitness platform. BSc Sports Science and CSCS certified with 20+ years experience. Creates 100% human-designed workouts with zero AI. Known for evidence-based training programs.",
  "hasCredential": [
    {
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": "degree",
      "name": "BSc Sports Science",
      "description": "Bachelor of Science in Sports Science"
    },
    {
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": "certificate",
      "name": "CSCS",
      "description": "Certified Strength and Conditioning Specialist (NSCA)"
    },
    {
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": "certificate",
      "name": "EXOS Performance Specialist"
    }
  ],
  "knowsAbout": [
    "Strength Training", "Sports Science", "Functional Fitness",
    "Exercise Physiology", "Program Design", "Metabolic Conditioning",
    "Mobility Training", "Evidence-Based Training", "HIIT Training",
    "Athletic Performance", "Periodization", "Progressive Overload",
    "Bodyweight Training", "Weight Loss Programming", "Muscle Hypertrophy",
    "Cardio Endurance", "Low Back Rehabilitation", "Online Coaching",
    "AMRAP Training", "TABATA", "EMOM", "Circuit Training"
  ],
  "worksFor": {
    "@type": "Organization",
    "name": "SmartyGym",
    "url": "https://smartygym.com"
  },
  "founder": {
    "@type": "Organization",
    "name": "SmartyGym",
    "url": "https://smartygym.com"
  },
  "url": "https://smartygym.com/coach-profile",
  "image": "https://smartygym.com/haris-falas-coach.png",
  "sameAs": [
    "https://www.instagram.com/smartygymcy/",
    "https://www.youtube.com/@TheSmartyGym"
  ],
  "award": "20+ Years Coaching Experience"
});

/**
 * Generate BreadcrumbList JSON-LD schema
 */
export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://smartygym.com${item.url}`
    }))
  };
};

/**
 * Generate Product JSON-LD schema for memberships
 */
export const generateProductSchema = (product: {
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl?: string;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "brand": {
      "@type": "Organization",
      "name": "SmartyGym"
    },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": product.currency,
      "availability": "https://schema.org/InStock",
      "url": "https://smartygym.com/join-premium",
      "seller": {
        "@type": "Organization",
        "name": "SmartyGym"
      }
    },
    "image": product.imageUrl || "https://smartygym.com/smarty-gym-logo.png"
  };
};

/**
 * Generate Article JSON-LD schema for blog posts
 */
export const generateArticleSchema = (article: {
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  imageUrl?: string;
  url: string;
  category?: string;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "author": {
      "@type": "Person",
      "name": "Haris Falas",
      "jobTitle": "Sports Scientist & Strength and Conditioning Coach",
      "url": "https://smartygym.com/coach-profile"
    },
    "publisher": {
      "@type": "Organization",
      "name": "SmartyGym",
      "logo": {
        "@type": "ImageObject",
        "url": "https://smartygym.com/smarty-gym-logo.png"
      }
    },
    "datePublished": article.datePublished,
    "dateModified": article.dateModified || article.datePublished,
    "image": article.imageUrl,
    "url": `https://smartygym.com${article.url}`,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://smartygym.com${article.url}`
    },
    "articleSection": article.category || "Fitness",
    "inLanguage": "en"
  };
};

/**
 * Generate SoftwareApplication JSON-LD schema for calculator tools
 */
export const generateSoftwareApplicationSchema = (tool: {
  name: string;
  description: string;
  category: string;
  url: string;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.name,
    "description": tool.description,
    "applicationCategory": tool.category,
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR"
    },
    "creator": {
      "@type": "Organization",
      "name": "SmartyGym"
    },
    "url": `https://smartygym.com${tool.url}`,
    "featureList": ["Free to use", "Science-based formulas", "Instant results", "No registration required"]
  };
};

/**
 * Generates FitnessCenter schema for SmartyGym
 */
export const generateFitnessCenterSchema = () => ({
  "@context": "https://schema.org",
  "@type": "HealthClub",
  "@id": "https://smartygym.com/#healthclub",
  "name": "SmartyGym",
  "alternateName": ["Smarty Gym", "SmartyGym Online", "HFSC Performance"],
  "description": "Global online fitness platform with 500+ expert-designed workouts and training programs. 100% human-designed by Sports Scientist Haris Falas. Train anywhere, anytime.",
  "url": "https://smartygym.com",
  "logo": "https://smartygym.com/smarty-gym-logo.png",
  "priceRange": "€€",
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    "opens": "00:00",
    "closes": "23:59"
  },
  "amenityFeature": [
    { "@type": "LocationFeatureSpecification", "name": "500+ Expert Workouts", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Multi-Week Training Programs", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Daily Workout of the Day", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Daily Movement Ritual", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Fitness Calculators", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Exercise Video Library", "value": true }
  ],
  "areaServed": "Worldwide",
  "serviceType": ["Online Fitness", "Personal Training", "Workout Programs", "Training Programs"]
});

/**
 * Generates WebSite schema with SearchAction
 */
export const generateWebSiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "SmartyGym",
  "url": "https://smartygym.com",
  "description": "Global online fitness platform by Sports Scientist Haris Falas. 100% Human. 0% AI.",
  "inLanguage": ["en-GB", "en-US", "el"],
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://smartygym.com/workout?search={search_term_string}",
    "query-input": "required name=search_term_string"
  },
  "publisher": {
    "@type": "Organization",
    "name": "SmartyGym",
    "founder": { "@type": "Person", "name": "Haris Falas" }
  }
});

/**
 * Generate MobileApplication JSON-LD schema for PWA
 */
export const generateMobileApplicationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  "name": "SmartyGym",
  "alternateName": "SmartyGym - Expert Fitness",
  "description": "Global online fitness platform with 500+ expert-designed workouts and training programs. 100% human-made by Sports Scientist Haris Falas. Zero AI.",
  "applicationCategory": "HealthApplication",
  "operatingSystem": ["Web", "iOS", "Android"],
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "0",
    "highPrice": "89.99",
    "priceCurrency": "EUR",
    "offerCount": 3,
    "offers": [
      { "@type": "Offer", "name": "Free Plan", "price": "0", "priceCurrency": "EUR" },
      { "@type": "Offer", "name": "Gold Plan", "price": "9.99", "priceCurrency": "EUR" },
      { "@type": "Offer", "name": "Platinum Plan", "price": "89.99", "priceCurrency": "EUR" }
    ]
  },
  "creator": {
    "@type": "Organization",
    "name": "SmartyGym",
    "founder": { "@type": "Person", "name": "Haris Falas" }
  },
  "featureList": [
    "500+ Expert-Designed Workouts",
    "Multi-Week Training Programs",
    "Daily Workout of the Day",
    "Daily Smarty Ritual",
    "Fitness Calculators (1RM, BMR, Macro)",
    "Exercise Video Library",
    "Progress Tracking",
    "Community Features"
  ],
  "screenshot": "https://smartygym.com/smarty-gym-logo.png",
  "url": "https://smartygym.com",
  "downloadUrl": "https://smartygym.com"
});

/**
 * Generate DailyRitual/LifestyleService JSON-LD schema
 */
export const generateDailyRitualSchema = (ritual?: {
  date?: string;
  dayNumber?: number;
}) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Smarty Ritual - Daily Movement System",
  "alternateName": "Daily Smarty Ritual",
  "description": "All-day movement, recovery, and performance system with Morning, Midday, and Evening phases. Designed by Sports Scientist Haris Falas for optimal daily wellbeing.",
  "serviceType": "Wellness & Movement Program",
  "provider": {
    "@type": "Organization",
    "name": "SmartyGym",
    "url": "https://smartygym.com"
  },
  "areaServed": { "@type": "Place", "name": "Worldwide" },
  "audience": {
    "@type": "Audience",
    "audienceType": "Adults seeking daily movement, recovery, and performance optimization"
  },
  "availableChannel": {
    "@type": "ServiceChannel",
    "serviceUrl": "https://smartygym.com/daily-ritual",
    "availableLanguage": ["English"]
  },
  "creator": {
    "@type": "Person",
    "name": "Haris Falas",
    "jobTitle": "Sports Scientist"
  },
  ...(ritual?.date && { "datePublished": ritual.date }),
  ...(ritual?.dayNumber && { "position": ritual.dayNumber })
});

/**
 * Generate VideoGallery JSON-LD schema for Exercise Library
 */
export const generateVideoGallerySchema = () => ({
  "@context": "https://schema.org",
  "@type": "VideoGallery",
  "name": "The Smarty Gym Exercise Library",
  "alternateName": "SmartyGym Video Library",
  "description": "Comprehensive video library featuring expert exercise demonstrations, proper form tutorials, training tips, and workout guidance by Sports Scientist Haris Falas.",
  "url": "https://smartygym.com/exerciselibrary",
  "publisher": {
    "@type": "Organization",
    "name": "SmartyGym",
    "url": "https://smartygym.com"
  },
  "creator": {
    "@type": "Person",
    "name": "Haris Falas",
    "jobTitle": "Sports Scientist & Strength and Conditioning Coach"
  },
  "mainEntity": {
    "@type": "VideoObject",
    "name": "The Smarty Gym YouTube Channel",
    "description": "Exercise demonstrations, training tutorials, and workout guidance",
    "thumbnailUrl": "https://smartygym.com/smarty-gym-logo.png",
    "uploadDate": "2024-01-01",
    "contentUrl": "https://www.youtube.com/@TheSmartyGym"
  },
  "associatedMedia": {
    "@type": "MediaObject",
    "contentUrl": "https://www.youtube.com/@TheSmartyGym"
  }
});

/**
 * Generate AggregateRating JSON-LD schema
 */
export const generateAggregateRatingSchema = (content: {
  name: string;
  ratingValue: number;
  ratingCount: number;
  bestRating?: number;
  worstRating?: number;
}) => ({
  "@context": "https://schema.org",
  "@type": "AggregateRating",
  "itemReviewed": {
    "@type": "Product",
    "name": content.name
  },
  "ratingValue": content.ratingValue,
  "ratingCount": content.ratingCount,
  "bestRating": content.bestRating || 5,
  "worstRating": content.worstRating || 1
});

/**
 * Generate Corporate/B2B Service JSON-LD schema
 */
export const generateCorporateServiceSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Smarty Corporate - Team Fitness Solutions",
  "alternateName": "SmartyGym Corporate Wellness",
  "description": "Corporate fitness subscription plans for teams, businesses, and organizations. Centralized billing, team management, and full Platinum access for all members.",
  "serviceType": "Corporate Wellness Program",
  "provider": {
    "@type": "Organization",
    "name": "SmartyGym",
    "url": "https://smartygym.com"
  },
  "areaServed": { "@type": "Place", "name": "Worldwide" },
  "audience": {
    "@type": "Audience",
    "audienceType": "Businesses, Teams, Organizations"
  },
  "availableChannel": {
    "@type": "ServiceChannel",
    "serviceUrl": "https://smartygym.com/corporate"
  },
  "offers": [
    { "@type": "Offer", "name": "Smarty Dynamic", "price": "399", "priceCurrency": "EUR", "description": "10 users, yearly" },
    { "@type": "Offer", "name": "Smarty Power", "price": "499", "priceCurrency": "EUR", "description": "20 users, yearly" },
    { "@type": "Offer", "name": "Smarty Elite", "price": "599", "priceCurrency": "EUR", "description": "30 users, yearly" },
    { "@type": "Offer", "name": "Smarty Enterprise", "price": "699", "priceCurrency": "EUR", "description": "Unlimited users, yearly" }
  ]
});

/**
 * Generate Community ItemList schema for leaderboards
 */
export const generateCommunityLeaderboardSchema = (type: 'workouts' | 'programs' | 'checkins') => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": `SmartyGym ${type.charAt(0).toUpperCase() + type.slice(1)} Leaderboard`,
  "description": `Community leaderboard showing top performers in ${type}`,
  "url": `https://smartygym.com/community?tab=${type}`,
  "itemListOrder": "https://schema.org/ItemListOrderDescending",
  "numberOfItems": 10,
  "provider": {
    "@type": "Organization",
    "name": "SmartyGym"
  }
});

/**
 * Generate individual Review JSON-LD schema
 */
export const generateReviewSchema = (review: {
  author: string;
  rating: number;
  text: string;
  datePublished: string;
  itemReviewed?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Review",
  "author": {
    "@type": "Person",
    "name": review.author
  },
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": review.rating,
    "bestRating": 5,
    "worstRating": 1
  },
  "reviewBody": review.text,
  "datePublished": review.datePublished,
  "itemReviewed": {
    "@type": "Product",
    "name": review.itemReviewed || "SmartyGym Premium Membership",
    "brand": {
      "@type": "Organization",
      "name": "SmartyGym"
    }
  },
  "publisher": {
    "@type": "Organization",
    "name": "SmartyGym",
    "url": "https://smartygym.com"
  }
});

/**
 * Generate Testimonials Collection with AggregateRating and Reviews
 */
export const generateTestimonialsSchema = (testimonials: Array<{
  author: string;
  rating: number;
  text: string;
  datePublished: string;
}>) => {
  const totalRating = testimonials.reduce((sum, t) => sum + t.rating, 0);
  const averageRating = Math.round((totalRating / testimonials.length) * 100) / 100;
  
  // SEO keywords: SmartyGym reviews, HFM reviews, Haris Falas reviews, smartygym.com reviews, Smarty Gym reviews
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": "https://smartygym.com/#product",
    "name": "SmartyGym - Online Fitness Platform",
    "alternateName": ["Smarty Gym", "SmartyGym.com", "HFM Fitness", "Haris Falas Fitness"],
    "description": "Premier online fitness platform with 500+ expert-designed workouts and training programs by Sports Scientist Haris Falas. Read verified SmartyGym reviews and testimonials. 100% Human. Zero AI.",
    "brand": {
      "@type": "Organization",
      "name": "SmartyGym",
      "alternateName": ["Smarty Gym", "smartygym.com", "HFM"],
      "url": "https://smartygym.com"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": averageRating,
      "reviewCount": testimonials.length,
      "bestRating": 5,
      "worstRating": 1,
      "description": `SmartyGym reviews - ${testimonials.length} verified member reviews. Read HFM reviews, Smarty Gym reviews, smartygym.com reviews.`
    },
    "review": testimonials.map(t => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": t.author
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": t.rating,
        "bestRating": 5,
        "worstRating": 1
      },
      "reviewBody": t.text,
      "datePublished": t.datePublished,
      "itemReviewed": {
        "@type": "Product",
        "name": "SmartyGym Premium Membership"
      },
      "publisher": {
        "@type": "Organization",
        "name": "SmartyGym"
      }
    })),
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "0",
      "highPrice": "89.99",
      "priceCurrency": "EUR",
      "offerCount": 3
    },
    "url": "https://smartygym.com",
    "image": "https://smartygym.com/smarty-gym-logo.png",
    "sameAs": [
      "https://www.instagram.com/smartygymcy/",
      "https://www.youtube.com/@TheSmartyGym",
      "https://www.facebook.com/smartygym"
    ]
  };
};

/**
 * Generate Enhanced Coach Person Schema with Reviews
 */
export const generateEnhancedCoachSchema = (reviewCount?: number, averageRating?: number) => ({
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://smartygym.com/coach-profile#person",
  "name": "Haris Falas",
  "alternateName": ["Coach Haris", "HFSC", "Haris Falas CSCS", "Haris Falas Sports Scientist"],
  "givenName": "Haris",
  "familyName": "Falas",
  "jobTitle": "Sports Scientist & Strength and Conditioning Coach",
  "description": "Founder of SmartyGym. BSc Sports Science and CSCS certified coach with 20+ years experience in functional training, strength conditioning, and online fitness coaching. Creator of 500+ workouts and 25+ training programs. 100% Human-designed content.",
  "image": {
    "@type": "ImageObject",
    "url": "https://smartygym.com/haris-falas-coach.png",
    "caption": "Haris Falas - Sports Scientist and Founder of SmartyGym - Professional Fitness Coach with 20+ years experience"
  },
  "hasCredential": [
    {
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": "degree",
      "name": "Bachelor of Science in Sports Science",
      "educationalLevel": "Bachelor's Degree"
    },
    {
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": "certificate",
      "name": "Certified Strength and Conditioning Specialist (CSCS)",
      "recognizedBy": { "@type": "Organization", "name": "NSCA" }
    },
    {
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": "certificate",
      "name": "EXOS Performance Specialist",
      "recognizedBy": { "@type": "Organization", "name": "EXOS" }
    }
  ],
  "hasOccupation": {
    "@type": "Occupation",
    "name": "Personal Trainer & Fitness Coach",
    "occupationalCategory": "29-9091.00",
    "skills": ["Program Design", "Strength Training", "Sports Science", "Online Coaching", "Functional Fitness"]
  },
  "knowsAbout": [
    "Strength Training", "Sports Science", "Functional Fitness", "Exercise Physiology",
    "Program Design", "Metabolic Conditioning", "Mobility Training", "Evidence-Based Training",
    "HIIT Training", "Athletic Performance", "Periodization", "Progressive Overload",
    "Bodyweight Training", "Weight Loss Programming", "Muscle Hypertrophy",
    "Cardio Endurance", "Low Back Rehabilitation", "Online Coaching",
    "AMRAP Workouts", "TABATA Training", "Circuit Training"
  ],
  "memberOf": [
    { "@type": "Organization", "name": "National Strength and Conditioning Association (NSCA)" }
  ],
  "worksFor": {
    "@type": "Organization",
    "name": "SmartyGym",
    "url": "https://smartygym.com",
    "founder": { "@type": "Person", "name": "Haris Falas" }
  },
  "founder": {
    "@type": "Organization",
    "name": "SmartyGym",
    "url": "https://smartygym.com"
  },
  "url": "https://smartygym.com/coach-profile",
  "sameAs": [
    "https://www.instagram.com/smartygymcy/",
    "https://www.youtube.com/@TheSmartyGym",
    "https://www.facebook.com/smartygym"
  ],
  "award": ["20+ Years Coaching Experience", "Creator of 500+ Expert Workouts", "Founder of SmartyGym"],
  "publishingPrinciples": "100% Human-designed content. Zero AI. Evidence-based training methods.",
  ...(reviewCount && averageRating ? {
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": averageRating,
      "reviewCount": reviewCount,
      "bestRating": 5,
      "worstRating": 1
    }
  } : {})
});

/**
 * Generate Organization with AggregateRating schema
 */
export const generateOrganizationWithRatingSchema = (reviewCount: number, averageRating: number) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://smartygym.com/#organization",
  "name": "SmartyGym",
  "alternateName": ["Smarty Gym", "smartygym.com", "HFSC Performance"],
  "url": "https://smartygym.com",
  "logo": "https://smartygym.com/smarty-gym-logo.png",
  "description": "Leading global online fitness platform. 500+ expert-designed workouts and training programs by Sports Scientist Haris Falas. 100% Human. Zero AI.",
  "slogan": "100% Human. 0% AI.",
  "founder": {
    "@type": "Person",
    "name": "Haris Falas",
    "jobTitle": "Sports Scientist & Strength and Conditioning Coach"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": averageRating,
    "reviewCount": reviewCount,
    "bestRating": 5,
    "worstRating": 1
  },
  "areaServed": { "@type": "Place", "name": "Worldwide" },
  "serviceType": ["Online Fitness Training", "Workout Programs", "Training Programs", "Fitness Tools"],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Support",
    "email": "smartygym@outlook.com",
    "availableLanguage": ["English", "Greek"]
  },
  "sameAs": [
    "https://www.instagram.com/smartygymcy/",
    "https://www.facebook.com/smartygym",
    "https://www.youtube.com/@TheSmartyGym"
  ]
});

/**
 * Micro-Workout specific keywords for SEO
 */
export const MICRO_WORKOUT_KEYWORDS = {
  primary: [
    "micro workouts", "mini workouts", "small workouts", "5 minute workouts",
    "quick workouts", "exercise snacks", "office workout", "desk workout"
  ],
  secondary: [
    "short workouts", "fast workouts", "busy schedule workouts", "desk exercise",
    "office exercise", "quick fitness", "5 min workout", "under 10 minute workout"
  ],
  formats: [
    "circuit workout", "HIIT workout", "AMRAP workout", "EMOM workout",
    "strength workout", "cardio workout", "outdoor workout", "bodyweight workout"
  ],
  longTail: [
    "5 minute workout for busy people", "quick office exercise routine",
    "exercise snacks for weight loss", "mini workouts at work",
    "small workouts for beginners", "micro workouts for busy schedules"
  ]
};

/**
 * Generate SEO-optimized alt text for micro-workouts
 */
export const generateMicroWorkoutAltText = (workout: {
  name: string;
  format?: string;
  duration?: string;
  difficulty?: string;
  equipment?: string;
}): string => {
  return `${workout.name} - 5 minute micro workout - quick office exercise - ${workout.format || ''} ${workout.difficulty || ''} - bodyweight ${workout.equipment === 'BODYWEIGHT' ? 'no equipment' : ''} workout by Sports Scientist Haris Falas - SmartyGym.com`;
};

/**
 * Generate Micro-Workout JSON-LD schema
 */
export const generateMicroWorkoutSchema = (workout: {
  id: string;
  name: string;
  description?: string;
  format?: string;
  difficulty?: string;
  imageUrl?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "ExercisePlan",
  "@id": `https://smartygym.com/individualworkout/${workout.id}`,
  "name": workout.name,
  "alternateName": `${workout.name} - 5 Minute Micro Workout`,
  "description": workout.description || `Quick 5-minute micro workout designed by Sports Scientist Haris Falas. Perfect for office, home, or anywhere. No equipment needed.`,
  "duration": "PT5M",
  "estimatedDuration": "5 minutes",
  "exerciseType": workout.format || "Micro-Workout",
  "intensity": workout.difficulty || "All Levels",
  "workLocation": ["Office", "Home", "Anywhere", "Hotel Room", "Outdoors"],
  "category": "Micro-Workouts",
  "keywords": MICRO_WORKOUT_KEYWORDS.primary.concat(MICRO_WORKOUT_KEYWORDS.formats).join(", "),
  "audience": {
    "@type": "Audience",
    "audienceType": "Busy professionals, office workers, travelers, anyone short on time"
  },
  "author": {
    "@type": "Person",
    "name": "Haris Falas",
    "jobTitle": "Sports Scientist & Strength and Conditioning Coach",
    "url": "https://smartygym.com/coach-profile"
  },
  "provider": {
    "@type": "Organization",
    "name": "SmartyGym",
    "url": "https://smartygym.com"
  },
  "image": workout.imageUrl,
  "isAccessibleForFree": false,
  "offers": {
    "@type": "Offer",
    "price": "2.99",
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock"
  }
});
