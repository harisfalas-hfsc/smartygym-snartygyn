import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Dumbbell, Calendar, FileText } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  path: string;
  type: "workout" | "program" | "page";
  category?: string;
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  // Keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onOpenChange]);

  // All searchable content
  const searchableContent: SearchResult[] = [
    // Pages
    { id: "about", title: "About", description: "Learn about Smarty Gym and our mission", path: "/about", type: "page" },
    { id: "contact", title: "Contact", description: "Get in touch with us", path: "/contact", type: "page" },
    { id: "tools", title: "Fitness Tools", description: "Calculators and fitness tools", path: "/tools", type: "page" },
    { id: "blog", title: "Blog", description: "Articles and fitness tips", path: "/blog", type: "page" },
    { id: "community", title: "Community", description: "Connect with other members", path: "/community", type: "page" },
    { id: "exercises", title: "Exercise Library", description: "Browse exercise videos", path: "/exercises", type: "page" },
    { id: "premium", title: "Join Premium", description: "Unlock all premium features", path: "/join-premium", type: "page" },
    { id: "personal-training", title: "Personal Training", description: "One-on-one coaching", path: "/personal-training", type: "page" },
    
    // Workout categories
    { id: "workouts-strength", title: "Strength Workouts", description: "Build muscle and power", path: "/workout/strength", type: "workout", category: "strength" },
    { id: "workouts-calorie", title: "Calorie Burning Workouts", description: "Maximum fat burn", path: "/workout/calorie-burning", type: "workout", category: "calorie" },
    { id: "workouts-metabolic", title: "Metabolic Workouts", description: "Boost metabolism", path: "/workout/metabolic", type: "workout", category: "metabolic" },
    { id: "workouts-cardio", title: "Cardio Workouts", description: "Improve endurance", path: "/workout/cardio", type: "workout", category: "cardio" },
    { id: "workouts-mobility", title: "Mobility & Stability Workouts", description: "Flexibility and balance", path: "/workout/mobility", type: "workout", category: "mobility" },
    { id: "workouts-power", title: "Power Workouts", description: "Explosive strength", path: "/workout/power", type: "workout", category: "power" },
    { id: "workouts-challenge", title: "Challenge Workouts", description: "Test your limits", path: "/workout/challenge", type: "workout", category: "challenge" },
    
    // Training program categories
    { id: "program-cardio", title: "Cardio Endurance Programs", description: "6-8 week cardio programs", path: "/trainingprogram/cardio-endurance", type: "program" },
    { id: "program-functional", title: "Functional Strength Programs", description: "6-8 week functional training", path: "/trainingprogram/functional-strength", type: "program" },
    { id: "program-hypertrophy", title: "Muscle Hypertrophy Programs", description: "6-8 week muscle building", path: "/trainingprogram/muscle-hypertrophy", type: "program" },
    { id: "program-weightloss", title: "Weight Loss Programs", description: "6-8 week fat loss programs", path: "/trainingprogram/weight-loss", type: "program" },
    { id: "program-back", title: "Low Back Pain Programs", description: "6-8 week rehabilitation", path: "/trainingprogram/low-back-pain", type: "program" },
    { id: "program-mobility", title: "Mobility & Stability Programs", description: "6-8 week movement programs", path: "/trainingprogram/mobility-stability", type: "program" },
    
    // Calculators
    { id: "bmr-calc", title: "BMR Calculator", description: "Calculate your basal metabolic rate", path: "/bmr-calculator", type: "page" },
    { id: "macro-calc", title: "Macro Tracking Calculator", description: "Track your macronutrients", path: "/macro-tracking-calculator", type: "page" },
    { id: "onerm-calc", title: "1RM Calculator", description: "Calculate your one rep max", path: "/one-rm-calculator", type: "page" },
  ];

  // Search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = searchableContent.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query)
    ).slice(0, 8); // Limit to 8 results

    setResults(filtered);
  }, [searchQuery]);

  const handleSelect = (path: string) => {
    navigate(path);
    onOpenChange(false);
    setSearchQuery("");
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "workout":
        return <Dumbbell className="mr-2 h-4 w-4" />;
      case "program":
        return <Calendar className="mr-2 h-4 w-4" />;
      default:
        return <FileText className="mr-2 h-4 w-4" />;
    }
  };

  const groupedResults = {
    workouts: results.filter(r => r.type === "workout"),
    programs: results.filter(r => r.type === "program"),
    pages: results.filter(r => r.type === "page"),
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Search workouts, programs, pages..." 
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {groupedResults.workouts.length > 0 && (
          <CommandGroup heading="Workouts">
            {groupedResults.workouts.map((item) => (
              <CommandItem
                key={item.id}
                value={item.title}
                onSelect={() => handleSelect(item.path)}
              >
                {getIcon(item.type)}
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {groupedResults.programs.length > 0 && (
          <CommandGroup heading="Training Programs">
            {groupedResults.programs.map((item) => (
              <CommandItem
                key={item.id}
                value={item.title}
                onSelect={() => handleSelect(item.path)}
              >
                {getIcon(item.type)}
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {groupedResults.pages.length > 0 && (
          <CommandGroup heading="Pages">
            {groupedResults.pages.map((item) => (
              <CommandItem
                key={item.id}
                value={item.title}
                onSelect={() => handleSelect(item.path)}
              >
                {getIcon(item.type)}
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
