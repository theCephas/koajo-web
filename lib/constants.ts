import { HTMLTag } from "@/types";
export const REM_BASE = 16;

export const HEADINGS: HTMLTag[] = ["h1", "h2", "h3", "h4", "h5", "h6"];

export const FORM_FIELDS_PATTERNS = {
  PASSWORD: {
    MIN_LENGTH: 10,
    ALL: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/,
    LOWERCASE: /[a-z]/,
    UPPERCASE: /[A-Z]/,
    NUMBER: /[0-9]/,
    SPECIAL: /[^A-Za-z0-9]/,
    SPACE: /\s/,
  },

  EMAIL: /\S+@\S+\.\S+/,

  OTP: {
    LENGTH: 6,
    PATTERN: /^\d{6}$/,
    REQUIRED: "Enter the 6-digit code",
  },

  PHONE_NUMBER: /^\+[1-9](?:[ -]?\d){1,14}$/, // E.164 with optional space or dash separators
};

export const FORM_FIELDS_MESSAGES = {
  PASSWORD: {
    ALL: "Password must contain uppercase, lowercase, number, and special characters",
    LOWERCASE: "Password must contain a lowercase character",
    UPPERCASE: "Password must contain a uppercase character",
    NUMBER: "Password must contain a number",
    SPECIAL: "Password must contain a special character",
    MIN_LENGTH: "Password must be at least 10 characters",
    REPEAT: "Passwords do not match",
    REQUIRED: "Password is required",
    SPACE: "Spaces not allowed. We removed them automatically",
  },

  EMAIL: {
    PATTERN: "Please enter a valid email address",
    REQUIRED: "Email is required",
  },

  PHONE_NUMBER: {
    PATTERN: "Please enter a valid phone number with country code",
    REQUIRED: "Phone number is required",
  },

  OTP: {
    REQUIRED: "Enter the 6-digit code",
    LENGTH: "Code must be 6 digits",
    PATTERN: "Code must be number only",
  },

  AGREE_TO_TERMS: {
    REQUIRED: "You must agree to the terms and conditions",
  },
};
