 // IndexNow Ping Edge Function
 // Instantly notifies Bing/Yandex when SmartyGym content is created or updated
 // This speeds up indexing for AI search systems that rely on Bing (ChatGPT, Perplexity)
 
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
 };
 
 // IndexNow API endpoints
 const INDEXNOW_ENDPOINTS = {
   bing: 'https://www.bing.com/indexnow',
   yandex: 'https://yandex.com/indexnow',
   naver: 'https://searchadvisor.naver.com/indexnow',
   seznam: 'https://search.seznam.cz/indexnow',
 };
 
 // SmartyGym host
 const HOST = 'smartygym.com';
 
 // IndexNow key - stored in the key file at /{key}.txt
 // Note: You need to create this key file and register with IndexNow
 const INDEXNOW_KEY = Deno.env.get('INDEXNOW_KEY') || 'smartygym-indexnow-key';
 
 interface PingRequest {
   urls?: string[];
   url?: string;
   contentType?: 'workout' | 'program' | 'article' | 'page';
   contentId?: string;
 }
 
 Deno.serve(async (req) => {
   // Handle CORS preflight
   if (req.method === 'OPTIONS') {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const body: PingRequest = await req.json();
     
     // Collect URLs to submit
     let urlsToSubmit: string[] = [];
     
     if (body.urls && body.urls.length > 0) {
       urlsToSubmit = body.urls;
     } else if (body.url) {
       urlsToSubmit = [body.url];
     } else if (body.contentType && body.contentId) {
       // Build URL based on content type
       const baseUrl = `https://${HOST}`;
       switch (body.contentType) {
         case 'workout':
           urlsToSubmit = [`${baseUrl}/workout/${body.contentId}`];
           break;
         case 'program':
           urlsToSubmit = [`${baseUrl}/trainingprogram/${body.contentId}`];
           break;
         case 'article':
           urlsToSubmit = [`${baseUrl}/blog/${body.contentId}`];
           break;
         case 'page':
           urlsToSubmit = [`${baseUrl}/${body.contentId}`];
           break;
       }
     }
 
     if (urlsToSubmit.length === 0) {
       return new Response(
         JSON.stringify({ error: 'No URLs provided to index' }),
         { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     // Ensure URLs have the correct format
     urlsToSubmit = urlsToSubmit.map(url => {
       if (!url.startsWith('http')) {
         return `https://${HOST}${url.startsWith('/') ? '' : '/'}${url}`;
       }
       return url;
     });
 
     console.log(`IndexNow: Submitting ${urlsToSubmit.length} URLs for indexing`);
 
     // Submit to IndexNow endpoints
     const results: Record<string, { success: boolean; status?: number; error?: string }> = {};
 
     // Use batch API for efficiency (submit to Bing, which shares with others)
     const indexNowPayload = {
       host: HOST,
       key: INDEXNOW_KEY,
       keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
       urlList: urlsToSubmit,
     };
 
     // Submit to Bing (primary - feeds ChatGPT, Perplexity)
     try {
       const bingResponse = await fetch(INDEXNOW_ENDPOINTS.bing, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json; charset=utf-8',
         },
         body: JSON.stringify(indexNowPayload),
       });
       
       results.bing = {
         success: bingResponse.ok,
         status: bingResponse.status,
       };
 
       if (!bingResponse.ok) {
         const errorText = await bingResponse.text();
         results.bing.error = errorText;
         console.error('Bing IndexNow error:', errorText);
       } else {
         console.log('Bing IndexNow: Successfully submitted');
       }
     } catch (error) {
       results.bing = {
         success: false,
         error: error instanceof Error ? error.message : String(error),
       };
       console.error('Bing IndexNow exception:', error);
     }
 
     // Submit to Yandex (secondary)
     try {
       const yandexResponse = await fetch(INDEXNOW_ENDPOINTS.yandex, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json; charset=utf-8',
         },
         body: JSON.stringify(indexNowPayload),
       });
       
       results.yandex = {
         success: yandexResponse.ok,
         status: yandexResponse.status,
       };
 
       if (!yandexResponse.ok) {
         const errorText = await yandexResponse.text();
         results.yandex.error = errorText;
       } else {
         console.log('Yandex IndexNow: Successfully submitted');
       }
     } catch (error) {
       results.yandex = {
         success: false,
         error: error instanceof Error ? error.message : String(error),
       };
     }
 
     // Log the submission for tracking
     const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
     const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
     
     if (supabaseUrl && supabaseKey) {
       const supabase = createClient(supabaseUrl, supabaseKey);
       
       // Log to seo_refresh_log
       await supabase.from('seo_refresh_log').insert({
         refresh_type: 'indexnow',
         items_scanned: urlsToSubmit.length,
         items_updated: Object.values(results).filter(r => r.success).length,
         metadata: {
           urls: urlsToSubmit,
           results,
           timestamp: new Date().toISOString(),
         },
         started_at: new Date().toISOString(),
         completed_at: new Date().toISOString(),
       });
     }
 
     return new Response(
       JSON.stringify({
         success: true,
         message: `Submitted ${urlsToSubmit.length} URLs to IndexNow`,
         urls: urlsToSubmit,
         results,
       }),
       { 
         status: 200, 
         headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
       }
     );
 
   } catch (error) {
     console.error('IndexNow ping error:', error);
     return new Response(
       JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
       { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
     );
   }
 });