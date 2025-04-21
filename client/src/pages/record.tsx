import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthProvider";
import { useLocation } from "wouter";
import { useWebSocket } from "@/lib/useWebSocket";
import { RecordDreamSection } from "@/organisms/RecordDreamSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function Record() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"voice" | "text">("voice");
  const [justCreatedDreamId, setJustCreatedDreamId] = useState<number | null>(null);
  
  // Check if mode is specified in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");
    if (mode === "text") {
      setActiveTab("text");
    }
  }, []);
  
  // If not logged in, redirect to login
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);
  
  // WebSocket for real-time updates on dream processing
  const { isConnected, lastMessage } = useWebSocket({
    userId: user?.id,
    onMessage: (event, data) => {
      if (event === 'interpretationComplete' && data.dreamId === justCreatedDreamId) {
        toast({
          title: "Dream Interpreted",
          description: "Your dream has been analyzed and interpreted!",
        });
      } else if (event === 'imageReady' && data.dreamId === justCreatedDreamId) {
        toast({
          title: "Image Generated",
          description: "An image for your dream has been created!",
          action: (
            <a href={`/dreams/${data.dreamId}`} className="bg-purple-600 px-3 py-1 rounded-md text-white text-xs">
              View
            </a>
          )
        });
      }
    }
  });
  
  const handleCancel = () => {
    navigate("/");
  };
  
  const handleSuccess = (dreamId: number) => {
    setJustCreatedDreamId(dreamId);
    
    toast({
      title: "Dream Recorded",
      description: "Your dream has been saved and is being processed.",
    });
    
    // Go to dashboard
    navigate("/");
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
      <h1 className="text-2xl font-semibold mb-6">Record a New Dream</h1>
      
      {!isConnected && (
        <Alert variant="warning" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Notification Status</AlertTitle>
          <AlertDescription>
            Real-time notifications are not connected. You may need to refresh the page to see updates.
          </AlertDescription>
        </Alert>
      )}
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Dream Recording Tips</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert">
          <ul>
            <li>Speak clearly and naturally when recording your dream.</li>
            <li>Include as many details as you can remember - colors, feelings, places, people.</li>
            <li>Tag your dream to help identify patterns over time.</li>
            <li>If you recall your dream later, you can always edit it to add more details.</li>
          </ul>
        </CardContent>
      </Card>
      
      <RecordDreamSection
        userId={user.id}
        onCancel={handleCancel}
        onSuccess={handleSuccess}
      />
    </motion.div>
  );
}
