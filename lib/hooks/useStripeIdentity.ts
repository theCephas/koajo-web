"use client";

import { useState } from 'react';
import { useStripe } from '../stripe-provider';

interface VerificationResult {
  success: boolean;
  error?: string;
  sessionId?: string;
}

type VerificationType = 'document' | 'id_number';

export function useStripeIdentity() {
  const { stripe, loading } = useStripe();
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyIdentity = async (
    email?: string,
    userId?: string,
    options?: { verificationType?: VerificationType }
  ): Promise<VerificationResult> => {
    if (!stripe) {
      console.error('Stripe is not loaded:', { stripe, loading });
      return {
        success: false,
        error: 'Stripe is not loaded yet. Please try again.',
      };
    }

    console.log('Starting verification with Stripe:', { email, userId });
    setIsVerifying(true);

    try {
      // Call your backend to create the VerificationSession
      const response = await fetch('/api/create-verification-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          userId,
          verificationType: options?.verificationType || 'document',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.details || errorData.error || 'Failed to create verification session');
      }

      const { client_secret } = await response.json();

      // Show the verification modal with extended timeout
      console.log('Opening Stripe verification modal...');
      
      const { error } = await stripe.verifyIdentity(client_secret, {
        // Add options to extend the modal timeout
        timeout: 300000, // 5 minutes timeout
      });

      if (error) {
        console.error('Stripe verification error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Full error object:', JSON.stringify(error, null, 2));
        
        // Handle specific timeout/cancellation errors
        if (error.code === 'consent_declined' || error.message?.includes('cancelled')) {
          return {
            success: false,
            error: 'Verification was cancelled or timed out. Please try again and interact with the verification window immediately when it opens.',
          };
        }
        
        return {
          success: false,
          error: getErrorMessage(error.code || 'unknown'),
        };
      }

      // The verification was submitted successfully
      console.log('Verification submitted successfully');
      
      // Add a small delay to show the processing state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        sessionId: client_secret.split('_secret_')[0],
      };
    } catch (error) {
      console.error('Verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    verifyIdentity,
    isVerifying,
    loading,
  };
}

function getErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'consent_declined':
      return 'You declined the verification process. Please try again if you wish to continue.';
    case 'device_unsupported':
      return 'Your device does not support camera functionality required for verification.';
    case 'under_supported_age':
      return 'You must be of legal age to complete verification.';
    case 'phone_otp_declined':
      return 'Phone number verification failed. Please try again.';
    case 'email_verification_declined':
      return 'Email verification failed. Please try again.';
    default:
      return 'Verification failed. Please try again.';
  }
}
