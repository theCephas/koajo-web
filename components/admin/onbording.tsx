"use client";
import { Modal } from "@/components/utils";
import PodSelection from "./pod-plan-selection";
import { useOnboarding } from "@/lib/provider-onboarding";

export default function Onbording({ children }: { children: React.ReactNode }) {
  const { visible, close } = useOnboarding(); 
  return (
    <>
      {children}
      <Modal visible={visible} onClose={close}>
        <PodSelection />
      </Modal>
    </>
  );
}
