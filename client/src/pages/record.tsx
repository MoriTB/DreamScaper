import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthProvider";
import { useLocation } from "wouter";
import { useWebSocket } from "@/lib/useWebSocket";
import { RecordDreamSectionNew } from "@/organisms/RecordDreamSectionNew";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function Record() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [justCreatedDreamId, setJustCreatedDreamId] = useState<number | null>(null);
  
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
            <a href={`/dreams/${data.dreamId}`} className="bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-1 rounded-md text-white text-xs">
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
  
  const handleSuccess = (dreamId?: number) => {
    if (dreamId) setJustCreatedDreamId(dreamId);
    
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
      className="max-w-5xl mx-auto px-4 pt-2 pb-10"
    >
      {!isConnected && (
        <Alert variant="warning" className="mb-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
          <AlertTitle>Connection Status</AlertTitle>
          <AlertDescription>
            Real-time notifications are not connected. Updates may be delayed.
          </AlertDescription>
        </Alert>
      )}
      
      <RecordDreamSectionNew
        userId={user.id}
        onCancel={handleCancel}
        onSuccess={handleSuccess}
      />
    </motion.div>
  );
}
