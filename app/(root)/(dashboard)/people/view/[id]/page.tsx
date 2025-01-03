"use client";
import React, { useEffect, useState } from "react";
import UserDetailsView from "@/components/UserDetailsView";
import { findById } from "@/lib/actions/user.actions";
import UserProfileSkeleton from "@/components/UserProfileSkeleton";

interface UserPageState {
  user?: User;
  isLoading: boolean;
  error?: string;
}

export default function UserPage({ params }: { params: { id: string } }) {
  const [state, setState] = useState<UserPageState>({
    isLoading: true,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));
        const result = await findById(params.id);

        if (result.error) {
          throw new Error(result.error);
        }

        setState({ user: result.data, isLoading: false });
      } catch (error) {
        setState({
          error:
            error instanceof Error ? error.message : "Failed to fetch user",
          isLoading: false,
        });
      }
    };

    fetchUser();
  }, [params.id]);

  if (state.error) return <div>Error: {state.error}</div>;
  if (!state.user) return <div>User not found</div>;
  if (state.isLoading) {
    return <UserProfileSkeleton />;
  }
  return <UserDetailsView user={state?.user} isLoading={state.isLoading} />;
}
