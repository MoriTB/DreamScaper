import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { useAuth } from "@/lib/AuthProvider";
import { DreamCard } from "@/molecules/DreamCard";
import { SearchBar } from "@/molecules/SearchBar";
import { Heart, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function FavoritesPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  
  // Fetch user dreams
  const { data: dreams, isLoading } = useQuery({
    queryKey: ["/api/users", user?.id, "dreams"],
    enabled: !!user?.id,
  });
  
  // Filter for only favorited dreams and by search query
  const filteredDreams = dreams?.filter(dream => 
    dream.isFavorite && 
    (!searchQuery || 
      dream.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dream.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dream.interpretation?.interpretation?.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];
  
  // Sort dreams based on selected option
  const sortedDreams = [...filteredDreams].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortBy === "alphabetical") {
      return (a.title || "").localeCompare(b.title || "");
    }
    return 0;
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-16">
        <div className="mb-8 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center"
            >
              <Heart className="w-7 h-7 text-pink-500 mr-2" />
              <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
                Favorite Dreams
              </h1>
            </motion.div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <SearchBar 
                onSearch={setSearchQuery} 
                placeholder="Search favorites..." 
                className="flex-1"
              />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Filter className="h-4 w-4" />
                    <span className="hidden sm:inline-block">Sort</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className={cn(sortBy === "newest" && "bg-purple-50 dark:bg-purple-900/20")}
                    onClick={() => setSortBy("newest")}
                  >
                    Newest first
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={cn(sortBy === "oldest" && "bg-purple-50 dark:bg-purple-900/20")}
                    onClick={() => setSortBy("oldest")}
                  >
                    Oldest first
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={cn(sortBy === "alphabetical" && "bg-purple-50 dark:bg-purple-900/20")}
                    onClick={() => setSortBy("alphabetical")}
                  >
                    Alphabetical
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, index) => (
                <div 
                  key={index} 
                  className="h-64 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse"
                />
              ))}
            </div>
          ) : sortedDreams.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {sortedDreams.map((dream) => (
                <motion.div key={dream.id} variants={itemVariants}>
                  <DreamCard
                    dream={dream}
                    interpretation={dream.interpretation}
                    imageGeneration={dream.imageGeneration}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="flex flex-col items-center justify-center py-16 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Heart className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mb-4" />
              <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                No favorite dreams yet
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400 max-w-md">
                Mark dreams as favorites to easily find them here. Click the heart icon on any dream to add it to your favorites.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
}