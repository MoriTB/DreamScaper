import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/ThemeProvider";
import { AuthProvider } from "@/lib/AuthProvider";
import { AnimatePresence } from "framer-motion";

// Pages
import Dashboard from "@/pages/dashboard";
import AllDreams from "@/pages/all-dreams";
import Insights from "@/pages/insights";
import Profile from "@/pages/profile";
import Record from "@/pages/record";
import Login from "@/pages/login";
import Register from "@/pages/register";
import NotFound from "@/pages/not-found";

// Layout
import { Layout } from "@/components/layout";

function Router() {
  const [location] = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Switch location={location} key={location}>
        {/* Auth routes */}
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        
        {/* App routes */}
        <Route path="/">
          <Layout>
            <Dashboard />
          </Layout>
        </Route>
        <Route path="/all-dreams">
          <Layout>
            <AllDreams />
          </Layout>
        </Route>
        <Route path="/insights">
          <Layout>
            <Insights />
          </Layout>
        </Route>
        <Route path="/profile">
          <Layout>
            <Profile />
          </Layout>
        </Route>
        <Route path="/record">
          <Layout>
            <Record />
          </Layout>
        </Route>
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
