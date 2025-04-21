import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DreamFeed } from "@/organisms/DreamFeed";
import { useAuth } from "@/lib/AuthProvider";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export default function AllDreams() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // If not logged in, redirect to login
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);
  
  const handleRecordClick = () => {
    navigate("/record");
  };
  
  if (!user) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Dream Journal</h1>
        <Button 
          onClick={handleRecordClick}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Record New Dream
        </Button>
      </div>
      
      <DreamFeed
        userId={user.id}
        showViewAllButton={false}
      />
    </motion.div>
  );
}
