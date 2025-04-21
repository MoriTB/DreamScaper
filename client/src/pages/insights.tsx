import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthProvider";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { DreamWithRelations } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TagChip } from "@/molecules/TagChip";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Insights() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("patterns");
  
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
  
  // Process data for insights
  const processTagCounts = () => {
    if (!dreams) return [];
    
    const tagCounts: Record<string, number> = {};
    
    dreams.forEach(dreamData => {
      if (dreamData.dream.tags) {
        dreamData.dream.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    
    return Object.entries(tagCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  };
  
  const processDreamTimeDistribution = () => {
    if (!dreams) return [];
    
    const hourCounts: Record<string, number> = {};
    
    for (let i = 0; i < 24; i++) {
      hourCounts[i] = 0;
    }
    
    dreams.forEach(dreamData => {
      const hour = new Date(dreamData.dream.createdAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    return Object.entries(hourCounts)
      .map(([hour, count]) => ({ 
        name: `${hour}:00`, 
        count 
      }));
  };
  
  const processEmotionalTones = () => {
    if (!dreams) return [];
    
    const emotions = ['Positive', 'Neutral', 'Negative', 'Mixed'];
    const counts = [0, 0, 0, 0];
    
    dreams.forEach(dreamData => {
      if (dreamData.interpretation?.insights) {
        const insights = dreamData.interpretation.insights as any;
        if (insights.emotions) {
          // Simple algorithm to categorize dreams
          const emotionList = insights.emotions;
          const positiveCount = emotionList.filter((emotion: string) => 
            ['joy', 'happiness', 'excitement', 'calm', 'peace', 'love'].includes(emotion.toLowerCase())
          ).length;
          
          const negativeCount = emotionList.filter((emotion: string) => 
            ['fear', 'anxiety', 'sadness', 'anger', 'confusion', 'stress'].includes(emotion.toLowerCase())
          ).length;
          
          if (positiveCount > 0 && negativeCount > 0) {
            counts[3]++; // Mixed
          } else if (positiveCount > 0) {
            counts[0]++; // Positive
          } else if (negativeCount > 0) {
            counts[2]++; // Negative
          } else {
            counts[1]++; // Neutral
          }
        }
      }
    });
    
    return emotions.map((name, index) => ({
      name,
      value: counts[index]
    }));
  };
  
  const tagData = processTagCounts();
  const timeData = processDreamTimeDistribution();
  const emotionData = processEmotionalTones();
  
  const colorArray = [
    '#8b5cf6', // purple-600
    '#a78bfa', // purple-400
    '#c4b5fd', // purple-300
    '#7c3aed', // purple-700
    '#ddd6fe', // purple-200
    '#6d28d9', // purple-800
    '#ede9fe', // purple-100
    '#5b21b6', // purple-900
    '#f5f3ff', // purple-50
    '#4c1d95'  // purple-950
  ];
  
  if (!user) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto"
    >
      <h1 className="text-2xl font-semibold mb-6">Dream Insights</h1>
      
      <Tabs defaultValue="patterns" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="emotions">Emotions</TabsTrigger>
          <TabsTrigger value="symbols">Symbols</TabsTrigger>
        </TabsList>
        
        <TabsContent value="patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dream Tags Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tagData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {tagData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colorArray[index % colorArray.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} dreams`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                {tagData.map((tag, index) => (
                  <div key={index} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-1"
                      style={{ backgroundColor: colorArray[index % colorArray.length] }}
                    ></div>
                    <TagChip tag={tag.name} />
                    <span className="ml-1 text-sm text-neutral-500">({tag.value})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Dream Recording Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="emotions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Emotional Tone Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={emotionData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#4ade80" /> {/* Green for Positive */}
                      <Cell fill="#a8a29e" /> {/* Gray for Neutral */}
                      <Cell fill="#f87171" /> {/* Red for Negative */}
                      <Cell fill="#a78bfa" /> {/* Purple for Mixed */}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} dreams`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-green-400 mr-2"></div>
                  <span>Positive dreams</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-neutral-400 mr-2"></div>
                  <span>Neutral dreams</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-red-400 mr-2"></div>
                  <span>Negative dreams</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-purple-400 mr-2"></div>
                  <span>Mixed emotions</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Emotion Analysis</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert">
              <p>Your dream emotions provide insights into your subconscious feelings:</p>
              
              {dreams && dreams.length > 0 ? (
                <ul>
                  {emotionData[0].value > emotionData[2].value ? (
                    <li>You tend to have more positive dreams than negative ones, suggesting a generally optimistic outlook.</li>
                  ) : (
                    <li>You have more negative dreams than positive ones, which might indicate processing of stress or anxiety.</li>
                  )}
                  
                  {emotionData[3].value > 0 && (
                    <li>Your mixed-emotion dreams suggest complex emotional processing.</li>
                  )}
                  
                  {emotionData[1].value > (emotionData[0].value + emotionData[2].value) / 2 && (
                    <li>The high number of neutral dreams could indicate emotional detachment or observational dreaming.</li>
                  )}
                </ul>
              ) : (
                <p>Record more dreams to see emotion analysis patterns.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="symbols" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Common Dream Symbols</CardTitle>
            </CardHeader>
            <CardContent>
              {dreams && dreams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dreams.slice(0, 6).map((dreamData, index) => {
                    const symbols = dreamData.interpretation?.insights ? 
                      (dreamData.interpretation.insights as any).symbols || [] : [];
                    
                    return (
                      <div key={index} className="glass dark:glass-dark rounded-lg p-4">
                        <h3 className="font-medium mb-2">{dreamData.dream.title}</h3>
                        <div className="flex flex-wrap gap-2">
                          {symbols.slice(0, 5).map((symbol: string, sIndex: number) => (
                            <span key={sIndex} className="px-2 py-1 text-xs rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                              {symbol}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center py-8 text-neutral-500">
                  Record more dreams to analyze dream symbols.
                </p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Symbol Interpretation Guide</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert">
              <p>Common dream symbols and their potential meanings:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-lg font-medium">Water</h4>
                  <p className="text-sm">Often represents emotions, the unconscious, or transitions in life.</p>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium">Flying</h4>
                  <p className="text-sm">May symbolize freedom, transcending limitations, or gaining perspective.</p>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium">Falling</h4>
                  <p className="text-sm">Can indicate loss of control, anxiety, or letting go.</p>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium">Houses</h4>
                  <p className="text-sm">Often represent the self, with different rooms reflecting different aspects of your personality.</p>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium">Animals</h4>
                  <p className="text-sm">Typically embody instincts or traits you associate with that specific animal.</p>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium">Teeth</h4>
                  <p className="text-sm">Dreams about teeth falling out often relate to insecurity or communication fears.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
