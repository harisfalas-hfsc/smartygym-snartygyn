// Helper script to convert workoutData object to array format
// Run this in browser console on the IndividualWorkout page

// Copy this function and run it in the browser console
function extractWorkoutData() {
  // This will need to be run in the context where workoutData is defined
  // Open Dev Tools on /workout/challenge/challenge-002 page
  // Then paste this function and call it
  
  console.log(`
To extract your workout data:

1. Open Dev Mode (top left toggle)
2. Open src/pages/IndividualWorkout.tsx
3. Find the workoutData object (around line 197)
4. Copy from line 218 (start of object) to line 4560 (end of object)
5. Use this transformation:

// Original format:
const workoutData = {
  "challenge-002": { name: "...", ... },
  "challenge-003": { name: "...", ... }
};

// Convert to array format:
const workoutArray = Object.entries(workoutData).map(([id, data]) => ({
  id,
  ...data
}));

console.log(JSON.stringify(workoutArray, null, 2));

6. Copy the output and paste it into the "Workout Data JSON" field in the Content Importer
`);
}

// Instructions for programs
function extractProgramData() {
  console.log(`
To extract your program data:

1. Open src/pages/IndividualTrainingProgram.tsx  
2. Find the programData object (around line 57)
3. Copy the entire object
4. Use this transformation:

const programArray = Object.entries(programData).map(([id, data]) => ({
  id,
  ...data
}));

console.log(JSON.stringify(programArray, null, 2));

5. Copy the output and paste it into the "Program Data JSON" field
`);
}

console.log("Migration helper loaded. Run extractWorkoutData() or extractProgramData() for instructions.");
