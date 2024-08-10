export const sidebarLinks = [
    {
        imgURL: "/icons/monitor.svg",
        route: "/admin",
        label: "Admin",
        visibleTo: ["admin"],
    },
    {
        imgURL: "/icons/home.svg",
        route: "/",
        label: "Home",
        visibleTo: ["admin", "user"],
    },
    {
        imgURL: "/icons/dollar-circle.svg",
        route: "/assets",
        label: "Assets",
        visibleTo: ["admin", "user"],
    },
    {
        imgURL: "/icons/transaction.svg",
        route: "/licenses",
        label: "Licenses",
        visibleTo: ["admin", "user"],
    },
    {
        imgURL: "/icons/money-send.svg",
        route: "/accessories",
        label: "Accessories",
        visibleTo: ["admin", "user"],
    },
    {
        imgURL: "/icons/plus.svg",
        route: "/people",
        label: "People",
        visibleTo: ["admin", "user"],
    },
    {
        imgURL: "/icons/money-send.svg",
        route: "/kits",
        label: "Kits",
        visibleTo: ["admin"],
    },
].sort((a, b) => {
    if (a.label === "Home") return -1;
    if (b.label === "Home") return 1;  
    return a.label.localeCompare(b.label);
});


export const  ACCEPTED_FILE_FORMAT = [".csv, text/csv, application/vnd.ms-excel, application/csv, text/x-csv, application/x-csv, text/comma-separated-values, text/x-comma-separated-values"];
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_FILES = 1

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




export const transactionCategoryStyles = {
    "Food and Drink": {
        borderColor: "border-pink-600",
        backgroundColor: "bg-pink-500",
        textColor: "text-pink-700",
        chipBackgroundColor: "bg-inherit",
    },
    Payment: {
        borderColor: "border-success-600",
        backgroundColor: "bg-green-600",
        textColor: "text-success-700",
        chipBackgroundColor: "bg-inherit",
    },
    "Bank Fees": {
        borderColor: "border-success-600",
        backgroundColor: "bg-green-600",
        textColor: "text-success-700",
        chipBackgroundColor: "bg-inherit",
    },
    Transfer: {
        borderColor: "border-red-700",
        backgroundColor: "bg-red-700",
        textColor: "text-red-700",
        chipBackgroundColor: "bg-inherit",
    },
    Processing: {
        borderColor: "border-[#F2F4F7]",
        backgroundColor: "bg-gray-500",
        textColor: "text-[#344054]",
        chipBackgroundColor: "bg-[#F2F4F7]",
    },
    Success: {
        borderColor: "border-[#12B76A]",
        backgroundColor: "bg-[#12B76A]",
        textColor: "text-[#027A48]",
        chipBackgroundColor: "bg-[#ECFDF3]",
    },
    default: {
        borderColor: "",
        backgroundColor: "bg-blue-500",
        textColor: "text-blue-700",
        chipBackgroundColor: "bg-inherit",
    },
};
