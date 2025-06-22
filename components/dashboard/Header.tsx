"use client";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";

export const DashboardHeader = () => {
  const navigate = useRouter();
  const { user, isLoaded } = useUser();

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-gray-800">
          {!isLoaded ? (
            <Skeleton className="h-8 w-48" />
          ) : (
            `Welcome back${user?.username ? `, ${user.username}` : ""} 👋`
          )}
        </h1>
        <p className="text-gray-500 mt-1">
          Here's a snapshot of your asset ecosystem.
        </p>
      </div>
      <div className="flex items-center gap-2 w-full md:w-auto">
        <Button
          size="sm"
          className="bg-primary hover:bg-primary/90 text-white"
          onClick={() => navigate.push("/assets/create")}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Asset
        </Button>
      </div>
    </div>
  );
};
