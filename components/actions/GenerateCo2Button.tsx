"use client";

import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";
import { generateCo2eForAsset } from "@/lib/actions/co2.actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface GenerateCo2ButtonProps {
  assetId: string;
}

export const GenerateCo2Button: React.FC<GenerateCo2ButtonProps> = ({
  assetId,
}) => {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleClick = () => {
    startTransition(async () => {
      try {
        const result = await generateCo2eForAsset(assetId, true); // Force recalculation
        if (result.success) {
          toast({
            title: "Success",
            description: "CO2e calculation has been initiated.",
          });
          router.refresh(); // Refresh the page to show new data
        } else {
          const errorMessage =
            "error" in result
              ? result.error
              : "Failed to start CO2e calculation.";
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Button onClick={handleClick} disabled={isPending} variant="outline">
      <Leaf className="mr-2 h-4 w-4" />
      {isPending ? "Calculating..." : "Recalculate CO2e"}
    </Button>
  );
};
