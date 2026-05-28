import { getArticlePath, getProgramPath, getWorkoutPath } from "@/lib/seo-slugs";

/**
 * Centralized route helpers for Smarty Coach suggestions.
 * Public content URLs must always use readable name slugs, never database IDs.
 */

export const getProgramUrl = (program: { category?: string | null; name?: string | null; title?: string | null; id?: string | null }): string =>
  getProgramPath(program);

export const getWorkoutUrl = (workout: { category?: string | null; name?: string | null; title?: string | null; id?: string | null }): string =>
  getWorkoutPath(workout);

export const getArticleUrl = (slug: string): string => {
  return getArticlePath({ slug });
};