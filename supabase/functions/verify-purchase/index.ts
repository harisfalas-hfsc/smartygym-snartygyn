import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid" && session.metadata) {
      const { user_id, product_type } = session.metadata;
      
      // Handle personal training payment differently
      if (product_type === "personal_training") {
        // Update the personal_training_requests stripe_payment_status
        const { error: updateError } = await supabaseClient
          .from('personal_training_requests')
          .update({ 
            stripe_payment_status: 'paid',
            payment_completed_at: new Date().toISOString()
          })
          .eq('user_id', user_id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1);

        if (updateError) {
          console.error('Error updating personal training request:', updateError);
          throw updateError;
        }

        // Send confirmation message
        try {
          await supabaseClient.functions.invoke('send-system-message', {
            body: {
              userId: user_id,
              messageType: 'purchase_thank_you',
              customData: {
                contentName: 'Personal Training Program'
              }
            }
          });
        } catch (msgError) {
          console.error('Failed to send confirmation message:', msgError);
        }

        return new Response(JSON.stringify({ 
          success: true, 
          purchased: true,
          content_type: 'personal_training',
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // Handle regular standalone purchases
      const { content_type, content_id, content_name } = session.metadata;
      
      // Get the price from the line items
      const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);
      const priceAmount = lineItems.data[0]?.amount_total || 0;

      // Insert purchase record
      const { error } = await supabaseClient
        .from('user_purchases')
        .insert([{
          user_id,
          content_type,
          content_id,
          content_name,
          price: priceAmount / 100, // Convert from cents to euros
          stripe_payment_intent_id: session.payment_intent as string,
        }]);

      if (error && error.code !== '23505') { // Ignore duplicate key errors
        throw error;
      }

      // Send purchase thank you message
      try {
        await supabaseClient.functions.invoke('send-system-message', {
          body: {
            userId: user_id,
            messageType: 'purchase_thank_you',
            customData: {
              contentName: content_name
            }
          }
        });
      } catch (msgError) {
        console.error('Failed to send purchase thank you message:', msgError);
      }

      return new Response(JSON.stringify({ 
        success: true, 
        purchased: true,
        content_type,
        content_id,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ 
      success: false, 
      message: "Payment not completed" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  } catch (error: any) {
    console.error("Error verifying purchase:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
