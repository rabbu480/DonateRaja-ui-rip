import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  CreditCard, 
  Star,
  MapPin,
  Mail,
  Phone,
  Camera,
  Save,
  LogOut,
  Crown,
  Award,
  Eye,
  EyeOff
} from "lucide-react";
import { z } from "zod";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  location: z.string().optional(),
  pincode: z.string().min(6, "Valid pincode is required").max(6, "Valid pincode is required"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    messages: true,
    requests: true,
    updates: false,
  });

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      location: user?.location || "",
      pincode: user?.pincode || "",
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      return await apiRequest("PUT", "/api/auth/user/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordForm) => {
      return await apiRequest("PUT", "/api/auth/user/password", data);
    },
    onSuccess: () => {
      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully.",
      });
      passwordForm.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Upgrade to premium mutation
  const upgradePremiumMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/subscription/upgrade/premium");
    },
    onSuccess: () => {
      toast({
        title: "Premium Activated!",
        description: "Welcome to DonateRaja Premium! Enjoy unlimited chats and priority listings.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmitProfile = (data: ProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  const onSubmitPassword = (data: PasswordForm) => {
    changePasswordMutation.mutate(data);
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    // In a real app, this would save to the backend
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="lg:col-span-2 h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <User className="mx-auto text-gray-400 mb-4" size={64} />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
              <p className="text-gray-600 mb-6">Please login to view your profile.</p>
              <Button onClick={() => window.location.href = "/api/login"}>
                Login to Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="relative mb-4">
                  <Avatar className="w-24 h-24 mx-auto">
                    <AvatarImage src={user?.profileImageUrl} />
                    <AvatarFallback className="bg-primary text-white text-2xl font-bold">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-1/2"
                  >
                    <Camera size={14} />
                  </Button>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-gray-600 mb-4">{user?.email}</p>
                
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Award size={12} />
                    <span>{user?.points || 0} points</span>
                  </Badge>
                  {user?.isPremium ? (
                    <Badge className="bg-gradient-to-r from-primary to-secondary text-white">
                      <Crown size={12} className="mr-1" />
                      Premium
                    </Badge>
                  ) : (
                    <Badge variant="outline">Free</Badge>
                  )}
                </div>

                <div className="flex items-center justify-center space-x-1 mb-6">
                  <Star className="text-yellow-400 fill-current" size={16} />
                  <span className="text-sm font-medium">
                    {user?.rating ? parseFloat(user.rating).toFixed(1) : "0.0"}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({user?.totalReviews || 0} reviews)
                  </span>
                </div>

                {!user?.isPremium && (
                  <Button
                    onClick={() => upgradePremiumMutation.mutate()}
                    disabled={upgradePremiumMutation.isPending}
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  >
                    <Crown size={16} className="mr-2" />
                    {upgradePremiumMutation.isPending ? "Upgrading..." : "Upgrade to Premium"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Settings Tabs */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">
                  <User size={16} className="mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="security">
                  <Shield size={16} className="mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="notifications">
                  <Bell size={16} className="mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="billing">
                  <CreditCard size={16} className="mr-2" />
                  Billing
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={profileForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={profileForm.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                  <Input {...field} className="pl-10" disabled />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                  <Input {...field} className="pl-10" placeholder="Enter phone number" />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={profileForm.control}
                            name="location"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                    <Input {...field} className="pl-10" placeholder="e.g., Bangalore" />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={profileForm.control}
                            name="pincode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pincode</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="e.g., 560034" maxLength={6} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label htmlFor="anonymous">Anonymous Profile</Label>
                            <p className="text-sm text-gray-600">Hide your name from public view</p>
                          </div>
                          <Switch
                            id="anonymous"
                            checked={isAnonymous}
                            onCheckedChange={setIsAnonymous}
                          />
                        </div>

                        <Button 
                          type="submit" 
                          disabled={updateProfileMutation.isPending}
                          className="bg-primary hover:bg-teal-600"
                        >
                          <Save size={16} className="mr-2" />
                          {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button 
                          type="submit" 
                          disabled={changePasswordMutation.isPending}
                          className="bg-primary hover:bg-teal-600"
                        >
                          {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
                        </Button>
                      </form>
                    </Form>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-4">Account Actions</h4>
                      <Button 
                        variant="destructive" 
                        onClick={() => window.location.href = "/api/logout"}
                        className="flex items-center space-x-2"
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {Object.entries({
                      email: { label: "Email Notifications", description: "Get notified via email" },
                      push: { label: "Push Notifications", description: "Get browser push notifications" },
                      messages: { label: "New Messages", description: "Get notified of new chat messages" },
                      requests: { label: "Item Requests", description: "Get notified when someone requests your items" },
                      updates: { label: "Platform Updates", description: "Get notified about new features and updates" },
                    }).map(([key, { label, description }]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor={key}>{label}</Label>
                          <p className="text-sm text-gray-600">{description}</p>
                        </div>
                        <Switch
                          id={key}
                          checked={notifications[key as keyof typeof notifications]}
                          onCheckedChange={(value) => handleNotificationChange(key, value)}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Billing Tab */}
              <TabsContent value="billing">
                <Card>
                  <CardHeader>
                    <CardTitle>Billing & Subscription</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Current Plan</h4>
                          <p className="text-sm text-gray-600">
                            {user?.isPremium ? "Premium" : "Free"} Plan
                          </p>
                        </div>
                        <Badge variant={user?.isPremium ? "default" : "secondary"}>
                          {user?.isPremium ? "Active" : "Free"}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Points Balance</h4>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Award className="text-primary" size={20} />
                          <span className="text-2xl font-bold">{user?.points || 0}</span>
                          <span className="text-gray-600">points</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        Use points to unlock chats or upgrade to premium. Earn points by engaging with the community!
                      </p>
                    </div>

                    {!user?.isPremium && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          <h4 className="font-medium">Upgrade to Premium</h4>
                          <div className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h5 className="font-medium">Premium Plan</h5>
                                <p className="text-sm text-gray-600">6 months subscription</p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold">₹599</div>
                                <div className="text-sm text-gray-600">or 299 points</div>
                              </div>
                            </div>
                            <ul className="space-y-2 text-sm text-gray-600 mb-4">
                              <li>• Unlimited chats</li>
                              <li>• Priority item listings</li>
                              <li>• Advanced analytics</li>
                              <li>• Premium support</li>
                            </ul>
                            <Button 
                              onClick={() => upgradePremiumMutation.mutate()}
                              disabled={upgradePremiumMutation.isPending}
                              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                            >
                              <Crown size={16} className="mr-2" />
                              {upgradePremiumMutation.isPending ? "Upgrading..." : "Upgrade Now"}
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
}
