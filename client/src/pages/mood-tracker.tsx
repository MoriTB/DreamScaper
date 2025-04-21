import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { useAuth } from "@/lib/AuthProvider";
import { 
  SmilePlus, 
  Smile, 
  Meh, 
  Frown, 
  BarChart2, 
  Calendar,
  GripHorizontal,
  Sun,
  Moon,
  Lightbulb
} from "lucide-react";
import { motion } from "framer-motion";
import { format, parseISO, subDays, eachDayOfInterval } from "date-fns";
import { cn, formatDate } from "@/lib/utils";

// For visualization
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";

import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";

import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";

// Map mood values to descriptive names and colors
const MOOD_MAP = {
  4: { label: "Ecstatic", color: "bg-green-500", textColor: "text-green-500" },
  3: { label: "Happy", color: "bg-emerald-400", textColor: "text-emerald-400" },
  2: { label: "Neutral", color: "bg-blue-400", textColor: "text-blue-400" },
  1: { label: "Sad", color: "bg-amber-400", textColor: "text-amber-400" },
  0: { label: "Distressed", color: "bg-red-500", textColor: "text-red-500" },
};

// Map dominant emotions to icons and colors
const EMOTION_ICONS = {
  "joy": { icon: SmilePlus, color: "text-green-500" },
  "happiness": { icon: Smile, color: "text-emerald-400" },
  "calm": { icon: Sun, color: "text-blue-400" },
  "excitement": { icon: Lightbulb, color: "text-yellow-500" },
  "anxiety": { icon: GripHorizontal, color: "text-orange-500" },
  "fear": { icon: Moon, color: "text-indigo-500" },
  "sadness": { icon: Frown, color: "text-amber-500" },
  "anger": { icon: Frown, color: "text-red-500" },
};

export default function MoodTrackerPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<"weekly" | "monthly" | "yearly">("weekly");
  
  // Fetch user dreams with emotions data
  const { data: dreams, isLoading } = useQuery({
    queryKey: ["/api/users", user?.id, "dreams"],
    enabled: !!user?.id,
  });

  // Extract mood data from dreams
  const moodData = dreams?.map(dream => {
    // Calculate a mock mood score based on positive/negative emotions
    // In a real app, this would come from user input or sentiment analysis
    const emotions = dream.interpretation?.insights?.emotions || [];
    
    // Sample logic to calculate mood (simplified)
    const positiveEmotions = ["joy", "happiness", "excitement", "peace", "calm"];
    const negativeEmotions = ["fear", "anxiety", "sadness", "anger", "distress"];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    emotions.forEach(emotion => {
      const lowerEmotion = emotion.toLowerCase();
      if (positiveEmotions.some(e => lowerEmotion.includes(e))) positiveCount++;
      if (negativeEmotions.some(e => lowerEmotion.includes(e))) negativeCount++;
    });
    
    // Calculate mood score (0-4 scale)
    let moodScore = 2; // Default neutral
    if (positiveCount > negativeCount) {
      moodScore = positiveCount > 2 ? 4 : 3;
    } else if (negativeCount > positiveCount) {
      moodScore = negativeCount > 2 ? 0 : 1;
    }
    
    // Get dominant emotion (just taking first available one for demo)
    const dominantEmotion = emotions[0]?.toLowerCase() || "neutral";
    
    return {
      date: dream.dreamDate || dream.createdAt,
      moodScore,
      dominantEmotion,
      dreamId: dream.id,
      dreamTitle: dream.title,
      emotions
    };
  }) || [];

  // Prepare data for the time-based visualizations
  const getTimeRangeData = () => {
    const endDate = new Date();
    let startDate;
    
    if (viewMode === "weekly") {
      startDate = subDays(endDate, 7);
    } else if (viewMode === "monthly") {
      startDate = subDays(endDate, 30);
    } else {
      startDate = subDays(endDate, 365);
    }
    
    // Generate array of all days in the range
    const daysInRange = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Create default data with all days
    const defaultData = daysInRange.map(date => ({
      date: format(date, 'yyyy-MM-dd'),
      moodScore: null, // No mood recorded
      moodLabel: "No record"
    }));
    
    // Fill in with actual mood data where available
    moodData.forEach(mood => {
      const moodDate = format(new Date(mood.date), 'yyyy-MM-dd');
      const dayIndex = defaultData.findIndex(d => d.date === moodDate);
      
      if (dayIndex !== -1) {
        defaultData[dayIndex].moodScore = mood.moodScore;
        defaultData[dayIndex].moodLabel = MOOD_MAP[mood.moodScore as keyof typeof MOOD_MAP]?.label || "Neutral";
        defaultData[dayIndex].dominantEmotion = mood.dominantEmotion;
        defaultData[dayIndex].dreamId = mood.dreamId;
        defaultData[dayIndex].dreamTitle = mood.dreamTitle;
      }
    });
    
    return defaultData;
  };

  const chartData = getTimeRangeData();

  // Get all dates that have mood data for calendar highlighting
  const moodDates = moodData.map(mood => {
    const date = new Date(mood.date);
    return date;
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const moodInfo = MOOD_MAP[data.moodScore as keyof typeof MOOD_MAP];
      
      return (
        <div className="p-3 bg-white dark:bg-neutral-800 shadow-lg rounded-lg border border-neutral-200 dark:border-neutral-700">
          <p className="text-sm font-medium">{format(new Date(data.date), 'MMM d, yyyy')}</p>
          {data.moodScore !== null ? (
            <>
              <p className={cn("text-base font-semibold", moodInfo?.textColor)}>
                {moodInfo?.label}
              </p>
              {data.dreamTitle && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Dream: {data.dreamTitle}
                </p>
              )}
            </>
          ) : (
            <p className="text-neutral-500 dark:text-neutral-400">No mood data</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Function to select appropriate colors for calendar day
  const getDayClass = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const moodEntry = chartData.find(d => d.date === dateStr);
    
    if (!moodEntry || moodEntry.moodScore === null) return "";
    
    const moodInfo = MOOD_MAP[moodEntry.moodScore as keyof typeof MOOD_MAP];
    return moodInfo?.color || "";
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-16">
        <div className="mb-8 pt-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center mb-6"
          >
            <BarChart2 className="w-7 h-7 text-blue-500 mr-2" />
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              Mood Tracker
            </h1>
          </motion.div>
          
          <Tabs defaultValue="chart" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="chart">Analytics</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chart" className="space-y-6">
              <motion.div 
                className="p-4 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700"
                variants={itemVariants}
                initial="hidden"
                animate="show"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Mood Over Time</h3>
                  <div className="flex gap-2">
                    <Badge 
                      variant={viewMode === "weekly" ? "default" : "outline"}
                      onClick={() => setViewMode("weekly")}
                      className="cursor-pointer"
                    >
                      Week
                    </Badge>
                    <Badge 
                      variant={viewMode === "monthly" ? "default" : "outline"}
                      onClick={() => setViewMode("monthly")}
                      className="cursor-pointer"
                    >
                      Month
                    </Badge>
                    <Badge 
                      variant={viewMode === "yearly" ? "default" : "outline"}
                      onClick={() => setViewMode("yearly")}
                      className="cursor-pointer"
                    >
                      Year
                    </Badge>
                  </div>
                </div>
                
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0.2}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => format(new Date(date), viewMode === 'weekly' ? 'EEE' : 'MMM d')}
                        stroke="#888888"
                      />
                      <YAxis 
                        domain={[0, 4]} 
                        ticks={[0, 1, 2, 3, 4]}
                        tickFormatter={(value) => MOOD_MAP[value as keyof typeof MOOD_MAP]?.label.substring(0, 3) || ''}
                        stroke="#888888"
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="moodScore" 
                        stroke="#8884d8" 
                        fillOpacity={1} 
                        fill="url(#moodGradient)" 
                        strokeWidth={2}
                        connectNulls
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
              
              <motion.div
                className="p-4 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700"
                variants={itemVariants}
                initial="hidden"
                animate="show"
              >
                <h3 className="text-lg font-medium mb-4">Emotion Distribution</h3>
                <div className="flex flex-wrap gap-3 justify-center">
                  {Object.entries(EMOTION_ICONS).map(([emotion, { icon: Icon, color }]) => {
                    // Count occurrences of this emotion
                    const count = moodData.filter(m => 
                      m.emotions?.some(e => e.toLowerCase().includes(emotion.toLowerCase()))
                    ).length;
                    
                    if (count === 0) return null; // Don't show emotions that don't appear
                    
                    return (
                      <div 
                        key={emotion}
                        className="flex flex-col items-center p-3 rounded-lg bg-neutral-100 dark:bg-neutral-900 min-w-[100px]"
                      >
                        <Icon className={cn("w-8 h-8 mb-2", color)} />
                        <span className="text-sm font-medium capitalize">
                          {emotion}
                        </span>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          {count} {count === 1 ? 'dream' : 'dreams'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="calendar">
              <motion.div 
                className="p-4 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700"
                variants={itemVariants}
                initial="hidden"
                animate="show"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Dream Mood Calendar</h3>
                </div>
                
                <div className="flex justify-center">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    modifiersClassNames={{
                      selected: 'bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-50',
                    }}
                    components={{
                      DayContent: ({ date }) => {
                        const dateStr = format(date, 'yyyy-MM-dd');
                        const moodEntry = chartData.find(d => d.date === dateStr);
                        
                        return (
                          <div className="relative w-full h-full flex items-center justify-center">
                            {moodEntry && moodEntry.moodScore !== null && (
                              <div 
                                className={cn(
                                  "absolute inset-1 rounded-full opacity-40",
                                  MOOD_MAP[moodEntry.moodScore as keyof typeof MOOD_MAP]?.color
                                )}
                              />
                            )}
                            <span className={cn(
                              "relative z-10",
                              moodEntry && moodEntry.moodScore !== null 
                                ? "font-medium" 
                                : ""
                            )}>
                              {date.getDate()}
                            </span>
                          </div>
                        );
                      }
                    }}
                  />
                </div>
                
                {/* Dream details for selected date */}
                {selectedDate && (
                  <div className="mt-6">
                    <h4 className="text-md font-medium mb-2">
                      {format(selectedDate, 'MMMM d, yyyy')}
                    </h4>
                    
                    {(() => {
                      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
                      const selectedDayData = chartData.find(d => d.date === selectedDateStr);
                      
                      if (!selectedDayData || selectedDayData.moodScore === null) {
                        return (
                          <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg text-center">
                            <p className="text-neutral-500 dark:text-neutral-400">
                              No dreams recorded for this day
                            </p>
                          </div>
                        );
                      }
                      
                      const mood = MOOD_MAP[selectedDayData.moodScore as keyof typeof MOOD_MAP];
                      
                      return (
                        <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                          <div className="flex items-center mb-3">
                            <div className={cn("w-4 h-4 rounded-full mr-2", mood?.color)} />
                            <span className={cn("font-medium", mood?.textColor)}>
                              {mood?.label} mood
                            </span>
                          </div>
                          
                          {selectedDayData.dreamTitle && (
                            <p className="text-sm mb-2">
                              <span className="font-medium">Dream:</span> {selectedDayData.dreamTitle}
                            </p>
                          )}
                          
                          {selectedDayData.dominantEmotion && (
                            <p className="text-sm">
                              <span className="font-medium">Dominant emotion:</span> {selectedDayData.dominantEmotion}
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}