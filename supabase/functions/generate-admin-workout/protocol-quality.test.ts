import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { sanitizeProtocolBlocks } from "../_shared/protocol-sanitizer.ts";
import { applyWodQualityGate } from "../_shared/wod-quality-gate.ts";
import { guaranteeAllExercisesLinked, rejectNonLibraryExercises } from "../_shared/exercise-matching.ts";

Deno.test("sanitizer removes duplicated exercise names after library tokens", () => {
  const input = `<p class="tiptap-paragraph">12 reps {{exercise:0001:Scapula Push-up}}:Scapula Push-up</p>`;
  const result = sanitizeProtocolBlocks(input);

  assertEquals(result.flaggedForReview.length, 0);
  assertEquals(result.cleaned.includes("}}:Scapula Push-up"), false);
  assertEquals(result.cleaned, `<p class="tiptap-paragraph">12 reps {{exercise:0001:Scapula Push-up}}</p>`);
});

Deno.test("sanitizer accepts side and per-limb qualifiers after library tokens", () => {
  const input = `<p class="tiptap-paragraph">10 reps {{exercise:0002:Bird Dog}} (alternating sides)</p><p class="tiptap-paragraph">50 reps {{exercise:0003:Leg Slide}} (50 each leg)</p><p class="tiptap-paragraph">30 sec {{exercise:0004:Side Plank}} (right side)</p>`;
  const result = sanitizeProtocolBlocks(input);

  assertEquals(result.flaggedForReview.length, 0);
  assertEquals(result.cleaned, input);
});

Deno.test("quality gate accepts EMOM minute labels with repeat rounds", () => {
  const html = `
    <p class="tiptap-paragraph">💪 <strong><u>Main Workout (EMOM)</u></strong></p>
    <p class="tiptap-paragraph">Repeat 5 rounds.</p>
    <ul class="tiptap-bullet-list">
      <li class="tiptap-list-item"><p class="tiptap-paragraph"><strong>Minute 1:</strong> 10 reps {{exercise:0001:Power Clean}}</p></li>
      <li class="tiptap-list-item"><p class="tiptap-paragraph"><strong>Minute 2:</strong> 12 reps {{exercise:0002:Burpee}}</p></li>
      <li class="tiptap-list-item"><p class="tiptap-paragraph"><strong>Minute 3:</strong> 10 reps {{exercise:0003:Trap Bar Deadlift}}</p></li>
      <li class="tiptap-list-item"><p class="tiptap-paragraph"><strong>Minute 4:</strong> 12 reps {{exercise:0004:Scapula Push-up}}</p></li>
      <li class="tiptap-list-item"><p class="tiptap-paragraph"><strong>Minute 5:</strong> 200m {{exercise:0005:Run}}</p></li>
      <li class="tiptap-list-item"><p class="tiptap-paragraph"><strong>Minute 6:</strong> 12 reps {{exercise:0006:Box Jump}}</p></li>
    </ul>
    <p class="tiptap-paragraph">⚡ <strong><u>Finisher (AMRAP)</u></strong></p>
    <p class="tiptap-paragraph">12-minute AMRAP.</p>
    <ul class="tiptap-bullet-list">
      <li class="tiptap-list-item"><p class="tiptap-paragraph">12 reps {{exercise:0007:Mountain Climber}}</p></li>
      <li class="tiptap-list-item"><p class="tiptap-paragraph">10 reps {{exercise:0008:Push-up}}</p></li>
      <li class="tiptap-list-item"><p class="tiptap-paragraph">8 reps {{exercise:0009:Jump Squat}}</p></li>
    </ul>
    <p class="tiptap-paragraph">🧘 <strong><u>Cool Down 5'</u></strong></p>
  `;

  const result = applyWodQualityGate({
    mainWorkoutHtml: html,
    category: "CHALLENGE",
    difficultyStars: 6,
    format: "EMOM",
    isRecoveryDay: false,
  });

  assertEquals(result.ok, true);
});

Deno.test("sanitizer rebuilds loose EMOM minute paragraphs in order", () => {
  const input = `<p class="tiptap-paragraph">💪 <strong><u>Main Workout (EMOM)</u></strong></p><p class="tiptap-paragraph">Repeat 5 rounds.</p><ul class="tiptap-bullet-list"><li class="tiptap-list-item"><p class="tiptap-paragraph">Minute 4: 45 sec {{exercise:0630:mountain climber}}</p></li></ul><p class="tiptap-paragraph">Minute 1: 12 reps {{exercise:1160:burpee}}</p><p class="tiptap-paragraph">Minute 2: 20 reps {{exercise:0283:diamond push-up}}</p><p class="tiptap-paragraph">Minute 3: 15 reps {{exercise:0514:jump squat}}</p><p class="tiptap-paragraph">Minute 5: 10 reps {{exercise:3662:pike-to-cobra push-up}}</p><p class="tiptap-paragraph">🧘 <strong><u>Cool Down 5'</u></strong></p>`;

  const result = sanitizeProtocolBlocks(input);
  const minutePositions = [1, 2, 3, 4, 5].map((n) => result.cleaned.indexOf(`Minute ${n}:`));

  assertEquals(minutePositions.every((pos) => pos >= 0), true);
  assertEquals(minutePositions, [...minutePositions].sort((a, b) => a - b));
  assertEquals(result.cleaned.includes(`<p class="tiptap-paragraph">Minute 1:`), false);
});

Deno.test("final exercise linking preserves leading rep prescriptions", () => {
  const library = [
    { id: "1759", name: "single leg squat (pistol) male", body_part: "legs", equipment: "body weight", target: "quads" },
    { id: "3663", name: "reverse plank with leg lift", body_part: "core", equipment: "body weight", target: "abs" },
  ];
  const input = `<ul class="tiptap-bullet-list"><li class="tiptap-list-item"><p class="tiptap-paragraph">10 reps single leg squat (pistol) male (5 per side)</p></li><li class="tiptap-list-item"><p class="tiptap-paragraph">10 reps reverse plank with leg lift (5 per side)</p></li></ul>`;

  const result = guaranteeAllExercisesLinked(input, library, "[TEST]");

  assertEquals(result.processedContent.includes("10 reps {{exercise:1759:single leg squat (pistol) male}} (5 per side)"), true);
  assertEquals(result.processedContent.includes("10 reps {{exercise:3663:reverse plank with leg lift}} (5 per side)"), true);
  assertEquals(result.processedContent.includes("10 {{exercise:"), false);
});

Deno.test("non-library rejection substitution preserves leading rep prescriptions", () => {
  const library = [
    { id: "1759", name: "single leg squat (pistol) male", body_part: "legs", equipment: "body weight", target: "quads" },
  ];
  const input = `<ul class="tiptap-bullet-list"><li class="tiptap-list-item"><p class="tiptap-paragraph">10 reps single leg squat (pistol) male (5 per side)</p></li></ul>`;

  const result = rejectNonLibraryExercises(input, library, "[TEST]");

  assertEquals(result.processedContent.includes("10 reps {{exercise:1759:single leg squat (pistol) male}} (5 per side)"), true);
  assertEquals(result.processedContent.includes("10 {{exercise:"), false);
});