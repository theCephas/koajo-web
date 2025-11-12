// ===== AUTH TYPES =====

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginSuccessResponse {
  tokenType: "Bearer";
  accessToken: string;
  expiresAt: string;
  refreshToken?: string;
  refreshExpiresAt?: string;
  user: User & { accountId: string };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  tokenType: "Bearer";
  accessToken: string;
  expiresAt: string;
  refreshToken: string;
  refreshExpiresAt: string;
  user: User;
}

export interface LoginVerificationRequiredResponse {
  email: string;
  requiresVerification: boolean;
  verification: {
    expiresAt: string;
    sentAt: string;
  };
}

export type LoginResponse =
  | LoginSuccessResponse
  | LoginVerificationRequiredResponse;

export interface SignupRequest {
  email: string;
  phoneNumber: string;
  password: string;
}

export interface SignupResponse {
  accountId: string;
  id: string;
  email: string;
  phoneNumber: string;
  avatarUrl?: string;
  emailVerified: boolean;
  verification?: {
    expiresAt: string;
  };
}

export interface VerifyEmailRequest {
  email: string;
  token: string;
  origin?: string;
}

export interface VerifyEmailResponse {
  email: string;
  verified: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  email: string;
  requested: boolean;
}

export interface ResendForgotPasswordRequest {
  email: string;
}

export interface ResendForgotPasswordResponse {
  email: string;
  requested: boolean;
}

export interface ResendVerificationEmailRequest {
  email: string;
  origin?: string;
}

export interface ResendVerificationEmailResponse {
  email: string;
  verification: {
    expiresAt: string;
    sentAt: string;
  };
}

export interface ForgotPasswordResponse {
  email: string;
  requested: boolean;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  email: string;
  reset: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
}

export interface UpdateAvatarRequest {
  avatarUrl: string;
}

export interface UpdateAvatarResponse {
  success: boolean;
  avatarUrl: string;
}

export interface UpdateNotificationPreferencesRequest {
  emailNotificationsEnabled?: boolean;
  transactionNotificationsEnabled?: boolean;
}

export interface UpdateNotificationPreferencesResponse {
  emailNotificationsEnabled: boolean;
  transactionNotificationsEnabled: boolean;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
}

export interface IdentityVerificationRecord {
  id: string;
  resultId?: string | null;
  sessionId: string;
  status: StripeVerificationStatus;
  type: StripeVerificationType;
  completedAt?: string | null;
  recordedAt?: string | null;
}

export interface UpdateUserResponse {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  identity_verification?: IdentityVerificationRecord | null;
}

export type StripeVerificationType =
  | "document"
  | "id_number"
  | "verification_flow";
export type StripeVerificationStatus =
  | "canceled"
  | "processing"
  | "requires_input"
  | "verified";

export interface StripeVerificationRequest {
  identityId: string;
  sessionId: string;
  resultId: string;
  status: StripeVerificationStatus;
  type: StripeVerificationType;
  identity_id?: string;
  session_id?: string;
  result_id?: string;
}

export interface StripeVerificationResponse {
  id: string;
  identityId: string;
  sessionId: string;
  resultId: string;
  status: StripeVerificationStatus;
  type: StripeVerificationType;
  completedAt?: string | null;
  recordedAt: string;
}

export interface LinkStripeBankAccountRequest {
  id: string;
  customer_id: string;
  account_name?: string; // Display name from Stripe
  account_holder_name?: string; // Legal name from account_holder
  institution_name?: string; // Bank name (e.g., "Chase", "Bank of America")
  account_type?: string; // "checking" or "savings"
  last4?: string; // Last 4 digits of account number
}

// ===== POD TYPES =====

export interface PodPlan {
  code: string;
  amount: number;
  lifecycleWeeks: number;
  maxMembers: number;
  active: boolean;
}

export interface PodPlanOpenPod {
  podId: string;
  planCode: string;
  name?: string | null;
  amount: number;
  lifecycleWeeks: number;
  maxMembers: number;
  status: "pending" | "open" | "grace" | "active" | "completed";
  podType: "system" | "custom";
  cadence?: "bi-weekly" | "monthly";
  randomizePositions?: boolean | null;
  expectedMemberCount?: number | null;
  scheduledStartDate?: string | null;
  startDate?: string | null;
  graceEndsAt?: string | null;
  lockedAt?: string | null;
  payoutOrder?: number | null;
  payoutDate?: string | null;
  aheadOfYou?: PodMemberSlot[];
  behindYou?: PodMemberSlot[];
  orderedMembers?: PodMemberSlot[];
  goalType?: string | null;
  goalNote?: string | null;
  totalContributed?: number | null;
  totalContributionTarget?: string | null;
  contributionProgress?: number | null;
  nextPayoutDate?: string | null;
  nextContributionDate?: string | null;
}

export interface PodMemberSlot {
  publicId: string;
  order: number;
  payoutDate?: string;
  isYou: boolean;
}

export interface PodMembership {
  podId: string;
  planCode: string;
  amount: number;
  lifecycleWeeks: number;
  maxMembers: number;
  status: "pending" | "open" | "grace" | "active" | "completed";
  podType: "system" | "custom";
  cadence?: "bi-weekly" | "monthly";
  randomizePositions?: boolean;
  expectedMemberCount?: number;
  scheduledStartDate?: string;
  startDate?: string;
  graceEndsAt?: string;
  lockedAt?: string;
  payoutOrder?: number;
  payoutDate?: string;
  aheadOfYou?: PodMemberSlot[];
  behindYou?: PodMemberSlot[];
  orderedMembers?: PodMemberSlot[];
  goalType?:
    | "mortgage"
    | "college_tuition"
    | "debt_payoff"
    | "emergency_fund"
    | "business_capital"
    | "savings"
    | "other";
  goalNote?: string;
  totalContributed?: string;
  totalContributionTarget: string;
  contributionProgress: number;
  nextPayoutDate?: string;
  nextContributionDate?: string;
}

export interface CreateCustomPodRequest {
  amount: number;
  cadence: "bi-weekly" | "monthly";
  randomizePositions: boolean;
  invitees: string[];
}

export interface JoinPodRequest {
  goal:
    | "mortgage"
    | "college_tuition"
    | "debt_payoff"
    | "emergency_fund"
    | "business_capital"
    | "savings"
    | "other";
  goalNote?: string;
}

export interface AcceptCustomPodInviteRequest {
  token: string;
}

export interface MyPodsResponse {
  pods: PodMembership[];
}

// ===== PAYMENT TYPES =====

export interface CreatePaymentRequest {
  podId: string;
  stripeReference: string;
  amount: number;
  currency: string;
  status: string;
  description?: string;
}

export interface RecordPaymentResponse {
  paymentId: string;
  transactionId: string;
  membershipId: string;
  podId: string;
  amount: string;
  currency: string;
  status: string;
  stripeReference: string;
  totalContributed: string;
}

export interface CreatePayoutRequest {
  podId: string;
  stripeReference: string;
  amount: number;
  fee: number;
  currency: string;
  status: string;
  description?: string;
}

export interface RecordPayoutResponse {
  payoutId: string;
  transactionId: string;
  membershipId: string;
  podId: string;
  amount: string;
  currency: string;
  status: string;
  stripeReference: string;
  fee: string;
  membershipCompleted: boolean;
}

// ===== ACHIEVEMENT TYPES =====

export interface EarnedAchievement {
  code: string;
  name: string;
  description: string;
  awardedAt: string;
}

export interface PendingAchievement {
  code: string;
  name: string;
  description: string;
  progress: number;
  remaining: number;
}

export interface AchievementsSummary {
  totalEarned: number;
  totalAvailable: number;
  earned: EarnedAchievement[];
  pending: PendingAchievement[];
}

// ===== ERROR TYPES =====

export interface ApiError {
  error: string;
  message: string | string[];
  statusCode: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

// ===== UTILITY TYPES =====

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// ===== POD ACTIVITY TYPES =====

export interface PodActivityActor {
  accountId?: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

export interface PodActivityItem {
  id: string;
  type: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  actor: PodActivityActor | null;
}

export interface PodActivitiesResponse {
  total: number;
  items: PodActivityItem[];
}

export interface CreateCustomPodRequest {
  name: string;
  amount: number;
  cadence: "bi-weekly" | "monthly";
  randomizePositions: boolean;
  invitees: string[];
}

export interface CreateCustomPodResponse {
  podId: string;
  planCode: string;
  status: string;
}

export interface JoinPodRequestPayload {
  goal: string;
  goalNote: string;
}

export interface AcceptCustomInviteRequest {
  token: string;
}

// ===== USER TYPES =====

export interface User {
  id: string;
  email: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  emailVerified: boolean;
  agreedToTerms: boolean;
  dateOfBirth?: string;
  avatarId?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
  identityVerification: IdentityVerificationRecord | null;

  emailNotificationsEnabled?: boolean;
  transactionNotificationsEnabled?: boolean;

  customer?: {
    id?: string;
    ssnLast4?: string | null;
    address?: unknown;
  };
  bankAccount?: {
    id?: string;
    customerId?: string | null;
    accountName?: string | null;
    accountHolderName?: string | null;
    institutionName?: string | null;
    accountType?: string | null;
    last4?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
}

export interface RawIdentityVerificationRecord {
  id: string;
  result_id?: string | null;
  session_id: string;
  status: StripeVerificationStatus;
  type: StripeVerificationType;
  completed_at?: string | null;
  recorded_at?: string | null;
}

export interface RawUserProfileResponse {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email_verified: boolean;
  agreed_to_terms: boolean;
  date_of_birth?: string;
  avatar_url?: string;
  is_active: boolean;
  emailNotificationsEnabled?: boolean;
  transactionNotificationsEnabled?: boolean;
  last_login_at: string;
  created_at: string;
  updated_at: string;
  identity_verification?: RawIdentityVerificationRecord | null;
  customer?: User["customer"];
  bank_account?: User["bankAccount"];
}

// ===== AVATAR TYPES =====

export interface Avatar {
  id: string;
  altText: string;
  isDefault: boolean;
  gender: "male" | "female";
  createdAt: string;
  updatedAt: string;
}

export interface RawAvatar {
  id: string;
  alt_text: string;
  is_default: boolean;
  gender: "male" | "female";
  created_at: string;
  updated_at: string;
}

export interface UpdateAvatarRequest {
  avatarUrl: string;
}

export interface UpdateAvatarResponse {
  success: boolean;
  avatarUrl: string;
}
