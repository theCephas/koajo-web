"use client";

import { useMemo } from "react";
import { useForm, type FieldValues, type Path, type RegisterOptions, type UseFormReturn, type DefaultValues } from "react-hook-form";

export type FormType = "login" | "registration" | "otp";

export interface LoginFormValues {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegistrationFormValues {
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface OtpFormValues {
  otp: string;
}

export type FormValuesMap = {
  login: LoginFormValues;
  registration: RegistrationFormValues;
  otp: OtpFormValues;
};

const defaultValuesByType: { [K in FormType]: Partial<FormValuesMap[K]> } = {
  login: {
    email: "",
    password: "",
    rememberMe: false,
  },
  registration: {
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  },
  otp: {
    otp: "",
  },
};

function getRules<T extends FieldValues>(
  formType: FormType,
  name: string,
  form: UseFormReturn<T>
): RegisterOptions<T, Path<T>> | undefined {
  if (formType === "login") {
    switch (name) {
      case "email":
        return {
          required: "Email is required",
          pattern: {
            value: /\S+@\S+\.\S+/, // simple email check
            message: "Please enter a valid email address",
          },
        } as RegisterOptions<T, Path<T>>;
      case "password":
        return {
          required: "Password is required",
          minLength: { value: 6, message: "Password must be at least 6 characters" },
        } as RegisterOptions<T, Path<T>>;
      default:
        return undefined;
    }
  }

  if (formType === "registration") {
    switch (name) {
      case "firstName":
        return { required: "First name is required", minLength: { value: 2, message: "Too short" } } as RegisterOptions<T, Path<T>>;
      case "lastName":
        return { required: "Last name is required", minLength: { value: 2, message: "Too short" } } as RegisterOptions<T, Path<T>>;
      case "email":
        return {
          required: "Email is required",
          pattern: { value: /\S+@\S+\.\S+/, message: "Please enter a valid email address" },
        } as RegisterOptions<T, Path<T>>;
      case "password":
        return {
          required: "Password is required",
          minLength: { value: 8, message: "Password must be at least 8 characters" },
        } as RegisterOptions<T, Path<T>>;
      case "confirmPassword":
        return {
          required: "Please confirm your password",
          validate: (value: unknown) => {
            const password = (form.getValues() as unknown as RegistrationFormValues).password;
            return value === password || "Passwords do not match";
          },
        } as RegisterOptions<T, Path<T>>;
      case "agreeToTerms":
        return {
          validate: (value: unknown) => Boolean(value) || "You must agree to the terms and conditions",
        } as RegisterOptions<T, Path<T>>;
      default:
        return undefined;
    }
  }

  if (formType === "otp") {
    switch (name) {
      case "otp":
        return {
          required: "Enter the 6-digit code",
          minLength: { value: 6, message: "Code must be 6 digits" },
          maxLength: { value: 6, message: "Code must be 6 digits" },
          pattern: { value: /^\d{6}$/u, message: "Code must be numeric" },
        } as RegisterOptions<T, Path<T>>;
      default:
        return undefined;
    }
  }

  return undefined;
}

export function useValidateForm<T extends FormType>(formType: T) {
  type Values = FormValuesMap[T];

  const form = useForm<Values>({
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: defaultValuesByType[formType] as DefaultValues<Values>,
  });

  const rules = useMemo(() => ({
    for: (name: keyof Values) => getRules(formType, String(name), form as unknown as UseFormReturn<FieldValues>),
  }), [formType, form]);

  const registerWithRules = <K extends keyof Values>(name: K) => {
    const fieldRules = rules.for(name);
    return form.register(name as unknown as Path<Values>, fieldRules as RegisterOptions<Values, Path<Values>>);
  };

  return {
    ...form,
    registerField: registerWithRules,
    rules,
    formType,
  } as const;
}

export type UseValidateFormReturn<T extends FormType> = ReturnType<typeof useValidateForm<T>>;
