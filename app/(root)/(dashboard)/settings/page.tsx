"use client";
import { useState } from "react";
import AdminSettings from "@/components/AdminSettings";

const DashboardPage = (): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="p-8 space-y-6">
      <AdminSettings />
    </div>
  );
};

export default DashboardPage;
