"use client";
import { createContext, useState } from "react";

// Define User interface
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyId: string; // <-- Add this line
  companyName: string;
}

export interface RegistrationData {
  companyName: string;
  industry: string;
  companySize: string;
  assetCount: number;
  useCase: string[];
  painPoints: string[];
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  primaryContactEmail: string;
  password: string;
  clerkUserId?: string;
  status?: string;
  plan?: string; // Add plan information
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  registrationData: RegistrationData | null;
  setRegistrationData: (data: RegistrationData | null) => void;
}

// Create context with type assertion to avoid type errors
export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => null,
  registrationData: null,
  setRegistrationData: () => null,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [registrationData, setRegistrationData] =
    useState<RegistrationData | null>(null);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        registrationData,
        setRegistrationData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
