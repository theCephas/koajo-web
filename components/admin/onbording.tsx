"use client";
import { Modal } from "@/components/utils";
import PodSelection from "./pod-plan-selection";
import { useOnboarding } from "@/lib/provider-onboarding";
import PodGoalSetting from "@/components/admin/pod-goal-setting";
import PodFormFilling from "@/components/admin/pod-form";

export default function Onbording({ children }: { children: React.ReactNode }) {
  const { visible, close, step } = useOnboarding(); 
  return (
    <>
      {children}
      <Modal visible={visible} onClose={close}>
        {step === "pod_plan_selection" && <PodSelection />}
        {step === "pod_goal_setting" && <PodGoalSetting />}
         {step === "pod_form_filling" && <PodFormFilling />}
       {/* {step === "pod_onboarding_complete" && <PodOnboardingComplete />} */}
      </Modal>
    </>
  );
}
