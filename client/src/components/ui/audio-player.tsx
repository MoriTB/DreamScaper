import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, Volume1, VolumeX } from "lucide-react";

interface AudioPlayerProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  duration?: number;
  compact?: boolean;
  onPlaybackComplete?: () => void;
}

export function AudioPlayer({
  src,
  duration,
  compact = false,
  onPlaybackComplete,
  className,
  ...props
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.volume = volume;
      
      // Set up event listeners
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      audioRef.current.addEventListener('ended', handleEnded);
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current = null;
      }
    };
  }, [src]);
  
  // Update audio src if it changes
  useEffect(() => {
    if (audioRef.current && audioRef.current.src !== src) {
      audioRef.current.src = src;
      setCurrentTime(0);
      setIsPlaying(false);
    }
  }, [src]);
  
  // Update volume if it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);
  
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
    if (onPlaybackComplete) {
      onPlaybackComplete();
    }
  };
  
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const handleTimeSliderChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };
  
  const handleVolumeSliderChange = (value: number[]) => {
    setVolume(value[0]);
    setIsMuted(value[0] === 0);
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const VolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className="h-4 w-4" />;
    if (volume < 0.5) return <Volume1 className="h-4 w-4" />;
    return <Volume2 className="h-4 w-4" />;
  };
  
  if (compact) {
    return (
      <div 
        className={cn(
          "flex items-center gap-3 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg",
          className
        )}
        {...props}
      >
        <Button 
          variant="ghost" 
          size="icon" 
          className="w-8 h-8 rounded-full bg-purple-600 text-white hover:bg-purple-700 hover:text-white"
          onClick={togglePlayPause}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        
        <div className="flex-1">
          <div className="h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500" 
              style={{ width: `${(currentTime / audioDuration) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(audioDuration)}</span>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700"
          onClick={toggleMute}
        >
          <VolumeIcon />
        </Button>
      </div>
    );
  }
  
  return (
    <div 
      className={cn("space-y-2", className)}
      {...props}
    >
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 rounded-full bg-purple-600 text-white hover:bg-purple-700 hover:text-white"
          onClick={togglePlayPause}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>
        
        <div className="flex-1">
          <Slider
            value={[currentTime]}
            min={0}
            max={audioDuration || 100}
            step={0.1}
            onValueChange={handleTimeSliderChange}
            className="mb-1"
          />
          
          <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(audioDuration)}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={toggleMute}
        >
          <VolumeIcon />
        </Button>
        
        <Slider
          value={[isMuted ? 0 : volume]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={handleVolumeSliderChange}
          className="w-24"
        />
      </div>
    </div>
  );
}
