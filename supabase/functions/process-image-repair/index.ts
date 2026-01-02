import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BATCH_SIZE = 5; // Process 5 items at a time to avoid timeouts

async function storageObjectExists(supabase: any, path: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage
      .from('avatars')
      .list(path.split('/').slice(0, -1).join('/'), {
        search: path.split('/').pop(),
      });
    
    if (error) return false;
    const fileName = path.split('/').pop();
    return data?.some((file: any) => file.name === fileName) || false;
  } catch {
    return false;
  }
}

async function isImageValid(supabase: any, supabaseUrl: string, imageUrl: string | null): Promise<boolean> {
  if (!imageUrl || imageUrl.trim() === '') return false;
  
  // Check if it's a Supabase storage URL
  if (imageUrl.includes(supabaseUrl) && imageUrl.includes('/storage/v1/object/public/')) {
    const pathMatch = imageUrl.match(/\/storage\/v1\/object\/public\/avatars\/(.+)/);
    if (pathMatch) {
      return await storageObjectExists(supabase, pathMatch[1]);
    }
  }
  
  // For external URLs, do a quick HEAD request
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

async function generateAndUploadImage(
  supabase: any,
  supabaseUrl: string,
  type: 'workout' | 'program',
  item: any
): Promise<string | null> {
  try {
    const functionName = type === 'workout' ? 'generate-workout-image' : 'generate-program-image';
    const body = type === 'workout' 
      ? { workoutId: item.id, workoutName: item.name, workoutType: item.type, difficulty: item.difficulty }
      : { programName: item.name, category: item.category, difficulty: item.difficulty, weeks: item.weeks };

    const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Image generation failed for ${type} ${item.id}:`, errorText);
      return null;
    }

    const data = await response.json();
    return data.imageUrl || data.image_url || null;
  } catch (error) {
    console.error(`Error generating image for ${type} ${item.id}:`, error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const stripe = stripeKey ? new Stripe(stripeKey, { apiVersion: '2023-10-16' }) : null;

  try {
    const { jobId } = await req.json();

    if (!jobId) {
      return new Response(JSON.stringify({ error: 'Job ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the job
    const { data: job, error: jobError } = await supabase
      .from('image_repair_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return new Response(JSON.stringify({ error: 'Job not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (job.status === 'completed' || job.status === 'failed') {
      return new Response(JSON.stringify({ message: 'Job already finished', job }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update job to running
    await supabase
      .from('image_repair_jobs')
      .update({ status: 'running', started_at: new Date().toISOString() })
      .eq('id', jobId);

    let processedItems = job.processed_items || 0;
    let repairedItems = job.repaired_items || 0;
    let skippedItems = job.skipped_items || 0;
    let stripeSynced = job.stripe_synced || 0;
    const errors: string[] = Array.isArray(job.errors) ? [...job.errors] : [];

    // Get all visible workouts
    const { data: workouts } = await supabase
      .from('admin_workouts')
      .select('*')
      .eq('is_visible', true);

    // Get all visible programs
    const { data: programs } = await supabase
      .from('admin_training_programs')
      .select('*')
      .eq('is_visible', true);

    const allItems = [
      ...(workouts || []).map(w => ({ ...w, _type: 'workout' as const })),
      ...(programs || []).map(p => ({ ...p, _type: 'program' as const })),
    ];

    // Process items starting from where we left off
    const itemsToProcess = allItems.slice(processedItems, processedItems + BATCH_SIZE);
    
    for (const item of itemsToProcess) {
      try {
        const isValid = await isImageValid(supabase, supabaseUrl, item.image_url);
        
        if (isValid) {
          skippedItems++;
        } else {
          // Generate new image
          const newImageUrl = await generateAndUploadImage(supabase, supabaseUrl, item._type, item);
          
          if (newImageUrl) {
            // Update database
            const tableName = item._type === 'workout' ? 'admin_workouts' : 'admin_training_programs';
            await supabase
              .from(tableName)
              .update({ image_url: newImageUrl })
              .eq('id', item.id);

            repairedItems++;

            // Sync to Stripe if applicable
            if (stripe && item.stripe_product_id) {
              try {
                await stripe.products.update(item.stripe_product_id, {
                  images: [newImageUrl],
                });
                stripeSynced++;
              } catch (stripeError) {
                console.error(`Stripe sync failed for ${item.id}:`, stripeError);
                errors.push(`Stripe sync failed for ${item._type} "${item.name}"`);
              }
            }
          } else {
            errors.push(`Failed to generate image for ${item._type} "${item.name}"`);
          }
        }
        
        processedItems++;
      } catch (itemError: any) {
        console.error(`Error processing ${item._type} ${item.id}:`, itemError);
        errors.push(`Error processing ${item._type} "${item.name}": ${itemError?.message || 'Unknown error'}`);
        processedItems++;
      }
    }

    // Determine if job is complete
    const isComplete = processedItems >= allItems.length;
    const newStatus = isComplete ? 'completed' : 'running';

    // Update job progress
    await supabase
      .from('image_repair_jobs')
      .update({
        status: newStatus,
        processed_items: processedItems,
        repaired_items: repairedItems,
        skipped_items: skippedItems,
        stripe_synced: stripeSynced,
        errors,
        completed_at: isComplete ? new Date().toISOString() : null,
      })
      .eq('id', jobId);

    // If not complete, trigger next batch
    if (!isComplete) {
      const workerUrl = `${supabaseUrl}/functions/v1/process-image-repair`;
      fetch(workerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ jobId }),
      }).catch(err => console.error('Next batch trigger error:', err));
    }

    console.log(`Job ${jobId}: processed ${processedItems}/${allItems.length}, repaired ${repairedItems}, skipped ${skippedItems}`);

    return new Response(JSON.stringify({
      success: true,
      jobId,
      status: newStatus,
      processedItems,
      totalItems: allItems.length,
      repairedItems,
      skippedItems,
      stripeSynced,
      errors: errors.length,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Worker error:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
