import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
  try {
    console.log('Creating verification session...');
    
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
    const { email, userId, verificationType } = body as {
      email?: string;
      userId?: string;
      verificationType?: 'document' | 'id_number';
    };

    console.log('User data:', { email, userId });

    // Create the verification session
    const type: 'document' | 'id_number' = verificationType === 'id_number' ? 'id_number' : 'document';

    const verificationSession = await stripe.identity.verificationSessions.create({
      type,
      provided_details: {
        email: email || 'user@example.com',
      },
      metadata: {
        user_id: userId || 'user_123',
      },
    });

    console.log('Verification session created:', verificationSession.id);

    // Return only the client secret to the frontend
    return NextResponse.json({ 
      client_secret: verificationSession.client_secret 
    });
  } catch (error) {
    console.error('Error creating verification session:', error);
    
    // Return more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorCode = (error as any)?.code || 'unknown';
    
    return NextResponse.json(
      { 
        error: 'Failed to create verification session',
        details: errorMessage,
        code: errorCode
      },
      { status: 500 }
    );
  }
}
