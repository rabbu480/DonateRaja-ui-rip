import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";

// Pages
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Browse from "@/pages/Browse";
import Dashboard from "@/pages/Dashboard";
import Messaging from "@/pages/Messaging";
import Profile from "@/pages/Profile";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Handle global unauthorized errors
  useEffect(() => {
    const handleUnauthorized = (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    };

    // Listen for global unauthorized errors
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && typeof event.reason.message === 'string') {
        handleUnauthorized(event.reason);
      }
    });

    return () => {
      window.removeEventListener('unhandledrejection', handleUnauthorized);
    };
  }, [toast]);

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/browse" component={Browse} />
          <Route component={Landing} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/home" component={Home} />
          <Route path="/browse" component={Browse} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/messages" component={Messaging} />
          <Route path="/profile" component={Profile} />
          <Route path="/admin" component={Admin} />
          <Route component={NotFound} />
        </>
      )}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
