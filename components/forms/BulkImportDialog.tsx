import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { z } from "zod";
import { toast } from "sonner";
import {
  FileText,
  AlertCircle,
  Loader2,
  Table as TableIcon,
  X,
  Upload,
  CheckCircle2,
  Download,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useFormTemplatesQuery } from "@/hooks/queries/useFormTemplatesQuery";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ModelForm from "./ModelForm";
import StatusLabelForm from "./StatusLabelForm";
import SupplierForm from "./SupplierForm";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useSupplierQuery } from "@/hooks/queries/useSupplierQuery";
import type { StatusLabel } from "@prisma/client";
import SchemaMappingStep from "./SchemaMappingStep";
import levenshtein from "js-levenshtein";

type ImportStep =
  | "select-category"
  | "upload"
  | "mapping"
  | "preview"
  | "result";

interface ImportField {
  name: string;
  label: string;
  type: string;
  required: boolean;
}

interface ImportDependency {
  name: string;
  label: string;
  api: string;
  createApi: string;
}

interface BulkImportConfig {
  entityType: string;
  fields: ImportField[];
  dependencies: ImportDependency[];
  importApi: string;
  templateUrl: string;
  validationSchema: z.ZodSchema;
  companyId: string;
}

interface BulkImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  config: BulkImportConfig;
  onImport: (data: any[]) => Promise<void>;
  importType?: "asset" | "loneeUser"; // NEW: context-aware import type
}

interface ValidationError {
  row: number;
  column: string;
  message: string;
}

export default function BulkImportDialog({
  isOpen,
  onClose,
  config,
  onImport,
  importType = "asset", // default to asset for backward compatibility
}: BulkImportDialogProps) {
  const queryClient = useQueryClient();
  const [showAllRows, setShowAllRows] = useState(false);
  // Context-aware: set initial step based on importType
  const initialStep: ImportStep =
    importType === "loneeUser" ? "upload" : "select-category";
  const [step, setStep] = useState<ImportStep>(initialStep);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    [],
  );
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [validationSuggestions, setValidationSuggestions] = useState<
    Record<string, any[]>
  >({});
  const [isCreatingNew, setIsCreatingNew] = useState<string | null>(null);
  const [creatingNewContext, setCreatingNewContext] = useState<{
    rowIndex: number;
    columnName: string;
  } | null>(null);
  const [uploadedColumns, setUploadedColumns] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<
    Record<string, string | null>
  >({});

  const { formTemplates, isLoading: isLoadingFormTemplates } =
    useFormTemplatesQuery();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const selectedTemplate = formTemplates?.find(
    (t) => t.id === selectedTemplateId,
  );

  // Combine standard and custom fields for mapping and preview
  const allTemplateFields: ImportField[] = [
    ...(config.fields || []),
    ...((selectedTemplate?.fields as ImportField[]) || []),
  ];

  // Assume companyId is available in config or context
  const companyId = config.companyId;
  const { data: statusLabelsData } = useQuery({
    queryKey: ["status-labels", companyId],
    queryFn: async () => {
      const res = await fetch(`/api/status-labels?companyId=${companyId}`);
      return res.json();
    },
    enabled: !!companyId,
  });
  const statusLabels: StatusLabel[] = Array.isArray(statusLabelsData)
    ? statusLabelsData
    : [];

  // Helper to match status label name to ID (case-insensitive, partial, fuzzy)
  function findStatusLabelId(input: string) {
    if (!input) return null;
    const normalized = input.trim().toLowerCase();
    // Exact match
    let match = statusLabels.find((l) => l.name.toLowerCase() === normalized);
    if (match) return match.id;
    // Starts with
    match = statusLabels.find((l) =>
      l.name.toLowerCase().startsWith(normalized),
    );
    if (match) return match.id;
    // Includes
    match = statusLabels.find((l) => l.name.toLowerCase().includes(normalized));
    if (match) return match.id;
    // Fuzzy (Levenshtein distance <= 2)
    match = statusLabels.find(
      (l) => levenshtein(l.name.toLowerCase(), normalized) <= 2,
    );
    if (match) return match.id;
    return null;
  }

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File is too large. Maximum size is 10MB");
        return;
      }
      await handleFileUpload(file);
    },
  });

  if (!config?.fields) {
    console.error(
      "BulkImportDialog: Invalid configuration - fields are missing",
    );
    return null;
  }

  const resetState = () => {
    setStep("select-category");
    setFile(null);
    setParsedData([]);
    setValidationErrors([]);
    setImportProgress(0);
    setImportResult(null);
    setIsCreatingNew(null);
    setCreatingNewContext(null);
    setUploadedColumns([]);
    setColumnMapping({});
  };

  const handleFileUpload = async (file: File) => {
    setFile(file);
    setIsProcessing(true);
    try {
      const parseResult = await new Promise<
        Papa.ParseResult<Record<string, unknown>>
      >((resolve, reject) => {
        const papaConfig = {
          header: true,
          skipEmptyLines: true,
          complete: resolve,
          error: (err: Error) => reject(err),
        };
        Papa.parse(file, papaConfig);
      });
      if (parseResult.errors.length > 0) {
        throw new Error(
          `CSV parsing failed: ${parseResult.errors[0].message} at row ${parseResult.errors[0].row}`,
        );
      }
      // Reset state for new upload
      setValidationErrors([]);
      setImportProgress(0);
      setImportResult(null);
      setIsCreatingNew(null);
      setCreatingNewContext(null);
      setUploadedColumns([]);
      setColumnMapping({});
      // Extract columns from the first row or meta.fields
      const columns =
        parseResult.meta.fields || Object.keys(parseResult.data[0] || {});
      setUploadedColumns(columns);
      setParsedData(parseResult.data);
      setStep("mapping");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(`Error processing file: ${errorMessage}`);
      resetState();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMappingComplete = (mapping: Record<string, string | null>) => {
    setColumnMapping(mapping);
    // Transform parsedData using mapping
    const mappedRows = parsedData.map((row) => {
      const mapped: Record<string, any> = {};
      Object.entries(mapping).forEach(([uploadedCol, templateField]) => {
        if (templateField) mapped[templateField] = row[uploadedCol];
      });
      return mapped;
    });
    setParsedData(mappedRows);
    setStep("preview");
  };

  const handleCellUpdate = (
    rowIndex: number,
    columnName: string,
    newValue: string,
  ) => {
    const updatedData = [...parsedData];
    const fieldLabel =
      config.fields.find((f) => f.name === columnName)?.label || columnName;
    updatedData[rowIndex][fieldLabel] = newValue;
    setParsedData(updatedData);

    const updatedErrors = validationErrors.filter(
      (error) => !(error.row === rowIndex + 1 && error.column === columnName),
    );
    setValidationErrors(updatedErrors);

    toast.success(`Row ${rowIndex + 1}: ${fieldLabel} updated.`);
  };

  const handleCreationSuccess = async () => {
    if (!creatingNewContext) return;
    const { rowIndex, columnName } = creatingNewContext;

    const fieldLabel =
      config.fields.find((f) => f.name === columnName)?.label || columnName;
    const originalValue = parsedData[rowIndex][fieldLabel];

    const dependency = config.dependencies.find((d) => d.name === columnName);
    if (dependency) {
      await queryClient.invalidateQueries({
        queryKey: [dependency.label.toLowerCase().replace(" ", "-") + "s"],
      });

      const response = await fetch(dependency.api);
      const data = await response.json();
      const items = Array.isArray(data) ? data : data.items || [];
      setValidationSuggestions((prev) => ({ ...prev, [columnName]: items }));

      const newItem = items.find(
        (item: any) => item.name.toLowerCase() === originalValue.toLowerCase(),
      );

      if (newItem) {
        handleCellUpdate(rowIndex, columnName, newItem.name);
        toast.success(
          `${isCreatingNew} "${newItem.name}" created and updated.`,
        );
      } else {
        toast.info(
          `'${isCreatingNew}' created. Please select it from the list for row ${
            rowIndex + 1
          }.`,
        );
      }
    }

    setIsCreatingNew(null);
    setCreatingNewContext(null);
  };

  const handleImport = async () => {
    setIsProcessing(true);
    setImportProgress(0);
    // Map parsedData using columnMapping
    const mappedRows = parsedData.map((row, rowIndex) => {
      const mapped: Record<string, any> = {};
      // For each mapping, assign the value from the uploaded column to the mapped field
      Object.entries(columnMapping).forEach(([uploadedCol, mappedField]) => {
        if (mappedField) {
          mapped[mappedField] = row[uploadedCol];
        }
      });
      // Also copy any fields that were already present in the row (for dependencies, etc.)
      Object.keys(row).forEach((key) => {
        if (!(key in mapped)) {
          mapped[key] = row[key];
        }
      });
      // Add formTemplateId to each row
      mapped.formTemplateId = selectedTemplateId;

      // Map statusLabel to statusLabelId before import
      if (mapped.statusLabel) {
        const id = findStatusLabelId(mapped.statusLabel);
        if (id) {
          mapped.statusLabelId = id;
          delete mapped.statusLabel;
        } else {
          // Add validation error for unmatched status label
          setValidationErrors((prev) => [
            ...prev,
            {
              row: rowIndex + 1,
              column: "statusLabel",
              message: `Unrecognized status label: ${mapped.statusLabel}`,
            },
          ]);
        }
      }
      return mapped;
    });
    // If there are validation errors, do not proceed
    if (validationErrors.length > 0) {
      setIsProcessing(false);
      toast.error("Please fix validation errors before importing.");
      return;
    }
    try {
      console.log("[BULK IMPORT] Sending mappedRows to onImport:", mappedRows);
      await onImport(mappedRows);
      setImportResult({
        success: true,
        message: "All records imported successfully!",
      });
      setStep("result");
    } catch (error) {
      setImportResult({
        success: false,
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
      setStep("result");
    } finally {
      setIsProcessing(false);
    }
  };

  const getCellError = (rowIndex: number, column: string) => {
    return validationErrors.find(
      (e) => e.row === rowIndex + 1 && e.column === column,
    );
  };

  const handleCategorySelect = (id: string) => {
    setSelectedTemplateId(id);
    setStep("upload");
  };

  // Context-aware: steps for each import type
  const assetSteps = [
    { key: "select-category", label: "Select Template" },
    { key: "upload", label: "Upload File" },
    { key: "mapping", label: "Map Columns" },
    { key: "preview", label: "Preview & Import" },
    { key: "result", label: "Complete" },
  ];
  const loneeUserSteps = [
    { key: "upload", label: "Upload File" },
    { key: "mapping", label: "Map Columns" },
    { key: "preview", label: "Preview & Import" },
    { key: "result", label: "Complete" },
  ];
  const steps = importType === "loneeUser" ? loneeUserSteps : assetSteps;
  const stepIndex = steps.findIndex((s) => s.key === step);

  // Stepper component
  const Stepper = () => (
    <div className="flex items-center justify-center mb-6">
      {steps.map((s, idx) => (
        <div key={s.key} className="flex items-center">
          <div
            className={`rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm transition-all
              ${idx < stepIndex ? "bg-blue-500 text-white" : idx === stepIndex ? "bg-blue-100 text-blue-700 border-2 border-blue-500" : "bg-gray-200 text-gray-400"}
            `}
          >
            {idx + 1}
          </div>
          {idx < steps.length - 1 && (
            <div className="w-8 h-1 bg-gray-200 mx-2 rounded-full" />
          )}
        </div>
      ))}
    </div>
  );

  // Context-aware: render step content
  const renderStepContent = () => {
    switch (step) {
      case "select-category":
        if (importType === "asset") return renderCategorySelectStep();
        return null;
      case "upload":
        return renderUploadStep();
      case "mapping":
        return renderMappingStep();
      case "preview":
        return renderPreviewStep();
      case "result":
        return renderResultStep();
      default:
        return null;
    }
  };

  const handleDownloadTemplate = async () => {
    if (!selectedTemplateId) {
      toast.error("Please select an asset category first.");
      return;
    }
    try {
      const response = await fetch(
        `/api/form-templates/${selectedTemplateId}/csv-template`,
      );
      if (!response.ok) {
        throw new Error("Failed to download template.");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedTemplate?.name || "template"}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("CSV template downloaded.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unknown error occurred.",
      );
    }
  };

  const assetTypeOptions =
    formTemplates?.map((template) => ({
      id: template.id,
      name: template.name,
    })) || [];

  const fakeControl = {
    getFieldState: () => ({
      invalid: false,
      isDirty: false,
      isTouched: false,
      isValidating: false,
    }),
    register: () => ({
      onChange: () => {},
      onBlur: () => {},
      ref: () => {},
      name: "assetType",
    }),
    setValue: (_name: string, value: any) => setSelectedTemplateId(value),
    getValues: () => selectedTemplateId,
  };

  const previewRows = showAllRows ? parsedData : parsedData.slice(0, 10);
  const renderPreviewStep = () => (
    <div className="max-w-[1100px] mx-auto p-4">
      <Stepper />
      <h2 className="text-xl font-bold mb-1 text-center">Map & Preview Data</h2>
      <p className="text-gray-500 text-sm mb-4 text-center">
        Map your columns to the correct fields and review your data before
        importing.
      </p>
      {validationErrors.length > 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Found {validationErrors.length} validation errors. Please fix them.
          </AlertDescription>
        </Alert>
      )}
      <div className="overflow-x-auto w-full h-[450px] rounded-md border bg-white shadow-sm">
        <Table className="min-w-[1200px]">
          <TableHeader>
            <TableRow>
              <TableHead className="sticky top-0 bg-white z-10">Row</TableHead>
              {allTemplateFields.map((field: ImportField) => (
                <TableHead
                  className="sticky top-0 bg-white z-10"
                  key={field.name}
                >
                  {field.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {previewRows.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                className="hover:bg-blue-50 transition-colors"
              >
                <TableCell>{rowIndex + 1}</TableCell>
                {allTemplateFields.map((field: ImportField) => {
                  const error = getCellError(rowIndex, field.name);
                  const cellValue = row[field.label] || row[field.name];
                  const dependency = config.dependencies.find(
                    (d) => d.name === field.name,
                  );
                  const suggestions = validationSuggestions[field.name];
                  if (error && dependency && suggestions) {
                    return (
                      <TableCell key={field.name}>
                        <Select
                          defaultValue={cellValue}
                          onValueChange={(newValue) => {
                            if (newValue === "create-new") {
                              setIsCreatingNew(dependency.label);
                              setCreatingNewContext({
                                rowIndex,
                                columnName: field.name,
                              });
                            } else {
                              const selected = suggestions.find(
                                (s) => s.id === newValue,
                              );
                              if (selected) {
                                handleCellUpdate(
                                  rowIndex,
                                  field.name,
                                  selected.name,
                                );
                              }
                            }
                          }}
                        >
                          <SelectTrigger className="border-red-500 rounded-full shadow-sm">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="create-new"
                              className="font-bold text-blue-600"
                            >
                              Create new...
                            </SelectItem>
                            {suggestions.map((option: any) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="mt-1 text-xs text-red-600">
                          {error.message}
                        </p>
                      </TableCell>
                    );
                  }
                  return (
                    <TableCell key={field.name}>
                      {error && (
                        <span
                          className="text-red-500 font-semibold"
                          title={error.message}
                        >
                          {cellValue}
                        </span>
                      )}
                      {!error && cellValue}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {parsedData.length > 10 && (
        <div className="text-center mt-2">
          <Button
            variant="link"
            size="sm"
            onClick={() => setShowAllRows((v) => !v)}
          >
            {showAllRows ? "Show less" : `Show all ${parsedData.length} rows`}
          </Button>
        </div>
      )}
      <DialogFooter className="mt-6 flex justify-between">
        <Button variant="outline" onClick={() => setStep("upload")}>
          Back
        </Button>
        <Button
          onClick={handleImport}
          disabled={isProcessing || validationErrors.length > 0}
          className="font-bold"
        >
          {isProcessing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            `Import ${parsedData.length} Records`
          )}
        </Button>
      </DialogFooter>
    </div>
  );

  const renderCreationDialog = () => {
    const dialogProps = {
      onOpenChange: () => setIsCreatingNew(null),
    };

    switch (isCreatingNew) {
      case "Model":
        return (
          <Dialog open={isCreatingNew === "Model"} {...dialogProps}>
            <DialogContent>
              <ModelForm onSubmitSuccess={handleCreationSuccess} />
            </DialogContent>
          </Dialog>
        );
      case "Status Label":
        return (
          <Dialog open={isCreatingNew === "Status Label"} {...dialogProps}>
            <DialogContent>
              <StatusLabelForm onSubmitSuccess={handleCreationSuccess} />
            </DialogContent>
          </Dialog>
        );
      case "Supplier":
        return (
          <Dialog open={isCreatingNew === "Supplier"} {...dialogProps}>
            <DialogContent>
              <SupplierForm onSubmitSuccess={handleCreationSuccess} />
            </DialogContent>
          </Dialog>
        );
      default:
        return null;
    }
  };

  const renderResultStep = () => (
    <div className="max-w-[440px] mx-auto p-4 text-center">
      <Stepper />
      {importResult?.success ? (
        <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500 animate-bounce" />
      ) : (
        <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
      )}
      <h3 className="mb-2 text-xl font-semibold">
        {importResult?.success ? "Import Complete" : "Import Failed"}
      </h3>
      <p className="text-sm text-gray-600">{importResult?.message}</p>
      <div className="mt-6 flex flex-col gap-2">
        <Button
          onClick={() => {
            resetState();
            setStep("select-category");
          }}
          variant="secondary"
        >
          Import More
        </Button>
        <Button
          onClick={() => {
            resetState();
            onClose();
          }}
        >
          Close
        </Button>
      </div>
    </div>
  );

  // --- Refined Step 1: Category/Template Select ---
  const renderCategorySelectStep = () => (
    <div className="max-w-[440px] mx-auto p-4">
      <Stepper />
      <h2 className="text-xl font-bold mb-1 text-center">
        Select Asset Template
      </h2>
      <p className="text-gray-500 text-sm mb-4 text-center">
        Choose a template to match your asset data fields.
      </p>
      <label
        htmlFor="asset-category-select"
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        Template
      </label>
      <Select
        value={selectedTemplateId}
        onValueChange={handleCategorySelect}
        disabled={isLoadingFormTemplates}
      >
        <SelectTrigger id="asset-category-select">
          <SelectValue placeholder="Select a template..." />
        </SelectTrigger>
        <SelectContent>
          {isLoadingFormTemplates ? (
            <SelectItem value="loading" disabled>
              Loading templates...
            </SelectItem>
          ) : (
            formTemplates?.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                <span className="font-semibold">{option.name}</span>
                <span className="block text-xs text-gray-400">
                  {option.fields?.length || 0} fields
                </span>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      <div className="flex justify-end mt-6">
        <Button
          onClick={() => setStep("upload")}
          disabled={!selectedTemplateId}
          className="w-full"
        >
          Next
        </Button>
      </div>
    </div>
  );

  // --- Refined Step 2: Upload ---
  const renderUploadStep = () => (
    <div className="max-w-[600px] mx-auto p-4">
      <Stepper />
      <h2 className="text-xl font-bold mb-1 text-center">
        {importType === "loneeUser"
          ? "Import Assignment-Only Users"
          : "Upload CSV File"}
      </h2>
      <p className="text-gray-500 text-sm mb-4 text-center">
        {importType === "loneeUser"
          ? "Upload a CSV file with assignment-only user data. Download a template for guidance."
          : "Upload your asset data as a CSV file. Download a template for guidance."}
      </p>
      <div className="mb-4">
        <div
          {...getRootProps()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 text-center transition-colors shadow-sm ${
            importType === "asset"
              ? selectedTemplateId
                ? "border-blue-500 bg-blue-50 hover:bg-blue-100"
                : "border-gray-300 bg-gray-50"
              : "border-blue-500 bg-blue-50 hover:bg-blue-100"
          }`}
        >
          <input
            {...getInputProps()}
            disabled={importType === "asset" && !selectedTemplateId}
          />
          <Upload className="mb-4 h-12 w-12 text-gray-400" />
          {isProcessing ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="mt-2 text-sm font-semibold text-blue-600">
                Processing file...
              </p>
            </>
          ) : file ? (
            <>
              <FileText className="mb-2 h-10 w-10 text-blue-500" />
              <p className="font-semibold text-gray-700">{file.name}</p>
            </>
          ) : (
            <p className="font-semibold text-gray-700">
              {importType === "asset"
                ? selectedTemplateId
                  ? "Drop CSV file here or click to upload"
                  : "Please select a template to enable upload"
                : "Drop CSV file here or click to upload"}
            </p>
          )}
        </div>
        {importType === "loneeUser" ? (
          <Button asChild className="mt-4 w-full" variant="secondary">
            <a href="/lonee-user-template.csv" download>
              Download CSV Template for Assignment-Only Users
            </a>
          </Button>
        ) : (
          <Button
            onClick={handleDownloadTemplate}
            disabled={!selectedTemplateId || isLoadingFormTemplates}
            className="mt-4 w-full"
            variant="secondary"
          >
            <Download className="mr-2 h-4 w-4" />
            {`Download CSV Template for ${selectedTemplate ? `"${selectedTemplate.name}"` : "Template"}`}
          </Button>
        )}
      </div>
      <div className="flex justify-between mt-6">
        {importType === "asset" && (
          <Button variant="outline" onClick={() => setStep("select-category")}>
            Back
          </Button>
        )}
        <Button onClick={() => setStep("mapping")} disabled={!file}>
          Next
        </Button>
      </div>
    </div>
  );

  // --- Mapping Step ---
  const renderMappingStep = () => (
    <div className="max-w-[700px] mx-auto p-4">
      <Stepper />
      <h2 className="text-xl font-bold mb-1 text-center">Map Columns</h2>
      <p className="text-gray-500 text-sm mb-4 text-center">
        Map your CSV columns to the correct fields before previewing your data.
      </p>
      <SchemaMappingStep
        uploadedColumns={uploadedColumns}
        templateFields={allTemplateFields}
        onMappingComplete={(mapping) => {
          setColumnMapping(mapping);
          setStep("preview");
        }}
      />
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => setStep("upload")}>
          Back
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        resetState();
        onClose();
      }}
    >
      <DialogContent
        className={
          step === "select-category" || step === "result"
            ? "w-[95vw] max-w-[480px]"
            : step === "upload"
              ? "w-[95vw] max-w-[600px]"
              : "w-[98vw] max-w-[1150px]"
        }
        style={{ overflowX: "visible" }}
      >
        {isCreatingNew && renderCreationDialog()}
        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
}
