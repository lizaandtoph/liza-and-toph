import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("parent"), // parent, pro, admin
  proId: varchar("pro_id"),
  username: text("username"),
  password: text("password"),
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

export const professionals = pgTable("professionals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  specialty: text("specialty").notNull(),
  location: text("location").notNull(),
  rating: text("rating").notNull(),
  description: text("description").notNull(),
});

export const pros = pgTable("pros", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  coverUrl: text("cover_url"),
  about: text("about"),
  phone: text("phone"),
  emailPublic: text("email_public"),
  website: text("website"),
  address: text("address"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  priceRange: text("price_range"), // $, $$, $$$, $$$$
  licenseNumber: text("license_number"),
  badges: jsonb("badges").$type<string[]>(),
  rating: doublePrecision("rating").default(0),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const serviceOfferings = pgTable("service_offerings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  proId: varchar("pro_id").notNull().references(() => pros.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  minPrice: integer("min_price"),
  maxPrice: integer("max_price"),
});

export const serviceAreas = pgTable("service_areas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  proId: varchar("pro_id").notNull().references(() => pros.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  zip: text("zip").notNull(),
  radiusMiles: integer("radius_miles").notNull(),
});

export const galleryImages = pgTable("gallery_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  proId: varchar("pro_id").notNull().references(() => pros.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  title: text("title"),
  description: text("description"),
  tags: jsonb("tags").$type<string[]>(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  proId: varchar("pro_id").notNull().references(() => pros.id, { onDelete: "cascade" }),
  authorName: text("author_name").notNull(),
  rating: integer("rating").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  proId: varchar("pro_id").notNull().references(() => pros.id, { onDelete: "cascade" }),
  fromName: text("from_name").notNull(),
  fromEmail: text("from_email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  status: text("status").notNull().default("new"), // new, read
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  proId: varchar("pro_id").notNull().unique().references(() => pros.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("inactive"), // active, inactive
  plan: text("plan"),
  currentPeriodEnd: timestamp("current_period_end"),
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

export const insertProfessionalSchema = createInsertSchema(professionals).omit({
  id: true,
});

export const updateProfessionalSchema = z.object({
  name: z.string().optional(),
  specialty: z.string().optional(),
  location: z.string().optional(),
  rating: z.string().optional(),
  description: z.string().optional(),
});

export const insertProSchema = createInsertSchema(pros).omit({
  id: true,
  createdAt: true,
  rating: true,
  reviewCount: true,
});

export const updateProSchema = z.object({
  slug: z.string().optional(),
  name: z.string().optional(),
  logoUrl: z.string().nullable().optional(),
  coverUrl: z.string().nullable().optional(),
  about: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  emailPublic: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  priceRange: z.string().nullable().optional(),
  licenseNumber: z.string().nullable().optional(),
  badges: z.array(z.string()).nullable().optional(),
});

export const insertServiceOfferingSchema = createInsertSchema(serviceOfferings).omit({
  id: true,
});

export const insertServiceAreaSchema = createInsertSchema(serviceAreas).omit({
  id: true,
});

export const insertGalleryImageSchema = createInsertSchema(galleryImages).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
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
export type Professional = typeof professionals.$inferSelect;
export type InsertProfessional = z.infer<typeof insertProfessionalSchema>;
export type UpdateProfessional = z.infer<typeof updateProfessionalSchema>;

export type Pro = typeof pros.$inferSelect;
export type InsertPro = z.infer<typeof insertProSchema>;
export type UpdatePro = z.infer<typeof updateProSchema>;
export type ServiceOffering = typeof serviceOfferings.$inferSelect;
export type InsertServiceOffering = z.infer<typeof insertServiceOfferingSchema>;
export type ServiceArea = typeof serviceAreas.$inferSelect;
export type InsertServiceArea = z.infer<typeof insertServiceAreaSchema>;
export type GalleryImage = typeof galleryImages.$inferSelect;
export type InsertGalleryImage = z.infer<typeof insertGalleryImageSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

// User types from existing schema
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  username: true,
  password: true,
});

export const registerUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["parent", "pro", "admin"]).default("parent"),
  proId: z.string().nullable().optional(),
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
