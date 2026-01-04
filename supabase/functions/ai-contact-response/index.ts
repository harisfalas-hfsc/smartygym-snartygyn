import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  userType: 'premium' | 'free' | 'guest';
}

const SMARTYGYM_SYSTEM_PROMPT = `You are the intelligent customer support assistant for SmartyGym, an online fitness platform founded by Haris Falas, a certified Sports Scientist and Strength & Conditioning Coach.

## About SmartyGym:
- **Platform Type**: Online fitness training platform with 500+ expert-designed workouts
- **Founder**: Haris Falas - Sports Scientist, Certified Strength & Conditioning Specialist with 15+ years experience
- **Core Offerings**:
  - Workouts: Strength, Cardio, HIIT, Yoga, Mobility (various difficulties & durations)
  - Training Programs: Multi-week structured programs for specific goals
  - Daily Smarty Rituals: Morning, midday, and evening wellness routines
  - Workout of the Day (WOD): Fresh daily workout challenges
  - Fitness Tools: BMR Calculator, 1RM Calculator, Macro Calculator, Body Fat Calculator
  - Exercise Library: Detailed exercise demonstrations with videos
  - Educational Blog: Fitness, nutrition, and wellness articles

## Subscription Plans:
- **Gold Plan**: €4.99/month - Access to all workouts, programs, and tools
- **Platinum Plan**: €7.99/month - Everything in Gold + Daily Rituals, priority support, exclusive content
- **First-time subscriber discount**: 50% off first month
- **Standalone purchases**: Individual programs and workouts available without subscription

## Response Guidelines:
1. Be friendly, professional, and genuinely helpful
2. Keep responses concise (2-3 short paragraphs max)
3. Address the customer by their first name
4. Acknowledge their specific question/concern before providing information
5. For technical issues, ask clarifying questions if needed
6. For subscription/pricing questions, provide clear info and link to smartygym.com/pricing
7. For workout recommendations, ask about their goals and fitness level if not provided
8. If you cannot fully answer something, acknowledge this and mention that the SmartyGym team will follow up personally
9. Always be encouraging and supportive - fitness journeys are personal
10. Sign off warmly as "The SmartyGym Team"

## Important Links:
- Pricing: smartygym.com/pricing
- Workouts: smartygym.com/workouts
- Programs: smartygym.com/programs
- Contact: smartygym.com/contact
- Blog: smartygym.com/blog

## Tone:
- Warm and encouraging
- Professional but approachable
- Knowledgeable without being condescending
- Solution-oriented

Remember: You're representing a fitness brand that values transformation, expertise, and personal connection. Every response should reflect these values.`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error('[ai-contact-response] LOVABLE_API_KEY is not configured');
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { contactMessage }: { contactMessage: ContactMessage } = await req.json();
    
    if (!contactMessage) {
      throw new Error("Contact message data is required");
    }

    console.log(`[ai-contact-response] Processing message from ${contactMessage.name} (${contactMessage.email})`);
    console.log(`[ai-contact-response] Subject: ${contactMessage.subject}`);
    console.log(`[ai-contact-response] Category: ${contactMessage.category}, User Type: ${contactMessage.userType}`);

    // Construct the user prompt with context
    const userTypeLabel = contactMessage.userType === 'premium' 
      ? 'Premium Subscriber' 
      : contactMessage.userType === 'free' 
        ? 'Free Member' 
        : 'Guest Visitor';

    const userPrompt = `A ${userTypeLabel} named ${contactMessage.name} has sent us a message.

**Category**: ${contactMessage.category}
**Subject**: ${contactMessage.subject}

**Their Message**:
${contactMessage.message}

Please provide a helpful, personalized response to ${contactMessage.name}'s message.`;

    console.log('[ai-contact-response] Calling Lovable AI...');

    // Call Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SMARTYGYM_SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ai-contact-response] AI gateway error: ${response.status}`, errorText);
      
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (response.status === 402) {
        throw new Error("AI credits depleted. Please add credits to continue.");
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      console.error('[ai-contact-response] No response content from AI');
      throw new Error("No response generated from AI");
    }

    console.log('[ai-contact-response] Successfully generated AI response');
    console.log(`[ai-contact-response] Response preview: ${aiResponse.substring(0, 100)}...`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        response: aiResponse,
        model: "google/gemini-2.5-flash"
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('[ai-contact-response] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
