import React, { useState } from "react";
import {
  Box,
  Factory,
  LucideIcon,
  MapPin,
  Plus,
  Search,
  Settings2,
  Tags,
} from "lucide-react";

interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
  fields: string[];
}

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState<string>("categories");

  const tabs: Tab[] = [
    {
      id: "models",
      label: "Models",
      icon: Box,
      fields: ["Model Name", "Type", "Specifications", "Status"],
    },
    {
      id: "manufacturers",
      label: "Manufacturers",
      icon: Factory,
      fields: ["Name", "Contact Info", "Support Email", "Active Models"],
    },
    {
      id: "locations",
      label: "Locations",
      icon: MapPin,
      fields: ["Name", "Address", "Type", "Status"],
    },
    {
      id: "categories",
      label: "Asset Categories",
      icon: Tags,
      fields: ["Category Name", "Parent Category", "Description", "Status"],
    },
  ];

  const renderTable = () => {
    const activeTabData = tabs.find((tab) => tab.id === activeTab);
    if (!activeTabData) return null;

    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              {activeTabData.fields.map((field, index) => (
                <th
                  key={index}
                  className="px-6 py-4 text-left text-sm font-medium text-gray-600"
                >
                  {field}
                </th>
              ))}
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[1, 2, 3].map((item) => (
              <tr key={item} className="hover:bg-gray-50/50">
                {activeTabData.fields.map((field, index) => (
                  <td key={index} className="px-6 py-4 text-sm text-gray-600">
                    {field === "Status" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      `Sample ${field} ${item}`
                    )}
                  </td>
                ))}
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded">
                    <Settings2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="mt-1 text-gray-500">
            Configure your application settings and manage master data
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-64 space-y-1 bg-white p-3 rounded-lg border border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-sm rounded-md transition-colors ${
                    activeTab === tab.id
                      ? "bg-green-50 text-green-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  {tabs.find((tab) => tab.id === activeTab)?.label || ""}
                </h2>
                <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New
                </button>
              </div>

              <div className="p-6">
                {/* Search and filters */}
                <div className="mb-6 flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <button className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                    Filters
                  </button>
                </div>

                {/* Table */}
                {renderTable()}

                {/* Pagination */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing 1 to 3 of 12 entries
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50">
                      Previous
                    </button>
                    <button className="px-3 py-1 border border-gray-200 rounded-md text-sm bg-green-50 text-green-700 font-medium">
                      1
                    </button>
                    <button className="px-3 py-1 border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50">
                      2
                    </button>
                    <button className="px-3 py-1 border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
