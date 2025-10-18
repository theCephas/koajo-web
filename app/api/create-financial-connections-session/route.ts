import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(request: NextRequest) {
  try {
    console.log('Creating financial connections session...');
    
    // Check if Stripe secret key is available
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not set');
      return NextResponse.json(
        { error: 'Stripe secret key not configured' },
        { status: 500 }
      );
    }

    // Get user data from request body
    const body = await request.json();
    const { userId, permissions, filters } = body as {
      userId?: string;
      permissions?: Stripe.FinancialConnections.Session.Permission[] ;
      filters?: {
        countries?: string[];
        account_types?: string[];
      };
    };

    console.log('Financial connections session data:', { userId, permissions, filters });

    // Create the financial connections session
    const session = await stripe.financialConnections.sessions.create({
      account_holder: {
        type: 'customer',
        customer: userId || 'cus_default', // You might want to create a customer first
      },
      permissions: permissions || [],
      filters: filters || {
        countries: ['US'],
        account_types: ['checking', 'savings']
      },
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/register/bank?session_id={SESSION_ID}`,
    });

    console.log('Financial connections session created:', session.id);

    return NextResponse.json({ 
      client_secret: session.client_secret,
      session_id: session.id,
      url: session.return_url // This is the URL to redirect users to
    });
  } catch (error) {
    console.error('Error creating financial connections session:', error);
    return NextResponse.json({ error: 'Failed to create financial connections session' }, { status: 500 });
  }
}
