// This file will be dynamically imported to extract hardcoded workout data for migration
// After migration, the app will use database data instead

export const getHardcodedWorkouts = () => {
  // This function returns a promise to avoid blocking
  return import("@/pages/IndividualWorkout").then(() => {
    // The workout data is embedded in the component
    // For migration, we'll need to manually extract this data
    // or use the admin backoffice to add workouts individually
    return [];
  });
};

export const getHardcodedPrograms = () => {
  return import("@/pages/IndividualTrainingProgram").then(() => {
    // The program data is embedded in the component
    // For migration, we'll need to manually extract this data
    // or use the admin backoffice to add programs individually
    return [];
  });
};
