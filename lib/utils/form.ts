import { FORM_FIELDS_PATTERNS } from "../constants";

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

export const getPasswordStrength = (password: string): PasswordStrength => {
  let score = 0;

  if (password.length >= FORM_FIELDS_PATTERNS.PASSWORD.MIN_LENGTH) score++;
  if (FORM_FIELDS_PATTERNS.PASSWORD.LOWERCASE.test(password)) score++;
  if (FORM_FIELDS_PATTERNS.PASSWORD.UPPERCASE.test(password)) score++;
  if (FORM_FIELDS_PATTERNS.PASSWORD.NUMBER.test(password)) score++;
  if (FORM_FIELDS_PATTERNS.PASSWORD.SPECIAL.test(password)) score++;

  if (score <= 2) return { score, label: "Weak", color: "bg-red-500" };
  if (score <= 3) return { score, label: "Fair", color: "bg-yellow-500" };
  if (score <= 4) return { score, label: "Good", color: "bg-blue-500" };
  return { score, label: "Strong", color: "bg-tertiary-100" };
};
