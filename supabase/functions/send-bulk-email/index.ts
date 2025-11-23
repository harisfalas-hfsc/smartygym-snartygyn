import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@3.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BulkEmailRequest {
  userIds: string[];
  newsletterRecipients?: Array<{ email: string; name: string }>;
  subject: string;
  message: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-BULK-EMAIL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Verify admin authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      throw new Error("Unauthorized: Admin access required");
    }
    logStep("Admin verified");

    // Parse request
    const { userIds, newsletterRecipients, subject, message }: BulkEmailRequest = await req.json();
    
    if ((!userIds || userIds.length === 0) && (!newsletterRecipients || newsletterRecipients.length === 0)) {
      throw new Error("No recipients provided");
    }
    if (!subject || !message) {
      throw new Error("Subject and message are required");
    }

    logStep("Request validated", { 
      registeredUsers: userIds?.length || 0,
      newsletterRecipients: newsletterRecipients?.length || 0
    });

    let recipients: Array<{ email: string; name: string }> = [];

    // Fetch registered users if provided
    if (userIds && userIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabaseClient
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;
      logStep("Profiles fetched", { count: profiles.length });

      // Get auth users to fetch emails (using service role)
      const { data: { users: authUsers }, error: authError } = await supabaseClient.auth.admin.listUsers();
      if (authError) throw authError;

      // Match profiles with emails
      const registeredRecipients = profiles
        .map(profile => {
          const authUser = authUsers.find(u => u.id === profile.user_id);
          return {
            email: authUser?.email,
            name: profile.full_name || 'User'
          };
        })
        .filter(r => r.email) as Array<{ email: string; name: string }>;

      recipients = [...recipients, ...registeredRecipients];
      logStep("Added registered recipients", { count: registeredRecipients.length });
    }

    // Add newsletter recipients if provided
    if (newsletterRecipients && newsletterRecipients.length > 0) {
      recipients = [...recipients, ...newsletterRecipients];
      logStep("Added newsletter recipients", { count: newsletterRecipients.length });
    }

    if (recipients.length === 0) {
      throw new Error("No valid email addresses found");
    }

    logStep("Total recipients prepared", { count: recipients.length });

    // Initialize Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) throw new Error("RESEND_API_KEY not configured");
    
    const resend = new Resend(resendApiKey);

    // Send emails (in batches to avoid rate limits)
    const results = [];
    const batchSize = 10;
    
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      logStep(`Sending batch ${Math.floor(i / batchSize) + 1}`, { count: batch.length });

      const batchPromises = batch.map(async (recipient) => {
        try {
          const emailResponse = await resend.emails.send({
            from: "SmartyGym <onboarding@resend.dev>",
            to: [recipient.email!],
            subject: subject,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Hello ${recipient.name}!</h2>
                <div style="line-height: 1.6; color: #333;">
                  ${message.replace(/\n/g, '<br>')}
                </div>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="font-size: 12px; color: #999;">
                  This email was sent from SmartyGym Admin. If you believe this was sent in error, please contact support.
                </p>
              </div>
            `,
          });

          return { 
            email: recipient.email, 
            success: true, 
            id: emailResponse.data?.id 
          };
        } catch (error) {
          console.error(`Failed to send to ${recipient.email}:`, error);
          return { 
            email: recipient.email, 
            success: false, 
            error: error instanceof Error ? error.message : String(error)
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Add delay between batches to respect rate limits
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    logStep("Bulk email completed", { 
      total: results.length, 
      success: successCount, 
      failed: failCount 
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        total: results.length,
        sent: successCount,
        failed: failCount,
        results: results
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
