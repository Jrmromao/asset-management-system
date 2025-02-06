"use client";
import React from "react";
import UserDetailsView from "@/components/UserDetailsView";
import UserProfileSkeleton from "@/components/UserProfileSkeleton";
import { useUserQuery } from "@/hooks/queries/useUserQuery";
import { useQuery } from "@tanstack/react-query";

export default function UserPage({ params }: { params: { id: string } }) {
  const { findById } = useUserQuery();

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user", params.id],
    queryFn: async () => {
      if (!findById) {
        throw new Error("FindById functionality not available");
      }
      return await findById(params.id);
    },
    enabled: !!findById,
  });

  if (error instanceof Error) {
    return <div>Error: {error.message}</div>;
  }

  if (isLoading || !user) {
    return <UserProfileSkeleton />;
  }

  return <UserDetailsView user={user} isLoading={isLoading} />;
}
