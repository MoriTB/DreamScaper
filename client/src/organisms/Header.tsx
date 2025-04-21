import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { SearchBar } from "@/molecules/SearchBar";
import { UserMenu } from "@/molecules/UserMenu";
import { ThemeToggle } from "@/atoms/ThemeToggle";
import { cn } from "@/lib/utils";
import { Moon, Star } from "lucide-react";

interface HeaderProps {
  username: string;
  avatarUrl?: string;
  onLogout: () => void;
  onSearch: (query: string) => void;
}

export function Header({
  username,
  avatarUrl,
  onLogout,
  onSearch,
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [location] = useLocation();
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  
  // Add smooth scroll listener with debouncing and direction detection
  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          // Determine if we've scrolled enough to change state
          const isScrolled = currentScrollY > 10;
          
          // Determine scroll direction
          if (currentScrollY > lastScrollY.current + 20) {
            setScrollDirection('down');
            
            // Only hide the header when scrolling down and past the threshold
            if (currentScrollY > 180) {
              setHidden(true);
            }
          } else if (currentScrollY < lastScrollY.current - 20) {
            setScrollDirection('up');
            setHidden(false);
          }
          
          // Update state
          if (isScrolled !== scrolled) {
            setScrolled(isScrolled);
          }
          
          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        
        ticking.current = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // Spring animation variants
  const navVariants = {
    visible: { 
      y: 0,
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 200, 
        damping: 30,
        duration: 0.2
      }
    },
    hidden: { 
      y: -70, 
      opacity: 0.7,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        duration: 0.2
      }
    }
  };

  // Add subtle floating animation to logo
  const logoVariants = {
    animate: {
      y: [0, -4, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        repeatType: "mirror" as const,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.header 
      variants={navVariants}
      initial="visible"
      animate={hidden ? "hidden" : "visible"}
      className={cn(
        "fixed top-0 inset-x-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-neutral-900/80 border-b transition-all duration-300",
        scrolled 
          ? "border-neutral-200/70 dark:border-neutral-800/70 shadow-lg" 
          : "border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
        <div className="flex items-center gap-2">
          <motion.div
            initial={false}
            variants={logoVariants}
            animate="animate"
            className="flex items-center"
          >
            <Link href="/" className="flex items-center gap-1.5">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <div className="absolute w-full h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 opacity-70 blur-sm"></div>
                <Moon className="relative z-10 w-5 h-5 text-white" />
                <Star className="absolute top-0 right-0 w-2.5 h-2.5 text-yellow-300" />
              </div>
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
                Dreamscape
              </span>
            </Link>
          </motion.div>
        </div>
        
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <SearchBar
              onSearch={onSearch}
              className="hidden md:flex"
            />
          </motion.div>
        </AnimatePresence>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          <UserMenu
            username={username}
            avatarUrl={avatarUrl}
            onLogout={onLogout}
          />
        </div>
      </div>
    </motion.header>
  );
}
