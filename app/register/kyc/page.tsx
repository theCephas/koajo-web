"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/utils";
 
import CardAuth from "@/components/auth/card-auth";
import { useStripeIdentity } from "@/lib/hooks/useStripeIdentity";

export default function KycPage() {
  const [currentStep, setCurrentStep] = useState<"verification" | "mobile" | "processing" | "success">("verification");
  const [isLoading, setIsLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'document_complete' | 'id_complete' | 'both_complete'>('pending');
  const router = useRouter();
  // const searchParams = useSearchParams();
  const { verifyIdentity, isVerifying, loading: stripeLoading } = useStripeIdentity();

  const handleAgreeAndContinue = async () => {
    setError(null);
    setCountdown(null);
    setIsLoading(true);
    
    try {
      // Get user data from localStorage or context
      const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
      const userId = localStorage.getItem('userId') || 'user_123';
      
      // Start document verification
      const documentResult = await verifyIdentity(userEmail, userId, { verificationType: 'document' });
      if (documentResult.success) {
        // Document verification started, set status and wait for return
        localStorage.setItem('verificationStatus', 'document_complete');
        setVerificationStatus('document_complete');
        setCurrentStep("processing");
      } else {
        setError(documentResult.error || 'Document verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleIdVerification = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get user data from localStorage or context
      const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
      const userId = localStorage.getItem('userId') || 'user_123';
      const firstName = localStorage.getItem('firstName') || '';
      const lastName = localStorage.getItem('lastName') || '';
      const phoneNumber = localStorage.getItem('phoneNumber') || '';
      
      // Start ID number verification
      const idResult = await verifyIdentity(userEmail, userId, { 
        verificationType: 'id_number',
        firstName,
        lastName,
        phoneNumber
      });
      if (idResult.success) {
        // ID verification started, set status and wait for return
        localStorage.setItem('verificationStatus', 'id_complete');
        setVerificationStatus('id_complete');
        setCurrentStep("processing");
      } else {
        console.error('ID number verification failed:', idResult.error);
        setError('ID number verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [verifyIdentity, setError]);

  const handleDecline = () => {
    router.push("/register");
  };

  // Check if user returned from verification
  // useEffect(() => {
  //   const verification = searchParams.get('verification');
  //   if (verification === 'complete') {
  //     // User returned from verification, check what step we're on
  //     const currentStatus = localStorage.getItem('verificationStatus') || 'pending';
  //     setVerificationStatus(currentStatus as 'pending' | 'document_complete' | 'id_complete' | 'both_complete');
      
  //     if (currentStatus === 'document_complete') {
  //       // Document verification completed, now start ID verification
  //       handleIdVerification();
  //     } else if (currentStatus === 'id_complete' || currentStatus === 'both_complete') {
  //       // Both verifications completed
  //       setCurrentStep("success");
  //     }
  //   }
  // }, [searchParams, handleIdVerification]);

  

  const handleContinueToDashboard = () => {
    router.push("/dashboard");
  };

  // Processing step after verification submission
  if (currentStep === "processing") {
    const getProcessingMessage = () => {
      switch (verificationStatus) {
        case 'document_complete':
          return {
            title: "Document Verification Complete",
            description: "Your document verification is complete. Please complete the ID number verification that will open in a new tab.",
            showIdButton: true
          };
        case 'id_complete':
          return {
            title: "ID Verification Complete", 
            description: "Your ID number verification is complete. Both verifications are now finished.",
            showIdButton: false
          };
        default:
          return {
            title: "Verification Submitted",
            description: "Your identity verification has been submitted and is being processed. This may take a few minutes.",
            showIdButton: false
          };
      }
    };

    const { title, description, showIdButton } = getProcessingMessage();

    return (
      <div className="bg-white flex items-center justify-center p-4 rounded-2xl">
        <div className="w-full max-w-md">
          <CardAuth
            title={title}
            description={description}
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
                  {description}
                </p>
              </div>

              <div className="space-y-3">
                {verificationStatus === 'id_complete' && (
                  <Button
                    onClick={() => setCurrentStep("success")}
                    text="Continue to Dashboard"
                    variant="primary"
                    className="w-full"
                    showArrow={true}
                  />
                )}
                
                {showIdButton && (
                  <Button
                    onClick={handleIdVerification}
                    text="Start ID Number Verification"
                    variant="primary"
                    className="w-full"
                    disabled={isLoading || isVerifying}
                    showArrow={true}
                  />
                )}
                
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
    // return (
    //   <div className=" bg-white flex items-center justify-center p-4 rounded-2xl">
    //     <div className="w-full max-w-md">
    //       {/* Header */}
    //       <div className="flex items-center gap-4 mb-8">
    //         <button
    //           onClick={handleBack}
    //           className="p-2 hover:bg-gray-100 rounded-full transition-colors"
    //         >
    //           <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
    //         </button>
    //         <div className="flex-1 text-center">
    //           <div className="text-2xl font-bold text-black">stripe</div>
    //         </div>
    //       </div>

          {/* Main Content */}
         return  (<CardAuth
            title="Verification"
            description="Koajo is required by law to verify the identity of all our users to prevent fraud and comply with regulatory requirements.
Koajo uses Stripe’s system to complete this verification process. 
"
          >
            <div className="space-y-6">
              {/* Verification Points */}
              {/* <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CameraIcon className="w-6 h-6 text-gray-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">

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
              </div> */}
              {/* Footer Links */}
              {/* <div className="flex justify-between text-sm text-gray-500 pt-4 border-t">
                <Link href="#" className="hover:text-gray-700 transition-colors">
                  Stripe Privacy Policy
                </Link>
                <Link href="#" className="hover:text-gray-700 transition-colors">
                  English (United States)
                </Link>
              </div> */}

                 {/* Countdown Message */}
                 {/* {countdown && (
                   <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                     <p className="text-blue-600 text-sm font-semibold">
                       🚀 Get ready! Verification window opening in {countdown} seconds...
                     </p>
                   </div>
                 )} */}

                 {/* Error Message */}
                 {/* {error && (
                   <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                     <p className="text-red-600 text-sm">{error}</p>
                   </div>
                 )} */}

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
      //   </div>
      // </div>
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
