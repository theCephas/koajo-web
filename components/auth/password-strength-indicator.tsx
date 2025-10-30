"use client";

import { FORM_FIELDS_PATTERNS } from "@/lib/constants/form";
import { getPasswordStrength } from "@/lib/utils/form";

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
  showDescription?: boolean;
  showLabel?: boolean;
}

export default function PasswordStrengthIndicator({
  password,
  showDescription = true,
  showLabel = true,
  className = "",
}: PasswordStrengthIndicatorProps) {
  const passwordStrength = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {showDescription && (
        <p className="text-xs text-text-400">
          Min {FORM_FIELDS_PATTERNS.PASSWORD.MIN_LENGTH} Characters with a
          combination of letters, numbers and special characters
        </p>
      )}

      <div className="flex items-center gap-6">
        <div className="flex gap-1 w-full">
          {[...Array(5)].map((_, segment) => (
            <div
              key={segment}
              className={`h-1.5 rounded-full transition-all ${
                segment < passwordStrength.score
                  ? "bg-tertiary-100"
                  : "bg-text-200"
              }`}
              style={{ width: `${100 / 5}%` }}
            />
          ))}
        </div>
        {showLabel && (
          <span
            className={`text-xs font-semibold ${
              passwordStrength.score <= 2
                ? "text-red-500"
                : passwordStrength.score === 3
                ? "text-yellow-500"
                : passwordStrength.score === 4
                ? "text-blue-500"
                : "text-tertiary-100"
            }`}
          >
            {passwordStrength.label}
          </span>
        )}
      </div>
    </div>
  );
}
