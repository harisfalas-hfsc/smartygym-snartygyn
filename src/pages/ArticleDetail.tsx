import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Clock, Calendar, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareButtons } from "@/components/ShareButtons";
import { Card } from "@/components/ui/card";
import { HTMLContent } from "@/components/ui/html-content";
import { A4Container } from "@/components/ui/a4-container";
import { Badge } from "@/components/ui/badge";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ContentLoadingSkeleton } from "@/components/ContentLoadingSkeleton";
import { ReaderModeDialog } from "@/components/ReaderModeDialog";
import { generateArticleSchema, generateBreadcrumbSchema } from "@/utils/seoHelpers";
import { SEOEnhancer } from "@/components/SEOEnhancer";


export const ArticleDetail = () => {
  const [readerModeOpen, setReaderModeOpen] = useState(false);
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from('blog_articles')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) return <ContentLoadingSkeleton />;

  if (!article || error) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="p-12 text-center">
            <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The article you're looking for doesn't exist or has been unpublished.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  const articleUrl = `https://smartygym.com/blog/${article.slug}`;
  const publishedDate = new Date(article.published_at || article.created_at).toISOString();
  const modifiedDate = new Date(article.updated_at || article.created_at).toISOString();

  const articleSchema = generateArticleSchema({
    title: article.title,
    description: article.excerpt,
    datePublished: publishedDate,
    dateModified: modifiedDate,
    imageUrl: article.image_url || undefined,
    url: `/blog/${article.slug}`,
    category: article.category,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: article.title, url: `/blog/${article.slug}` },
  ]);

  return (
    <>
      <Helmet>
        <title>{article.title} | SmartyGym Blog</title>
        <meta name="description" content={article.excerpt} />
        <link rel="canonical" href={articleUrl} />
        <meta name="keywords" content={`${article.category}, SmartyGym, SmartGym, Smart-Gym, Haris Falas, fitness, health, ${article.title}`} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:site_name" content="SmartyGym" />
        {article.image_url && <meta property="og:image" content={article.image_url} />}
        {article.image_url && <meta property="og:image:width" content="1200" />}
        {article.image_url && <meta property="og:image:height" content="630" />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.excerpt} />
        {article.image_url && <meta name="twitter:image" content={article.image_url} />}
        <meta property="article:published_time" content={publishedDate} />
        <meta property="article:modified_time" content={modifiedDate} />
        <meta property="article:section" content={article.category} />
        {article.author_name && <meta property="article:author" content={article.author_name} />}
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <SEOEnhancer
        page="blog-article"
        title={article.title}
        description={article.excerpt}
        keywords={[article.category, "SmartyGym", "SmartGym", "Haris Falas", "fitness", "health"]}
      />

      <div className="min-h-screen bg-background py-2">
        <article className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-between mb-4">
            <PageBreadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Blog", href: "/blog" },
                { label: article.title },
              ]}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReaderModeOpen(true)}
              className="gap-2"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Reader Mode</span>
            </Button>
          </div>

          <ReaderModeDialog
            open={readerModeOpen}
            onOpenChange={setReaderModeOpen}
            title={article.title}
            metadata={{
              author: article.author_name || undefined,
              date: new Date(article.published_at || article.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }),
              readTime: article.read_time || '5 min read',
              category: article.category
            }}
            content={<HTMLContent content={article.content} />}
          />

          <Card className="p-6 md:p-8">
            <div className="mb-8">
              <Badge variant="secondary" className="mb-4">{article.category}</Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                {article.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{article.read_time || '5 min read'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={new Date(article.published_at || article.created_at).toISOString()}>
                    {new Date(article.published_at || article.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                </div>
              </div>

              {article.author_name && (
                <div className="flex items-start gap-2 mb-6 p-4 bg-accent/10 rounded-lg border border-border">
                  <span className="text-sm text-muted-foreground">By:</span>
                  <div>
                    <Link to="/coach-profile" className="font-semibold text-primary hover:underline whitespace-nowrap inline-block">
                      {article.author_name}
                    </Link>
                    {article.author_credentials && (
                      <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
                        {article.author_credentials.split('\n').map((line, i) => (
                          <div key={i}>{line}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {article.image_url && (
              <img src={article.image_url} alt={article.title} className="w-full h-auto rounded-lg mb-8 shadow-lg" />
            )}

            <div className="prose prose-lg max-w-none mb-8">
              <A4Container>
                <HTMLContent content={article.content} />
              </A4Container>
            </div>

            <div className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Share this article</h3>
              <ShareButtons url={articleUrl} title={article.title} />
            </div>
          </Card>

          <div className="mt-8 flex gap-4">
            <Button onClick={() => navigate('/join-premium')} className="flex-1">
              Start Your Free Trial
            </Button>
          </div>
        </article>
      </div>
    </>
  );
};
