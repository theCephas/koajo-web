import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(
  request: NextRequest,
  { params }: { params: { accountId: string } }
) {
  try {
    const { accountId } = params;
    console.log('Disconnecting account:', accountId);
    
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not set');
      return NextResponse.json(
        { error: 'Stripe secret key not configured' },
        { status: 500 }
      );
    }

    // Disconnect the financial connections account
    await stripe.financialConnections.accounts.disconnect(accountId);

    console.log('Successfully disconnected account:', accountId);

    return NextResponse.json({ 
      success: true,
      message: 'Account disconnected successfully'
    });
  } catch (error) {
    console.error('Error disconnecting account:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to disconnect account',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

