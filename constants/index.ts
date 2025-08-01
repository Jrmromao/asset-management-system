export const roles = {
  ADMIN: "Admin",
  SUPER_ADMIN: "SuperAdmin",
  USER: "User",
};

export const sidebarLinks = [
  {
    imgURL: "/icons/dashboard-icon.svg",
    route: "/dashboard",
    label: "Dashboard",
    visibleTo: [roles.ADMIN],
  },
  {
    imgURL: "/icons/laptop.svg",
    route: "/assets",
    label: "Assets",
    visibleTo: [roles.ADMIN, roles.USER, roles.SUPER_ADMIN],
  },
  {
    imgURL: "/icons/license.svg",
    route: "/licenses",
    label: "Licenses",
    visibleTo: [roles.ADMIN, roles.USER, roles.SUPER_ADMIN],
  },
  {
    imgURL: "/icons/monitor.svg",
    route: "/accessories",
    label: "Accessories",
    visibleTo: [roles.ADMIN],
  },
  {
    imgURL: "/icons/people.svg",
    route: "/people",
    label: "People",
    visibleTo: [roles.ADMIN],
  },
  {
    imgURL: "/icons/ai-brain.svg",
    route: "/ai-assistant",
    label: "AI Assistant",
    visibleTo: [roles.ADMIN, roles.USER, roles.SUPER_ADMIN],
  },
  {
    imgURL: "/icons/reports.svg",
    route: "/reports",
    label: "Reports",
    visibleTo: [roles.ADMIN],
  },
  // {
  //   imgURL: "/icons/maintenance-icon.svg",
  //   route: "/maintenance",
  //   label: "Maintenance",
  //   visibleTo: [roles.ADMIN],
  // },
  // {
  //   imgURL: "/icons/maintenance-flows-icon.svg",
  //   route: "/maintenance-flows",
  //   label: "Maintenance Flows",
  //   visibleTo: [roles.ADMIN],
  // },
  {
    imgURL: "/icons/audit-logs.svg",
    route: "/audit-logs",
    label: "Audit Logs",
    visibleTo: [roles.ADMIN, roles.SUPER_ADMIN],
  },
].sort((a, b) => {
  if (a.label === "Dashboard") return -1;
  if (b.label === "Dashboard") return 1;
  return a.label.localeCompare(b.label);
});

export const ACCEPTED_FILE_FORMAT = [
  ".csv, text/csv, application/vnd.ms-excel, application/csv, text/x-csv, application/x-csv, text/comma-separated-values, text/x-comma-separated-values",
];
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_FILES = 1;

export const APP_NAME = "EcoKeepr";

export const topCategoryStyles = {
  "Food and Drink": {
    bg: "bg-blue-25",
    circleBg: "bg-blue-100",
    text: {
      main: "text-blue-900",
      count: "text-blue-700",
    },
    progress: {
      bg: "bg-blue-100",
      indicator: "bg-blue-700",
    },
    icon: "/icons/monitor.svg",
  },
  Travel: {
    bg: "bg-success-25",
    circleBg: "bg-success-100",
    text: {
      main: "text-success-900",
      count: "text-success-700",
    },
    progress: {
      bg: "bg-success-100",
      indicator: "bg-success-700",
    },
    icon: "/icons/coins.svg",
  },
  default: {
    bg: "bg-pink-25",
    circleBg: "bg-pink-100",
    text: {
      main: "text-pink-900",
      count: "text-pink-700",
    },
    progress: {
      bg: "bg-pink-100",
      indicator: "bg-pink-700",
    },
    icon: "/icons/shopping-bag.svg",
  },
};

export enum EOLPlan {
  Recycle = "Recycle",
  Refurbish = "Refurbish",
  Dispose = "Dispose",
  TBD = "To Be Determined",
}

export const eolPlanOptions = [
  { id: EOLPlan.Recycle, name: "Recycle" },
  { id: EOLPlan.Refurbish, name: "Refurbish" },
  { id: EOLPlan.Dispose, name: "Dispose" },
  { id: EOLPlan.TBD, name: "To Be Determined" },
];
