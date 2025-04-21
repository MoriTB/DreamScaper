import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  src: string;
  duration?: number;
  className?: string;
}

export function AudioPlayer({ src, duration = 0, className }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio(src);
    
    // Set up event listeners
    const handleTimeUpdate = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    };
    
    const handleLoadedMetadata = () => {
      if (audioRef.current) {
        setAudioDuration(audioRef.current.duration);
      }
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    
    audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
    audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioRef.current.addEventListener('ended', handleEnded);
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audioRef.current.removeEventListener('ended', handleEnded);
      }
    };
  }, [src]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={cn("bg-neutral-100 dark:bg-neutral-800 rounded-lg p-3 flex items-center gap-3", className)}>
      <button 
        className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white"
        onClick={togglePlayPause}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
      
      <div className="flex-1">
        <div className="h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-purple-500" 
            style={{ width: `${(currentTime / audioDuration) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          <span>{formatDuration(currentTime)}</span>
          <span>{formatDuration(audioDuration)}</span>
        </div>
      </div>
      
      <button className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
        <Volume2 className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
      </button>
    </div>
  );
}
