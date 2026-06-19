import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { buildExerciseReferenceList } from "./exercise-matching.ts";
import { filterLibraryForProgram, pickExercisesForDay, type LibExercise } from "./program-exercise-picker.ts";

const LIBRARY: LibExercise[] = [
  { id: "bw-adv-push", name: "push-up", body_part: "chest", equipment: "body weight", target: "pectorals", difficulty: "Advanced" },
  { id: "bw-adv-front-lever", name: "front lever reps", body_part: "back", equipment: "body weight", target: "lats", difficulty: "Advanced" },
  { id: "eq-adv-chest", name: "barbell bench press", body_part: "chest", equipment: "barbell", target: "pectorals", difficulty: "Advanced" },
  { id: "eq-adv-triceps", name: "barbell jm bench press", body_part: "upper arms", equipment: "barbell", target: "triceps", difficulty: "Advanced" },
  { id: "eq-adv-biceps", name: "biceps narrow pull-up", body_part: "back", equipment: "pull-up bar", target: "biceps", difficulty: "Advanced" },
  { id: "eq-adv-back", name: "lat pulldown", body_part: "back", equipment: "cable", target: "lats", difficulty: "Advanced" },
  { id: "eq-beg-chest", name: "machine chest press", body_part: "chest", equipment: "machine", target: "pectorals", difficulty: "Beginner" },
];

Deno.test("program picker: equipment mode never falls back to bodyweight and difficulty is exact", () => {
  const equipmentAdvanced = filterLibraryForProgram(LIBRARY, "Equipment", "Advanced");

  assertEquals(equipmentAdvanced.every((ex) => ex.equipment !== "body weight"), true);
  assertEquals(equipmentAdvanced.every((ex) => ex.difficulty === "Advanced"), true);
  assertEquals(equipmentAdvanced.some((ex) => ex.id === "eq-beg-chest"), false);
  assertEquals(equipmentAdvanced.some((ex) => ex.id === "bw-adv-push"), false);
});

Deno.test("program picker: bodyweight mode excludes equipment and apparatus-dependent bodyweight", () => {
  const bodyweightAdvanced = filterLibraryForProgram(LIBRARY, "Bodyweight", "Advanced");

  assertEquals(bodyweightAdvanced.map((ex) => ex.id), ["bw-adv-push"]);
});

Deno.test("program picker: triceps focus does not match biceps substring inside triceps", () => {
  const equipmentAdvanced = filterLibraryForProgram(LIBRARY, "Equipment", "Advanced");
  const picks = pickExercisesForDay(equipmentAdvanced, "Chest & Triceps", 1, 1, 10);
  const pickedIds = picks.map((ex) => ex.id);

  assert(pickedIds.includes("eq-adv-chest"));
  assert(pickedIds.includes("eq-adv-triceps"));
  assertEquals(pickedIds.includes("eq-adv-biceps"), false);
  assertEquals(pickedIds.includes("eq-adv-back"), false);
});

Deno.test("workout reference list: non-bodyweight and strict difficulty filter remove wrong pools", () => {
  const ref = buildExerciseReferenceList(LIBRARY as any, "non-bodyweight", "advanced");

  assert(ref.includes("barbell bench press"));
  assertEquals(ref.includes("push-up"), false);
  assertEquals(ref.includes("machine chest press"), false);
});