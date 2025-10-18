import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function GET(
  request: NextRequest,
  { params }: { params: { accountId: string } }
) {
  try {
    const { accountId } = params;
    console.log('Retrieving account data for:', accountId);
    
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not set');
      return NextResponse.json(
        { error: 'Stripe secret key not configured' },
        { status: 500 }
      );
    }

    // Get the specific financial connections account
    const account = await stripe.financialConnections.accounts.retrieve(accountId);

    // Transform the data
    const transformedAccount = {
      id: account.id,
      institution: {
        name: account.institution_name,
      },
      last4: account.last4,
      bank_name: account.institution_name,
      display_name: account.display_name,
      category: account.category,
      subcategory: account.subcategory,
      status: account.status,
      permissions: account.permissions,
      supported_payment_method_types: account.supported_payment_method_types,
      created: account.created,
    };

    console.log('Retrieved account data:', transformedAccount.id);

    return NextResponse.json(transformedAccount);
  } catch (error) {
    console.error('Error retrieving account data:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve account data',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

