export interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  image_url: string | null;
  published_at: string | null;
  read_time: string | null;
}

export interface KnowledgeAnswers {
  category: string;
  recency: 'new' | 'classic';
}

export interface ScoredArticle {
  item: ArticleItem;
  score: number;
  reasons: string[];
}

export const generateKnowledgeSuggestion = (
  articles: ArticleItem[],
  answers: KnowledgeAnswers,
  viewedArticleIds: string[]
): ScoredArticle | null => {
  if (articles.length === 0) return null;

  // Filter by category
  const categoryLower = answers.category.toLowerCase();
  let filtered = articles.filter(a => 
    a.category?.toLowerCase() === categoryLower
  );

  // If no match, use all
  if (filtered.length === 0) filtered = articles;

  // Score
  const scored: ScoredArticle[] = filtered.map(article => {
    let score = 0;
    const reasons: string[] = [];

    // Category match
    if (article.category?.toLowerCase() === categoryLower) {
      score += 30;
      reasons.push(`${article.category} article — matches your interest`);
    }

    // Unread bonus
    if (!viewedArticleIds.includes(article.id)) {
      score += 20;
      reasons.push("You haven't read this one yet");
    } else {
      score -= 10;
    }

    // Recency scoring
    if (answers.recency === 'new') {
      if (article.published_at) {
        const publishedDate = new Date(article.published_at);
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
        if (publishedDate >= fourteenDaysAgo) {
          score += 25;
          reasons.push('Recently published — fresh content');
        }
      }
    } else {
      // Classic: prefer older articles
      if (article.published_at) {
        const publishedDate = new Date(article.published_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        if (publishedDate < thirtyDaysAgo) {
          score += 20;
          reasons.push('A classic read worth revisiting');
        }
      }
    }

    return { item: article, score, reasons };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored[0];
  
  if (top.reasons.length === 0) {
    top.reasons.push('Suggested article for you');
  }

  return top;
};