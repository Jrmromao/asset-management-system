"use client";
import React, { use } from "react";
import UserDetailsView from "@/components/UserDetailsView";
import UserProfileSkeleton from "@/components/UserProfileSkeleton";
import { useUserQuery } from "@/hooks/queries/useUserQuery";
import { useQuery } from "@tanstack/react-query";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { findById } = useUserQuery();
  const { id } = use(params);

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      if (!findById) {
        throw new Error("FindById functionality not available");
      }
      return await findById(id);
    },
    enabled: !!findById,
  });

  if (error instanceof Error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-red-500" />
              <h1 className="text-xl font-semibold text-gray-900">
                User Not Found
              </h1>
              <p className="text-gray-600">
                The user you're looking for doesn't exist or you don't have
                permission to view it.
              </p>
              <p className="text-sm text-red-600">{error.message}</p>
              <Button asChild>
                <Link href="/people">Back to People</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !user) {
    return <UserProfileSkeleton />;
  }

  return (
    <PermissionGuard permission="users.view">
      <UserDetailsView user={user} isLoading={isLoading} />
    </PermissionGuard>
  );
}
