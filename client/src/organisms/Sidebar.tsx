import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TagChip } from "@/molecules/TagChip";
import { NAV_ITEMS, COMMON_TAGS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTags?: string[];
  onTagClick?: (tag: string) => void;
}

export function Sidebar({ activeTags = [], onTagClick }: SidebarProps) {
  const [location] = useLocation();
  const [popularTags] = useState(COMMON_TAGS.slice(0, 10));
  
  const handleTagClick = (tag: string) => {
    if (onTagClick) {
      onTagClick(tag);
    }
  };

  return (
    <aside className="hidden md:block w-64 fixed inset-y-0 pt-16 glass dark:glass-dark border-r border-neutral-200 dark:border-neutral-700">
      <ScrollArea className="h-full">
        <div className="flex flex-col h-full">
          <nav className="flex-1 px-4 py-6">
            {NAV_ITEMS.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-8">
                <h2 className="px-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                  {section.section}
                </h2>
                <ul className="space-y-1">
                  {section.items.map((item, itemIndex) => {
                    const isActive = location === item.path;
                    return (
                      <li key={itemIndex}>
                        <Link href={item.path}>
                          <a
                            className={cn(
                              "flex items-center px-3 py-2 rounded-lg",
                              isActive
                                ? "bg-purple-100 dark:bg-purple-900/30 text-neutral-900 dark:text-neutral-100"
                                : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            )}
                          >
                            <i className={cn(
                              item.icon,
                              "mr-3 text-lg",
                              isActive
                                ? "text-purple-600 dark:text-purple-400"
                                : "text-neutral-500"
                            )}></i>
                            <span>{item.label}</span>
                          </a>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
            
            <div>
              <h2 className="px-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                Tags
              </h2>
              <div className="px-3 flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <TagChip
                    key={tag}
                    tag={tag}
                    className="cursor-pointer"
                    onClick={() => handleTagClick(tag)}
                  />
                ))}
              </div>
            </div>
          </nav>
          
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
            <div className="glass dark:glass-dark rounded-lg p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
              <h3 className="font-medium text-sm text-purple-800 dark:text-purple-300">
                Premium Access
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                Unlock advanced dream analysis and AI interpretations
              </p>
              <Button 
                className="mt-3 w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm transition-colors"
                size="sm"
              >
                Upgrade
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
