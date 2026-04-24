import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
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
  BicepsFlexed,
  type LucideIcon,
} from "lucide-react";

type Option = {
  value: string;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Tailwind classes for the icon chip (background + icon color). Use semantic-ish accents. */
  chip: string;
};

const OPTIONS: Option[] = [
  {
    value: "/workout/wod",
    label: "Check the Workout of the Day",
    description: "Today's smart-coded WOD",
    icon: Flame,
    chip: "bg-orange-500/15 text-orange-500 ring-1 ring-orange-500/30",
  },
  {
    value: "/workout",
    label: "Choose a Workout",
    description: "Browse the full workout library",
    icon: Dumbbell,
    chip: "bg-sky-500/15 text-sky-500 ring-1 ring-sky-500/30",
  },
  {
    value: "/trainingprogram",
    label: "Choose a Training Program",
    description: "Structured multi-week plans",
    icon: CalendarRange,
    chip: "bg-violet-500/15 text-violet-500 ring-1 ring-violet-500/30",
  },
  {
    value: "/tools",
    label: "Use a Smarty Tool",
    description: "Calculators, timer, library",
    icon: Wrench,
    chip: "bg-emerald-500/15 text-emerald-500 ring-1 ring-emerald-500/30",
  },
  {
    value: "/blog",
    label: "Read a Blog Article",
    description: "Fitness, nutrition & wellness",
    icon: BookOpen,
    chip: "bg-pink-500/15 text-pink-500 ring-1 ring-pink-500/30",
  },
];

const OptionRow = ({ opt, compact = false }: { opt: Option; compact?: boolean }) => {
  const Icon = opt.icon;
  return (
    <div className="flex items-center gap-3 min-w-0 w-full">
      <span
        className={`${compact ? "w-9 h-9" : "w-10 h-10"} rounded-full flex items-center justify-center shrink-0 ${opt.chip}`}
      >
        <Icon className={compact ? "w-4 h-4" : "w-5 h-5"} />
      </span>
      <div className="flex flex-col text-left min-w-0">
        <span className="font-medium leading-tight truncate">{opt.label}</span>
        <span className="text-xs text-muted-foreground truncate">
          {opt.description}
        </span>
      </div>
    </div>
  );
};

const LandingRouter = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string>("");

  // Show landing page once per browser tab session.
  // sessionStorage is tab-scoped and cleared when the tab closes,
  // so opening a fresh tab to "/" always shows the landing page again,
  // regardless of authentication state.
  if (typeof window !== "undefined") {
    if (sessionStorage.getItem("smarty_landing_seen") === "1") {
      return <Navigate to="/home" replace />;
    }
    sessionStorage.setItem("smarty_landing_seen", "1");
  }

  const go = () => {
    if (selected) navigate(selected);
  };

  return (
    <>
      <Helmet>
        <title>Hello Smarty | Ready to crush your goal? — SmartyGym</title>
        <meta
          name="description"
          content="Hello Smarty — pick what you want to do today: Workout of the Day, a Workout, a Training Program, a Tool or a Blog article."
        />
      </Helmet>

      <main className="min-h-[calc(100vh-var(--app-header-h,100px))] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl mx-auto text-center space-y-10">
          <div className="space-y-4">
            <p className="text-sm md:text-base font-semibold tracking-[0.2em] uppercase text-primary">
              Hello, Smarty
            </p>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
              <span className="inline-flex items-center gap-3 justify-center flex-wrap">
                <span className="w-11 h-11 md:w-14 md:h-14 rounded-full bg-primary/15 ring-1 ring-primary/30 inline-flex items-center justify-center shrink-0">
                  <BicepsFlexed className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                </span>
                Ready to crush your goal?
              </span>
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
                className="h-16 text-base md:text-lg w-full pl-3 pr-4 [&>span]:flex [&>span]:w-full [&>span]:min-w-0"
                aria-label="Choose what you want to do today"
              >
                <SelectValue placeholder="What do you want to do today?" />
              </SelectTrigger>
              <SelectContent className="max-h-[60vh]">
                {OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="py-3 pl-3 pr-2 focus:bg-accent data-[highlighted]:bg-accent text-popover-foreground focus:text-accent-foreground data-[highlighted]:text-accent-foreground"
                  >
                    <OptionRow opt={opt} compact />
                  </SelectItem>
                ))}
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

            <p className="text-sm text-muted-foreground pt-2">
              Or{" "}
              <Link
                to="/home"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                go to the homepage
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
    </>
  );
};

export default LandingRouter;
