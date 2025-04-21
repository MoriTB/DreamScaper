import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface TagChipProps {
  tag: string;
  onRemove?: () => void;
  className?: string;
}

export function TagChip({ tag, onRemove, className }: TagChipProps) {
  // Style variations based on tag content
  const getTagStyle = (tag: string) => {
    // Create a consistent hash from the tag string
    const hash = tag.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + acc;
    }, 0);
    
    // Define style categories
    const styles = [
      "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
      "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
      "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
      "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    ];
    
    // Special cases for common tags
    if (tag.includes('lucid')) return styles[0];
    if (tag.includes('recurring')) return styles[1];
    if (tag.includes('nightmare')) return styles[4];
    
    // Otherwise use the hash to select a style
    return styles[hash % styles.length];
  };

  return (
    <span className={cn(
      "px-2 py-1 text-xs rounded-md flex items-center",
      getTagStyle(tag),
      className
    )}>
      #{tag}
      {onRemove && (
        <button 
          onClick={onRemove} 
          className="ml-1 hover:text-neutral-900 dark:hover:text-white"
          aria-label={`Remove ${tag} tag`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
