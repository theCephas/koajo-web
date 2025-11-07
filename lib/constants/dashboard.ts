export type RegistrationStage =
  | "none"
  | "registered"
  | "kyc_document_complete"
  | "kyc_id_number_complete"
  | "email_verified"
  | "bank_connected";

export const REGISTRATION_STAGE: Record<string, RegistrationStage> = {
  NONE: "none",
  REGISTERED: "registered",
  KYC_DOCUMENT_COMPLETE: "kyc_document_complete",
  KYC_ID_NUMBER_COMPLETE: "kyc_id_number_complete",
  EMAIL_VERIFIED: "email_verified",
  BANK_CONNECTED: "bank_connected",
};

export const REGISTRATION_STAGE_MAP = {
  NONE: "/register",
  REGISTERED: "/register/kyc?stage=kyc_document",
  KYC_DOCUMENT_COMPLETE: "/register/kyc?stage=kyc_id_number",
  KYC_ID_NUMBER_COMPLETE: "/register/verify-email?stage=email_verified",
  EMAIL_VERIFIED: "/register/kyc?stage=bank_connected",
  BANK_CONNECTED: "/register/complete",
};

export const DASHBOARD_BREADCRUMBS = {
  OVERVIEW: [
    {
      title: "Dashboard",
    },
    {
      title: "Overview",
      url: "/dashboard",
    },
  ],
  POD_INFO_AND_TRANSACTIONS: [
    {
      title: "Dashboard",
      url: "/dashboard",
    },
    {
      title: "Transactions",
      url: "/dashboard/pod-info-and-transactions",
    },
  ],
  PERSONAL_INFORMATION: [
    {
      title: "Settings",
    },
    {
      title: "Personal Information",
      url: "/settings",
    },
  ],
  PREFERENCES: [
    {
      title: "Settings",
    },
    {
      title: "Preferences",
      url: "/settings/preferences",
    },
  ],
  SECURITY: [
    {
      title: "Settings",
    },
    {
      title: "Security",
      url: "/settings/security",
    },
  ],
  SUBSCRIPTIONS: [
    {
      title: "Settings",
    },
    {
      title: "Subscriptions",
      url: "/settings/subscriptions",
    },
  ],
  HELP_AND_CENTER: [
    {
      title: "Help & Center",
      url: "/help-center",
    },
  ],
};

