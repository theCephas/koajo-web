import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl, getDefaultHeaders } from '@/lib/constants/api';
import type { StripeVerificationRequest } from '@/lib/types/api';

/**
 * POST /api/sync-verification
 * Syncs verification status with backend API
 * Updates both identity_verification_session table and user's identity_verification field
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, resultId, verificationType, verificationStatus, userId } = body;

    if (!sessionId || !verificationType || !verificationStatus) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const verificationRequest: StripeVerificationRequest = {
      sessionId,
      resultId: resultId || sessionId,
      verificationType,
      verificationStatus,
    };

    const sessionResponse = await fetch(getApiUrl('/auth/stripe-verification'), {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: JSON.stringify(verificationRequest),
    });

    if (!sessionResponse.ok) {
      const errorData = await sessionResponse.json();
      console.error('Failed to sync verification session with backend:', errorData);
      return NextResponse.json(
        { error: 'Failed to sync verification session with backend', details: errorData },
        { status: sessionResponse.status }
      );
    }

    const sessionResult = await sessionResponse.json();

    // Step 2: Update user's identity_verification field if verification is successful
    // and type is document or id_number
    let userUpdateResult = null;
    if (
      verificationStatus === 'verified' &&
      (verificationType === 'document' || verificationType === 'id_number') &&
      userId
    ) {
      const userVerificationStatus = verificationType === 'document' 
        ? 'document_verified' 
        : 'id_number_verified';

      try {
        const userResponse = await fetch(getApiUrl('/auth/user'), {
          method: 'PATCH',
          headers: getDefaultHeaders(),
          body: JSON.stringify({
            identity_verification: userVerificationStatus,
          }),
        });

        if (userResponse.ok) {
          userUpdateResult = await userResponse.json();
          const actualStatus = userUpdateResult.user?.identity_verification || userUpdateResult.identity_verification;
          
          console.log('User verification status updated:', {
            requested: userVerificationStatus,
            actual: actualStatus,
          });
           } else {
          console.warn('Failed to update user verification status, but session was updated');
        }
      } catch (err) {
        console.warn('Error updating user verification status:', err);
      }
    }

    return NextResponse.json({
      success: true,
      session: sessionResult,
      user: userUpdateResult,
    });
  } catch (error) {
    console.error('Error syncing verification:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      {
        error: 'Failed to sync verification',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
