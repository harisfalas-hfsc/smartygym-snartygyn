import { SmartyContext } from "@/hooks/useSmartyContext";

export interface ProgramItem {
  id: string;
  name: string;
  category: string;
  difficulty: string | null;
  duration: string | null;
  equipment: string | null;
  weeks: number | null;
  image_url: string | null;
  description: string | null;
  is_premium: boolean | null;
}

export interface ProgramAnswers {
  category: string;
  difficulty: string;
  duration: string;
  equipment: string;
}

export interface ScoredProgram {
  item: ProgramItem;
  score: number;
  reasons: string[];
}

const CATEGORY_MAP: Record<string, string[]> = {
  'cardio_endurance': ['CARDIO ENDURANCE', 'CARDIO'],
  'functional_strength': ['FUNCTIONAL STRENGTH'],
  'muscle_hypertrophy': ['MUSCLE HYPERTROPHY', 'HYPERTROPHY'],
  'weight_loss': ['WEIGHT LOSS', 'CALORIE BURNING', 'METABOLIC'],
  'low_back_pain': ['LOW BACK PAIN', 'BACK PAIN'],
  'mobility_stability': ['MOBILITY & STABILITY', 'MOBILITY AND STABILITY', 'MOBILITY'],
};

const parseProgramWeeks = (duration: string | null, weeks: number | null): number | null => {
  if (weeks) return weeks;
  if (!duration) return null;
  const match = duration.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
};

const isBodyweightOnly = (equipment: string | null | undefined): boolean => {
  if (!equipment) return true;
  const eq = equipment.toLowerCase().trim();
  if (eq === '' || eq === 'none' || eq === 'no equipment') return true;
  // Pure bodyweight (no commas indicating mixed items)
  if (eq === 'bodyweight') return true;
  return false;
};

const requiresEquipment = (equipment: string | null | undefined): boolean => {
  return !isBodyweightOnly(equipment);
};

// Difficulty tier index
const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'];

export const scoreProgramItem = (
  item: ProgramItem,
  answers: ProgramAnswers,
  context: SmartyContext
): ScoredProgram => {
  let score = 0;
  const reasons: string[] = [];
  const categoryUpper = item.category?.toUpperCase() || '';
  const difficultyLower = item.difficulty?.toLowerCase() || '';
  const itemWeeks = parseProgramWeeks(item.duration, item.weeks);

  // === COMPLETED / ONGOING PENALTY ===
  const completedProgramIds = context.programInteractions
    .filter(p => p.is_completed)
    .map(p => p.program_id);
  const ongoingProgramIds = context.programInteractions
    .filter(p => p.is_ongoing)
    .map(p => p.program_id);

  if (completedProgramIds.includes(item.id) || ongoingProgramIds.includes(item.id)) {
    return { item, score: -1000, reasons: ['Already completed or in progress'] };
  }

  // === CATEGORY MATCH (HIGHEST PRIORITY — heavy penalty if wrong) ===
  const targetCategories = CATEGORY_MAP[answers.category] || [];
  const matchesCategory = targetCategories.some(cat => categoryUpper.includes(cat));
  if (matchesCategory) {
    score += 200;
    reasons.push(`Matches your ${item.category} goal`);
  } else {
    score -= 150;
  }

  // === DIFFICULTY MATCH (SECOND PRIORITY) ===
  const targetDifficulty = answers.difficulty.toLowerCase();
  const targetDiffIdx = DIFFICULTY_LEVELS.indexOf(targetDifficulty);
  const itemDiffIdx = DIFFICULTY_LEVELS.indexOf(difficultyLower);
  if (difficultyLower === targetDifficulty) {
    score += 100;
    reasons.push(`${item.difficulty} level — matches your experience`);
  } else if (targetDiffIdx >= 0 && itemDiffIdx >= 0 && Math.abs(targetDiffIdx - itemDiffIdx) === 1) {
    score += 20;
    // Soft note added later only if it ends up being the chosen item
  } else {
    score -= 60;
  }

  // === DURATION MATCH (THIRD PRIORITY — nearest wins) ===
  const targetWeeks = parseInt(answers.duration.replace(/\D/g, ''), 10);
  if (itemWeeks && targetWeeks) {
    const diff = Math.abs(itemWeeks - targetWeeks);
    if (diff === 0) {
      score += 60;
      reasons.push(`${itemWeeks}-week program fits your timeline exactly`);
    } else if (diff <= 2) {
      score += 30;
    } else if (diff <= 4) {
      score += 10;
    } else {
      score -= 10;
    }
  }

  // === EQUIPMENT MATCH (FOURTH PRIORITY — strict bodyweight constraint) ===
  const itemIsBodyweight = isBodyweightOnly(item.equipment);
  const itemNeedsEquipment = requiresEquipment(item.equipment);

  if (answers.equipment === 'bodyweight') {
    if (itemIsBodyweight) {
      score += 30;
      reasons.push('No equipment needed');
    } else {
      // Hard constraint — exclude equipment-required programs when user has none
      return { item, score: -1000, reasons: ['Requires equipment you don\'t have'] };
    }
  } else {
    // User has equipment available — prefer programs that use it
    if (itemNeedsEquipment) {
      score += 25;
      reasons.push('Uses the equipment you have available');
    } else {
      score += 5; // Bodyweight still valid, just less prioritized
    }
  }

  return { item, score, reasons };
};

const formatGoalLabel = (category: string): string => {
  const map: Record<string, string> = {
    cardio_endurance: 'cardio endurance',
    functional_strength: 'functional strength',
    muscle_hypertrophy: 'muscle building',
    weight_loss: 'weight loss',
    low_back_pain: 'back care',
    mobility_stability: 'mobility & stability',
  };
  return map[category] || category;
};

export const generateProgramSuggestion = (
  programs: ProgramItem[],
  answers: ProgramAnswers,
  context: SmartyContext
): ScoredProgram | null => {
  if (programs.length === 0) return null;

  const scored = programs.map(item => scoreProgramItem(item, answers, context));
  const validItems = scored.filter(s => s.score > -500);

  if (validItems.length === 0) {
    return null;
  }

  // Tie-break: prefer (1) category match, (2) exact difficulty, (3) closest duration
  const targetWeeks = parseInt(answers.duration.replace(/\D/g, ''), 10);
  const targetDifficulty = answers.difficulty.toLowerCase();
  const targetCats = CATEGORY_MAP[answers.category] || [];

  validItems.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aCat = targetCats.some(c => (a.item.category?.toUpperCase() || '').includes(c)) ? 1 : 0;
    const bCat = targetCats.some(c => (b.item.category?.toUpperCase() || '').includes(c)) ? 1 : 0;
    if (aCat !== bCat) return bCat - aCat;
    const aDiff = (a.item.difficulty?.toLowerCase() || '') === targetDifficulty ? 1 : 0;
    const bDiff = (b.item.difficulty?.toLowerCase() || '') === targetDifficulty ? 1 : 0;
    if (aDiff !== bDiff) return bDiff - aDiff;
    const aWeeks = parseProgramWeeks(a.item.duration, a.item.weeks) || 0;
    const bWeeks = parseProgramWeeks(b.item.duration, b.item.weeks) || 0;
    return Math.abs(aWeeks - targetWeeks) - Math.abs(bWeeks - targetWeeks);
  });

  const top = validItems[0];

  // === HONEST EXPLANATIONS: surface gaps so the user understands the trade-off ===
  const topCat = (top.item.category?.toUpperCase() || '');
  const topDiff = (top.item.difficulty?.toLowerCase() || '');
  const topWeeks = parseProgramWeeks(top.item.duration, top.item.weeks);
  const goalLabel = formatGoalLabel(answers.category);

  const categoryMatched = targetCats.some(c => topCat.includes(c));
  const difficultyMatched = topDiff === targetDifficulty;
  const durationMatched = topWeeks === targetWeeks;

  const gaps: string[] = [];
  if (!categoryMatched) {
    gaps.push(
      `We don't have a ${goalLabel} program matching all your criteria yet — this is the closest available alternative that delivers similar benefits.`
    );
  }
  if (categoryMatched && !difficultyMatched && top.item.difficulty) {
    gaps.push(
      `No ${answers.difficulty} ${goalLabel} program at ${targetWeeks} weeks is available — this ${top.item.difficulty} option is the nearest fit and can be scaled to your level.`
    );
  }
  if (categoryMatched && difficultyMatched && !durationMatched && topWeeks) {
    gaps.push(
      `No ${targetWeeks}-week ${answers.difficulty} ${goalLabel} program is available right now — this ${topWeeks}-week version is the closest match and delivers the same training stimulus.`
    );
  }

  if (gaps.length > 0) {
    top.reasons = [...gaps, ...top.reasons];
  }

  if (top.reasons.length === 0) {
    top.reasons.push('Best available match based on your preferences');
  }

  return top;
};