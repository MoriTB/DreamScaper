import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Mic, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface WelcomeCardProps {
  username: string;
  onRecordClick: () => void;
  onTextEntryClick: () => void;
  className?: string;
}

export function WelcomeCard({
  username,
  onRecordClick,
  onTextEntryClick,
  className,
}: WelcomeCardProps) {
  return (
    <div className={cn("glass dark:glass-dark rounded-2xl mb-8 overflow-hidden", className)}>
      <div className="flex flex-col md:flex-row">
        <div className="p-6 md:p-8 flex-1">
          <h2 className="text-2xl font-medium text-neutral-800 dark:text-white">
            Welcome back, {username}
          </h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-300">
            Your dreamscape awaits. Record your dreams and discover hidden meanings.
          </p>
          
          <div className="mt-6 flex flex-wrap gap-4">
            <Button 
              onClick={onRecordClick}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Mic className="mr-2 h-4 w-4" />
              Record New Dream
            </Button>
            
            <Button
              onClick={onTextEntryClick}
              variant="outline"
              className="bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Text Entry
            </Button>
          </div>
        </div>
        
        <div 
          className="hidden md:block w-64 bg-cover bg-center"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80')"
          }}
        ></div>
      </div>
    </div>
  );
}
