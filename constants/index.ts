export const roles = {
  ADMIN: "Admin",
  SUPER_ADMIN: "SuperAdmin",
  USER: "User",
};

export const sidebarLinks = [
  {
    imgURL: "/icons/admin-icon.svg",
    route: "/admin",
    label: "Admin",
    visibleTo: [roles.ADMIN],
  },
  {
    imgURL: "/icons/laptop.svg",
    route: "/assets",
    label: "Assets",
    visibleTo: [roles.ADMIN, roles.USER, roles.SUPER_ADMIN],
  },
  // {
  //   imgURL: "/icons/license.svg",
  //   route: "/licenses",
  //   label: "Licenses",
  //   visibleTo: [roles.ADMIN, roles.USER, roles.SUPER_ADMIN],
  // },
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

  // {
  //   imgURL: "/icons/reports.svg",
  //   route: "/reports",
  //   label: "Reports",
  //   visibleTo: [roles.ADMIN],
  // },
  {
    imgURL: "/icons/settings.svg",
    route: "/settings",
    label: "Settings",
    visibleTo: [roles.ADMIN],
  },
  // {
  //   imgURL: "/icons/Admin-icon.svg",
  //   route: "/admin",
  //   label: "Maintenance",
  //   visibleTo: [roles.ADMIN],
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
