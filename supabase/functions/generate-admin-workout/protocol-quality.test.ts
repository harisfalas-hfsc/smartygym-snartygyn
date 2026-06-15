import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { sanitizeProtocolBlocks } from "../_shared/protocol-sanitizer.ts";
import { applyWodQualityGate } from "../_shared/wod-quality-gate.ts";

Deno.test("sanitizer removes duplicated exercise names after library tokens", () => {
  const input = `<p class="tiptap-paragraph">12 reps {{exercise:0001:Scapula Push-up}}:Scapula Push-up</p>`;
  const result = sanitizeProtocolBlocks(input);

  assertEquals(result.flaggedForReview.length, 0);
  assertEquals(result.cleaned.includes("}}:Scapula Push-up"), false);
  assertEquals(result.cleaned, `<p class="tiptap-paragraph">12 reps {{exercise:0001:Scapula Push-up}}</p>`);
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