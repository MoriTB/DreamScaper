import { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mic, BookOpen, Sparkles, Moon, Star } from "lucide-react";
import { cn, getDynamicTimeColor } from "@/lib/utils";

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
  const controls = useAnimation();
  const cardRef = useRef<HTMLDivElement>(null);
  const [time, setTime] = useState(new Date());
  const [greeting, setGreeting] = useState("");
  const [timeBasedBg, setTimeBasedBg] = useState(getDynamicTimeColor());
  
  // Update the time based greeting
  useEffect(() => {
    const hour = time.getHours();
    
    if (hour >= 5 && hour < 12) {
      setGreeting("Good morning");
    } else if (hour >= 12 && hour < 17) {
      setGreeting("Good afternoon");
    } else if (hour >= 17 && hour < 21) {
      setGreeting("Good evening");
    } else {
      setGreeting("Good night");
    }
    
    // Update every minute
    const timeInterval = setInterval(() => {
      const newTime = new Date();
      setTime(newTime);
      setTimeBasedBg(getDynamicTimeColor());
    }, 60000);
    
    return () => clearInterval(timeInterval);
  }, [time]);
  
  // Animate when in view
  useEffect(() => {
    controls.start({
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    });
  }, [controls]);
  
  // Button hover animation variants
  const buttonVariants = {
    idle: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 10 
      }
    },
    tap: { scale: 0.98 }
  };
  
  // For particle animation
  const particles = Array.from({ length: 12 }).map((_, i) => (
    <motion.div
      key={i}
      className="absolute rounded-full bg-purple-500/20 dark:bg-purple-500/30"
      style={{
        width: Math.random() * 6 + 2,
        height: Math.random() * 6 + 2,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
      animate={{
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        opacity: [0.4, 0.8, 0.4],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 10 + Math.random() * 10,
        repeat: Infinity,
        repeatType: "reverse",
      }}
    />
  ));
  
  return (
    <motion.div
      ref={cardRef}
      initial={{ y: 20, opacity: 0 }}
      animate={controls}
      className={cn(
        "rounded-2xl mb-8 overflow-hidden border border-neutral-200/50 dark:border-neutral-800/50 shadow-xl relative",
        className
      )}
    >
      <div className="flex flex-col md:flex-row">
        {/* Content Area */}
        <div className="p-6 md:p-8 flex-1 backdrop-blur-sm bg-white/80 dark:bg-neutral-900/80 relative">
          <div className="absolute inset-0 overflow-hidden">
            {particles}
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <motion.div
                initial={{ scale: 0.8, rotate: -5 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.1,
                }}
                className="rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 p-2 shadow-md"
              >
                <Moon className="h-5 w-5 text-white" />
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-sm font-medium text-neutral-600 dark:text-neutral-400"
              >
                Dreamscape Journal
              </motion.div>
            </div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 dark:from-purple-400 dark:via-violet-400 dark:to-indigo-400"
            >
              {greeting}, {username}
            </motion.h2>
            
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-2 text-neutral-600 dark:text-neutral-300 flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Your dreamscape awaits. What did you dream about today?</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-6 flex flex-wrap gap-4"
            >
              <motion.div
                variants={buttonVariants}
                initial="idle"
                whileHover="hover"
                whileTap="tap"
              >
                <Button 
                  onClick={onRecordClick}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md px-5 py-6 h-auto"
                  size="lg"
                >
                  <Mic className="mr-2 h-5 w-5" />
                  Record Dream
                </Button>
              </motion.div>
              
              <motion.div
                variants={buttonVariants}
                initial="idle"
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  onClick={onTextEntryClick}
                  variant="outline"
                  className="border-2 border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600 bg-white/50 hover:bg-white/80 dark:bg-neutral-800/50 dark:hover:bg-neutral-800/80 backdrop-blur-sm text-neutral-800 dark:text-neutral-200 shadow-sm px-5 py-6 h-auto"
                  size="lg"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Write Dream
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
        
        {/* Decorative Side Image */}
        <div 
          className="hidden md:block w-[300px] relative bg-cover bg-center overflow-hidden"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${timeBasedBg} opacity-90`}></div>
          
          {/* Create stars */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 3 + 1,
                height: Math.random() * 3 + 1,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.4, 1, 0.4],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          ))}
          
          {/* Moon */}
          <motion.div 
            className="absolute w-16 h-16 rounded-full bg-white shadow-lg left-1/2 top-[40%] -translate-x-1/2"
            animate={{
              y: [0, -8, 0],
              boxShadow: [
                "0 0 20px 5px rgba(255,255,255,0.3)", 
                "0 0 25px 8px rgba(255,255,255,0.5)", 
                "0 0 20px 5px rgba(255,255,255,0.3)"
              ]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          
          {/* Cloud elements */}
          <motion.div
            className="absolute bottom-[30%] left-[20%] w-20 h-6 rounded-full bg-white/30 backdrop-blur-sm"
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
          />
          
          <motion.div
            className="absolute bottom-[25%] right-[15%] w-16 h-5 rounded-full bg-white/20 backdrop-blur-sm"
            animate={{ x: [0, -10, 0] }}
            transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
          />
          
          {/* Mountains */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-purple-900/80 to-transparent" />
          <div className="absolute bottom-0 left-10 right-10 h-12 bg-gradient-to-t from-purple-950/90 to-transparent" />
        </div>
      </div>
    </motion.div>
  );
}
