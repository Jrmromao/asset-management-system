"use client";
import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useDialogStore } from "@/lib/stores/store";
import Dropzone from "@/components/Dropzone";
import { useAssetStore } from "@/lib/stores/assetStore";
import { toast } from "sonner";
import { processAccessoryCSV } from "@/lib/actions/accessory.actions";

interface FileUploadFormProps {
  dataType: string;
}

const FileUploadForm = ({ dataType }: FileUploadFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [closeDialog] = useDialogStore((state) => [state.onClose]);
  const [file, setFile] = useState<File | null>(null);
  const { getAll } = useAssetStore();
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
      const fileContent = await readFileContent(file);

      if (dataType === "assets") {
        console.log("ASSETS CONDITION");

        //   const result = await processAssetsCSV(fileContent);
        //   if (result.success) {
        //     toast.success(result.message);
        //     form.reset();
        //     getAll();
        //     closeDialog();
        //   } else {
        //     toast.error(result.message);
        //   }
      }
      if (dataType === "accessories") {
        const result = await processAccessoryCSV(fileContent);
        if (result.success) {
          toast.success(result.message);
          form.reset();
          getAll();
          closeDialog();
        } else {
          toast.error(result.message);
        }
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

  return (
    <section className={""}>
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
