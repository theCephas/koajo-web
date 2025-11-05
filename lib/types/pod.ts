export type PodOnboardingStep =
  | "pod_plan_selection"
  | "pod_goal_setting"
  | "pod_form_filling"
  | "pod_invite_acceptance"
  | "bank_connection"
  | "pod_onboarding_complete";

export type PodDurationWeeks = 12 | 24;

export type PodPlanCode = string;

export type PodStatus = "draft" | "active" | "completed" | "cancelled";

export type PodType = "standard_6_member" | "standard_12_member" | "custom";

export type PodSchedule = "bi-weekly" | "monthly";

export type MaximumMembers = 6 | 12;

export type PodGoalCategory =
  | "mortgage"
  | "home_improvement"
  | "college_tuition"
  | "debt_payoff"
  | "january_recovery"
  | "emergency_fund"
  | "business_capital"
  | "investment_portfolio"
  | "detty_december"
  | "savings"
  | "other";



export interface Pod {
  id: string;
  name: string;
  description?: string;
  podType: PodType;
  planId: string;
  maxMembers: MaximumMembers;
  status: PodStatus;
  schedule: PodSchedule;
  createdBy?: string;
  activationDate: string; // ISO date string
  positionAssignmentDate?: string; 
  isLocked: boolean;
  nullAdminAssigned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PodPlan {
  code: PodPlanCode;
  amount: number;
  lifecycleWeeks: number;
  maxMembers: number;
  active: boolean;
  description?: string;
}

export interface PodMember {
  id: string;
  podId: string;
  userId: string;
  payoutPosition?: number;
  isNullAdmin: boolean;
  stripeSubscriptionId?: string;
  joinedAt: string;
  positionAssignedAt?: string;
}

export interface PodCycle {
  id: string;
  podId: string;
  cycleNumber: number;
  durationWeeks: PodDurationWeeks;
  contributionDate: string; 
  payoutDate: string; 
  recipientUserId?: string;
  status: PodStatus;
  createdAt: string;
}

export interface PodGoal {
  id: string;
  podId: string;
  userId?: string;
  goalCategory: PodGoalCategory;
  customGoalName?: string;
  targetAmountCents?: number;
  currentProgressCents: number;
  createdAt: string;
}

// ===== REQUEST/RESPONSE TYPES =====

export interface CreatePodRequest {
  name?: string;
  podType: PodType;
  planCode: PodPlanCode;
  schedule: PodSchedule;
  activationDate?: string; 
  maxMembers?: MaximumMembers;
}

export interface JoinPodRequest {
  podId: string;
  goalCategory: PodGoalCategory;
  customGoalName?: string;
  targetAmountCents?: number;
}

export interface UpdatePodGoalRequest {
  goalCategory: PodGoalCategory;
  customGoalName?: string;
  targetAmountCents?: number;
}

export interface PodWithDetails extends Pod {
  plan: PodPlan;
  members: PodMember[];
  cycles: PodCycle[];
  goals?: PodGoal[];
  memberCount: number;
}
