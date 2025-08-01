"use client";
import React, { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Download, Loader2, AlertTriangle } from "lucide-react";
import { useDialogStore } from "@/lib/stores/store";
import Dropzone from "@/components/Dropzone";
import { useAssetStore } from "@/lib/stores/assetStore";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import Papa from "papaparse";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

interface FileUploadFormProps {
  dataType: string;
}

const FileUploadForm = ({ dataType }: FileUploadFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [closeDialog] = useDialogStore((state) => [state.onClose]);
  const [file, setFile] = useState<File | null>(null);
  const { getAll } = useAssetStore();
  const { user } = useUser();
  const schema = z.object({
    file: z.any(),
  });
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [missingDeps, setMissingDeps] = useState<{
    models: Set<string>;
    categories: Set<string>;
    statusLabels: Set<string>;
  }>({ models: new Set(), categories: new Set(), statusLabels: new Set() });
  const [allModels, setAllModels] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [allStatusLabels, setAllStatusLabels] = useState<string[]>([]);
  const [creatingDep, setCreatingDep] = useState<{
    type: string;
    value: string;
  } | null>(null);
  const [newDepValue, setNewDepValue] = useState("");
  const [savingDep, setSavingDep] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch dependencies on mount
  useEffect(() => {
    if (dataType === "assets") {
      fetch("/api/models")
        .then((res) => res.json())
        .then((data) => setAllModels(data.models || []));
      fetch("/api/categories")
        .then((res) => res.json())
        .then((data) => setAllCategories(data.categories || []));
      fetch("/api/status-labels")
        .then((res) => res.json())
        .then((data) => setAllStatusLabels(data.statusLabels || []));
    }
  }, [dataType]);

  // Function to read file content
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === "string") {
          resolve(content);
        } else {
          reject(new Error("Failed to read file content"));
        }
      };

      reader.onerror = () => {
        reject(new Error("Error reading file"));
      };

      reader.readAsText(file);
    });
  };

  const onSubmit = async () => {
    if (!file) {
      toast.error("Please select a CSV file.");
      return;
    }
    setIsLoading(true);
    try {
      if (!user) {
        toast.error("You must be logged in to upload files.");
        return;
      }

      const fileContent = await readFileContent(file);

      // Send the file content to the server endpoint
      const response = await fetch(`/api/${dataType}/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileContent }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(result.message);
        form.reset();
        getAll();
        closeDialog();
      } else {
        toast.error(result.message || "Failed to process the file");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to process the CSV file.");
    } finally {
      setIsLoading(false);
    }
  };

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const handleDrop = (acceptedFiles: File[]) => {
    const csvFile = acceptedFiles[0];
    if (!csvFile.name.endsWith(".csv")) {
      toast.error("Please select a CSV file.");
      return;
    }
    setFile(csvFile);
    // Parse CSV for preview
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<any>) => {
        setCsvPreview(results.data as any[]);
        setCsvHeaders(results.meta.fields || []);
        // Check dependencies
        const missing = {
          models: new Set<string>(),
          categories: new Set<string>(),
          statusLabels: new Set<string>(),
        };
        (results.data as any[]).forEach((row) => {
          if (row.modelName && !allModels.includes(row.modelName))
            missing.models.add(row.modelName);
          if (row.categoryName && !allCategories.includes(row.categoryName))
            missing.categories.add(row.categoryName);
          if (
            row.statusLabelName &&
            !allStatusLabels.includes(row.statusLabelName)
          )
            missing.statusLabels.add(row.statusLabelName);
        });
        setMissingDeps(missing);
      },
    });
  };

  const handleDownloadTemplate = async () => {
    if (dataType === "assets") {
      // Download the static sample template from the public/data folder
      const response = await fetch("/data/assets-sample-template.csv");
      if (!response.ok) {
        toast.error("Template not available for this data type");
        return;
      }
      const template = await response.text();
      const blob = new Blob([template], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `assets-sample-template.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return;
    }
    // Add other data types here
    toast.error("Template not available for this data type");
  };

  // Helper to open create popover
  const openCreateDep = (type: string, value: string) => {
    setCreatingDep({ type, value });
    setNewDepValue(value);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Helper to create dependency
  const createDependency = async () => {
    if (!creatingDep || !newDepValue.trim()) return;
    setSavingDep(true);
    let endpoint = "";
    let body: any = {};
    if (creatingDep.type === "model") {
      endpoint = "/api/models";
      body = { name: newDepValue };
    } else if (creatingDep.type === "category") {
      endpoint = "/api/categories";
      body = { name: newDepValue };
    } else if (creatingDep.type === "statusLabel") {
      endpoint = "/api/status-labels";
      body = { name: newDepValue };
    }
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      toast.success(`${creatingDep.type} created!`);
      // Refresh dependencies
      if (creatingDep.type === "model") {
        const data = await fetch("/api/models").then((r) => r.json());
        setAllModels(data.models || []);
      } else if (creatingDep.type === "category") {
        const data = await fetch("/api/categories").then((r) => r.json());
        setAllCategories(data.categories || []);
      } else if (creatingDep.type === "statusLabel") {
        const data = await fetch("/api/status-labels").then((r) => r.json());
        setAllStatusLabels(data.statusLabels || []);
      }
      // Re-parse CSV to update highlights
      if (file) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results: Papa.ParseResult<any>) => {
            setCsvPreview(results.data as any[]);
            setCsvHeaders(results.meta.fields || []);
            const missing = {
              models: new Set<string>(),
              categories: new Set<string>(),
              statusLabels: new Set<string>(),
            };
            (results.data as any[]).forEach((row) => {
              if (row.modelName && !allModels.includes(row.modelName))
                missing.models.add(row.modelName);
              if (row.categoryName && !allCategories.includes(row.categoryName))
                missing.categories.add(row.categoryName);
              if (
                row.statusLabelName &&
                !allStatusLabels.includes(row.statusLabelName)
              )
                missing.statusLabels.add(row.statusLabelName);
            });
            setMissingDeps(missing);
          },
        });
      }
      setCreatingDep(null);
    } else {
      toast.error("Failed to create dependency");
    }
    setSavingDep(false);
  };

  return (
    <section className={""}>
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download Template
        </Button>
      </div>
      {/* CSV Preview and Dependency Warnings */}
      {csvPreview.length > 0 && (
        <AnimatePresence>
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <motion.div
              className="mb-2"
              aria-label="Dependency summary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {missingDeps.models.size > 0 && (
                <div className="text-red-600 text-sm flex flex-wrap items-center gap-2">
                  Missing models:
                  {Array.from(missingDeps.models).map((model) => (
                    <span key={model} className="ml-2">
                      {model}
                      <Popover
                        open={
                          !!(
                            creatingDep &&
                            creatingDep.type === "model" &&
                            creatingDep.value === model
                          )
                        }
                        onOpenChange={(open) => {
                          if (!open) setCreatingDep(null);
                        }}
                      >
                        <PopoverTrigger asChild>
                          <button
                            className="ml-1 text-brand-600 underline font-semibold"
                            type="button"
                            onClick={() => openCreateDep("model", model)}
                          >
                            + Create
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          align="start"
                          className="bg-white/90 backdrop-blur-lg shadow-2xl rounded-xl border border-gray-200 p-6 w-80"
                        >
                          <div className="mb-2 text-lg font-semibold text-gray-900">
                            Create Model
                          </div>
                          <input
                            ref={inputRef}
                            value={newDepValue}
                            onChange={(e) => setNewDepValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                createDependency();
                              }
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-base mb-3"
                            placeholder="Model name"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-2 px-4 rounded-lg shadow transition-all disabled:opacity-60"
                              type="button"
                              onClick={createDependency}
                              disabled={savingDep || !newDepValue.trim()}
                            >
                              {savingDep ? (
                                <span className="animate-spin mr-2 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full align-middle" />
                              ) : null}
                              Create
                            </button>
                            <button
                              className="text-gray-500 hover:text-gray-700 font-semibold px-3 py-2 rounded-lg"
                              type="button"
                              onClick={() => setCreatingDep(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </span>
                  ))}
                </div>
              )}
              {missingDeps.categories.size > 0 && (
                <div className="text-red-600 text-sm flex flex-wrap items-center gap-2">
                  Missing categories:
                  {Array.from(missingDeps.categories).map((cat) => (
                    <span key={cat} className="ml-2">
                      {cat}
                      <Popover
                        open={
                          !!(
                            creatingDep &&
                            creatingDep.type === "category" &&
                            creatingDep.value === cat
                          )
                        }
                        onOpenChange={(open) => {
                          if (!open) setCreatingDep(null);
                        }}
                      >
                        <PopoverTrigger asChild>
                          <button
                            className="ml-1 text-brand-600 underline font-semibold"
                            type="button"
                            onClick={() => openCreateDep("category", cat)}
                          >
                            + Create
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          align="start"
                          className="bg-white/90 backdrop-blur-lg shadow-2xl rounded-xl border border-gray-200 p-6 w-80"
                        >
                          <div className="mb-2 text-lg font-semibold text-gray-900">
                            Create Category
                          </div>
                          <input
                            ref={inputRef}
                            value={newDepValue}
                            onChange={(e) => setNewDepValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                createDependency();
                              }
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-base mb-3"
                            placeholder="Category name"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-2 px-4 rounded-lg shadow transition-all disabled:opacity-60"
                              type="button"
                              onClick={createDependency}
                              disabled={savingDep || !newDepValue.trim()}
                            >
                              {savingDep ? (
                                <span className="animate-spin mr-2 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full align-middle" />
                              ) : null}
                              Create
                            </button>
                            <button
                              className="text-gray-500 hover:text-gray-700 font-semibold px-3 py-2 rounded-lg"
                              type="button"
                              onClick={() => setCreatingDep(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </span>
                  ))}
                </div>
              )}
              {missingDeps.statusLabels.size > 0 && (
                <div className="text-red-600 text-sm flex flex-wrap items-center gap-2">
                  Missing status labels:
                  {Array.from(missingDeps.statusLabels).map((label) => (
                    <span key={label} className="ml-2">
                      {label}
                      <Popover
                        open={
                          !!(
                            creatingDep &&
                            creatingDep.type === "statusLabel" &&
                            creatingDep.value === label
                          )
                        }
                        onOpenChange={(open) => {
                          if (!open) setCreatingDep(null);
                        }}
                      >
                        <PopoverTrigger asChild>
                          <button
                            className="ml-1 text-brand-600 underline font-semibold"
                            type="button"
                            onClick={() => openCreateDep("statusLabel", label)}
                          >
                            + Create
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          align="start"
                          className="bg-white/90 backdrop-blur-lg shadow-2xl rounded-xl border border-gray-200 p-6 w-80"
                        >
                          <div className="mb-2 text-lg font-semibold text-gray-900">
                            Create Status Label
                          </div>
                          <input
                            ref={inputRef}
                            value={newDepValue}
                            onChange={(e) => setNewDepValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                createDependency();
                              }
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-base mb-3"
                            placeholder="Status label name"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-2 px-4 rounded-lg shadow transition-all disabled:opacity-60"
                              type="button"
                              onClick={createDependency}
                              disabled={savingDep || !newDepValue.trim()}
                            >
                              {savingDep ? (
                                <span className="animate-spin mr-2 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full align-middle" />
                              ) : null}
                              Create
                            </button>
                            <button
                              className="text-gray-500 hover:text-gray-700 font-semibold px-3 py-2 rounded-lg"
                              type="button"
                              onClick={() => setCreatingDep(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </span>
                  ))}
                </div>
              )}
              {missingDeps.models.size === 0 &&
                missingDeps.categories.size === 0 &&
                missingDeps.statusLabels.size === 0 && (
                  <motion.div
                    className="text-green-700 text-sm font-semibold flex items-center gap-2"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <span aria-label="Ready to import">
                      🎉{" "}
                      <span className="animate-bounce">
                        All set! Ready to import!
                      </span>
                    </span>
                  </motion.div>
                )}
            </motion.div>
            <motion.div
              className="overflow-x-auto border rounded-lg shadow-lg bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <table
                className="min-w-full text-xs"
                aria-label="CSV preview table"
              >
                <thead>
                  <tr>
                    {csvHeaders.map((header) => (
                      <th
                        key={header}
                        className="px-2 py-1 bg-gray-100 border-b font-semibold text-left"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvPreview.map((row, i) => {
                    const rowHasMissingDep =
                      (row.modelName && !allModels.includes(row.modelName)) ||
                      (row.categoryName &&
                        !allCategories.includes(row.categoryName)) ||
                      (row.statusLabelName &&
                        !allStatusLabels.includes(row.statusLabelName));
                    return (
                      <motion.tr
                        key={i}
                        className={rowHasMissingDep ? "bg-red-50" : ""}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * i }}
                      >
                        {csvHeaders.map((header) => {
                          let cellClass = "px-2 py-1 border-b";
                          let isMissing = false;
                          if (
                            header === "modelName" &&
                            row[header] &&
                            !allModels.includes(row[header])
                          ) {
                            cellClass += " bg-red-100 text-red-700";
                            isMissing = true;
                          }
                          if (
                            header === "categoryName" &&
                            row[header] &&
                            !allCategories.includes(row[header])
                          ) {
                            cellClass += " bg-red-100 text-red-700";
                            isMissing = true;
                          }
                          if (
                            header === "statusLabelName" &&
                            row[header] &&
                            !allStatusLabels.includes(row[header])
                          ) {
                            cellClass += " bg-red-100 text-red-700";
                            isMissing = true;
                          }
                          return (
                            <td key={header} className={cellClass}>
                              <span className="flex items-center gap-1">
                                {row[header]}
                                {isMissing && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span
                                          className="ml-1 align-middle cursor-help"
                                          tabIndex={0}
                                        >
                                          <AlertTriangle className="inline h-3 w-3 text-red-500" />
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <span>
                                          This{" "}
                                          {header
                                            .replace("Name", "")
                                            .toLowerCase()}{" "}
                                          does not exist. Click + Create above
                                          to add it.
                                        </span>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </span>
                            </td>
                          );
                        })}
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Dropzone
            onDrop={handleDrop}
            accept={{
              "text/csv": [".csv"],
            }}
          />
          {file && (
            <div className="text-sm text-gray-500 mt-2">
              Selected file: {file.name}
            </div>
          )}
          <Button
            type="submit"
            className={"form-btn mt-6 w-full md:w-auto"}
            disabled={
              isLoading ||
              !file ||
              missingDeps.models.size > 0 ||
              missingDeps.categories.size > 0 ||
              missingDeps.statusLabels.size > 0
            }
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className={"animate-spin"} />
                &nbsp; Processing...
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </form>
      </Form>
    </section>
  );
};

export default FileUploadForm;
