import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PersonalTrainingRequest {
  email: string;
  name: string;
  age: string;
  weight: string;
  height: string;
  performanceType: string;
  specificGoal: string;
  duration: string;
  trainingDays: string;
  workoutDuration: string;
  equipment: string[];
  otherEquipment: string;
  limitations: string;
  userStatus?: string;
}

// Simple HTML sanitizer to prevent XSS
function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Rate limiting: 2 requests per hour per IP
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 2;

async function checkRateLimit(identifier: string): Promise<boolean> {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  
  const { data } = await supabaseClient
    .from('rate_limits')
    .select('request_count')
    .eq('identifier', identifier)
    .eq('endpoint', 'personal-training')
    .gte('window_start', windowStart.toISOString())
    .maybeSingle();

  if (!data) {
    await supabaseClient.from('rate_limits').insert({
      identifier,
      endpoint: 'personal-training',
      request_count: 1,
      window_start: new Date().toISOString()
    });
    return true;
  }

  if (data.request_count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  await supabaseClient
    .from('rate_limits')
    .update({ request_count: data.request_count + 1 })
    .eq('identifier', identifier)
    .eq('endpoint', 'personal-training')
    .gte('window_start', windowStart.toISOString());

  return true;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: PersonalTrainingRequest = await req.json();

    // Input validation
    if (!requestData.name || !requestData.email) {
      return new Response(
        JSON.stringify({ error: 'Name and email are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(requestData.email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const canProceed = await checkRateLimit(ipAddress);
    
    if (!canProceed) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize all inputs
    const safeName = sanitizeHtml(requestData.name.trim());
    const safeEmail = sanitizeHtml(requestData.email.trim());
    const safeAge = sanitizeHtml(requestData.age?.trim() || '');
    const safeWeight = sanitizeHtml(requestData.weight?.trim() || '');
    const safeHeight = sanitizeHtml(requestData.height?.trim() || '');
    const safePerformanceType = sanitizeHtml(requestData.performanceType?.trim() || '');
    const safeSpecificGoal = sanitizeHtml(requestData.specificGoal?.trim() || '');
    const safeDuration = sanitizeHtml(requestData.duration?.trim() || '');
    const safeTrainingDays = sanitizeHtml(requestData.trainingDays?.trim() || '');
    const safeWorkoutDuration = sanitizeHtml(requestData.workoutDuration?.trim() || '');
    const safeEquipment = (requestData.equipment || []).map(e => sanitizeHtml(e)).join(', ');
    const safeOtherEquipment = sanitizeHtml(requestData.otherEquipment?.trim() || '');
    const safeLimitations = sanitizeHtml(requestData.limitations?.trim() || 'None specified');
    const safeUserStatus = requestData.userStatus ? sanitizeHtml(requestData.userStatus) : '';

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">New Personal Training Request</h1>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h2 style="color: #333; font-size: 18px; margin-top: 0;">Client Information</h2>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${safeName}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${safeEmail}</p>
          ${safeUserStatus ? `<p style="margin: 5px 0;"><strong>User Status:</strong> <span style="color: #d4af37; font-weight: bold;">${safeUserStatus}</span></p>` : ''}
          ${safeAge ? `<p style="margin: 5px 0;"><strong>Age:</strong> ${safeAge}</p>` : ''}
          ${safeWeight ? `<p style="margin: 5px 0;"><strong>Weight:</strong> ${safeWeight} kg</p>` : ''}
          ${safeHeight ? `<p style="margin: 5px 0;"><strong>Height:</strong> ${safeHeight} cm</p>` : ''}
        </div>
      
      ${safePerformanceType || safeSpecificGoal ? `
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h2 style="color: #333; font-size: 18px; margin-top: 0;">Training Goals</h2>
        ${safePerformanceType ? `<p style="margin: 5px 0;"><strong>Performance Type:</strong> ${safePerformanceType === 'human' ? 'Human Performance' : 'Athlete Performance'}</p>` : ''}
        ${safeSpecificGoal ? `<p style="margin: 5px 0;"><strong>Specific Goal:</strong> ${safeSpecificGoal}</p>` : ''}
      </div>
      ` : ''}
      
      ${safeDuration || safeTrainingDays || safeWorkoutDuration ? `
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h2 style="color: #333; font-size: 18px; margin-top: 0;">Program Details</h2>
        ${safeDuration ? `<p style="margin: 5px 0;"><strong>Duration:</strong> ${safeDuration}</p>` : ''}
        ${safeTrainingDays ? `<p style="margin: 5px 0;"><strong>Training Days per Week:</strong> ${safeTrainingDays}</p>` : ''}
        ${safeWorkoutDuration ? `<p style="margin: 5px 0;"><strong>Workout Duration:</strong> ${safeWorkoutDuration} minutes</p>` : ''}
      </div>
      ` : ''}
      
      ${safeEquipment || safeOtherEquipment ? `
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h2 style="color: #333; font-size: 18px; margin-top: 0;">Available Equipment</h2>
        ${safeEquipment ? `<p style="margin: 5px 0;">${safeEquipment}</p>` : ''}
        ${safeOtherEquipment ? `<p style="margin: 5px 0;"><strong>Other Equipment:</strong> ${safeOtherEquipment}</p>` : ''}
      </div>
      ` : ''}
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h2 style="color: #333; font-size: 18px; margin-top: 0;">Limitations and Safety Considerations</h2>
        <p style="margin: 5px 0;">${safeLimitations}</p>
      </div>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />
      <p style="text-align: center; color: #666; font-size: 12px;">This request was submitted through the Smarty Gym Personal Training form at smartygym.com</p>
    </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Smarty Gym <onboarding@resend.dev>",
      to: ["haris@smartygym.com"],
      subject: `New Personal Training Request - ${safeName}`,
      html: emailHtml,
      replyTo: requestData.email,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-personal-training-request function:", error);
    return new Response(
      JSON.stringify({ error: 'Failed to send request. Please try again.' }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
