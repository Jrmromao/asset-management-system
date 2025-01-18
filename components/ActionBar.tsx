import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ActionBarProps {
  form: any;
  isPending: boolean;
  isUpdate: boolean;
  onCancel: () => void;
}

export const ActionBar = ({
  form,
  isPending,
  isUpdate,
  onCancel,
}: ActionBarProps) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
    <div className="max-w-[1200px] mx-auto px-4">
      <div className="flex items-center justify-between h-16">
        <span className="text-sm text-slate-500">
          {form.formState.isDirty ? "Unsaved changes" : "No changes"}
        </span>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
            className="h-9"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending || !form.formState.isValid}
            className="h-9 min-w-[120px]"
          >
            {isPending ? (
              <div className="flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>{isUpdate ? "Updating..." : "Creating..."}</span>
              </div>
            ) : (
              <span>{isUpdate ? "Update Asset" : "Create Asset"}</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  </div>
);
