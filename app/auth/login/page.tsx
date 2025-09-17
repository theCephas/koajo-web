"use client";

import Link from "next/link";
import { Button, Field, PasswordField } from "@/components/utils";
import { useAuth } from "@/lib/hooks/useAuth";
import { useForm } from "react-hook-form";
import { useState } from "react";
import GoogleIcon from "@/public/media/icons/google-g-letter.svg";
import CardAuth from "@/components/auth/card-auth";
import { useRouter } from "next/navigation";

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors: formErrors, isSubmitting },
    watch,
  } = useForm<LoginFormData>();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const formData = watch();
  const [faillureMessage, setFaillureMessage] = useState<string>("");
  const handleSubmitForm = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const success = await login(data.email, data.password);

      if (!success) {
        setFaillureMessage("Invalid email or password");
        return;
      }

      // Redirect to dashboard on success
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Implement Google OAuth
    console.log("Google login clicked");
  };

  return (
    <CardAuth
      title="Login First to Your Account"
      description="Sign in to your Koajo account to access all Koajo products."
    >
      {/* Form */}
      <form
        onSubmit={handleSubmit(handleSubmitForm)}
        className="space-y-6.5"
        noValidate
      >
        {faillureMessage && <span className="text-red-500 text-sm mx-auto  w-fit block">{faillureMessage}</span>}
        {/* Email Field */}
        <Field
          label="Email"
          type="email"
          placeholder="Enter Your email"
          required
          error={formErrors.email?.message}
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Please enter a valid email address",
            },
          })}
        />

        {/* Password Field */}
        <PasswordField
          label="Password"
          placeholder="Enter your password"
          required
          error={formErrors.password?.message}
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 10,
              message: "Password must be at least 10 characters",
            },
          })}
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("rememberMe")}
              className="w-4 h-4 text-primary border-secondary-100 rounded focus:ring-primary"
            />
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-base text-text-500">Remember me</span>
            </label>
          </div>

          <Link
            href="/auth/login/forgot-password"
            className="text-base text-tertiary-100 hover:text-tertiary-100/80 transition-colors"
          >
            Forgot Password
          </Link>
        </div>

        {/* Login Button */}
        <div className="flex flex-col gap-3 items-center">
          <Button
            type="submit"
            text={isLoading ? "Logging in..." : "Login"}
            variant="primary"
            className="w-full"
            disabled={isLoading}
            showArrow={false}
          />

          <span className="text-sm text-gray-400">or login with</span>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className="cursor-pointer w-full flex items-center justify-center gap-1 px-8 py-3 border border-secondary-100 rounded-full text-text-500 hover:bg-gray transition-colors"
          >
            <GoogleIcon className="w-5 h-5" />
            Google
          </button>
        </div>
      </form>

      {/* Registration Link */}
      <div className="text-center font-semibold flex items-center justify-center gap-1">
        <span className="text-text-400">Don&apos;t have an account? </span>
        <Link
          href="/register"
          className="text-tertiary-100 hover:text-tertiary-100/80"
        >
          Register Here
        </Link>
      </div>
    </CardAuth>
  );
}
