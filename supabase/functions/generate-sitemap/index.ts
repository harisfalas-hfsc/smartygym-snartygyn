import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const baseUrl = 'https://smartygym.com';
    const now = new Date().toISOString().split('T')[0];

    // Static pages with priorities
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
      { loc: '/wod-archive', priority: '0.7', changefreq: 'daily' },
    ];

    // Fetch all dynamic content in parallel
    const [workoutsResult, programsResult, blogsResult, ritualsResult] = await Promise.all([
      supabase.from('admin_workouts').select('id, updated_at').eq('is_visible', true),
      supabase.from('admin_training_programs').select('id, updated_at').eq('is_visible', true),
      supabase.from('blog_articles').select('slug, updated_at').eq('is_published', true),
      supabase.from('daily_smarty_rituals').select('ritual_date, created_at').eq('is_visible', true)
    ]);

    // Build URL entries
    let urls: string[] = [];

    // Static pages
    staticPages.forEach(page => {
      urls.push(`
  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
    });

    // Workouts
    if (workoutsResult.data) {
      workoutsResult.data.forEach((workout: any) => {
        const lastmod = workout.updated_at 
          ? new Date(workout.updated_at).toISOString().split('T')[0] 
          : now;
        urls.push(`
  <url>
    <loc>${baseUrl}/workout/${workout.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
      });
    }

    // Training Programs
    if (programsResult.data) {
      programsResult.data.forEach((program: any) => {
        const lastmod = program.updated_at 
          ? new Date(program.updated_at).toISOString().split('T')[0] 
          : now;
        urls.push(`
  <url>
    <loc>${baseUrl}/trainingprogram/${program.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
      });
    }

    // Blog Articles
    if (blogsResult.data) {
      blogsResult.data.forEach((blog: any) => {
        const lastmod = blog.updated_at 
          ? new Date(blog.updated_at).toISOString().split('T')[0] 
          : now;
        urls.push(`
  <url>
    <loc>${baseUrl}/blog/${blog.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
      });
    }

    // Daily Rituals
    if (ritualsResult.data) {
      ritualsResult.data.forEach((ritual: any) => {
        urls.push(`
  <url>
    <loc>${baseUrl}/smartyritual/${ritual.ritual_date}</loc>
    <lastmod>${ritual.ritual_date}</lastmod>
    <changefreq>never</changefreq>
    <priority>0.5</priority>
  </url>`);
      });
    }

    // Build final XML
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`;

    console.log(`Generated sitemap with ${urls.length} URLs`);

    // Check if caller wants XML or JSON response
    const url = new URL(req.url);
    const format = url.searchParams.get('format');

    if (format === 'json') {
      return new Response(JSON.stringify({
        success: true,
        total_urls: urls.length,
        breakdown: {
          static_pages: staticPages.length,
          workouts: workoutsResult.data?.length || 0,
          programs: programsResult.data?.length || 0,
          blogs: blogsResult.data?.length || 0,
          rituals: ritualsResult.data?.length || 0
        },
        generated_at: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Return XML sitemap
    return new Response(sitemapXml, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
