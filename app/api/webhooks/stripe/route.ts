import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { syncVerificationStatus } from '@/lib/utils/verification-status';

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
      await handleVerificationStatusChange(verifiedSession, 'verified');
      break;

    case 'identity.verification_session.requires_input':
      const requiresInputSession = event.data.object as Stripe.Identity.VerificationSession;
      console.log('Verification requires input:', requiresInputSession.id, 'type:', requiresInputSession.type);
      await handleVerificationStatusChange(requiresInputSession, 'requires_input');
      break;

    case 'identity.verification_session.processing':
      const processingSession = event.data.object as Stripe.Identity.VerificationSession;
      console.log('Verification processing:', processingSession.id, 'type:', processingSession.type);
      await handleVerificationStatusChange(processingSession, 'processing');
      break;

    case 'identity.verification_session.canceled':
      const canceledSession = event.data.object as Stripe.Identity.VerificationSession;
      console.log('Verification canceled:', canceledSession.id, 'type:', canceledSession.type);
      await handleVerificationStatusChange(canceledSession, 'canceled');
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

    case 'financial_connections.account.reactivated':
      const reactivatedAccount = event.data.object as Stripe.FinancialConnections.Account;
      console.log('Financial account reactivated:', reactivatedAccount.id);
      
      // Handle account reactivation
      await handleAccountReactivated(reactivatedAccount);
      break;

    case 'financial_connections.account.refreshed_balance':
      const balanceRefreshedAccount = event.data.object as Stripe.FinancialConnections.Account;
      console.log('Account balance refreshed:', balanceRefreshedAccount.id);
      
      // Handle balance refresh completion
      await handleBalanceRefreshed(balanceRefreshedAccount);
      break;

    case 'financial_connections.account.refreshed_ownership':
      const ownershipRefreshedAccount = event.data.object as Stripe.FinancialConnections.Account;
      console.log('Account ownership refreshed:', ownershipRefreshedAccount.id);
      
      // Handle ownership refresh completion
      await handleOwnershipRefreshed(ownershipRefreshedAccount);
      break;

    case 'financial_connections.account.refreshed_transactions':
      const transactionsRefreshedAccount = event.data.object as Stripe.FinancialConnections.Account;
      console.log('Account transactions refreshed:', transactionsRefreshedAccount.id);
      
      // Handle transactions refresh completion
      await handleTransactionsRefreshed(transactionsRefreshedAccount);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

/**
 * Handles all verification status changes and syncs with backend
 */
async function handleVerificationStatusChange(
  session: Stripe.Identity.VerificationSession,
  status: 'canceled' | 'processing' | 'requires_input' | 'verified'
) {
  try {
    const userId = session.metadata?.user_id;
    if (!userId) {
      console.error('No user_id in verification session metadata');
      return;
    }

    // Get the verification report to find result_id (only for verified status)
    let resultId = session.id;
    if (status === 'verified') {
      try {
        const verificationReports = await stripe.identity.verificationReports.list({
          verification_session: session.id,
          limit: 1,
        });
        resultId = verificationReports.data[0]?.id || session.id;
      } catch {
        console.log('No verification report available yet, using session ID');
      }
    }

    const verificationType = (session.type || 'document') as 'document' | 'id_number' | 'verification_flow';

    // Sync verification status with backend (updates identity_verification_session table)
    // Also updates user's identity_verification field if applicable
    const result: {
      sessionUpdated: boolean;
      userStatusUpdated: boolean;
      actualUserStatus?: 'document_verified' | 'id_number_verified' | 'all_verified' | null;
    } = await syncVerificationStatus(
      session.id,
      userId,
      resultId,
      verificationType,
      status
    );

    if (!result.sessionUpdated) {
      console.error('Failed to update verification session in backend');
    }

    if (!result.userStatusUpdated && (verificationType === 'document' || verificationType === 'id_number')) {
      console.warn('Failed to update user verification status');
    }

    if (result.actualUserStatus === 'all_verified') {
      console.log('🎉 All identity verifications complete! User is fully verified.');
    }

    console.log(`Verification status ${status} synced successfully for session:`, session.id, {
      userStatus: result.actualUserStatus || 'not updated',
    });
  } catch (error) {
    console.error('Error handling verification status change:', error);
  }
}

// Financial Connections event handlers
async function handleAccountCreated(account: Stripe.FinancialConnections.Account) {
  // Handle successful account connection
  console.log('Account created successfully:', account.id);
  console.log('Institution:', account.institution_name);
  console.log('Account holder:', account.account_holder);
  
  // TODO: Update user's connected accounts in your database
  // TODO: Send confirmation email
  // TODO: Trigger account verification process
  // TODO: Update user's onboarding status
}

async function handleAccountDeactivated(account: Stripe.FinancialConnections.Account) {
  // Handle account deactivation
  console.log('Account deactivated:', account.id);
  console.log('Reason:', account.status);
  
  // TODO: Update account status in your database
  // TODO: Notify user about account deactivation
  // TODO: Remove account from user's dashboard
}

async function handleAccountDisconnected(account: Stripe.FinancialConnections.Account) {
  // Handle account disconnection
  console.log('Account disconnected:', account.id);
  
  // TODO: Remove account from your database
  // TODO: Notify user about disconnection
  // TODO: Update user's account list
}

// async function handleSessionSucceeded(session: Stripe.FinancialConnections.Session) {
//   // Handle successful financial connections session
//   console.log('Financial connections session succeeded:', session.id);
//   console.log('User ID:', session.metadata?.user_id);
  
//   // You can add logic here to:
//   // - Update user's onboarding progress
//   // - Send success notification
//   // - Redirect user to next step
//   // - Store session data
// }

// async function handleSessionFailed(session: Stripe.FinancialConnections.Session) {
//   // Handle failed financial connections session
//   console.log('Financial connections session failed:', session.id);
//   console.log('User ID:', session.metadata?.user_id);
  
//   // You can add logic here to:
//   // - Log the failure reason
//   // - Notify user about the failure
//   // - Allow user to retry
//   // - Update error tracking
// }

async function handleAccountReactivated(account: Stripe.FinancialConnections.Account) {
  // Handle account reactivation
  console.log('Account reactivated:', account.id);
  console.log('Institution:', account.institution_name);
  
  // TODO: Update account status in your database
  // TODO: Notify user about account reactivation
  // TODO: Restore account functionality
  // TODO: Update user's account list
}

async function handleBalanceRefreshed(account: Stripe.FinancialConnections.Account) {
  // Handle balance refresh completion
  console.log('Balance refreshed for account:', account.id);
  console.log('Balance refresh status:', account.balance_refresh?.status);
  
  // TODO: Update account balance in your database
  // TODO: Trigger balance-related calculations
  // TODO: Update user's balance display
  // TODO: Handle refresh failures if status is 'failed'
}

async function handleOwnershipRefreshed(account: Stripe.FinancialConnections.Account) {
  // Handle ownership refresh completion
  console.log('Ownership refreshed for account:', account.id);
  console.log('Ownership refresh status:', account.ownership_refresh?.status);
  
  // TODO: Update account ownership data in your database
  // TODO: Verify account holder information
  // TODO: Update user's account details
  // TODO: Handle refresh failures if status is 'failed'
}

async function handleTransactionsRefreshed(account: Stripe.FinancialConnections.Account) {
  // Handle transactions refresh completion
  console.log('Transactions refreshed for account:', account.id);
  console.log('Transaction refresh status:', account.transaction_refresh?.status);
  
  // TODO: Update transaction data in your database
  // TODO: Process new transactions
  // TODO: Update user's transaction history
  // TODO: Handle refresh failures if status is 'failed'
}
