"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/utils";
import CardAuth from "@/components/auth/card-auth";
import { useStripeFinancialConnections } from "@/lib/hooks/useStripeFinancialConnections";

interface AccountData {
  id: string;
  institution: {
    name: string;
    logo?: string;
  };
  last4: string;
  bank_name: string;
  display_name?: string;
  category: string;
  subcategory: string;
  status: string;
  permissions: string[];
  supported_payment_method_types: string[];
  created: number;
}

interface OwnershipData {
  owners: Array<{
    email?: string;
    name?: string;
    phone?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
  }>;
}

export default function BankPage() {
  const [currentStep, setCurrentStep] = useState<"add-account" | "processing" | "success" | "accounts-list">("add-account");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<AccountData | null>(null);
  const [ownershipData, setOwnershipData] = useState<OwnershipData | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    createFinancialConnectionsSession, 
    retrieveAllAccounts, 
    retrieveOwnershipData,
    disconnectAccount,
    isConnecting, 
    loading: stripeLoading 
  } = useStripeFinancialConnections();

  const loadAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const accountsData = await retrieveAllAccounts();
      setAccounts(accountsData);
      if (accountsData.length > 0) {
        setCurrentStep("accounts-list");
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
      setError('Failed to load accounts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [retrieveAllAccounts]);

  // Check if user returned from financial connections
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      // User returned from financial connections, load their accounts
      loadAccounts();
    }
  }, [searchParams, loadAccounts]);

  const handleAddAccount = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      // Get user data from localStorage or context
      const userId = localStorage.getItem('userId') || 'user_123';
      
      // Start financial connections session
      const result = await createFinancialConnectionsSession(userId, {
        permissions: ['balances', 'ownership', 'transactions'],
        filters: {
          countries: ['US'],
          account_types: ['checking', 'savings']
        }
      });
      
      if (result.success) {
        setCurrentStep("processing");
        // The user will be redirected to Stripe's hosted flow
        // and return with session_id parameter
      } else {
        setError(result.error || 'Failed to start account connection. Please try again.');
      }
    } catch (error) {
      console.error('Add account error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewAccountDetails = async (account: AccountData) => {
    setSelectedAccount(account);
    setIsLoading(true);
    
    try {
      const ownership = await retrieveOwnershipData(account.id);
      setOwnershipData(ownership);
    } catch (error) {
      console.error('Error loading account details:', error);
      setError('Failed to load account details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectAccount = async (accountId: string) => {
    setIsLoading(true);
    try {
      const success = await disconnectAccount(accountId);
      if (success) {
        // Reload accounts list
        await loadAccounts();
        setSelectedAccount(null);
        setOwnershipData(null);
      } else {
        setError('Failed to disconnect account. Please try again.');
      }
    } catch (error) {
      console.error('Error disconnecting account:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.push("/dashboard");
  };

  const handleContinueToDashboard = () => {
    router.push("/dashboard");
  };

  // Processing step after account connection
  if (currentStep === "processing") {
    return (
      <div className="bg-white flex items-center justify-center p-4 rounded-2xl">
        <div className="w-full max-w-md">
          <CardAuth
            title="Connecting Your Account"
            description="We're securely connecting your bank account. This may take a few moments."
          >
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Connection</h3>
                <p className="text-gray-600">
                  Please wait while we securely connect your bank account...
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => setCurrentStep("add-account")}
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

  // Accounts list step
  if (currentStep === "accounts-list") {
    return (
      <div className="bg-white flex items-center justify-center p-4 rounded-2xl">
        <div className="w-full max-w-md">
          <CardAuth
            title="Your Connected Accounts"
            description="Manage your connected bank accounts and view account details."
          >
            <div className="space-y-6">
              {/* Accounts List */}
              <div className="space-y-3">
                {accounts.map((account) => (
                  <div key={account.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{account.display_name || account.institution.name}</p>
                          <p className="text-sm text-gray-500">****{account.last4} • {account.subcategory}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleViewAccountDetails(account)}
                          text="View"
                          variant="secondary"
                          className="text-xs px-3 py-1"
                          showArrow={false}
                        />
                        <Button
                          onClick={() => handleDisconnectAccount(account.id)}
                          text="Remove"
                          variant="secondary"
                          className="text-xs px-3 py-1 text-red-600 hover:text-red-700"
                          showArrow={false}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Account Details Modal */}
              {selectedAccount && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium text-gray-900 mb-3">Account Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Bank:</span> {selectedAccount.institution.name}</p>
                    <p><span className="font-medium">Account:</span> ****{selectedAccount.last4}</p>
                    <p><span className="font-medium">Type:</span> {selectedAccount.subcategory}</p>
                    <p><span className="font-medium">Category:</span> {selectedAccount.category}</p>
                    <p><span className="font-medium">Status:</span> {selectedAccount.status}</p>
                    <p><span className="font-medium">Permissions:</span> {selectedAccount.permissions.join(', ')}</p>
                    {ownershipData && ownershipData.owners.length > 0 && (
                      <div className="mt-3">
                        <p className="font-medium">Ownership Information:</p>
                        {ownershipData.owners.map((owner, index: number) => (
                          <div key={index} className="ml-2 mt-1">
                            {owner.name && <p>Name: {owner.name}</p>}
                            {owner.email && <p>Email: {owner.email}</p>}
                            {owner.phone && <p>Phone: {owner.phone}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  onClick={handleAddAccount}
                  text="Add Another Account"
                  variant="primary"
                  className="w-full"
                  disabled={isLoading || isConnecting}
                  showArrow={true}
                />
                
                <Button
                  onClick={handleContinueToDashboard}
                  text="Continue to Dashboard"
                  variant="secondary"
                  className="w-full"
                  showArrow={true}
                />
              </div>
            </div>
          </CardAuth>
        </div>
      </div>
    );
  }

  // Success step after account connection
  if (currentStep === "success") {
    return (
      <div className="bg-white flex items-center justify-center p-4 rounded-2xl">
        <div className="w-full max-w-md">
          <CardAuth
            title="Account Connected Successfully!"
            description="Your bank account has been successfully connected. You can now proceed to your dashboard."
          >
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Connected</h3>
                <p className="text-gray-600">
                  Thank you for connecting your bank account. Your account is now fully set up.
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

  // Main add account step
  return (
    <div className="bg-white flex items-center justify-center p-4 rounded-2xl">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 text-center">
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip for now
            </button>
          </div>
        </div>

        {/* Main Content */}
        <CardAuth
          title="Add accounts to see all your finances in one place"
          description="Track multiple account types including bank accounts, investments, and more."
        >
          <div className="space-y-6">
            {/* Bank Icon */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleAddAccount}
                text={
                  isLoading || isConnecting ? "Connecting..." : 
                  "Add Account"
                }
                variant="primary"
                className="w-full"
                disabled={isLoading || isConnecting || stripeLoading}
                showArrow={true}
              />
            </div>
          </div>
        </CardAuth>
      </div>
    </div>
  );
}
