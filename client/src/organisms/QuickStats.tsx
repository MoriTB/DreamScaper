import { StatCard } from "@/atoms/StatCard";
import { cn } from "@/lib/utils";

interface QuickStatsProps {
  totalDreams: number;
  weeklyDreams: number;
  favoriteDreams: number;
  streak: number;
  className?: string;
}

export function QuickStats({
  totalDreams,
  weeklyDreams,
  favoriteDreams,
  streak,
  className,
}: QuickStatsProps) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4 mb-8", className)}>
      <StatCard
        title="Total Dreams"
        value={totalDreams}
        icon={<i className="ri-moon-clear-line text-purple-600 dark:text-purple-400 text-xl"></i>}
        iconBackground="bg-purple-100 dark:bg-purple-900/30"
      />
      
      <StatCard
        title="This Week"
        value={weeklyDreams}
        icon={<i className="ri-calendar-line text-amber-600 dark:text-amber-400 text-xl"></i>}
        iconBackground="bg-amber-100 dark:bg-amber-900/30"
      />
      
      <StatCard
        title="Favorites"
        value={favoriteDreams}
        icon={<i className="ri-star-line text-purple-600 dark:text-purple-400 text-xl"></i>}
        iconBackground="bg-purple-100 dark:bg-purple-900/30"
      />
      
      <StatCard
        title="Streak"
        value={`${streak} days`}
        icon={<i className="ri-fire-line text-amber-600 dark:text-amber-400 text-xl"></i>}
        iconBackground="bg-amber-100 dark:bg-amber-900/30"
      />
    </div>
  );
}
