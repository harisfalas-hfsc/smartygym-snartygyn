import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MassNotificationRequest {
  messageType: string;
  recipientFilter: string;
  customContent: string;
  customSubject?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messageType, recipientFilter, customContent, customSubject }: MassNotificationRequest = await req.json();

    console.log('[MASS-NOTIFICATION] Request:', { messageType, recipientFilter, customContent });

    if (!messageType || !recipientFilter || !customContent) {
      throw new Error("Missing required fields");
    }

    // Create Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify the requester is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Authentication failed");

    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      throw new Error("Unauthorized: Admin access required");
    }

    console.log('[MASS-NOTIFICATION] Admin verified:', userData.user.id);

    // Get the template
    const { data: template, error: templateError } = await supabaseAdmin
      .from('automated_message_templates')
      .select('*')
      .eq('message_type', messageType)
      .eq('is_active', true)
      .eq('is_default', true)
      .single();

    if (templateError || !template) {
      console.error('[MASS-NOTIFICATION] Template not found:', templateError);
      throw new Error(`Template not found for message type: ${messageType}`);
    }

    console.log('[MASS-NOTIFICATION] Using template:', template.template_name);

    // Replace placeholders in subject and content
    let subject = customSubject || template.subject;
    let content = template.content;

    subject = subject.replace(/\[Content\]/g, customContent);
    content = content.replace(/\[Content\]/g, customContent);

    // Get recipients based on filter
    let recipientQuery = supabaseAdmin
      .from('user_subscriptions')
      .select('user_id');

    switch (recipientFilter) {
      case 'subscribers':
        recipientQuery = recipientQuery.in('plan_type', ['gold', 'platinum']);
        break;
      case 'gold':
        recipientQuery = recipientQuery.eq('plan_type', 'gold');
        break;
      case 'platinum':
        recipientQuery = recipientQuery.eq('plan_type', 'platinum');
        break;
      case 'free':
        recipientQuery = recipientQuery.eq('plan_type', 'free');
        break;
      case 'all':
        // No filter, get all users
        break;
      default:
        throw new Error(`Invalid recipient filter: ${recipientFilter}`);
    }

    const { data: recipients, error: recipientError } = await recipientQuery;

    if (recipientError) {
      console.error('[MASS-NOTIFICATION] Error fetching recipients:', recipientError);
      throw recipientError;
    }

    if (!recipients || recipients.length === 0) {
      console.log('[MASS-NOTIFICATION] No recipients found');
      return new Response(
        JSON.stringify({ success: true, recipientCount: 0, message: "No recipients found for the selected filter" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log('[MASS-NOTIFICATION] Found recipients:', recipients.length);

    // Insert messages for all recipients
    const messages = recipients.map(recipient => ({
      user_id: recipient.user_id,
      message_type: messageType,
      subject: subject,
      content: content,
      is_read: false
    }));

    const { error: insertError } = await supabaseAdmin
      .from('user_system_messages')
      .insert(messages);

    if (insertError) {
      console.error('[MASS-NOTIFICATION] Insert error:', insertError);
      throw insertError;
    }

    console.log('[MASS-NOTIFICATION] Messages sent successfully to', recipients.length, 'users');

    return new Response(
      JSON.stringify({ 
        success: true, 
        recipientCount: recipients.length,
        message: `Notification sent to ${recipients.length} users` 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[MASS-NOTIFICATION] Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
