import React, { useRef, useMemo, useEffect, useState } from "react";
import { BulkImportConfig, ImportField } from "@/types/importConfig";
import { useImportStore } from "@/lib/stores/importStore";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import Papa from "papaparse";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { z } from "zod";
import { toast } from "sonner";
import {
  Loader2,
  CheckCircle2,
  Paperclip,
  Pencil,
  UploadCloud,
  CheckCircle,
  AlertTriangle,
  FileText,
  Download,
  X,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Edit3,
  Save,
  XCircle,
  CheckSquare,
  Square,
  Trash2,
  Wand2,
  BarChart3,
  Sparkles,
  Search,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
// import { DataGrid } from "@tanstack/react-table"; // If using TanStack Table v8+ DataGrid

interface BulkImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  config: BulkImportConfig;
  onImport: (data: any[]) => void;
}

type DependencyMap = Record<string, Set<string>>;

type ExistingDeps = Record<string, string[]>;

type MissingDeps = Record<string, Set<string>>;

const STEPS = [
  { label: "Upload", icon: UploadCloud },
  { label: "Preview", icon: FileText },
  { label: "Import", icon: Download },
  { label: "Complete", icon: CheckCircle2 },
];

const emerald = {
  base: "#059669", // emerald-600
  light: "#d1fae5", // emerald-100
  dark: "#065f46", // emerald-800
};

export default function BulkImportDialog({
  isOpen,
  onClose,
  config,
  onImport,
}: BulkImportDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    file,
    setFile,
    rawData,
    setRawData,
    columnMapping,
    setColumnMapping,
    errorRows,
    setErrorRows,
    progress,
    setProgress,
    // ...other state/actions
  } = useImportStore();

  // State for existing and missing dependencies
  const [existingDeps, setExistingDeps] = useState<ExistingDeps>({});
  const [missingDeps, setMissingDeps] = useState<MissingDeps>({});
  const [creatingDep, setCreatingDep] = useState<{
    type: string;
    value: string;
  } | null>(null);
  const [depLoading, setDepLoading] = useState(false);
  const [depError, setDepError] = useState("");
  const inputDepRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);
  const [step, setStep] = useState(0);
  const [validating, setValidating] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const [warningRows, setWarningRows] = useState<number[]>([]);
  const [editingRows, setEditingRows] = useState<Set<number>>(new Set());
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({});
  const [showingSuggestions, setShowingSuggestions] = useState<{
    rowIndex: number;
    field: string;
  } | null>(null);
  const [columnMappingSuggestions, setColumnMappingSuggestions] = useState<
    Record<string, string>
  >({});
  const [duplicateGroups, setDuplicateGroups] = useState<number[][]>([]);
  const [aiProcessing, setAiProcessing] = useState(false);

  // Fetch all dependencies from APIs
  const fetchDependencies = async () => {
    const deps: ExistingDeps = {};
    await Promise.all(
      config.dependencies.map(async (dep) => {
        try {
          const res = await fetch(dep.api);
          const data = await res.json();
          // Try to find the array in the response
          const arr =
            data[dep.name + "s"] ||
            data[dep.name + "List"] ||
            data[dep.name + "sList"] ||
            data[dep.name + "_list"] ||
            data[dep.name + "_array"] ||
            data[Object.keys(data).find((k) => Array.isArray(data[k])) || ""] ||
            [];
          // Use 'name' property for matching
          deps[dep.name] = arr.map((item: any) => item.name);
        } catch {
          deps[dep.name] = [];
        }
      }),
    );
    setExistingDeps(deps);
  };

  // On file upload, fetch dependencies and build suggestions
  useEffect(() => {
    if (file) {
      fetchDependencies();
      buildSuggestions();
    }
    // eslint-disable-next-line
  }, [file]);

  // Build suggestions from existing data and dependencies
  const buildSuggestions = async () => {
    const newSuggestions: Record<string, string[]> = {};

    // Add suggestions from dependencies
    Object.entries(existingDeps).forEach(([key, values]) => {
      const fieldName = key + "Name";
      newSuggestions[fieldName] = values;
    });

    // Add suggestions from current data (for consistency)
    config.fields.forEach((field) => {
      if (!newSuggestions[field.name]) {
        const uniqueValues = [
          ...new Set(rawData.map((row) => row[field.name]).filter(Boolean)),
        ];
        if (uniqueValues.length > 0) {
          newSuggestions[field.name] = uniqueValues;
        }
      }
    });

    setSuggestions(newSuggestions);
  };

  // On rawData or existingDeps change, scan for missing dependencies
  useEffect(() => {
    if (!rawData.length || !Object.keys(existingDeps).length) return;
    const missing: MissingDeps = {};
    config.dependencies.forEach((dep) => {
      const field = config.fields.find((f) =>
        f.name.toLowerCase().includes(dep.name.toLowerCase()),
      );
      if (!field) return;
      const depField = field.name;
      const existing = new Set(
        (existingDeps[dep.name] || []).map((v) => v.toLowerCase()),
      );
      rawData.forEach((row) => {
        const value = row[depField];
        if (value && !existing.has(String(value).toLowerCase())) {
          if (!missing[dep.name]) missing[dep.name] = new Set();
          missing[dep.name].add(value);
        }
      });
    });
    setMissingDeps(missing);
  }, [rawData, existingDeps, config.dependencies, config.fields]);

  useEffect(() => {
    if (creatingDep && inputDepRef.current) {
      inputDepRef.current.focus();
    }
  }, [creatingDep]);

  // File upload handler
  const onDrop = (acceptedFiles: File[]) => {
    const csvFile = acceptedFiles[0];
    setFile(csvFile);
    setProgress("parsing");
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<any>) => {
        setRawData(results.data as any[]);

        // 🤖 AI-powered smart column mapping
        const csvHeaders = Object.keys(results.data[0] || {});
        smartColumnMapping(csvHeaders);

        setProgress("validating");

        // Auto-run AI features after upload
        setTimeout(() => {
          detectDuplicates();
          validateWithAI();
        }, 500);

        // Validate rows and set errorRows
        const errors: number[] = [];
        (results.data as any[]).forEach((row, idx) => {
          const result = config.validationSchema.safeParse(row);
          if (!result.success) errors.push(idx);
        });
        setErrorRows(errors);
      },
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
  });

  // Helper functions for row editing
  const toggleRowEdit = (rowIndex: number) => {
    const newEditingRows = new Set(editingRows);
    if (newEditingRows.has(rowIndex)) {
      newEditingRows.delete(rowIndex);
    } else {
      newEditingRows.add(rowIndex);
    }
    setEditingRows(newEditingRows);
  };

  const saveRow = (rowIndex: number) => {
    // Validate the row
    const result = config.validationSchema.safeParse(rawData[rowIndex]);
    if (result.success) {
      const newEditingRows = new Set(editingRows);
      newEditingRows.delete(rowIndex);
      setEditingRows(newEditingRows);
      toast.success("Row saved successfully");
    } else {
      toast.error("Please fix validation errors before saving");
    }
  };

  const cancelRowEdit = (rowIndex: number) => {
    // You could restore original values here if you track them
    const newEditingRows = new Set(editingRows);
    newEditingRows.delete(rowIndex);
    setEditingRows(newEditingRows);
  };

  // Bulk operations
  const toggleRowSelection = (rowIndex: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(rowIndex)) {
      newSelected.delete(rowIndex);
    } else {
      newSelected.add(rowIndex);
    }
    setSelectedRows(newSelected);
  };

  const selectAllRows = () => {
    if (selectedRows.size === rawData.length) {
      setSelectedRows(new Set());
    } else {
      const allIndices = new Set<number>();
      rawData.forEach((_, index) => allIndices.add(index));
      setSelectedRows(allIndices);
    }
  };

  const deleteSelectedRows = () => {
    const selectedIndices = Array.from(selectedRows);
    const newData = rawData.filter(
      (_, index) => !selectedIndices.includes(index),
    );
    setRawData(newData);
    setSelectedRows(new Set());
    setEditingRows(new Set());
    toast.success(`Deleted ${selectedRows.size} rows`);
  };

  const bulkEditSelected = () => {
    const newEditingRows = new Set(editingRows);
    selectedRows.forEach((rowIndex) => newEditingRows.add(rowIndex));
    setEditingRows(newEditingRows);
    toast.info(`Editing ${selectedRows.size} rows`);
  };

  // Quick fix functions
  const fixAllDates = () => {
    const updated = rawData.map((row) => {
      const newRow = { ...row };
      config.fields.forEach((field) => {
        if (field.name.toLowerCase().includes("date") && newRow[field.name]) {
          // Simple date standardization
          const date = new Date(newRow[field.name]);
          if (!isNaN(date.getTime())) {
            newRow[field.name] = date.toISOString().split("T")[0];
          }
        }
      });
      return newRow;
    });
    setRawData(updated);
    toast.success("Standardized all dates");
  };

  const trimWhitespace = () => {
    const updated = rawData.map((row) => {
      const newRow = { ...row };
      Object.keys(newRow).forEach((key) => {
        if (typeof newRow[key] === "string") {
          newRow[key] = newRow[key].trim();
        }
      });
      return newRow;
    });
    setRawData(updated);
    toast.success("Trimmed whitespace from all fields");
  };

  const generateAssetTags = () => {
    const updated = rawData.map((row, index) => {
      if (!row.assetTag || row.assetTag.trim() === "") {
        const prefix = row.categoryName
          ? row.categoryName.substring(0, 3).toUpperCase()
          : "AST";
        const timestamp = Date.now().toString().slice(-6);
        const indexStr = (index + 1).toString().padStart(3, "0");
        return { ...row, assetTag: `${prefix}-${timestamp}-${indexStr}` };
      }
      return row;
    });
    setRawData(updated);
    toast.success("Generated missing asset tags");
  };

  // AI-Assisted Features
  const smartColumnMapping = (csvHeaders: string[]) => {
    const mapping: Record<string, string> = {};
    const suggestions: Record<string, string> = {};

    // Smart column mapping algorithm
    config.fields.forEach((schemaField) => {
      const schemaName = schemaField.name.toLowerCase();

      // Find exact matches first
      const exactMatch = csvHeaders.find(
        (header) => header.toLowerCase() === schemaName,
      );

      if (exactMatch) {
        mapping[schemaField.name] = exactMatch;
        return;
      }

      // Smart fuzzy matching with common variations
      const variations: Record<string, string[]> = {
        assetTag: [
          "asset_tag",
          "asset-tag",
          "tag",
          "asset_id",
          "asset id",
          "serial",
          "serialnumber",
          "serial_number",
        ],
        name: ["asset_name", "asset-name", "title", "description", "item_name"],
        categoryName: [
          "category",
          "asset_category",
          "type",
          "asset_type",
          "class",
        ],
        manufacturerName: [
          "manufacturer",
          "brand",
          "make",
          "vendor",
          "supplier",
        ],
        modelName: ["model", "model_name", "product_model"],
        purchaseDate: [
          "purchase_date",
          "bought_date",
          "acquired_date",
          "date_purchased",
        ],
        purchasePrice: [
          "price",
          "cost",
          "purchase_price",
          "value",
          "purchase_cost",
        ],
        locationName: ["location", "site", "office", "building", "room"],
        departmentName: ["department", "dept", "division", "team"],
        supplierName: ["supplier", "vendor", "seller", "dealer"],
        endOfLife: [
          "end_of_life",
          "eol",
          "expiry",
          "warranty_end",
          "retirement_date",
        ],
        notes: ["note", "comment", "remarks", "description", "details"],
      };

      const possibleMatches = variations[schemaField.name] || [];
      const fuzzyMatch = csvHeaders.find((header) => {
        const headerLower = header.toLowerCase().replace(/[-_\s]/g, "");
        return possibleMatches.some(
          (variation) =>
            variation.replace(/[-_\s]/g, "") === headerLower ||
            headerLower.includes(variation.replace(/[-_\s]/g, "")) ||
            variation.replace(/[-_\s]/g, "").includes(headerLower),
        );
      });

      if (fuzzyMatch) {
        mapping[schemaField.name] = fuzzyMatch;
        suggestions[schemaField.name] = fuzzyMatch;
      }
    });

    setColumnMapping(mapping);
    setColumnMappingSuggestions(suggestions);

    if (Object.keys(suggestions).length > 0) {
      toast.success(
        `🤖 AI mapped ${Object.keys(suggestions).length} columns automatically!`,
      );
    }
  };

  const detectDuplicates = () => {
    const groups: number[][] = [];
    const processed = new Set<number>();

    // Group by potential duplicate fields
    const duplicateFields = ["assetTag", "name", "serialNumber"];

    rawData.forEach((row, index) => {
      if (processed.has(index)) return;

      const duplicates = [index];

      rawData.forEach((otherRow, otherIndex) => {
        if (index === otherIndex || processed.has(otherIndex)) return;

        // Check if rows are potential duplicates
        const isDuplicate = duplicateFields.some((field) => {
          const value1 = row[field]?.toString().toLowerCase().trim();
          const value2 = otherRow[field]?.toString().toLowerCase().trim();
          return value1 && value2 && value1 === value2;
        });

        if (isDuplicate) {
          duplicates.push(otherIndex);
          processed.add(otherIndex);
        }
      });

      if (duplicates.length > 1) {
        groups.push(duplicates);
        duplicates.forEach((idx) => processed.add(idx));
      }
    });

    setDuplicateGroups(groups);

    if (groups.length > 0) {
      const totalDuplicates = groups.reduce(
        (sum, group) => sum + group.length,
        0,
      );
      toast.warning(
        `⚠️ Found ${groups.length} duplicate groups affecting ${totalDuplicates} rows`,
      );
    } else {
      toast.success("✅ No duplicates detected");
    }
  };

  const standardizeData = async () => {
    setAiProcessing(true);

    try {
      const updated = rawData.map((row) => {
        const newRow = { ...row };

        // Standardize dates
        config.fields.forEach((field) => {
          if (field.name.toLowerCase().includes("date") && newRow[field.name]) {
            const date = new Date(newRow[field.name]);
            if (!isNaN(date.getTime())) {
              newRow[field.name] = date.toISOString().split("T")[0];
            }
          }
        });

        // Standardize text fields
        [
          "name",
          "categoryName",
          "manufacturerName",
          "modelName",
          "locationName",
          "departmentName",
          "supplierName",
        ].forEach((field) => {
          if (newRow[field] && typeof newRow[field] === "string") {
            // Title case for names
            newRow[field] = newRow[field]
              .toLowerCase()
              .split(" ")
              .map(
                (word: string) => word.charAt(0).toUpperCase() + word.slice(1),
              )
              .join(" ")
              .trim();
          }
        });

        // Standardize asset tags (uppercase)
        if (newRow.assetTag && typeof newRow.assetTag === "string") {
          newRow.assetTag = newRow.assetTag.toUpperCase().trim();
        }

        // Standardize prices (remove currency symbols)
        if (newRow.purchasePrice && typeof newRow.purchasePrice === "string") {
          const cleanPrice = newRow.purchasePrice.replace(/[^\d.-]/g, "");
          if (!isNaN(parseFloat(cleanPrice))) {
            newRow.purchasePrice = parseFloat(cleanPrice).toString();
          }
        }

        return newRow;
      });

      setRawData(updated);
      toast.success("🤖 AI standardized all data fields!");
    } catch (error) {
      toast.error("Failed to standardize data");
    } finally {
      setAiProcessing(false);
    }
  };

  const validateWithAI = () => {
    const patterns = {
      assetTag: /^[A-Z0-9-_]{3,20}$/,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^[\+]?[\d\s\-\(\)]{10,}$/,
      url: /^https?:\/\/.+/,
      date: /^\d{4}-\d{2}-\d{2}$/,
    };

    const warnings: string[] = [];

    rawData.forEach((row, index) => {
      // Check asset tag format
      if (row.assetTag && !patterns.assetTag.test(row.assetTag)) {
        warnings.push(
          `Row ${index + 1}: Asset tag "${row.assetTag}" doesn't follow standard format`,
        );
      }

      // Check for suspicious values
      if (
        row.purchasePrice &&
        (parseFloat(row.purchasePrice) < 0 ||
          parseFloat(row.purchasePrice) > 1000000)
      ) {
        warnings.push(
          `Row ${index + 1}: Purchase price seems unusual: ${row.purchasePrice}`,
        );
      }

      // Check date logic
      if (row.purchaseDate && row.endOfLife) {
        const purchase = new Date(row.purchaseDate);
        const eol = new Date(row.endOfLife);
        if (eol < purchase) {
          warnings.push(
            `Row ${index + 1}: End of life date is before purchase date`,
          );
        }
      }
    });

    if (warnings.length > 0) {
      toast.warning(`⚠️ AI found ${warnings.length} potential issues`);
      console.log("AI Validation Warnings:", warnings);
    } else {
      toast.success("✅ AI validation passed - no issues found");
    }
  };

  // Data quality calculations
  const getDataQuality = () => {
    if (rawData.length === 0) return { score: 0, stats: {} };

    const totalFields = rawData.length * config.fields.length;
    const filledFields = rawData.reduce((count, row) => {
      return (
        count +
        config.fields.filter(
          (field) =>
            row[field.name] && row[field.name].toString().trim() !== "",
        ).length
      );
    }, 0);

    const completionRate = (filledFields / totalFields) * 100;
    const errorRate = (errorRows.length / rawData.length) * 100;
    const warningRate = (warningRows.length / rawData.length) * 100;

    const score = Math.max(
      0,
      completionRate - errorRate * 2 - warningRate * 0.5,
    );

    return {
      score: Math.round(score),
      stats: {
        totalRows: rawData.length,
        completionRate: Math.round(completionRate),
        errorRate: Math.round(errorRate),
        warningRate: Math.round(warningRate),
        validRows: rawData.length - errorRows.length,
      },
    };
  };

  // Table columns from config.fields + actions column
  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      // Checkbox column for row selection
      {
        id: "select",
        header: () => (
          <div className="flex items-center">
            <button
              onClick={selectAllRows}
              className="p-1 hover:bg-gray-100 rounded"
              title={
                selectedRows.size === rawData.length
                  ? "Deselect all"
                  : "Select all"
              }
            >
              {selectedRows.size === rawData.length ? (
                <CheckSquare className="h-4 w-4 text-emerald-600" />
              ) : (
                <Square className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        ),
        cell: ({ row }: any) => {
          const rowIndex = row.index;
          const isSelected = selectedRows.has(rowIndex);

          return (
            <div className="flex items-center">
              <button
                onClick={() => toggleRowSelection(rowIndex)}
                className="p-1 hover:bg-gray-100 rounded"
                title={isSelected ? "Deselect row" : "Select row"}
              >
                {isSelected ? (
                  <CheckSquare className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Square className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          );
        },
        size: 40,
      },
      ...config.fields.map((field) => ({
        accessorKey: field.name,
        header: field.label,
        cell: ({ getValue, row, column }: any) => {
          const value = getValue();
          const rowIdx = row.index;
          const isError = errorRows.includes(rowIdx);
          const isWarning = warningRows.includes(rowIdx);
          const isEditing = editingRows.has(rowIdx);

          return (
            <div className="relative group">
              {isEditing ? (
                <input
                  className={`w-full px-2 py-1 text-xs rounded border transition-all duration-200 focus:ring-1 focus:ring-emerald-300 focus:border-emerald-500 ${
                    isError
                      ? "border-red-400 bg-red-50 text-red-700 focus:ring-red-200"
                      : isWarning
                        ? "border-amber-400 bg-amber-50 text-amber-700 focus:ring-amber-200"
                        : "border-gray-200 bg-white hover:border-emerald-300"
                  }`}
                  value={value ?? ""}
                  onChange={(e) => {
                    const updated = [...rawData];
                    updated[rowIdx] = {
                      ...updated[rowIdx],
                      [field.name]: e.target.value,
                    };
                    setRawData(updated);

                    // Re-validate row
                    const result = config.validationSchema.safeParse(
                      updated[rowIdx],
                    );
                    const newErrors = errorRows.filter(
                      (i: number) => i !== rowIdx,
                    );
                    const newWarnings = warningRows.filter(
                      (i: number) => i !== rowIdx,
                    );

                    if (!result.success) {
                      const hasRequiredFields = config.fields.some(
                        (field) =>
                          field.required && updated[rowIdx][field.name],
                      );
                      if (hasRequiredFields) {
                        if (!newWarnings.includes(rowIdx))
                          newWarnings.push(rowIdx);
                      } else {
                        if (!newErrors.includes(rowIdx)) newErrors.push(rowIdx);
                      }
                    }

                    setErrorRows(newErrors);
                    setWarningRows(newWarnings);
                  }}
                  type={field.type === "number" ? "number" : "text"}
                  aria-label={field.label}
                  placeholder={
                    field.required ? `${field.label} (required)` : field.label
                  }
                  autoFocus
                />
              ) : (
                <div
                  className={`w-full px-2 py-1 text-xs rounded border cursor-default transition-all duration-200 ${
                    isError
                      ? "border-red-200 bg-red-25 text-red-700"
                      : isWarning
                        ? "border-amber-200 bg-amber-25 text-amber-700"
                        : "border-transparent bg-gray-25 text-gray-900 hover:bg-gray-50"
                  }`}
                  title="Click edit to modify this field"
                >
                  {value || (
                    <span className="text-gray-400 italic">
                      {field.required
                        ? `${field.label} (required)`
                        : field.label}
                    </span>
                  )}
                </div>
              )}

              {(isError || isWarning) && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-1.5 py-0.5 text-xs rounded shadow-md border z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div
                    className={`${isError ? "bg-red-100 border-red-200 text-red-700" : "bg-amber-100 border-amber-200 text-amber-700"}`}
                  >
                    {isError ? "Required field" : "Incomplete data"}
                  </div>
                </div>
              )}
            </div>
          );
        },
      })),
      // Actions column
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }: any) => {
          const rowIndex = row.index;
          const isEditing = editingRows.has(rowIndex);
          const isError = errorRows.includes(rowIndex);
          const isWarning = warningRows.includes(rowIndex);

          return (
            <div className="flex items-center space-x-1">
              {!isEditing ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleRowEdit(rowIndex)}
                  className="h-6 w-6 p-0 hover:bg-emerald-100"
                  title="Edit row"
                >
                  <Edit3 className="h-3 w-3 text-emerald-600" />
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => saveRow(rowIndex)}
                    disabled={isError}
                    className="h-6 w-6 p-0 hover:bg-green-100 disabled:opacity-50"
                    title="Save changes"
                  >
                    <Save className="h-3 w-3 text-green-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => cancelRowEdit(rowIndex)}
                    className="h-6 w-6 p-0 hover:bg-red-100"
                    title="Cancel editing"
                  >
                    <XCircle className="h-3 w-3 text-red-600" />
                  </Button>
                </>
              )}
            </div>
          );
        },
      },
    ],
    [
      config.fields,
      rawData,
      errorRows,
      warningRows,
      setRawData,
      setErrorRows,
      setWarningRows,
      config.validationSchema,
      editingRows,
      toggleRowEdit,
      saveRow,
      cancelRowEdit,
    ],
  );

  const table = useReactTable({
    data: rawData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    debugTable: false,
  });

  // Handle dependency creation (real API call)
  const handleCreateDep = async (type: string, value: string) => {
    setDepLoading(true);
    setDepError("");
    try {
      const depConfig = config.dependencies.find((d) => d.name === type);
      if (!depConfig) throw new Error("Dependency config not found");
      const res = await fetch(depConfig.createApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: value }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create dependency");
      }
      // Success: refresh dependencies
      await fetchDependencies();
      setCreatingDep(null);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} created!`);
    } catch (err: any) {
      setDepError(err.message || "Failed to create dependency");
      toast.error(err.message || "Failed to create dependency");
    } finally {
      setDepLoading(false);
    }
  };

  // Calculate if any missing dependencies remain
  const hasMissingDeps = Object.values(missingDeps).some((set) => set.size > 0);

  // Import handler
  const handleImport = async () => {
    setImporting(true);
    setImportError("");
    try {
      const res = await fetch(config.importApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: rawData }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Import failed");
      }
      setImportSuccess(true);
      toast.success("Import successful!");
      // Reset state (for now)
      setFile(null);
      setRawData([]);
      setColumnMapping({});
      setErrorRows([]);
      setWarningRows([]);
      setProgress("idle");
      setTimeout(() => setImportSuccess(false), 3000);
    } catch (err: any) {
      setImportError(err.message || "Import failed");
      toast.error(err.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Compact Header */}
        <div className="px-6 py-3 border-b border-gray-200">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Data Import Preview
            </h2>
            <p className="text-xs text-gray-500">
              Upload your CSV file and preview the data before importing
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-4">
          {/* Enhanced Stepper */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-8">
              {STEPS.map((stepItem, index) => (
                <div key={stepItem.label} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                        relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 transform
                        ${
                          step > index
                            ? "bg-emerald-600 border-emerald-600 text-white shadow-lg scale-105"
                            : step === index
                              ? "bg-emerald-600 border-emerald-600 text-white shadow-lg scale-110 ring-4 ring-emerald-100"
                              : "bg-white border-gray-300 text-gray-400 hover:border-emerald-300"
                        }
                      `}
                    >
                      {step > index ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <stepItem.icon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`
                        mt-2 text-sm font-medium transition-colors duration-300
                        ${step >= index ? "text-emerald-600" : "text-gray-400"}
                      `}
                    >
                      {stepItem.label}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`
                        w-16 h-0.5 mx-4 transition-colors duration-500
                        ${step > index ? "bg-emerald-600" : "bg-gray-300"}
                      `}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          {step === 0 && (
            <div className="space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-800">
                  <strong>Important:</strong> Make sure your CSV file includes
                  the required headers:{" "}
                  <span className="font-mono text-blue-900">
                    {config.fields
                      ?.map((field: ImportField) => field.name)
                      .join(", ") || "Please check config"}
                  </span>
                  .{" "}
                  <a
                    href="/assets-sample-template.csv"
                    download
                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                  >
                    Download sample template
                  </a>
                </p>
              </div>

              {/* Enhanced Upload Area */}
              <div
                {...getRootProps()}
                className={`
                  relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer
                  ${
                    isDragActive
                      ? "border-emerald-400 bg-emerald-50 scale-[1.02]"
                      : file
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-25"
                  }
                  ${validating ? "animate-pulse" : ""}
                `}
              >
                <input {...getInputProps()} />

                {!file ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <UploadCloud
                        className={`w-12 h-12 transition-colors duration-300 ${
                          isDragActive ? "text-emerald-600" : "text-gray-400"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {isDragActive
                          ? "Drop your CSV file here"
                          : "Upload CSV File"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Drag and drop or click to browse
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-4">
                    <div className="flex items-center space-x-3 bg-white rounded-lg px-4 py-2 shadow-sm border border-emerald-200">
                      <FileText className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {file.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          setRawData([]);
                          setStep(0);
                        }}
                        className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                        aria-label="Remove file"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {validating && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                      <span className="text-sm font-medium text-emerald-600">
                        Validating file...
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Validation Progress */}
              {validating && (
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Processing rows...</span>
                    <span className="text-emerald-600 font-medium">
                      {Math.round((validationProgress || 0) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-600 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${(validationProgress || 0) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preview Step */}
          {step === 1 && rawData.length > 0 && (
            <div className="space-y-6">
              {/* AI Column Mapping Success Banner */}
              {Object.keys(columnMappingSuggestions).length > 0 && (
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Wand2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-800">
                      🤖 AI successfully mapped{" "}
                      {Object.keys(columnMappingSuggestions).length} columns
                      automatically!
                    </span>
                    <div className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                      {Object.entries(columnMappingSuggestions)
                        .map(([field, mapped]) => `${field} → ${mapped}`)
                        .join(", ")}
                    </div>
                  </div>
                </div>
              )}

              {/* Duplicate Detection Results */}
              {duplicateGroups.length > 0 && (
                <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">
                      ⚠️ Found {duplicateGroups.length} duplicate groups
                      affecting{" "}
                      {duplicateGroups.reduce(
                        (sum, group) => sum + group.length,
                        0,
                      )}{" "}
                      rows
                    </span>
                    <div className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                      Rows:{" "}
                      {duplicateGroups
                        .map((group) => group.join(", "))
                        .join(" | ")}
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Data Quality Dashboard */}
              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-sm font-semibold text-gray-900">
                      Data Quality Score
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">
                      {getDataQuality().score}%
                    </div>
                    <div className="text-xs text-gray-500">Overall Quality</div>
                  </div>
                </div>

                {/* AI-Powered Quick Fix Actions */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={standardizeData}
                    disabled={aiProcessing}
                    className="text-xs h-7 px-2 bg-gradient-to-r from-emerald-50 to-blue-50 hover:from-emerald-100 hover:to-blue-100 border-emerald-200"
                  >
                    <Wand2 className="w-3 h-3 mr-1 text-emerald-600" />
                    {aiProcessing ? "Processing..." : "AI Standardize"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={detectDuplicates}
                    className="text-xs h-7 px-2 bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 border-orange-200"
                  >
                    <AlertTriangle className="w-3 h-3 mr-1 text-orange-600" />
                    Find Duplicates
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={validateWithAI}
                    className="text-xs h-7 px-2 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-purple-200"
                  >
                    <CheckCircle className="w-3 h-3 mr-1 text-purple-600" />
                    AI Validate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateAssetTags}
                    className="text-xs h-7 px-2"
                  >
                    <Wand2 className="w-3 h-3 mr-1" />
                    Generate Tags
                  </Button>
                </div>
              </div>

              {/* Bulk Operations Toolbar */}
              {selectedRows.size > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-blue-800">
                        {selectedRows.size} rows selected
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={bulkEditSelected}
                        className="text-xs h-7 px-2"
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        Bulk Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={deleteSelectedRows}
                        className="text-xs h-7 px-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Slick Compact Stats */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Total
                      </div>
                      <div className="text-lg font-bold text-gray-900 mt-0.5">
                        {rawData.length}
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Warnings
                      </div>
                      <div className="text-lg font-bold text-amber-600 mt-0.5">
                        {warningRows.length}
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Errors
                      </div>
                      <div className="text-lg font-bold text-red-600 mt-0.5">
                        {errorRows.length}
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Quality
                      </div>
                      <div className="text-lg font-bold text-emerald-600 mt-0.5">
                        {getDataQuality().stats.completionRate || 0}%
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Compact Table Preview */}
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="overflow-x-auto max-h-96">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        {table.getHeaderGroups()[0]?.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide border-r border-gray-200 last:border-r-0"
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {table.getRowModel().rows.map((row) => {
                        const rowErrors = errorRows.filter(
                          (e: any) => e.rowIndex === row.index,
                        );
                        return (
                          <tr
                            key={row.id}
                            className="hover:bg-gray-25 transition-colors duration-150"
                          >
                            {row.getVisibleCells().map((cell) => {
                              const cellErrors = rowErrors.filter(
                                (e: any) => e.columnId === cell.column.id,
                              );
                              const hasError = cellErrors.some(
                                (e: any) => e.type === "error",
                              );
                              const hasWarning = cellErrors.some(
                                (e: any) => e.type === "warning",
                              );

                              return (
                                <td
                                  key={cell.id}
                                  className={`
                                    px-2 py-1.5 text-xs border-r border-gray-200 last:border-r-0 relative
                                    ${hasError ? "bg-red-50 border-red-200" : ""}
                                    ${hasWarning && !hasError ? "bg-yellow-50 border-yellow-200" : ""}
                                  `}
                                >
                                  <div className="flex items-center space-x-2">
                                    <span
                                      className={`
                                      ${hasError ? "text-red-900" : hasWarning ? "text-yellow-900" : "text-gray-900"}
                                    `}
                                    >
                                      {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext(),
                                      )}
                                    </span>
                                    {cellErrors.length > 0 && (
                                      <div className="relative group">
                                        {hasError ? (
                                          <AlertCircle className="w-4 h-4 text-red-500" />
                                        ) : (
                                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                        )}
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                          {cellErrors
                                            .map((e: any) => e.message)
                                            .join(", ")}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Action Buttons */}
        <div className="border-t border-gray-200 px-6 py-3 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              {file && (
                <>
                  <FileText className="w-4 h-4" />
                  <span>{file.name}</span>
                  <span className="text-gray-400">•</span>
                  <span>{rawData.length} rows</span>
                </>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Cancel
              </Button>

              {step === 0 && file && !validating && (
                <Button
                  onClick={() => setStep(1)}
                  disabled={errorRows.length > 0}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <span>Next: Preview Data</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}

              {step === 1 && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setStep(0)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                  <Button
                    onClick={handleImport}
                    disabled={errorRows.length > 0}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <UploadCloud className="w-4 h-4 mr-2" />
                    Import {rawData.length} Assets
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
