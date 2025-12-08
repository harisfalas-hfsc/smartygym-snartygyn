import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

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

        // Check if this is a corporate subscription
        if (session.metadata?.corporate_plan_type) {
          await handleCorporateSubscriptionCheckout(session, supabase, stripe);
        } else if (session.mode === "subscription") {
          // Handle regular subscription checkout
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

// Helper function to send first-purchase welcome message
async function sendFirstPurchaseWelcome(userId: string, userEmail: string, supabase: any) {
  logStep("Sending first-purchase welcome message", { userId, email: userEmail });
  
  // Get the first-purchase welcome template
  const { data: template } = await supabase
    .from('automated_message_templates')
    .select('subject, content')
    .eq('template_name', 'First Purchase Welcome')
    .eq('is_active', true)
    .single();
  
  const subject = template?.subject || '🎉 Welcome to the SmartyGym Family!';
  const content = template?.content || '<p class="tiptap-paragraph"><strong>Welcome to the SmartyGym Family!</strong></p><p class="tiptap-paragraph">Thank you for making your first purchase! We\'re thrilled to have you with us.</p>';
  
  // Send dashboard notification
  try {
    await supabase.from('user_system_messages').insert({
      user_id: userId,
      message_type: 'welcome',
      subject: subject,
      content: content,
      is_read: false,
    });
    logStep("✅ First-purchase welcome dashboard message sent");
  } catch (notifError) {
    logStep("ERROR sending first-purchase welcome notification", { error: notifError });
  }
  
  // Send email
  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    await resend.emails.send({
      from: 'SmartyGym <notifications@smartygym.com>',
      to: [userEmail],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #d4af37; margin-bottom: 20px;">Welcome to the SmartyGym Family! 🎉</h1>
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Thank you for making your first purchase and trusting SmartyGym with your fitness journey. This is a big step, and we're honored to be part of it.</p>
          <h2 style="color: #333; font-size: 18px; margin-top: 24px;">What Makes SmartyGym Different</h2>
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Every workout and training program on SmartyGym is expertly designed by <strong>Haris Falas</strong>, a Sports Scientist with over 20 years of coaching experience and CSCS certification. You're not getting generic AI-generated content – you're getting real expertise from a real professional.</p>
          <h2 style="color: #333; font-size: 18px; margin-top: 24px;">What You Now Have Access To</h2>
          <ul style="font-size: 16px; line-height: 1.8; margin-bottom: 24px;">
            <li>Expert-designed workouts crafted for real results</li>
            <li>Strategic training programs based on proven methodologies</li>
            <li>Daily Workout of the Day following smart periodization</li>
            <li>A community of like-minded fitness enthusiasts</li>
          </ul>
          <p style="margin-top: 24px;">
            <a href="https://smartygym.com/dashboard" style="display: inline-block; background: #d4af37; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">Go to Dashboard →</a>
          </p>
          <p style="font-size: 16px; line-height: 1.6; margin-top: 24px;">Welcome aboard – let's make it happen!</p>
          <p style="font-size: 16px; margin-top: 16px;"><em>The SmartyGym Team</em></p>
          <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #999;">This email was sent from SmartyGym.</p>
        </div>
      `,
    });
    logStep("✅ First-purchase welcome email sent", { email: userEmail });
  } catch (emailError) {
    logStep("ERROR sending first-purchase welcome email", { error: emailError });
  }
}

// Handle corporate subscription checkout
async function handleCorporateSubscriptionCheckout(
  session: Stripe.Checkout.Session,
  supabase: any,
  stripe: Stripe
) {
  const userId = session.metadata?.user_id;
  const planType = session.metadata?.corporate_plan_type;
  const organizationName = session.metadata?.organization_name;
  const maxUsers = parseInt(session.metadata?.max_users || '10');
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!userId || !planType || !organizationName) {
    logStep("ERROR: Missing corporate metadata", { userId, planType, organizationName });
    return;
  }

  logStep("Processing corporate subscription", { userId, planType, organizationName, maxUsers });

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  const periodEnd = new Date(subscription.current_period_end * 1000);

  // Create corporate subscription record
  const { data: corpSub, error: corpError } = await supabase
    .from('corporate_subscriptions')
    .insert({
      admin_user_id: userId,
      organization_name: organizationName,
      plan_type: planType,
      max_users: maxUsers,
      current_users_count: 0,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: periodEnd.toISOString(),
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: customerId,
      status: 'active',
    })
    .select()
    .single();

  if (corpError) {
    logStep("ERROR: Failed to create corporate subscription", { error: corpError });
    return;
  }

  logStep("Corporate subscription created", { corpSubId: corpSub.id });

  // Also create/update the admin's personal subscription to platinum
  await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      plan_type: 'platinum',
      status: 'active',
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: periodEnd.toISOString(),
    }, {
      onConflict: 'user_id'
    });

  logStep("Admin user subscription set to platinum");

  // Get user email for sending welcome email
  const { data: userData } = await supabase.auth.admin.getUserById(userId);
  const userEmail = userData?.user?.email;

  if (userEmail) {
    // Send dashboard notification
    await supabase.from('user_system_messages').insert({
      user_id: userId,
      message_type: 'purchase_subscription',
      subject: '🎉 Welcome to Smarty Corporate!',
      content: `<p class="tiptap-paragraph"><strong>Your corporate subscription is now active!</strong></p><p class="tiptap-paragraph"></p><p class="tiptap-paragraph">Organization: ${organizationName}</p><p class="tiptap-paragraph">Plan: Smarty ${planType.charAt(0).toUpperCase() + planType.slice(1)}</p><p class="tiptap-paragraph">Team Limit: ${maxUsers === 9999 ? 'Unlimited' : maxUsers} members</p><p class="tiptap-paragraph"></p><p class="tiptap-paragraph">Head to your <a href="/corporate-admin">Corporate Admin Dashboard</a> to start adding team members!</p>`,
      is_read: false,
    });

    // Send welcome email
    try {
      const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
      await resend.emails.send({
        from: 'SmartyGym <notifications@smartygym.com>',
        to: [userEmail],
        subject: '🎉 Welcome to Smarty Corporate!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #d4af37; margin-bottom: 20px;">Welcome to Smarty Corporate! 🏢</h1>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Congratulations! Your corporate subscription is now active.</p>
            <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin: 0 0 10px;"><strong>Organization:</strong> ${organizationName}</p>
              <p style="margin: 0 0 10px;"><strong>Plan:</strong> Smarty ${planType.charAt(0).toUpperCase() + planType.slice(1)}</p>
              <p style="margin: 0;"><strong>Team Limit:</strong> ${maxUsers === 9999 ? 'Unlimited' : maxUsers} members</p>
            </div>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">All your team members will receive Platinum-level access to the entire SmartyGym platform.</p>
            <p style="margin-top: 24px;">
              <a href="https://smartygym.com/corporate-admin" style="display: inline-block; background: #d4af37; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">Add Team Members →</a>
            </p>
            <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #999;">This email was sent from SmartyGym.</p>
          </div>
        `,
      });
      logStep("Corporate welcome email sent", { email: userEmail });
    } catch (emailError) {
      logStep("ERROR sending corporate welcome email", { error: emailError });
    }
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

  // Check if this is a first-time customer BEFORE creating subscription
  const isFirstTime = await isFirstTimeCustomer(userId, supabase);
  logStep("First-time customer check", { userId, isFirstTime });

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
          referral_source: 'direct',
          event_type: 'subscription_purchase',
          event_value: subscription.items.data[0]?.price?.unit_amount ? (subscription.items.data[0].price.unit_amount / 100) : 0,
          landing_page: '/checkout',
        });
      logStep("Subscription purchase tracked in analytics");
    } catch (analyticsError) {
      logStep("ERROR: Failed to track subscription in analytics", { error: analyticsError });
    }
    
    // Capitalize plan type for display (gold -> Gold, platinum -> Platinum)
    const planName = planType.charAt(0).toUpperCase() + planType.slice(1);
    
    // Get user email
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    const userEmail = userData?.user?.email;
    
    if (!userEmail) {
      logStep("ERROR: Could not get user email for purchase confirmation");
      return;
    }
    
    // Get purchase confirmation template
    const { data: template } = await supabase
      .from('automated_message_templates')
      .select('subject, content')
      .eq('message_type', 'purchase_subscription')
      .eq('is_default', true)
      .single();
    
    if (template) {
      // Replace placeholders
      const subject = template.subject.replace('{planName}', planName);
      const contentText = template.content.replace('{planName}', planName);
      
      // Send dashboard notification immediately
      try {
        await supabase.from('user_system_messages').insert({
          user_id: userId,
          message_type: 'purchase_subscription',
          subject: subject,
          content: contentText,
          is_read: false,
        });
        logStep("✅ Subscription purchase dashboard message sent");
      } catch (notifError) {
        logStep("ERROR sending subscription notification", { error: notifError });
      }
      
      // Send email immediately
      try {
        const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
        await resend.emails.send({
          from: 'SmartyGym <notifications@smartygym.com>',
          to: [userEmail],
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #d4af37; margin-bottom: 20px;">Welcome to ${planName}! 🎉</h1>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Thank you for subscribing to the <strong>${planName}</strong> plan!</p>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">You now have full access to all premium features.</p>
              <p style="margin-top: 24px;">
                <a href="https://smartygym.com/dashboard" style="display: inline-block; background: #d4af37; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">Go to Dashboard →</a>
              </p>
              <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #999;">This email was sent from SmartyGym.</p>
            </div>
          `,
        });
        logStep("✅ Subscription purchase email sent", { email: userEmail });
      } catch (emailError) {
        logStep("ERROR sending subscription email", { error: emailError });
      }
    } else {
      logStep("ERROR: Could not find subscription purchase template");
    }
    
    // If first-time customer, also send the special first-purchase welcome message
    if (isFirstTime) {
      await sendFirstPurchaseWelcome(userId, userEmail, supabase);
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

  // Check if this is a first-time customer BEFORE recording purchase
  const isFirstTime = await isFirstTimeCustomer(userId, supabase);
  logStep("First-time customer check (standalone)", { userId, isFirstTime });

  // Get payment intent to get amount
  const paymentIntentId = session.payment_intent as string;
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  const amount = paymentIntent.amount / 100; // Convert from cents

  // Handle standalone workout/program/shop product/ritual purchases
  const contentType = session.metadata?.content_type;
  const contentId = session.metadata?.content_id;
  const contentName = session.metadata?.content_name;

  if (!contentType || !contentId) {
    logStep("ERROR: Missing metadata for purchase", { contentType, contentId });
    return;
  }

  logStep("Recording purchase", { userId, contentType, contentId, amount });

  // Handle ritual purchases separately
  if (contentType === 'ritual') {
    const ritualDate = session.metadata?.ritual_date;
    const { error: ritualError } = await supabase
      .from('ritual_purchases')
      .insert({
        user_id: userId,
        ritual_date: ritualDate,
        stripe_payment_intent_id: paymentIntentId,
        stripe_checkout_session_id: session.id,
      });
    
    if (ritualError) {
      logStep("ERROR: Failed to record ritual purchase", { error: ritualError });
    } else {
      logStep("Ritual purchase recorded successfully", { ritualDate });
    }
    return;
  }

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
    return;
  }
  
  logStep("Purchase recorded successfully");
  
  // Track purchase for social media analytics
  try {
    await supabase
      .from('social_media_analytics')
      .insert({
        user_id: userId,
        session_id: session.id,
        referral_source: 'direct',
        event_type: 'standalone_purchase',
        event_value: amount,
        landing_page: '/checkout',
      });
    logStep("Purchase tracked in analytics");
  } catch (analyticsError) {
    logStep("ERROR: Failed to track purchase in analytics", { error: analyticsError });
  }

  // Get user email
  const { data: userData } = await supabase.auth.admin.getUserById(userId);
  const userEmail = userData?.user?.email;
  
  if (!userEmail) {
    logStep("ERROR: Could not get user email for purchase confirmation");
    return;
  }
  
  // Determine message type based on content type
  let messageType = 'purchase_workout';
  if (contentType === 'program') {
    messageType = 'purchase_program';
  } else if (contentType === 'shop_product') {
    messageType = 'purchase_shop_product';
  }
  
  // Get purchase template
  const { data: template } = await supabase
    .from('automated_message_templates')
    .select('subject, content')
    .eq('message_type', messageType)
    .eq('is_default', true)
    .single();
  
  if (template) {
    const subject = template.subject.replace('{contentName}', contentName);
    const contentText = template.content.replace('{contentName}', contentName);
    
    // Send dashboard notification immediately
    try {
      await supabase.from('user_system_messages').insert({
        user_id: userId,
        message_type: messageType,
        subject: subject,
        content: contentText,
        is_read: false,
      });
      logStep("✅ Purchase dashboard message sent", { contentType });
    } catch (notifError) {
      logStep("ERROR sending purchase notification", { error: notifError });
    }
    
    // Send email immediately
    try {
      const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
      await resend.emails.send({
        from: 'SmartyGym <notifications@smartygym.com>',
        to: [userEmail],
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #d4af37; margin-bottom: 20px;">Purchase Confirmed! 🎉</h1>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Thank you for your purchase of <strong>${contentName}</strong>!</p>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Your content is now available in your dashboard.</p>
            <p style="margin-top: 24px;">
              <a href="https://smartygym.com/dashboard" style="display: inline-block; background: #d4af37; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">Go to Dashboard →</a>
            </p>
            <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #999;">This email was sent from SmartyGym.</p>
          </div>
        `,
      });
      logStep("✅ Purchase email sent", { email: userEmail, contentType });
    } catch (emailError) {
      logStep("ERROR sending purchase email", { error: emailError });
    }
  } else {
    logStep("ERROR: Could not find purchase template", { messageType });
  }
  
  // If first-time customer, also send the special first-purchase welcome message
  if (isFirstTime) {
    await sendFirstPurchaseWelcome(userId, userEmail, supabase);
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

  // Get user email for sending cancellation email
  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(existingSub.user_id);
  const userEmail = userData?.user?.email;
  logStep("Fetched user email for cancellation", { email: userEmail });

  // Calculate subscription end date
  const endDate = subscription.current_period_end 
    ? new Date(subscription.current_period_end * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'the end of your billing period';

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
    
    // Get cancellation template
    const { data: template } = await supabase
      .from('automated_message_templates')
      .select('subject, content')
      .eq('template_name', 'Subscription Cancellation')
      .eq('is_active', true)
      .maybeSingle();

    const subject = template?.subject || '😢 We\'re Sorry to See You Go';
    let content = template?.content || '<p class="tiptap-paragraph">Your subscription has been cancelled. You will continue to have access until the end of your current billing period.</p>';
    
    // Replace placeholder with actual end date
    content = content.replace('{endDate}', endDate);

    // Send dashboard notification
    await supabase
      .from('user_system_messages')
      .insert({
        user_id: existingSub.user_id,
        subject: subject,
        content: content,
        message_type: 'cancellation',
        is_read: false,
      });
    logStep("Dashboard cancellation notification sent");

    // Send cancellation email
    if (userEmail) {
      try {
        const resendKey = Deno.env.get("RESEND_API_KEY");
        if (resendKey) {
          const resend = new Resend(resendKey);
          
          const htmlEmail = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #d4af37; margin: 0;">SmartyGym</h1>
              </div>
              <div style="background: #f9f9f9; border-radius: 8px; padding: 30px;">
                <h2 style="margin-top: 0;">Your Subscription Has Been Cancelled</h2>
                <p>We're sorry to see you go. Your subscription has been successfully cancelled.</p>
                <p><strong>What Happens Next:</strong></p>
                <p>You will continue to have full access to all your premium content until <strong>${endDate}</strong>. After that date, your account will revert to free tier access.</p>
                <p><strong>We'd Love to Have You Back:</strong></p>
                <p>If you ever decide to return, your fitness journey awaits. All our expert-designed workouts and training programs will be here for you.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://smartygym.com/pricing" style="display: inline-block; background: #d4af37; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">Resubscribe Anytime →</a>
                </div>
                <p>Thank you for being part of the SmartyGym family. We wish you all the best in your fitness journey!</p>
                <p><em>The SmartyGym Team</em></p>
              </div>
            </body>
            </html>
          `;

          await resend.emails.send({
            from: "SmartyGym <notifications@smartygym.com>",
            to: [userEmail],
            subject: subject,
            html: htmlEmail,
          });
          logStep("Cancellation email sent successfully", { email: userEmail });
        }
      } catch (emailError) {
        logStep("ERROR: Failed to send cancellation email", { error: emailError });
      }
    }
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
    .select('user_id, plan_type')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();

  if (!existingSub) {
    logStep("ERROR: No user found for customer", { customerId });
    return;
  }

  logStep("Invoice payment succeeded", { userId: existingSub.user_id, amount: invoice.amount_paid / 100 });

  // Schedule renewal confirmation for 5 minutes from now
  const renewalDelayTime = new Date();
  renewalDelayTime.setMinutes(renewalDelayTime.getMinutes() + 5);
  
  const planName = existingSub.plan_type.charAt(0).toUpperCase() + existingSub.plan_type.slice(1);
  const amount = (invoice.amount_paid / 100).toFixed(2);

  // Get user email
  const { data: userData } = await supabase.auth.admin.getUserById(existingSub.user_id);
  const userEmail = userData?.user?.email;

  if (!userEmail) {
    logStep("User email not found for renewal confirmation", { userId: existingSub.user_id });
    return;
  }

  // Get renewal thank you template
  const { data: template } = await supabase
    .from("automated_message_templates")
    .select("subject, content")
    .eq("message_type", "renewal_thank_you")
    .eq("is_active", true)
    .eq("is_default", true)
    .single();

  if (!template) {
    logStep("No renewal thank you template found, using default message");
    // Fallback to direct message insert
    await supabase
      .from('user_system_messages')
      .insert({
        user_id: existingSub.user_id,
        message_type: 'renewal_thank_you',
        subject: 'Payment Successful',
        content: '<p class="tiptap-paragraph"><strong>Payment Successful! 🎉</strong></p><p class="tiptap-paragraph"></p><p class="tiptap-paragraph">Your subscription payment of €' + amount + ' has been processed successfully.</p><p class="tiptap-paragraph"></p><p class="tiptap-paragraph">Thank you for being a valued member!</p>',
        is_read: false,
      });
    return;
  }

  const subject = template.subject.replace(/\{planName\}/g, planName).replace(/\{amount\}/g, amount);
  const contentText = template.content.replace(/\{planName\}/g, planName).replace(/\{amount\}/g, amount);

  // Send dashboard notification with 5 min delay via scheduled_notifications
  await supabase
    .from("scheduled_notifications")
    .insert({
      title: subject,
      body: contentText,
      target_audience: `user:${existingSub.user_id}`,
      scheduled_time: renewalDelayTime.toISOString(),
      status: "pending",
      recurrence_pattern: "once",
    });

  // Schedule email for 5 minutes
  await supabase
    .from("scheduled_emails")
    .insert({
      subject: subject,
      body: contentText,
      target_audience: `user:${existingSub.user_id}`,
      recipient_emails: [userEmail],
      scheduled_time: renewalDelayTime.toISOString(),
      status: "pending",
      recurrence_pattern: "once",
    });

  logStep("Renewal confirmation scheduled for 5 minutes", { userId: existingSub.user_id, sendAt: renewalDelayTime.toISOString() });
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
      content: '<p class="tiptap-paragraph">We were unable to process your subscription payment.</p><p class="tiptap-paragraph"></p><p class="tiptap-paragraph">Please update your payment method to continue your subscription.</p>',
      message_type: 'renewal_reminder',
      is_read: false,
    });
}
