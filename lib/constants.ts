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
  },

  EMAIL: /\S+@\S+\.\S+/,

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
  },

  EMAIL: {
    PATTERN: "Please enter a valid email address",
    REQUIRED: "Email is required",
  },

  PHONE_NUMBER: {
    PATTERN: "Please enter a valid phone number",
    REQUIRED: "Phone number is required",
  },
};
