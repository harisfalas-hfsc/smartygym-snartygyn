import { describe, expect, it } from "vitest";
import { parseWorkoutSteps } from "./parseWorkoutSteps";

describe("parseWorkoutSteps", () => {
  it("keeps embedded workout phases when all content is stored in one field", () => {
    const html = `
      <p class="tiptap-paragraph">🔥 <strong><u>Activation (7 minutes)</u></strong></p>
      <ul class="tiptap-bullet-list">
        <li class="tiptap-list-item"><p class="tiptap-paragraph">{{exercise:ankle-circles:ankle circles}} – 60 seconds</p></li>
      </ul>
      <p class="tiptap-paragraph">💪 <strong><u>Main Workout (20 minutes)</u></strong></p>
      <p class="tiptap-paragraph">Tabata Block 1 (8 minutes)</p>
      <ul class="tiptap-bullet-list">
        <li class="tiptap-list-item"><p class="tiptap-paragraph">{{exercise:0699:shoulder tap push-up}} – 20 seconds work</p></li>
        <li class="tiptap-list-item"><p class="tiptap-paragraph">{{exercise:0534:kettlebell goblet squat}} – 20 seconds work</p></li>
      </ul>
      <p class="tiptap-paragraph">⚡ <strong><u>Finisher (10 minutes)</u></strong></p>
      <ul class="tiptap-bullet-list">
        <li class="tiptap-list-item"><p class="tiptap-paragraph">40 seconds {{exercise:0685:run}}</p></li>
        <li class="tiptap-list-item"><p class="tiptap-paragraph">30 seconds {{exercise:high-knees:High Knees}}</p></li>
        <li class="tiptap-list-item"><p class="tiptap-paragraph">10 reps {{exercise:0514:jump squat}}</p></li>
        <li class="tiptap-list-item"><p class="tiptap-paragraph">40 seconds {{exercise:jumping-jacks:Jumping Jacks}}</p></li>
      </ul>
      <p class="tiptap-paragraph">🧘 <strong><u>Cool</u></strong></p>
      <ul class="tiptap-bullet-list">
        <li class="tiptap-list-item"><p class="tiptap-paragraph">{{exercise:childs-pose:Child's Pose}} – 60 seconds</p></li>
      </ul>
    `;

    const steps = parseWorkoutSteps(html);

    expect(steps.map((step) => step.section)).toEqual([
      "Activation",
      "Main Workout",
      "Main Workout",
      "Finisher",
      "Finisher",
      "Finisher",
      "Finisher",
      "Cool-down",
    ]);
    expect(steps[1].subSection).toBe("Tabata Block 1 (8 minutes)");
    expect(steps.filter((step) => step.section === "Finisher")).toHaveLength(4);
  });
});