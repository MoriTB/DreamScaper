import { Home, Archive, PlusCircle, BarChart2, User } from "lucide-react";
import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";

interface MobileNavigationProps {
  onAddClick?: () => void;
}

export function MobileNavigation({ onAddClick }: MobileNavigationProps) {
  const [location] = useLocation();
  
  // Define nav items directly in the component for more control
  const NAV_ITEMS = [
    { label: "Home", icon: Home, path: "/" },
    { label: "Dreams", icon: Archive, path: "/all-dreams" },
    { label: "Record", icon: PlusCircle, path: "/record", isAction: true },
    { label: "Insights", icon: BarChart2, path: "/insights" },
    { label: "Profile", icon: User, path: "/profile" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 glass dark:glass-dark border-t border-neutral-200 dark:border-neutral-700 z-50">
      <div className="flex items-center justify-between px-3 py-2">
        {NAV_ITEMS.map((item, index) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          if (item.isAction) {
            return (
              <Link href={item.path} key={index}>
                <a className="relative flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                    <Icon size={24} />
                  </div>
                </a>
              </Link>
            );
          }
          
          return (
            <Link href={item.path} key={index}>
              <a className={cn(
                "w-16 flex flex-col items-center py-1 transition-colors",
                isActive 
                  ? "text-purple-600 dark:text-purple-400" 
                  : "text-neutral-500 dark:text-neutral-400 hover:text-purple-500 dark:hover:text-purple-300"
              )}>
                <Icon size={20} className={cn(
                  isActive && "animate-pulse"
                )} />
                <span className="text-xs mt-1 font-medium">
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
