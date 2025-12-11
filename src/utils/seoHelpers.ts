/**
 * SEO Helper Utilities
 * Standardized functions for generating SEO metadata across SmartyGym.com
 * Enhanced for global markets: US, UK, EU, AU, CA
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
 */
export const generateWorkoutAltText = (workout: WorkoutSEO): string => {
  return `${workout.name} - Online ${workout.category} workout at SmartyGym by Sports Scientist Haris Falas - ${workout.duration} ${workout.difficulty} ${workout.equipment} training - smartygym.com`;
};

/**
 * Generate standardized alt text for program images
 */
export const generateProgramAltText = (program: ProgramSEO): string => {
  return `${program.name} - ${program.weeks}-week online training program at SmartyGym by Haris Falas - ${program.category} ${program.difficulty} ${program.equipment} - smartygym.com`;
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
    "alternateName": ["Smarty Gym", "smartygym.com", "HFSC Performance"],
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
      "email": "info@smartygym.com",
      "availableLanguage": ["English", "Greek"]
    },
    "sameAs": [
      "https://www.instagram.com/smartygymcy/",
      "https://www.facebook.com/smartygym",
      "https://www.youtube.com/@TheSmartyGym"
    ]
  };
};

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
