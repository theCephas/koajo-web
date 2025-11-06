"use client";
import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Modal } from "@/components/utils";
import PodSelection from "./pod-plan-selection";
import { useOnboarding } from "@/lib/provider-onboarding";
import PodGoalSetting from "@/components/admin/pod-goal-setting";
import PodFormFilling from "@/components/admin/pod-form";
import PodInviteAcceptance from "@/components/admin/pod-invite-acceptance";
import BankConnection from "@/components/admin/bank-connection";

export default function Onboarding({ children }: { children: React.ReactNode }) {
  const { visible, close, step, openInviteAcceptance } = useOnboarding();
  const searchParams = useSearchParams();
  const handledInviteRef = useRef(false);

  useEffect(() => {
    if (handledInviteRef.current) return;
    const token = searchParams?.get("inviteToken");
    if (token) {
      handledInviteRef.current = true;
      openInviteAcceptance(token);
    }
  }, [openInviteAcceptance, searchParams]);

  return (
    <>
      {children}
      <Modal visible={visible} onClose={close}>
        {step === "pod_plan_selection" && <PodSelection />}
        {step === "pod_goal_setting" && <PodGoalSetting />}
        {step === "pod_form_filling" && <PodFormFilling />}
        {step === "pod_invite_acceptance" && <PodInviteAcceptance />} 
        {step === "bank_connection" && <BankConnection />}
      </Modal>
    </>
  );
}
