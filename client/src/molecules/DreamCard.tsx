import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Star, MoreHorizontal } from "lucide-react";
import { cn, formatDate, truncateText } from "@/lib/utils";
import { AudioPlayer } from "./AudioPlayer";
import { TagChip } from "./TagChip";
import { apiRequest } from "@/lib/queryClient";
import { Dream, Interpretation, ImageGeneration } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DreamCardProps {
  dream: Dream;
  interpretation?: Interpretation | null;
  imageGeneration?: ImageGeneration | null;
  className?: string;
}

export function DreamCard({
  dream,
  interpretation,
  imageGeneration,
  className,
}: DreamCardProps) {
  const queryClient = useQueryClient();
  const [isFavorite, setIsFavorite] = useState(dream.isFavorite);
  
  useEffect(() => {
    setIsFavorite(dream.isFavorite);
  }, [dream.isFavorite]);

  const toggleFavorite = async () => {
    try {
      // Optimistically update UI
      setIsFavorite(!isFavorite);
      
      // Send request to server
      await apiRequest('PATCH', `/api/dreams/${dream.id}/favorite`, {});
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/users/${dream.userId}/dreams`] });
    } catch (error) {
      // Revert on error
      console.error('Error toggling favorite:', error);
      setIsFavorite(isFavorite);
    }
  };

  return (
    <div className={cn("glass dark:glass-dark rounded-xl overflow-hidden mb-6", className)}>
      <div className="flex flex-col md:flex-row">
        <div className="md:w-2/3 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-medium">{dream.title}</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {formatDate(dream.createdAt)} • {dream.audioDuration 
                  ? `${Math.ceil(dream.audioDuration / 60)} min listen` 
                  : `${Math.ceil(dream.content.length / 500)} min read`}
              </p>
            </div>
            <div className="flex gap-1">
              <button 
                className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                onClick={toggleFavorite}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Star 
                  className={cn(
                    "h-5 w-5", 
                    isFavorite 
                      ? "text-amber-500 fill-amber-500" 
                      : "text-neutral-500 dark:text-neutral-400"
                  )} 
                />
              </button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors">
                    <MoreHorizontal className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[180px]">
                  <DropdownMenuItem>Edit Dream</DropdownMenuItem>
                  <DropdownMenuItem>Download Audio</DropdownMenuItem>
                  <DropdownMenuItem>Share Dream</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600 dark:text-red-400">
                    Delete Dream
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="font-serif text-neutral-700 dark:text-neutral-300 line-clamp-3">
              {truncateText(dream.content, 300)}
            </p>
          </div>
          
          {dream.tags && dream.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {dream.tags.map((tag, index) => (
                <TagChip key={index} tag={tag} />
              ))}
            </div>
          )}
          
          {dream.audioUrl && (
            <AudioPlayer 
              src={dream.audioUrl} 
              duration={dream.audioDuration || 0} 
            />
          )}
        </div>
        
        <div className="md:w-1/3 bg-neutral-50 dark:bg-neutral-800/50 p-6 flex flex-col">
          <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-3">
            <span className="mr-1">✨</span> AI Interpretation
          </h4>
          
          {interpretation ? (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 flex-1">
              {truncateText(interpretation.interpretation, 200)}
            </p>
          ) : (
            <p className="text-sm text-neutral-500 dark:text-neutral-500 mb-4 flex-1 italic">
              Generating interpretation...
            </p>
          )}
          
          {imageGeneration ? (
            <div className="rounded-lg overflow-hidden">
              <img 
                src={imageGeneration.imageUrl} 
                alt="Dream visualization" 
                className="w-full h-40 object-cover"
              />
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 flex justify-between">
                <span>AI Generated Visualization</span>
                <span>{imageGeneration.style} style</span>
              </div>
            </div>
          ) : (
            <div className="rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-700/30 h-40 flex items-center justify-center">
              <p className="text-sm text-neutral-500 dark:text-neutral-500 italic">
                Generating image...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
