import { useState } from "react";
import BulkImportDialog from "@/components/forms/BulkImportDialog";
import { loneeUserImportConfig } from "@/config/loneeUserImportConfig";
import { Button } from "@/components/ui/button";

export default function UserManagement() {
  const [isLoneeImportOpen, setLoneeImportOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setLoneeImportOpen(true)}>
        Import Assignment-Only Users
      </Button>
      <BulkImportDialog
        isOpen={isLoneeImportOpen}
        onClose={() => setLoneeImportOpen(false)}
        config={loneeUserImportConfig}
        onImport={async (data) => {
          // Optionally refresh user list here
        }}
      />
    </div>
  );
}
