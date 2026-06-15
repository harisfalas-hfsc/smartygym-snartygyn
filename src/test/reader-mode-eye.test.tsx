import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { ReaderModeDialog } from "@/components/ReaderModeDialog";
import { ExerciseHTMLContent } from "@/components/ExerciseHTMLContent";

describe("ReaderModeDialog exercise eye styling", () => {
  it("keeps exercise eye icons on the primary blue stroke inside reader mode", () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <ReaderModeDialog
          open
          onOpenChange={() => undefined}
          title="Reader check"
          content={
            <ExerciseHTMLContent
              content={'<ul><li>{{exercise:exercise-id:Bird Dog}}</li></ul>'}
              enableExerciseLinking
            />
          }
        />
      </QueryClientProvider>,
    );

    const eyeIcon = document.querySelector(
      ".reader-mode-light.prose .exercise-view-eye, .reader-mode-dark.prose .exercise-view-eye",
    );
    expect(eyeIcon).toBeInTheDocument();
    expect(eyeIcon).toHaveClass("text-primary");

    const styles = Array.from(document.querySelectorAll("style"))
      .map((style) => style.textContent || "")
      .join("\n");
    expect(styles).toContain("stroke: hsl(var(--primary)) !important");
  });
});