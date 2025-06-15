import {
  users,
  items,
  requests,
  itemRequests,
  conversations,
  messages,
  reviews,
  favorites,
  notifications,
  transactions,
  banners,
  type User,
  type UpsertUser,
  type Item,
  type InsertItem,
  type Request,
  type InsertRequest,
  type ItemRequest,
  type InsertItemRequest,
  type Conversation,
  type Message,
  type InsertMessage,
  type Review,
  type InsertReview,
  type Favorite,
  type Notification,
  type InsertNotification,
  type Transaction,
  type Banner,
  type InsertBanner,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, sql, like, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserPoints(userId: string, points: number): Promise<void>;
  
  // Item operations
  createItem(item: InsertItem & { userId: string }): Promise<Item>;
  getItems(filters?: { category?: string; type?: string; pincode?: string; limit?: number }): Promise<Item[]>;
  getItem(id: number): Promise<Item | undefined>;
  updateItem(id: number, updates: Partial<InsertItem>): Promise<Item | undefined>;
  deleteItem(id: number): Promise<void>;
  getUserItems(userId: string): Promise<Item[]>;
  
  // Request operations
  createRequest(request: InsertRequest & { userId: string }): Promise<Request>;
  getRequests(filters?: { category?: string; type?: string; pincode?: string; limit?: number }): Promise<Request[]>;
  getRequest(id: number): Promise<Request | undefined>;
  updateRequest(id: number, updates: Partial<InsertRequest>): Promise<Request | undefined>;
  deleteRequest(id: number): Promise<void>;
  getUserRequests(userId: string): Promise<Request[]>;
  
  // Item request operations
  createItemRequest(itemRequest: InsertItemRequest): Promise<ItemRequest>;
  getItemRequests(itemId: number): Promise<ItemRequest[]>;
  getUserItemRequests(userId: string, status?: string): Promise<ItemRequest[]>;
  updateItemRequestStatus(id: number, status: string): Promise<ItemRequest | undefined>;
  
  // Conversation operations
  createConversation(data: { itemId?: number; requestId?: number; participant1Id: string; participant2Id: string }): Promise<Conversation>;
  getUserConversations(userId: string): Promise<Conversation[]>;
  getConversation(id: number): Promise<Conversation | undefined>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getConversationMessages(conversationId: number): Promise<Message[]>;
  
  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getItemReviews(itemId: number): Promise<Review[]>;
  getUserReviews(userId: string): Promise<Review[]>;
  
  // Favorite operations
  addFavorite(userId: string, itemId?: number, requestId?: number): Promise<Favorite>;
  removeFavorite(userId: string, itemId?: number, requestId?: number): Promise<void>;
  getUserFavorites(userId: string): Promise<Favorite[]>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<void>;
  
  // Transaction operations
  createTransaction(userId: string, type: string, amount: number, description: string, metadata?: any): Promise<Transaction>;
  getUserTransactions(userId: string): Promise<Transaction[]>;
  
  // Banner operations
  createBanner(banner: InsertBanner): Promise<Banner>;
  getBanners(activeOnly?: boolean): Promise<Banner[]>;
  updateBanner(id: number, updates: Partial<InsertBanner>): Promise<Banner | undefined>;
  
  // Search operations
  searchItems(query: string, filters?: { category?: string; type?: string; pincode?: string }): Promise<Item[]>;
  searchRequests(query: string, filters?: { category?: string; type?: string; pincode?: string }): Promise<Request[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserPoints(userId: string, points: number): Promise<void> {
    await db
      .update(users)
      .set({ points: sql`${users.points} + ${points}` })
      .where(eq(users.id, userId));
  }

  // Item operations
  async createItem(item: InsertItem & { userId: string }): Promise<Item> {
    const [newItem] = await db.insert(items).values(item).returning();
    return newItem;
  }

  async getItems(filters?: { category?: string; type?: string; pincode?: string; limit?: number }): Promise<Item[]> {
    let query = db.select().from(items).where(eq(items.status, "available"));
    
    if (filters?.category) {
      query = query.where(eq(items.category, filters.category));
    }
    if (filters?.type) {
      query = query.where(eq(items.type, filters.type));
    }
    if (filters?.pincode) {
      query = query.where(eq(items.pincode, filters.pincode));
    }
    
    query = query.orderBy(desc(items.createdAt));
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    return await query;
  }

  async getItem(id: number): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    if (item) {
      // Increment view count
      await db.update(items).set({ viewCount: sql`${items.viewCount} + 1` }).where(eq(items.id, id));
    }
    return item;
  }

  async updateItem(id: number, updates: Partial<InsertItem>): Promise<Item | undefined> {
    const [item] = await db
      .update(items)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(items.id, id))
      .returning();
    return item;
  }

  async deleteItem(id: number): Promise<void> {
    await db.delete(items).where(eq(items.id, id));
  }

  async getUserItems(userId: string): Promise<Item[]> {
    return await db.select().from(items).where(eq(items.userId, userId)).orderBy(desc(items.createdAt));
  }

  // Request operations
  async createRequest(request: InsertRequest & { userId: string }): Promise<Request> {
    const [newRequest] = await db.insert(requests).values(request).returning();
    return newRequest;
  }

  async getRequests(filters?: { category?: string; type?: string; pincode?: string; limit?: number }): Promise<Request[]> {
    let query = db.select().from(requests).where(eq(requests.status, "active"));
    
    if (filters?.category) {
      query = query.where(eq(requests.category, filters.category));
    }
    if (filters?.type) {
      query = query.where(eq(requests.type, filters.type));
    }
    if (filters?.pincode) {
      query = query.where(eq(requests.pincode, filters.pincode));
    }
    
    query = query.orderBy(desc(requests.createdAt));
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    return await query;
  }

  async getRequest(id: number): Promise<Request | undefined> {
    const [request] = await db.select().from(requests).where(eq(requests.id, id));
    return request;
  }

  async updateRequest(id: number, updates: Partial<InsertRequest>): Promise<Request | undefined> {
    const [request] = await db
      .update(requests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(requests.id, id))
      .returning();
    return request;
  }

  async deleteRequest(id: number): Promise<void> {
    await db.delete(requests).where(eq(requests.id, id));
  }

  async getUserRequests(userId: string): Promise<Request[]> {
    return await db.select().from(requests).where(eq(requests.userId, userId)).orderBy(desc(requests.createdAt));
  }

  // Item request operations
  async createItemRequest(itemRequest: InsertItemRequest): Promise<ItemRequest> {
    const [newRequest] = await db.insert(itemRequests).values(itemRequest).returning();
    return newRequest;
  }

  async getItemRequests(itemId: number): Promise<ItemRequest[]> {
    return await db.select().from(itemRequests).where(eq(itemRequests.itemId, itemId)).orderBy(desc(itemRequests.createdAt));
  }

  async getUserItemRequests(userId: string, status?: string): Promise<ItemRequest[]> {
    let query = db.select().from(itemRequests).where(eq(itemRequests.requesterId, userId));
    
    if (status) {
      query = query.where(eq(itemRequests.status, status));
    }
    
    return await query.orderBy(desc(itemRequests.createdAt));
  }

  async updateItemRequestStatus(id: number, status: string): Promise<ItemRequest | undefined> {
    const [request] = await db
      .update(itemRequests)
      .set({ status, updatedAt: new Date() })
      .where(eq(itemRequests.id, id))
      .returning();
    return request;
  }

  // Conversation operations
  async createConversation(data: { itemId?: number; requestId?: number; participant1Id: string; participant2Id: string }): Promise<Conversation> {
    const [conversation] = await db.insert(conversations).values(data).returning();
    return conversation;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(or(eq(conversations.participant1Id, userId), eq(conversations.participant2Id, userId)))
      .orderBy(desc(conversations.updatedAt));
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation;
  }

  // Message operations
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    
    // Update conversation timestamp
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, message.conversationId));
    
    return newMessage;
  }

  async getConversationMessages(conversationId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(and(eq(messages.conversationId, conversationId), eq(messages.isDeleted, false)))
      .orderBy(asc(messages.createdAt));
  }

  // Review operations
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    
    // Update item or user rating
    if (review.itemId && review.type === 'item') {
      const itemReviews = await this.getItemReviews(review.itemId);
      const avgRating = itemReviews.reduce((sum, r) => sum + r.rating, 0) / itemReviews.length;
      
      await db
        .update(items)
        .set({ 
          rating: avgRating.toFixed(2),
          totalReviews: itemReviews.length 
        })
        .where(eq(items.id, review.itemId));
    }
    
    if (review.type === 'user') {
      const userReviews = await this.getUserReviews(review.revieweeId);
      const avgRating = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
      
      await db
        .update(users)
        .set({ 
          rating: avgRating.toFixed(2),
          totalReviews: userReviews.length 
        })
        .where(eq(users.id, review.revieweeId));
    }
    
    return newReview;
  }

  async getItemReviews(itemId: number): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.itemId, itemId), eq(reviews.type, 'item')))
      .orderBy(desc(reviews.createdAt));
  }

  async getUserReviews(userId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.revieweeId, userId), eq(reviews.type, 'user')))
      .orderBy(desc(reviews.createdAt));
  }

  // Favorite operations
  async addFavorite(userId: string, itemId?: number, requestId?: number): Promise<Favorite> {
    const [favorite] = await db
      .insert(favorites)
      .values({ userId, itemId, requestId })
      .returning();
    return favorite;
  }

  async removeFavorite(userId: string, itemId?: number, requestId?: number): Promise<void> {
    let query = db.delete(favorites).where(eq(favorites.userId, userId));
    
    if (itemId) {
      query = query.where(eq(favorites.itemId, itemId));
    }
    if (requestId) {
      query = query.where(eq(favorites.requestId, requestId));
    }
    
    await query;
  }

  async getUserFavorites(userId: string): Promise<Favorite[]> {
    return await db
      .select()
      .from(favorites)
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }

  // Transaction operations
  async createTransaction(userId: string, type: string, amount: number, description: string, metadata?: any): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values({ userId, type, amount, description, metadata })
      .returning();
    
    // Update user points
    if (type === 'credit') {
      await this.updateUserPoints(userId, amount);
    } else if (type === 'debit') {
      await this.updateUserPoints(userId, -amount);
    }
    
    return transaction;
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  // Banner operations
  async createBanner(banner: InsertBanner): Promise<Banner> {
    const [newBanner] = await db.insert(banners).values(banner).returning();
    return newBanner;
  }

  async getBanners(activeOnly = true): Promise<Banner[]> {
    let query = db.select().from(banners);
    
    if (activeOnly) {
      query = query.where(eq(banners.isActive, true));
    }
    
    return await query.orderBy(desc(banners.createdAt));
  }

  async updateBanner(id: number, updates: Partial<InsertBanner>): Promise<Banner | undefined> {
    const [banner] = await db
      .update(banners)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(banners.id, id))
      .returning();
    return banner;
  }

  // Search operations
  async searchItems(query: string, filters?: { category?: string; type?: string; pincode?: string }): Promise<Item[]> {
    let dbQuery = db
      .select()
      .from(items)
      .where(
        and(
          eq(items.status, "available"),
          or(
            like(items.title, `%${query}%`),
            like(items.description, `%${query}%`)
          )
        )
      );
    
    if (filters?.category) {
      dbQuery = dbQuery.where(eq(items.category, filters.category));
    }
    if (filters?.type) {
      dbQuery = dbQuery.where(eq(items.type, filters.type));
    }
    if (filters?.pincode) {
      dbQuery = dbQuery.where(eq(items.pincode, filters.pincode));
    }
    
    return await dbQuery.orderBy(desc(items.createdAt));
  }

  async searchRequests(query: string, filters?: { category?: string; type?: string; pincode?: string }): Promise<Request[]> {
    let dbQuery = db
      .select()
      .from(requests)
      .where(
        and(
          eq(requests.status, "active"),
          or(
            like(requests.title, `%${query}%`),
            like(requests.description, `%${query}%`)
          )
        )
      );
    
    if (filters?.category) {
      dbQuery = dbQuery.where(eq(requests.category, filters.category));
    }
    if (filters?.type) {
      dbQuery = dbQuery.where(eq(requests.type, filters.type));
    }
    if (filters?.pincode) {
      dbQuery = dbQuery.where(eq(requests.pincode, filters.pincode));
    }
    
    return await dbQuery.orderBy(desc(requests.createdAt));
  }
}

export const storage = new DatabaseStorage();
