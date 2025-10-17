"use client";

import { useState, useEffect, createContext, useContext } from "react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  recoverPassword: (email: string) => Promise<boolean>;
  logout: () => void;
  register: (
    userData: Omit<User, "id"> & { password: string }
  ) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (e.g., check localStorage, cookies, or API)
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (token) {
          // Verify token with API
          // For now, we'll simulate a user
          setUser({
            id: "1",
            email: "user@example.com",
            firstName: "John",
            lastName: "Doe",
          });
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo purposes, show error for specific email
      if (email === "user@example.com" && password === "Test@123&") {
        return false;
      }

      // Simulate successful login
      const user: User = {
        id: "1",
        email,
        firstName: "John",
        lastName: "Doe",
      };

      setUser(user);
      localStorage.setItem("auth_token", "demo_token");
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const recoverPassword = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Simulate API call
      console.log("Forgot password:", email);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error("Forgot password failed:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_token");
    window.location.href = "/auth/login";
  };

  const register = async (
    userData: Omit<User, "id"> & { password: string }
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate successful registration
      const user: User = {
        id: "1",
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
      };

      setUser(user);
      localStorage.setItem("auth_token", "demo_token");
      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    recoverPassword,
    logout,
    register,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthState();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
