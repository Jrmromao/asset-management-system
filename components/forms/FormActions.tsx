import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FormActionsProps {
  isPending: boolean;
  isUpdate: boolean;
  router: any;
  buttonTextCreate?: string;
  buttonTextUpdate?: string;
}

const FormActions = ({
  router,
  isPending,
  isUpdate,
  buttonTextCreate = "Create",
  buttonTextUpdate = "Update",
}: FormActionsProps) => {
  return (
    <div className="flex gap-4 sticky bottom-0 bg-white p-4 border-t shadow-lg">
      <Button
        type="button"
        variant="outline"
        onClick={() => router.back()}
        disabled={isPending}
      >
        Cancel
      </Button>

      <Button type="submit" disabled={isPending} className="min-w-[120px]">
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {isUpdate ? "Updating..." : "Creating..."}
          </>
        ) : isUpdate ? (
          buttonTextUpdate
        ) : (
          buttonTextCreate
        )}
      </Button>
    </div>
  );
};
export default FormActions;
