import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AudioWaveformProps {
  isRecording?: boolean;
  isActive?: boolean;
  className?: string;
}

export function AudioWaveform({
  isRecording = false,
  isActive = false,
  className,
}: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  
  useEffect(() => {
    let audioContext: AudioContext | null = null;
    
    const initAudio = async () => {
      if (isRecording) {
        try {
          // Get microphone stream
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          
          mediaStreamRef.current = stream;
          
          // Create audio context and analyzer
          audioContext = new AudioContext();
          analyserRef.current = audioContext.createAnalyser();
          
          // Connect stream to analyzer
          const source = audioContext.createMediaStreamSource(stream);
          source.connect(analyserRef.current);
          
          // Configure analyzer
          analyserRef.current.fftSize = 256;
          
          // Start drawing
          drawWaveform();
        } catch (err) {
          console.error("Error accessing microphone:", err);
        }
      } else {
        // Clean up if not recording
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
        }
        
        if (audioContext) {
          audioContext.close();
        }
      }
    };
    
    initAudio();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [isRecording]);
  
  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      if (!analyserRef.current) return;
      
      animationRef.current = requestAnimationFrame(draw);
      
      analyserRef.current.getByteTimeDomainData(dataArray);
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0)';
      ctx.clearRect(0, 0, width, height);
      
      ctx.lineWidth = 2;
      ctx.strokeStyle = isActive 
        ? 'rgb(147, 51, 234)' // purple-600
        : 'rgb(168, 162, 158)'; // neutral-400
      
      ctx.beginPath();
      
      const sliceWidth = width / bufferLength;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * height / 2;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        
        x += sliceWidth;
      }
      
      ctx.lineTo(width, height / 2);
      ctx.stroke();
    };
    
    draw();
  };
  
  // For non-recording state, just show a flat or animated line
  useEffect(() => {
    if (!isRecording && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const width = canvas.width;
      const height = canvas.height;
      
      let phase = 0;
      
      const drawStaticWave = () => {
        ctx.clearRect(0, 0, width, height);
        
        ctx.lineWidth = 2;
        ctx.strokeStyle = isActive 
          ? 'rgb(147, 51, 234)' // purple-600
          : 'rgb(168, 162, 158)'; // neutral-400
        
        ctx.beginPath();
        
        // Draw a flat line with small sine wave if active
        const amplitude = isActive ? 10 : 2;
        const frequency = 0.05;
        
        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.sin(x * frequency + phase) * amplitude;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.stroke();
        
        if (isActive) {
          phase += 0.05;
          animationRef.current = requestAnimationFrame(drawStaticWave);
        }
      };
      
      drawStaticWave();
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [isRecording, isActive]);
  
  return (
    <canvas
      ref={canvasRef}
      className={cn("w-full h-24", className)}
      width={300}
      height={100}
    />
  );
}
