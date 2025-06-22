import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ActionFooterProps {
  form: any;
  isPending: boolean;
  router: any;
}

const ActionFooter = ({ form, isPending, router }: ActionFooterProps) => {
  return (
    <div className="sticky bottom-0 z-10 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 -mx-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          {form.formState.isDirty && (
            <span className="text-yellow-600 text-sm">• Unsaved changes</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (form.formState?.isDirty) {
                if (
                  window.confirm(
                    "You have unsaved changes. Are you sure you want to leave?",
                  )
                ) {
                  router.back();
                }
              } else {
                router.back();
              }
            }}
            className="h-9"
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="h-9">
            {isPending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </div>
            ) : (
              <span>Save</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
export default ActionFooter;
