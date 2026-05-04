import { SmartyContext } from "@/hooks/useSmartyContext";
import { PROGRAM_CATEGORY_FAMILIES, GOAL_LABELS, familyRank } from "./categoryFamilies";

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
  // Internal diagnostic fields used for tie-breaking and explanation
  _famRank: number;
  _diffDiff: number;
  _weekDiff: number;
  _equipmentMatched: boolean;
}

const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'];

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
  if (eq === 'bodyweight') return true;
  return false;
};

const requiresEquipment = (equipment: string | null | undefined): boolean => !isBodyweightOnly(equipment);

const formatGoalLabel = (key: string): string => GOAL_LABELS[key] || key;

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
  const targetWeeks = parseInt(answers.duration.replace(/\D/g, ''), 10) || 0;
  const targetDifficulty = answers.difficulty.toLowerCase();
  const targetDiffIdx = DIFFICULTY_LEVELS.indexOf(targetDifficulty);
  const itemDiffIdx = DIFFICULTY_LEVELS.indexOf(difficultyLower);
  const diffDiff = (targetDiffIdx >= 0 && itemDiffIdx >= 0) ? Math.abs(targetDiffIdx - itemDiffIdx) : 99;
  const weekDiff = itemWeeks ? Math.abs(itemWeeks - targetWeeks) : 99;

  // === COMPLETED / ONGOING DEPRIORITIZATION (soft, not hard) ===
  const completedProgramIds = context.programInteractions.filter(p => p.is_completed).map(p => p.program_id);
  const ongoingProgramIds = context.programInteractions.filter(p => p.is_ongoing).map(p => p.program_id);
  const isCompletedOrOngoing = completedProgramIds.includes(item.id) || ongoingProgramIds.includes(item.id);

  // === CATEGORY (HIGHEST WEIGHT) ===
  const famRank = familyRank(PROGRAM_CATEGORY_FAMILIES, answers.category, categoryUpper);
  if (famRank === 0) {
    score += 1000;
  } else if (famRank > 0) {
    // Strong fallback decay
    score += 400 - (famRank * 60);
  } else {
    score -= 400;
  }

  // === DIFFICULTY (SECOND) ===
  if (difficultyLower === targetDifficulty) {
    score += 300;
  } else if (diffDiff === 1) {
    score += 80;
  } else {
    score -= 100;
  }

  // === DURATION (THIRD) ===
  if (itemWeeks && targetWeeks) {
    if (weekDiff === 0) score += 150;
    else if (weekDiff <= 2) score += 70;
    else if (weekDiff <= 4) score += 30;
    else score -= 20;
  }

  // === EQUIPMENT (FOURTH) ===
  const itemBodyweight = isBodyweightOnly(item.equipment);
  const itemNeedsEquipment = requiresEquipment(item.equipment);
  let equipmentMatched = false;
  if (answers.equipment === 'bodyweight') {
    if (itemBodyweight) { score += 80; equipmentMatched = true; }
    else { score -= 250; } // strong penalty but NOT hard exclude — we still want a fallback
  } else {
    if (itemNeedsEquipment) { score += 80; equipmentMatched = true; }
    else { score += 10; } // bodyweight still usable when user has equipment
  }

  // === SOFT PENALTY for already done ===
  if (isCompletedOrOngoing) score -= 200;

  return {
    item, score, reasons,
    _famRank: famRank,
    _diffDiff: diffDiff,
    _weekDiff: weekDiff,
    _equipmentMatched: equipmentMatched,
  };
};

const buildExplanations = (top: ScoredProgram, answers: ProgramAnswers): string[] => {
  const reasons: string[] = [];
  const goalLabel = formatGoalLabel(answers.category);
  const cat = top.item.category || '';
  const diff = top.item.difficulty || '';
  const itemWeeks = parseProgramWeeks(top.item.duration, top.item.weeks);
  const targetWeeks = parseInt(answers.duration.replace(/\D/g, ''), 10) || 0;
  const targetDifficulty = answers.difficulty.toLowerCase();

  const exactCategory = top._famRank === 0;
  const fallbackCategory = top._famRank > 0;
  const exactDifficulty = diff.toLowerCase() === targetDifficulty;
  const exactDuration = itemWeeks === targetWeeks;

  const allMatch = exactCategory && exactDifficulty && exactDuration && top._equipmentMatched;

  if (allMatch) {
    reasons.push(`Perfect match for your ${goalLabel} goal at ${diff} level over ${itemWeeks} weeks.`);
    reasons.push(`Uses ${answers.equipment === 'bodyweight' ? 'bodyweight only' : 'the equipment you have available'} — no compromise needed.`);
    return reasons;
  }

  // Lead with an honest framing line
  reasons.push(`We don't currently have a program that matches every choice you made — this is the closest professional fit available.`);

  if (exactCategory) {
    reasons.push(`Matches your ${goalLabel} goal exactly.`);
  } else if (fallbackCategory) {
    reasons.push(`No ${goalLabel} program fits all your other criteria, so we picked a ${cat.toLowerCase()} program — it delivers similar training benefits and supports the same outcome.`);
  }

  if (exactDifficulty) {
    reasons.push(`${diff} level matches your experience.`);
  } else if (diff) {
    reasons.push(`Difficulty is ${diff} — the closest level available; you can scale intensity to match your ${targetDifficulty} ability.`);
  }

  if (itemWeeks) {
    if (exactDuration) {
      reasons.push(`${itemWeeks}-week duration fits your timeline exactly.`);
    } else if (itemWeeks < targetWeeks) {
      reasons.push(`This is a ${itemWeeks}-week program (you asked for ${targetWeeks}) — you can repeat the cycle or progress to a longer program afterwards.`);
    } else {
      reasons.push(`This is a ${itemWeeks}-week program (you asked for ${targetWeeks}) — slightly longer, giving you more progressive overload.`);
    }
  }

  if (top._equipmentMatched) {
    reasons.push(answers.equipment === 'bodyweight' ? 'No equipment needed.' : 'Uses the equipment you have available.');
  } else if (answers.equipment === 'bodyweight') {
    reasons.push(`This program normally uses equipment — most movements can be substituted with bodyweight progressions if needed.`);
  } else {
    reasons.push(`This program is bodyweight-based — your equipment isn't required, but you can add load to advanced exercises.`);
  }

  return reasons;
};

export const generateProgramSuggestion = (
  programs: ProgramItem[],
  answers: ProgramAnswers,
  context: SmartyContext
): ScoredProgram | null => {
  if (programs.length === 0) return null;

  const scored = programs.map(item => scoreProgramItem(item, answers, context));
  // Keep everything — we want a recommendation even when nothing is great
  scored.sort((a, b) => {
    // 1. Category family rank (lower = better, -1 worst)
    const aFam = a._famRank === -1 ? 999 : a._famRank;
    const bFam = b._famRank === -1 ? 999 : b._famRank;
    if (aFam !== bFam) return aFam - bFam;
    // 2. Difficulty proximity
    if (a._diffDiff !== b._diffDiff) return a._diffDiff - b._diffDiff;
    // 3. Duration proximity
    if (a._weekDiff !== b._weekDiff) return a._weekDiff - b._weekDiff;
    // 4. Equipment match
    if (a._equipmentMatched !== b._equipmentMatched) return a._equipmentMatched ? -1 : 1;
    // 5. Total score
    return b.score - a.score;
  });

  const top = scored[0];
  if (!top) return null;

  top.reasons = buildExplanations(top, answers);
  return top;
};
