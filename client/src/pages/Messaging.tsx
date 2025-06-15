import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Send, 
  MessageCircle, 
  Search,
  Phone,
  Video,
  MoreVertical,
  Paperclip
} from "lucide-react";
import { Conversation, Message } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function Messaging() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
    enabled: isAuthenticated,
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/conversations", selectedConversation, "messages"],
    enabled: isAuthenticated && selectedConversation !== null,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      if (!selectedConversation) throw new Error("No conversation selected");
      
      // Send via WebSocket
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'chat_message',
          conversationId: selectedConversation,
          senderId: user?.id,
          content
        }));
      }
      
      // Also save to database via API
      return await apiRequest("POST", "/api/messages", {
        conversationId: selectedConversation,
        senderId: user?.id,
        content
      });
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ 
        queryKey: ["/api/conversations", selectedConversation, "messages"] 
      });
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
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Setup WebSocket connection
  useEffect(() => {
    if (!isAuthenticated) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'new_message') {
          // Refresh messages for the conversation
          queryClient.invalidateQueries({ 
            queryKey: ["/api/conversations", data.message.conversationId, "messages"] 
          });
          // Refresh conversations list to update last message
          queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, [isAuthenticated, queryClient]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    sendMessageMutation.mutate({ content: newMessage.trim() });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter(conversation => {
    // Filter based on search query - this would need participant names from the API
    return true; // Simplified for now
  });

  const getOtherParticipant = (conversation: Conversation) => {
    // In a real app, this would return the other participant's details
    const otherUserId = conversation.participant1Id === user?.id 
      ? conversation.participant2Id 
      : conversation.participant1Id;
    
    return {
      id: otherUserId,
      name: "Community Member", // This would come from user data
      avatar: null,
      isOnline: false
    };
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return formatDistanceToNow(date, { addSuffix: true });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-12 gap-6 h-96">
              <div className="col-span-4 bg-gray-200 rounded"></div>
              <div className="col-span-8 bg-gray-200 rounded"></div>
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
              <MessageCircle className="mx-auto text-gray-400 mb-4" size={64} />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
              <p className="text-gray-600 mb-6">Please login to view your messages.</p>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Chat with community members</p>
        </div>

        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="col-span-12 lg:col-span-4">
            <Card className="h-full">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <span>Conversations</span>
                  <Badge variant="secondary">{conversations.length}</Badge>
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-full">
                  {conversationsLoading ? (
                    <div className="space-y-4 p-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-3 p-3 animate-pulse">
                          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredConversations.length > 0 ? (
                    <div className="space-y-1">
                      {filteredConversations.map((conversation) => {
                        const otherParticipant = getOtherParticipant(conversation);
                        const isSelected = selectedConversation === conversation.id;
                        
                        return (
                          <div
                            key={conversation.id}
                            onClick={() => setSelectedConversation(conversation.id)}
                            className={`flex items-center space-x-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                              isSelected ? 'bg-primary/10 border-r-2 border-primary' : ''
                            }`}
                          >
                            <div className="relative">
                              <Avatar>
                                <AvatarImage src={otherParticipant.avatar || undefined} />
                                <AvatarFallback className="bg-primary text-white">
                                  {otherParticipant.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              {otherParticipant.isOnline && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900 truncate">
                                  {otherParticipant.name}
                                </h4>
                                <span className="text-xs text-gray-500">
                                  {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 truncate">
                                Last message preview...
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <MessageCircle className="mx-auto text-gray-400 mb-4" size={48} />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
                      <p className="text-gray-600">Start chatting by requesting items from the community!</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="col-span-12 lg:col-span-8">
            {selectedConversation ? (
              <Card className="h-full flex flex-col">
                {/* Chat Header */}
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={undefined} />
                        <AvatarFallback className="bg-primary text-white">
                          CM
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900">Community Member</h3>
                        <p className="text-sm text-gray-500">Online</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Phone size={16} />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video size={16} />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical size={16} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-hidden">
                  <ScrollArea className="h-full">
                    {messagesLoading ? (
                      <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg animate-pulse ${
                              i % 2 === 0 ? 'bg-gray-200' : 'bg-gray-200'
                            }`}>
                              <div className="h-4 bg-gray-300 rounded w-24"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : messages.length > 0 ? (
                      <div className="space-y-4">
                        {messages.map((message) => {
                          const isOwn = message.senderId === user?.id;
                          
                          return (
                            <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                isOwn 
                                  ? 'bg-primary text-white' 
                                  : 'bg-gray-100 text-gray-900'
                              }`}>
                                <p className="text-sm">{message.content}</p>
                                <p className={`text-xs mt-1 ${
                                  isOwn ? 'text-primary-foreground/70' : 'text-gray-500'
                                }`}>
                                  {formatMessageTime(message.createdAt)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-center">
                        <div>
                          <MessageCircle className="mx-auto text-gray-400 mb-4" size={48} />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Start the conversation</h3>
                          <p className="text-gray-600">Send a message to begin chatting!</p>
                        </div>
                      </div>
                    )}
                  </ScrollArea>
                </div>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Paperclip size={16} />
                    </Button>
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={sendMessageMutation.isPending}
                        className="pr-12"
                      />
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      size="sm"
                      className="bg-primary hover:bg-teal-600"
                    >
                      <Send size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="mx-auto text-gray-400 mb-4" size={64} />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-600">Choose a conversation from the list to start chatting</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
