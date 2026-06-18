import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { validateGeneratedWorkoutContract } from "./generated-workout-contract.ts";

const LIB = [
  { id: "1160", name: "burpee" },
  { id: "1759", name: "single leg squat (pistol) male" },
  { id: "0514", name: "jump squat" },
  { id: "0699", name: "shoulder tap push-up" },
  { id: "0630", name: "mountain climber" },
  { id: "3361", name: "skater hops" },
  { id: "1273", name: "clap push up" },
  { id: "1366", name: "upward facing dog" },
  { id: "1604", name: "world greatest stretch" },
  { id: "1494", name: "butterfly yoga pose" },
  { id: "3021", name: "scapula push-up" },
  { id: "glute-bridge", name: "Glute Bridge" },
];

const VALID_HTML = `
<p class="tiptap-paragraph">🧽 <strong><u>Soft Tissue Preparation</u></strong></p>
<ul class="tiptap-bullet-list">
  <li class="tiptap-list-item"><p class="tiptap-paragraph">Foam roll quads for 60 seconds</p></li>
  <li class="tiptap-list-item"><p class="tiptap-paragraph">Lacrosse ball release on glutes for 60 seconds</p></li>
</ul>
<p class="tiptap-paragraph">🔥 <strong><u>Activation</u></strong></p>
<ul class="tiptap-bullet-list">
  <li class="tiptap-list-item"><p class="tiptap-paragraph">12 reps {{exercise:3021:scapula push-up}}</p></li>
</ul>
<p class="tiptap-paragraph">💪 <strong><u>Main Workout (FOR TIME)</u></strong></p>
<ul class="tiptap-bullet-list">
  <li class="tiptap-list-item"><p class="tiptap-paragraph">20 reps {{exercise:1160:burpee}}</p></li>
  <li class="tiptap-list-item"><p class="tiptap-paragraph">10 reps {{exercise:1759:single leg squat (pistol) male}}</p></li>
  <li class="tiptap-list-item"><p class="tiptap-paragraph">15 reps {{exercise:0514:jump squat}}</p></li>
</ul>
<p class="tiptap-paragraph">⚡ <strong><u>Finisher (FOR TIME)</u></strong></p>
<ul class="tiptap-bullet-list">
  <li class="tiptap-list-item"><p class="tiptap-paragraph">50 reps {{exercise:3361:skater hops}}</p></li>
  <li class="tiptap-list-item"><p class="tiptap-paragraph">30 reps {{exercise:1273:clap push up}}</p></li>
  <li class="tiptap-list-item"><p class="tiptap-paragraph">40 reps {{exercise:0630:mountain climber}}</p></li>
</ul>
<p class="tiptap-paragraph">🧘 <strong><u>Cool Down</u></strong></p>
<ul class="tiptap-bullet-list">
  <li class="tiptap-list-item"><p class="tiptap-paragraph">1 min {{exercise:1366:upward facing dog}}</p></li>
  <li class="tiptap-list-item"><p class="tiptap-paragraph">2 min {{exercise:1494:butterfly yoga pose}}</p></li>
</ul>
`;

Deno.test("contract: clean workout passes", () => {
  const r = validateGeneratedWorkoutContract(VALID_HTML, LIB);
  assertEquals(r.ok, true, r.failures.join(" | "));
});

Deno.test("contract: fake slug ID is rejected (bird-dog)", () => {
  const html = VALID_HTML.replace(
    "{{exercise:3021:scapula push-up}}",
    "{{exercise:bird-dog:Bird Dog}}",
  );
  const r = validateGeneratedWorkoutContract(html, LIB);
  assertEquals(r.ok, false);
  assertEquals(r.failures.some((f) => f.includes("fake/slug")), true);
});

Deno.test("contract: real library slug IDs are accepted", () => {
  const html = VALID_HTML.replace(
    "{{exercise:3021:scapula push-up}}",
    "{{exercise:glute-bridge:Glute Bridge}}",
  );
  const r = validateGeneratedWorkoutContract(html, LIB);
  assertEquals(r.ok, true, r.failures.join(" | "));
});

Deno.test("contract: missing library ID is rejected", () => {
  const html = VALID_HTML.replace(
    "{{exercise:1160:burpee}}",
    "{{exercise:9999:burpee}}",
  );
  const r = validateGeneratedWorkoutContract(html, LIB);
  assertEquals(r.ok, false);
  assertEquals(r.failures.some((f) => f.includes("does not exist in the library")), true);
});

Deno.test("contract: soft tissue with exercise token is rejected", () => {
  const html = VALID_HTML.replace(
    "Foam roll quads for 60 seconds",
    "10 reps {{exercise:1160:burpee}}",
  );
  const r = validateGeneratedWorkoutContract(html, LIB);
  assertEquals(r.ok, false);
  assertEquals(r.failures.some((f) => f.includes("Soft Tissue Preparation (🧽) contains library exercise tokens")), true);
});

Deno.test("contract: soft tissue with stretch/movement is rejected", () => {
  const html = VALID_HTML.replace(
    "Foam roll quads for 60 seconds",
    "Hamstring stretch for 60 seconds",
  );
  const r = validateGeneratedWorkoutContract(html, LIB);
  assertEquals(r.ok, false);
});

Deno.test("contract: plain exercise line in main workout is rejected", () => {
  const html = VALID_HTML.replace(
    "<li class=\"tiptap-list-item\"><p class=\"tiptap-paragraph\">20 reps {{exercise:1160:burpee}}</p></li>",
    "<li class=\"tiptap-list-item\"><p class=\"tiptap-paragraph\">20 reps Burpee</p></li>",
  );
  const r = validateGeneratedWorkoutContract(html, LIB);
  assertEquals(r.ok, false);
  assertEquals(r.failures.some((f) => f.includes("plain exercise line without a library link")), true);
});

Deno.test("contract: main workout line without prescription before token is rejected", () => {
  const html = VALID_HTML.replace(
    "20 reps {{exercise:1160:burpee}}",
    "{{exercise:1160:burpee}} 20 reps",
  );
  const r = validateGeneratedWorkoutContract(html, LIB);
  assertEquals(r.ok, false);
  assertEquals(r.failures.some((f) => f.includes("missing reps/time/sets before the token")), true);
});

Deno.test("contract: missing soft tissue section is rejected", () => {
  const html = VALID_HTML.replace(/🧽[\s\S]*?(?=🔥)/, "");
  const r = validateGeneratedWorkoutContract(html, LIB);
  assertEquals(r.ok, false);
  assertEquals(r.failures.some((f) => f.includes("Soft Tissue Preparation")), true);
});

Deno.test("contract: token name mismatch is rejected", () => {
  const html = VALID_HTML.replace(
    "{{exercise:1160:burpee}}",
    "{{exercise:1160:Super Burpee Slam}}",
  );
  const r = validateGeneratedWorkoutContract(html, LIB);
  assertEquals(r.ok, false);
  assertEquals(r.failures.some((f) => f.includes("does not match library name")), true);
});