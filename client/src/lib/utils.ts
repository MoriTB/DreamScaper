import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date to a human-readable string
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM d, yyyy');
}

/**
 * Formats seconds into a readable duration string (e.g., "2m 30s")
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  if (mins === 0) {
    return `${secs}s`;
  }
  
  return `${mins}m ${secs}s`;
}

/**
 * Truncates text to a certain length and adds ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Gets initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Generates a random gradient
 */
export function getRandomGradient(): string {
  const gradients = [
    'from-purple-500 to-indigo-500',
    'from-blue-500 to-teal-400',
    'from-green-400 to-emerald-500',
    'from-yellow-400 to-orange-500',
    'from-pink-500 to-rose-400',
    'from-indigo-500 to-purple-500',
    'from-red-500 to-pink-500',
    'from-emerald-500 to-green-400',
    'from-teal-400 to-blue-500',
    'from-orange-500 to-yellow-400',
  ];
  
  return gradients[Math.floor(Math.random() * gradients.length)];
}

/**
 * Downloads an audio file
 */
export function downloadAudio(url: string, filename: string): void {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Applies 3D tilt effect to an element
 */
export function applyTiltEffect(element: HTMLElement, intensity: number = 25): () => void {
  const handleMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const xPercent = x / rect.width;
    const yPercent = y / rect.height;
    
    const xRotation = (0.5 - yPercent) * intensity;
    const yRotation = (xPercent - 0.5) * intensity;
    
    element.style.transform = `perspective(1000px) rotateX(${xRotation}deg) rotateY(${yRotation}deg) scale3d(1.02, 1.02, 1.02)`;
  };
  
  const handleMouseLeave = () => {
    element.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
  };
  
  element.addEventListener('mousemove', handleMouseMove);
  element.addEventListener('mouseleave', handleMouseLeave);
  
  // Return cleanup function
  return () => {
    element.removeEventListener('mousemove', handleMouseMove);
    element.removeEventListener('mouseleave', handleMouseLeave);
  };
}

/**
 * Creates a masked blur effect for a background element
 */
export function createBlurredBackground(container: HTMLElement, content: HTMLElement): (() => void) {
  const updateBlur = () => {
    const rect = content.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    // Calculate position relative to container
    const top = rect.top - containerRect.top;
    const left = rect.left - containerRect.left;
    
    // Apply mask style
    container.style.webkitMaskImage = `radial-gradient(circle at ${left + rect.width/2}px ${top + rect.height/2}px, transparent 0, transparent ${rect.width/2}px, black ${rect.width/2 + 50}px)`;
    container.style.maskImage = `radial-gradient(circle at ${left + rect.width/2}px ${top + rect.height/2}px, transparent 0, transparent ${rect.width/2}px, black ${rect.width/2 + 50}px)`;
  };
  
  // Initialize
  updateBlur();
  
  // Handle window resize
  window.addEventListener('resize', updateBlur);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('resize', updateBlur);
  };
}

/**
 * Applies a glass morphism effect
 */
export function applyGlassMorphism(element: HTMLElement): void {
  element.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
  element.style.backdropFilter = 'blur(10px)';
  // Apply webkit prefix with type assertion
  (element.style as any).webkitBackdropFilter = 'blur(10px)';
  element.style.borderRadius = '10px';
  element.style.border = '1px solid rgba(255, 255, 255, 0.1)';
  element.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
}

/**
 * Gets a color from the theme based on time of day
 */
export function getDynamicTimeColor(): string {
  const hour = new Date().getHours();
  
  // Dawn (5-8)
  if (hour >= 5 && hour < 8) {
    return 'from-orange-300 to-rose-300';
  }
  // Morning (8-12)
  if (hour >= 8 && hour < 12) {
    return 'from-blue-300 to-sky-400';
  }
  // Afternoon (12-17)
  if (hour >= 12 && hour < 17) {
    return 'from-blue-400 to-indigo-400';
  }
  // Evening (17-21)
  if (hour >= 17 && hour < 21) {
    return 'from-orange-400 to-purple-500';
  }
  // Night (21-5)
  return 'from-blue-900 to-purple-900';
}