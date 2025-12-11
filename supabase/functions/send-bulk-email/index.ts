import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@3.5.0";
import { convertTiptapToEmailHtml, getEmailHeaders, getEmailFooter } from "../_shared/email-utils.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BulkEmailRequest {
  userIds: string[];
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
    const { userIds, subject, message }: BulkEmailRequest = await req.json();
    
    if (!userIds || userIds.length === 0) {
      throw new Error("No recipients provided");
    }
    if (!subject || !message) {
      throw new Error("Subject and message are required");
    }

    logStep("Request validated", { 
      registeredUsers: userIds.length
    });

    // Fetch registered users
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
    const recipients = profiles
      .map(profile => {
        const authUser = authUsers.find(u => u.id === profile.user_id);
        return {
          email: authUser?.email,
          name: profile.full_name || 'User'
        };
      })
      .filter(r => r.email) as Array<{ email: string; name: string }>;

    logStep("Recipients prepared", { count: recipients.length });

    if (recipients.length === 0) {
      throw new Error("No valid email addresses found");
    }

    logStep("Total recipients prepared", { count: recipients.length });

    // Insert dashboard messages for all users
    logStep("Inserting dashboard messages");
    const dashboardInserts = userIds.map(userId => ({
      user_id: userId,
      message_type: 'announcement_update',
      subject: subject,
      content: message,
      is_read: false
    }));

    const { error: dashboardError } = await supabaseClient
      .from('user_system_messages')
      .insert(dashboardInserts);

    if (dashboardError) {
      console.error("Failed to insert dashboard messages:", dashboardError);
    } else {
      logStep("Dashboard messages inserted", { count: dashboardInserts.length });
    }

    // Initialize Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) throw new Error("RESEND_API_KEY not configured");
    
    const resend = new Resend(resendApiKey);

    // Convert tiptap HTML to email-compatible HTML
    const emailContent = convertTiptapToEmailHtml(message);

    // Send emails (in batches to avoid rate limits)
    const results = [];
    const batchSize = 10;
    
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      logStep(`Sending batch ${Math.floor(i / batchSize) + 1}`, { count: batch.length });

      const batchPromises = batch.map(async (recipient) => {
        try {
          const footer = getEmailFooter(recipient.email!);
          
          const emailResponse = await resend.emails.send({
            from: "SmartyGym <notifications@smartygym.com>",
            reply_to: "support@smartygym.com",
            to: [recipient.email!],
            subject: subject,
            headers: getEmailHeaders(recipient.email!),
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
                  <tr>
                    <td style="padding: 20px;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px;">
                        <tr>
                          <td style="padding: 32px;">
                            <h2 style="color: #d4af37; margin-bottom: 16px;">Hello ${recipient.name}</h2>
                            <div style="line-height: 1.6; color: #333333; font-size: 16px;">
                              ${emailContent}
                            </div>
                            ${footer}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
              </html>
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
        dashboardMessages: userIds.length,
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
