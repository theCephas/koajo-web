import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
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
    const { email, userId, verificationType, firstName, lastName, phoneNumber } = body as {
      email?: string;
      userId?: string;
      verificationType?: 'document' | 'id_number';
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
    };

    console.log('User data:', { email, userId });

    // Create the verification session
    const type: 'document' | 'id_number' = verificationType === 'id_number' ? 'id_number' : 'document';

    // Prepare provided details based on verification type
    const providedDetails: any = {
      email: email || 'user@example.com',
    };

    // For ID number verification, include additional user details
    if (type === 'id_number') {
      if (firstName && lastName) {
        providedDetails.name = `${firstName} ${lastName}`;
      }
      if (phoneNumber) {
        providedDetails.phone = phoneNumber;
      }
    }

    const verificationSession = await stripe.identity.verificationSessions.create({
      type,
      provided_details: providedDetails,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/register/kyc?verification=complete`,
      metadata: {
        user_id: userId || 'user_123',
      },
    });

    console.log('Verification session created:', verificationSession.id);

    // Return the verification URL instead of client secret
    return NextResponse.json({ 
      verification_url: verificationSession.url,
      session_id: verificationSession.id
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
