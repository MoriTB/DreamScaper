import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AudioWaveform } from "@/atoms/AudioWaveform";
import { useMediaRecorder } from "@/lib/useMediaRecorder";
import { formatDuration } from "@/lib/utils";
import { Mic, Square, Pause, Play, Waves, MicOff, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  maxDuration?: number; // in seconds
  className?: string;
}

export function VoiceRecorder({
  onRecordingComplete,
  maxDuration = 600, // 10 minutes by default
  className,
}: VoiceRecorderProps) {
  const {
    isRecording,
    isPaused,
    recordingTime,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    recordingBlob,
    error,
  } = useMediaRecorder({
    onRecordingComplete,
    maxDurationMs: maxDuration * 1000,
    silenceTimeoutMs: 30 * 1000, // 30 seconds silence detection
  });
  
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioPermissionDenied, setAudioPermissionDenied] = useState(false);
  
  // Create URL for the recording blob
  useEffect(() => {
    if (recordingBlob) {
      const url = URL.createObjectURL(recordingBlob);
      setAudioUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [recordingBlob]);
  
  const handleStartRecording = async () => {
    try {
      await startRecording();
      setAudioPermissionDenied(false);
    } catch (err) {
      if (err instanceof Error && err.name === "NotAllowedError") {
        setAudioPermissionDenied(true);
      }
      console.error("Failed to start recording:", err);
    }
  };

  // Animation variants
  const pulseVariants = {
    recording: {
      scale: [1, 1.05, 1],
      opacity: [0.9, 1, 0.9],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    idle: {
      scale: 1,
      opacity: 1
    }
  };

  const contentVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: 0.2,
        duration: 0.3
      }
    },
    exit: { 
      opacity: 0, 
      y: -10,
      transition: {
        duration: 0.2
      }
    }
  };
  
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 bg-gradient-to-b from-white to-purple-50 dark:from-neutral-800 dark:to-neutral-900 rounded-xl text-center shadow-lg",
      className
    )}>
      {/* Glowing background effect for recording state */}
      {isRecording && !isPaused && (
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-indigo-500/5 to-purple-500/5 animate-pulse" />
        </div>
      )}
      
      <motion.div 
        variants={pulseVariants}
        animate={isRecording && !isPaused ? "recording" : "idle"}
        className="relative mb-5"
      >
        <div className={cn(
          "w-28 h-28 rounded-full flex items-center justify-center",
          isRecording 
            ? "bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/40 dark:to-indigo-900/40" 
            : "bg-gradient-to-br from-neutral-100 to-purple-50 dark:from-neutral-800/60 dark:to-purple-900/20"
        )}>
          {/* Rings that appear during recording */}
          {isRecording && !isPaused && (
            <>
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: [0.8, 1.8], 
                  opacity: [0.6, 0],
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeOut"
                }}
                className="absolute w-full h-full rounded-full border-2 border-purple-400/30 dark:border-purple-500/30"
              />
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: [0.8, 1.5], 
                  opacity: [0.6, 0],
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  delay: 0.5,
                  ease: "easeOut"
                }}
                className="absolute w-full h-full rounded-full border-2 border-indigo-400/30 dark:border-indigo-500/30"
              />
            </>
          )}
          
          <Button
            onClick={isRecording ? stopRecording : handleStartRecording}
            className={cn(
              "w-20 h-20 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95",
              isRecording
                ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            )}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
          >
            {isRecording ? (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <Square className="h-7 w-7" />
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Mic className="h-7 w-7" />
              </motion.div>
            )}
          </Button>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {audioPermissionDenied ? (
          <motion.div
            key="permission-denied"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="max-w-md space-y-3"
          >
            <div className="flex items-center justify-center gap-2 text-red-500">
              <AlertCircle className="h-5 w-5" />
              <h3 className="font-medium">Microphone Access Denied</h3>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Please allow microphone access in your browser settings to record your dream.
            </p>
            <Button
              variant="outline"
              onClick={handleStartRecording}
              className="mt-3"
            >
              Try Again
            </Button>
          </motion.div>
        ) : isRecording ? (
          <motion.div
            key="recording"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full max-w-md"
          >
            <h3 className="font-medium text-lg flex items-center justify-center gap-2 mb-2">
              {isPaused ? (
                <>
                  <Pause className="h-4 w-4 text-amber-500" />
                  <span>Recording Paused</span>
                </>
              ) : (
                <>
                  <Waves className="h-4 w-4 text-red-500 animate-pulse" />
                  <span>Recording Your Dream</span>
                </>
              )}
            </h3>
            
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-5 max-w-md">
              {isPaused 
                ? "Recording paused. Press resume when you're ready to continue."
                : "Speak clearly about your dream. Recording will automatically stop after 30 seconds of silence."}
            </p>
            
            <div className="mb-6 w-full">
              <AudioWaveform
                isRecording={isRecording && !isPaused}
                isActive={isRecording}
                className="mb-3 h-16 mx-auto"
              />
              
              <div className="bg-neutral-100 dark:bg-neutral-800/50 rounded-full h-3 overflow-hidden">
                <Progress 
                  value={(recordingTime / maxDuration) * 100} 
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                />
              </div>
              
              <div className="flex justify-between mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                <div className="flex items-center gap-1">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    isPaused 
                      ? "bg-amber-500" 
                      : "bg-red-500 animate-pulse"
                  )} />
                  <span>{formatDuration(recordingTime)}</span>
                </div>
                <span>{formatDuration(maxDuration)} max</span>
              </div>
            </div>
            
            <div className="flex justify-center gap-3">
              <Button
                variant="secondary"
                onClick={isPaused ? resumeRecording : pauseRecording}
                className="bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 shadow-sm"
              >
                {isPaused ? (
                  <span className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Resume
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Pause className="h-4 w-4" />
                    Pause
                  </span>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={stopRecording}
                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/50"
              >
                <span className="flex items-center gap-2">
                  <Square className="h-4 w-4" />
                  Stop
                </span>
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="pre-recording"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="max-w-md"
          >
            <h3 className="font-medium text-lg mb-2">Press the mic to start recording</h3>
            
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
              Speak naturally about your dream. The recording will automatically pause after 30 seconds of silence and stop after 10 minutes.
            </p>
            
            <div className="mt-4 flex items-center gap-2 justify-center text-xs text-neutral-600 dark:text-neutral-400">
              <Mic className="h-4 w-4" />
              <span>Microphone ready</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500 mt-4 flex items-center gap-1"
        >
          <AlertCircle className="h-4 w-4" />
          {error}
        </motion.p>
      )}
    </div>
  );
}
