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
    <div className="bottom-0 right-0 bg-white border-t border-b shadow">
      <div className="max-w-[1000px] mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {form.formState.isDirty && (
              <span className="text-orange-500 text-sm">• Unsaved changes</span>
            )}
          </div>
          <div className="flex items-center gap-2 bg-white">
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
            <Button type="submit" disabled={isPending} className="h-9 bg-white">
              {isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </div>
              ) : (
                <span>Create</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ActionFooter;
