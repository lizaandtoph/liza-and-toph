import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean, doublePrecision, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: text("role").notNull().default("parent"), // parent, pro, admin
  proId: varchar("pro_id"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Magic link login tokens
export const loginTokens = pgTable("login_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const childProfiles = pgTable("child_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  birthday: text("birthday"),
  ageYears: integer("age_years"),
  ageMonths: integer("age_months"),
  ageBand: text("age_band"),
  ageRange: text("age_range"),
  gender: text("gender"),
  interests: jsonb("interests").$type<string[]>(),
  schemas: jsonb("schemas").$type<string[]>(),
  barriers: jsonb("barriers").$type<string[]>(),
  householdSize: integer("household_size"),
  milestones: jsonb("milestones").$type<Record<string, any>>(),
  questionnaireVersion: integer("questionnaire_version"),
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
  imageUrl: text("image_url").notNull(),
  categories: jsonb("categories").$type<string[]>(),
  ageRange: text("age_range").notNull(),
  affiliateUrl: text("affiliate_url"),
  isTopPick: boolean("is_top_pick").default(false),
  isBestseller: boolean("is_bestseller").default(false),
  isNew: boolean("is_new").default(false),
  isLizaTophCertified: boolean("is_liza_toph_certified").default(false),
  
  // Age filtering
  minAgeMonths: integer("min_age_months"),
  maxAgeMonths: integer("max_age_months"),
  ageRangeCategory: text("age_range_category"),
  
  // Developmental support (arrays of levels: emerging, developing, proficient, advanced)
  communicationLevels: jsonb("communication_levels").$type<string[]>(),
  motorLevels: jsonb("motor_levels").$type<string[]>(),
  cognitiveLevels: jsonb("cognitive_levels").$type<string[]>(),
  socialEmotionalLevels: jsonb("social_emotional_levels").$type<string[]>(),
  
  // Play type tags
  playTypeTags: jsonb("play_type_tags").$type<string[]>(),
  
  // Complexity and challenge
  complexityLevel: text("complexity_level"), // simple, moderate, complex, advanced, expert
  challengeRating: integer("challenge_rating"), // 1-5
  attentionDuration: text("attention_duration"), // quick_activities, medium_activities, detailed_activities, complex_projects, advanced_building
  
  // Temperament compatibility
  stimulationLevel: text("stimulation_level"), // low, moderate, high
  structurePreference: text("structure_preference"), // structured, flexible, open_ended
  energyRequirement: text("energy_requirement"), // sedentary, moderate, active, high_energy
  sensoryCompatibility: jsonb("sensory_compatibility").$type<string[]>(), // gentle, moderate, intense
  
  // Social context
  socialContext: jsonb("social_context").$type<string[]>(), // solo_play, paired_play, group_play, family_play
  cooperationRequired: boolean("cooperation_required"),
  
  // Safety and special needs
  safetyConsiderations: jsonb("safety_considerations").$type<string[]>(), // choking_hazard, supervision_required, small_parts
  specialNeedsSupport: jsonb("special_needs_support").$type<string[]>(), // autism_friendly, sensory_processing, speech_therapy, motor_therapy
  interventionFocus: jsonb("intervention_focus").$type<string[]>(), // communication, motor_skills, social_skills, behavior_support
  
  // Environmental factors
  noiseLevel: text("noise_level"), // quiet, moderate, loud
  messFactor: text("mess_factor"), // minimal, moderate, messy
  setupTime: text("setup_time"), // immediate, quick, moderate, extended
  spaceRequirements: text("space_requirements"), // small, medium, large, outdoor
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
  email: text("email"),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
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
}).refine(
  (data) => {
    if (data.minAgeMonths != null && data.maxAgeMonths != null) {
      return data.minAgeMonths <= data.maxAgeMonths;
    }
    return true;
  },
  {
    message: "Minimum age must be less than or equal to maximum age",
    path: ["minAgeMonths"],
  }
).refine(
  (data) => !data.playTypeTags || data.playTypeTags.length > 0,
  {
    message: "At least one play type must be selected",
    path: ["playTypeTags"],
  }
).refine(
  (data) => data.complexityLevel != null && data.complexityLevel.length > 0,
  {
    message: "Complexity level is required",
    path: ["complexityLevel"],
  }
).refine(
  (data) => !data.communicationLevels || data.communicationLevels.length > 0,
  {
    message: "At least one communication level must be selected",
    path: ["communicationLevels"],
  }
).refine(
  (data) => !data.motorLevels || data.motorLevels.length > 0,
  {
    message: "At least one motor level must be selected",
    path: ["motorLevels"],
  }
).refine(
  (data) => !data.cognitiveLevels || data.cognitiveLevels.length > 0,
  {
    message: "At least one cognitive level must be selected",
    path: ["cognitiveLevels"],
  }
).refine(
  (data) => !data.socialEmotionalLevels || data.socialEmotionalLevels.length > 0,
  {
    message: "At least one social-emotional level must be selected",
    path: ["socialEmotionalLevels"],
  }
);

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
  isLizaTophCertified: z.boolean().nullable().optional(),
  
  // Age filtering
  minAgeMonths: z.number().int().nullable().optional(),
  maxAgeMonths: z.number().int().nullable().optional(),
  ageRangeCategory: z.string().nullable().optional(),
  
  // Developmental support
  communicationLevels: z.array(z.string()).nullable().optional(),
  motorLevels: z.array(z.string()).nullable().optional(),
  cognitiveLevels: z.array(z.string()).nullable().optional(),
  socialEmotionalLevels: z.array(z.string()).nullable().optional(),
  
  // Play type tags
  playTypeTags: z.array(z.string()).nullable().optional(),
  
  // Complexity and challenge
  complexityLevel: z.string().nullable().optional(),
  challengeRating: z.number().int().min(1).max(5).nullable().optional(),
  attentionDuration: z.string().nullable().optional(),
  
  // Temperament compatibility
  stimulationLevel: z.string().nullable().optional(),
  structurePreference: z.string().nullable().optional(),
  energyRequirement: z.string().nullable().optional(),
  sensoryCompatibility: z.array(z.string()).nullable().optional(),
  
  // Social context
  socialContext: z.array(z.string()).nullable().optional(),
  cooperationRequired: z.boolean().nullable().optional(),
  
  // Safety and special needs
  safetyConsiderations: z.array(z.string()).nullable().optional(),
  specialNeedsSupport: z.array(z.string()).nullable().optional(),
  interventionFocus: z.array(z.string()).nullable().optional(),
  
  // Environmental factors
  noiseLevel: z.string().nullable().optional(),
  messFactor: z.string().nullable().optional(),
  setupTime: z.string().nullable().optional(),
  spaceRequirements: z.string().nullable().optional(),
}).refine(
  (data) => {
    if (data.minAgeMonths != null && data.maxAgeMonths != null) {
      return data.minAgeMonths <= data.maxAgeMonths;
    }
    return true;
  },
  {
    message: "Minimum age must be less than or equal to maximum age",
    path: ["minAgeMonths"],
  }
);

export const insertProfessionalSchema = createInsertSchema(professionals).omit({
  id: true,
});

export const updateProfessionalSchema = z.object({
  name: z.string().optional(),
  specialty: z.string().optional(),
  location: z.string().optional(),
  rating: z.string().optional(),
  description: z.string().optional(),
  email: z.string().email().nullable().optional(),
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
  createdAt: true,
  updatedAt: true,
});

export const registerUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(["parent", "pro", "admin"]).default("parent"),
  proId: z.string().nullable().optional(),
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const updateUserAccountSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
});

export const insertLoginTokenSchema = createInsertSchema(loginTokens).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type UpdateUserAccount = z.infer<typeof updateUserAccountSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type LoginToken = typeof loginTokens.$inferSelect;
export type InsertLoginToken = z.infer<typeof insertLoginTokenSchema>;
