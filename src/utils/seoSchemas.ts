/**
 * Comprehensive SEO Schema Generators for SmartyGym
 * All JSON-LD structured data for Google, AI search, and rich results
 */

// FAQ Schema for FAQ pages
export const generateFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

// HowTo Schema for workout instructions
export const generateHowToSchema = (howTo: {
  name: string;
  description: string;
  totalTime: string;
  steps: Array<{ name: string; text: string; image?: string }>;
  imageUrl?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": howTo.name,
  "description": howTo.description,
  "totalTime": howTo.totalTime,
  "image": howTo.imageUrl,
  "step": howTo.steps.map((step, index) => ({
    "@type": "HowToStep",
    "position": index + 1,
    "name": step.name,
    "text": step.text,
    "image": step.image
  })),
  "author": {
    "@type": "Person",
    "name": "Haris Falas",
    "jobTitle": "Sports Scientist"
  }
});

// Fitness Center / Health Club Schema
export const generateFitnessCenterSchemaFull = () => ({
  "@context": "https://schema.org",
  "@type": "HealthClub",
  "@id": "https://smartygym.com/#organization",
  "name": "SmartyGym",
  "alternateName": ["Smarty Gym", "SmartyGym Online", "HFSC Performance", "smartygym.com"],
  "description": "Global online fitness platform with 500+ expert-designed workouts and training programs. 100% human-designed by Sports Scientist Haris Falas. Train anywhere, anytime.",
  "url": "https://smartygym.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://smartygym.com/smarty-gym-logo.png",
    "width": 512,
    "height": 512
  },
  "image": "https://smartygym.com/smarty-gym-logo.png",
  "priceRange": "€€",
  "currenciesAccepted": "EUR",
  "paymentAccepted": "Credit Card, Debit Card",
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    "opens": "00:00",
    "closes": "23:59"
  },
  "areaServed": {
    "@type": "Place",
    "name": "Worldwide"
  },
  "serviceType": ["Online Fitness Training", "Workout Programs", "Training Programs", "Fitness Calculators"],
  "amenityFeature": [
    { "@type": "LocationFeatureSpecification", "name": "500+ Expert Workouts", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Multi-Week Training Programs", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Fitness Calculators", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Exercise Library", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Daily Workout of the Day", "value": true }
  ],
  "founder": {
    "@type": "Person",
    "name": "Haris Falas",
    "jobTitle": "Sports Scientist & Strength and Conditioning Coach",
    "description": "BSc Sports Science, CSCS certified with 20+ years experience",
    "sameAs": ["https://smartygym.com/coach-profile"]
  },
  "sameAs": [
    "https://www.instagram.com/smartygymcy/",
    "https://www.youtube.com/@TheSmartyGym",
    "https://www.facebook.com/smartygym"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Support",
    "url": "https://smartygym.com/contact",
    "availableLanguage": ["English", "Greek"]
  }
});

// Person Schema for Haris Falas (comprehensive)
export const generateHarisFalasSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://smartygym.com/coach-profile#person",
  "name": "Haris Falas",
  "alternateName": ["Coach Haris", "HFSC"],
  "jobTitle": "Sports Scientist & Strength and Conditioning Coach",
  "description": "BSc Sports Science and CSCS certified coach with 20+ years experience. Founder of SmartyGym - leading online fitness platform with 100% human-designed workouts and training programs.",
  "image": "https://smartygym.com/haris-falas-coach.png",
  "url": "https://smartygym.com/coach-profile",
  "sameAs": [
    "https://smartygym.com",
    "https://www.instagram.com/smartygymcy/"
  ],
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
    "Strength Training",
    "Sports Science",
    "Functional Fitness",
    "Exercise Physiology",
    "Program Design",
    "Metabolic Conditioning",
    "Mobility Training",
    "HIIT Training",
    "Athletic Performance",
    "Evidence-Based Training",
    "Periodization",
    "Progressive Overload"
  ],
  "worksFor": {
    "@type": "Organization",
    "name": "SmartyGym",
    "url": "https://smartygym.com"
  },
  "award": "20+ Years Coaching Experience",
  "makesOffer": [
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Online Workouts",
        "description": "500+ expert-designed workout sessions"
      }
    },
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Training Programs",
        "description": "Multi-week structured training programs"
      }
    }
  ]
});

// Subscription/Product Schema with more detail
export const generateSubscriptionProductSchema = (plan: 'gold' | 'platinum') => {
  const plans = {
    gold: {
      name: "SmartyGym Gold Plan",
      description: "Monthly premium membership with unlimited access to 500+ workouts, all training programs, fitness calculators, and exercise library. Cancel anytime.",
      price: "9.99",
      billingDuration: "P1M",
      features: ["Unlimited Workouts", "All Training Programs", "Fitness Calculators", "Exercise Library", "Flexible Monthly Billing"]
    },
    platinum: {
      name: "SmartyGym Platinum Plan",
      description: "Yearly premium membership with unlimited access to everything in Gold plus 25% savings. Best value for committed fitness enthusiasts.",
      price: "89.99",
      billingDuration: "P1Y",
      features: ["Everything in Gold", "25% Savings", "Lock in Rate for 12 Months", "Priority Support", "Best Value"]
    }
  };

  const p = plans[plan];

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": p.name,
    "description": p.description,
    "brand": {
      "@type": "Brand",
      "name": "SmartyGym"
    },
    "offers": {
      "@type": "Offer",
      "price": p.price,
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "url": "https://smartygym.com/join-premium",
      "priceValidUntil": "2026-12-31",
      "seller": {
        "@type": "Organization",
        "name": "SmartyGym"
      }
    },
    "category": "Online Fitness Membership",
    "additionalProperty": p.features.map(feature => ({
      "@type": "PropertyValue",
      "name": "Feature",
      "value": feature
    }))
  };
};

// Video Object Schema for workout videos
export const generateVideoSchema = (video: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration: string;
  contentUrl?: string;
  embedUrl?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": video.name,
  "description": video.description,
  "thumbnailUrl": video.thumbnailUrl,
  "uploadDate": video.uploadDate,
  "duration": video.duration,
  "contentUrl": video.contentUrl,
  "embedUrl": video.embedUrl,
  "author": {
    "@type": "Person",
    "name": "Haris Falas"
  },
  "publisher": {
    "@type": "Organization",
    "name": "SmartyGym",
    "logo": {
      "@type": "ImageObject",
      "url": "https://smartygym.com/smarty-gym-logo.png"
    }
  }
});

// Service Schema for fitness services
export const generateServiceSchema = (service: {
  name: string;
  description: string;
  url: string;
  category: string;
  price?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": service.name,
  "description": service.description,
  "url": `https://smartygym.com${service.url}`,
  "serviceType": service.category,
  "provider": {
    "@type": "Organization",
    "name": "SmartyGym",
    "url": "https://smartygym.com"
  },
  "areaServed": {
    "@type": "Place",
    "name": "Worldwide"
  },
  ...(service.price && {
    "offers": {
      "@type": "Offer",
      "price": service.price,
      "priceCurrency": "EUR"
    }
  })
});

// ItemList Schema for category pages
export const generateItemListSchema = (items: Array<{
  name: string;
  description: string;
  url: string;
  position: number;
}>) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "SmartyGym Content",
  "itemListElement": items.map(item => ({
    "@type": "ListItem",
    "position": item.position,
    "item": {
      "@type": "Thing",
      "name": item.name,
      "description": item.description,
      "url": `https://smartygym.com${item.url}`
    }
  }))
});

// CollectionPage Schema
export const generateCollectionPageSchema = (collection: {
  name: string;
  description: string;
  url: string;
  itemCount: number;
}) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": collection.name,
  "description": collection.description,
  "url": `https://smartygym.com${collection.url}`,
  "numberOfItems": collection.itemCount,
  "provider": {
    "@type": "Organization",
    "name": "SmartyGym"
  },
  "author": {
    "@type": "Person",
    "name": "Haris Falas"
  }
});

// WebPage Schema
export const generateWebPageSchema = (page: {
  name: string;
  description: string;
  url: string;
  dateModified?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": page.name,
  "description": page.description,
  "url": `https://smartygym.com${page.url}`,
  "dateModified": page.dateModified || new Date().toISOString().split('T')[0],
  "isPartOf": {
    "@type": "WebSite",
    "name": "SmartyGym",
    "url": "https://smartygym.com"
  },
  "publisher": {
    "@type": "Organization",
    "name": "SmartyGym"
  }
});

// SiteNavigationElement for navigation
export const generateNavigationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "SiteNavigationElement",
  "name": "Main Navigation",
  "hasPart": [
    { "@type": "WebPage", "name": "Workouts", "url": "https://smartygym.com/workout" },
    { "@type": "WebPage", "name": "Training Programs", "url": "https://smartygym.com/trainingprogram" },
    { "@type": "WebPage", "name": "Tools", "url": "https://smartygym.com/tools" },
    { "@type": "WebPage", "name": "Blog", "url": "https://smartygym.com/blog" },
    { "@type": "WebPage", "name": "Coach Profile", "url": "https://smartygym.com/coach-profile" },
    { "@type": "WebPage", "name": "Premium", "url": "https://smartygym.com/join-premium" }
  ]
});

// SoftwareApplication Schema for web app
export const generateWebAppSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "SmartyGym",
  "alternateName": "SmartyGym Online Fitness Platform",
  "description": "Global online fitness platform with 500+ workouts and training programs by Sports Scientist Haris Falas",
  "url": "https://smartygym.com",
  "applicationCategory": "HealthApplication",
  "operatingSystem": "Web Browser",
  "browserRequirements": "Requires JavaScript",
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "0",
    "highPrice": "89.99",
    "priceCurrency": "EUR",
    "offerCount": 3
  },
  "author": {
    "@type": "Organization",
    "name": "SmartyGym"
  },
  "screenshot": "https://smartygym.com/smarty-gym-logo.png",
  "featureList": [
    "500+ Expert Workouts",
    "Multi-Week Training Programs",
    "Fitness Calculators",
    "Exercise Library",
    "Daily Workout of the Day",
    "Progress Tracking"
  ]
});