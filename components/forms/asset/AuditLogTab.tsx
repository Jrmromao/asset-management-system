import React from "react";

const AuditLogTab: React.FC<{ assetId: string }> = ({ assetId }) => {
  return (
    <div>
      <p>Audit log for asset: {assetId}</p>
      {/* Implement audit log details here */}
    </div>
  );
};

export default AuditLogTab; 