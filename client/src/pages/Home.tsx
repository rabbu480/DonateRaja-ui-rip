import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ItemCard from "@/components/ItemCard";
import RequestCard from "@/components/RequestCard";
import { useAuth } from "@/hooks/useAuth";
import { 
  Package, 
  MessageCircle, 
  Star, 
  TrendingUp,
  Plus,
  ArrowRight,
  Heart,
  Award
} from "lucide-react";
import { Item, Request, Notification, Banner } from "@shared/schema";

export default function Home() {
  const { user } = useAuth();
  const [showAll, setShowAll] = useState(false);

  // Fetch recent items
  const { data: recentItems = [] } = useQuery<Item[]>({
    queryKey: ["/api/items", { limit: 6 }],
  });

  // Fetch recent requests
  const { data: recentRequests = [] } = useQuery<Request[]>({
    queryKey: ["/api/requests", { limit: 4 }],
  });

  // Fetch user notifications
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  // Fetch active banners
  const { data: banners = [] } = useQuery<Banner[]>({
    queryKey: ["/api/banners"],
  });

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const activeBanner = banners[0];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || "Friend"}! 👋
          </h1>
          <p className="text-gray-600">
            Ready to make a difference in your community today?
          </p>
        </div>

        {/* Community Banner */}
        {activeBanner && (
          <Card className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    🎯 {activeBanner.title}
                  </h3>
                  <p className="text-gray-700 mb-4">{activeBanner.description}</p>
                  
                  {activeBanner.target && (
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 max-w-xs">
                        <div className="bg-white/50 rounded-full h-3 mb-1">
                          <div 
                            className="bg-primary rounded-full h-3 transition-all duration-300"
                            style={{ 
                              width: `${Math.min(((activeBanner.collected || 0) / activeBanner.target) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {activeBanner.collected || 0} / {activeBanner.target} items
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {Math.round(((activeBanner.collected || 0) / activeBanner.target) * 100)}% Complete
                      </Badge>
                    </div>
                  )}
                </div>
                
                <Button 
                  className="bg-primary hover:bg-teal-600"
                  onClick={() => {
                    if (activeBanner.linkUrl) {
                      window.open(activeBanner.linkUrl, '_blank');
                    }
                  }}
                >
                  Contribute
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Your Points</p>
                  <p className="text-2xl font-bold text-primary">{user?.points || 0}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Award className="text-primary" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Items Posted</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Package className="text-secondary" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Chats</p>
                  <p className="text-2xl font-bold text-gray-900">5</p>
                  {unreadNotifications.length > 0 && (
                    <Badge variant="destructive" className="mt-1">
                      {unreadNotifications.length} new
                    </Badge>
                  )}
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MessageCircle className="text-primary" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rating</p>
                  <div className="flex items-center space-x-1">
                    <p className="text-2xl font-bold text-gray-900">
                      {user?.rating ? parseFloat(user.rating).toFixed(1) : "0.0"}
                    </p>
                    <Star className="text-yellow-400 fill-current" size={20} />
                  </div>
                  <p className="text-xs text-gray-500">{user?.totalReviews || 0} reviews</p>
                </div>
                <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <Star className="text-yellow-400" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Items */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Recent Items</h2>
                <Link href="/browse">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="ml-2" size={16} />
                  </Button>
                </Link>
              </div>
              
              {recentItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {recentItems.slice(0, 4).map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Package className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No items yet</h3>
                    <p className="text-gray-600 mb-4">Be the first to share something with the community!</p>
                    <Button className="bg-primary hover:bg-teal-600">
                      <Plus className="mr-2" size={16} />
                      Post First Item
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Recent Requests */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Help Others</h2>
                <Link href="/browse?tab=requests">
                  <Button variant="outline" size="sm">
                    View All Requests
                    <ArrowRight className="ml-2" size={16} />
                  </Button>
                </Link>
              </div>
              
              {recentRequests.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {recentRequests.slice(0, 2).map((request) => (
                    <RequestCard key={request.id} request={request} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Heart className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
                    <p className="text-gray-600">Check back later to help community members!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-secondary hover:bg-red-500" size="lg">
                  <Plus className="mr-2" size={16} />
                  Post Item
                </Button>
                <Link href="/dashboard" className="w-full">
                  <Button variant="outline" className="w-full">
                    Manage My Items
                  </Button>
                </Link>
                <Link href="/messages" className="w-full">
                  <Button variant="outline" className="w-full">
                    <MessageCircle className="mr-2" size={16} />
                    View Messages
                    {unreadNotifications.length > 0 && (
                      <Badge className="ml-2" variant="destructive">
                        {unreadNotifications.length}
                      </Badge>
                    )}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.slice(0, showAll ? notifications.length : 3).map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-3 rounded-lg border ${
                          notification.isRead ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <h4 className="font-medium text-sm text-gray-900">{notification.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                      </div>
                    ))}
                    
                    {notifications.length > 3 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowAll(!showAll)}
                        className="w-full"
                      >
                        {showAll ? 'Show Less' : `Show ${notifications.length - 3} More`}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <TrendingUp className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-sm text-gray-600">No activity yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Premium Upgrade */}
            {!user?.isPremium && (
              <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="text-white" size={20} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Upgrade to Premium</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Get unlimited chats and priority listings for just ₹599/6 months
                  </p>
                  <Badge variant="secondary" className="mb-4">
                    Use your {user?.points || 0} points!
                  </Badge>
                  <Button size="sm" className="bg-primary hover:bg-teal-600">
                    Upgrade Now
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
