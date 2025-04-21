import { MOBILE_NAV_ITEMS } from "@/lib/constants";
import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { PlusIcon } from "lucide-react";

interface MobileNavigationProps {
  onAddClick?: () => void;
}

export function MobileNavigation({ onAddClick }: MobileNavigationProps) {
  const [location] = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 glass dark:glass-dark border-t border-neutral-200 dark:border-neutral-700 z-10">
      <div className="flex justify-around">
        {MOBILE_NAV_ITEMS.map((item, index) => {
          const isActive = location === item.path;
          
          if (item.isAction) {
            return (
              <button
                key={index}
                className="flex-1 flex flex-col items-center py-2 relative"
                onClick={onAddClick}
              >
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white absolute -top-6 shadow-lg">
                  <PlusIcon className="h-6 w-6" />
                </div>
                <span className="text-xs mt-7 text-neutral-500 dark:text-neutral-400">
                  {item.label}
                </span>
              </button>
            );
          }
          
          return (
            <Link href={item.path} key={index}>
              <a className="flex-1 flex flex-col items-center py-3">
                <i className={cn(
                  item.icon,
                  "text-xl",
                  isActive
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-neutral-500 dark:text-neutral-400"
                )}></i>
                <span className={cn(
                  "text-xs mt-1",
                  isActive
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-neutral-500 dark:text-neutral-400"
                )}>
                  {item.label}
                </span>
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
