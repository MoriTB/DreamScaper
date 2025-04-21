import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface InsightsTeaserProps {
  className?: string;
}

export function InsightsTeaser({ className }: InsightsTeaserProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={cn(
        "glass dark:glass-dark rounded-2xl p-6 md:p-8 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10",
        className
      )}
    >
      <div className="flex flex-col md:flex-row items-center">
        <div className="flex-1 mb-6 md:mb-0 md:mr-6">
          <h2 className="text-xl font-medium mb-2">Dream Patterns & Insights</h2>
          <p className="text-neutral-600 dark:text-neutral-300 mb-4">
            Our AI analyzes your dreams over time to identify recurring themes, symbols, and emotional patterns.
          </p>
          <Link href="/insights">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-sm transition-colors">
              View Insights
            </Button>
          </Link>
        </div>
        <div className="w-full md:w-80 rounded-xl overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1590286162167-c31424b5d7b5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80" 
            alt="Dream insights visualization" 
            className="w-full h-48 object-cover"
          />
        </div>
      </div>
    </motion.div>
  );
}
