import {
  API_ENDPOINTS,
  getApiUrl,
  getDefaultHeaders,
} from "@/lib/constants/api";
import type {
  StripeVerificationStatus,
  StripeVerificationType,
} from "@/lib/types/api";

/**
 * Updates the identity_verification_session table in the backend
 */
export async function updateVerificationSession(
  sessionId: string,
  identityId: string,
  resultId: string,
  verificationType: StripeVerificationType,
  verificationStatus: StripeVerificationStatus
): Promise<boolean> {
  try {
    const response = await fetch(
      getApiUrl(API_ENDPOINTS.AUTH.IDENTITY_VERIFICATION),
      {
        method: "POST",
        headers: getDefaultHeaders(),
        body: JSON.stringify({
          identity_id: identityId,
          session_id: sessionId,
          result_id: resultId,
          type: verificationType,
          status: verificationStatus,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to update verification session:", errorData);
      return false;
    }

    console.log("Verification session updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating verification session:", error);
    return false;
  }
}

/**
 * Gets current verification statuses for a user
 * Returns object with document and id_number verification statuses
 */
export async function getUserVerificationStatuses(_userId: string): Promise<{
  document: StripeVerificationStatus | null;
  id_number: StripeVerificationStatus | null;
}> {
  void _userId;
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
    console.error("Error fetching user verification statuses:", error);
    return {
      document: null,
      id_number: null,
    };
  }
}

/**
 * Updates the user's identity_verification field in the backend
 * This function should be called after updating a verification session
 * The backend should automatically check if both document and id_number are verified
 * and update to 'all_verified' accordingly
 */
export async function updateUserVerificationStatus(
  _userId: string,
  _verificationType: Extract<StripeVerificationType, "document" | "id_number">,
  _verificationStatus: StripeVerificationStatus
): Promise<{
  success: boolean;
}> {
  void _userId;
  void _verificationType;
  void _verificationStatus;
  // Backend now records identity progress via the identity-verification endpoint,
  // so we do not need to patch the user profile separately from the frontend.
  return { success: true };
}

/**
 * Explicitly updates user verification status to 'all_verified'
 * Use this when you know both verifications are complete
 */
export async function setUserVerificationToAllVerified(): Promise<boolean> {
  console.log(
    "User verification state is managed by the backend; no manual override required."
  );
  return true;
}

/**
 * Checks and updates user verification status to 'all_verified' if both are complete
 * This should ideally be called by the backend automatically, but we provide
 * this as a fallback to explicitly trigger the check
 */
export async function checkAndUpdateAllVerifiedStatus(): Promise<boolean> {
  console.log(
    "Backend automatically promotes identity verification status; skipping client-side check."
  );
  return true;
}

/**
 * Comprehensive function that updates both verification session and user verification status
 */
export async function syncVerificationStatus(
  sessionId: string,
  identityId: string,
  resultId: string,
  verificationType: StripeVerificationType,
  verificationStatus: StripeVerificationStatus
): Promise<{
  sessionUpdated: boolean;
  userStatusUpdated: boolean;
}> {
  // Update verification session
  const sessionUpdated = await updateVerificationSession(
    sessionId,
    identityId,
    resultId,
    verificationType,
    verificationStatus
  );

  return {
    sessionUpdated,
    userStatusUpdated: false,
  };
}
