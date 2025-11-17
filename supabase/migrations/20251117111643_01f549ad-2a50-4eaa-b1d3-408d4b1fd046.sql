-- Add author fields to blog_articles table
ALTER TABLE blog_articles 
ADD COLUMN IF NOT EXISTS author_name TEXT,
ADD COLUMN IF NOT EXISTS author_credentials TEXT;

-- Add comment for documentation
COMMENT ON COLUMN blog_articles.author_name IS 'Full name of the article author (e.g., "Haris Falas")';
COMMENT ON COLUMN blog_articles.author_credentials IS 'Author credentials with line breaks (e.g., "BSc Sports Science\nEXOS Specialist\nCSCS")';