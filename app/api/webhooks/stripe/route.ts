import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log('Received webhook event:', event.type);

  switch (event.type) {
    case 'identity.verification_session.verified':
      const verifiedSession = event.data.object as Stripe.Identity.VerificationSession;
      console.log('Verification verified:', verifiedSession.id, 'type:', verifiedSession.type);
      
      // Handle successful verification
      // You can update your database, send emails, etc.
      await handleVerificationSuccess(verifiedSession);
      break;

    case 'identity.verification_session.requires_input':
      const requiresInputSession = event.data.object as Stripe.Identity.VerificationSession;
      console.log('Verification requires input:', requiresInputSession.id, 'type:', requiresInputSession.type);
      
      // Handle verification that needs user input
      await handleVerificationRequiresInput(requiresInputSession);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handleVerificationSuccess(session: Stripe.Identity.VerificationSession) {
  // Update your database with successful verification
  console.log('Verification successful for session:', session.id);
  console.log('User ID:', session.metadata?.user_id);
  
  // You can add logic here to:
  // - Update user verification status in your database
  // - Send confirmation email
  // - Redirect user to next step
}

async function handleVerificationRequiresInput(session: Stripe.Identity.VerificationSession) {
  // Handle verification that needs user input
  console.log('Verification requires input for session:', session.id);
  console.log('User ID:', session.metadata?.user_id);
  
  // You can add logic here to:
  // - Notify user that additional input is needed
  // - Update verification status in your database
  // - Send notification email
}
