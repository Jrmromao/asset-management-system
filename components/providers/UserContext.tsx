"use client";
import { createContext, useState } from "react";

// Define User interface
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
}

export interface RegistrationData {
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  assetCount: number;
  password: string;
  status: string;
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

  if (process.env.NODE_ENV === "development") {
    console.log("UserProvider render:", { user, registrationData });
  }

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
