import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface HeaderBoxProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

const HeaderBox: React.FC<HeaderBoxProps> = ({
  title,
  subtitle,
  icon,
  className,
  actions,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "mb-6 rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md dark:bg-card/95",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {icon && (
            <div className="rounded-full bg-primary/10 p-2 text-primary dark:bg-primary/20">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default HeaderBox;
