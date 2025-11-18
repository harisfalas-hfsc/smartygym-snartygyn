import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SmartyCoachRequest {
  question: string;
  goal?: string;
  equipment?: string[];
  time?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { question, goal, equipment, time } = await req.json() as SmartyCoachRequest;

    console.log('SmartyCoach request:', { question, goal, equipment, time });

    // Fetch all workouts and programs from database
    const { data: workouts, error: workoutsError } = await supabase
      .from('admin_workouts')
      .select('*');

    const { data: programs, error: programsError } = await supabase
      .from('admin_training_programs')
      .select('*');

    if (workoutsError || programsError) {
      throw new Error('Failed to fetch content from database');
    }

    console.log(`Loaded ${workouts?.length || 0} workouts, ${programs?.length || 0} programs`);

    // Build AI prompt with complete content library
    const systemPrompt = `You are SmartyCoach, an AI assistant for Smartygym.com. Your ONLY job is to recommend existing workouts, programs, tools, and subscriptions.

CRITICAL RULES:
- ALWAYS suggest something (never say "unavailable" or "coming soon")
- Choose the CLOSEST match from the available content
- NEVER invent new workouts or programs
- NEVER provide medical advice
- Keep responses SHORT and friendly

Available content:
WORKOUTS (${workouts?.length || 0} total):
${workouts?.map(w => `- ${w.name} [${w.category || 'General'}] [${w.difficulty || 'All levels'}] [${w.duration || 'Various'}] [Equipment: ${w.equipment || 'Various'}] ${w.is_premium ? '[PREMIUM]' : ''} ${w.tier_required ? `[Tier: ${w.tier_required}]` : ''}`).join('\n')}

PROGRAMS (${programs?.length || 0} total):
${programs?.map(p => `- ${p.name} [${p.category || 'General'}] [${p.difficulty || 'All levels'}] [${p.weeks || '?'} weeks] [Equipment: ${p.equipment || 'Various'}] ${p.is_premium ? '[PREMIUM]' : ''} ${p.tier_required ? `[Tier: ${p.tier_required}]` : ''}`).join('\n')}

Available tools:
- 1RM Calculator (strength training)
- BMR Calculator (fat loss, nutrition)
- Macro Tracking Calculator (nutrition, fat loss)
- Timers (cardio, intervals)

Subscription tiers:
- Free (limited access)
- Gold (most workouts/programs)
- Platinum (all content + personal training)`;

    const userPrompt = `User question: ${question}
${goal ? `Goal: ${goal}` : ''}
${equipment?.length ? `Equipment available: ${equipment.join(', ')}` : ''}
${time ? `Time available: ${time === 'unlimited' ? 'Unlimited' : `${time} minutes`}` : ''}

Recommend ONE single best option from the available content. If it's not a perfect match, still suggest the closest option and explain briefly why.

Also suggest ONE ecosystem tool if relevant (1RM for strength, BMR for fat loss, etc.).

Return ONLY valid JSON in this exact format:
{
  "type": "workout" or "program",
  "id": "exact-id-from-database",
  "name": "exact name",
  "category": "category",
  "reason": "short explanation (max 30 words)",
  "isPerfectMatch": true or false,
  "isPremium": true or false,
  "tierRequired": "free/gold/platinum or null",
  "ecosystemSuggestion": {
    "tool": "tool name",
    "route": "/route",
    "reason": "why (max 20 words)"
  } or null
}`;

    // Call Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. AI credits low.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    console.log('AI response:', aiContent);

    // Parse AI response
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }

    const recommendation = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify({
        recommendation,
        message: 'Here\'s what I found for you!'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('SmartyCoach error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        fallback: 'Service temporarily unavailable. Please try browsing workouts directly.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
