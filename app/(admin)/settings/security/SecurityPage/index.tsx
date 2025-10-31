"use client";
import { FormEvent, useState } from "react";
import cn from "clsx";
import styles from "./SecurityPage.module.sass";
import Layout from "@/components2/usefull/Layout";
import Settings from "@/components2/Settings";
import Field from "@/components2/usefull/Field";
import { AuthService } from "@/lib/services/authService";
import { TokenManager } from "@/lib/utils/menory-manager";
import {
  FORM_FIELDS_MESSAGES,
  FORM_FIELDS_PATTERNS,
} from "@/lib/constants/form";
import { ApiError } from "@/lib/types/api";
import { ApiErrorClass } from "@/lib/utils/auth";

const breadcrumbs = [
  {
    title: "Settings",
    url: "/settings",
  },
  {
    title: "Security",
  },
];

// type SecurityPageProps = {};

type StatusState = {
  type: "success" | "error" | "info";
  message: string;
} | null;

const resolveApiMessage = (
  message: string | string[] | undefined,
  fallback: string
): string => {
  if (Array.isArray(message)) {
    const first = message.find(
      (value) => typeof value === "string" && value.trim().length > 0
    );
    return first ? first.trim() : fallback;
  }

  if (typeof message === "string" && message.trim().length > 0) {
    return message.trim();
  }

  return fallback;
};

const SecurityPage = () => {
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [repeatPassword, setRepeatPassword] = useState<string>("");
  const [status, setStatus] = useState<StatusState>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const validatePasswords = (): string | null => {
    if (!oldPassword) {
      return "Current password is required.";
    }

    if (!newPassword) {
      return "New password is required.";
    }

    if (FORM_FIELDS_PATTERNS.PASSWORD.SPACE.test(newPassword)) {
      setNewPassword(newPassword.replace(/\s/g, ""));
      return FORM_FIELDS_MESSAGES.PASSWORD.SPACE;
    }

    if (newPassword.length < FORM_FIELDS_PATTERNS.PASSWORD.MIN_LENGTH) {
      return FORM_FIELDS_MESSAGES.PASSWORD.MIN_LENGTH;
    }

    if (!FORM_FIELDS_PATTERNS.PASSWORD.ALL.test(newPassword)) {
      return FORM_FIELDS_MESSAGES.PASSWORD.ALL;
    }

    if (!repeatPassword) {
      return "Please confirm your new password.";
    }

    if (newPassword !== repeatPassword) {
      return FORM_FIELDS_MESSAGES.PASSWORD.REPEAT;
    }

    if (newPassword === oldPassword) {
      return "New password must be different from current password.";
    }

    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setStatus(null);

    const validationError = validatePasswords();

    if (validationError) {
      setStatus({
        type: "error",
        message: validationError,
      });
      return;
    }

    const token = TokenManager.getToken();

    if (!token) {
      setStatus({
        type: "error",
        message: "You need to be logged in to change your password.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await AuthService.changePassword(
        {
          currentPassword: oldPassword,
          newPassword,
        },
        token
      );

      if (response && "error" in response) {
        const apiResponse = response as ApiError;
        setStatus({
          type: "error",
          message: resolveApiMessage(
            apiResponse.message,
            "Unable to update password. Please try again."
          ),
        });
        return;
      }

      setStatus({
        type: "success",
        message: "Password updated successfully.",
      });
      setOldPassword("");
      setNewPassword("");
      setRepeatPassword("");
    } catch (error: unknown) {
      const fallback = "Unable to update password right now. Please try again.";
      const message =
        error instanceof ApiErrorClass
          ? resolveApiMessage(error.message, fallback)
          : error instanceof Error
          ? error.message
          : fallback;

      setStatus({
        type: "error",
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

const resetForm = () => {
  setOldPassword("");
  setNewPassword("");
  setRepeatPassword("");
  setStatus(null);
};

  return (
    <Layout title="Settings" breadcrumbs={breadcrumbs}>
      <Settings title="Security" tooltip="Update password">
        <form onSubmit={handleSubmit}>
          <Field
            className={styles.field}
            label="Old Password"
            type="password"
            placeholder="Type old password"
            value={oldPassword}
            onChange={(e) => {
              setStatus(null);
              setOldPassword(e.target.value);
            }}
            required
          />
          <Field
            className={styles.field}
            label="New Password"
            type="password"
            placeholder="Type new password"
            value={newPassword}
            onChange={(e) => {
              const sanitized = e.target.value.replace(/\s/g, "");
              setStatus(
                sanitized === e.target.value
                  ? null
                  : {
                      type: "info",
                      message: FORM_FIELDS_MESSAGES.PASSWORD.SPACE,
                    }
              );
              setNewPassword(sanitized);
            }}
            required
          />
          <Field
            className={styles.field}
            label="Repeat New Password"
            type="password"
            placeholder="Type repeat password"
            value={repeatPassword}
            onChange={(e) => {
              const sanitized = e.target.value.replace(/\s/g, "");
              setStatus(null);
              setRepeatPassword(sanitized);
            }}
            required
          />
          {status && (
            <div
              className={cn(styles.status, {
                [styles.statusSuccess]: status.type === "success",
                [styles.statusError]: status.type === "error",
                [styles.statusInfo]: status.type === "info",
              })}
            >
              {status.message}
            </div>
          )}
          <div className={styles.btns}>
            <button
              type="button"
              className={cn("button-stroke", styles.button)}
              onClick={resetForm}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={cn("button", styles.button)}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </Settings>
    </Layout>
  );
};

export default SecurityPage;
