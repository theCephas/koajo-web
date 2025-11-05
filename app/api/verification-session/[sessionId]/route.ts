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
    let firstName: string | null = null;
    let lastName: string | null = null;
    let ssnLast4: string | null = null;
    let address: any = null;

    try {
      const reports = await stripe.identity.verificationReports.list({
        verification_session: sessionId,
        limit: 1,
      });
      verificationReport = reports.data[0] || null;
      
      if (verificationReport) {
        const report = verificationReport as Stripe.Identity.VerificationReport & {
          verified_outputs?: {
            document?: { name?: string };
            id_number?: {
              first_name?: string;
              last_name?: string;
              ssn_last4?: string;
              address?: {
                line1?: string;
                line2?: string | null;
                city?: string;
                state?: string;
                postal_code?: string;
                country?: string;
              };
            };
          };
        };
        const outputs = report.verified_outputs;
        
        if (outputs) {
          if (outputs.document?.name) {
            const nameParts = outputs.document.name.split(' ');
            if (nameParts.length > 0) {
              firstName = nameParts[0] || null;
              lastName = nameParts.slice(1).join(' ') || null;
            }
          }
          
          if (outputs.id_number) {
            if (outputs.id_number.first_name) {
              firstName = outputs.id_number.first_name;
            }
            if (outputs.id_number.last_name) {
              lastName = outputs.id_number.last_name;
            }
            if (outputs.id_number.ssn_last4) {
              ssnLast4 = outputs.id_number.ssn_last4;
            }
            if (outputs.id_number.address) {
              address = outputs.id_number.address;
            }
          }
        }
      }
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
      firstName,
      lastName,
      ssnLast4,
      address,
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
