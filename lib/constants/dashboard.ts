export type RegistrationStage = "none" | "registered" | "kyc_document_complete" | "kyc_id_number_complete" | "email_verified" | "bank_connected";

export const REGISTRATION_STAGE: Record<string, RegistrationStage> = 
{
  NONE: "none",
  REGISTERED: "registered",
  KYC_DOCUMENT_COMPLETE: "kyc_document_complete",
  KYC_ID_NUMBER_COMPLETE: "kyc_id_number_complete",
  EMAIL_VERIFIED: "email_verified",
  BANK_CONNECTED: "bank_connected",
}

export const REGISTRATION_STAGE_MAP = {
  NONE: "/register",
  REGISTERED: "/register/kyc?stage=kyc_document",
  KYC_DOCUMENT_COMPLETE: "/register/kyc?stage=kyc_id_number",
  KYC_ID_NUMBER_COMPLETE: "/register/verify-email?stage=email_verified",
  EMAIL_VERIFIED: "/register/kyc?stage=bank_connected",
  BANK_CONNECTED: "/register/complete",
}