
// ===== AUTH TYPES =====

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginSuccessResponse {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
  user: User & { accountId: string };
}

export interface LoginVerificationRequiredResponse {
  email: string;
  requiresVerification: boolean;
  verification: {
    expiresAt: string;
    sentAt: string;
  };
}

export type LoginResponse = LoginSuccessResponse | LoginVerificationRequiredResponse;

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
  avatarUrl?: string;
}

export interface UpdateAvatarResponse {
  avatarUrl?: string;
}

export interface UpdateNotificationPreferencesRequest {
  emailNotificationsEnabled?: boolean;
  transactionNotificationsEnabled?: boolean;
}

export interface UpdateNotificationPreferencesResponse {
  emailNotificationsEnabled: boolean;
  transactionNotificationsEnabled: boolean;
}

// ===== POD TYPES =====

export interface PodPlan {
  code: string;
  amount: number;
  lifecycleWeeks: number;
  maxMembers: number;
  active: boolean;
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
  status: 'pending' | 'open' | 'grace' | 'active' | 'completed';
  podType: 'system' | 'custom';
  cadence?: 'bi-weekly' | 'monthly';
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
  goalType?: 'mortgage' | 'college_tuition' | 'debt_payoff' | 'emergency_fund' | 'business_capital' | 'savings' | 'other';
  goalNote?: string;
  totalContributed?: string;
  totalContributionTarget: string;
  contributionProgress: number;
  nextPayoutDate?: string;
  nextContributionDate?: string;
}

export interface CreateCustomPodRequest {
  amount: number;
  cadence: 'bi-weekly' | 'monthly';
  randomizePositions: boolean;
  invitees: string[];
}

export interface JoinPodRequest {
  goal: 'mortgage' | 'college_tuition' | 'debt_payoff' | 'emergency_fund' | 'business_capital' | 'savings' | 'other';
  goalNote?: string;
}

export interface AcceptCustomPodInviteRequest {
  token: string;
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

// ===== USER TYPES =====

export interface User {
  id: string;
  email: string;
  phoneNumber: string;
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
  emailNotificationsEnabled?: boolean;
  transactionNotificationsEnabled?: boolean;
  identityVerification?: {
    id?: string;
    identityId?: string | null;
    sessionId?: string | null;
    resultId?: string | null;
    status?: string | null;
    type?: string | null;
    completedAt?: string | null;
    recordedAt?: string | null;
  };
  customer?: {
    id?: string;
    ssnLast4?: string | null;
    address?: unknown;
  };
  bankAccount?: {
    id?: string;
    customerId?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
}

export interface RawUserProfileResponse {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  email_verified: boolean;
  agreed_to_terms: boolean;
  date_of_birth?: string | null;
  avatar_id?: string | null;
  is_active: boolean;
  emailNotificationsEnabled?: boolean;
  transactionNotificationsEnabled?: boolean;
  last_login_at?: string | null;
  created_at?: string;
  updated_at?: string;
  identity_verification?: {
    id?: string;
    identity_id?: string | null;
    session_id?: string | null;
    result_id?: string | null;
    status?: string | null;
    type?: string | null;
    completed_at?: string | null;
    recorded_at?: string | null;
  };
  customer?: {
    id?: string;
    ssn_last4?: string | null;
    address?: unknown;
  };
  bank_account?: {
    id?: string;
    customer_id?: string | null;
    created_at?: string;
    updated_at?: string;
  };
}
