import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Flame,
  Dumbbell,
  CalendarRange,
  Wrench,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

type Option = {
  value: string;
  label: string;
  description: string;
  icon: LucideIcon;
  route: string;
};

const OPTIONS: Option[] = [
  {
    value: "/workout/wod",
    label: "Check the Workout of the Day",
    description: "Today's smart-coded WOD",
    icon: Flame,
    route: "/workout/wod",
  },
  {
    value: "/workout",
    label: "Train — Smarty Workouts",
    description: "Browse the workout library",
    icon: Dumbbell,
    route: "/workout",
  },
  {
    value: "/trainingprogram",
    label: "Training Programs",
    description: "Structured multi-week plans",
    icon: CalendarRange,
    route: "/trainingprogram",
  },
  {
    value: "/tools",
    label: "Use a Smarty Tool",
    description: "Calculators, timer, library",
    icon: Wrench,
    route: "/tools",
  },
  {
    value: "/blog",
    label: "Read a Blog Article",
    description: "Fitness, nutrition & wellness",
    icon: BookOpen,
    route: "/blog",
  },
];

const LandingRouter = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string>("");

  const go = () => {
    if (selected) navigate(selected);
  };

  const SelectedIcon =
    OPTIONS.find((o) => o.value === selected)?.icon ?? null;

  return (
    <>
      <Helmet>
        <title>Hello Smarty | Ready to crush your goal? — SmartyGym</title>
        <meta
          name="description"
          content="Hello Smarty — pick what you want to do today: Workout of the Day, Smarty Workouts, Training Programs, a Tool or a Blog article."
        />
      </Helmet>

      <main className="min-h-[calc(100vh-var(--app-header-h,100px))] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl mx-auto text-center space-y-10">
          <div className="space-y-4">
            <p className="text-sm md:text-base font-semibold tracking-[0.2em] uppercase text-primary">
              Hello, Smarty
            </p>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
              Ready to crush your goal?
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Pick your move. Let's give it a go.
            </p>
          </div>

          <div
            className="space-y-4"
            onKeyDown={(e) => {
              if (e.key === "Enter") go();
            }}
          >
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger
                className="h-16 text-base md:text-lg w-full pl-4"
                aria-label="Choose what you want to do today"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {SelectedIcon ? (
                    <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <SelectedIcon className="w-5 h-5 text-primary" />
                    </span>
                  ) : null}
                  <SelectValue placeholder="What do you want to do today?" />
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-[60vh]">
                {OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </span>
                        <div className="flex flex-col text-left">
                          <span className="font-medium leading-tight">
                            {opt.label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {opt.description}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <Button
              size="lg"
              className="w-full h-14 text-base md:text-lg"
              onClick={go}
              disabled={!selected}
            >
              Let's go
            </Button>
          </div>
        </div>
      </main>
    </>
  );
};

export default LandingRouter;