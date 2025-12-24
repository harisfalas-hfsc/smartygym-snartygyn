import { Link } from "react-router-dom";
import { Dumbbell, ArrowRight } from "lucide-react";

export const ExerciseLibraryBanner = () => {
  return (
    <Link
      to="/exerciselibrary"
      className="flex items-center gap-3 p-4 mb-4 bg-primary/10 border-l-4 border-primary rounded-r-lg hover:bg-primary/15 transition-all group"
    >
      <Dumbbell className="h-5 w-5 text-primary flex-shrink-0" />
      <p className="text-base flex-1">
        <strong className="font-semibold group-hover:underline">Visit our Exercise Library</strong> for instructions and demonstration of each exercise.
      </p>
      <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0" />
    </Link>
  );
};
