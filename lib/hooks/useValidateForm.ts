"use client";

import { useMemo } from "react";
import {
  useForm,
  type FieldValues,
  type Path,
  type RegisterOptions,
  type UseFormReturn,
  type DefaultValues,
} from "react-hook-form";
import { FORM_FIELDS_MESSAGES, FORM_FIELDS_PATTERNS } from "../constants";

export type FormType = "login" | "registration" | "otp";

export interface LoginFormValues {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegistrationFormValues {
  firstName: string;
  lastName: string;
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
    firstName: "",
    lastName: "",
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
          required: FORM_FIELDS_MESSAGES.EMAIL.REQUIRED,
          pattern: {
            value: FORM_FIELDS_PATTERNS.EMAIL, // simple email check
            message: FORM_FIELDS_MESSAGES.EMAIL.PATTERN,
          },
        } as RegisterOptions<T, Path<T>>;
      case "password":
        return {
          required: FORM_FIELDS_MESSAGES.PASSWORD.REQUIRED,
          minLength: {
            value: FORM_FIELDS_PATTERNS.PASSWORD.MIN_LENGTH,
            message: FORM_FIELDS_MESSAGES.PASSWORD.MIN_LENGTH,
          },
        } as RegisterOptions<T, Path<T>>;
      default:
        return undefined;
    }
  }

  if (formType === "registration") {
    switch (name) {
      case "firstName":
        return {
          required: FORM_FIELDS_MESSAGES.FIRST_NAME.REQUIRED,
        } as RegisterOptions<T, Path<T>>;
      case "lastName":
        return {
          required: FORM_FIELDS_MESSAGES.LAST_NAME.REQUIRED,
        } as RegisterOptions<T, Path<T>>;
      case "email":
        return {
          required: FORM_FIELDS_MESSAGES.EMAIL.REQUIRED,
          pattern: {
            value: FORM_FIELDS_PATTERNS.EMAIL,
            message: FORM_FIELDS_MESSAGES.EMAIL.PATTERN,
          },
        } as RegisterOptions<T, Path<T>>;
      case "phoneNumber":
        return {
          required: FORM_FIELDS_MESSAGES.FORMATTED_PHONE_NUMBER.REQUIRED,
          pattern: {
            value: FORM_FIELDS_PATTERNS.FORMATTED_PHONE_NUMBER,
            message: FORM_FIELDS_MESSAGES.FORMATTED_PHONE_NUMBER.PATTERN,
          },
        } as RegisterOptions<T, Path<T>>;
      case "password":
        return {
          required: FORM_FIELDS_MESSAGES.PASSWORD.REQUIRED,
          minLength: {
            value: FORM_FIELDS_PATTERNS.PASSWORD.MIN_LENGTH,
            message: FORM_FIELDS_MESSAGES.PASSWORD.MIN_LENGTH,
          },
        } as RegisterOptions<T, Path<T>>;
      case "confirmPassword":
        return {
          required: FORM_FIELDS_MESSAGES.PASSWORD.REPEAT,
          validate: (value: unknown) => {
            const password = (
              form.getValues() as unknown as RegistrationFormValues
            ).password;
            return value === password || FORM_FIELDS_MESSAGES.PASSWORD.REPEAT;
          },
        } as RegisterOptions<T, Path<T>>;
      case "agreeToTerms":
        return {
          validate: (value: unknown) => {
            return Boolean(value) || FORM_FIELDS_MESSAGES.AGREE_TO_TERMS.REQUIRED;
          },
        } as RegisterOptions<T, Path<T>>;
      default:
        return undefined;
    }
  }

  if (formType === "otp") {
    switch (name) {
      case "otp":
        return {
          required: FORM_FIELDS_MESSAGES.OTP.REQUIRED,
          maxLength: {
            value: FORM_FIELDS_PATTERNS.OTP.LENGTH,
            message: FORM_FIELDS_MESSAGES.OTP.LENGTH,
          },
          pattern: {
            value: FORM_FIELDS_PATTERNS.OTP.PATTERN,
            message: FORM_FIELDS_MESSAGES.OTP.PATTERN,
          },
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

  const rules = useMemo(
    () => ({
      for: (name: keyof Values) =>
        getRules(
          formType,
          String(name),
          form as unknown as UseFormReturn<FieldValues>
        ),
    }),
    [formType, form]
  );

  const registerWithRules = <K extends keyof Values>(name: K) => {
    const fieldRules = rules.for(name);
    return form.register(
      name as unknown as Path<Values>,
      fieldRules as RegisterOptions<Values, Path<Values>>
    );
  };

  return {
    ...form,
    registerField: registerWithRules,
    rules,
    formType,
  } as const;
}

export type UseValidateFormReturn<T extends FormType> = ReturnType<
  typeof useValidateForm<T>
>;
