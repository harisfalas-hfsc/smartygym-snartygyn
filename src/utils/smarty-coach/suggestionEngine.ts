import { SmartyContext } from "@/hooks/useSmartyContext";
import { WORKOUT_CATEGORY_FAMILIES, GOAL_LABELS, familyRank } from "./categoryFamilies";

export interface QuestionAnswers {
  mood?: number;
  energy?: number;
  goal?: string;
  time?: number;
  equipment?: string;
}

export interface ContentItem {
  id: string;
  name: string;
  category: string;
  difficulty: string | null;
  duration: string | null;
  equipment: string | null;
  format?: string | null;
  image_url?: string | null;
  description?: string | null;
  is_premium?: boolean;
  type?: string;
}

export interface ScoredContent {
  item: ContentItem;
  score: number;
  reasons: string[];
  _famRank: number;
  _timeDiff: number;
  _equipmentMatched: boolean;
  _difficultyMatchedEnergy: boolean;
}

const LOW_ENERGY_CATEGORIES = ['RECOVERY', 'MOBILITY & STABILITY', 'PILATES', 'STRETCHING'];

const parseDuration = (duration: string | null): number | null => {
  if (!duration) return null;
  const match = duration.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
};

const isBodyweight = (equipment: string | null | undefined): boolean => {
  if (!equipment) return true;
  const eq = equipment.toLowerCase().trim();
  return eq === '' || eq === 'bodyweight' || eq === 'no equipment' || eq === 'none' || eq === 'home';
};

const inferDesiredDifficulty = (energy?: number): 'beginner' | 'intermediate' | 'advanced' | null => {
  if (typeof energy !== 'number') return null;
  if (energy <= 3) return 'beginner';
  if (energy <= 6) return 'intermediate';
  return 'advanced';
};

export const calculateScore = (
  item: ContentItem,
  answers: QuestionAnswers,
  context: SmartyContext
): ScoredContent => {
  let score = 0;
  const { mood, energy, goal, time, equipment } = answers;
  const categoryUpper = item.category?.toUpperCase() || '';
  const difficultyLower = item.difficulty?.toLowerCase() || '';
  const itemDuration = parseDuration(item.duration);
  const itemBodyweight = isBodyweight(item.equipment);

  // === COMPLETED soft penalty ===
  const isCompleted = context.completedWorkoutIds.includes(item.id);
  if (isCompleted) score -= 200;

  // === GOAL / CATEGORY (highest weight) ===
  let famRank = -1;
  if (goal) {
    famRank = familyRank(WORKOUT_CATEGORY_FAMILIES, goal, categoryUpper);
    if (famRank === 0) score += 600;
    else if (famRank > 0) score += 250 - (famRank * 30);
    else score -= 250;
  }

  // === DIFFICULTY (inferred from energy) ===
  const desiredDifficulty = inferDesiredDifficulty(energy);
  let difficultyMatchedEnergy = false;
  if (desiredDifficulty && difficultyLower) {
    if (difficultyLower === desiredDifficulty) { score += 150; difficultyMatchedEnergy = true; }
    else if (
      (desiredDifficulty === 'beginner' && difficultyLower === 'intermediate') ||
      (desiredDifficulty === 'advanced' && difficultyLower === 'intermediate') ||
      (desiredDifficulty === 'intermediate' && (difficultyLower === 'beginner' || difficultyLower === 'advanced'))
    ) score += 40;
    else score -= 60;
  }

  // === TIME ===
  let timeDiff = 99;
  if (time && itemDuration) {
    timeDiff = Math.abs(itemDuration - time);
    if (timeDiff <= 5) score += 100;
    else if (timeDiff <= 15) score += 50;
    else if (itemDuration > time + 15) score -= 60;
  }

  // === EQUIPMENT ===
  let equipmentMatched = false;
  if (equipment === 'bodyweight') {
    if (itemBodyweight) { score += 100; equipmentMatched = true; }
    else { score -= 250; }
  } else {
    if (!itemBodyweight) { score += 100; equipmentMatched = true; }
    else { score += 15; }
  }

  // === MOOD micro-adjustment (does not override goal) ===
  if (typeof mood === 'number' && mood <= 2) {
    const isCalming = LOW_ENERGY_CATEGORIES.some(cat => categoryUpper.includes(cat));
    if (isCalming) score += 20;
  }

  // === Variety: small bonus only ===
  const recentCategories = context.recentCategories || [];
  const categoryDone = recentCategories.some(c =>
    (c?.toUpperCase() || '').includes(categoryUpper) || categoryUpper.includes(c?.toUpperCase() || '')
  );
  if (!categoryDone && recentCategories.length > 0) score += 15;

  return {
    item, score, reasons: [],
    _famRank: famRank,
    _timeDiff: timeDiff,
    _equipmentMatched: equipmentMatched,
    _difficultyMatchedEnergy: difficultyMatchedEnergy,
  };
};

const buildWorkoutExplanations = (top: ScoredContent, answers: QuestionAnswers): string[] => {
  const reasons: string[] = [];
  const { goal, time, equipment, energy } = answers;
  const goalLabel = goal ? (GOAL_LABELS[goal] || goal) : '';
  const cat = top.item.category || '';
  const itemDuration = parseDuration(top.item.duration);
  const itemBodyweight = isBodyweight(top.item.equipment);
  const desiredDifficulty = inferDesiredDifficulty(energy);

  const exactCategory = top._famRank === 0;
  const fallbackCategory = top._famRank > 0;
  const exactTime = time && itemDuration && Math.abs(itemDuration - time) <= 5;

  const allMatch = exactCategory && top._equipmentMatched && exactTime && (!desiredDifficulty || top._difficultyMatchedEnergy);

  if (allMatch) {
    if (goalLabel) reasons.push(`Perfect match for your ${goalLabel} focus today.`);
    if (itemDuration) reasons.push(`Fits your ${time}-minute window.`);
    reasons.push(equipment === 'bodyweight' ? 'No equipment needed.' : 'Uses the equipment you have available.');
    return reasons;
  }

  reasons.push(`This is the best-fit workout for your mood, energy and focus right now — hand-picked from the library.`);

  if (goal) {
    if (exactCategory) reasons.push(`Targets your ${goalLabel} focus directly.`);
    else if (fallbackCategory) reasons.push(`This ${cat.toLowerCase()} workout aligns with your ${goalLabel} focus and delivers the same training stimulus.`);
  }

  if (desiredDifficulty && top.item.difficulty) {
    if (top._difficultyMatchedEnergy) reasons.push(`${top.item.difficulty} matches your current energy.`);
    else reasons.push(`Difficulty is ${top.item.difficulty} — well-suited to your current energy level.`);
  }

  if (time && itemDuration) {
    if (exactTime) reasons.push(`Fits your ${time}-minute window.`);
    else if (itemDuration < time) reasons.push(`Runs ${itemDuration} minutes — leaves room for warm-up or cool-down.`);
    else reasons.push(`Runs ${itemDuration} minutes — easy to trim the last circuit if needed.`);
  }

  if (top._equipmentMatched) {
    reasons.push(equipment === 'bodyweight' ? 'No equipment needed.' : 'Uses the equipment you have available.');
  } else if (equipment === 'bodyweight') {
    reasons.push('Every movement can be done bodyweight-only — fully adapted to your setup.');
  } else {
    reasons.push('Bodyweight-based — equipment not required today.');
  }

  return reasons;
};

export const generateSuggestions = (
  allContent: ContentItem[],
  context: SmartyContext,
  answers: QuestionAnswers
): ScoredContent | null => {
  if (allContent.length === 0) return null;

  const scored = allContent.map(item => calculateScore(item, answers, context));
  scored.sort((a, b) => {
    const aFam = a._famRank === -1 ? 999 : a._famRank;
    const bFam = b._famRank === -1 ? 999 : b._famRank;
    if (aFam !== bFam) return aFam - bFam;
    if (a._equipmentMatched !== b._equipmentMatched) return a._equipmentMatched ? -1 : 1;
    if (a._difficultyMatchedEnergy !== b._difficultyMatchedEnergy) return a._difficultyMatchedEnergy ? -1 : 1;
    if (a._timeDiff !== b._timeDiff) return a._timeDiff - b._timeDiff;
    return b.score - a.score;
  });

  const top = scored[0];
  if (!top) return null;
  top.reasons = buildWorkoutExplanations(top, answers);
  return top;
};
