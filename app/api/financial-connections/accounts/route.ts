import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function GET(request: NextRequest) {
  try {
    console.log('Retrieving all financial connections accounts...');
    
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not set');
      return NextResponse.json(
        { error: 'Stripe secret key not configured' },
        { status: 500 }
      );
    }

    // Get all financial connections accounts
    const accounts = await stripe.financialConnections.accounts.list({
      limit: 100,
    });

    // Transform the data to include only what we need
    const transformedAccounts = accounts.data.map(account => ({
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
    }));

    console.log(`Retrieved ${transformedAccounts.length} accounts`);

    return NextResponse.json(transformedAccounts);
  } catch (error) {
    console.error('Error retrieving accounts:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve accounts',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

