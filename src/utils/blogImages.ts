import menOver50BellyFatImage from "@/assets/blog/how-men-over-50-belly-fat-protocol.jpg.asset.json";

const slugSpecificImages: Record<string, string> = {
  "how-men-over-50-can-lose-belly-fat-protocol": menOver50BellyFatImage.url,
};

const genericBlogFallbackImage = "/smartygym-social-share.png";

export const getBlogArticleImage = (imageUrl?: string | null, slug?: string | null) => {
  const cleanImageUrl = imageUrl?.trim();
  if (cleanImageUrl) return cleanImageUrl;
  if (slug && slugSpecificImages[slug]) return slugSpecificImages[slug];
  return genericBlogFallbackImage;
};

export const toAbsoluteBlogImageUrl = (imageUrl: string) => {
  if (imageUrl.startsWith("http")) return imageUrl;
  return `https://smartygym.com${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
};