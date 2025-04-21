import { Home, Archive, PlusCircle, BarChart2, User, Moon } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface MobileNavigationProps {
  onAddClick?: () => void;
}

export function MobileNavigation({ onAddClick }: MobileNavigationProps) {
  const [location] = useLocation();
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  
  // Define nav items directly in the component for more control
  const NAV_ITEMS = [
    { label: "Home", icon: Home, path: "/" },
    { label: "Dreams", icon: Archive, path: "/all-dreams" },
    { label: "Record", icon: PlusCircle, path: "/record", isAction: true },
    { label: "Insights", icon: BarChart2, path: "/insights" },
    { label: "Profile", icon: User, path: "/profile" },
  ];
  
  // Optimized smooth scroll detection
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let scrollTimer: number | null = null;
    let isScrolling = false;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      isScrolling = true;
      
      // At bottom of page, always show the nav regardless of direction
      if ((window.innerHeight + currentScrollY) >= document.body.offsetHeight - 60) {
        if (scrollTimer) clearTimeout(scrollTimer);
        setHidden(false);
        lastScrollY = currentScrollY;
        return;
      }
      
      // At top of page, always show the nav
      if (currentScrollY < 100) {
        if (scrollTimer) clearTimeout(scrollTimer);
        setHidden(false);
        lastScrollY = currentScrollY;
        return;
      }
      
      // Real-time direction detection with small threshold
      const delta = currentScrollY - lastScrollY;
      
      // Ignore very small movements to prevent jumpy behavior
      if (Math.abs(delta) < 10) {
        lastScrollY = currentScrollY;
        return;
      }
      
      // Scrolling down - hide nav after a short delay
      if (delta > 0) {
        if (scrollTimer) clearTimeout(scrollTimer);
        
        // Wait briefly before hiding to avoid jumpy behavior during momentum scrolling
        scrollTimer = window.setTimeout(() => {
          setHidden(true);
        }, 150);
      } 
      // Scrolling up - show nav immediately for responsive feel
      else if (delta < 0) {
        if (scrollTimer) clearTimeout(scrollTimer);
        setHidden(false);
      }
      
      // Update last position
      lastScrollY = currentScrollY;
    };
    
    // Use passive event for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Add touchmove handler for better mobile experience
    const handleTouchMove = () => {
      isScrolling = true;
    };
    
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    
    // Add end of scroll detection to ensure nav is visible when scrolling stops
    const handleScrollEnd = () => {
      if (isScrolling) {
        isScrolling = false;
        
        // If user is near bottom or scrolling up when stopping, ensure nav is visible
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100 ||
            window.scrollY < lastScrollY) {
          setHidden(false);
        }
      }
    };
    
    window.addEventListener('touchend', handleScrollEnd, { passive: true });
    window.addEventListener('scroll', () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(handleScrollEnd, 150);
    }, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleScrollEnd);
      if (scrollTimer) clearTimeout(scrollTimer);
    };
  }, []);
  
  // Animation variants
  const navVariants = {
    visible: { 
      y: 0,
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 30,
        duration: 0.2
      }
    },
    hidden: { 
      y: 100, 
      opacity: 0,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 30,
        duration: 0.2
      }
    }
  };
  
  // Subtle hover animations
  const itemVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.1, y: -3 },
    tap: { scale: 0.95 }
  };
  
  // Ripple animation for active item
  const activeItemVariants = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.15, 1],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: "mirror" as const
      }
    }
  };

  // Floating animation for record button
  const recordButtonVariants = {
    initial: { y: 0 },
    animate: {
      y: [0, -6, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "mirror" as const,
        ease: "easeInOut"
      }
    },
    hover: { 
      scale: 1.1,
      boxShadow: "0 0 25px 5px rgba(139, 92, 246, 0.5)",
      transition: { type: "spring", stiffness: 400, damping: 10 }
    },
    tap: { scale: 0.95 }
  };

  return (
    <motion.nav 
      variants={navVariants}
      initial="visible"
      animate={hidden ? "hidden" : "visible"}
      className="md:hidden fixed bottom-0 inset-x-0 z-50"
    >
      {/* Blurred background with gradient */}
      <div className="absolute inset-0 backdrop-blur-xl bg-white/70 dark:bg-neutral-900/80 border-t border-neutral-200/70 dark:border-neutral-800/70 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.25)]"></div>
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-evenly px-3 py-3">
        {NAV_ITEMS.map((item, index) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          if (item.isAction) {
            return (
              <Link href={item.path} key={index}>
                <a className="relative flex flex-col items-center justify-center">
                  <motion.div
                    variants={recordButtonVariants}
                    initial="initial"
                    animate="animate"
                    whileHover="hover"
                    whileTap="tap"
                    className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg -mt-8"
                  >
                    {/* Animated glow effect */}
                    <div className="absolute w-full h-full rounded-full bg-purple-500 opacity-20 blur-md animate-pulse"></div>
                    <Icon size={26} />
                  </motion.div>
                  <span className="text-xs font-medium mt-1 text-purple-600 dark:text-purple-400">
                    {item.label}
                  </span>
                </a>
              </Link>
            );
          }
          
          return (
            <Link href={item.path} key={index}>
              <a className="flex flex-col items-center py-1 px-1">
                <motion.div
                  className="relative"
                  variants={itemVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {isActive && (
                    <motion.div
                      variants={activeItemVariants}
                      initial="initial"
                      animate="animate"
                      className="absolute inset-0 rounded-full bg-purple-500/20 dark:bg-purple-500/30 blur-sm -z-10"
                    />
                  )}
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                    isActive 
                      ? "text-purple-600 dark:text-purple-400 bg-purple-100/60 dark:bg-purple-900/30" 
                      : "text-neutral-600 dark:text-neutral-300"
                  )}>
                    <Icon size={20} />
                  </div>
                </motion.div>
                <span className={cn(
                  "text-xs mt-1 font-medium transition-colors",
                  isActive 
                    ? "text-purple-600 dark:text-purple-400" 
                    : "text-neutral-500 dark:text-neutral-400"
                )}>
                  {item.label}
                </span>
              </a>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
