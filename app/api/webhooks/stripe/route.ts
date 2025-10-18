import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

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

    // Financial Connections events
    case 'financial_connections.account.created':
      const createdAccount = event.data.object as Stripe.FinancialConnections.Account;
      console.log('Financial account created:', createdAccount.id);
      
      // Handle successful account connection
      await handleAccountCreated(createdAccount);
      break;

    case 'financial_connections.account.deactivated':
      const deactivatedAccount = event.data.object as Stripe.FinancialConnections.Account;
      console.log('Financial account deactivated:', deactivatedAccount.id);
      
      // Handle account deactivation
      await handleAccountDeactivated(deactivatedAccount);
      break;

    case 'financial_connections.account.disconnected':
      const disconnectedAccount = event.data.object as Stripe.FinancialConnections.Account;
      console.log('Financial account disconnected:', disconnectedAccount.id);
      
      // Handle account disconnection
      await handleAccountDisconnected(disconnectedAccount);
      break;

    case 'financial_connections.session.succeeded':
      const succeededSession = event.data.object as Stripe.FinancialConnections.Session;
      console.log('Financial connections session succeeded:', succeededSession.id);
      
      // Handle successful session
      await handleSessionSucceeded(succeededSession);
      break;

    case 'financial_connections.session.failed':
      const failedSession = event.data.object as Stripe.FinancialConnections.Session;
      console.log('Financial connections session failed:', failedSession.id);
      
      // Handle failed session
      await handleSessionFailed(failedSession);
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

// Financial Connections event handlers
async function handleAccountCreated(account: Stripe.FinancialConnections.Account) {
  // Handle successful account connection
  console.log('Account created successfully:', account.id);
  console.log('Institution:', account.institution_name);
  console.log('Account holder:', account.account_holder_name);
  
  // You can add logic here to:
  // - Update user's connected accounts in your database
  // - Send confirmation email
  // - Trigger account verification process
  // - Update user's onboarding status
}

async function handleAccountDeactivated(account: Stripe.FinancialConnections.Account) {
  // Handle account deactivation
  console.log('Account deactivated:', account.id);
  console.log('Reason:', account.status);
  
  // You can add logic here to:
  // - Update account status in your database
  // - Notify user about account deactivation
  // - Remove account from user's dashboard
}

async function handleAccountDisconnected(account: Stripe.FinancialConnections.Account) {
  // Handle account disconnection
  console.log('Account disconnected:', account.id);
  
  // You can add logic here to:
  // - Remove account from your database
  // - Notify user about disconnection
  // - Update user's account list
}

async function handleSessionSucceeded(session: Stripe.FinancialConnections.Session) {
  // Handle successful financial connections session
  console.log('Financial connections session succeeded:', session.id);
  console.log('User ID:', session.metadata?.user_id);
  
  // You can add logic here to:
  // - Update user's onboarding progress
  // - Send success notification
  // - Redirect user to next step
  // - Store session data
}

async function handleSessionFailed(session: Stripe.FinancialConnections.Session) {
  // Handle failed financial connections session
  console.log('Financial connections session failed:', session.id);
  console.log('User ID:', session.metadata?.user_id);
  
  // You can add logic here to:
  // - Log the failure reason
  // - Notify user about the failure
  // - Allow user to retry
  // - Update error tracking
}
