export interface VideoCard {
  line1: string;
  line2?: string;
}

export interface VideoScript {
  day: number;
  title: string;
  cards: VideoCard[];
  hasCoachPhoto?: boolean;
}

export const socialMediaVideoScripts: VideoScript[] = [
  {
    day: 1,
    title: "WHAT IS SMARTY GYM",
    cards: [
      { line1: "What is Smarty Gym", line2: "Your gym anywhere anytime" },
      { line1: "Daily science based workouts", line2: "No random training" },
      { line1: "With or without equipment", line2: "Always effective" },
      { line1: "Designed by a professional coach", line2: "Train smarter" },
    ],
  },
  {
    day: 2,
    title: "MEET THE COACH",
    hasCoachPhoto: true,
    cards: [
      { line1: "Meet the Coach" },
      { line1: "Haris Falas", line2: "Strength and Conditioning Coach" },
      { line1: "20 plus years experience", line2: "Elite level knowledge" },
      { line1: "Science first", line2: "Results always" },
    ],
  },
  {
    day: 3,
    title: "100 PERCENT HUMAN",
    cards: [
      { line1: "100% Human" },
      { line1: "Zero random workouts" },
      { line1: "Designed by a real coach", line2: "Not algorithms" },
      { line1: "Train with purpose" },
    ],
  },
  {
    day: 4,
    title: "WHO IS THIS FOR",
    cards: [
      { line1: "Who is Smarty Gym for" },
      { line1: "Busy adults" },
      { line1: "People who want results" },
      { line1: "Those tired of guessing" },
    ],
  },
  {
    day: 5,
    title: "ANYWHERE ANYTIME",
    cards: [
      { line1: "Train anywhere" },
      { line1: "Home", line2: "Gym • Travel" },
      { line1: "No excuses", line2: "Just training" },
      { line1: "Your gym follows you" },
    ],
  },
  {
    day: 6,
    title: "WORKOUT OF THE DAY",
    cards: [
      { line1: "Workout of the Day" },
      { line1: "Warm up", line2: "Main workout" },
      { line1: "Finisher", line2: "Recovery" },
      { line1: "New workout every day" },
    ],
  },
  {
    day: 7,
    title: "WEEKEND ENERGY",
    cards: [
      { line1: "Weekend Energy" },
      { line1: "Short", line2: "Intense" },
      { line1: "Burn calories" },
      { line1: "Feel alive" },
    ],
  },
  {
    day: 8,
    title: "WORKOUT LIBRARY",
    cards: [
      { line1: "Workout Library" },
      { line1: "500+ workouts" },
      { line1: "All categories", line2: "All levels" },
      { line1: "Never bored" },
    ],
  },
  {
    day: 9,
    title: "6 CATEGORIES",
    cards: [
      { line1: "6 Training Categories" },
      { line1: "Strength", line2: "Cardio" },
      { line1: "Metabolic", line2: "Mobility" },
      { line1: "Train with purpose" },
    ],
  },
  {
    day: 10,
    title: "PROGRAMS",
    cards: [
      { line1: "Structured Programs" },
      { line1: "Not random workouts" },
      { line1: "Progression", line2: "Recovery" },
      { line1: "Results you trust" },
    ],
  },
  {
    day: 11,
    title: "DAILY RITUALS",
    cards: [
      { line1: "Daily Rituals" },
      { line1: "Move better" },
      { line1: "Feel stronger" },
      { line1: "Every single day" },
    ],
  },
  {
    day: 12,
    title: "CHECK INS",
    cards: [
      { line1: "Track your training" },
      { line1: "Simple check ins" },
      { line1: "Build consistency" },
      { line1: "See progress" },
    ],
  },
  {
    day: 13,
    title: "SMARTY TOOLS",
    cards: [
      { line1: "Smarty Tools" },
      { line1: "Calories", line2: "Strength" },
      { line1: "Clear numbers" },
      { line1: "No guessing" },
    ],
  },
  {
    day: 14,
    title: "RESULTS MATTER",
    cards: [
      { line1: "Results matter" },
      { line1: "Consistency" },
      { line1: "Structure" },
      { line1: "Trust the process" },
    ],
  },
  {
    day: 15,
    title: "EXPERT DESIGNED",
    cards: [
      { line1: "Expert Designed" },
      { line1: "Safety first" },
      { line1: "Better results" },
      { line1: "Less injuries" },
    ],
  },
  {
    day: 16,
    title: "FITNESS CONFUSION",
    cards: [
      { line1: "Fitness is confusing" },
      { line1: "Too many programs" },
      { line1: "Too much noise" },
      { line1: "Smarty Gym simplifies" },
    ],
  },
  {
    day: 17,
    title: "WOD DEEP DIVE",
    cards: [
      { line1: "Inside the WOD" },
      { line1: "Warm up" },
      { line1: "Main workout" },
      { line1: "Finish strong" },
    ],
  },
  {
    day: 18,
    title: "WHICH PLAN",
    cards: [
      { line1: "Which plan fits you" },
      { line1: "Beginner" },
      { line1: "Intermediate" },
      { line1: "Advanced" },
    ],
  },
  {
    day: 19,
    title: "EXERCISE LIBRARY",
    cards: [
      { line1: "Exercise Library" },
      { line1: "Clear demos" },
      { line1: "Safe execution" },
      { line1: "Train confident" },
    ],
  },
  {
    day: 20,
    title: "GOALS",
    cards: [
      { line1: "Set real goals" },
      { line1: "Track progress" },
      { line1: "Stay focused" },
      { line1: "Achieve more" },
    ],
  },
  {
    day: 21,
    title: "COMMUNITY",
    cards: [
      { line1: "You are not alone" },
      { line1: "Community driven" },
      { line1: "Motivation matters" },
      { line1: "Train together" },
    ],
  },
  {
    day: 22,
    title: "TRANSFORMATION",
    cards: [
      { line1: "Transformations" },
      { line1: "Consistency" },
      { line1: "Time" },
      { line1: "Commitment" },
    ],
  },
  {
    day: 23,
    title: "BEHIND THE SCENES",
    cards: [
      { line1: "Behind Smarty Gym" },
      { line1: "Planning" },
      { line1: "Programming" },
      { line1: "Quality first" },
    ],
  },
  {
    day: 24,
    title: "FAQ",
    cards: [
      { line1: "Questions" },
      { line1: "Yes it works" },
      { line1: "Yes at home" },
      { line1: "Yes for you" },
    ],
  },
  {
    day: 25,
    title: "QUICK FACTS",
    cards: [
      { line1: "Quick facts" },
      { line1: "Time efficient" },
      { line1: "All levels" },
      { line1: "Daily guidance" },
    ],
  },
  {
    day: 26,
    title: "LOGBOOK",
    cards: [
      { line1: "Your Logbook" },
      { line1: "Track everything" },
      { line1: "See improvement" },
      { line1: "Stay accountable" },
    ],
  },
  {
    day: 27,
    title: "KNOW YOUR NUMBERS",
    cards: [
      { line1: "Know your numbers" },
      { line1: "Calories" },
      { line1: "Strength" },
      { line1: "Progress" },
    ],
  },
  {
    day: 28,
    title: "LAST CHANCE",
    cards: [
      { line1: "Almost there" },
      { line1: "Do not wait" },
      { line1: "Start today" },
      { line1: "No excuses" },
    ],
  },
  {
    day: 29,
    title: "FINAL PUSH",
    cards: [
      { line1: "Final push" },
      { line1: "Commit" },
      { line1: "Train smarter" },
      { line1: "Feel stronger" },
    ],
  },
  {
    day: 30,
    title: "LAUNCH DAY",
    cards: [
      { line1: "We are live" },
      { line1: "Smarty Gym" },
      { line1: "Your gym everywhere" },
      { line1: "Start now" },
    ],
  },
];
