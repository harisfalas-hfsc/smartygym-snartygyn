import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import smartyGymLogo from "@/assets/smarty-gym-logo.png";

type Option = { label: string; route: string };
type Group = { label: string; options: Option[] };

const GROUPS: Group[] = [
  {
    label: "Train",
    options: [
      { label: "Workout of the Day", route: "/workout/wod" },
      { label: "Daily Smarty Ritual", route: "/daily-ritual" },
      { label: "Browse Workouts", route: "/workout" },
      { label: "Training Programs", route: "/trainingprogram" },
      { label: "WOD Archive", route: "/wod-archive" },
    ],
  },
  {
    label: "Tools",
    options: [
      { label: "Smarty Tools (all)", route: "/tools" },
      { label: "Workout Timer", route: "/workouttimer" },
      { label: "1RM Calculator", route: "/1rmcalculator" },
      { label: "BMR Calculator", route: "/bmrcalculator" },
      { label: "Macro Calculator", route: "/macrocalculator" },
      { label: "Calorie Counter", route: "/caloriecounter" },
      { label: "Exercise Library", route: "/exerciselibrary" },
    ],
  },
  {
    label: "Learn",
    options: [
      { label: "Blog", route: "/blog" },
      { label: "The Smarty Method", route: "/the-smarty-method" },
      { label: "About / Coach", route: "/about" },
      { label: "FAQ", route: "/faq" },
    ],
  },
  {
    label: "Account & More",
    options: [
      { label: "My Dashboard", route: "/userdashboard" },
      { label: "Join Premium", route: "/joinpremium" },
      { label: "Shop", route: "/shop" },
      { label: "Community", route: "/community" },
      { label: "Contact", route: "/contact" },
    ],
  },
];

const LandingRouter = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string>("");

  const go = () => {
    if (selected) navigate(selected);
  };

  return (
    <>
      <Helmet>
        <title>Start Here | SmartyGym — What do you want to do today?</title>
        <meta
          name="description"
          content="Pick a destination — Workout of the Day, workouts, training programs, tools, blog and more — and we'll take you there."
        />
      </Helmet>

      <main className="min-h-[calc(100vh-var(--app-header-h,100px))] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl mx-auto text-center space-y-8">
          <img
            src={smartyGymLogo}
            alt="SmartyGym logo"
            className="h-16 md:h-20 mx-auto object-contain"
            loading="eager"
          />

          <div className="space-y-3">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
              What do you want to do today?
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Pick a destination and we'll take you there.
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
                className="h-14 text-base md:text-lg w-full"
                aria-label="Choose where to go"
              >
                <SelectValue placeholder="Choose what you want to do…" />
              </SelectTrigger>
              <SelectContent className="max-h-[60vh]">
                {GROUPS.map((group) => (
                  <SelectGroup key={group.label}>
                    <SelectLabel>{group.label}</SelectLabel>
                    {group.options.map((opt) => (
                      <SelectItem key={opt.route} value={opt.route}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>

            <Button
              size="lg"
              className="w-full h-14 text-base md:text-lg"
              onClick={go}
              disabled={!selected}
            >
              Go
            </Button>
          </div>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
          >
            Or browse the full homepage
          </button>
        </div>
      </main>
    </>
  );
};

export default LandingRouter;