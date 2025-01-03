import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: {
    supplier: string;
    inventory: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      supplier: string;
      inventory: string;
    }>
  >;
  onApplyFilters: () => void;
  title?: string;
}

const FilterDialog: React.FC<FilterDialogProps> = ({
  open,
  onOpenChange,
  filters,
  setFilters,
  onApplyFilters,
  title = "Filter",
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Supplier"
            value={filters.supplier}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, supplier: e.target.value }))
            }
          />
          <Input
            placeholder="Inventory"
            value={filters.inventory}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, inventory: e.target.value }))
            }
          />
          <Button onClick={onApplyFilters} className="w-full">
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilterDialog;
