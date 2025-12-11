import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const KEYWORD_FAMILY = [
  'online fitness platform', 'fitness', 'online gym', 'workouts', 'training programs',
  'functional training', 'strength training', 'weight loss training', 'mobility',
  'exercise at home', 'workout anywhere', 'Haris Falas', 'SmartyGym', 'online coach', 'training plans'
];

interface ContentItem {
  id: string;
  name: string;
  description?: string;
  category?: string;
  type?: string;
  content_type: 'workout' | 'program' | 'blog' | 'ritual';
}

async function generateSEOMetadata(item: ContentItem): Promise<{
  meta_title: string;
  meta_description: string;
  keywords: string[];
  json_ld: object;
  image_alt_text: string;
}> {
  if (!LOVABLE_API_KEY) {
    // Fallback without AI
    return {
      meta_title: `${item.name} | SmartyGym`,
      meta_description: item.description?.substring(0, 155) || `${item.name} - Expert-designed ${item.content_type} by Haris Falas on SmartyGym`,
      keywords: [item.name.toLowerCase(), item.category?.toLowerCase() || '', ...KEYWORD_FAMILY.slice(0, 5)].filter(Boolean),
      json_ld: generateJsonLD(item),
      image_alt_text: `${item.name} - SmartyGym ${item.content_type}`
    };
  }

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an SEO expert for SmartyGym, an online fitness platform by expert coach Haris Falas. Generate SEO metadata in JSON format only, no markdown.`
          },
          {
            role: 'user',
            content: `Generate SEO metadata for this ${item.content_type}:
Name: ${item.name}
Category: ${item.category || 'N/A'}
Description: ${item.description?.substring(0, 500) || 'N/A'}

Return ONLY valid JSON with these fields:
{
  "meta_title": "max 60 chars, include main keyword",
  "meta_description": "max 155 chars, compelling with keyword",
  "keywords": ["array", "of", "5-8", "relevant", "keywords"],
  "image_alt_text": "descriptive alt text for image"
}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_seo",
              description: "Generate SEO metadata",
              parameters: {
                type: "object",
                properties: {
                  meta_title: { type: "string" },
                  meta_description: { type: "string" },
                  keywords: { type: "array", items: { type: "string" } },
                  image_alt_text: { type: "string" }
                },
                required: ["meta_title", "meta_description", "keywords", "image_alt_text"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_seo" } }
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const seoData = JSON.parse(toolCall.function.arguments);
      return {
        meta_title: seoData.meta_title || `${item.name} | SmartyGym`,
        meta_description: seoData.meta_description || item.description?.substring(0, 155) || '',
        keywords: seoData.keywords || KEYWORD_FAMILY.slice(0, 5),
        json_ld: generateJsonLD(item),
        image_alt_text: seoData.image_alt_text || `${item.name} - SmartyGym`
      };
    }
    
    throw new Error('No tool call in response');
  } catch (error) {
    console.error(`AI SEO generation failed for ${item.name}:`, error);
    // Fallback
    return {
      meta_title: `${item.name} | SmartyGym`,
      meta_description: item.description?.substring(0, 155) || `${item.name} - Expert-designed ${item.content_type} by Haris Falas`,
      keywords: [item.name.toLowerCase(), item.category?.toLowerCase() || '', ...KEYWORD_FAMILY.slice(0, 5)].filter(Boolean),
      json_ld: generateJsonLD(item),
      image_alt_text: `${item.name} - SmartyGym ${item.content_type}`
    };
  }
}

function generateJsonLD(item: ContentItem): object {
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": item.content_type === 'blog' ? "Article" : "ExercisePlan",
    "name": item.name,
    "description": item.description?.substring(0, 200) || item.name,
    "provider": {
      "@type": "Organization",
      "name": "SmartyGym",
      "url": "https://smartygym.com"
    },
    "author": {
      "@type": "Person",
      "name": "Haris Falas",
      "jobTitle": "Sports Scientist, CSCS Certified"
    }
  };

  if (item.content_type === 'workout' || item.content_type === 'program') {
    return {
      ...baseSchema,
      "@type": "ExercisePlan",
      "exerciseType": item.category || "Fitness"
    };
  }

  return baseSchema;
}

async function generateSitemap(supabase: any): Promise<string> {
  const baseUrl = 'https://smartygym.com';
  const now = new Date().toISOString().split('T')[0];

  // Static pages
  const staticPages = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/workout', priority: '0.9', changefreq: 'daily' },
    { loc: '/trainingprogram', priority: '0.9', changefreq: 'weekly' },
    { loc: '/blog', priority: '0.8', changefreq: 'weekly' },
    { loc: '/smartyritual', priority: '0.8', changefreq: 'daily' },
    { loc: '/about', priority: '0.7', changefreq: 'monthly' },
    { loc: '/contact', priority: '0.6', changefreq: 'monthly' },
    { loc: '/tools', priority: '0.7', changefreq: 'monthly' },
    { loc: '/1rmcalculator', priority: '0.6', changefreq: 'monthly' },
    { loc: '/bmrcalculator', priority: '0.6', changefreq: 'monthly' },
    { loc: '/macrocalculator', priority: '0.6', changefreq: 'monthly' },
    { loc: '/premium', priority: '0.8', changefreq: 'monthly' },
    { loc: '/community', priority: '0.7', changefreq: 'daily' },
    { loc: '/exercise-library', priority: '0.7', changefreq: 'weekly' },
  ];

  // Fetch dynamic content
  const [workoutsResult, programsResult, blogsResult, ritualsResult] = await Promise.all([
    supabase.from('admin_workouts').select('id, updated_at').eq('is_visible', true),
    supabase.from('admin_training_programs').select('id, updated_at').eq('is_visible', true),
    supabase.from('blog_articles').select('slug, updated_at').eq('is_published', true),
    supabase.from('daily_smarty_rituals').select('ritual_date, created_at').eq('is_visible', true)
  ]);

  let urls = staticPages.map(page => `
  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);

  // Add workouts
  if (workoutsResult.data) {
    workoutsResult.data.forEach((w: any) => {
      const lastmod = w.updated_at ? new Date(w.updated_at).toISOString().split('T')[0] : now;
      urls.push(`
  <url>
    <loc>${baseUrl}/workout/${w.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
    });
  }

  // Add programs
  if (programsResult.data) {
    programsResult.data.forEach((p: any) => {
      const lastmod = p.updated_at ? new Date(p.updated_at).toISOString().split('T')[0] : now;
      urls.push(`
  <url>
    <loc>${baseUrl}/trainingprogram/${p.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
    });
  }

  // Add blog articles
  if (blogsResult.data) {
    blogsResult.data.forEach((b: any) => {
      const lastmod = b.updated_at ? new Date(b.updated_at).toISOString().split('T')[0] : now;
      urls.push(`
  <url>
    <loc>${baseUrl}/blog/${b.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
    });
  }

  // Add rituals
  if (ritualsResult.data) {
    ritualsResult.data.forEach((r: any) => {
      urls.push(`
  <url>
    <loc>${baseUrl}/smartyritual/${r.ritual_date}</loc>
    <lastmod>${r.ritual_date}</lastmod>
    <changefreq>never</changefreq>
    <priority>0.5</priority>
  </url>`);
    });
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    console.log('Starting weekly SEO refresh...');

    // Create refresh log entry
    const { data: logEntry, error: logError } = await supabase
      .from('seo_refresh_log')
      .insert({
        refresh_type: 'weekly',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (logError) {
      console.error('Failed to create log entry:', logError);
    }

    let itemsScanned = 0;
    let itemsUpdated = 0;

    // Fetch all content that needs SEO metadata
    const [workouts, programs, blogs, rituals] = await Promise.all([
      supabase.from('admin_workouts').select('id, name, description, category, type, updated_at').eq('is_visible', true),
      supabase.from('admin_training_programs').select('id, name, description, category, updated_at').eq('is_visible', true),
      supabase.from('blog_articles').select('id, title, excerpt, category, updated_at').eq('is_published', true),
      supabase.from('daily_smarty_rituals').select('id, ritual_date, morning_content, created_at').eq('is_visible', true)
    ]);

    const allContent: ContentItem[] = [];

    // Map workouts
    if (workouts.data) {
      workouts.data.forEach(w => {
        allContent.push({
          id: w.id,
          name: w.name,
          description: w.description,
          category: w.category,
          type: w.type,
          content_type: 'workout'
        });
      });
    }

    // Map programs
    if (programs.data) {
      programs.data.forEach(p => {
        allContent.push({
          id: p.id,
          name: p.name,
          description: p.description,
          category: p.category,
          content_type: 'program'
        });
      });
    }

    // Map blogs
    if (blogs.data) {
      blogs.data.forEach(b => {
        allContent.push({
          id: b.id,
          name: b.title,
          description: b.excerpt,
          category: b.category,
          content_type: 'blog'
        });
      });
    }

    // Map rituals
    if (rituals.data) {
      rituals.data.forEach(r => {
        allContent.push({
          id: r.id,
          name: `SmartyRitual - ${r.ritual_date}`,
          description: r.morning_content?.substring(0, 200),
          content_type: 'ritual'
        });
      });
    }

    itemsScanned = allContent.length;
    console.log(`Scanned ${itemsScanned} total content items`);

    // Get all existing SEO entries to avoid reprocessing
    const { data: existingSEO, error: existingSEOError } = await supabase
      .from('seo_metadata')
      .select('content_type, content_id');

    if (existingSEOError) {
      console.error('Error fetching existing SEO entries:', existingSEOError);
    }

    // Create a Set of already-optimized content IDs for fast lookup
    const existingKeys = new Set(
      (existingSEO || []).map(e => `${e.content_type}:${e.content_id}`)
    );

    const alreadyOptimized = existingKeys.size;
    console.log(`Found ${alreadyOptimized} items already optimized`);

    // Filter to only NEW items that don't have SEO yet
    const newContent = allContent.filter(item => 
      !existingKeys.has(`${item.content_type}:${item.id}`)
    );

    console.log(`Found ${newContent.length} NEW items to optimize`);

    // Process only NEW items (with rate limiting)
    for (const item of newContent) {
      try {
        const seoData = await generateSEOMetadata(item);

        // INSERT only (not upsert) since we know these are new items
        const { error: insertError } = await supabase
          .from('seo_metadata')
          .insert({
            content_type: item.content_type,
            content_id: item.id,
            meta_title: seoData.meta_title,
            meta_description: seoData.meta_description,
            keywords: seoData.keywords,
            json_ld: seoData.json_ld,
            image_alt_text: seoData.image_alt_text,
            last_refreshed_at: new Date().toISOString()
          });

        if (!insertError) {
          itemsUpdated++;
          console.log(`✓ Optimized NEW item: ${item.name}`);
        } else {
          console.error(`Failed to insert SEO for ${item.name}:`, insertError);
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error processing ${item.name}:`, error);
      }
    }

    // Generate sitemap
    console.log('Generating sitemap...');
    const sitemapXml = await generateSitemap(supabase);

    // Update log entry
    if (logEntry) {
      await supabase
        .from('seo_refresh_log')
        .update({
          completed_at: new Date().toISOString(),
          items_scanned: itemsScanned,
          items_updated: itemsUpdated,
          sitemap_generated: true,
          metadata: {
            sitemap_urls_count: (sitemapXml.match(/<url>/g) || []).length,
            already_optimized: alreadyOptimized,
            new_items_found: newContent.length
          }
        })
        .eq('id', logEntry.id);
    }

    console.log(`SEO refresh complete: ${itemsScanned} total, ${alreadyOptimized} already optimized, ${itemsUpdated} NEW items processed`);

    return new Response(JSON.stringify({
      success: true,
      items_scanned: itemsScanned,
      already_optimized: alreadyOptimized,
      new_items_found: newContent.length,
      items_updated: itemsUpdated,
      sitemap_generated: true,
      sitemap_preview: sitemapXml.substring(0, 500) + '...'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('SEO refresh error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
