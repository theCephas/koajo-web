import { HTMLTag } from "@/types";
export const REM_BASE = 16;

export const HEADINGS: HTMLTag[] = ["h1", "h2", "h3", "h4", "h5", "h6"];

export const FORM_FIELDS_PATTERNS = {
  FIRST_NAME: {
    PATTERN: /^[a-zA-Z]+$/,
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },

  LAST_NAME: {
    PATTERN: /^[a-zA-Z]+$/,
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },

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

  PHONE_NUMBER: {
    PATTERN: /^\+1\d{10}$/, // US phone number with country code: +1XXXXXXXXXX (10 digits)
    MAX_LENGTH: 10,
  },

  FORMATTED_PHONE_NUMBER: {
    PATTERN: /^\(\d{3}\) \d{3} \d{4}$/, // (XXX) XXX XXXX
    MAX_LENGTH: 14,
  },
};

export const FORM_FIELDS_MESSAGES = {
  FIRST_NAME: {
    REQUIRED: "First name is required",
    PATTERN: "First name must be alphabetic letters only",
    MIN_LENGTH: "First name must be at least 2 characters",
    MAX_LENGTH: "First name must be at most 50 characters",
  },
  LAST_NAME: {
    REQUIRED: "Last name is required",
    PATTERN: "Last name must be alphabetic letters only",
    MIN_LENGTH: "Last name must be at least 2 characters",
    MAX_LENGTH: "Last name must be at most 50 characters",
  },
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
    PATTERN: "Please enter a valid 10-digit US phone number",
    MAX_LENGTH: "Phone number must be at most 10 digits",
    REQUIRED: "Phone number is required",
  },

  FORMATTED_PHONE_NUMBER: {
    PATTERN: "Please enter a valid 10-digit US phone number",
    MAX_LENGTH: "Phone number must be at most 14 digits",
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
