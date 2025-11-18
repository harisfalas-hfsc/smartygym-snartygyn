/**
 * SEO Helper Utilities
 * Standardized functions for generating SEO metadata across SmartyGym.com
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
    "description": workout.description || `${workout.category} workout - ${workout.difficulty} level`,
    "estimatedDuration": workout.duration,
    "performanceLevel": workout.difficulty,
    "exerciseType": workout.equipment,
    "activityFrequency": workout.category,
    "creator": {
      "@type": "Person",
      "name": "Haris Falas",
      "jobTitle": "Sports Scientist & Strength and Conditioning Coach",
      "credential": "BSc Sports Science, CSCS",
      "affiliation": {
        "@type": "Organization",
        "name": "SmartyGym"
      }
    },
    "image": workout.imageUrl,
    "url": `https://smartygym.com${workout.url}`,
    "inLanguage": "en-GB",
    "locationCreated": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "CY",
        "addressLocality": "Cyprus"
      }
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
    "description": program.description || `${program.weeks}-week ${program.category} training program`,
    "timeRequired": `P${program.weeks}W`,
    "educationalLevel": program.difficulty,
    "courseWorkload": program.daysPerWeek ? `${program.daysPerWeek} days per week` : undefined,
    "creator": {
      "@type": "Person",
      "name": "Haris Falas",
      "jobTitle": "Sports Scientist & Strength and Conditioning Coach",
      "credential": "BSc Sports Science, CSCS"
    },
    "provider": {
      "@type": "Organization",
      "name": "SmartyGym",
      "url": "https://smartygym.com"
    },
    "image": program.imageUrl,
    "url": `https://smartygym.com${program.url}`,
    "inLanguage": "en-GB",
    "locationCreated": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "CY",
        "addressLocality": "Cyprus"
      }
    }
  };
};

/**
 * Generate Person JSON-LD schema for Haris Falas
 */
export const generatePersonSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Haris Falas",
    "jobTitle": "Sports Scientist & Strength and Conditioning Coach",
    "description": "BSc Sports Science and CSCS certified coach. Founder of SmartyGym, Cyprus' leading online fitness platform with 100% human-designed workouts and training programs.",
    "credential": ["BSc Sports Science", "Certified Strength and Conditioning Specialist (CSCS)"],
    "knowsAbout": [
      "Strength Training",
      "Sports Science",
      "Functional Fitness",
      "Exercise Physiology",
      "Program Design",
      "Metabolic Conditioning",
      "Mobility Training",
      "Evidence-Based Training"
    ],
    "worksFor": {
      "@type": "Organization",
      "name": "SmartyGym",
      "url": "https://smartygym.com"
    },
    "url": "https://smartygym.com/about",
    "image": "https://smartygym.com/haris-falas-coach.png",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "CY",
      "addressLocality": "Cyprus"
    }
  };
};

/**
 * Generate Organization JSON-LD schema for SmartyGym
 */
export const generateOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SmartyGym",
    "alternateName": "Smarty Gym",
    "url": "https://smartygym.com",
    "logo": "https://smartygym.com/smarty-gym-logo.png",
    "description": "Cyprus' leading online fitness platform. 100% human-designed workouts and training programs by Sports Scientist Haris Falas. Train anywhere, anytime with science-based fitness.",
    "founder": {
      "@type": "Person",
      "name": "Haris Falas",
      "jobTitle": "Sports Scientist & Strength and Conditioning Coach"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "CY",
      "addressLocality": "Cyprus"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "email": "info@smartygym.com",
      "availableLanguage": ["English", "Greek"]
    },
    "sameAs": [
      "https://www.instagram.com/smartygym",
      "https://www.facebook.com/smartygym",
      "https://www.youtube.com/@smartygym"
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
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "author": {
      "@type": "Person",
      "name": "Haris Falas",
      "jobTitle": "Sports Scientist & Strength and Conditioning Coach"
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
    }
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
    "url": `https://smartygym.com${tool.url}`
  };
};
