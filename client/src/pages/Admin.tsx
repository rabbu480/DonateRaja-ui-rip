import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Shield, 
  Users, 
  Package, 
  Flag, 
  TrendingUp, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Settings,
  BarChart3,
  FileText,
  Crown,
  AlertTriangle
} from "lucide-react";
import { Banner, User, Item, Request, insertBannerSchema } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { z } from "zod";

const bannerFormSchema = insertBannerSchema.extend({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  target: z.number().min(1, "Target must be greater than 0"),
});

type BannerForm = z.infer<typeof bannerFormSchema>;

export default function Admin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Fetch admin data
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const { data: items = [], isLoading: itemsLoading } = useQuery<Item[]>({
    queryKey: ["/api/admin/items"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const { data: requests = [], isLoading: requestsLoading } = useQuery<Request[]>({
    queryKey: ["/api/admin/requests"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const { data: banners = [], isLoading: bannersLoading } = useQuery<Banner[]>({
    queryKey: ["/api/admin/banners"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const bannerForm = useForm<BannerForm>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      linkUrl: "",
      target: 100,
      collected: 0,
      isActive: true,
    },
  });

  // Banner management mutations
  const createBannerMutation = useMutation({
    mutationFn: async (data: BannerForm) => {
      if (editingBanner) {
        return await apiRequest("PUT", `/api/admin/banners/${editingBanner.id}`, data);
      } else {
        return await apiRequest("POST", "/api/admin/banners", data);
      }
    },
    onSuccess: () => {
      toast({
        title: editingBanner ? "Banner Updated" : "Banner Created",
        description: editingBanner ? "Banner has been updated successfully." : "New banner has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      queryClient.invalidateQueries({ queryKey: ["/api/banners"] });
      setShowBannerModal(false);
      setEditingBanner(null);
      bannerForm.reset();
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

  const deleteBannerMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/admin/banners/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Banner Deleted",
        description: "Banner has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      queryClient.invalidateQueries({ queryKey: ["/api/banners"] });
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

  // User management mutations
  const banUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("PATCH", `/api/admin/users/${userId}/ban`);
    },
    onSuccess: () => {
      toast({
        title: "User Banned",
        description: "User has been banned successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
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

  const grantAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("PATCH", `/api/admin/privileges/${userId}`, { isAdmin: true });
    },
    onSuccess: () => {
      toast({
        title: "Admin Access Granted",
        description: "User has been granted admin access.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
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

  const onSubmitBanner = (data: BannerForm) => {
    createBannerMutation.mutate(data);
  };

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    bannerForm.reset({
      title: banner.title,
      description: banner.description || "",
      imageUrl: banner.imageUrl || "",
      linkUrl: banner.linkUrl || "",
      target: banner.target || 100,
      collected: banner.collected || 0,
      isActive: banner.isActive,
    });
    setShowBannerModal(true);
  };

  const handleNewBanner = () => {
    setEditingBanner(null);
    bannerForm.reset();
    setShowBannerModal(true);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <Shield className="mx-auto text-gray-400 mb-4" size={64} />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Access Required</h2>
              <p className="text-gray-600 mb-6">Please login with an admin account to access this page.</p>
              <Button onClick={() => window.location.href = "/api/login"}>
                Login to Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!user?.isAdmin) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="mx-auto text-red-500 mb-4" size={64} />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
              <p className="text-gray-600 mb-6">You don't have admin privileges to access this page.</p>
              <Button onClick={() => window.location.href = "/"}>
                Go Back Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => !u.isAdmin).length,
    totalItems: items.length,
    totalRequests: requests.length,
    activeBanners: banners.filter(b => b.isActive).length,
    premiumUsers: users.filter(u => u.isPremium).length,
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, content, and platform settings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <Users className="text-primary" size={24} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Items</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
                </div>
                <Package className="text-secondary" size={24} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
                </div>
                <Flag className="text-primary" size={24} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Premium Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.premiumUsers}</p>
                </div>
                <Crown className="text-yellow-500" size={24} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              <BarChart3 size={16} className="mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users size={16} className="mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="content">
              <Package size={16} className="mr-2" />
              Content
            </TabsTrigger>
            <TabsTrigger value="banners">
              <Flag size={16} className="mr-2" />
              Banners
            </TabsTrigger>
            <TabsTrigger value="reports">
              <FileText size={16} className="mr-2" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="text-green-500" size={16} />
                      <div>
                        <p className="text-sm font-medium">New user registered</p>
                        <p className="text-xs text-gray-600">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Package className="text-blue-500" size={16} />
                      <div>
                        <p className="text-sm font-medium">New item posted</p>
                        <p className="text-xs text-gray-600">5 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <Flag className="text-yellow-500" size={16} />
                      <div>
                        <p className="text-sm font-medium">Item reported</p>
                        <p className="text-xs text-gray-600">10 minutes ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active Users (24h)</span>
                      <Badge variant="secondary">{Math.floor(stats.activeUsers * 0.4)}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Items Posted (7d)</span>
                      <Badge variant="secondary">{Math.floor(stats.totalItems * 0.1)}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Messages Sent (7d)</span>
                      <Badge variant="secondary">{Math.floor(stats.totalUsers * 15)}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Conversion Rate</span>
                      <Badge className="bg-green-100 text-green-800">2.3%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management ({users.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 p-4 animate-pulse">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users.slice(0, 10).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={user.profileImageUrl || undefined} />
                            <AvatarFallback className="bg-primary text-white">
                              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-sm text-gray-600">{user.email}</span>
                              {user.isPremium && (
                                <Badge className="bg-gradient-to-r from-primary to-secondary text-white">
                                  <Crown size={10} className="mr-1" />
                                  Premium
                                </Badge>
                              )}
                              {user.isAdmin && (
                                <Badge variant="destructive">Admin</Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                              <span>{user.points || 0} points</span>
                              <span>Rating: {user.rating ? parseFloat(user.rating).toFixed(1) : "0.0"}</span>
                              <span>Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!user.isAdmin && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => grantAdminMutation.mutate(user.id)}
                                disabled={grantAdminMutation.isPending}
                              >
                                <Shield size={14} className="mr-1" />
                                Make Admin
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => banUserMutation.mutate(user.id)}
                                disabled={banUserMutation.isPending}
                              >
                                <Ban size={14} className="mr-1" />
                                Ban
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Items ({items.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {itemsLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="p-4 bg-gray-50 rounded-lg animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {items.slice(0, 10).map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">{item.title}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={item.type === "donate" ? "default" : "secondary"}>
                                {item.type}
                              </Badge>
                              <Badge variant="outline">{item.category}</Badge>
                              <span className="text-sm text-gray-600">{item.location}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Posted {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye size={14} className="mr-1" />
                              View
                            </Button>
                            <Button variant="destructive" size="sm">
                              <Trash2 size={14} className="mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Requests ({requests.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {requestsLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="p-4 bg-gray-50 rounded-lg animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {requests.slice(0, 10).map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">{request.title}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={request.type === "donate" ? "default" : "secondary"}>
                                Looking for {request.type}
                              </Badge>
                              <Badge variant="outline">{request.category}</Badge>
                              <span className="text-sm text-gray-600">{request.location}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Posted {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye size={14} className="mr-1" />
                              View
                            </Button>
                            <Button variant="destructive" size="sm">
                              <Trash2 size={14} className="mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Banners Tab */}
          <TabsContent value="banners">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Campaign Banners ({banners.length})</CardTitle>
                  <Button onClick={handleNewBanner} className="bg-primary hover:bg-teal-600">
                    <Plus size={16} className="mr-2" />
                    Create Banner
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {bannersLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="p-4 bg-gray-50 rounded-lg animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : banners.length > 0 ? (
                  <div className="space-y-4">
                    {banners.map((banner) => (
                      <div key={banner.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-gray-900">{banner.title}</h4>
                              <Badge variant={banner.isActive ? "default" : "secondary"}>
                                {banner.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-3">{banner.description}</p>
                            
                            {banner.target && (
                              <div className="mb-3">
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <span>Progress</span>
                                  <span>{banner.collected || 0} / {banner.target}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-primary h-2 rounded-full transition-all duration-300"
                                    style={{ 
                                      width: `${Math.min(((banner.collected || 0) / banner.target) * 100, 100)}%` 
                                    }}
                                  ></div>
                                </div>
                              </div>
                            )}
                            
                            <p className="text-sm text-gray-500">
                              Created {formatDistanceToNow(new Date(banner.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditBanner(banner)}
                            >
                              <Edit size={14} className="mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteBannerMutation.mutate(banner.id)}
                              disabled={deleteBannerMutation.isPending}
                            >
                              <Trash2 size={14} className="mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Flag className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No banners created</h3>
                    <p className="text-gray-600 mb-4">Create your first campaign banner to promote community causes.</p>
                    <Button onClick={handleNewBanner} className="bg-primary hover:bg-teal-600">
                      <Plus size={16} className="mr-2" />
                      Create First Banner
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Monthly Active Users</span>
                      <span className="font-bold">{Math.floor(stats.activeUsers * 0.4)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Items Posted This Month</span>
                      <span className="font-bold">{Math.floor(stats.totalItems * 0.3)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Successful Transactions</span>
                      <span className="font-bold">{Math.floor(stats.totalItems * 0.6)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Revenue (Premium)</span>
                      <span className="font-bold">₹{(stats.premiumUsers * 599).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Average Session Duration</span>
                      <span className="font-bold">8m 32s</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Messages per User</span>
                      <span className="font-bold">12.4</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Premium Conversion Rate</span>
                      <span className="font-bold">5.2%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">User Retention (30d)</span>
                      <span className="font-bold">68%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Banner Modal */}
        <Dialog open={showBannerModal} onOpenChange={setShowBannerModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingBanner ? "Edit Banner" : "Create New Banner"}
              </DialogTitle>
            </DialogHeader>
            <Form {...bannerForm}>
              <form onSubmit={bannerForm.handleSubmit(onSubmitBanner)} className="space-y-4">
                <FormField
                  control={bannerForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Books for Children" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={bannerForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Describe the campaign and its goals"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={bannerForm.control}
                    name="target"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number"
                            placeholder="100"
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={bannerForm.control}
                    name="collected"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Collected</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number"
                            placeholder="0"
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={bannerForm.control}
                  name="linkUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link URL (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://example.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={bannerForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Active</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowBannerModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createBannerMutation.isPending}
                    className="bg-primary hover:bg-teal-600"
                  >
                    {createBannerMutation.isPending 
                      ? "Saving..." 
                      : editingBanner ? "Update Banner" : "Create Banner"
                    }
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
