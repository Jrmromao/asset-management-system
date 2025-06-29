import { useState, useMemo } from "react";

export function useSchemaMapping(
  uploadedColumns: string[],
  templateFields: { name: string; label: string; required: boolean }[]
) {
  // Initial mapping: auto-map by exact name/label match
  const initialMapping = useMemo(() => {
    const mapping: Record<string, string | null> = {};
    uploadedColumns.forEach(col => {
      const match = templateFields.find(f =>
        f.name.toLowerCase() === col.toLowerCase() ||
        f.label.toLowerCase() === col.toLowerCase()
      );
      mapping[col] = match ? match.name : null;
    });
    return mapping;
  }, [uploadedColumns, templateFields]);

  const [columnMapping, setColumnMapping] = useState<Record<string, string | null>>(initialMapping);

  // Helper: which template fields are not mapped yet
  const unmappedRequiredFields = templateFields.filter(
    f => f.required && !Object.values(columnMapping).includes(f.name)
  );

  // Helper: which uploaded columns are ignored
  const ignoredColumns = uploadedColumns.filter(col => !columnMapping[col]);

  // Update mapping
  const updateMapping = (uploadedCol: string, templateField: string | null) => {
    setColumnMapping(prev => ({ ...prev, [uploadedCol]: templateField }));
  };

  return {
    columnMapping,
    updateMapping,
    unmappedRequiredFields,
    ignoredColumns,
  };
} 