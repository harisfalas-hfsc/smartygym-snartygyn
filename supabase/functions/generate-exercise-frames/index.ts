import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { exerciseId, exerciseName } = await req.json();

    if (!exerciseId || !exerciseName) {
      return new Response(JSON.stringify({ error: 'exerciseId and exerciseName are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate image via Lovable AI gateway
    const generateImage = async (prompt: string): Promise<Uint8Array> => {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          modalities: ["image", "text"],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Image generation failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (!imageUrl) {
        throw new Error("No image returned from AI");
      }

      // Convert base64 data URL to Uint8Array
      const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    };

    console.log(`Generating start frame for "${exerciseName}"...`);
    const startPrompt = `Generate an image: Simple minimalist fitness exercise icon illustration on white background. A stick figure standing upright with feet apart, arms at sides, ready to perform a ${exerciseName}. Black line drawing, no face details, geometric style like a technical manual diagram. Clean vector art style.`;
    const startImage = await generateImage(startPrompt);

    console.log(`Generating end frame for "${exerciseName}"...`);
    const endPrompt = `Generate an image: Simple minimalist fitness exercise icon illustration on white background. A stick figure in the bottom position of a ${exerciseName} with bent knees, thighs parallel to ground, arms extended forward. Black line drawing, no face details, geometric style like a technical manual diagram. Clean vector art style.`;
    const endImage = await generateImage(endPrompt);

    // Upload to exercise-gifs bucket
    const startPath = `${exerciseId}_start.png`;
    const endPath = `${exerciseId}_end.png`;

    const { error: startUploadError } = await supabase.storage
      .from('exercise-gifs')
      .upload(startPath, startImage, {
        contentType: 'image/png',
        upsert: true,
      });

    if (startUploadError) throw new Error(`Start frame upload failed: ${startUploadError.message}`);

    const { error: endUploadError } = await supabase.storage
      .from('exercise-gifs')
      .upload(endPath, endImage, {
        contentType: 'image/png',
        upsert: true,
      });

    if (endUploadError) throw new Error(`End frame upload failed: ${endUploadError.message}`);

    // Get public URLs
    const { data: startUrlData } = supabase.storage
      .from('exercise-gifs')
      .getPublicUrl(startPath);

    const { data: endUrlData } = supabase.storage
      .from('exercise-gifs')
      .getPublicUrl(endPath);

    const frameStartUrl = startUrlData.publicUrl;
    const frameEndUrl = endUrlData.publicUrl;

    // Update exercise record
    const { error: updateError } = await supabase
      .from('exercises')
      .update({
        frame_start_url: frameStartUrl,
        frame_end_url: frameEndUrl,
      })
      .eq('id', exerciseId);

    if (updateError) throw new Error(`Exercise update failed: ${updateError.message}`);

    console.log(`Frames generated and saved for exercise "${exerciseName}"`);

    return new Response(JSON.stringify({
      success: true,
      frameStartUrl,
      frameEndUrl,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating exercise frames:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Failed to generate exercise frames',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
