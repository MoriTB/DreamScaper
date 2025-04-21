import { useState, useEffect, useRef, useCallback } from 'react';

interface UseMediaRecorderProps {
  onRecordingComplete?: (blob: Blob) => void;
  maxDurationMs?: number;
  silenceTimeoutMs?: number;
}

interface UseMediaRecorderReturn {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  recordingBlob?: Blob;
  error?: string;
}

export function useMediaRecorder({
  onRecordingComplete,
  maxDurationMs = 10 * 60 * 1000, // 10 minutes default
  silenceTimeoutMs = 30 * 1000, // 30 seconds of silence
}: UseMediaRecorderProps = {}): UseMediaRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingBlob, setRecordingBlob] = useState<Blob | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const silenceTimeoutRef = useRef<number | null>(null);
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const silenceDetectorIntervalRef = useRef<number | null>(null);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (silenceTimeoutRef.current) window.clearTimeout(silenceTimeoutRef.current);
      if (silenceDetectorIntervalRef.current) window.clearInterval(silenceDetectorIntervalRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);
  
  // Function to detect silence
  const setupSilenceDetection = useCallback((stream: MediaStream) => {
    // Create audio context and analyser
    audioContextRef.current = new AudioContext();
    audioAnalyserRef.current = audioContextRef.current.createAnalyser();
    
    // Connect stream to analyser
    const source = audioContextRef.current.createMediaStreamSource(stream);
    source.connect(audioAnalyserRef.current);
    
    // Configure analyser
    audioAnalyserRef.current.fftSize = 256;
    const bufferLength = audioAnalyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    let silenceStartTime: number | null = null;
    
    // Set up interval to check for silence
    silenceDetectorIntervalRef.current = window.setInterval(() => {
      if (!audioAnalyserRef.current || !isRecording || isPaused) return;
      
      audioAnalyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      
      // Threshold for silence (may need adjustment)
      const isSilent = average < 10;
      
      if (isSilent) {
        if (!silenceStartTime) {
          silenceStartTime = Date.now();
        } else if (Date.now() - silenceStartTime > silenceTimeoutMs) {
          // Stop recording after silence threshold
          stopRecording();
        }
      } else {
        silenceStartTime = null;
      }
    }, 500); // Check every half second
  }, [isRecording, isPaused, silenceTimeoutMs]);
  
  // Start recording function
  const startRecording = async () => {
    try {
      recordedChunks.current = [];
      setError(undefined);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      setupSilenceDetection(stream);
      
      mediaRecorder.current = new MediaRecorder(stream);
      
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };
      
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: 'audio/webm' });
        setRecordingBlob(blob);
        
        if (onRecordingComplete) {
          onRecordingComplete(blob);
        }
        
        // Stop all tracks on the stream
        stream.getTracks().forEach(track => track.stop());
        
        // Clean up timers
        if (timerRef.current) window.clearInterval(timerRef.current);
        if (silenceTimeoutRef.current) window.clearTimeout(silenceTimeoutRef.current);
        if (silenceDetectorIntervalRef.current) window.clearInterval(silenceDetectorIntervalRef.current);
        
        setIsRecording(false);
        setIsPaused(false);
      };
      
      // Start recording
      mediaRecorder.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Set up timer for recording duration
      timerRef.current = window.setInterval(() => {
        if (!isPaused) {
          setRecordingTime(prev => {
            // Check if we've reached max duration
            if ((prev + 1) * 1000 >= maxDurationMs) {
              stopRecording();
              return prev;
            }
            return prev + 1;
          });
        }
      }, 1000);
      
    } catch (err) {
      setError(`Could not start recording: ${(err as Error).message}`);
      console.error("Error starting recording:", err);
    }
  };
  
  // Stop recording function
  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      // Note: ondataavailable and onstop will be triggered automatically
    }
  };
  
  // Pause recording function
  const pauseRecording = () => {
    if (mediaRecorder.current && isRecording && !isPaused) {
      mediaRecorder.current.pause();
      setIsPaused(true);
    }
  };
  
  // Resume recording function
  const resumeRecording = () => {
    if (mediaRecorder.current && isRecording && isPaused) {
      mediaRecorder.current.resume();
      setIsPaused(false);
    }
  };
  
  return {
    isRecording,
    isPaused,
    recordingTime,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    recordingBlob,
    error
  };
}
