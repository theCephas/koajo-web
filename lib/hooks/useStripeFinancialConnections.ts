"use client";

import { useState } from 'react';
import { useStripe } from '../provider-stripe';

interface FinancialConnectionsResult {
  success: boolean;
  error?: string;
  sessionId?: string;
  clientSecret?: string;
  accountId?: string;
}

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

export function useStripeFinancialConnections() {
  const { stripe, loading } = useStripe();
  const [isConnecting, setIsConnecting] = useState(false);
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [ownershipData, setOwnershipData] = useState<OwnershipData | null>(null);

  const createFinancialConnectionsSession = async (
    userId?: string,
    options?: {
      permissions?: string[];
      filters?: {
        countries?: string[];
        account_types?: string[];
      };
    }
  ): Promise<FinancialConnectionsResult> => {
    if (!stripe) {
      console.error('Stripe is not loaded:', { stripe, loading });
      return {
        success: false,
        error: 'Stripe is not loaded yet. Please try again.',
      };
    }

    console.log('Creating financial connections session:', { userId });
    setIsConnecting(true);

    try {
      // Call your backend to create the Financial Connections session
      const response = await fetch('/api/create-financial-connections-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          permissions: options?.permissions || ['ownership'],
          filters: options?.filters || {
            countries: ['US'],
            account_types: ['checking', 'savings']
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.details || errorData.error || 'Failed to create financial connections session');
      }

      const { client_secret, session_id, url } = await response.json();

      if (!url) {
        return {
          success: false,
          error: 'Failed to get verification URL from Stripe.',
        };
      }

      // Redirect to Stripe's hosted Financial Connections flow
      if (typeof window !== 'undefined') {
        window.location.href = url;
      }

      return {
        success: true,
        sessionId: session_id,
        clientSecret: client_secret,
      };
    } catch (error) {
      console.error('Financial connections error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    } finally {
      setIsConnecting(false);
    }
  };

  const retrieveAccountData = async (accountId: string): Promise<AccountData | null> => {
    try {
      const response = await fetch(`/api/financial-connections/accounts/${accountId}`);
      
      if (!response.ok) {
        throw new Error('Failed to retrieve account data');
      }

      const accountData = await response.json();
      return accountData;
    } catch (error) {
      console.error('Error retrieving account data:', error);
      return null;
    }
  };

  const retrieveOwnershipData = async (accountId: string): Promise<OwnershipData | null> => {
    try {
      const response = await fetch(`/api/financial-connections/accounts/${accountId}/ownership`);
      
      if (!response.ok) {
        throw new Error('Failed to retrieve ownership data');
      }

      const ownershipData = await response.json();
      setOwnershipData(ownershipData);
      return ownershipData;
    } catch (error) {
      console.error('Error retrieving ownership data:', error);
      return null;
    }
  };

  const retrieveAllAccounts = async (): Promise<AccountData[]> => {
    try {
      const response = await fetch('/api/financial-connections/accounts');
      
      if (!response.ok) {
        throw new Error('Failed to retrieve accounts');
      }

      const accountsData = await response.json();
      setAccounts(accountsData);
      return accountsData;
    } catch (error) {
      console.error('Error retrieving accounts:', error);
      return [];
    }
  };

  const disconnectAccount = async (accountId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/financial-connections/accounts/${accountId}/disconnect`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to disconnect account');
      }

      // Remove from local state
      setAccounts(prev => prev.filter(account => account.id !== accountId));
      return true;
    } catch (error) {
      console.error('Error disconnecting account:', error);
      return false;
    }
  };

  return {
    createFinancialConnectionsSession,
    retrieveAccountData,
    retrieveOwnershipData,
    retrieveAllAccounts,
    disconnectAccount,
    accounts,
    ownershipData,
    isConnecting,
    loading,
  };
}

