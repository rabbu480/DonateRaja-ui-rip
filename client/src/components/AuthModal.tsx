import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { User, MessageSquare } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Since we're using Replit Auth, redirect to login endpoint
    window.location.href = "/api/login";
  };

  const handleWhatsAppLogin = () => {
    // Redirect to WhatsApp OAuth or Replit login
    window.location.href = "/api/login";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Join DonateRaja
          </DialogTitle>
          <p className="text-center text-gray-600 mt-2">
            Start sharing and caring in your community
          </p>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email or Phone</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Enter your password"
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              <div className="text-center">
                <Button variant="link" className="text-sm text-primary">
                  Forgot Password?
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input 
                  id="signup-email" 
                  type="email" 
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="Enter your phone number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input 
                  id="signup-password" 
                  type="password" 
                  placeholder="Create a password"
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {isLoading ? "Creating Account..." : "Sign Up & Get 300 Points"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={handleWhatsAppLogin}
          disabled={isLoading}
          className="w-full"
        >
          <MessageSquare className="mr-2 h-4 w-4 text-green-600" />
          WhatsApp
        </Button>

        <p className="text-xs text-center text-gray-500">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </DialogContent>
    </Dialog>
  );
}
