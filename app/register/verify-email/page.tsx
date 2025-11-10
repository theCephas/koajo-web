"use client";
import CardVerifyEmail from "@/components/admin/card-verify-email";
import { Suspense } from "react";


export default function VerifyEmailPage() {
  return (
    <Suspense>
      <CardVerifyEmail />
    </Suspense>
  );
}
