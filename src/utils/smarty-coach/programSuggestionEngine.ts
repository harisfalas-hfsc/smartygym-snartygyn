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

export const scoreProgramItem = (
  item: ProgramItem,
  answers: ProgramAnswers,
  context: SmartyContext
): ScoredProgram => {
  let score = 0;
  const reasons: string[] = [];
  const categoryUpper = item.category?.toUpperCase() || '';
  const difficultyLower = item.difficulty?.toLowerCase() || '';
  const itemEquipment = item.equipment?.toLowerCase() || '';
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

  // === CATEGORY MATCH ===
  const targetCategories = CATEGORY_MAP[answers.category] || [];
  const matchesCategory = targetCategories.some(cat => categoryUpper.includes(cat));
  if (matchesCategory) {
    score += 50;
    reasons.push(`Matches your ${item.category} goal`);
  }

  // === DIFFICULTY MATCH ===
  if (difficultyLower === answers.difficulty.toLowerCase()) {
    score += 30;
    reasons.push(`${item.difficulty} difficulty — perfect for your level`);
  } else {
    // Adjacent difficulty gets partial credit
    const levels = ['beginner', 'intermediate', 'advanced'];
    const targetIdx = levels.indexOf(answers.difficulty.toLowerCase());
    const itemIdx = levels.indexOf(difficultyLower);
    if (Math.abs(targetIdx - itemIdx) === 1) {
      score += 10;
    }
  }

  // === DURATION MATCH ===
  const targetWeeks = parseInt(answers.duration.replace(/\D/g, ''), 10);
  if (itemWeeks && targetWeeks) {
    if (itemWeeks === targetWeeks) {
      score += 25;
      reasons.push(`${itemWeeks}-week program fits your timeline`);
    } else if (Math.abs(itemWeeks - targetWeeks) <= 2) {
      score += 10;
      reasons.push(`${itemWeeks} weeks — close to your preferred duration`);
    }
  }

  // === EQUIPMENT MATCH ===
  if (answers.equipment === 'bodyweight') {
    const isBodyweight = itemEquipment.includes('bodyweight') || 
                         itemEquipment.includes('no equipment') ||
                         itemEquipment === '' || !item.equipment;
    if (isBodyweight) {
      score += 15;
      reasons.push('No equipment needed');
    } else {
      score -= 30;
    }
  } else {
    score += 5;
  }

  return { item, score, reasons };
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
    // All programs excluded (completed/ongoing) — no suggestion possible
    return null;
  }

  validItems.sort((a, b) => b.score - a.score);
  const top = validItems[0];
  
  // Add fallback context when no strong match reasons exist
  if (top.reasons.length === 0 || top.score < 30) {
    const targetWeeks = parseInt(answers.duration.replace(/\D/g, ''), 10);
    const itemWeeks = parseProgramWeeks(top.item.duration, top.item.weeks);
    
    if (targetWeeks && itemWeeks && targetWeeks !== itemWeeks) {
      top.reasons.unshift(
        `No ${targetWeeks}-week program is available for this combination right now`
      );
      top.reasons.push(
        `This ${itemWeeks}-week option is the closest match for your goal and level`
      );
    }
    
    if (top.reasons.length === 0) {
      top.reasons.push('Best available match based on your preferences');
    }
  }

  return top;
};