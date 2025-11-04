import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

/**
 * GET /api/verification-session/[sessionId]
 * Retrieves the full verification session details from Stripe
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Verification session ID is required' },
        { status: 400 }
      );
    }

    const session = await stripe.identity.verificationSessions.retrieve(sessionId);

    let verificationReport = null;
    try {
      const reports = await stripe.identity.verificationReports.list({
        verification_session: sessionId,
        limit: 1,
      });
      verificationReport = reports.data[0] || null;
    } catch (error) {
      console.log('No verification report available yet:', error);
    }

    return NextResponse.json({
      session: {
        id: session.id,
        status: session.status,
        type: session.type,
        created: session.created,
        last_error: session.last_error,
        metadata: session.metadata,
      },
      verificationReport: verificationReport ? {
        id: verificationReport.id,
        type: verificationReport.type,
        created: verificationReport.created,
      } : null,
    });
  } catch (error) {
    console.error('Error retrieving verification session:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      {
        error: 'Failed to retrieve verification session',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
