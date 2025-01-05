export const sidebarLinks = [
  {
    imgURL: "/icons/admin-icon.svg",
    route: "/admin",
    label: "Admin",
    visibleTo: ["admin"],
  },
  {
    imgURL: "/icons/laptop.svg",
    route: "/assets",
    label: "Assets",
    visibleTo: ["admin", "user"],
  },
  {
    imgURL: "/icons/license.svg",
    route: "/licenses",
    label: "Licenses",
    visibleTo: ["admin", "user"],
  },
  {
    imgURL: "/icons/monitor.svg",
    route: "/accessories",
    label: "Accessories",
    visibleTo: ["admin", "user"],
  },
  {
    imgURL: "/icons/people.svg",
    route: "/people",
    label: "People",
    visibleTo: ["admin", "user"],
  },

  {
    imgURL: "/icons/reports.svg",
    route: "/reports",
    label: "Reports",
    visibleTo: ["admin"],
  },
  // {
  //     imgURL: "/icons/money-send.svg",
  //     route: "/kits",
  //     label: "Kits",
  //     visibleTo: ["admin"],
  // },
  // {
  //     imgURL: "/icons/plus.svg",
  //     route: "/ai-assistant",
  //     label: "AI Assistant",
  //     visibleTo: ["admin"],
  // },
].sort((a, b) => {
  if (a.label === "Admin") return -1;
  if (b.label === "Admin") return 1;
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
