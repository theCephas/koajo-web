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
    console.log('Retrieving ownership data for account:', accountId);
    
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not set');
      return NextResponse.json(
        { error: 'Stripe secret key not configured' },
        { status: 500 }
      );
    }

    // Get the account ownership data
    const ownership = await stripe.financialConnections.accounts.retrieveOwnership(accountId);

    // Transform the data
    const transformedOwnership = {
      owners: ownership.owners.map(owner => ({
        email: owner.email,
        name: owner.name,
        phone: owner.phone,
        address: owner.address ? {
          line1: owner.address.line1,
          line2: owner.address.line2,
          city: owner.address.city,
          state: owner.address.state,
          postal_code: owner.address.postal_code,
          country: owner.address.country,
        } : undefined,
      })),
    };

    console.log('Retrieved ownership data for account:', accountId);

    return NextResponse.json(transformedOwnership);
  } catch (error) {
    console.error('Error retrieving ownership data:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve ownership data',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

