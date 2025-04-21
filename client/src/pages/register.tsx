import { useState } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthProvider";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Moon, ArrowRight, CheckCircle2 } from "lucide-react";

// Simplified schema with only essential fields
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
}).refine(data => data.password.length >= 6, {
  message: "Password must be at least 6 characters",
  path: ["password"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const { register } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });
  
  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    
    try {
      // Call register function from auth provider
      await register({
        username: data.username,
        email: data.email,
        password: data.password,
      });
      
      setRegistrationComplete(true);
      
      // Automatically redirect after a brief success animation
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "There was an error creating your account. This username or email might already be taken.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  
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
    },
    exit: { 
      y: -20, 
      opacity: 0,
      transition: { 
        duration: 0.3 
      }
    }
  };
  
  const successVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 200, 
        duration: 0.5 
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
            Begin your journey into dream exploration
          </motion.p>
        </div>
        
        <AnimatePresence mode="wait">
          {!registrationComplete ? (
            <motion.div
              key="registration-form"
              variants={formVariants}
              initial="initial"
              animate="animate"
              exit="exit"
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
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <div className="relative">
                              <FormControl>
                                <Input 
                                  type="email" 
                                  placeholder="Email" 
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
                                  placeholder="Password (min 6 characters)" 
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
                            <span>Creating...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span>Create Account</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center pb-6 pt-2">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Already have an account?{" "}
                    <Link href="/login" className="text-purple-600 dark:text-purple-400 hover:underline font-medium">
                      Sign in
                    </Link>
                  </p>
                </CardFooter>
              </Card>
              
              <div className="mt-6 text-center">
                <p className="text-xs text-neutral-500 dark:text-neutral-500">
                  By signing up, you agree to our{" "}
                  <a href="#" className="hover:underline text-purple-600 dark:text-purple-400">Terms</a>{" "}
                  and{" "}
                  <a href="#" className="hover:underline text-purple-600 dark:text-purple-400">Privacy</a>
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="registration-success"
              variants={successVariants}
              initial="initial"
              animate="animate"
              className="text-center"
            >
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm py-10">
                <CardContent className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-500" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Account Created!</h2>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Redirecting you to login...
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
