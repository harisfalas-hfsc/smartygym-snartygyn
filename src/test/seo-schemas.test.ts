import { describe, it, expect } from "vitest";
import {
  generateExercisePlanSchema,
  generateCourseSchema,
  generatePersonSchema,
  generateOrganizationSchema,
  generateBrandDisambiguationSchema,
  generateHarisFalasEnhancedSchema,
} from "@/utils/seoHelpers";
import {
  generateFAQSchema,
  generateHowToSchema,
  generateFitnessCenterSchemaFull,
  generateHarisFalasSchema,
  generateSubscriptionProductSchema,
  generateVideoSchema,
  generateServiceSchema,
  generateItemListSchema,
  generateCollectionPageSchema,
  generateWebPageSchema,
  generateNavigationSchema,
  generateWebAppSchema,
  generateServicesArraySchema,
  generateBlogSchema,
} from "@/utils/seoSchemas";

/**
 * Validates that a JSON-LD schema object is well-formed: serializable,
 * has @context + @type (or @graph), and required fields per type.
 */
function assertValidSchema(schema: any, requiredFields: string[] = []) {
  // Must serialize cleanly (no circular refs, no undefined that breaks JSON).
  const json = JSON.stringify(schema);
  expect(json).toBeTruthy();
  const parsed = JSON.parse(json);

  expect(parsed["@context"]).toBe("https://schema.org");
  // Either a typed node or a @graph container
  expect(parsed["@type"] || parsed["@graph"]).toBeTruthy();

  for (const field of requiredFields) {
    expect(parsed[field], `missing required field: ${field}`).toBeTruthy();
  }
}

describe("SEO schema generators", () => {
  it("ExercisePlan: valid + required fields", () => {
    const schema = generateExercisePlanSchema({
      name: "Test Workout",
      category: "Strength",
      duration: "PT30M",
      difficulty: "Intermediate",
      equipment: "Bodyweight",
      url: "/workout/test",
    });
    assertValidSchema(schema, ["name", "creator", "url"]);
    expect(schema["@type"]).toBe("ExercisePlan");
    expect(schema.creator.name).toBe("Haris Falas");
  });

  it("Course: valid + required fields", () => {
    const schema = generateCourseSchema({
      name: "Test Program",
      category: "Strength",
      weeks: 8,
      difficulty: "Intermediate",
      equipment: "Mixed",
      url: "/trainingprogram/test",
    });
    assertValidSchema(schema, ["name", "provider", "url"]);
    expect(schema["@type"]).toBe("Course");
    expect(schema.timeRequired).toBe("P8W");
  });

  it("Person (Haris Falas): valid + credentials", () => {
    const schema = generatePersonSchema();
    assertValidSchema(schema, ["name", "jobTitle", "hasCredential"]);
    expect(schema.name).toBe("Haris Falas");
    expect(Array.isArray(schema.hasCredential)).toBe(true);
    expect(schema.hasCredential.length).toBeGreaterThan(0);
  });

  it("Organization (SmartyGym): valid + sameAs", () => {
    const schema = generateOrganizationSchema();
    assertValidSchema(schema, ["name", "url", "logo"]);
    expect(schema.name).toBe("SmartyGym");
    expect(Array.isArray(schema.sameAs)).toBe(true);
  });

  it("Brand disambiguation schema is valid", () => {
    const schema = generateBrandDisambiguationSchema();
    assertValidSchema(schema, ["name", "founder"]);
    expect(schema["@type"]).toBe("Brand");
  });

  it("Enhanced Haris Falas schema is valid", () => {
    const schema = generateHarisFalasEnhancedSchema();
    assertValidSchema(schema, ["name", "hasCredential"]);
  });

  it("FAQPage: valid with mainEntity questions", () => {
    const schema = generateFAQSchema([
      { question: "Q1?", answer: "A1" },
      { question: "Q2?", answer: "A2" },
    ]);
    assertValidSchema(schema, ["mainEntity"]);
    expect(schema.mainEntity).toHaveLength(2);
    expect(schema.mainEntity[0]["@type"]).toBe("Question");
    expect(schema.mainEntity[0].acceptedAnswer["@type"]).toBe("Answer");
  });

  it("HowTo: valid with steps", () => {
    const schema = generateHowToSchema({
      name: "Test",
      description: "desc",
      totalTime: "PT10M",
      steps: [{ name: "Step 1", text: "do it" }],
    });
    assertValidSchema(schema, ["name", "step"]);
    expect(schema.step[0].position).toBe(1);
  });

  it("HealthClub (full): valid", () => {
    assertValidSchema(generateFitnessCenterSchemaFull(), ["name", "url"]);
  });

  it("Haris Falas (comprehensive): valid", () => {
    assertValidSchema(generateHarisFalasSchema(), ["name", "hasCredential"]);
  });

  it("Subscription Product (lifetime): valid with offers", () => {
    const schema = generateSubscriptionProductSchema("lifetime");
    assertValidSchema(schema, ["name", "offers"]);
    expect(schema.offers.priceCurrency).toBe("EUR");
    expect(Number(schema.offers.price)).toBeGreaterThan(0);
  });

  it("VideoObject: valid", () => {
    assertValidSchema(
      generateVideoSchema({
        name: "v",
        description: "d",
        thumbnailUrl: "t",
        uploadDate: "2025-01-01",
        duration: "PT5M",
      }),
      ["name", "thumbnailUrl"]
    );
  });

  it("Service / ItemList / CollectionPage / WebPage: valid", () => {
    assertValidSchema(
      generateServiceSchema({ name: "s", description: "d", url: "/s", category: "c" }),
      ["name", "url"]
    );
    assertValidSchema(
      generateItemListSchema([{ name: "a", description: "d", url: "/a", position: 1 }]),
      ["itemListElement"]
    );
    assertValidSchema(
      generateCollectionPageSchema({ name: "c", description: "d", url: "/c", itemCount: 5 }),
      ["name", "numberOfItems"]
    );
    assertValidSchema(
      generateWebPageSchema({ name: "w", description: "d", url: "/w" }),
      ["name", "url"]
    );
  });

  it("Navigation / WebApp / Services @graph / Blog: valid", () => {
    assertValidSchema(generateNavigationSchema(), ["name", "hasPart"]);
    assertValidSchema(generateWebAppSchema(), ["name", "url"]);
    const services = generateServicesArraySchema();
    expect(services["@graph"]).toBeTruthy();
    expect(Array.isArray(services["@graph"])).toBe(true);
    assertValidSchema(generateBlogSchema(), ["name", "url"]);
  });

  it("Schemas are JSON-serializable (no circular refs)", () => {
    expect(() => JSON.stringify(generateOrganizationSchema())).not.toThrow();
    expect(() => JSON.stringify(generatePersonSchema())).not.toThrow();
    expect(() => JSON.stringify(generateFitnessCenterSchemaFull())).not.toThrow();
  });
});
