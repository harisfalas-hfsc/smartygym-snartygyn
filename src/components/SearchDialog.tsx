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
    
    // Individual Strength Workouts
    { id: "strength-049", title: "Bodyweight Base", description: "30 min • Beginner • Bodyweight strength", path: "/individualworkout/strength-049", type: "workout", category: "strength" },
    { id: "strength-050", title: "Strength Starter", description: "30 min • Beginner • Equipment strength", path: "/individualworkout/strength-050", type: "workout", category: "strength" },
    { id: "strength-051", title: "Gravity Strength", description: "45 min • Intermediate • Bodyweight", path: "/individualworkout/strength-051", type: "workout", category: "strength" },
    { id: "strength-052", title: "Iron Builder", description: "45 min • Intermediate • Equipment", path: "/individualworkout/strength-052", type: "workout", category: "strength" },
    { id: "ws002", title: "Bodyweight Foundation Strength", description: "45 min • Intermediate • Bodyweight", path: "/individualworkout/ws002", type: "workout", category: "strength" },
    { id: "strength-053", title: "Bodyweight Powerhouse", description: "60 min • Advanced • Bodyweight", path: "/individualworkout/strength-053", type: "workout", category: "strength" },
    { id: "strength-054", title: "Iron Mastery", description: "60 min • Advanced • Equipment", path: "/individualworkout/strength-054", type: "workout", category: "strength" },
    { id: "ws001", title: "Iron Core Strength", description: "60 min • Advanced • Equipment", path: "/individualworkout/ws001", type: "workout", category: "strength" },
    { id: "ws003", title: "Iron Titan Strength", description: "60 min • Advanced • Equipment", path: "/individualworkout/ws003", type: "workout", category: "strength" },
    { id: "ws004", title: "Functional Compound Strength", description: "45 min • Intermediate • Equipment", path: "/individualworkout/ws004", type: "workout", category: "strength" },
    { id: "ws005", title: "Strength Density Builder", description: "60 min • Advanced • Equipment", path: "/individualworkout/ws005", type: "workout", category: "strength" },
    { id: "ws006", title: "Bodyweight Prime Strength", description: "45 min • Intermediate • Bodyweight", path: "/individualworkout/ws006", type: "workout", category: "strength" },
    { id: "ws007", title: "Core Stability Strength", description: "30 min • Beginner • Bodyweight", path: "/individualworkout/ws007", type: "workout", category: "strength" },
    
    // Individual Calorie Burning Workouts
    { id: "calorie-055", title: "Burn Flow", description: "30 min • Beginner • Low-impact circuit", path: "/individualworkout/calorie-055", type: "workout", category: "calorie" },
    { id: "calorie-056", title: "Sweat Band", description: "30 min • Beginner • Tabata workout", path: "/individualworkout/calorie-056", type: "workout", category: "calorie" },
    { id: "wc004", title: "Bodyweight Enduro Flow", description: "30 min • Beginner • Cardio flow", path: "/individualworkout/wc004", type: "workout", category: "calorie" },
    { id: "wc002", title: "Bodyweight Fat Melt", description: "30 min • Intermediate • HIIT circuit", path: "/individualworkout/wc002", type: "workout", category: "calorie" },
    { id: "calorie-057", title: "Body Burn Pro", description: "45 min • Intermediate • AMRAP", path: "/individualworkout/calorie-057", type: "workout", category: "calorie" },
    { id: "wc001", title: "Calorie Crusher Circuit", description: "45 min • Intermediate • Circuit", path: "/individualworkout/wc001", type: "workout", category: "calorie" },
    { id: "calorie-058", title: "Sweat Surge", description: "45 min • Intermediate • HIIT", path: "/individualworkout/calorie-058", type: "workout", category: "calorie" },
    { id: "wc003", title: "Cardio Power Intervals", description: "45 min • Intermediate • Intervals", path: "/individualworkout/wc003", type: "workout", category: "calorie" },
    { id: "calorie-059", title: "Inferno Sprint", description: "60 min • Advanced • Bodyweight", path: "/individualworkout/calorie-059", type: "workout", category: "calorie" },
    { id: "calorie-060", title: "Calorie Forge", description: "60 min • Advanced • Hybrid workout", path: "/individualworkout/calorie-060", type: "workout", category: "calorie" },
    { id: "wc005", title: "Calorie Storm Circuit", description: "45 min • Intermediate • Circuit", path: "/individualworkout/wc005", type: "workout", category: "calorie" },
    { id: "wc006", title: "Full Throttle Fat Burn", description: "60 min • Advanced • Metabolic", path: "/individualworkout/wc006", type: "workout", category: "calorie" },
    { id: "wc007", title: "Burn Zone Intervals", description: "45 min • Intermediate • Tabata", path: "/individualworkout/wc007", type: "workout", category: "calorie" },
    { id: "wc008", title: "Bodyweight Inferno", description: "30 min • Intermediate • AMRAP", path: "/individualworkout/wc008", type: "workout", category: "calorie" },
    { id: "wc009", title: "Burn Flow 2.0", description: "30 min • Beginner • Circuit", path: "/individualworkout/wc009", type: "workout", category: "calorie" },
    
    // Individual Metabolic Workouts
    { id: "metabolic-043", title: "Metabo Pulse", description: "30 min • Beginner • Tabata", path: "/individualworkout/metabolic-043", type: "workout", category: "metabolic" },
    { id: "wm002", title: "Metabolic Body Blast", description: "30 min • Intermediate • Tabata", path: "/individualworkout/wm002", type: "workout", category: "metabolic" },
    { id: "metabolic-044", title: "Metabo Band Boost", description: "30 min • Beginner • Circuit", path: "/individualworkout/metabolic-044", type: "workout", category: "metabolic" },
    { id: "metabolic-045", title: "Metabo Sprint", description: "45 min • Intermediate • AMRAP", path: "/individualworkout/metabolic-045", type: "workout", category: "metabolic" },
    { id: "wm001", title: "Metabolic Destroyer", description: "45 min • Advanced • EPOC focus", path: "/individualworkout/wm001", type: "workout", category: "metabolic" },
    { id: "metabolic-046", title: "Metabo Hybrid", description: "45 min • Intermediate • Mixed", path: "/individualworkout/metabolic-046", type: "workout", category: "metabolic" },
    { id: "metabolic-047", title: "Metabo Max", description: "60 min • Advanced • Bodyweight", path: "/individualworkout/metabolic-047", type: "workout", category: "metabolic" },
    { id: "metabolic-048", title: "Metabo Forge", description: "60 min • Advanced • Strength-driven", path: "/individualworkout/metabolic-048", type: "workout", category: "metabolic" },
    { id: "wm003", title: "Metabolic Mayhem", description: "60 min • Advanced • Barbell focus", path: "/individualworkout/wm003", type: "workout", category: "metabolic" },
    { id: "wm004", title: "Metabolic Engine", description: "45 min • Intermediate • Circuit", path: "/individualworkout/wm004", type: "workout", category: "metabolic" },
    { id: "wm005", title: "Metabolic Overdrive", description: "45 min • Advanced • AMRAP", path: "/individualworkout/wm005", type: "workout", category: "metabolic" },
    { id: "wm006", title: "Bodyweight Engine", description: "30 min • Intermediate • Tabata", path: "/individualworkout/wm006", type: "workout", category: "metabolic" },
    { id: "wm007", title: "Metabolic Core Burn", description: "30 min • Beginner • Circuit", path: "/individualworkout/wm007", type: "workout", category: "metabolic" },
    
    // Individual Cardio Workouts
    { id: "cardio-061", title: "Cardio Lift-Off", description: "30 min • Beginner • Low-impact", path: "/individualworkout/cardio-061", type: "workout", category: "cardio" },
    { id: "cardio-062", title: "Pulse Builder", description: "30 min • Beginner • Tabata", path: "/individualworkout/cardio-062", type: "workout", category: "cardio" },
    { id: "cardio-063", title: "Cardio Climb", description: "45 min • Intermediate • AMRAP", path: "/individualworkout/cardio-063", type: "workout", category: "cardio" },
    { id: "cardio-064", title: "Cardio Circuit Pro", description: "45 min • Intermediate • Circuit", path: "/individualworkout/cardio-064", type: "workout", category: "cardio" },
    { id: "cardio-065", title: "Cardio Inferno", description: "60 min • Advanced • Plyometrics", path: "/individualworkout/cardio-065", type: "workout", category: "cardio" },
    { id: "cardio-066", title: "Cardio Overdrive", description: "60 min • Advanced • Full-body blast", path: "/individualworkout/cardio-066", type: "workout", category: "cardio" },
    { id: "wca005", title: "Cardio Engine Builder", description: "45 min • Intermediate • Intervals", path: "/individualworkout/wca005", type: "workout", category: "cardio" },
    { id: "wca006", title: "Sprint Power Combo", description: "45 min • Advanced • Explosive", path: "/individualworkout/wca006", type: "workout", category: "cardio" },
    { id: "wca007", title: "Conditioning Pyramid", description: "45 min • Intermediate • Pyramid", path: "/individualworkout/wca007", type: "workout", category: "cardio" },
    { id: "wca008", title: "Bodyweight Endurance Flow", description: "30 min • Intermediate • Flow", path: "/individualworkout/wca008", type: "workout", category: "cardio" },
    { id: "wca009", title: "Fast Feet Cardio Flow", description: "30 min • Beginner • Agility", path: "/individualworkout/wca009", type: "workout", category: "cardio" },
    
    // Individual Mobility Workouts
    { id: "mobility-025", title: "Flow Starter", description: "30 min • Beginner • Gentle mobility", path: "/individualworkout/mobility-025", type: "workout", category: "mobility" },
    { id: "wmob002", title: "Bodyweight Stability Flow", description: "30 min • Beginner • Balance focus", path: "/individualworkout/wmob002", type: "workout", category: "mobility" },
    { id: "mobility-026", title: "Band Balance", description: "30 min • Beginner • Bands & ball", path: "/individualworkout/mobility-026", type: "workout", category: "mobility" },
    { id: "mobility-027", title: "Core Flow", description: "45 min • Intermediate • Dynamic", path: "/individualworkout/mobility-027", type: "workout", category: "mobility" },
    { id: "wmob001", title: "Mobility Reset", description: "45 min • Intermediate • Joint control", path: "/individualworkout/wmob001", type: "workout", category: "mobility" },
    { id: "mobility-028", title: "Stability Circuit", description: "45 min • Intermediate • Balance", path: "/individualworkout/mobility-028", type: "workout", category: "mobility" },
    { id: "mobility-029", title: "Mobility Mastery", description: "60 min • Advanced • Deep holds", path: "/individualworkout/mobility-029", type: "workout", category: "mobility" },
    { id: "mobility-030", title: "Balance Forge", description: "60 min • Advanced • Elite control", path: "/individualworkout/mobility-030", type: "workout", category: "mobility" },
    { id: "wmob003", title: "Joint Flow Restore", description: "45 min • Intermediate • Restoration", path: "/individualworkout/wmob003", type: "workout", category: "mobility" },
    { id: "wmob004", title: "Core Stability Builder", description: "45 min • Intermediate • TRX", path: "/individualworkout/wmob004", type: "workout", category: "mobility" },
    { id: "wmob005", title: "Balance Flow Reset", description: "30 min • Beginner • Mini band", path: "/individualworkout/wmob005", type: "workout", category: "mobility" },
    { id: "wmob006", title: "Mobility Wave", description: "30 min • Beginner • Dynamic stretch", path: "/individualworkout/wmob006", type: "workout", category: "mobility" },
    { id: "wmob007", title: "Stability Core Flow", description: "30 min • Beginner • Core activation", path: "/individualworkout/wmob007", type: "workout", category: "mobility" },
    
    // Individual Power Workouts
    { id: "power-037", title: "Power Primer", description: "30 min • Beginner • Basic explosive", path: "/individualworkout/power-037", type: "workout", category: "power" },
    { id: "wp002", title: "Explosive Body Control", description: "30 min • Intermediate • Plyometric", path: "/individualworkout/wp002", type: "workout", category: "power" },
    { id: "power-038", title: "Explosive Start", description: "30 min • Beginner • Light resistance", path: "/individualworkout/power-038", type: "workout", category: "power" },
    { id: "power-039", title: "Body Blast", description: "45 min • Intermediate • Plyometrics", path: "/individualworkout/power-039", type: "workout", category: "power" },
    { id: "wp001", title: "Power Surge", description: "45 min • Advanced • Speed focus", path: "/individualworkout/wp001", type: "workout", category: "power" },
    { id: "power-040", title: "Power Circuit Pro", description: "45 min • Intermediate • Circuit", path: "/individualworkout/power-040", type: "workout", category: "power" },
    { id: "power-041", title: "Explosive Engine", description: "60 min • Advanced • Bodyweight", path: "/individualworkout/power-041", type: "workout", category: "power" },
    { id: "power-042", title: "Power Surge Elite", description: "60 min • Advanced • Hybrid", path: "/individualworkout/power-042", type: "workout", category: "power" },
    { id: "wp003", title: "Explosive Engine Power", description: "45 min • Advanced • Barbell", path: "/individualworkout/wp003", type: "workout", category: "power" },
    { id: "wp004", title: "Speed Mechanics", description: "45 min • Intermediate • Speed work", path: "/individualworkout/wp004", type: "workout", category: "power" },
    { id: "wp005", title: "Olympic Power Session", description: "60 min • Advanced • Olympic lifts", path: "/individualworkout/wp005", type: "workout", category: "power" },
    { id: "wp006", title: "Plyometric Burn", description: "30 min • Intermediate • Explosive", path: "/individualworkout/wp006", type: "workout", category: "power" },
    { id: "wp007", title: "Power Flow", description: "30 min • Beginner • Speed & control", path: "/individualworkout/wp007", type: "workout", category: "power" },
    
    // Individual Challenge Workouts
    { id: "challenge-002", title: "Starter Gauntlet", description: "30 min • Beginner • Challenge", path: "/individualworkout/challenge-002", type: "workout", category: "challenge" },
    { id: "challenge-003", title: "Challenge Prep", description: "30 min • Beginner • Timed circuit", path: "/individualworkout/challenge-003", type: "workout", category: "challenge" },
    { id: "challenge-004", title: "Bodyweight Blitz", description: "45 min • Intermediate • Endurance", path: "/individualworkout/challenge-004", type: "workout", category: "challenge" },
    { id: "wch002", title: "HFSC Challenge 2: Bodyweight Inferno", description: "45 min • Advanced • Full-body test", path: "/individualworkout/wch002", type: "workout", category: "challenge" },
    { id: "challenge-005", title: "Challenge Circuit Pro", description: "45 min • Intermediate • High-intensity", path: "/individualworkout/challenge-005", type: "workout", category: "challenge" },
    { id: "challenge-006", title: "Final Form", description: "60 min • Advanced • Brutal test", path: "/individualworkout/challenge-006", type: "workout", category: "challenge" },
    { id: "wch001", title: "HFSC Challenge 1: The Grinder", description: "60 min • Advanced • Epic challenge", path: "/individualworkout/wch001", type: "workout", category: "challenge" },
    { id: "challenge-007", title: "Elite Gauntlet", description: "60 min • Advanced • Elite test", path: "/individualworkout/challenge-007", type: "workout", category: "challenge" },
    { id: "wch003", title: "HFSC Beast Mode", description: "60 min • Advanced • Barbell challenge", path: "/individualworkout/wch003", type: "workout", category: "challenge" },
    { id: "wch004", title: "Spartan Endurance Test", description: "60 min • Advanced • Endurance", path: "/individualworkout/wch004", type: "workout", category: "challenge" },
    { id: "wch005", title: "Full Body Benchmark", description: "45 min • Intermediate • Benchmark", path: "/individualworkout/wch005", type: "workout", category: "challenge" },
    { id: "wch006", title: "The Burnout Challenge", description: "30 min • Intermediate • Endurance test", path: "/individualworkout/wch006", type: "workout", category: "challenge" },
    { id: "wch007", title: "Warrior Flow", description: "30 min • Beginner • Flow challenge", path: "/individualworkout/wch007", type: "workout", category: "challenge" },
    
    // Training program categories
    { id: "program-cardio", title: "Cardio Endurance Programs", description: "6-8 week cardio programs", path: "/trainingprogram/cardio-endurance", type: "program" },
    { id: "program-functional", title: "Functional Strength Programs", description: "6-8 week functional training", path: "/trainingprogram/functional-strength", type: "program" },
    { id: "program-hypertrophy", title: "Muscle Hypertrophy Programs", description: "6-8 week muscle building", path: "/trainingprogram/muscle-hypertrophy", type: "program" },
    { id: "program-weightloss", title: "Weight Loss Programs", description: "6-8 week fat loss programs", path: "/trainingprogram/weight-loss", type: "program" },
    { id: "program-back", title: "Low Back Pain Programs", description: "6-8 week rehabilitation", path: "/trainingprogram/low-back-pain", type: "program" },
    { id: "program-mobility", title: "Mobility & Stability Programs", description: "6-8 week movement programs", path: "/trainingprogram/mobility-stability", type: "program" },
    
    // Individual Training Programs
    { id: "T-C001", title: "Cardio Performance Booster", description: "6 weeks • Intermediate • VO₂ max improvement", path: "/trainingprogram/cardio-endurance/T-C001", type: "program", category: "cardio" },
    { id: "T-C002", title: "Cardio Max Endurance", description: "8 weeks • Advanced • Peak capacity", path: "/trainingprogram/cardio-endurance/T-C002", type: "program", category: "cardio" },
    { id: "T-F001", title: "Functional Strength Builder", description: "6 weeks • Intermediate • Full-body strength", path: "/trainingprogram/functional-strength/T-F001", type: "program", category: "strength" },
    { id: "T-F002", title: "Functional Strength Elite", description: "8 weeks • Advanced • Heavy load tolerance", path: "/trainingprogram/functional-strength/T-F002", type: "program", category: "strength" },
    { id: "T-H001", title: "Muscle Hypertrophy Builder", description: "6 weeks • Intermediate • Muscle volume", path: "/trainingprogram/muscle-hypertrophy/T-H001", type: "program", category: "hypertrophy" },
    { id: "T-H002", title: "Muscle Hypertrophy Pro", description: "8 weeks • Advanced • Maximum growth", path: "/trainingprogram/muscle-hypertrophy/T-H002", type: "program", category: "hypertrophy" },
    { id: "T-W001", title: "Weight Loss Ignite", description: "6 weeks • Intermediate • Fat loss", path: "/trainingprogram/weight-loss/T-W001", type: "program", category: "weightloss" },
    { id: "T-W002", title: "Weight Loss Elite", description: "8 weeks • Advanced • Aggressive fat loss", path: "/trainingprogram/weight-loss/T-W002", type: "program", category: "weightloss" },
    { id: "T-L001", title: "Low Back Pain Rehab Strength", description: "6 weeks • Intermediate • Spinal stability", path: "/trainingprogram/low-back-pain/T-L001", type: "program", category: "rehab" },
    { id: "T-L002", title: "Low Back Performance", description: "8 weeks • Advanced • Posterior chain", path: "/trainingprogram/low-back-pain/T-L002", type: "program", category: "rehab" },
    { id: "T-M001", title: "Mobility & Stability Flow", description: "6 weeks • Intermediate • Joint range", path: "/trainingprogram/mobility-stability/T-M001", type: "program", category: "mobility" },
    { id: "T-M002", title: "Mobility & Stability Master Flow", description: "8 weeks • Advanced • Elite body control", path: "/trainingprogram/mobility-stability/T-M002", type: "program", category: "mobility" },
    
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
      item.category?.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query)
    ).slice(0, 12); // Limit to 12 results

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