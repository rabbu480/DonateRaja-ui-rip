import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Request } from "@shared/schema";
import { MapPin, Gift, HandHeart, Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RequestCardProps {
  request: Request & { user?: { firstName?: string; lastName?: string; profileImageUrl?: string } };
  onOfferClick?: (request: Request) => void;
}

export default function RequestCard({ request, onOfferClick }: RequestCardProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFavorited, setIsFavorited] = useState(false);

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorited) {
        return await apiRequest("DELETE", "/api/favorites", { requestId: request.id });
      } else {
        return await apiRequest("POST", "/api/favorites", { requestId: request.id });
      }
    },
    onSuccess: () => {
      setIsFavorited(!isFavorited);
      toast({
        title: isFavorited ? "Removed from favorites" : "Added to favorites",
        description: isFavorited ? "Request removed from your favorites" : "Request added to your favorites",
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

  const handleFavoriteClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to add requests to favorites",
        variant: "destructive",
      });
      return;
    }
    favoriteMutation.mutate();
  };

  const handleOfferClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to offer items",
        variant: "destructive",
      });
      return;
    }
    if (onOfferClick) {
      onOfferClick(request);
    } else {
      // Redirect to post item with this request context
      toast({
        title: "Feature Coming Soon",
        description: "Direct offer functionality will be available soon!",
      });
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
  };

  return (
    <Card className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={request.user?.profileImageUrl} />
            <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white font-bold">
              {getInitials(request.user?.firstName, request.user?.lastName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold text-gray-900">
              {request.user?.firstName ? `${request.user.firstName} ${request.user.lastName || ''}` : 'Anonymous User'}
            </h4>
            <div className="flex items-center text-sm text-gray-500">
              <MapPin size={14} className="mr-1" />
              <span>{request.location}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge 
            variant={request.type === "donate" ? "default" : "secondary"}
            className={request.type === "donate" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}
          >
            LOOKING FOR {request.type === "donate" ? "DONATION" : "RENTAL"}
          </Badge>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFavoriteClick}
            disabled={favoriteMutation.isPending}
          >
            <Heart 
              size={16} 
              className={isFavorited ? "fill-red-500 text-red-500" : "text-gray-400"} 
            />
          </Button>
        </div>
      </div>
      
      <h3 className="font-semibold text-lg text-gray-900 mb-2">
        {request.title}
      </h3>
      
      <p className="text-gray-600 mb-4 line-clamp-3">
        {request.description}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
        </div>
        
        <Button
          onClick={handleOfferClick}
          className={`${
            request.type === "donate"
              ? "bg-primary hover:bg-teal-600"
              : "bg-secondary hover:bg-red-500"
          } text-white font-medium`}
        >
          {request.type === "donate" ? (
            <Gift size={16} className="mr-2" />
          ) : (
            <HandHeart size={16} className="mr-2" />
          )}
          Offer {request.type === "donate" ? "Item" : "Rental"}
        </Button>
      </div>
    </Card>
  );
}
