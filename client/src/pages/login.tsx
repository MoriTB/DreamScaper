import { useState } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthProvider";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Moon, ArrowRight, LogIn } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      await login(data.username, data.password);
      navigate("/");
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Animation variants
  const logoVariants = {
    initial: { scale: 0.8, rotate: -10, opacity: 0 },
    animate: { 
      scale: 1, 
      rotate: 0, 
      opacity: 1, 
      transition: { 
        duration: 0.5, 
        type: "spring", 
        stiffness: 200 
      } 
    }
  };
  
  const textVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        delay: 0.3, 
        duration: 0.5 
      } 
    }
  };
  
  const formVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { 
        delay: 0.5, 
        duration: 0.5, 
        ease: "easeOut" 
      }
    }
  };
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-purple-950 p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div 
            variants={logoVariants}
            initial="initial"
            animate="animate"
            className="flex justify-center mb-4"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Moon className="h-8 w-8 text-white" />
            </div>
          </motion.div>
          
          <motion.h1 
            variants={textVariants}
            initial="initial"
            animate="animate"
            className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400"
          >
            Dreamscape
          </motion.h1>
          
          <motion.p 
            variants={textVariants}
            initial="initial"
            animate="animate"
            className="text-neutral-600 dark:text-neutral-400 mt-2"
          >
            Welcome back to your dream journal
          </motion.p>
        </div>
        
        <motion.div
          variants={formVariants}
          initial="initial"
          animate="animate"
        >
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
            <CardContent className="pt-6 pb-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <div className="relative">
                          <FormControl>
                            <Input 
                              placeholder="Username" 
                              className="h-12 pl-4 pr-4 border-neutral-200 bg-white/50 dark:bg-neutral-800/50 dark:border-neutral-700 focus:border-purple-400 focus:ring-purple-400 dark:focus:border-purple-500 dark:focus:ring-purple-500 transition-all duration-300" 
                              {...field} 
                            />
                          </FormControl>
                        </div>
                        <FormMessage className="ml-1 text-xs" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="relative">
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Password" 
                              className="h-12 pl-4 pr-4 border-neutral-200 bg-white/50 dark:bg-neutral-800/50 dark:border-neutral-700 focus:border-purple-400 focus:ring-purple-400 dark:focus:border-purple-500 dark:focus:ring-purple-500 transition-all duration-300" 
                              {...field} 
                            />
                          </FormControl>
                        </div>
                        <FormMessage className="ml-1 text-xs" />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-md flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-opacity-20 border-t-white rounded-full animate-spin"></div>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <LogIn className="w-4 h-4" />
                        <span>Sign In</span>
                      </div>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-center pb-6 pt-2">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Don't have an account?{" "}
                <Link href="/register" className="text-purple-600 dark:text-purple-400 hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </Card>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-neutral-500 dark:text-neutral-500">
              &copy; 2025 Dreamscape Journal • <a href="#" className="hover:underline text-purple-600 dark:text-purple-400">Privacy</a> • <a href="#" className="hover:underline text-purple-600 dark:text-purple-400">Terms</a>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
