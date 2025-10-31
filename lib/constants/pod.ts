import { PodDurationWeeks, PodPlanCode, PodType, MaximumMembers, PodGoalCategory } from "../types/pod";

export type PodPlanCodeKeys = "POD_100" | "POD_200" | "POD_500" | "POD_1000" | "CUSTOM";
export type  PodTypeKeys = "STANDARD_6_MEMBER" | "STANDARD_12_MEMBER" | "CUSTOM";

export const POD_PLAN_AMOUNT_CENTS: Record<PodPlanCodeKeys, number> = {
  POD_100: 10000,
  POD_200: 20000,
  POD_500: 50000,
  POD_1000: 100000,
  CUSTOM: 100100, // > 1000 USD
};

export const POD_DURATION_MONTHS: Record<PodDurationWeeks, number> = {
  12: 3,
  24: 6,
};

export const POD_DURATION_CONTRIBUTIONS: Record<PodDurationWeeks, number> = {
  12: 6,
  24: 12,
};

export const MAX_MEMBERS_COUNT: Record<PodTypeKeys, MaximumMembers> = {
  STANDARD_6_MEMBER: 6,
  STANDARD_12_MEMBER: 12,
  CUSTOM: 6, 
};

export const POD_PLAN_ICONS: Record<PodPlanCodeKeys, { id: string, alt: string }> = {
  POD_100: {
    id: "pod_100_huibik",
    alt: "Icon of a 100-unit pod, simplified with minimal lines inside a rectangular outline",
  },
  POD_200: {
    id: "pod_200_gxq1ic",
    alt: "Icon of a 200-unit pod, simplified with minimal lines inside a rectangular outline",
  },
  POD_500: {
    id: "pod_500_abcnk6",
    alt: "Icon of a 500-unit pod, simplified with minimal lines inside a rectangular outline",
  },
  POD_1000: {
    id: "pod_1000_zpmzc5",
    alt: "Icon representing a 1000-unit pod, shown with a rectangular container and stylized markings.",
  },
  CUSTOM: {
    id: "pod_custom_p9ams3",
    alt: "Custom pod icon with adjustable or unique design, featuring a rectangle and detailed inner paths.”",
  },
};

// Goals
 type POD_GOALCATEGORIES_KEYS = "MORTGAGE" | "HOME_IMPROVEMENT" | "COLLEGE_TUITION" | "DEBT_PAYOFF" | "JANUARY_RECOVERY" | "EMERGENCY_FUND" | "BUSINESS_CAPITAL" | "INVESTMENT_PORTFOLIO" | "DETTY_DECEMBER" | "SAVINGS" | "OTHER";

export const POD_GOAL_CATEGORIES_MAP: Record<POD_GOALCATEGORIES_KEYS, PodGoalCategory> = {
  MORTGAGE: "mortgage",
  HOME_IMPROVEMENT: "home_improvement",
  COLLEGE_TUITION: "college_tuition",
  DEBT_PAYOFF: "debt_payoff",
  JANUARY_RECOVERY: "january_recovery",
  EMERGENCY_FUND: "emergency_fund",
  BUSINESS_CAPITAL: "business_capital",
  INVESTMENT_PORTFOLIO: "investment_portfolio",
  DETTY_DECEMBER: "detty_december",
  SAVINGS: "savings",
  OTHER: "other",
};