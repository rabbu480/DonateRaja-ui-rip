import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuthApi } from "@/hooks/useAuthApi";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Package, 
  MessageCircle, 
  Heart, 
  Edit3, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  MapPin
} from "lucide-react";
import { Item, Request, ItemRequest, Favorite, Transaction } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuthApi();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("items");

  // Fetch user's items
  const { data: userItems = [], isLoading: itemsLoading } = useQuery<Item[]>({
    queryKey: ["/api/items/user/my-items"],
    enabled: isAuthenticated,
  });

  // Fetch user's requests
  const { data: userRequests = [], isLoading: requestsLoading } = useQuery<Request[]>({
    queryKey: ["/api/requests/user/my-requests"],
    enabled: isAuthenticated,
  });

  // Fetch received item requests
  const { data: receivedRequests = [], isLoading: receivedLoading } = useQuery<ItemRequest[]>({
    queryKey: ["/api/item-requests/received"],
    enabled: isAuthenticated,
  });

  // Fetch sent item requests
  const { data: sentRequests = [], isLoading: sentLoading } = useQuery<ItemRequest[]>({
    queryKey: ["/api/item-requests/sent"],
    enabled: isAuthenticated,
  });

  // Fetch favorites
  const { data: favorites = [], isLoading: favoritesLoading } = useQuery<Favorite[]>({
    queryKey: ["/api/favorites"],
    enabled: isAuthenticated,
  });

  // Fetch transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    enabled: isAuthenticated,
  });

  // Handle request approval/rejection
  const requestStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await apiRequest("PATCH", `/api/item-requests/${id}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Request Updated",
        description: "Request status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/item-requests/received"] });
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

  // Handle item deletion
  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/items/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Item Deleted",
        description: "Your item has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/items/user/my-items"] });
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
              <p className="text-gray-600 mb-6">Please login to view your dashboard.</p>
              <Button onClick={() => window.location.href = "/api/login"}>
                Login to Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'rejected':
        return <XCircle className="text-red-500" size={16} />;
      default:
        return <Clock className="text-yellow-500" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'available':
        return 'bg-blue-100 text-blue-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      case 'taken':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user?.profileImageUrl} />
              <AvatarFallback className="bg-primary text-white text-xl font-bold">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h1>
              <div className="flex items-center space-x-4 mt-1">
                <Badge variant="secondary">{user?.points || 0} points</Badge>
                {user?.isPremium && <Badge>Premium</Badge>}
                <div className="flex items-center space-x-1">
                  <Star className="text-yellow-400 fill-current" size={16} />
                  <span className="text-sm text-gray-600">
                    {user?.rating ? parseFloat(user.rating).toFixed(1) : "0.0"} 
                    ({user?.totalReviews || 0} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Items Posted</p>
                  <p className="text-2xl font-bold text-gray-900">{userItems.length}</p>
                </div>
                <Package className="text-primary" size={24} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Requests Made</p>
                  <p className="text-2xl font-bold text-gray-900">{userRequests.length}</p>
                </div>
                <MessageCircle className="text-secondary" size={24} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Requests</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {receivedRequests.filter(r => r.status === 'pending').length}
                  </p>
                </div>
                <Clock className="text-yellow-500" size={24} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Favorites</p>
                  <p className="text-2xl font-bold text-gray-900">{favorites.length}</p>
                </div>
                <Heart className="text-red-500" size={24} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="items">My Items</TabsTrigger>
            <TabsTrigger value="requests">My Requests</TabsTrigger>
            <TabsTrigger value="received">Received</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          {/* My Items */}
          <TabsContent value="items">
            <Card>
              <CardHeader>
                <CardTitle>My Items ({userItems.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {itemsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg animate-pulse">
                        <div className="w-16 h-16 bg-gray-200 rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : userItems.length > 0 ? (
                  <div className="space-y-4">
                    {userItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            {item.images && item.images.length > 0 ? (
                              <img 
                                src={item.images[0]} 
                                alt={item.title}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Package className="text-gray-400" size={24} />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{item.title}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={getStatusColor(item.status || 'available')}>
                                {item.status || 'available'}
                              </Badge>
                              <Badge variant="outline">
                                {item.type === 'donate' ? 'Donation' : 'Rental'}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                <Eye className="inline mr-1" size={12} />
                                {item.viewCount || 0} views
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <MapPin size={12} className="mr-1" />
                              {item.location}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit3 size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteItemMutation.mutate(item.id)}
                            disabled={deleteItemMutation.isPending}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No items posted</h3>
                    <p className="text-gray-600 mb-4">Start by posting your first item!</p>
                    <Button className="bg-primary hover:bg-teal-600">Post First Item</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Requests */}
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>My Requests ({userRequests.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {requestsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="p-4 bg-gray-50 rounded-lg animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-16 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : userRequests.length > 0 ? (
                  <div className="space-y-4">
                    {userRequests.map((request) => (
                      <div key={request.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{request.title}</h4>
                            <p className="text-gray-600 mt-1 line-clamp-2">{request.description}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge className={getStatusColor(request.status || 'active')}>
                                {request.status || 'active'}
                              </Badge>
                              <Badge variant="outline">
                                {request.type === 'donate' ? 'Looking for Donation' : 'Looking for Rental'}
                              </Badge>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <MapPin size={12} className="mr-1" />
                              {request.location} • {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No requests made</h3>
                    <p className="text-gray-600 mb-4">Create your first request!</p>
                    <Button className="bg-secondary hover:bg-red-500">Post First Request</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Received Requests */}
          <TabsContent value="received">
            <Card>
              <CardHeader>
                <CardTitle>Received Requests ({receivedRequests.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {receivedLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="p-4 bg-gray-50 rounded-lg animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-12 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : receivedRequests.length > 0 ? (
                  <div className="space-y-4">
                    {receivedRequests.map((request) => (
                      <div key={request.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {getStatusIcon(request.status)}
                              <Badge className={getStatusColor(request.status)}>
                                {request.status}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-2">{request.message}</p>
                            <p className="text-sm text-gray-500">
                              {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          {request.status === 'pending' && (
                            <div className="flex space-x-2 ml-4">
                              <Button
                                size="sm"
                                onClick={() => requestStatusMutation.mutate({ id: request.id, status: 'approved' })}
                                disabled={requestStatusMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => requestStatusMutation.mutate({ id: request.id, status: 'rejected' })}
                                disabled={requestStatusMutation.isPending}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No requests received</h3>
                    <p className="text-gray-600">Requests for your items will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sent Requests */}
          <TabsContent value="sent">
            <Card>
              <CardHeader>
                <CardTitle>Sent Requests ({sentRequests.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {sentLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="p-4 bg-gray-50 rounded-lg animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-12 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : sentRequests.length > 0 ? (
                  <div className="space-y-4">
                    {sentRequests.map((request) => (
                      <div key={request.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusIcon(request.status)}
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{request.message}</p>
                        <p className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No requests sent</h3>
                    <p className="text-gray-600">Your item requests will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Favorites */}
          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle>My Favorites ({favorites.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {favoritesLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="p-4 bg-gray-50 rounded-lg animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-12 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : favorites.length > 0 ? (
                  <div className="space-y-4">
                    {favorites.map((favorite) => (
                      <div key={favorite.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Heart className="text-red-500 fill-current" size={16} />
                          <Badge variant="outline">
                            {favorite.itemId ? 'Item' : 'Request'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Saved {formatDistanceToNow(new Date(favorite.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
                    <p className="text-gray-600">Save items and requests you're interested in.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Point Transactions ({transactions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                      </div>
                    ))}
                  </div>
                ) : transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <div className={`font-bold ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}{transaction.amount} points
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                    <p className="text-gray-600">Your point transactions will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
