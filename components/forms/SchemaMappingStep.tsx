import React from "react";
import { useSchemaMapping } from "@/hooks/useSchemaMapping";

interface TemplateField {
  name: string;
  label: string;
  required: boolean;
}

interface SchemaMappingStepProps {
  uploadedColumns: string[];
  templateFields: TemplateField[];
  onMappingComplete: (mapping: Record<string, string | null>) => void;
}

export default function SchemaMappingStep({
  uploadedColumns,
  templateFields,
  onMappingComplete,
}: SchemaMappingStepProps) {
  const {
    columnMapping,
    updateMapping,
    unmappedRequiredFields,
    ignoredColumns,
  } = useSchemaMapping(uploadedColumns, templateFields);

  const canProceed = unmappedRequiredFields.length === 0;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">
        Map Uploaded Columns to Template Fields
      </h2>
      <table className="min-w-full border mb-4">
        <thead>
          <tr>
            <th className="border px-2 py-1">Uploaded Column</th>
            <th className="border px-2 py-1">Map To</th>
            <th className="border px-2 py-1">Status</th>
          </tr>
        </thead>
        <tbody>
          {uploadedColumns.map((col) => (
            <tr key={col}>
              <td className="border px-2 py-1">{col}</td>
              <td className="border px-2 py-1">
                <select
                  className="border rounded px-1 py-0.5"
                  value={columnMapping[col] || ""}
                  onChange={(e) => updateMapping(col, e.target.value || null)}
                >
                  <option value="">Ignore</option>
                  {templateFields.map((f) => (
                    <option key={f.name} value={f.name}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </td>
              <td className="border px-2 py-1">
                {columnMapping[col] ? (
                  "Mapped"
                ) : (
                  <span className="text-orange-600">Will be ignored</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {unmappedRequiredFields.length > 0 && (
        <div className="text-red-600 mb-2">
          <strong>Required fields not mapped:</strong>
          <ul className="list-disc ml-6">
            {unmappedRequiredFields.map((f) => (
              <li key={f.name}>{f.label}</li>
            ))}
          </ul>
        </div>
      )}
      {ignoredColumns.length > 0 && (
        <div className="text-orange-600 mb-2">
          <strong>These columns will be ignored:</strong>{" "}
          {ignoredColumns.join(", ")}
        </div>
      )}
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={!canProceed}
        onClick={() => onMappingComplete(columnMapping)}
      >
        Continue
      </button>
    </div>
  );
}
