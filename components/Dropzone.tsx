import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUpload } from "lucide-react";

interface DropzoneProps {
  onDrop: (acceptedFiles: File[]) => void;
  accept?: Record<string, string[]>;
  multiple?: boolean;
}

const Dropzone: React.FC<DropzoneProps> = ({
  onDrop,
  accept,
  multiple = false,
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
  });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed rounded-lg p-6 cursor-pointer hover:border-gray-400 transition-colors"
    >
      <input {...getInputProps()} />
      <div className="text-center">
        {isDragActive ? (
          <p>Drop the CSV file here...</p>
        ) : (
          <>
            <CloudUpload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-lg text-gray-600">
              Click to upload or drag and drop
            </p>
            <p className="mt-2 text-sm text-gray-500"></p>
            <p className="text-sm text-gray-500">Max size: 25MB</p>
          </>
        )}
      </div>
    </div>
  );
};

export default Dropzone;
