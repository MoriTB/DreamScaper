import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { SearchBar } from "@/molecules/SearchBar";
import { UserMenu } from "@/molecules/UserMenu";
import { ThemeToggle } from "@/atoms/ThemeToggle";
import { cn } from "@/lib/utils";

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
  const [location] = useLocation();
  
  // Add scroll event listener to create sticky effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return (
    <header 
      className={cn(
        "fixed top-0 inset-x-0 z-10 glass dark:glass-dark border-b border-neutral-200 dark:border-neutral-700 transition-shadow",
        scrolled && "shadow-sm"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-semibold text-purple-600 dark:text-purple-400">
            Dreamscape
          </Link>
        </div>
        
        <SearchBar
          onSearch={onSearch}
          className="hidden md:flex"
        />
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          <UserMenu
            username={username}
            avatarUrl={avatarUrl}
            onLogout={onLogout}
          />
        </div>
      </div>
    </header>
  );
}
