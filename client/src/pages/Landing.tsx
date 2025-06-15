import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import SearchBar from "@/components/SearchBar";
import FilterTabs from "@/components/FilterTabs";
import ItemCard from "@/components/ItemCard";
import RequestCard from "@/components/RequestCard";
import AuthModal from "@/components/AuthModal";
import PostItemModal from "@/components/PostItemModal";
import { 
  Gift, 
  HandHeart, 
  Megaphone, 
  UserPlus, 
  Camera, 
  MessageCircle,
  CheckCircle,
  Star,
  Twitter,
  Instagram,
  MessageSquare
} from "lucide-react";
import { SearchFilters, StatsData } from "@/lib/types";
import { Item, Request, Banner } from "@shared/schema";

export default function Landing() {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);

  // Fetch featured items
  const { data: items = [], isLoading: itemsLoading } = useQuery<Item[]>({
    queryKey: ["/api/items", { limit: 8, ...searchFilters }],
  });

  // Fetch recent requests
  const { data: requests = [], isLoading: requestsLoading } = useQuery<Request[]>({
    queryKey: ["/api/requests", { limit: 6 }],
  });

  // Fetch active banners
  const { data: banners = [] } = useQuery<Banner[]>({
    queryKey: ["/api/banners"],
  });

  const handleSearch = (query: string) => {
    setSearchFilters({ ...searchFilters, search: query });
  };

  const handleFilterChange = (filters: SearchFilters) => {
    setSearchFilters(filters);
  };

  // Mock stats data - in production this would come from an API
  const statsData: StatsData = {
    totalUsers: 3500,
    totalItems: 10000,
    cities: 50,
    transactions: 25000
  };

  const activeBanner = banners[0];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-white to-secondary/10 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-6xl font-bold text-neutral-900 mb-6">
              Share, Care & Connect
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Join India's largest community for donating, renting, and requesting items. 
              Make a difference while saving money and reducing waste.
            </p>
            
            {/* Search Bar */}
            <div className="mb-8">
              <SearchBar onSearch={handleSearch} />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg"
                className="bg-primary hover:bg-teal-600 text-white px-8 py-4 text-lg font-semibold"
                onClick={() => window.location.href = "/browse"}
              >
                <Gift className="mr-3" size={20} />
                Browse Donations
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 text-lg font-semibold"
                onClick={() => window.location.href = "/browse?type=rent"}
              >
                <HandHeart className="mr-3" size={20} />
                View Rentals
              </Button>
              <Button 
                size="lg"
                className="bg-secondary hover:bg-red-500 text-white px-8 py-4 text-lg font-semibold"
                onClick={() => setShowPostModal(true)}
              >
                <Megaphone className="mr-3" size={20} />
                Make Request
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="text-3xl font-bold text-primary mb-2">{statsData.totalUsers.toLocaleString()}+</div>
                <div className="text-gray-600">Active Users</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="text-3xl font-bold text-secondary mb-2">{statsData.totalItems.toLocaleString()}+</div>
                <div className="text-gray-600">Items Shared</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="text-3xl font-bold text-primary mb-2">{statsData.cities}+</div>
                <div className="text-gray-600">Cities</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="text-3xl font-bold text-secondary mb-2">{statsData.transactions.toLocaleString()}+</div>
                <div className="text-gray-600">Successful Exchanges</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              Available Near You
            </h2>
            <p className="text-xl text-gray-600">
              Discover amazing items available for donation and rent in your area
            </p>
          </div>

          {/* Filter Tabs */}
          <FilterTabs filters={searchFilters} onFilterChange={handleFilterChange} />

          {/* Items Grid */}
          {itemsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="h-48 bg-gray-200 animate-pulse"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Gift size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-600">Try adjusting your filters or be the first to post an item!</p>
              <Button 
                onClick={() => setShowPostModal(true)}
                className="mt-4 bg-primary hover:bg-teal-600"
              >
                Post First Item
              </Button>
            </div>
          )}

          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.location.href = "/browse"}
              className="px-8 py-3 text-lg hover:bg-gray-100"
            >
              View All Items
            </Button>
          </div>
        </div>
      </section>

      {/* Requests Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              Help Others Find What They Need
            </h2>
            <p className="text-xl text-gray-600">
              Community members are looking for these items. Can you help?
            </p>
          </div>

          {requestsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
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
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Megaphone size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
              <p className="text-gray-600">Be the first to post a request for something you need!</p>
              <Button 
                onClick={() => setShowPostModal(true)}
                className="mt-4 bg-secondary hover:bg-red-500"
              >
                Post First Request
              </Button>
            </div>
          )}

          <div className="text-center mt-12">
            <Button 
              onClick={() => setShowPostModal(true)}
              size="lg"
              className="bg-secondary hover:bg-red-500 text-white px-8 py-3 text-lg"
            >
              <Megaphone className="mr-2" size={20} />
              Post Your Request
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              How DonateRaja Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to start sharing and caring in your community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <UserPlus className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Sign Up Free</h3>
              <p className="text-gray-600">
                Create your account in seconds and get 300 bonus points to start chatting with other users.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Camera className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Post or Browse</h3>
              <p className="text-gray-600">
                Share items you want to donate/rent, or browse what others are offering near you.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <MessageCircle className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Connect & Exchange</h3>
              <p className="text-gray-600">
                Send requests, chat with users, and arrange pickup/delivery. Rate your experience!
              </p>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="mt-16 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Choose DonateRaja?</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-primary" size={20} />
                    <span className="text-gray-700">100% Free to post and browse items</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-primary" size={20} />
                    <span className="text-gray-700">Verified users and secure messaging</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-primary" size={20} />
                    <span className="text-gray-700">Local community focus with pincode filtering</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-primary" size={20} />
                    <span className="text-gray-700">Reduce waste and help your neighbors</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="w-64 h-64 bg-gray-200 rounded-xl mx-auto flex items-center justify-center">
                  <div className="text-gray-400 text-center">
                    <HandHeart size={48} className="mx-auto mb-2" />
                    <p>Community Sharing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Banner */}
      {activeBanner && (
        <section className="py-12 bg-gradient-to-r from-primary to-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-white">
              <h3 className="text-2xl font-bold mb-4">
                📚 {activeBanner.title}
              </h3>
              <p className="text-xl mb-6">{activeBanner.description}</p>
              
              {/* Progress Bar */}
              {activeBanner.target && (
                <div className="max-w-md mx-auto mb-6">
                  <div className="bg-white/20 rounded-full h-4 mb-2">
                    <div 
                      className="bg-white rounded-full h-4 transition-all duration-300"
                      style={{ 
                        width: `${Math.min(((activeBanner.collected || 0) / activeBanner.target) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="text-sm">
                    <span>{activeBanner.collected || 0}</span> of <span>{activeBanner.target}</span> items collected 
                    ({Math.round(((activeBanner.collected || 0) / activeBanner.target) * 100)}%)
                  </div>
                </div>
              )}

              <Button 
                className="bg-white text-primary hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
                onClick={() => {
                  if (activeBanner.linkUrl) {
                    window.open(activeBanner.linkUrl, '_blank');
                  }
                }}
              >
                Contribute Now
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <HandHeart className="text-white" size={20} />
                </div>
                <span className="text-xl font-bold">DonateRaja</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Building stronger communities through sharing. Join thousands of users who are making a difference 
                by donating, renting, and helping their neighbors.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="w-10 h-10 bg-gray-800 hover:bg-primary rounded-lg p-0">
                  <Twitter size={16} />
                </Button>
                <Button variant="ghost" size="sm" className="w-10 h-10 bg-gray-800 hover:bg-primary rounded-lg p-0">
                  <Instagram size={16} />
                </Button>
                <Button variant="ghost" size="sm" className="w-10 h-10 bg-gray-800 hover:bg-primary rounded-lg p-0">
                  <MessageSquare size={16} />
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/browse" className="hover:text-white transition-colors">Browse Items</a></li>
                <li><button onClick={() => setShowPostModal(true)} className="hover:text-white transition-colors">Post Item</button></li>
                <li><a href="/browse?requests=true" className="hover:text-white transition-colors">View Requests</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="/guidelines" className="hover:text-white transition-colors">Community Guidelines</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/help" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/report" className="hover:text-white transition-colors">Report Issue</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 DonateRaja. All rights reserved. Made with ❤️ for the community.</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      <PostItemModal open={showPostModal} onOpenChange={setShowPostModal} />
    </div>
  );
}
