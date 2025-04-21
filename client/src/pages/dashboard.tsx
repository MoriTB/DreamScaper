import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { WelcomeCard } from "@/organisms/WelcomeCard";
import { QuickStats } from "@/organisms/QuickStats";
import { DreamFeed } from "@/organisms/DreamFeed";
import { InsightsTeaser } from "@/organisms/InsightsTeaser";
import { useAuth } from "@/lib/AuthProvider";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { DreamWithRelations } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // If not logged in, redirect to login
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);
  
  const { data: dreams } = useQuery<DreamWithRelations[]>({
    queryKey: [`/api/users/${user?.id}/dreams`],
    enabled: !!user,
  });
  
  const handleRecordClick = () => {
    navigate("/record");
  };
  
  const handleTextEntryClick = () => {
    navigate("/record?mode=text");
  };
  
  // Calculate stats
  const totalDreams = dreams?.length || 0;
  
  // Dreams in the last 7 days
  const weeklyDreams = dreams?.filter(d => {
    const dreamDate = new Date(d.dream.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return dreamDate >= weekAgo;
  }).length || 0;
  
  // Favorite dreams
  const favoriteDreams = dreams?.filter(d => d.dream.isFavorite).length || 0;
  
  // Calculate streak (days in a row with at least one dream)
  const calculateStreak = (): number => {
    if (!dreams || dreams.length === 0) return 0;
    
    const dreamDates = dreams.map(d => {
      const date = new Date(d.dream.createdAt);
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    });
    
    // Get unique dates
    const uniqueDates = [...new Set(dreamDates)];
    uniqueDates.sort().reverse(); // Most recent first
    
    let streak = 1;
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    
    // Check if there's a dream today
    if (uniqueDates[0] !== todayStr) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;
      
      // If no dream yesterday either, streak is 0
      if (uniqueDates[0] !== yesterdayStr) {
        return 0;
      }
    }
    
    // Count consecutive days
    for (let i = 1; i < uniqueDates.length; i++) {
      const currentDate = new Date(uniqueDates[i-1].split('-').map(Number) as [number, number, number]);
      currentDate.setDate(currentDate.getDate() - 1);
      const expectedPrevDate = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;
      
      if (uniqueDates[i] === expectedPrevDate) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
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
      <WelcomeCard 
        username={user.name || user.username}
        onRecordClick={handleRecordClick}
        onTextEntryClick={handleTextEntryClick}
      />
      
      <QuickStats
        totalDreams={totalDreams}
        weeklyDreams={weeklyDreams}
        favoriteDreams={favoriteDreams}
        streak={calculateStreak()}
      />
      
      {!dreams ? (
        <div className="space-y-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : (
        <DreamFeed 
          userId={user.id}
          limit={3}
          showViewAllButton={true}
        />
      )}
      
      <InsightsTeaser />
    </motion.div>
  );
}
