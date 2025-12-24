import { Link } from "react-router-dom";
import { Dumbbell } from "lucide-react";

export const ExerciseLibraryBanner = () => {
  return (
    <Link
      to="/exerciselibrary"
      className="flex items-center gap-3 p-4 mb-4 bg-primary/10 border-l-4 border-primary rounded-r-lg hover:bg-primary/15 transition-colors group"
    >
      <Dumbbell className="h-5 w-5 text-primary flex-shrink-0" />
      <p className="text-base">
        <strong className="font-semibold">Visit our Exercise Library</strong> for instructions and demonstration of each exercise.
      </p>
    </Link>
  );
};
