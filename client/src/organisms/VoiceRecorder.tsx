import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AudioWaveform } from "@/atoms/AudioWaveform";
import { useMediaRecorder } from "@/lib/useMediaRecorder";
import { formatDuration } from "@/lib/utils";
import { Mic, Square, Pause, Play } from "lucide-react";
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
    await startRecording();
  };
  
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-6 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg text-center",
      className
    )}>
      <div className="mb-4 w-24 h-24 rounded-full flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 border-4 border-purple-200 dark:border-purple-800/50">
        <Button
          onClick={isRecording ? stopRecording : handleStartRecording}
          className={cn(
            "w-16 h-16 rounded-full shadow-lg",
            isRecording
              ? "bg-red-500 hover:bg-red-600"
              : "bg-purple-600 hover:bg-purple-700"
          )}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
        >
          {isRecording ? (
            <Square className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </Button>
      </div>
      
      <h3 className="font-medium">
        {isRecording 
          ? (isPaused ? "Recording paused" : "Recording...") 
          : "Press to start recording"}
      </h3>
      
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-md">
        {isRecording 
          ? "Speak clearly about your dream. Recording will stop after 30 seconds of silence."
          : "Speak naturally about your dream. The recording will automatically stop after 30 seconds of silence."}
      </p>
      
      {error && (
        <p className="text-sm text-red-500 mt-2">{error}</p>
      )}
      
      <div className="mt-4 w-full max-w-md">
        <AudioWaveform
          isRecording={isRecording && !isPaused}
          isActive={isRecording}
          className="mb-2"
        />
        
        <Progress 
          value={(recordingTime / maxDuration) * 100} 
          className="h-1.5 bg-neutral-200 dark:bg-neutral-700"
        />
        
        <div className="flex justify-between mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          <span>{formatDuration(recordingTime)}</span>
          <span>{formatDuration(maxDuration)} max</span>
        </div>
      </div>
      
      {isRecording && (
        <div className="mt-4 flex gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={isPaused ? resumeRecording : pauseRecording}
            className="bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700"
          >
            {isPaused ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}
            {isPaused ? "Resume" : "Pause"}
          </Button>
        </div>
      )}
    </div>
  );
}
