import { getApiUrl, getDefaultHeaders } from '@/lib/constants/api';

/**
 * Verification status values for user table
 */
export type UserVerificationStatus = 
  | 'document_verified' 
  | 'id_number_verified' 
  | 'all_verified' 
  | null;

/**
 * Updates the identity_verification_session table in the backend
 */
export async function updateVerificationSession(
  sessionId: string,
  userId: string,
  resultId: string,
  verificationType: 'document' | 'id_number' | 'verification_flow',
  verificationStatus: 'canceled' | 'processing' | 'requires_input' | 'verified'
): Promise<boolean> {
  try {
    const response = await fetch(getApiUrl('/auth/stripe-verification'), {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: JSON.stringify({
        sessionId,
        resultId,
        verificationType,
        verificationStatus,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to update verification session:', errorData);
      return false;
    }

    console.log('Verification session updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating verification session:', error);
    return false;
  }
}

/**
 * Gets current verification statuses for a user
 * Returns object with document and id_number verification statuses
 */
export async function getUserVerificationStatuses(
  userId: string
): Promise<{
  document: 'canceled' | 'processing' | 'requires_input' | 'verified' | null;
  id_number: 'canceled' | 'processing' | 'requires_input' | 'verified' | null;
}> {
  try {
    // Note: This assumes you have an endpoint to get user's verification sessions
    // If not, you might need to check the database directly or add this endpoint
    // For now, we'll return null and let the update function check existing statuses
    
    // TODO: Implement endpoint to fetch user's verification sessions
    // const response = await fetch(getApiUrl(`/auth/verification-sessions?userId=${userId}`));
    
    return {
      document: null,
      id_number: null,
    };
  } catch (error) {
    console.error('Error fetching user verification statuses:', error);
    return {
      document: null,
      id_number: null,
    };
  }
}

/**
 * Determines the user's identity_verification status based on verification completions
 */
function determineUserVerificationStatus(
  documentStatus: 'canceled' | 'processing' | 'requires_input' | 'verified' | null,
  idNumberStatus: 'canceled' | 'processing' | 'requires_input' | 'verified' | null,
  newVerificationType: 'document' | 'id_number',
  newVerificationStatus: 'canceled' | 'processing' | 'requires_input' | 'verified'
): UserVerificationStatus {
  // Update the relevant status
  const updatedDocumentStatus = newVerificationType === 'document' 
    ? newVerificationStatus 
    : documentStatus;
  
  const updatedIdNumberStatus = newVerificationType === 'id_number' 
    ? newVerificationStatus 
    : idNumberStatus;

  // Determine user verification status
  const documentVerified = updatedDocumentStatus === 'verified';
  const idNumberVerified = updatedIdNumberStatus === 'verified';

  if (documentVerified && idNumberVerified) {
    return 'all_verified';
  } else if (idNumberVerified) {
    return 'id_number_verified';
  } else if (documentVerified) {
    return 'document_verified';
  }

  return null;
}

/**
 * Updates the user's identity_verification field in the backend
 * This function should be called after updating a verification session
 * The backend should automatically check if both document and id_number are verified
 * and update to 'all_verified' accordingly
 */
export async function updateUserVerificationStatus(
  userId: string,
  verificationType: 'document' | 'id_number',
  verificationStatus: 'canceled' | 'processing' | 'requires_input' | 'verified'
): Promise<{
  success: boolean;
  actualStatus?: UserVerificationStatus;
}> {
  try {
    // Only update user status if verification is successful
    if (verificationStatus !== 'verified') {
      // Don't update user status for non-verified statuses
      // The verification session table will be updated, but user status remains unchanged
      return { success: true };
    }

    // Determine the user verification status based on the completed verification type
    // We send the individual status, and the backend should check if both are complete
    let userVerificationStatus: UserVerificationStatus = null;

    if (verificationType === 'document') {
      userVerificationStatus = 'document_verified';
    } else if (verificationType === 'id_number') {
      userVerificationStatus = 'id_number_verified';
    }

    // Update user's identity_verification field via PATCH
    // IMPORTANT: The backend MUST check if both document and id_number are verified
    // and automatically update to 'all_verified' if both are complete
    const response = await fetch(getApiUrl('/auth/user'), {
      method: 'PATCH',
      headers: getDefaultHeaders(),
      body: JSON.stringify({
        identity_verification: userVerificationStatus,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to update user verification status:', errorData);
      return { success: false };
    }

    const result = await response.json();
    const actualStatus = result.user?.identity_verification || result.identity_verification;
    
    console.log('User verification status updated:', {
      requested: userVerificationStatus,
      actual: actualStatus,
      message: actualStatus === 'all_verified' 
        ? 'Both verifications are now complete!' 
        : `Waiting for ${verificationType === 'document' ? 'id_number' : 'document'} verification`,
    });

    return {
      success: true,
      actualStatus: actualStatus as UserVerificationStatus,
    };
  } catch (error) {
    console.error('Error updating user verification status:', error);
    return { success: false };
  }
}

/**
 * Explicitly updates user verification status to 'all_verified'
 * Use this when you know both verifications are complete
 */
export async function setUserVerificationToAllVerified(userId: string): Promise<boolean> {
  try {
    const response = await fetch(getApiUrl('/auth/user'), {
      method: 'PATCH',
      headers: getDefaultHeaders(),
      body: JSON.stringify({
        identity_verification: 'all_verified',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to set user verification to all_verified:', errorData);
      return false;
    }

    console.log('User verification status set to all_verified');
    return true;
  } catch (error) {
    console.error('Error setting user verification to all_verified:', error);
    return false;
  }
}

/**
 * Checks and updates user verification status to 'all_verified' if both are complete
 * This should ideally be called by the backend automatically, but we provide
 * this as a fallback to explicitly trigger the check
 */
export async function checkAndUpdateAllVerifiedStatus(userId: string): Promise<boolean> {
  try {
    // Call an endpoint that checks all verification sessions for the user
    // and updates to 'all_verified' if both document and id_number are verified
    // Note: This endpoint should be implemented on the backend
    const response = await fetch(getApiUrl(`/auth/user/${userId}/check-verification-status`), {
      method: 'POST',
      headers: getDefaultHeaders(),
    });

    if (!response.ok) {
      console.log('Check verification status endpoint not available, backend should handle this automatically');
      return false;
    }

    const result = await response.json();
    console.log('Verification status check completed:', result);
    return true;
  } catch (error) {
    // This is expected if the endpoint doesn't exist - backend should handle it automatically
    console.log('Backend should automatically update to all_verified when both verifications complete');
    return false;
  }
}

/**
 * Comprehensive function that updates both verification session and user verification status
 */
export async function syncVerificationStatus(
  sessionId: string,
  userId: string,
  resultId: string,
  verificationType: 'document' | 'id_number' | 'verification_flow',
  verificationStatus: 'canceled' | 'processing' | 'requires_input' | 'verified'
): Promise<{
  sessionUpdated: boolean;
  userStatusUpdated: boolean;
  actualUserStatus?: UserVerificationStatus;
}> {
  // Update verification session
  const sessionUpdated = await updateVerificationSession(
    sessionId,
    userId,
    resultId,
    verificationType,
    verificationStatus
  );

  // Update user verification status only for document and id_number types
  let userStatusUpdated = false;
  let actualUserStatus: UserVerificationStatus | undefined = undefined;
  
  if (verificationType === 'document' || verificationType === 'id_number') {
    const userUpdateResult = await updateUserVerificationStatus(
      userId,
      verificationType,
      verificationStatus
    );
    
    userStatusUpdated = userUpdateResult.success;
    actualUserStatus = userUpdateResult.actualStatus;

    // If the backend returned 'all_verified', it means both verifications are complete
    if (actualUserStatus === 'all_verified') {
      console.log('✅ All verifications complete! User status set to all_verified');
    }
  }

  return {
    sessionUpdated,
    userStatusUpdated,
    actualUserStatus,
  };
}

