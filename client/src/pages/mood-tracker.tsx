import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthProvider";
import {
  SmilePlus, Smile, Frown, BarChart2, GripHorizontal, Sun, Moon, Lightbulb,
} from "lucide-react";
import { motion } from "framer-motion";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { cn } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";

// Mood score mapping
const MOOD_MAP = {
  4: { label: "Ecstatic", color: "bg-green-500", textColor: "text-green-500" },
  3: { label: "Happy", color: "bg-emerald-400", textColor: "text-emerald-400" },
  2: { label: "Neutral", color: "bg-blue-400", textColor: "text-blue-400" },
  1: { label: "Sad", color: "bg-amber-400", textColor: "text-amber-400" },
  0: { label: "Distressed", color: "bg-red-500", textColor: "text-red-500" },
};

// Emotion icons
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

  const { data: dreams } = useQuery({
    queryKey: ["/api/users", user?.id, "dreams"],
    enabled: !!user?.id,
  });

  const moodData = dreams?.map(dream => {
    const emotions = dream.interpretation?.insights?.emotions || [];
    const positive = ["joy", "happiness", "excitement", "peace", "calm"];
    const negative = ["fear", "anxiety", "sadness", "anger", "distress"];
    let pos = 0, neg = 0;
    emotions.forEach(e => {
      const lower = e.toLowerCase();
      if (positive.some(p => lower.includes(p))) pos++;
      if (negative.some(n => lower.includes(n))) neg++;
    });
    let score = 2;
    if (pos > neg) score = pos > 2 ? 4 : 3;
    else if (neg > pos) score = neg > 2 ? 0 : 1;
    const dominantEmotion = emotions[0]?.toLowerCase() || "neutral";
    return {
      date: dream.dreamDate || dream.createdAt,
      moodScore: score,
      dominantEmotion,
      dreamId: dream.id,
      dreamTitle: dream.title,
      emotions,
    };
  }) || [];

  const getTimeRangeData = () => {
    const end = new Date();
    const start = viewMode === "weekly" ? subDays(end, 7)
      : viewMode === "monthly" ? subDays(end, 30)
      : subDays(end, 365);

    const days = eachDayOfInterval({ start, end });
    const defaultData = days.map(date => ({
      date: format(date, 'yyyy-MM-dd'),
      moodScore: null,
      moodLabel: "No record",
    }));

    moodData.forEach(m => {
      const dateStr = format(new Date(m.date), 'yyyy-MM-dd');
      const idx = defaultData.findIndex(d => d.date === dateStr);
      if (idx !== -1) {
        defaultData[idx] = {
          ...defaultData[idx],
          moodScore: m.moodScore,
          moodLabel: MOOD_MAP[m.moodScore]?.label || "Neutral",
          dominantEmotion: m.dominantEmotion,
          dreamId: m.dreamId,
          dreamTitle: m.dreamTitle,
        };
      }
    });

    return defaultData;
  };

  const chartData = getTimeRangeData();

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;
    const moodInfo = MOOD_MAP[data.moodScore];
    return (
      <div className="p-3 bg-white dark:bg-neutral-800 rounded-lg border shadow">
        <p className="text-sm font-medium">{format(new Date(data.date), 'MMM d, yyyy')}</p>
        {data.moodScore !== null ? (
          <>
            <p className={cn("font-semibold", moodInfo.textColor)}>{moodInfo.label}</p>
            {data.dreamTitle && (
              <p className="text-xs mt-1 text-neutral-500 dark:text-neutral-400">
                Dream: {data.dreamTitle}
              </p>
            )}
          </>
        ) : (
          <p className="text-neutral-500">No mood data</p>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-20 pb-16">
      <motion.div
        className="flex items-center mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <BarChart2 className="w-7 h-7 text-blue-500 mr-2" />
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
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
            className="p-4 bg-white dark:bg-neutral-800 rounded-xl shadow border"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Mood Over Time</h3>
              <div className="flex gap-2">
                {["weekly", "monthly", "yearly"].map(mode => (
                  <Badge
                    key={mode}
                    variant={viewMode === mode ? "default" : "outline"}
                    onClick={() => setViewMode(mode as any)}
                    className="cursor-pointer capitalize"
                  >
                    {mode}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0.2} />
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
                    tickFormatter={(value) => MOOD_MAP[value]?.label?.slice(0, 3)}
                    stroke="#888888"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="moodScore"
                    stroke="#8884d8"
                    fill="url(#moodGradient)"
                    strokeWidth={2}
                    connectNulls
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Emotion Distribution */}
          <motion.div
            className="p-4 bg-white dark:bg-neutral-800 rounded-xl shadow border"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-lg font-medium mb-4">Emotion Distribution</h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {Object.entries(EMOTION_ICONS).map(([emotion, { icon: Icon, color }]) => {
                const count = moodData.filter(m => m.emotions?.some(e => e.toLowerCase().includes(emotion))).length;
                if (!count) return null;
                return (
                  <div
                    key={emotion}
                    className="flex flex-col items-center p-3 rounded-lg bg-neutral-100 dark:bg-neutral-900 min-w-[100px]"
                  >
                    <Icon className={cn("w-8 h-8 mb-2", color)} />
                    <span className="text-sm font-medium capitalize">{emotion}</span>
                    <span className="text-xs text-neutral-500">{count} dream{count > 1 ? "s" : ""}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </TabsContent>

        {/* You can apply similar spacing fixes to calendar tab if needed */}
      </Tabs>
    </div>
  );
}
