import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VoiceRecorder } from "./VoiceRecorder";
import { TagChip } from "@/molecules/TagChip";
import { COMMON_TAGS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { X, Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface RecordDreamSectionProps {
  userId: number;
  onCancel: () => void;
  onSuccess: () => void;
  className?: string;
}

export function RecordDreamSection({
  userId,
  onCancel,
  onSuccess,
  className,
}: RecordDreamSectionProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [mode, setMode] = useState<"voice" | "text">("voice");
  const tagInputRef = useRef<HTMLInputElement>(null);
  
  // Suggested tags from common tags that aren't already added
  const suggestedTags = COMMON_TAGS.filter(
    tag => !tags.includes(tag)
  ).slice(0, 5);
  
  const { mutate: submitDream, isPending } = useMutation({
    mutationFn: async () => {
      if (!title) throw new Error("Title is required");
      
      // For voice mode, we need a recording
      if (mode === "voice" && !recordingBlob) {
        throw new Error("Please record your dream first");
      }
      
      // For text mode, we need content
      if (mode === "text" && !content) {
        throw new Error("Please enter your dream description");
      }
      
      const formData = new FormData();
      formData.append("title", title);
      formData.append("userId", userId.toString());
      
      if (content) {
        formData.append("content", content);
      }
      
      if (tags.length > 0) {
        formData.append("tags", JSON.stringify(tags));
      }
      
      if (recordingBlob) {
        formData.append("audio", recordingBlob, "dream_recording.webm");
      }
      
      const response = await fetch('/api/dreams', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to save dream");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate dreams query to refresh the list
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/dreams`] });
      onSuccess();
    },
  });
  
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
      
      // Focus the input again
      if (tagInputRef.current) {
        tagInputRef.current.focus();
      }
    }
  };
  
  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };
  
  const handleAddSuggestedTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitDream();
  };
  
  const handleRecordingComplete = (blob: Blob) => {
    setRecordingBlob(blob);
  };
  
  const toggleMode = () => {
    setMode(mode === "voice" ? "text" : "voice");
  };

  return (
    <form 
      className={cn("glass dark:glass-dark rounded-2xl p-6", className)}
      onSubmit={handleSubmit}
    >
      <h2 className="text-xl font-medium mb-4">Record a New Dream</h2>
      
      <div className="mb-6">
        <Label htmlFor="dream-title" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          Dream Title
        </Label>
        <Input 
          type="text" 
          id="dream-title" 
          placeholder="Give your dream a title..." 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 
                   placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all"
          required
        />
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <Label htmlFor="dream-tags" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Tags
          </Label>
          <button
            type="button"
            onClick={toggleMode}
            className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
          >
            Switch to {mode === "voice" ? "text" : "voice"} mode
          </button>
        </div>
        
        <div className="flex items-center">
          <Input 
            type="text" 
            id="dream-tags" 
            ref={tagInputRef}
            placeholder="Add tags to categorize your dream..." 
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            className="flex-1 px-4 py-2 rounded-l-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 
                     placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all"
          />
          <Button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-r-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag, index) => (
              <TagChip
                key={index}
                tag={tag}
                onRemove={() => handleRemoveTag(index)}
              />
            ))}
          </div>
        )}
        
        {suggestedTags.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Suggested tags:</p>
            <div className="flex flex-wrap gap-1">
              {suggestedTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddSuggestedTag(tag)}
                  className="px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {mode === "voice" ? (
        <VoiceRecorder 
          onRecordingComplete={handleRecordingComplete}
          className="mb-6"
        />
      ) : (
        <div className="mb-6">
          <Label htmlFor="dream-content" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Dream Description
          </Label>
          <Textarea
            id="dream-content"
            placeholder="Describe your dream in detail..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-2 min-h-[200px] rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 
                     placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all"
            required={mode === "text"}
          />
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-4">
        <Button
          type="submit"
          disabled={isPending}
          className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-sm transition-colors"
        >
          {isPending ? "Saving..." : "Save Dream"}
        </Button>
        
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="flex-1 px-4 py-2.5 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg shadow-sm transition-colors"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
