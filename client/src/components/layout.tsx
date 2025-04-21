import { ReactNode, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Header } from "@/organisms/Header";
import { Sidebar } from "@/organisms/Sidebar";
import { MobileNavigation } from "@/organisms/MobileNavigation";
import { useAuth } from "@/lib/AuthProvider";
import { motion } from "framer-motion";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  
  // If not logged in, redirect to login
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search functionality
    console.log("Searching for:", query);
  };
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  
  const handleAddClick = () => {
    navigate("/record");
  };
  
  if (!user) return null;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header
        username={user.name || user.username}
        avatarUrl={user.avatarUrl}
        onLogout={handleLogout}
        onSearch={handleSearch}
      />
      
      <div className="flex flex-1 pt-16">
        <Sidebar />
        
        <main className="flex-1 md:ml-64 pt-4 pb-20 md:pb-4 px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
      
      <MobileNavigation onAddClick={handleAddClick} />
    </div>
  );
}
