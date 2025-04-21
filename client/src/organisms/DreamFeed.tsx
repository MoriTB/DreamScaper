import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { DreamCard } from "@/molecules/DreamCard";
import { LayoutGrid, ListFilter, Archive } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DreamWithRelations } from "@shared/schema";

interface DreamFeedProps {
  userId: number;
  limit?: number;
  showViewAllButton?: boolean;
  className?: string;
}

export function DreamFeed({
  userId,
  limit,
  showViewAllButton = true,
  className,
}: DreamFeedProps) {
  const [sortBy, setSortBy] = useState<string>("newest");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  
  const { data: dreams, isLoading, error } = useQuery<DreamWithRelations[]>({
    queryKey: [`/api/users/${userId}/dreams?sortBy=${sortBy}`],
  });
  
  // Sort dreams based on the selected option
  const sortedDreams = dreams ? [...dreams] : [];
  
  // Limit the number of dreams shown if limit is provided
  const displayedDreams = limit && sortedDreams.length > limit 
    ? sortedDreams.slice(0, limit) 
    : sortedDreams;

  return (
    <div className={cn("mb-8", className)}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium">Recent Dreams</h2>
        
        <div className="flex items-center gap-2">
          <Select 
            value={sortBy} 
            onValueChange={setSortBy}
          >
            <SelectTrigger className="w-[140px] py-1.5 px-3 h-9 bg-neutral-200/50 dark:bg-neutral-800/50 rounded-lg text-sm border border-neutral-300 dark:border-neutral-700">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Most Recent</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="favorites">Favorites</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="icon"
            className={cn(
              "p-1.5 rounded-lg",
              viewMode === "grid" 
                ? "bg-purple-100 dark:bg-purple-900/30" 
                : "bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700"
            )}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid 
              className={cn(
                "h-4 w-4",
                viewMode === "grid" 
                  ? "text-purple-600 dark:text-purple-400" 
                  : "text-neutral-600 dark:text-neutral-400"
              )} 
            />
          </Button>
          
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="icon"
            className={cn(
              "p-1.5 rounded-lg",
              viewMode === "list" 
                ? "bg-purple-100 dark:bg-purple-900/30" 
                : "bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700"
            )}
            onClick={() => setViewMode("list")}
          >
            <ListFilter 
              className={cn(
                "h-4 w-4",
                viewMode === "list" 
                  ? "text-purple-600 dark:text-purple-400" 
                  : "text-neutral-600 dark:text-neutral-400"
              )} 
            />
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="py-8 text-center">
          <p>Loading dreams...</p>
        </div>
      ) : error ? (
        <div className="py-8 text-center">
          <p>Error loading dreams. Please try again.</p>
        </div>
      ) : displayedDreams.length === 0 ? (
        <div className="py-8 text-center">
          <p>No dreams recorded yet. Start by recording your first dream!</p>
        </div>
      ) : (
        <div className={cn(
          viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 gap-6" 
            : "space-y-6"
        )}>
          {displayedDreams.map((dreamData) => (
            <DreamCard
              key={dreamData.dream.id}
              dream={dreamData.dream}
              interpretation={dreamData.interpretation}
              imageGeneration={dreamData.imageGeneration}
            />
          ))}
        </div>
      )}
      
      {showViewAllButton && displayedDreams.length > 0 && (
        <div className="flex justify-center mt-8">
          <Link href="/all-dreams">
            <Button
              variant="outline"
              className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 shadow-sm"
            >
              <Archive className="mr-2 h-4 w-4" />
              View all dreams
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
