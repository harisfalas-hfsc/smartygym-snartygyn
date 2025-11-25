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

        // Send confirmation via both dashboard and email
        try {
          // Get user email
          const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(user_id);
          if (userError) throw userError;
          
          const userEmail = userData.user.email;
          if (!userEmail) throw new Error("User email not found");

          // Get the default template
          const { data: template } = await supabaseClient
            .from("automated_message_templates")
            .select("subject, content")
            .eq("message_type", "purchase_personal_training")
            .eq("is_active", true)
            .eq("is_default", true)
            .single();

          if (!template) {
            console.error('No active template found for purchase_personal_training');
            throw new Error('No active template found');
          }

          const subject = template.subject;
          const content = template.content;

          // Send dashboard message immediately
          await supabaseClient
            .from('user_system_messages')
            .insert({
              user_id: user_id,
              message_type: 'purchase_personal_training',
              subject: subject,
              content: content,
              is_read: false
            });

          // Send email immediately
          await supabaseClient
            .from("scheduled_emails")
            .insert({
              subject: subject,
              body: content,
              target_audience: `user:${user_id}`,
              recipient_emails: [userEmail],
              scheduled_time: new Date().toISOString(),
              status: "pending",
              recurrence_pattern: "once",
            });

          console.log('Personal training confirmation scheduled for:', user_id);
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

      // Get shipping address if available (for shop products)
      const shippingAddress = session.shipping_details?.address || null;

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
          stripe_checkout_session_id: sessionId,
          shipping_address: shippingAddress,
        }]);

      if (error && error.code !== '23505') { // Ignore duplicate key errors
        throw error;
      }

      // Log purchase to activity log for logbook
      try {
        await supabaseClient
          .from('user_activity_log')
          .insert({
            user_id,
            content_type: content_type === 'workout' ? 'workout' : 'program',
            item_id: content_id,
            item_name: content_name,
            action_type: 'purchased'
          });
      } catch (logError) {
        console.error('Failed to log purchase activity:', logError);
      }

      // Decrement stock for shop products
      if (content_type === 'shop_product') {
        try {
          const { data: product } = await supabaseClient
            .from('shop_products')
            .select('stock_quantity')
            .eq('id', content_id)
            .maybeSingle();

          if (product && product.stock_quantity !== null && product.stock_quantity > 0) {
            const newStock = Math.max(0, product.stock_quantity - 1);
            await supabaseClient
              .from('shop_products')
              .update({ 
                stock_quantity: newStock,
                is_available: newStock > 0
              })
              .eq('id', content_id);
          }
        } catch (stockError) {
          console.error('Failed to update stock:', stockError);
        }
      }

      // Send purchase confirmation via both dashboard and email
      try {
        // Determine the correct message type based on content_type
        let messageType = 'purchase_thank_you';
        if (content_type === 'shop_product') {
          messageType = 'purchase_shop_product';
        } else if (content_type === 'workout') {
          messageType = 'purchase_workout';
        } else if (content_type === 'program') {
          messageType = 'purchase_program';
        }

        // Get user email
        const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(user_id);
        if (userError) throw userError;
        
        const userEmail = userData.user.email;
        if (!userEmail) throw new Error("User email not found");

        // Get the default template for this message type
        const { data: template } = await supabaseClient
          .from("automated_message_templates")
          .select("subject, content")
          .eq("message_type", messageType)
          .eq("is_active", true)
          .eq("is_default", true)
          .single();

        if (!template) {
          console.error('No active template found for:', messageType);
          throw new Error(`No active template found for ${messageType}`);
        }

        // Replace placeholders
        const subject = template.subject.replace(/\[Content\]/g, content_name);
        const content = template.content.replace(/\[Content\]/g, content_name);

        // Send dashboard message immediately
        await supabaseClient
          .from('user_system_messages')
          .insert({
            user_id: user_id,
            message_type: messageType,
            subject: subject,
            content: content,
            is_read: false
          });

        // Send email immediately (no delay for purchase confirmations)
        await supabaseClient
          .from("scheduled_emails")
          .insert({
            subject: subject,
            body: content,
            target_audience: `user:${user_id}`,
            recipient_emails: [userEmail],
            scheduled_time: new Date().toISOString(),
            status: "pending",
            recurrence_pattern: "once",
          });

        console.log('Purchase confirmation scheduled for:', user_id);
      } catch (msgError) {
        console.error('Failed to send purchase confirmation:', msgError);
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
