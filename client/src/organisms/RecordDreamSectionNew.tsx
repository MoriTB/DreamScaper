import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { VoiceRecorder } from "./VoiceRecorder";
import { TagChip } from "@/molecules/TagChip";
import { DREAM_STYLES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Mic, Type, Camera, Save, CheckCircle2, AlertCircle, PencilLine, Calendar } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface RecordDreamSectionProps {
  userId: number;
  onCancel: () => void;
  onSuccess: (dreamId?: number) => void;
  className?: string;
}

export function RecordDreamSectionNew({
  userId,
  onCancel,
  onSuccess,
  className,
}: RecordDreamSectionProps) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [mode, setMode] = useState<"voice" | "text">("voice");
  const [selectedStyle, setSelectedStyle] = useState<string>(DREAM_STYLES[0]);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [generatingTitle, setGeneratingTitle] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [step, setStep] = useState<"record" | "review" | "style">(mode === "voice" ? "record" : "review");
  const [dreamDate, setDreamDate] = useState<Date>(new Date());
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Handle mode switching
  useEffect(() => {
    if (mode === "voice") {
      setStep("record");
    } else {
      setStep("review");
    }
  }, [mode]);
  
  // Auto-generate title when transcription is received (simulated)
  useEffect(() => {
    if (transcription && mode === "voice") {
      // In a real app, we would call the AI to generate a title
      setGeneratingTitle(true);
      
      // Simulate AI generating a title
      setTimeout(() => {
        setGeneratingTitle(false);
        setContent(transcription);
        setStep("review");
      }, 1500);
    }
  }, [transcription, mode]);
  
  const { mutate: submitDream, isPending } = useMutation({
    mutationFn: async () => {
      setFormError(null);
      
      // For voice mode, we need a recording
      if (mode === "voice" && !recordingBlob && step === "record") {
        setFormError("Please record your dream first");
        throw new Error("Please record your dream first");
      }
      
      // For text mode or review step, we need content
      if ((mode === "text" || step === "review") && !content) {
        setFormError("Please describe your dream");
        throw new Error("Please enter your dream description");
      }
      
      const formData = new FormData();
      
      // We'll let AI generate the title based on content
      formData.append("title", "Dream on " + dreamDate.toLocaleDateString());
      formData.append("userId", userId.toString());
      formData.append("content", content);
      
      // Date of the dream
      formData.append("dreamDate", dreamDate.toISOString());
      
      // Let AI handle tagging automatically
      // formData.append("autoTag", "true");
      
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitDream();
  };
  
  const handleRecordingComplete = (blob: Blob) => {
    setRecordingBlob(blob);
    
    // In a real app, we would send this to the backend for transcription
    // For now, let's simulate a delay and then set a sample transcription
    setTimeout(() => {
      setTranscription("I was flying over a vast ocean, and then suddenly I was in a forest with talking animals. The sky was purple and I could feel the wind on my face. It was both exhilarating and terrifying at the same time.");
    }, 1500);
  };
  
  const handleEditTranscription = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };
  
  const handleDateChange = (date: string) => {
    setDreamDate(new Date(date));
  };
  
  const handleNext = () => {
    if (step === "record") {
      setStep("review");
    } else if (step === "review") {
      setStep("style");
    }
  };
  
  const handleBack = () => {
    if (step === "style") {
      setStep("review");
    } else if (step === "review") {
      setStep("record");
    }
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
  
  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
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
      x: -20,
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

  // Render style selection cards
  const renderStyleCards = () => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-4">
        {DREAM_STYLES.map((style) => (
          <div
            key={style}
            onClick={() => setSelectedStyle(style)}
            className={cn(
              "cursor-pointer rounded-lg p-3 text-center transition-all duration-200 transform hover:scale-[1.02] border-2",
              selectedStyle === style 
                ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30" 
                : "border-neutral-200 dark:border-neutral-800 hover:border-purple-300 dark:hover:border-purple-800"
            )}
          >
            <div className="aspect-square flex items-center justify-center rounded-md mb-2 overflow-hidden bg-white dark:bg-neutral-800">
              <div className={cn(
                "w-full h-full", 
                style === "realistic" && "bg-gradient-to-br from-blue-500 to-purple-600",
                style === "sketch" && "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJza2V0Y2giIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgcGF0dGVyblRyYW5zZm9ybT0icm90YXRlKDQ1KSI+PHBhdGggZD0iTTAgMCBMNTAgNTAgTTUwIDAgTDAgNTAiIHN0cm9rZT0iIzg4OCIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ3aGl0ZSIvPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjc2tldGNoKSIvPjwvc3ZnPg==')]",
                style === "watercolor" && "bg-gradient-to-br from-green-200 to-blue-300 opacity-70",
                style === "surreal" && "bg-gradient-to-r from-purple-300 via-pink-300 to-red-300",
                style === "psychedelic" && "bg-gradient-to-r from-yellow-300 via-pink-500 to-purple-600",
                style === "cosmic" && "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxyYWRpYWxHcmFkaWVudCBpZD0iY29zbWljIiBjeD0iNTAlIiBjeT0iNTAlIiByPSI3MCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMzMzAwNjYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwMDMzNjYiLz48L3JhZGlhbEdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2Nvc21pYykiLz48Y2lyY2xlIGN4PSIzMCUiIGN5PSI0MCUiIHI9IjIlIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC43Ii8+PGNpcmNsZSBjeD0iNzAlIiBjeT0iNjAlIiByPSIxJSIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuNSIvPjxjaXJjbGUgY3g9IjQwJSIgY3k9IjIwJSIgcj0iMC41JSIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuOCIvPjwvc3ZnPg==')]"
              )} 
            />
            </div>
            <div className="font-medium text-sm">
              {style.charAt(0).toUpperCase() + style.slice(1)}
            </div>
          </div>
        ))}
      </div>
    );
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
              Your dream has been recorded successfully. AI is now analyzing and generating visuals. Redirecting...
            </AlertDescription>
          </Alert>
        </motion.div>
      ) : (
        <motion.div 
          key="form"
          variants={formVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={cn("bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-xl border border-neutral-200 dark:border-neutral-800", className)}
        >
          {/* Mode Switcher Tabs */}
          <Tabs defaultValue={mode} onValueChange={(value) => setMode(value as "voice" | "text")} className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-medium">Record Dream</h2>
                <div className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">
                  <Calendar className="h-3.5 w-3.5" />
                  <input 
                    type="date" 
                    value={dreamDate.toISOString().split('T')[0]}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="bg-transparent focus:outline-none cursor-pointer"
                  />
                </div>
              </div>
              
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
          
          {/* Step-based UI */}
          <AnimatePresence mode="wait">
            {mode === "voice" && step === "record" && (
              <motion.div
                key="voice-record"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mt-2"
              >
                <VoiceRecorder 
                  onRecordingComplete={handleRecordingComplete}
                  className="mb-6"
                />
                
                {transcription && (
                  <div className="mt-4 flex justify-center">
                    <Button
                      type="button"
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-md"
                      onClick={handleNext}
                    >
                      Continue to Review
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
            
            {step === "review" && (
              <motion.div
                key="review"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="font-medium flex items-center gap-1.5">
                      <PencilLine className="h-4 w-4 text-purple-500" />
                      <span>Dream Description</span>
                    </h3>
                    {mode === "voice" && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleEditTranscription}
                        className="text-xs text-purple-600 dark:text-purple-400 h-7"
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                  
                  {generatingTitle ? (
                    <div className="flex items-center justify-center p-10">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                        <p className="text-sm text-neutral-500">Transcribing your dream...</p>
                      </div>
                    </div>
                  ) : (
                    <Textarea
                      ref={textareaRef}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Describe your dream in detail. What happened? How did you feel? Were there any symbols or recurring themes?"
                      className="w-full px-4 py-3 min-h-[180px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 
                                rounded-lg shadow-inner shadow-neutral-100 dark:shadow-black/10 placeholder-neutral-400 
                                focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      required
                    />
                  )}
                </div>
                
                <div className="mt-6 flex justify-between">
                  {mode === "voice" && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      className="px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-md"
                    >
                      Back to Recording
                    </Button>
                  )}
                  
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="ml-auto px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-md"
                  >
                    Choose Visualization Style
                  </Button>
                </div>
              </motion.div>
            )}
            
            {step === "style" && (
              <motion.div
                key="style"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="mb-4">
                  <h3 className="font-medium flex items-center gap-1.5 mb-2">
                    <Camera className="h-4 w-4 text-purple-500" />
                    <span>Choose Visualization Style</span>
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
                    Select how you want your dream to be visualized
                  </p>
                  
                  {renderStyleCards()}
                </div>
                
                <div className="mt-6 flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-md"
                  >
                    Back to Description
                  </Button>
                  
                  <Button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-md"
                  >
                    {isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving Dream...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        <span>Save Dream</span>
                      </div>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}