"use client";
import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Download, Loader2 } from "lucide-react";
import { useDialogStore } from "@/lib/stores/store";
import Dropzone from "@/components/Dropzone";
import { useAssetStore } from "@/lib/stores/assetStore";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

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
  };

  const handleDownloadTemplate = async () => {
    let template = "";
    if (dataType === "assets") {
      // const result = await generateAssetCSVTemplate();
      // if (result.success) {
      //   template = result.data || "";
      // }
      template = "";
    }
    // Add other data types here

    if (!template) {
      toast.error("Template not available for this data type");
      return;
    }

    // Create and download the file
    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${dataType}-template.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
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
            disabled={isLoading || !file}
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
