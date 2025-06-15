import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Item } from "@shared/schema";
import { Heart, MapPin, Star, Send } from "lucide-react";

interface ItemCardProps {
  item: Item;
  onRequestClick?: (item: Item) => void;
}

export default function ItemCard({ item, onRequestClick }: ItemCardProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFavorited, setIsFavorited] = useState(false);

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorited) {
        return await apiRequest("DELETE", "/api/favorites", { itemId: item.id });
      } else {
        return await apiRequest("POST", "/api/favorites", { itemId: item.id });
      }
    },
    onSuccess: () => {
      setIsFavorited(!isFavorited);
      toast({
        title: isFavorited ? "Removed from favorites" : "Added to favorites",
        description: isFavorited ? "Item removed from your favorites" : "Item added to your favorites",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const requestMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/item-requests", {
        itemId: item.id,
        message: `I'm interested in your ${item.title}. Is it still available?`
      });
    },
    onSuccess: () => {
      toast({
        title: "Request Sent!",
        description: "Your request has been sent. The owner will be notified.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/item-requests"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFavoriteClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to add items to favorites",
        variant: "destructive",
      });
      return;
    }
    favoriteMutation.mutate();
  };

  const handleRequestClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to request items",
        variant: "destructive",
      });
      return;
    }
    if (onRequestClick) {
      onRequestClick(item);
    } else {
      requestMutation.mutate();
    }
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        {item.images && item.images.length > 0 ? (
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        
        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFavoriteClick}
          disabled={favoriteMutation.isPending}
          className="absolute top-2 right-2 bg-white/80 hover:bg-white"
        >
          <Heart 
            size={16} 
            className={isFavorited ? "fill-red-500 text-red-500" : "text-gray-400"} 
          />
        </Button>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge 
            variant={item.type === "donate" ? "default" : "secondary"}
            className={item.type === "donate" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}
          >
            {item.type === "donate" ? "DONATION" : "RENTAL"}
          </Badge>
        </div>

        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
          {item.title}
        </h3>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {item.description}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin size={14} className="mr-1" />
            <span className="line-clamp-1">{item.location}</span>
          </div>
          
          {item.type === "rent" && item.price && (
            <div className="text-lg font-bold text-secondary">
              ₹{item.price}/{item.priceUnit}
            </div>
          )}
        </div>

        {/* Rating */}
        {parseFloat(item.rating || "0") > 0 && (
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < Math.floor(parseFloat(item.rating || "0"))
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-1">
              {item.rating} ({item.totalReviews} reviews)
            </span>
          </div>
        )}

        <Button
          onClick={handleRequestClick}
          disabled={requestMutation.isPending}
          className={`w-full mt-2 ${
            item.type === "donate"
              ? "bg-primary hover:bg-teal-600"
              : "bg-secondary hover:bg-red-500"
          } text-white font-medium`}
        >
          <Send size={16} className="mr-2" />
          {requestMutation.isPending ? "Sending..." : "Send Request"}
        </Button>
      </CardContent>
    </Card>
  );
}
