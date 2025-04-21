import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBackground?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  iconBackground = "bg-purple-100 dark:bg-purple-900/30",
  className,
}: StatCardProps) {
  return (
    <div className={cn("glass dark:glass-dark rounded-xl p-4", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{title}</p>
          <p className="text-2xl font-medium mt-1">{value}</p>
        </div>
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconBackground)}>
          {icon}
        </div>
      </div>
    </div>
  );
}
