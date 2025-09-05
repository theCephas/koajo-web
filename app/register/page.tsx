// "use client";

import ComingSoon from "@/components/shared/coming-soon";

// import { useState } from "react";
// import Link from "next/link";
// import { Button, Label, Input } from "@/components/utils";
// import { EyeOpenIcon, EyeNoneIcon } from "@radix-ui/react-icons";
// import cn from "clsx";
// import { useRouter } from "next/navigation"

// interface RegisterFormData {
//   firstName: string;
//   lastName: string;
//   email: string;
//   password: string;
//   confirmPassword: string;
//   agreeToTerms: boolean;
// }

// interface FormErrors {
//   firstName?: string;
//   lastName?: string;
//   email?: string;
//   password?: string;
//   confirmPassword?: string;
//   agreeToTerms?: string;
//   general?: string;
// }

// interface PasswordStrength {
//   score: number;
//   label: string;
//   color: string;
// }

// export default function RegisterPage() {
//   const [formData, setFormData] = useState<RegisterFormData>({
//     firstName: "",
//     lastName: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     agreeToTerms: false,
//   });
  
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [errors, setErrors] = useState<FormErrors>({});
//   const [isLoading, setIsLoading] = useState(false);
//   const router = useRouter();
//   const getPasswordStrength = (password: string): PasswordStrength => {
//     let score = 0;
    
//     if (password.length >= 8) score++;
//     if (/[a-z]/.test(password)) score++;
//     if (/[A-Z]/.test(password)) score++;
//     if (/[0-9]/.test(password)) score++;
//     if (/[^A-Za-z0-9]/.test(password)) score++;
    
//     if (score <= 2) return { score, label: "Weak", color: "bg-red-500" };
//     if (score <= 3) return { score, label: "Fair", color: "bg-yellow-500" };
//     if (score <= 4) return { score, label: "Good", color: "bg-blue-500" };
//     return { score, label: "Strong", color: "bg-green-500" };
//   };

//   const passwordStrength = getPasswordStrength(formData.password);

//   const validateForm = (): boolean => {
//     const newErrors: FormErrors = {};

//     // First name validation
//     if (!formData.firstName.trim()) {
//       newErrors.firstName = "First name is required";
//     }

//     // Last name validation
//     if (!formData.lastName.trim()) {
//       newErrors.lastName = "Last name is required";
//     }

//     // Email validation
//     if (!formData.email) {
//       newErrors.email = "Email is required";
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = "Please enter a valid email address";
//     }

//     // Password validation
//     if (!formData.password) {
//       newErrors.password = "Password is required";
//     } else if (formData.password.length < 8) {
//       newErrors.password = "Password must be at least 8 characters";
//     }

//     // Confirm password validation
//     if (!formData.confirmPassword) {
//       newErrors.confirmPassword = "Please confirm your password";
//     } else if (formData.password !== formData.confirmPassword) {
//       newErrors.confirmPassword = "Passwords do not match";
//     }

//     // Terms agreement validation
//     if (!formData.agreeToTerms) {
//       newErrors.agreeToTerms = "You must agree to the terms and conditions";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleInputChange = (field: keyof RegisterFormData, value: string | boolean) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//     // Clear error when user starts typing
//     if (errors[field]) {
//       setErrors(prev => ({ ...prev, [field]: undefined }));
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       return;
//     }

//     setIsLoading(true);
    
//     try {
//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       // Redirect to dashboard on success
//       router.push("/dashboard");
      
//     } catch (error) {
//       setErrors({ general: "An error occurred. Please try again." });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="w-full max-w-md">
//       {/* Registration Form Card */}
//       <div className="bg-white rounded-2xl shadow-lg p-8">
//         {/* Title */}
//         <div className="text-center mb-8">
//           <h1 className="text-2xl font-bold text-[var(--color-text-500)] mb-2">
//             Create Your Account
//           </h1>
//           <p className="text-[var(--color-text-400)]">
//             Join Koajo and start your savings journey today
//           </p>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Name Fields */}
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <Label htmlFor="firstName" required>
//                 First Name
//               </Label>
//               <Input
//                 type="text"
//                 id="firstName"
//                 value={formData.firstName}
//                 onChange={(e) => handleInputChange("firstName", e.target.value)}
//                 placeholder="First name"
//                 error={!!errors.firstName}
//               />
//               {errors.firstName && (
//                 <div className="text-red-500 text-sm mt-2">
//                   {errors.firstName}
//                 </div>
//               )}
//             </div>

//             <div>
//               <Label htmlFor="lastName" required>
//                 Last Name
//               </Label>
//               <Input
//                 type="text"
//                 id="lastName"
//                 value={formData.lastName}
//                 onChange={(e) => handleInputChange("lastName", e.target.value)}
//                 placeholder="Last name"
//                 error={!!errors.lastName}
//               />
//               {errors.lastName && (
//                 <div className="text-red-500 text-sm mt-2">
//                   {errors.lastName}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Email Field */}
//           <div>
//             <Label htmlFor="email" required>
//               Email
//             </Label>
//             <Input
//               type="email"
//               id="email"
//               value={formData.email}
//               onChange={(e) => handleInputChange("email", e.target.value)}
//               placeholder="Enter your email"
//               error={!!errors.email}
//             />
//             {errors.email && (
//               <div className="text-red-500 text-sm mt-2">
//                 {errors.email}
//               </div>
//             )}
//           </div>

//           {/* Password Field */}
//           <div>
//             <Label htmlFor="password" required>
//               Password
//             </Label>
//             <div className="relative">
//               <Input
//                 type={showPassword ? "text" : "password"}
//                 id="password"
//                 value={formData.password}
//                 onChange={(e) => handleInputChange("password", e.target.value)}
//                 placeholder="Create a password"
//                 error={!!errors.password}
//                 className="pr-12"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-400)] hover:text-[var(--color-text-500)]"
//               >
//                 {showPassword ? <EyeNoneIcon className="w-5 h-5" /> : <EyeOpenIcon className="w-5 h-5" />}
//               </button>
//             </div>
            
//             {/* Password Strength Indicator */}
//             {formData.password && (
//               <div className="mt-3">
//                 <div className="flex items-center gap-2 mb-2">
//                   <div className="flex gap-1">
//                     {[1, 2, 3].map((segment) => (
//                       <div
//                         key={segment}
//                         className={cn(
//                           "h-1.5 rounded-full transition-all",
//                           segment <= passwordStrength.score
//                             ? passwordStrength.color
//                             : "bg-[var(--color-gray-200)]"
//                         )}
//                         style={{ width: `${100 / 3}%` }}
//                       />
//                     ))}
//                   </div>
//                   <span className={cn("text-sm font-medium", {
//                     "text-red-500": passwordStrength.score <= 2,
//                     "text-yellow-500": passwordStrength.score === 3,
//                     "text-blue-500": passwordStrength.score === 4,
//                     "text-green-500": passwordStrength.score === 5,
//                   })}>
//                     {passwordStrength.label}
//                   </span>
//                 </div>
//                 <p className="text-xs text-[var(--color-text-400)]">
//                   Min 8 Characters with a combination of letters and numbers
//                 </p>
//               </div>
//             )}
            
//             {errors.password && (
//               <div className="text-red-500 text-sm mt-2">
//                 {errors.password}
//               </div>
//             )}
//           </div>

//           {/* Confirm Password Field */}
//           <div>
//             <Label htmlFor="confirmPassword" required>
//               Confirm Password
//             </Label>
//             <div className="relative">
//               <Input
//                 type={showConfirmPassword ? "text" : "password"}
//                 id="confirmPassword"
//                 value={formData.confirmPassword}
//                 onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
//                 placeholder="Confirm your password"
//                 error={!!errors.confirmPassword}
//                 className="pr-12"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-400)] hover:text-[var(--color-text-500)]"
//               >
//                 {showConfirmPassword ? <EyeNoneIcon className="w-5 h-5" /> : <EyeOpenIcon className="w-5 h-5" />}
//               </button>
//             </div>
//             {errors.confirmPassword && (
//               <div className="text-red-500 text-sm mt-2">
//                 {errors.confirmPassword}
//               </div>
//             )}
//           </div>

//           {/* Terms Agreement */}
//           <div>
//             <label className="flex items-start gap-3 cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={formData.agreeToTerms}
//                 onChange={(e) => handleInputChange("agreeToTerms", e.target.checked)}
//                 className="w-4 h-4 text-[var(--color-primary)] border-[var(--color-gray-200)] rounded focus:ring-[var(--color-primary)] mt-0.5"
//               />
//               <span className="text-sm text-[var(--color-text-400)]">
//                 I agree to the{" "}
//                 <Link href="/terms" className="text-[var(--color-tertiary-100)] hover:underline">
//                   Terms and Conditions
//                 </Link>{" "}
//                 and{" "}
//                 <Link href="/privacy" className="text-[var(--color-tertiary-100)] hover:underline">
//                   Privacy Policy
//                 </Link>
//               </span>
//             </label>
//             {errors.agreeToTerms && (
//               <div className="text-red-500 text-sm mt-2">
//                 {errors.agreeToTerms}
//               </div>
//             )}
//           </div>

//           {/* General Error */}
//           {errors.general && (
//             <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
//               {errors.general}
//             </div>
//           )}

//           {/* Create Account Button */}
//           <Button
//             type="submit"
//             text={isLoading ? "Creating Account..." : "Create Account"}
//             variant="primary"
//             className="w-full"
//             disabled={isLoading}
//             showArrow={false}
//           />
//         </form>

//         {/* Login Link */}
//         <div className="mt-6 text-center">
//           <span className="text-[var(--color-text-400)]">Already have an account? </span>
//           <Link 
//             href="/auth/login"
//             className="text-[var(--color-tertiary-100)] hover:text-[var(--color-tertiary-100)]/80 font-medium"
//           >
//             Login Here
//           </Link>
//         </div>
//       </div>

//       {/* Copyright */}
//       <div className="text-center mt-8 text-sm text-[var(--color-text-400)]">
//         © Koajo. All rights reserved.
//       </div>
//     </div>
//   );
// }

export default function RegisterPage() {
  return <ComingSoon />;
}