import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const childProfiles = pgTable("child_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name"),
  ageRange: text("age_range").notNull(),
  gender: text("gender"),
  interests: jsonb("interests").$type<string[]>(),
  parentPreferences: jsonb("parent_preferences").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const milestones = pgTable("milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // cognitive, motor, social-emotional, language
  ageRange: text("age_range").notNull(),
  order: integer("order").notNull(),
  activityIdeas: jsonb("activity_ideas").$type<string[]>(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  description: text("description").notNull(),
  price: text("price").notNull(),
  imageUrl: text("image_url").notNull(),
  categories: jsonb("categories").$type<string[]>(),
  ageRange: text("age_range").notNull(),
  rating: text("rating").notNull(),
  reviewCount: integer("review_count").notNull(),
  affiliateUrl: text("affiliate_url"),
  isTopPick: boolean("is_top_pick").default(false),
  isBestseller: boolean("is_bestseller").default(false),
  isNew: boolean("is_new").default(false),
});

export const playBoards = pgTable("play_boards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  childProfileId: varchar("child_profile_id").references(() => childProfiles.id),
  milestoneIds: jsonb("milestone_ids").$type<string[]>(),
  productIds: jsonb("product_ids").$type<string[]>(),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Insert schemas
export const insertChildProfileSchema = createInsertSchema(childProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlayBoardSchema = createInsertSchema(playBoards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const updateProductSchema = z.object({
  name: z.string().optional(),
  brand: z.string().optional(),
  description: z.string().optional(),
  price: z.string().optional(),
  imageUrl: z.string().optional(),
  categories: z.array(z.string()).nullable().optional(),
  ageRange: z.string().optional(),
  rating: z.string().optional(),
  reviewCount: z.number().int().optional(),
  affiliateUrl: z.string().nullable().optional(),
  isTopPick: z.boolean().nullable().optional(),
  isBestseller: z.boolean().nullable().optional(),
  isNew: z.boolean().nullable().optional(),
});

// Types
export type InsertChildProfile = z.infer<typeof insertChildProfileSchema>;
export type ChildProfile = typeof childProfiles.$inferSelect;
export type Milestone = typeof milestones.$inferSelect;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type PlayBoard = typeof playBoards.$inferSelect;
export type InsertPlayBoard = z.infer<typeof insertPlayBoardSchema>;

// User types from existing schema
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
