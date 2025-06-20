import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import FilterTabs from "@/components/FilterTabs";
import ItemCard from "@/components/ItemCard";
import RequestCard from "@/components/RequestCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  MapPin, 
  Package, 
  MessageCircle,
  Grid3X3,
  List,
  SlidersHorizontal
} from "lucide-react";
import { SearchFilters, CATEGORIES } from "@/lib/types";
import { Item, Request } from "@shared/schema";

export default function Browse() {
  const [location] = useLocation();
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [activeTab, setActiveTab] = useState("items");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [localPincode, setLocalPincode] = useState("");

  // Parse URL params on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const filters: SearchFilters = {};
    
    if (urlParams.get('type')) filters.type = urlParams.get('type')!;
    if (urlParams.get('category')) filters.category = urlParams.get('category')!;
    if (urlParams.get('pincode')) filters.pincode = urlParams.get('pincode')!;
    if (urlParams.get('search')) filters.search = urlParams.get('search')!;
    if (urlParams.get('tab')) setActiveTab(urlParams.get('tab')!);
    
    setSearchFilters(filters);
    setLocalPincode(filters.pincode || "");
  }, [location]);

  // Fetch items
  const { data: items = [], isLoading: itemsLoading, refetch: refetchItems } = useQuery<Item[]>({
    queryKey: ["/api/items", searchFilters],
  });

  // Fetch requests
  const { data: requests = [], isLoading: requestsLoading, refetch: refetchRequests } = useQuery<Request[]>({
    queryKey: ["/api/requests", searchFilters],
  });

  const handleSearch = (query: string) => {
    const newFilters = { ...searchFilters, search: query };
    setSearchFilters(newFilters);
    updateURL(newFilters);
  };

  const handleFilterChange = (filters: SearchFilters) => {
    setSearchFilters(filters);
    updateURL(filters);
  };

  const handlePincodeChange = (pincode: string) => {
    setLocalPincode(pincode);
    if (pincode.length === 6) {
      const newFilters = { ...searchFilters, pincode };
      setSearchFilters(newFilters);
      updateURL(newFilters);
    } else if (pincode.length === 0) {
      const newFilters = { ...searchFilters };
      delete newFilters.pincode;
      setSearchFilters(newFilters);
      updateURL(newFilters);
    }
  };

  const updateURL = (filters: SearchFilters) => {
    const params = new URLSearchParams();
    if (filters.type) params.set('type', filters.type);
    if (filters.category) params.set('category', filters.category);
    if (filters.pincode) params.set('pincode', filters.pincode);
    if (filters.search) params.set('search', filters.search);
    if (activeTab !== 'items') params.set('tab', activeTab);
    
    const newURL = `/browse${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState(null, '', newURL);
  };

  const clearFilters = () => {
    setSearchFilters({});
    setLocalPincode("");
    window.history.replaceState(null, '', '/browse');
  };

  const hasActiveFilters = Object.keys(searchFilters).length > 0;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">
            Discover & Share
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Find amazing items and help others in your community
          </p>
          
          {/* Search Bar */}
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
            {/* Location Filter */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <MapPin size={20} className="text-gray-400" />
                <Input
                  placeholder="Enter pincode"
                  value={localPincode}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  className="w-32"
                  maxLength={6}
                />
              </div>
              
              <Select
                value={searchFilters.category || ""}
                onValueChange={(value) => handleFilterChange({ 
                  ...searchFilters, 
                  category: value || undefined 
                })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* View Controls */}
            <div className="flex items-center space-x-4">
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <SlidersHorizontal size={16} className="mr-2" />
                Filters
              </Button>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 size={16} />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List size={16} />
                </Button>
              </div>
            </div>
          </div>

          {/* Filter Tags */}
          <FilterTabs filters={searchFilters} onFilterChange={handleFilterChange} />

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-4">
              {searchFilters.search && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <Search size={12} />
                  <span>"{searchFilters.search}"</span>
                </Badge>
              )}
              {searchFilters.pincode && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <MapPin size={12} />
                  <span>{searchFilters.pincode}</span>
                </Badge>
              )}
              {searchFilters.type && (
                <Badge variant="secondary">
                  {searchFilters.type === 'donate' ? 'Donations' : 'Rentals'}
                </Badge>
              )}
              {searchFilters.category && (
                <Badge variant="secondary">{searchFilters.category}</Badge>
              )}
            </div>
          )}
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto bg-gray-100 dark:bg-gray-800">
            <TabsTrigger value="items" className="flex items-center space-x-2 data-[state=active]:bg-red-100 data-[state=active]:text-red-800">
              <Package size={16} />
              <span>Items ({items.length})</span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center space-x-2 data-[state=active]:bg-orange-100 data-[state=active]:text-orange-800">
              <MessageCircle size={16} />
              <span>Requests ({requests.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Items Tab */}
          <TabsContent value="items">
            {itemsLoading ? (
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                : "space-y-4"
              }>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className={viewMode === "grid" 
                    ? "bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse" 
                    : "flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm animate-pulse"
                  }>
                    <div className={viewMode === "grid" ? "h-48 bg-gray-200" : "w-24 h-24 bg-gray-200 rounded"}>
                    </div>
                    <div className={viewMode === "grid" ? "p-4 space-y-3" : "flex-1 space-y-2"}>
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                      {viewMode === "grid" && <div className="h-8 bg-gray-200 rounded"></div>}
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length > 0 ? (
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                : "space-y-4"
              }>
                {items.map((item) => (
                  viewMode === "grid" ? (
                    <ItemCard key={item.id} item={item} />
                  ) : (
                    <Card key={item.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0">
                            {item.images && item.images.length > 0 ? (
                              <img 
                                src={item.images[0]} 
                                alt={item.title}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Package size={24} />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge 
                                variant={item.type === "donate" ? "default" : "secondary"}
                                className={item.type === "donate" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}
                              >
                                {item.type === "donate" ? "DONATION" : "RENTAL"}
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                            <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-sm text-gray-500">
                                <MapPin size={14} className="mr-1" />
                                <span>{item.location}</span>
                              </div>
                              {item.type === "rent" && item.price && (
                                <div className="text-lg font-bold text-secondary">
                                  ₹{item.price}/{item.priceUnit}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Package className="mx-auto text-gray-400 mb-4" size={64} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {hasActiveFilters ? "No items match your filters" : "No items available"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {hasActiveFilters 
                    ? "Try adjusting your search criteria or post the first item in this category."
                    : "Be the first to post an item and start the sharing community!"
                  }
                </p>
                <div className="space-x-4">
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                  <Button className="bg-primary hover:bg-teal-600">
                    Post First Item
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests">
            {requestsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        <div className="h-3 w-32 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-16 bg-gray-200 rounded"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : requests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <MessageCircle className="mx-auto text-gray-400 mb-4" size={64} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {hasActiveFilters ? "No requests match your filters" : "No requests yet"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {hasActiveFilters 
                    ? "Try adjusting your search criteria or be the first to post a request."
                    : "Be the first to request something from the community!"
                  }
                </p>
                <div className="space-x-4">
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                  <Button className="bg-secondary hover:bg-red-500">
                    Post First Request
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
