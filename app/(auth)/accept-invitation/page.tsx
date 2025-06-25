"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth, useSignUp } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InvitationRegistrationForm } from "@/components/forms/InvitationRegistrationForm";

interface InvitationData {
  companyName: string;
  roleName: string;
  email: string;
  roleId: string;
  companyId: string;
  invitationId: string;
}

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const { isLoaded, signUp } = useSignUp();
  const { isSignedIn } = useAuth();
  const [invitationData, setInvitationData] = useState<InvitationData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = searchParams?.get("token");

  const validateInvitation = useCallback(async () => {
    try {
      const response = await fetch("/api/validate-invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (result.success) {
        setInvitationData(result.data);
      } else {
        setError(result.error || "Invalid or expired invitation");
      }
    } catch (err) {
      setError("Failed to validate invitation");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setError("Invalid invitation link");
      setLoading(false);
      return;
    }

    if (isSignedIn) {
      window.location.href = "/dashboard";
      return;
    }

    validateInvitation();
  }, [token, isSignedIn, validateInvitation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Invalid Invitation</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => (window.location.href = "/sign-in")}
              className="w-full"
            >
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Complete Your Registration</CardTitle>
          <CardDescription>
            You've been invited to join{" "}
            <strong>{invitationData?.companyName}</strong> as a{" "}
            <strong>{invitationData?.roleName}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InvitationRegistrationForm
            invitationData={
              invitationData || {
                companyName: "",
                roleName: "",
                email: "",
                roleId: "",
                companyId: "",
                invitationId: "",
              }
            }
            token={token || ""}
          />
        </CardContent>
      </Card>
    </div>
  );
}
