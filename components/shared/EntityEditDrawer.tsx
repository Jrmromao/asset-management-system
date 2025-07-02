import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { X } from "lucide-react";

interface EntityEditDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  statusLabel?: string;
  statusColor?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const EntityEditDrawer: React.FC<EntityEditDrawerProps> = ({
  open,
  onClose,
  title,
  description,
  statusLabel,
  statusColor = "#22C55E",
  icon,
  children,
  footer,
}) => {
  return (
    <Sheet
      open={open}
      onOpenChange={(val) => {
        if (!val) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="w-[800px] sm:max-w-[800px] bg-gradient-to-br from-white via-slate-50 to-slate-100 shadow-2xl rounded-l-2xl flex flex-col animate-slide-in border-l-4 border-primary"
        hideDefaultClose
        aria-label={title}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b pb-4 flex flex-row items-center justify-between rounded-t-2xl border-b-primary/30">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
              {icon}
            </span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <SheetTitle className="text-xl font-semibold">
                  {title}
                </SheetTitle>
                {statusLabel && (
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: statusColor, color: "#fff" }}
                  >
                    {statusLabel}
                  </span>
                )}
              </div>
              {description && (
                <SheetDescription className="text-muted-foreground">
                  {description}
                </SheetDescription>
              )}
            </div>
          </div>
          <button
            aria-label="Close Drawer"
            className="p-2 rounded hover:bg-muted transition"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </SheetHeader>
        <div className="p-4 overflow-y-auto h-full w-full space-y-8 flex-1">
          {children}
        </div>
        {footer && (
          <div className="sticky bottom-0 left-0 w-full bg-white/90 backdrop-blur border-t flex justify-end gap-2 px-6 py-4 rounded-b-2xl shadow-md z-10">
            {footer}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default EntityEditDrawer;
