import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phone: varchar("phone"),
  location: varchar("location"),
  pincode: varchar("pincode"),
  points: integer("points").default(300), // 300 signup bonus
  isPremium: boolean("is_premium").default(false),
  premiumExpiresAt: timestamp("premium_expires_at"),
  isAdmin: boolean("is_admin").default(false),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalReviews: integer("total_reviews").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category").notNull(),
  type: varchar("type").notNull(), // 'donate' or 'rent'
  condition: varchar("condition"),
  price: decimal("price", { precision: 10, scale: 2 }),
  priceUnit: varchar("price_unit"), // 'day', 'week', 'month'
  location: varchar("location").notNull(),
  pincode: varchar("pincode").notNull(),
  images: text("images").array(),
  status: varchar("status").default("available"), // 'available', 'reserved', 'taken'
  isFeatured: boolean("is_featured").default(false),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalReviews: integer("total_reviews").default(0),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const requests = pgTable("requests", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category").notNull(),
  type: varchar("type").notNull(), // 'donate' or 'rent'
  location: varchar("location").notNull(),
  pincode: varchar("pincode").notNull(),
  maxPrice: decimal("max_price", { precision: 10, scale: 2 }),
  status: varchar("status").default("active"), // 'active', 'fulfilled', 'cancelled'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const itemRequests = pgTable("item_requests", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").references(() => items.id).notNull(),
  requesterId: varchar("requester_id").references(() => users.id).notNull(),
  status: varchar("status").default("pending"), // 'pending', 'approved', 'rejected'
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").references(() => items.id),
  requestId: integer("request_id").references(() => requests.id),
  participant1Id: varchar("participant1_id").references(() => users.id).notNull(),
  participant2Id: varchar("participant2_id").references(() => users.id).notNull(),
  isPaid: boolean("is_paid").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id).notNull(),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  isDeleted: boolean("is_deleted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").references(() => items.id),
  reviewerId: varchar("reviewer_id").references(() => users.id).notNull(),
  revieweeId: varchar("reviewee_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  type: varchar("type").notNull(), // 'item' or 'user'
  createdAt: timestamp("created_at").defaultNow(),
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  itemId: integer("item_id").references(() => items.id),
  requestId: integer("request_id").references(() => requests.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull(), // 'chat', 'request', 'points', 'system'
  isRead: boolean("is_read").default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type").notNull(), // 'credit', 'debit'
  amount: integer("amount").notNull(), // points amount
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const banners = pgTable("banners", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  imageUrl: varchar("image_url"),
  linkUrl: varchar("link_url"),
  target: integer("target"),
  collected: integer("collected").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  items: many(items),
  requests: many(requests),
  sentRequests: many(itemRequests),
  sentMessages: many(messages),
  reviews: many(reviews),
  favorites: many(favorites),
  notifications: many(notifications),
  transactions: many(transactions),
}));

export const itemsRelations = relations(items, ({ one, many }) => ({
  user: one(users, { fields: [items.userId], references: [users.id] }),
  requests: many(itemRequests),
  conversations: many(conversations),
  reviews: many(reviews),
  favorites: many(favorites),
}));

export const requestsRelations = relations(requests, ({ one, many }) => ({
  user: one(users, { fields: [requests.userId], references: [users.id] }),
  conversations: many(conversations),
  favorites: many(favorites),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  item: one(items, { fields: [conversations.itemId], references: [items.id] }),
  request: one(requests, { fields: [conversations.requestId], references: [requests.id] }),
  participant1: one(users, { fields: [conversations.participant1Id], references: [users.id] }),
  participant2: one(users, { fields: [conversations.participant2Id], references: [users.id] }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, { fields: [messages.conversationId], references: [conversations.id] }),
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
}));

// Insert schemas
export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
  userId: true,
  rating: true,
  totalReviews: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRequestSchema = createInsertSchema(requests).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertItemRequestSchema = createInsertSchema(itemRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertBannerSchema = createInsertSchema(banners).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Item = typeof items.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type Request = typeof requests.$inferSelect;
export type InsertRequest = z.infer<typeof insertRequestSchema>;
export type ItemRequest = typeof itemRequests.$inferSelect;
export type InsertItemRequest = z.infer<typeof insertItemRequestSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type Banner = typeof banners.$inferSelect;
export type InsertBanner = z.infer<typeof insertBannerSchema>;
