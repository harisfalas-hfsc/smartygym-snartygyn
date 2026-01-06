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

    // Static pages with priorities - subscription pages have high priority for conversion
    const staticPages = [
      { loc: '/', priority: '1.0', changefreq: 'daily' },
      { loc: '/workout', priority: '0.9', changefreq: 'daily' },
      { loc: '/trainingprogram', priority: '0.9', changefreq: 'weekly' },
      { loc: '/join-premium', priority: '0.95', changefreq: 'weekly' }, // High priority - subscription page
      { loc: '/smarty-plans', priority: '0.95', changefreq: 'weekly' }, // High priority - plan comparison page
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
      { loc: '/coach-profile', priority: '0.8', changefreq: 'monthly' },
      { loc: '/faq', priority: '0.6', changefreq: 'monthly' },
      { loc: '/terms', priority: '0.3', changefreq: 'yearly' },
      { loc: '/privacy', priority: '0.3', changefreq: 'yearly' },
    ];

    // Workout category pages (including micro-workouts)
    const workoutCategories = [
      'strength', 'calorie-burning', 'metabolic', 'cardio', 
      'mobility', 'challenge', 'pilates', 'recovery', 'micro-workouts'
    ];
    
    // Program category pages
    const programCategories = [
      'cardio-endurance', 'functional-strength', 'muscle-hypertrophy',
      'weight-loss', 'low-back-pain', 'mobility-stability'
    ];

    // Fetch all dynamic content in parallel with images
    const [workoutsResult, programsResult, blogsResult, ritualsResult] = await Promise.all([
      supabase.from('admin_workouts').select('id, name, description, category, format, duration, equipment, difficulty, image_url, updated_at, created_at').eq('is_visible', true),
      supabase.from('admin_training_programs').select('id, name, description, category, weeks, days_per_week, equipment, difficulty, image_url, updated_at, created_at').eq('is_visible', true),
      supabase.from('blog_articles').select('slug, title, excerpt, category, image_url, updated_at, created_at, author_name').eq('is_published', true),
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

    // Workout category pages
    workoutCategories.forEach(category => {
      urls.push(`
  <url>
    <loc>${baseUrl}/workout/${category}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`);
    });

    // Program category pages
    programCategories.forEach(category => {
      urls.push(`
  <url>
    <loc>${baseUrl}/trainingprogram/${category}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
    });

    // Individual Workouts with image sitemaps
    if (workoutsResult.data) {
      workoutsResult.data.forEach((workout: any) => {
        const lastmod = workout.updated_at 
          ? new Date(workout.updated_at).toISOString().split('T')[0] 
          : workout.created_at 
            ? new Date(workout.created_at).toISOString().split('T')[0]
            : now;
        
        // Generate SEO-optimized alt text for image with micro-workout enhancements
        const isMicroWorkout = workout.category?.toLowerCase().includes('micro');
        const microKeywords = isMicroWorkout ? '5 minute workout - quick exercise snack - office workout - desk workout - ' : '';
        const imageAlt = `${workout.name} - ${microKeywords}${workout.difficulty || 'Professional'} ${workout.format || ''} ${workout.category || ''} workout by Sports Scientist Haris Falas | SmartyGym.com`.trim();
        const imageCaption = `${microKeywords}${workout.duration || ''} ${workout.equipment || ''} ${isMicroWorkout ? 'micro-workout - mini workout - small workout - ' : ''}designed by Sports Scientist Haris Falas - smartygym.com`.trim();
        
        let urlEntry = `
  <url>
    <loc>${baseUrl}/individualworkout/${workout.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>`;
        
        // Add image sitemap if image exists
        if (workout.image_url) {
          urlEntry += `
    <image:image>
      <image:loc>${workout.image_url}</image:loc>
      <image:title>${escapeXml(imageAlt)}</image:title>
      <image:caption>${escapeXml(imageCaption)}</image:caption>
    </image:image>`;
        }
        
        urlEntry += `
  </url>`;
        urls.push(urlEntry);
      });
    }

    // Individual Training Programs with image sitemaps
    if (programsResult.data) {
      programsResult.data.forEach((program: any) => {
        const lastmod = program.updated_at 
          ? new Date(program.updated_at).toISOString().split('T')[0] 
          : program.created_at
            ? new Date(program.created_at).toISOString().split('T')[0]
            : now;
        
        // Generate SEO-optimized alt text for image
        const imageAlt = `${program.name} - ${program.weeks || ''} week ${program.category || ''} training program by Haris Falas | SmartyGym`.trim();
        const imageCaption = `${program.days_per_week || ''} days/week ${program.equipment || ''} program designed by Sports Scientist Haris Falas`.trim();
        
        let urlEntry = `
  <url>
    <loc>${baseUrl}/individualtrainingprogram/${program.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>`;
        
        // Add image sitemap if image exists
        if (program.image_url) {
          urlEntry += `
    <image:image>
      <image:loc>${program.image_url}</image:loc>
      <image:title>${escapeXml(imageAlt)}</image:title>
      <image:caption>${escapeXml(imageCaption)}</image:caption>
    </image:image>`;
        }
        
        urlEntry += `
  </url>`;
        urls.push(urlEntry);
      });
    }

    // Blog Articles with image sitemaps
    if (blogsResult.data) {
      blogsResult.data.forEach((blog: any) => {
        const lastmod = blog.updated_at 
          ? new Date(blog.updated_at).toISOString().split('T')[0] 
          : blog.created_at
            ? new Date(blog.created_at).toISOString().split('T')[0]
            : now;
        
        let urlEntry = `
  <url>
    <loc>${baseUrl}/blog/${blog.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>`;
        
        // Add image sitemap if image exists
        if (blog.image_url) {
          const imageAlt = `${blog.title} - ${blog.category || 'Fitness'} article by ${blog.author_name || 'Haris Falas'} | SmartyGym Blog`.trim();
          urlEntry += `
    <image:image>
      <image:loc>${blog.image_url}</image:loc>
      <image:title>${escapeXml(imageAlt)}</image:title>
    </image:image>`;
        }
        
        urlEntry += `
  </url>`;
        urls.push(urlEntry);
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

    // Build final XML with image namespace
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
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
          workout_categories: workoutCategories.length,
          program_categories: programCategories.length,
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

// Helper function to escape XML special characters
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
