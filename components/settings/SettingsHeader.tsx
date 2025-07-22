import React, { useRef } from "react";
import { Plus, Upload, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SettingsHeaderProps {
  title: string;
  addNewLabel: string;
  onAddNew: () => void;
  onImport: () => void;
  importTemplateUrl?: string;
  showAddNew?: boolean;
  showImport?: boolean;
  isLoading?: boolean;
}

const SettingsHeader: React.FC<SettingsHeaderProps> = ({
  title,
  addNewLabel,
  onAddNew,
  onImport,
  importTemplateUrl,
  showAddNew = true,
  showImport = true,
  isLoading = false,
}) => {
  return (
    <div className="flex items-center justify-between mb-2">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        {showAddNew && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onAddNew}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
                  disabled={isLoading}
                >
                  <Plus className="w-4 h-4" />
                  {addNewLabel}
                </button>
              </TooltipTrigger>
              <TooltipContent>Add a new entry</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {showImport && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onImport}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium border border-gray-200 shadow-sm
                    ${
                      isLoading
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-white text-slate-900 hover:bg-slate-900 hover:text-white focus:ring-2 focus:ring-slate-500"
                    }
                  `}
                  disabled={isLoading}
                  aria-label="Import CSV"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span className="font-semibold">Import</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                Import from CSV
                {importTemplateUrl && (
                  <>
                    <br />
                    <a
                      href={importTemplateUrl}
                      download
                      className="text-blue-600 underline"
                    >
                      Download template
                    </a>
                  </>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};

export default SettingsHeader;
