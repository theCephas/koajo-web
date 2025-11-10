"use client";
import { useEffect, useRef, useState } from "react";
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
  const [renderStep, setRenderStep] = useState(step);

  useEffect(() => {
    if (handledInviteRef.current) return;
    const token = searchParams?.get("inviteToken");
    if (token) {
      handledInviteRef.current = true;
      openInviteAcceptance(token);
    }
  }, [openInviteAcceptance, searchParams]);

  useEffect(() => {
    if (visible) {
      setRenderStep(step);
      return;
    }

    if (step === "verification_pending") {
      setRenderStep(step);
    }
  }, [step, visible]);

  return (
    <>
      {children}
      {renderStep !== "verification_pending" && (
        <Modal visible={visible} onClose={close}>
          {renderStep === "pod_plan_selection" && <PodSelection />}
          {renderStep === "pod_goal_setting" && <PodGoalSetting />}
          {renderStep === "pod_form_filling" && <PodFormFilling />}
          {renderStep === "pod_invite_acceptance" && <PodInviteAcceptance />}
          {renderStep === "bank_connection" && <BankConnection />}
        </Modal>
      )}
    </>
  );
}
