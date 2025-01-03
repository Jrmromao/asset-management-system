import React from "react";
import {
  CalendarDays,
  History,
  Key,
  Laptop,
  LucideIcon,
  Package,
} from "lucide-react";
import { Card } from "@/components/ui/card";

interface PlaceholderStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

type PlaceholderType =
  | "assets"
  | "accessories"
  | "licenses"
  | "history"
  | "bookings";

type PlaceholderStates = {
  [K in PlaceholderType]: PlaceholderStateProps;
};

interface EmptyStateProps {
  type: PlaceholderType;
  onAction?: () => void;
}

const PlaceholderState: React.FC<
  PlaceholderStateProps & { onAction?: () => void }
> = ({ icon: Icon, title, description, onAction }) => (
  <Card className="flex flex-col items-center justify-center p-12 text-center space-y-6 bg-gradient-to-b from-white to-gray-50 border border-gray-100 shadow-sm">
    <div className="bg-emerald-50 p-6 rounded-full ring-8 ring-emerald-50/50">
      <Icon className="h-10 w-10 text-emerald-600" />
    </div>
    <div className="space-y-4">
      <h3 className="font-semibold text-2xl text-green-900">{title}</h3>
      <p className="text-gray-500 text-base max-w-sm mx-auto leading-relaxed">
        {description}
      </p>
    </div>
    {/*{onAction && (*/}
    {/*  <Button*/}
    {/*    onClick={onAction}*/}
    {/*    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 mt-4"*/}
    {/*  >*/}
    {/*    <Plus className="h-4 w-4" />*/}
    {/*    Add New*/}
    {/*  </Button>*/}
    {/*)}*/}
  </Card>
);

export const placeholderStates: PlaceholderStates = {
  assets: {
    icon: Laptop,
    title: "No Assets Found",
    description:
      "Get started by adding your first asset to track its environmental impact and maintenance schedule.",
  },
  accessories: {
    icon: Package,
    title: "No Accessories Available",
    description:
      "Add accessories to manage and optimize your equipment's performance.",
  },
  licenses: {
    icon: Key,
    title: "No Active Licenses",
    description:
      "Start managing your software licenses and compliance in one place.",
  },
  history: {
    icon: History,
    title: "No Activity History",
    description:
      "Your asset activity and environmental impact tracking will appear here.",
  },
  bookings: {
    icon: CalendarDays,
    title: "No Current Bookings",
    description:
      "Schedule and manage your equipment bookings to maximize utilization.",
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({ type, onAction }) => (
  <PlaceholderState {...placeholderStates[type]} onAction={onAction} />
);

export default EmptyState;
