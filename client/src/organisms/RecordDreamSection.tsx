import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VoiceRecorder } from "./VoiceRecorder";
import { TagChip } from "@/molecules/TagChip";
import { COMMON_TAGS, DREAM_STYLES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { X, Plus, Mic, Type, Tag, Hash, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface RecordDreamSectionProps {
  userId: number;
  onCancel: () => void;
  onSuccess: (dreamId?: number) => void;
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
  const [selectedStyle, setSelectedStyle] = useState(DREAM_STYLES[0]);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [mode, setMode] = useState<"voice" | "text">("voice");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [titleFocused, setTitleFocused] = useState(false);
  
  const tagInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  // Suggested tags from common tags that aren't already added
  const suggestedTags = COMMON_TAGS.filter(
    tag => !tags.includes(tag)
  ).slice(0, 6);
  
  useEffect(() => {
    if (titleInputRef.current && !title && mode === "voice" && recordingBlob) {
      // Auto-focus title input when recording is complete
      titleInputRef.current.focus();
    }
  }, [recordingBlob, title, mode]);
  
  const { mutate: submitDream, isPending } = useMutation({
    mutationFn: async () => {
      setFormError(null);
      
      if (!title) {
        setFormError("Please give your dream a title");
        if (titleInputRef.current) titleInputRef.current.focus();
        throw new Error("Title is required");
      }
      
      // For voice mode, we need a recording
      if (mode === "voice" && !recordingBlob) {
        setFormError("Please record your dream first");
        throw new Error("Please record your dream first");
      }
      
      // For text mode, we need content
      if (mode === "text" && !content) {
        setFormError("Please describe your dream");
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
      
      formData.append("style", selectedStyle);
      
      const response = await fetch('/api/dreams', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        setFormError(errorText || "Failed to save dream");
        throw new Error(errorText || "Failed to save dream");
      }
      
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      // Show success message before redirecting
      setShowSuccessAlert(true);
      
      // Invalidate dreams query to refresh the list
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/dreams`] });
      
      // Delay to show success message
      setTimeout(() => {
        onSuccess(data?.id);
      }, 1500);
    },
    onError: (error) => {
      console.error("Error saving dream:", error);
      setFormError(error.message || "Failed to save your dream. Please try again.");
    }
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
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  };
  
  const toggleMode = () => {
    setMode(mode === "voice" ? "text" : "voice");
  };

  // Form transition variants
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };
  
  const slideVariants = {
    hidden: { opacity: 0, x: mode === "voice" ? -20 : 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      x: mode === "voice" ? 20 : -20,
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  // Success animation variants
  const successVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 200
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      {showSuccessAlert ? (
        <motion.div
          key="success"
          variants={successVariants}
          initial="hidden"
          animate="visible"
          className="w-full"
        >
          <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 shadow-lg">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-800 dark:text-green-300 font-medium">Dream Saved!</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-400">
              Your dream has been recorded successfully and is being processed. Redirecting...
            </AlertDescription>
          </Alert>
        </motion.div>
      ) : (
        <motion.form 
          key="form"
          variants={formVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={cn("bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-xl border border-neutral-200 dark:border-neutral-800", className)}
          onSubmit={handleSubmit}
        >
          {/* Mode Switcher Tabs */}
          <Tabs defaultValue={mode} onValueChange={(value) => setMode(value as "voice" | "text")} className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-medium">Record a New Dream</h2>
              <TabsList className="grid grid-cols-2 bg-neutral-100 dark:bg-neutral-800">
                <TabsTrigger value="voice" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white flex gap-1.5 items-center">
                  <Mic className="h-3.5 w-3.5" />
                  <span>Voice</span>
                </TabsTrigger>
                <TabsTrigger value="text" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white flex gap-1.5 items-center">
                  <Type className="h-3.5 w-3.5" />
                  <span>Text</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Common fields section */}
            <motion.div
              layout
              className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 p-5 rounded-lg mb-6"
            >
              <div className="mb-5">
                <Label htmlFor="dream-title" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Dream Title
                </Label>
                <Input 
                  type="text" 
                  id="dream-title" 
                  ref={titleInputRef}
                  placeholder="Give your dream a title..." 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onFocus={() => setTitleFocused(true)}
                  onBlur={() => setTitleFocused(false)}
                  className={cn(
                    "w-full h-11 px-4 bg-white/80 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-lg",
                    "placeholder-neutral-400 transition-all duration-300",
                    "focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-500 focus:border-transparent",
                    titleFocused && "shadow-sm shadow-purple-200 dark:shadow-purple-900/20"
                  )}
                  required
                />
              </div>
              
              <div>
                <div className="flex items-center mb-1.5">
                  <Label htmlFor="dream-tags" className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" />
                    <span>Tags</span>
                  </Label>
                </div>
                
                <div className="flex items-center">
                  <Input 
                    type="text" 
                    id="dream-tags" 
                    ref={tagInputRef}
                    placeholder="Add tags (emotions, themes, people...)" 
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="flex-1 h-10 bg-white/80 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-l-lg"
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    className="h-10 px-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-r-lg"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Tags Container */}
                <motion.div 
                  layout 
                  className="mt-2"
                  transition={{ duration: 0.15 }}
                >
                  {/* Selected Tags */}
                  {tags.length > 0 && (
                    <motion.div 
                      layout
                      className="flex flex-wrap gap-2 mb-2"
                    >
                      <AnimatePresence initial={false}>
                        {tags.map((tag, index) => (
                          <motion.div
                            key={tag + index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.15 }}
                          >
                            <TagChip
                              tag={tag}
                              onRemove={() => handleRemoveTag(index)}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  )}
                  
                  {/* Suggested Tags */}
                  {suggestedTags.length > 0 && tags.length < 5 && (
                    <div className="mt-1.5">
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1.5 flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        <span>Suggested tags:</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestedTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleAddSuggestedTag(tag)}
                            className="px-2.5 py-1 text-xs bg-white/70 dark:bg-neutral-800/40 text-purple-700 dark:text-purple-300 rounded-md 
                                      border border-purple-100 dark:border-purple-900/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 
                                      transition-colors duration-150"
                          >
                            +{tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
            
            {/* Mode-specific content */}
            <AnimatePresence mode="wait">
              <TabsContent value="voice" className="mt-0">
                <motion.div
                  key="voice-content"
                  variants={slideVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <VoiceRecorder 
                    onRecordingComplete={handleRecordingComplete}
                    className="mb-6"
                  />
                </motion.div>
              </TabsContent>
              
              <TabsContent value="text" className="mt-0">
                <motion.div
                  key="text-content"
                  variants={slideVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <Label htmlFor="dream-content" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Dream Description
                  </Label>
                  <Textarea
                    id="dream-content"
                    placeholder="Describe your dream in detail. What happened? How did you feel? Did you notice any symbols or recurring themes?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-4 py-3 min-h-[220px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 
                              rounded-lg shadow-inner shadow-neutral-100 dark:shadow-black/10 placeholder-neutral-400 
                              focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    required={mode === "text"}
                  />
                </motion.div>
              </TabsContent>
            </AnimatePresence>
            
            {/* AI Style Selector */}
            <div className="mb-6 mt-4">
              <Label htmlFor="dream-style" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Dream Visualization Style
              </Label>
              
              <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                <SelectTrigger className="w-full h-11 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                  <SelectValue placeholder="Select visualization style" />
                </SelectTrigger>
                <SelectContent>
                  {DREAM_STYLES.map(style => (
                    <SelectItem key={style} value={style}>
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5">
                This will be used to generate a visual representation of your dream.
              </p>
            </div>
          </Tabs>
          
          {/* Form Error */}
          <AnimatePresence>
            {formError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="mb-4"
              >
                <Alert variant="destructive" className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white
                        rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] font-medium"
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  <span>Save Dream</span>
                </div>
              )}
            </Button>
            
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="flex-1 h-12 bg-white hover:bg-neutral-50 dark:bg-neutral-950 dark:hover:bg-neutral-900
                        border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300
                        rounded-lg transition-colors font-medium"
            >
              Cancel
            </Button>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
