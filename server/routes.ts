import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertItemSchema, 
  insertRequestSchema, 
  insertItemRequestSchema,
  insertMessageSchema,
  insertReviewSchema,
  insertBannerSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Item routes
  app.get('/api/items', async (req, res) => {
    try {
      const { category, type, pincode, limit, search } = req.query;
      
      let items;
      if (search) {
        items = await storage.searchItems(search as string, {
          category: category as string,
          type: type as string,
          pincode: pincode as string
        });
      } else {
        items = await storage.getItems({
          category: category as string,
          type: type as string,
          pincode: pincode as string,
          limit: limit ? parseInt(limit as string) : undefined
        });
      }
      
      res.json(items);
    } catch (error) {
      console.error("Error fetching items:", error);
      res.status(500).json({ message: "Failed to fetch items" });
    }
  });

  app.get('/api/items/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.getItem(id);
      
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      res.json(item);
    } catch (error) {
      console.error("Error fetching item:", error);
      res.status(500).json({ message: "Failed to fetch item" });
    }
  });

  app.post('/api/items', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemData = insertItemSchema.parse(req.body);
      
      const item = await storage.createItem({ ...itemData, userId });
      
      // Create notification for signup bonus (if new user)
      await storage.createNotification({
        userId,
        title: "Item Posted Successfully!",
        message: `Your item "${item.title}" has been posted and is now visible to the community.`,
        type: "system"
      });
      
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid item data", errors: error.errors });
      }
      console.error("Error creating item:", error);
      res.status(500).json({ message: "Failed to create item" });
    }
  });

  app.put('/api/items/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      const updates = insertItemSchema.partial().parse(req.body);
      
      // Check if user owns the item
      const existingItem = await storage.getItem(id);
      if (!existingItem || existingItem.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const item = await storage.updateItem(id, updates);
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid item data", errors: error.errors });
      }
      console.error("Error updating item:", error);
      res.status(500).json({ message: "Failed to update item" });
    }
  });

  app.delete('/api/items/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      
      // Check if user owns the item
      const existingItem = await storage.getItem(id);
      if (!existingItem || existingItem.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.deleteItem(id);
      res.json({ message: "Item deleted successfully" });
    } catch (error) {
      console.error("Error deleting item:", error);
      res.status(500).json({ message: "Failed to delete item" });
    }
  });

  app.get('/api/items/user/my-items', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const items = await storage.getUserItems(userId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching user items:", error);
      res.status(500).json({ message: "Failed to fetch user items" });
    }
  });

  // Request routes
  app.get('/api/requests', async (req, res) => {
    try {
      const { category, type, pincode, limit, search } = req.query;
      
      let requests;
      if (search) {
        requests = await storage.searchRequests(search as string, {
          category: category as string,
          type: type as string,
          pincode: pincode as string
        });
      } else {
        requests = await storage.getRequests({
          category: category as string,
          type: type as string,
          pincode: pincode as string,
          limit: limit ? parseInt(limit as string) : undefined
        });
      }
      
      res.json(requests);
    } catch (error) {
      console.error("Error fetching requests:", error);
      res.status(500).json({ message: "Failed to fetch requests" });
    }
  });

  app.post('/api/requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requestData = insertRequestSchema.parse(req.body);
      
      const request = await storage.createRequest({ ...requestData, userId });
      
      // Create notification
      await storage.createNotification({
        userId,
        title: "Request Posted Successfully!",
        message: `Your request "${request.title}" has been posted. Community members can now offer items.`,
        type: "system"
      });
      
      res.json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      console.error("Error creating request:", error);
      res.status(500).json({ message: "Failed to create request" });
    }
  });

  app.get('/api/requests/user/my-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requests = await storage.getUserRequests(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching user requests:", error);
      res.status(500).json({ message: "Failed to fetch user requests" });
    }
  });

  // Item request routes
  app.post('/api/item-requests', isAuthenticated, async (req: any, res) => {
    try {
      const requesterId = req.user.claims.sub;
      const requestData = insertItemRequestSchema.parse({ ...req.body, requesterId });
      
      const itemRequest = await storage.createItemRequest(requestData);
      
      // Get item owner and create notification
      const item = await storage.getItem(requestData.itemId);
      if (item) {
        await storage.createNotification({
          userId: item.userId,
          title: "New Item Request",
          message: `Someone is interested in your item "${item.title}". Check your requests to approve or decline.`,
          type: "request",
          metadata: { itemId: item.id, requestId: itemRequest.id }
        });
      }
      
      res.json(itemRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      console.error("Error creating item request:", error);
      res.status(500).json({ message: "Failed to create item request" });
    }
  });

  app.get('/api/item-requests/received', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // Get items owned by user, then get requests for those items
      const userItems = await storage.getUserItems(userId);
      const itemIds = userItems.map(item => item.id);
      
      const allRequests = [];
      for (const itemId of itemIds) {
        const requests = await storage.getItemRequests(itemId);
        allRequests.push(...requests);
      }
      
      res.json(allRequests);
    } catch (error) {
      console.error("Error fetching received requests:", error);
      res.status(500).json({ message: "Failed to fetch received requests" });
    }
  });

  app.get('/api/item-requests/sent', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { status } = req.query;
      
      const requests = await storage.getUserItemRequests(userId, status as string);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching sent requests:", error);
      res.status(500).json({ message: "Failed to fetch sent requests" });
    }
  });

  app.patch('/api/item-requests/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const itemRequest = await storage.updateItemRequestStatus(id, status);
      
      if (itemRequest && status === 'approved') {
        // Create conversation if approved
        const item = await storage.getItem(itemRequest.itemId);
        if (item) {
          await storage.createConversation({
            itemId: item.id,
            participant1Id: item.userId,
            participant2Id: itemRequest.requesterId
          });
          
          // Notify requester
          await storage.createNotification({
            userId: itemRequest.requesterId,
            title: "Request Approved!",
            message: `Your request for "${item.title}" has been approved. You can now chat with the owner.`,
            type: "chat",
            metadata: { itemId: item.id }
          });
        }
      }
      
      res.json(itemRequest);
    } catch (error) {
      console.error("Error updating request status:", error);
      res.status(500).json({ message: "Failed to update request status" });
    }
  });

  // Conversation routes
  app.get('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get('/api/conversations/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversationId = parseInt(req.params.id);
      
      // Check if user is participant
      const conversation = await storage.getConversation(conversationId);
      if (!conversation || (conversation.participant1Id !== userId && conversation.participant2Id !== userId)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const messages = await storage.getConversationMessages(conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Favorite routes
  app.post('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { itemId, requestId } = req.body;
      
      const favorite = await storage.addFavorite(userId, itemId, requestId);
      res.json(favorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  app.delete('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { itemId, requestId } = req.body;
      
      await storage.removeFavorite(userId, itemId, requestId);
      res.json({ message: "Favorite removed" });
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  app.get('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  // Review routes
  app.post('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const reviewerId = req.user.claims.sub;
      const reviewData = insertReviewSchema.parse({ ...req.body, reviewerId });
      
      const review = await storage.createReview(reviewData);
      res.json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.get('/api/reviews/item/:itemId', async (req, res) => {
    try {
      const itemId = parseInt(req.params.itemId);
      const reviews = await storage.getItemReviews(itemId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching item reviews:", error);
      res.status(500).json({ message: "Failed to fetch item reviews" });
    }
  });

  app.get('/api/reviews/user/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      const reviews = await storage.getUserReviews(userId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching user reviews:", error);
      res.status(500).json({ message: "Failed to fetch user reviews" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markNotificationAsRead(id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Transaction routes
  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { type, amount, description, metadata } = req.body;
      
      const transaction = await storage.createTransaction(userId, type, amount, description, metadata);
      res.json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  // Banner routes
  app.get('/api/banners', async (req, res) => {
    try {
      const banners = await storage.getBanners(true);
      res.json(banners);
    } catch (error) {
      console.error("Error fetching banners:", error);
      res.status(500).json({ message: "Failed to fetch banners" });
    }
  });

  // Admin routes
  app.post('/api/admin/banners', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const bannerData = insertBannerSchema.parse(req.body);
      const banner = await storage.createBanner(bannerData);
      res.json(banner);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid banner data", errors: error.errors });
      }
      console.error("Error creating banner:", error);
      res.status(500).json({ message: "Failed to create banner" });
    }
  });

  app.get('/api/admin/banners', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const banners = await storage.getBanners(false);
      res.json(banners);
    } catch (error) {
      console.error("Error fetching admin banners:", error);
      res.status(500).json({ message: "Failed to fetch banners" });
    }
  });

  // WebSocket setup
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket, req) => {
    console.log('New WebSocket connection');
    
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'chat_message') {
          const { conversationId, senderId, content } = message;
          
          // Save message to database
          const newMessage = await storage.createMessage({
            conversationId,
            senderId,
            content
          });
          
          // Broadcast to all connected clients in the conversation
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'new_message',
                message: newMessage
              }));
            }
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}
