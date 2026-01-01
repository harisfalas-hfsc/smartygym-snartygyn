import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Process Pending Notifications
 * 
 * This function processes pending content notifications that were queued
 * when new workouts or programs were created. It checks the pending_content_notifications
 * table and dispatches actual notifications to users.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("[PROCESS-PENDING] Starting pending notifications processing");

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch pending notifications
    const { data: pendingNotifications, error: fetchError } = await supabase
      .from("pending_content_notifications")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(50);

    if (fetchError) {
      console.error("[PROCESS-PENDING] Error fetching pending notifications:", fetchError);
      throw fetchError;
    }

    if (!pendingNotifications || pendingNotifications.length === 0) {
      console.log("[PROCESS-PENDING] No pending notifications to process");
      return new Response(
        JSON.stringify({ success: true, message: "No pending notifications", processed: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[PROCESS-PENDING] Found ${pendingNotifications.length} pending notifications`);

    let processed = 0;
    let failed = 0;

    for (const notification of pendingNotifications) {
      try {
        // Call send-new-content-notifications for each pending item
        const response = await fetch(`${supabaseUrl}/functions/v1/send-new-content-notifications`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
          },
          body: JSON.stringify({
            contentId: notification.content_id,
            contentType: notification.content_type,
            contentName: notification.content_name,
            contentCategory: notification.content_category,
          }),
        });

        if (response.ok) {
          // Delete processed notification
          await supabase
            .from("pending_content_notifications")
            .delete()
            .eq("id", notification.id);
          
          processed++;
          console.log(`[PROCESS-PENDING] Processed notification for ${notification.content_name}`);
        } else {
          console.error(`[PROCESS-PENDING] Failed to process ${notification.content_name}: ${response.status}`);
          failed++;
        }
      } catch (error) {
        console.error(`[PROCESS-PENDING] Error processing ${notification.content_name}:`, error);
        failed++;
      }
    }

    console.log(`[PROCESS-PENDING] Completed: ${processed} processed, ${failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        processed,
        failed,
        total: pendingNotifications.length,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[PROCESS-PENDING] Fatal error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
