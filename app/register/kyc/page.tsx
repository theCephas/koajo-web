"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/utils";
import CardFaqTopic from "@/components/utils/card-faq-topic";
import { CameraIcon, LockClosedIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import CardAuth from "@/components/auth/card-auth";
import { useStripeIdentity } from "@/lib/hooks/useStripeIdentity";

export default function KycPage() {
  const [currentStep, setCurrentStep] = useState<"verification" | "mobile" | "processing" | "success">("verification");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const router = useRouter();
  const { verifyIdentity, isVerifying, loading: stripeLoading } = useStripeIdentity();

  const handleAgreeAndContinue = async () => {
    setError(null);
    setCountdown(3); // Start 3-second countdown
    
    // Countdown before opening modal
    for (let i = 3; i > 0; i--) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCountdown(i - 1);
    }
    
    setCountdown(null);
    setIsLoading(true);
    
    try {
      // Get user email from localStorage or context (you may need to adjust this)
      const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
      const userId = localStorage.getItem('userId') || 'user_123';
      
      const result = await verifyIdentity(userEmail, userId);
      
      if (result.success) {
        setVerificationResult(result);
        // Show processing message instead of immediate success
        setCurrentStep("processing");
      } else {
        setError(result.error || 'Verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = () => {
    router.push("/register");
  };

  const handleBack = () => {
    if (currentStep === "mobile") {
      setCurrentStep("verification");
    } else {
      router.push("/register/otp");
    }
  };

  const handleContinueOnMobile = async () => {
    setIsLoading(true);
    try {
      // Simulate mobile verification process
      await new Promise((resolve) => setTimeout(resolve, 2000));
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueToDashboard = () => {
    router.push("/dashboard");
  };

  // Processing step after verification submission
  if (currentStep === "processing") {
    return (
      <div className="bg-white flex items-center justify-center p-4 rounded-2xl">
        <div className="w-full max-w-md">
          <CardAuth
            title="Verification Submitted"
            description="Your identity verification has been submitted and is being processed. This may take a few minutes."
          >
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Verification</h3>
                <p className="text-gray-600">
                  We're verifying your identity documents. You'll be notified once the process is complete.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => setCurrentStep("success")}
                  text="Check Status"
                  variant="primary"
                  className="w-full"
                  showArrow={true}
                />
                
                <Button
                  onClick={() => setCurrentStep("verification")}
                  text="Try Again"
                  variant="secondary"
                  className="w-full"
                  showArrow={false}
                />
              </div>
            </div>
          </CardAuth>
        </div>
      </div>
    );
  }

  // Success step after verification
  if (currentStep === "success") {
    return (
      <div className="bg-white flex items-center justify-center p-4 rounded-2xl">
        <div className="w-full max-w-md">
          <CardAuth
            title="Verification Successful!"
            description="Your identity has been successfully verified. You can now proceed to your dashboard."
          >
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Identity Verified</h3>
                <p className="text-gray-600">
                  Thank you for completing the verification process. Your account is now fully set up.
                </p>
              </div>

              <Button
                onClick={handleContinueToDashboard}
                text="Continue to Dashboard"
                variant="primary"
                className="w-full"
                showArrow={true}
              />
            </div>
          </CardAuth>
        </div>
      </div>
    );
  }

  // if (currentStep === "verification") {
    return (
      <div className=" bg-white flex items-center justify-center p-4 rounded-2xl">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex-1 text-center">
              <div className="text-2xl font-bold text-black">stripe</div>
            </div>
          </div>

          {/* Main Content */}
          <CardAuth
            title="Koajo works with Stripe to verify your identity"
            description=""
          >
            <div className="space-y-6">
              {/* Verification Points */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CameraIcon className="w-6 h-6 text-gray-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">
                    You&apos;ll take a photo of a valid ID, then take a selfie to make sure it&apos;s yours. 
                    <span className="font-semibold text-blue-600 block mt-2">
                      ⚠️ Important: The verification window will open immediately - be ready to interact with it right away!
                    </span>
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <LockClosedIcon className="w-6 h-6 text-gray-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">
                    Koajo will only have access to this verification data
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <InfoCircledIcon className="w-6 h-6 text-gray-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">
                    Stripe uses biometric technology on your images to make sure it&apos;s you. You can delete your data at any time.
                  </p>
                </div>
              </div>
              {/* Footer Links */}
              <div className="flex justify-between text-sm text-gray-500 pt-4 border-t">
                <Link href="#" className="hover:text-gray-700 transition-colors">
                  Stripe Privacy Policy
                </Link>
                <Link href="#" className="hover:text-gray-700 transition-colors">
                  English (United States)
                </Link>
              </div>

                 {/* Countdown Message */}
                 {countdown && (
                   <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                     <p className="text-blue-600 text-sm font-semibold">
                       🚀 Get ready! Verification window opening in {countdown} seconds...
                     </p>
                   </div>
                 )}

                 {/* Error Message */}
                 {error && (
                   <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                     <p className="text-red-600 text-sm">{error}</p>
                   </div>
                 )}

                 {/* Action Buttons */}
                 <div className="space-y-3 pt-4">
                   <Button
                     onClick={handleAgreeAndContinue}
                     text={
                       countdown ? `Opening in ${countdown}...` :
                       isLoading || isVerifying ? "Processing..." : 
                       "Agree and Continue"
                     }
                     variant="primary"
                     className="w-full"
                     disabled={isLoading || isVerifying || stripeLoading || countdown !== null}
                     showArrow={true}
                   />
                
                <Button
                  onClick={handleDecline}
                  text="Decline"
                  variant="secondary"
                  className="w-full"
                  showArrow={false}
                />
              </div>

            </div>
          </CardAuth>
        </div>
      </div>
    );
  // }

  // return (  
        {/* Header */}
        // <div className="flex items-center gap-4 mb-8">
        //   <button
        //     onClick={handleBack}
        //     className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        //   >
        //     <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
        //   </button>
        //   <div className="flex-1 text-center">
        //     <div className="w-full bg-gray-200 rounded-full h-2">
        //       <div className="bg-teal-500 h-2 rounded-full" style={{ width: "60%" }}></div>
        //     </div>
        //   </div>
        // </div>

        {/* Main Content */}
        // <CardFaqTopic
        //   title="Continue on your mobile device"
        //   description="Scan the QR code to use the camera on your mobile device"
        // >
        //   <div className="space-y-6 text-center">
            {/* Stripe Logo */}
            {/* <div className="text-2xl font-bold text-black mb-4">stripe</div> */}
            
            {/* Instructions */}
            {/* <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900">Continue on your mobile device</h2>
              <p className="text-gray-600">
                Scan the QR code to use the camera on your mobile device
              </p>
            </div> */}

            {/* QR Code Placeholder */}
            // <div className="flex justify-center py-8">
            //   <div className="w-48 h-48 bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center relative">
            //     {/* QR Code Pattern */}
            //     <div className="grid grid-cols-8 gap-1 w-32 h-32">
            //       {Array.from({ length: 64 }, (_, i) => (
            //         <div
            //           key={i}
            //           className={`w-3 h-3 ${
            //             Math.random() > 0.5 ? "bg-black" : "bg-white"
            //           }`}
            //         />
            //       ))}
            //     </div>
                {/* Crosshair overlay */}
            //     <div className="absolute inset-0 pointer-events-none">
            //       <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-blue-500 rounded-full"></div>
            //     </div>
            //   </div>
            // </div>

            {/* Action Button */}
    //         <Button
    //           onClick={handleContinueOnMobile}
    //           text={isLoading ? "Processing..." : "Continue on Mobile"}
    //           variant="primary"
    //           className="w-full"
    //           disabled={isLoading}
    //           showArrow={true}
    //         />
    //       </div>
    //     </CardFaqTopic>
    //   </div>
    // </div>
  // );
}
