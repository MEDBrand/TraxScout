// Stripe Webhook Handler

import { NextResponse } from 'next/server';
import { stripe, PLANS } from '@/lib/stripe';
import { createServerClient } from '@/lib/supabase';
import Stripe from 'stripe';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createServerClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;
      const email = session.customer_email;
      const tier = session.metadata?.tier || 'basic';

      if (email) {
        await supabase
          .from('users')
          .update({
            stripe_customer_id: customerId,
            tier: tier,
            subscription_status: 'trialing',
          })
          .eq('email', email);
      }
      break;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const status = subscription.status;
      const priceId = subscription.items.data[0]?.price?.id;

      // Determine tier from price ID
      let tier: 'free' | 'basic' | 'pro' = 'basic';
      if (priceId === PLANS.pro.priceId) {
        tier = 'pro';
      } else if (priceId === PLANS.basic.priceId) {
        tier = 'basic';
      }

      // Map Stripe status to our status
      let subscriptionStatus = status;
      if (status === 'active' || status === 'trialing') {
        subscriptionStatus = status;
      } else if (status === 'past_due') {
        subscriptionStatus = 'past_due';
      } else if (status === 'canceled' || status === 'unpaid') {
        subscriptionStatus = 'canceled';
        tier = 'free';
      }

      // In Stripe SDK v20+ (clover), current_period_end may be on the subscription or items
      const periodEnd = (subscription as unknown as Record<string, unknown>).current_period_end as number | undefined;

      await supabase
        .from('users')
        .update({
          tier: tier,
          subscription_status: subscriptionStatus,
          subscription_ends_at: periodEnd
            ? new Date(periodEnd * 1000).toISOString()
            : null,
        })
        .eq('stripe_customer_id', customerId);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await supabase
        .from('users')
        .update({
          tier: 'free',
          subscription_status: 'canceled',
        })
        .eq('stripe_customer_id', customerId);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      await supabase
        .from('users')
        .update({ subscription_status: 'past_due' })
        .eq('stripe_customer_id', customerId);
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      // Reactivate subscription on successful payment
      await supabase
        .from('users')
        .update({ subscription_status: 'active' })
        .eq('stripe_customer_id', customerId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
