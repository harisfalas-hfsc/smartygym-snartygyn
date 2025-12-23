import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const ADMIN_EMAIL = 'info@smartygym.com';

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

interface OptimizedItem {
  name: string;
  content_type: string;
  meta_title: string;
  category?: string;
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

async function generateSitemap(supabase: any): Promise<{ xml: string; totalUrls: number; staticUrls: number; dynamicUrls: number }> {
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

  let dynamicCount = 0;

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
      dynamicCount++;
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
      dynamicCount++;
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
      dynamicCount++;
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
      dynamicCount++;
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`;

  return {
    xml,
    totalUrls: staticPages.length + dynamicCount,
    staticUrls: staticPages.length,
    dynamicUrls: dynamicCount
  };
}

function generateEmailReport(data: {
  runDate: string;
  durationSeconds: number;
  totalScanned: number;
  alreadyOptimized: number;
  newItemsOptimized: number;
  optimizedItems: OptimizedItem[];
  unchangedByType: { workouts: number; programs: number; blogs: number; rituals: number };
  sitemapStats: { totalUrls: number; staticUrls: number; dynamicUrls: number };
}): { subject: string; html: string; downloadableHtml: string } {
  const { runDate, durationSeconds, totalScanned, alreadyOptimized, newItemsOptimized, optimizedItems, unchangedByType, sitemapStats } = data;
  
  const statusEmoji = newItemsOptimized > 0 ? '✨' : '✅';
  const subject = `${statusEmoji} SEO Report - ${runDate} | ${newItemsOptimized} New Items Optimized`;

  const optimizedItemsHtml = optimizedItems.length > 0 
    ? optimizedItems.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.content_type.charAt(0).toUpperCase() + item.content_type.slice(1)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: 500;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #059669;">${item.meta_title}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.category || '-'}</td>
      </tr>
    `).join('')
    : `<tr><td colspan="4" style="padding: 16px; text-align: center; color: #6b7280;">No new items to optimize this week</td></tr>`;

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SmartyGym SEO Report - ${runDate}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px;">
  <div style="max-width: 800px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px; color: white;">
      <h1 style="margin: 0 0 8px 0; font-size: 24px;">📊 SmartyGym SEO Optimization Report</h1>
      <p style="margin: 0; opacity: 0.9;">Weekly Automated SEO Refresh Complete</p>
    </div>
    
    <!-- Summary Cards -->
    <div style="padding: 24px;">
      <div style="display: grid; gap: 16px; margin-bottom: 24px;">
        <div style="background: #f0fdf4; border-radius: 8px; padding: 16px; border-left: 4px solid #10b981;">
          <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">📅 Run Date</p>
          <p style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">${runDate}</p>
        </div>
        <div style="background: #eff6ff; border-radius: 8px; padding: 16px; border-left: 4px solid #3b82f6;">
          <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">⏱️ Duration</p>
          <p style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">${durationSeconds} seconds</p>
        </div>
      </div>

      <!-- Metrics -->
      <h2 style="color: #111827; font-size: 18px; margin: 24px 0 16px 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">📈 Summary Metrics</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr>
          <td style="padding: 12px; background: #f9fafb; border-radius: 6px 0 0 0; font-weight: 500;">Total Items Scanned</td>
          <td style="padding: 12px; background: #f9fafb; border-radius: 0 6px 0 0; text-align: right; font-weight: 600; color: #3b82f6;">${totalScanned}</td>
        </tr>
        <tr>
          <td style="padding: 12px; font-weight: 500;">Already Optimized (Unchanged)</td>
          <td style="padding: 12px; text-align: right; font-weight: 600; color: #6b7280;">${alreadyOptimized}</td>
        </tr>
        <tr>
          <td style="padding: 12px; background: #f0fdf4; border-radius: 0 0 0 6px; font-weight: 500;">New Items Optimized</td>
          <td style="padding: 12px; background: #f0fdf4; border-radius: 0 0 6px 0; text-align: right; font-weight: 600; color: #059669;">${newItemsOptimized}</td>
        </tr>
      </table>

      <!-- New Optimized Items -->
      <h2 style="color: #111827; font-size: 18px; margin: 24px 0 16px 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">✨ New Content Optimized</h2>
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="background: #f9fafb;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Type</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Name</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Generated Title</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Category</th>
            </tr>
          </thead>
          <tbody>
            ${optimizedItemsHtml}
          </tbody>
        </table>
      </div>

      <!-- Unchanged Items Breakdown -->
      <h2 style="color: #111827; font-size: 18px; margin: 24px 0 16px 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">📋 Unchanged Items Breakdown</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr>
          <td style="padding: 12px; background: #fef3c7; border-radius: 6px 0 0 6px;">🏋️ Workouts</td>
          <td style="padding: 12px; background: #fef3c7; text-align: right; font-weight: 600;">${unchangedByType.workouts}</td>
        </tr>
        <tr>
          <td style="padding: 12px;">📚 Programs</td>
          <td style="padding: 12px; text-align: right; font-weight: 600;">${unchangedByType.programs}</td>
        </tr>
        <tr>
          <td style="padding: 12px; background: #fef3c7;">📝 Blogs</td>
          <td style="padding: 12px; background: #fef3c7; text-align: right; font-weight: 600;">${unchangedByType.blogs}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-radius: 0 0 0 6px;">🧘 Rituals</td>
          <td style="padding: 12px; border-radius: 0 0 6px 0; text-align: right; font-weight: 600;">${unchangedByType.rituals}</td>
        </tr>
      </table>

      <!-- Sitemap Status -->
      <h2 style="color: #111827; font-size: 18px; margin: 24px 0 16px 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">🗺️ Sitemap Status</h2>
      <div style="background: #f0fdf4; border-radius: 8px; padding: 16px; border: 1px solid #bbf7d0;">
        <p style="margin: 0 0 8px 0;"><strong>✅ Generated:</strong> Yes</p>
        <p style="margin: 0 0 8px 0;"><strong>📊 Total URLs:</strong> ${sitemapStats.totalUrls}</p>
        <p style="margin: 0 0 8px 0;"><strong>📄 Static Pages:</strong> ${sitemapStats.staticUrls}</p>
        <p style="margin: 0;"><strong>🔄 Dynamic Content:</strong> ${sitemapStats.dynamicUrls}</p>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">This is an automated report from SmartyGym SEO System</p>
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">© ${new Date().getFullYear()} SmartyGym. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  // Downloadable version with print styles
  const downloadableHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SmartyGym SEO Report - ${runDate}</title>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .no-print { display: none !important; }
    }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; }
    .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px; color: white; }
    .header h1 { margin: 0 0 8px 0; font-size: 24px; }
    .header p { margin: 0; opacity: 0.9; }
    .content { padding: 24px; }
    .card { background: #f0fdf4; border-radius: 8px; padding: 16px; border-left: 4px solid #10b981; margin-bottom: 16px; }
    .card.blue { background: #eff6ff; border-left-color: #3b82f6; }
    .card label { margin: 0 0 8px 0; color: #6b7280; font-size: 14px; display: block; }
    .card value { margin: 0; font-size: 18px; font-weight: 600; color: #111827; }
    h2 { color: #111827; font-size: 18px; margin: 24px 0 16px 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f9fafb; font-weight: 600; }
    .metric-row:nth-child(odd) { background: #f9fafb; }
    .highlight { color: #059669; font-weight: 600; }
    .footer { background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb; }
    .download-btn { display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0; cursor: pointer; border: none; font-size: 14px; }
    .download-btn:hover { background: #059669; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 SmartyGym SEO Optimization Report</h1>
      <p>Weekly Automated SEO Refresh Complete</p>
    </div>
    
    <div class="content">
      <div class="no-print" style="text-align: center; margin-bottom: 24px;">
        <button class="download-btn" onclick="window.print()">📥 Download / Print Report</button>
      </div>

      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <div class="card" style="flex: 1; min-width: 200px;">
          <label>📅 Run Date</label>
          <value>${runDate}</value>
        </div>
        <div class="card blue" style="flex: 1; min-width: 200px;">
          <label>⏱️ Duration</label>
          <value>${durationSeconds} seconds</value>
        </div>
      </div>

      <h2>📈 Summary Metrics</h2>
      <table>
        <tr class="metric-row">
          <td>Total Items Scanned</td>
          <td style="text-align: right; font-weight: 600; color: #3b82f6;">${totalScanned}</td>
        </tr>
        <tr class="metric-row">
          <td>Already Optimized (Unchanged)</td>
          <td style="text-align: right; font-weight: 600; color: #6b7280;">${alreadyOptimized}</td>
        </tr>
        <tr class="metric-row">
          <td>New Items Optimized</td>
          <td style="text-align: right; font-weight: 600; color: #059669;">${newItemsOptimized}</td>
        </tr>
      </table>

      <h2>✨ New Content Optimized</h2>
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Name</th>
            <th>Generated Title</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          ${optimizedItemsHtml}
        </tbody>
      </table>

      <h2>📋 Unchanged Items Breakdown</h2>
      <table>
        <tr class="metric-row">
          <td>🏋️ Workouts</td>
          <td style="text-align: right; font-weight: 600;">${unchangedByType.workouts}</td>
        </tr>
        <tr class="metric-row">
          <td>📚 Programs</td>
          <td style="text-align: right; font-weight: 600;">${unchangedByType.programs}</td>
        </tr>
        <tr class="metric-row">
          <td>📝 Blogs</td>
          <td style="text-align: right; font-weight: 600;">${unchangedByType.blogs}</td>
        </tr>
        <tr class="metric-row">
          <td>🧘 Rituals</td>
          <td style="text-align: right; font-weight: 600;">${unchangedByType.rituals}</td>
        </tr>
      </table>

      <h2>🗺️ Sitemap Status</h2>
      <div class="card">
        <p style="margin: 0 0 8px 0;"><strong>✅ Generated:</strong> Yes</p>
        <p style="margin: 0 0 8px 0;"><strong>📊 Total URLs:</strong> ${sitemapStats.totalUrls}</p>
        <p style="margin: 0 0 8px 0;"><strong>📄 Static Pages:</strong> ${sitemapStats.staticUrls}</p>
        <p style="margin: 0;"><strong>🔄 Dynamic Content:</strong> ${sitemapStats.dynamicUrls}</p>
      </div>
    </div>
    
    <div class="footer">
      <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">This is an automated report from SmartyGym SEO System</p>
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">© ${new Date().getFullYear()} SmartyGym. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  return { subject, html: emailHtml, downloadableHtml };
}

async function sendEmailReport(reportData: {
  runDate: string;
  durationSeconds: number;
  totalScanned: number;
  alreadyOptimized: number;
  newItemsOptimized: number;
  optimizedItems: OptimizedItem[];
  unchangedByType: { workouts: number; programs: number; blogs: number; rituals: number };
  sitemapStats: { totalUrls: number; staticUrls: number; dynamicUrls: number };
}): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.log('RESEND_API_KEY not configured, skipping email report');
    return false;
  }

  try {
    const resend = new Resend(RESEND_API_KEY);
    const { subject, html, downloadableHtml } = generateEmailReport(reportData);

    // Create a base64 encoded HTML attachment
    const encoder = new TextEncoder();
    const htmlBytes = encoder.encode(downloadableHtml);
    const base64Html = btoa(String.fromCharCode(...htmlBytes));

    const { error } = await resend.emails.send({
      from: 'SmartyGym SEO <info@smartygym.com>',
      to: [ADMIN_EMAIL],
      subject: subject,
      html: html,
      attachments: [
        {
          filename: `seo-report-${reportData.runDate.replace(/[^\d]/g, '-')}.html`,
          content: base64Html
        }
      ]
    });

    if (error) {
      console.error('Failed to send email report:', error);
      return false;
    }

    console.log('✅ Email report sent successfully to', ADMIN_EMAIL);
    return true;
  } catch (error) {
    console.error('Error sending email report:', error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const startTime = Date.now();

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
    const optimizedItems: OptimizedItem[] = [];

    // Fetch all content that needs SEO metadata
    const [workouts, programs, blogs, rituals] = await Promise.all([
      supabase.from('admin_workouts').select('id, name, description, category, type, updated_at').eq('is_visible', true),
      supabase.from('admin_training_programs').select('id, name, description, category, updated_at').eq('is_visible', true),
      supabase.from('blog_articles').select('id, title, excerpt, category, updated_at').eq('is_published', true),
      supabase.from('daily_smarty_rituals').select('id, ritual_date, morning_content, created_at').eq('is_visible', true)
    ]);

    const allContent: ContentItem[] = [];
    const contentCounts = {
      workouts: workouts.data?.length || 0,
      programs: programs.data?.length || 0,
      blogs: blogs.data?.length || 0,
      rituals: rituals.data?.length || 0
    };

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

    // Count unchanged items by type
    const unchangedByType = {
      workouts: 0,
      programs: 0,
      blogs: 0,
      rituals: 0
    };

    allContent.forEach(item => {
      if (existingKeys.has(`${item.content_type}:${item.id}`)) {
        if (item.content_type === 'workout') unchangedByType.workouts++;
        else if (item.content_type === 'program') unchangedByType.programs++;
        else if (item.content_type === 'blog') unchangedByType.blogs++;
        else if (item.content_type === 'ritual') unchangedByType.rituals++;
      }
    });

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
          optimizedItems.push({
            name: item.name,
            content_type: item.content_type,
            meta_title: seoData.meta_title,
            category: item.category
          });
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
    const sitemapResult = await generateSitemap(supabase);

    const endTime = Date.now();
    const durationSeconds = Math.round((endTime - startTime) / 1000);
    const runDate = new Date().toLocaleString('en-US', { 
      dateStyle: 'full', 
      timeStyle: 'short',
      timeZone: 'UTC'
    }) + ' UTC';

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
            sitemap_urls_count: sitemapResult.totalUrls,
            already_optimized: alreadyOptimized,
            new_items_found: newContent.length,
            duration_seconds: durationSeconds,
            email_sent: RESEND_API_KEY ? true : false
          }
        })
        .eq('id', logEntry.id);
    }

    // Send email report
    const emailSent = await sendEmailReport({
      runDate,
      durationSeconds,
      totalScanned: itemsScanned,
      alreadyOptimized,
      newItemsOptimized: itemsUpdated,
      optimizedItems,
      unchangedByType,
      sitemapStats: {
        totalUrls: sitemapResult.totalUrls,
        staticUrls: sitemapResult.staticUrls,
        dynamicUrls: sitemapResult.dynamicUrls
      }
    });

    console.log(`SEO refresh complete: ${itemsScanned} total, ${alreadyOptimized} already optimized, ${itemsUpdated} NEW items processed`);
    console.log(`Email report ${emailSent ? 'sent' : 'skipped'}`);

    return new Response(JSON.stringify({
      success: true,
      items_scanned: itemsScanned,
      already_optimized: alreadyOptimized,
      new_items_found: newContent.length,
      items_updated: itemsUpdated,
      sitemap_generated: true,
      sitemap_urls: sitemapResult.totalUrls,
      duration_seconds: durationSeconds,
      email_sent: emailSent,
      sitemap_preview: sitemapResult.xml.substring(0, 500) + '...'
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
