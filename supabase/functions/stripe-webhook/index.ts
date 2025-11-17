import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const signature = req.headers.get("stripe-signature");
  
  if (!signature) {
    logStep("ERROR: Missing Stripe signature");
    return new Response(JSON.stringify({ error: "Missing stripe-signature header" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }

  try {
    logStep("Webhook received");
    
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey || !webhookSecret) {
      throw new Error("Missing Stripe configuration");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    const body = await req.text();
    
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Event verified", { type: event.type, id: event.id });
    } catch (err) {
      const error = err as Error;
      logStep("ERROR: Webhook signature verification failed", { error: error.message });
      return new Response(JSON.stringify({ error: `Webhook Error: ${error.message}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Processing checkout.session.completed", { sessionId: session.id, mode: session.mode });

        if (session.mode === "subscription") {
          // Handle subscription checkout
          await handleSubscriptionCheckout(session, supabase, stripe);
        } else if (session.mode === "payment") {
          // Handle one-time purchase
          await handleOneTimePurchase(session, supabase, stripe);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing customer.subscription.updated", { subscriptionId: subscription.id, status: subscription.status });
        await handleSubscriptionUpdate(subscription, supabase);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing customer.subscription.deleted", { subscriptionId: subscription.id });
        await handleSubscriptionCancellation(subscription, supabase);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Processing invoice.payment_succeeded", { invoiceId: invoice.id });
        await handleInvoicePaymentSucceeded(invoice, supabase);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Processing invoice.payment_failed", { invoiceId: invoice.id });
        await handleInvoicePaymentFailed(invoice, supabase);
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err) {
    const error = err as Error;
    logStep("ERROR in webhook handler", { error: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

// Helper function to check if user is a first-time customer
async function isFirstTimeCustomer(userId: string, supabase: any): Promise<boolean> {
  try {
    // Check if user has any previous purchases
    const { data: purchases, error: purchaseError } = await supabase
      .from('user_purchases')
      .select('id')
      .eq('user_id', userId)
      .limit(1);
    
    if (purchaseError) {
      logStep("ERROR checking purchases", { error: purchaseError });
      return false;
    }
    
    if (purchases && purchases.length > 0) {
      return false; // Has previous purchases
    }
    
    // Check if user has any previous subscriptions (excluding 'free')
    const { data: subscriptions, error: subError } = await supabase
      .from('user_subscriptions')
      .select('id, plan_type')
      .eq('user_id', userId)
      .neq('plan_type', 'free')
      .limit(1);
    
    if (subError) {
      logStep("ERROR checking subscriptions", { error: subError });
      return false;
    }
    
    if (subscriptions && subscriptions.length > 0) {
      return false; // Has previous subscriptions
    }
    
    // No purchases and no paid subscriptions = first-time customer
    return true;
  } catch (error) {
    logStep("ERROR in isFirstTimeCustomer", { error });
    return false;
  }
}

async function handleSubscriptionCheckout(
  session: Stripe.Checkout.Session,
  supabase: any,
  stripe: Stripe
) {
  const userId = session.metadata?.user_id;
  const customerId = session.customer as string;

  if (!userId) {
    logStep("ERROR: No user_id in session metadata");
    return;
  }

  // Get subscription details
  const subscriptionId = session.subscription as string;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  const priceId = subscription.items.data[0].price.id;
  const productId = subscription.items.data[0].price.product as string;
  
  // Get product details to determine plan type
  const product = await stripe.products.retrieve(productId);
  const planType = product.metadata?.plan_type || 'gold';

  logStep("Creating subscription record", { userId, planType, subscriptionId });

  // Upsert subscription in database
  const { error } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      stripe_price_id: priceId,
      plan_type: planType,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    }, {
      onConflict: 'user_id'
    });

  if (error) {
    logStep("ERROR: Failed to update subscription", { error });
  } else {
    logStep("Subscription created successfully");
    
    // Track subscription purchase for social media analytics
    try {
      await supabase
        .from('social_media_analytics')
        .insert({
          user_id: userId,
          session_id: `subscription_${subscriptionId}`,
          referral_source: 'direct', // Will be updated if we have referral data
          event_type: 'subscription_purchase',
          event_value: subscription.items.data[0]?.price?.unit_amount ? (subscription.items.data[0].price.unit_amount / 100) : 0,
          landing_page: '/checkout',
        });
      logStep("Subscription purchase tracked in analytics");
    } catch (analyticsError) {
      logStep("ERROR: Failed to track subscription in analytics", { error: analyticsError });
    }
    
    // Send automated messages to user
    const isFirstTime = await isFirstTimeCustomer(userId, supabase);
    logStep("Checking if first-time customer", { userId, isFirstTime });
    
    // Capitalize plan type for display (gold -> Gold, platinum -> Platinum)
    const planName = planType.charAt(0).toUpperCase() + planType.slice(1);
    
    if (isFirstTime) {
      // Send welcome message first
      try {
        await supabase.functions.invoke('send-system-message', {
          body: {
            userId: userId,
            messageType: 'welcome',
            customData: {}
          }
        });
        logStep("Welcome message sent");
        
        // Wait a moment before sending thank you
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (welcomeError) {
        logStep("ERROR sending welcome message", { error: welcomeError });
      }
    }
    
    // Send subscription thank you message
    try {
      await supabase.functions.invoke('send-system-message', {
        body: {
          userId: userId,
          messageType: 'purchase_subscription',
          customData: {
            planName: planName
          }
        }
      });
      logStep("Subscription thank you message sent", { planName });
    } catch (thankYouError) {
      logStep("ERROR sending subscription thank you message", { error: thankYouError });
    }
  }
}

async function handleOneTimePurchase(
  session: Stripe.Checkout.Session,
  supabase: any,
  stripe: Stripe
) {
  const userId = session.metadata?.user_id;
  const productType = session.metadata?.product_type;
  
  if (!userId) {
    logStep("ERROR: Missing user_id in metadata");
    return;
  }

  // Get payment intent to get amount
  const paymentIntentId = session.payment_intent as string;
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  const amount = paymentIntent.amount / 100; // Convert from cents

  // Check if this is a personal training purchase
  if (productType === 'personal_training') {
    logStep("Recording personal training purchase", { userId, amount });
    
    // Update personal training request status
    const { error: updateError } = await supabase
      .from('personal_training_requests')
      .update({ status: 'paid' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (updateError) {
      logStep("ERROR: Failed to update personal training request", { error: updateError });
    }

    // Send automated messages for personal training
    const isFirstTime = await isFirstTimeCustomer(userId, supabase);
    logStep("Checking if first-time customer for personal training", { userId, isFirstTime });
    
    if (isFirstTime) {
      // Send welcome message first
      try {
        await supabase.functions.invoke('send-system-message', {
          body: {
            userId: userId,
            messageType: 'welcome',
            customData: {}
          }
        });
        logStep("Welcome message sent for personal training");
        
        // Wait a moment before sending thank you
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (welcomeError) {
        logStep("ERROR sending welcome message for personal training", { error: welcomeError });
      }
    }
    
    // Send personal training thank you message
    try {
      await supabase.functions.invoke('send-system-message', {
        body: {
          userId: userId,
          messageType: 'purchase_personal_training',
          customData: {
            contentName: 'Personal Training Program'
          }
        }
      });
      logStep("Personal training thank you message sent");
    } catch (thankYouError) {
      logStep("ERROR sending personal training thank you message", { error: thankYouError });
    }
    
    return;
  }

  // Handle standalone workout/program purchases
  const contentType = session.metadata?.content_type;
  const contentId = session.metadata?.content_id;
  const contentName = session.metadata?.content_name;

  if (!contentType || !contentId) {
    logStep("ERROR: Missing metadata for standalone purchase", { contentType, contentId });
    return;
  }

  logStep("Recording standalone purchase", { userId, contentType, contentId, amount });

  // Record purchase in database
  const { error } = await supabase
    .from('user_purchases')
    .insert({
      user_id: userId,
      content_id: contentId,
      content_type: contentType,
      content_name: contentName,
      price: amount,
      stripe_payment_intent_id: paymentIntentId,
      stripe_checkout_session_id: session.id,
    });

  if (error) {
    logStep("ERROR: Failed to record purchase", { error });
  } else {
    logStep("Purchase recorded successfully");
    
    // Track standalone purchase for social media analytics
    try {
      await supabase
        .from('social_media_analytics')
        .insert({
          user_id: userId,
          session_id: session.id,
          referral_source: 'direct', // Will be updated if we have referral data
          event_type: 'standalone_purchase',
          event_value: amount,
          landing_page: '/checkout',
        });
      logStep("Standalone purchase tracked in analytics");
    } catch (analyticsError) {
      logStep("ERROR: Failed to track purchase in analytics", { error: analyticsError });
    }
  }

  if (error) {
    logStep("ERROR: Failed to record purchase", { error });
  } else {
    logStep("Purchase recorded successfully");
    
    // Send automated messages for standalone purchase
    const isFirstTime = await isFirstTimeCustomer(userId, supabase);
    logStep("Checking if first-time customer for standalone purchase", { userId, isFirstTime });
    
    if (isFirstTime) {
      // Send welcome message first
      try {
        await supabase.functions.invoke('send-system-message', {
          body: {
            userId: userId,
            messageType: 'welcome',
            customData: {}
          }
        });
        logStep("Welcome message sent for standalone purchase");
        
        // Wait a moment before sending thank you
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (welcomeError) {
        logStep("ERROR sending welcome message for standalone purchase", { error: welcomeError });
      }
    }
    
    // Determine message type based on content type
    const messageType = contentType === 'workout' ? 'purchase_workout' : 'purchase_program';
    
    // Send standalone purchase thank you message
    try {
      await supabase.functions.invoke('send-system-message', {
        body: {
          userId: userId,
          messageType: messageType,
          customData: {
            contentName: contentName
          }
        }
      });
      logStep("Standalone purchase thank you message sent", { contentType, contentName });
    } catch (thankYouError) {
      logStep("ERROR sending standalone purchase thank you message", { error: thankYouError });
    }
  }
}

async function handleSubscriptionUpdate(
  subscription: Stripe.Subscription,
  supabase: any
) {
  const customerId = subscription.customer as string;

  // Find user by customer ID
  const { data: existingSub } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();

  if (!existingSub) {
    logStep("ERROR: No user found for customer", { customerId });
    return;
  }

  const priceId = subscription.items.data[0].price.id;

  logStep("Updating subscription", { userId: existingSub.user_id, status: subscription.status });

  // Update subscription
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq('user_id', existingSub.user_id);

  if (error) {
    logStep("ERROR: Failed to update subscription", { error });
  } else {
    logStep("Subscription updated successfully");
  }
}

async function handleSubscriptionCancellation(
  subscription: Stripe.Subscription,
  supabase: any
) {
  const customerId = subscription.customer as string;

  const { data: existingSub } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();

  if (!existingSub) {
    logStep("ERROR: No user found for customer", { customerId });
    return;
  }

  logStep("Cancelling subscription", { userId: existingSub.user_id });

  // Update subscription status
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'canceled',
      cancel_at_period_end: true,
    })
    .eq('user_id', existingSub.user_id);

  if (error) {
    logStep("ERROR: Failed to cancel subscription", { error });
  } else {
    logStep("Subscription cancelled successfully");
    
    // Send cancellation message
    await supabase
      .from('user_system_messages')
      .insert({
        user_id: existingSub.user_id,
        subject: 'Subscription Cancelled',
        message: 'Your subscription has been cancelled. You will continue to have access until the end of your current billing period. We hope to see you again soon!',
        message_type: 'subscription_cancelled',
        is_read: false,
      });
  }
}

async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice,
  supabase: any
) {
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    logStep("No subscription ID in invoice, skipping");
    return;
  }

  const { data: existingSub } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();

  if (!existingSub) {
    logStep("ERROR: No user found for customer", { customerId });
    return;
  }

  logStep("Invoice payment succeeded", { userId: existingSub.user_id, amount: invoice.amount_paid / 100 });

  // Send renewal confirmation
  await supabase
    .from('user_system_messages')
    .insert({
      user_id: existingSub.user_id,
      subject: 'Payment Successful',
      message: `Your subscription payment of €${(invoice.amount_paid / 100).toFixed(2)} has been processed successfully. Thank you for being a valued member!`,
      message_type: 'payment_success',
      is_read: false,
    });
}

async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
  supabase: any
) {
  const customerId = invoice.customer as string;

  const { data: existingSub } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();

  if (!existingSub) {
    logStep("ERROR: No user found for customer", { customerId });
    return;
  }

  logStep("Invoice payment failed", { userId: existingSub.user_id });

  // Update subscription status to past_due
  await supabase
    .from('user_subscriptions')
    .update({ status: 'past_due' })
    .eq('user_id', existingSub.user_id);

  // Send payment failure notification
  await supabase
    .from('user_system_messages')
    .insert({
      user_id: existingSub.user_id,
      subject: 'Payment Failed',
      message: 'We were unable to process your subscription payment. Please update your payment method to continue your subscription.',
      message_type: 'payment_failed',
      is_read: false,
    });
}