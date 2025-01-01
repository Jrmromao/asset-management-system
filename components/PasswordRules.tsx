import React, { useState } from "react";
import { GrCircleInformation } from "react-icons/gr";

export const PasswordRules = ({ label }: { label: string }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative inline-flex items-center gap-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {label} <GrCircleInformation className="h-4 w-4" />
      {isHovered && (
        <div className="absolute left-full top-0 ml-2 w-80 bg-white p-2 rounded-md shadow-lg z-50">
          <div className="space-y-2 text-sm">
            <p className="font-medium">Password Requirements:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Minimum 8 characters</li>
              <li>At least one uppercase letter (A-Z)</li>
              <li>At least one lowercase letter (a-z)</li>
              <li>At least one number (0-9)</li>
              <li>At least one special character (!@#$%^&*)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
