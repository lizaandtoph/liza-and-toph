import { type User, type InsertUser, type RegisterUser, type ChildProfile, type InsertChildProfile, type Milestone, type Product, type InsertProduct, type PlayBoard, type InsertPlayBoard, type Professional, type InsertProfessional, type Pro, type InsertPro, type UpdatePro, type ServiceOffering, type InsertServiceOffering, type ServiceArea, type InsertServiceArea, type GalleryImage, type InsertGalleryImage, type Review, type InsertReview, type Message, type InsertMessage, type Subscription, type InsertSubscription, type PasswordResetToken, type InsertPasswordResetToken, users, childProfiles, milestones, products, playBoards, professionals, pros, serviceOfferings, serviceAreas, galleryImages, reviews, messages, subscriptions, passwordResetTokens } from "@shared/schema";
import { randomUUID } from "crypto";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and, like, gte, gt } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: RegisterUser): Promise<User>;
  getChildrenByUserId(userId: string): Promise<ChildProfile[]>;
  
  createChildProfile(profile: InsertChildProfile): Promise<ChildProfile>;
  getChildProfile(id: string): Promise<ChildProfile | undefined>;
  
  getMilestonesByAgeRange(ageRange: string): Promise<Milestone[]>;
  getAllMilestones(): Promise<Milestone[]>;
  
  getProductsByAgeRange(ageRange: string): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getAllProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  
  createPlayBoard(playBoard: InsertPlayBoard): Promise<PlayBoard>;
  getPlayBoard(id: string): Promise<PlayBoard | undefined>;
  
  getAllProfessionals(): Promise<Professional[]>;
  getProfessional(id: string): Promise<Professional | undefined>;
  createProfessional(professional: InsertProfessional): Promise<Professional>;
  updateProfessional(id: string, professional: Partial<InsertProfessional>): Promise<Professional | undefined>;
  deleteProfessional(id: string): Promise<boolean>;

  getAllPros(filters?: { q?: string; zip?: string; radius?: number; category?: string; ratingMin?: number; priceRange?: string }): Promise<Pro[]>;
  getProBySlug(slug: string): Promise<Pro | undefined>;
  getProById(id: string): Promise<Pro | undefined>;
  createPro(pro: InsertPro): Promise<Pro>;
  updatePro(id: string, pro: UpdatePro): Promise<Pro | undefined>;
  deletePro(id: string): Promise<boolean>;

  getServiceOfferingsByProId(proId: string): Promise<ServiceOffering[]>;
  createServiceOffering(service: InsertServiceOffering): Promise<ServiceOffering>;
  updateServiceOffering(id: string, service: Partial<InsertServiceOffering>): Promise<ServiceOffering | undefined>;
  deleteServiceOffering(id: string): Promise<boolean>;

  getServiceAreasByProId(proId: string): Promise<ServiceArea[]>;
  createServiceArea(area: InsertServiceArea): Promise<ServiceArea>;
  deleteServiceArea(id: string): Promise<boolean>;

  getGalleryImagesByProId(proId: string): Promise<GalleryImage[]>;
  createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage>;
  deleteGalleryImage(id: string): Promise<boolean>;

  getReviewsByProId(proId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  getMessagesByProId(proId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessageStatus(id: string, status: string): Promise<Message | undefined>;

  getSubscriptionByProId(proId: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscriptionStatus(proId: string, status: string): Promise<Subscription | undefined>;

  createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  deletePasswordResetToken(token: string): Promise<boolean>;
  updateUserPassword(userId: string, newPasswordHash: string): Promise<void>;
  updateUserAccount(userId: string, updates: { email?: string; firstName?: string; lastName?: string }): Promise<User | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private childProfiles: Map<string, ChildProfile>;
  private milestones: Map<string, Milestone>;
  private products: Map<string, Product>;
  private playBoards: Map<string, PlayBoard>;
  private professionals: Map<string, Professional>;
  private _pros: Map<string, Pro>;
  private _serviceOfferings: Map<string, ServiceOffering>;
  private _serviceAreas: Map<string, ServiceArea>;
  private _galleryImages: Map<string, GalleryImage>;
  private _reviews: Map<string, Review>;
  private _messages: Map<string, Message>;
  private _subscriptions: Map<string, Subscription>;

  constructor() {
    this.users = new Map();
    this.childProfiles = new Map();
    this.milestones = new Map();
    this.products = new Map();
    this.playBoards = new Map();
    this.professionals = new Map();
    this._pros = new Map();
    this._serviceOfferings = new Map();
    this._serviceAreas = new Map();
    this._galleryImages = new Map();
    this._reviews = new Map();
    this._messages = new Map();
    this._subscriptions = new Map();
    this.seedData();
  }

  private seedData() {
    // Seed milestones
    const sampleMilestones: Milestone[] = [
      {
        id: "m1",
        title: "Tracks moving objects with eyes",
        description: "Your baby can now follow objects smoothly with their eyes from side to side, showing improved visual tracking abilities.",
        category: "cognitive",
        ageRange: "6-12 months",
        order: 1,
        activityIdeas: ["Move colorful toys slowly in front of baby", "Use a flashlight to create moving patterns on the wall"]
      },
      {
        id: "m2",
        title: "Sits without support",
        description: "Baby is developing core strength to sit independently. Continue tummy time and supported sitting exercises.",
        category: "motor",
        ageRange: "6-12 months",
        order: 2,
        activityIdeas: ["Practice supported sitting", "Encourage reaching for toys while sitting"]
      },
      {
        id: "m3",
        title: "Responds to own name",
        description: "Baby will start to recognize and respond when you call their name, showing awareness of identity.",
        category: "social-emotional",
        ageRange: "6-12 months",
        order: 3,
        activityIdeas: ["Call baby's name during play", "Use name in songs and conversations"]
      },
      {
        id: "m4",
        title: "Babbles with expression",
        description: "Baby is experimenting with sounds and tones, practicing for future speech development.",
        category: "language",
        ageRange: "6-12 months",
        order: 4,
        activityIdeas: ["Respond to baby's babbling", "Read books with different vocal expressions"]
      }
    ];

    sampleMilestones.forEach(milestone => {
      this.milestones.set(milestone.id, milestone);
    });

    // Seed products
    const sampleProducts: Product[] = [
      {
        id: "p1",
        name: "Wooden Sensory Blocks Set",
        brand: "Lovevery",
        description: "12-piece set with varied textures, colors, and sounds to stimulate sensory development",
        price: "$34.99",
        imageUrl: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        categories: ["cognitive", "motor"],
        ageRange: "6-12 months",
        rating: "4.9",
        reviewCount: 127,
        affiliateUrl: "#",
        isTopPick: true,
        isBestseller: false,
        isNew: false
      },
      {
        id: "p2",
        name: "Touch & Feel Fabric Book",
        brand: "Manhattan Toy",
        description: "Interactive cloth book with crinkle sounds and various textures for tactile exploration",
        price: "$18.99",
        imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        categories: ["language", "cognitive"],
        ageRange: "6-12 months",
        rating: "4.7",
        reviewCount: 89,
        affiliateUrl: "#",
        isTopPick: false,
        isBestseller: false,
        isNew: false
      },
      {
        id: "p3",
        name: "Rainbow Stacking Rings",
        brand: "Fisher-Price",
        description: "Classic stacking toy for hand-eye coordination and size recognition",
        price: "$24.99",
        imageUrl: "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        categories: ["motor", "cognitive"],
        ageRange: "6-12 months",
        rating: "4.8",
        reviewCount: 203,
        affiliateUrl: "#",
        isTopPick: false,
        isBestseller: true,
        isNew: false
      }
    ];

    sampleProducts.forEach(product => {
      this.products.set(product.id, product);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(userData: RegisterUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      email: userData.email,
      passwordHash: userData.password,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      role: userData.role,
      proId: userData.proId || null,
      username: null,
      password: null,
    };
    this.users.set(id, user);
    return user;
  }

  async getChildrenByUserId(userId: string): Promise<ChildProfile[]> {
    return Array.from(this.childProfiles.values()).filter(
      child => child.userId === userId
    );
  }

  async createChildProfile(profile: InsertChildProfile): Promise<ChildProfile> {
    const id = randomUUID();
    const now = new Date();
    const childProfile: ChildProfile = { 
      id, 
      name: profile.name ?? null,
      ageRange: profile.ageRange,
      gender: profile.gender ?? null,
      interests: (profile.interests ? [...profile.interests] : null) as string[] | null,
      parentPreferences: profile.parentPreferences ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.childProfiles.set(id, childProfile);
    return childProfile;
  }

  async getChildProfile(id: string): Promise<ChildProfile | undefined> {
    return this.childProfiles.get(id);
  }

  async getMilestonesByAgeRange(ageRange: string): Promise<Milestone[]> {
    return Array.from(this.milestones.values()).filter(
      milestone => milestone.ageRange === ageRange
    ).sort((a, b) => a.order - b.order);
  }

  async getAllMilestones(): Promise<Milestone[]> {
    return Array.from(this.milestones.values()).sort((a, b) => a.order - b.order);
  }

  async getProductsByAgeRange(ageRange: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      product => product.ageRange === ageRange
    );
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      product => product.categories?.includes(category) ?? false
    );
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { id, ...productData };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const existing = this.products.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...productData };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  async createPlayBoard(playBoard: InsertPlayBoard): Promise<PlayBoard> {
    const id = randomUUID();
    const now = new Date();
    const newPlayBoard: PlayBoard = { 
      id, 
      childProfileId: playBoard.childProfileId ?? null,
      milestoneIds: (playBoard.milestoneIds ? [...playBoard.milestoneIds] : null) as string[] | null,
      productIds: (playBoard.productIds ? [...playBoard.productIds] : null) as string[] | null,
      createdAt: now,
      updatedAt: now
    };
    this.playBoards.set(id, newPlayBoard);
    return newPlayBoard;
  }

  async getPlayBoard(id: string): Promise<PlayBoard | undefined> {
    return this.playBoards.get(id);
  }

  async getAllProfessionals(): Promise<Professional[]> {
    return Array.from(this.professionals.values());
  }

  async getProfessional(id: string): Promise<Professional | undefined> {
    return this.professionals.get(id);
  }

  async createProfessional(professionalData: InsertProfessional): Promise<Professional> {
    const id = randomUUID();
    const professional: Professional = { id, ...professionalData };
    this.professionals.set(id, professional);
    return professional;
  }

  async updateProfessional(id: string, professionalData: Partial<InsertProfessional>): Promise<Professional | undefined> {
    const existing = this.professionals.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...professionalData };
    this.professionals.set(id, updated);
    return updated;
  }

  async deleteProfessional(id: string): Promise<boolean> {
    return this.professionals.delete(id);
  }

  async getAllPros(filters?: { q?: string; zip?: string; radius?: number; category?: string; ratingMin?: number; priceRange?: string }): Promise<Pro[]> {
    let pros = Array.from(this._pros.values());
    if (filters?.q) {
      const query = filters.q.toLowerCase();
      pros = pros.filter(p => p.name.toLowerCase().includes(query) || p.about.toLowerCase().includes(query));
    }
    if (filters?.ratingMin) {
      pros = pros.filter(p => p.rating && p.rating >= filters.ratingMin!);
    }
    if (filters?.priceRange) {
      pros = pros.filter(p => p.priceRange === filters.priceRange);
    }
    return pros;
  }

  async getProBySlug(slug: string): Promise<Pro | undefined> {
    return Array.from(this._pros.values()).find(p => p.slug === slug);
  }

  async getProById(id: string): Promise<Pro | undefined> {
    return this._pros.get(id);
  }

  async createPro(proData: InsertPro): Promise<Pro> {
    const id = randomUUID();
    const pro: Pro = {
      id,
      name: proData.name,
      slug: proData.slug,
      about: proData.about,
      address: proData.address || null,
      phone: proData.phone || null,
      emailPublic: proData.emailPublic || null,
      website: proData.website || null,
      logoUrl: proData.logoUrl || null,
      coverUrl: proData.coverUrl || null,
      rating: proData.rating || null,
      reviewCount: proData.reviewCount || 0,
      priceRange: proData.priceRange || null,
      badges: proData.badges || null,
      licenseNumber: proData.licenseNumber || null,
    };
    this._pros.set(id, pro);
    return pro;
  }

  async updatePro(id: string, proData: UpdatePro): Promise<Pro | undefined> {
    const existing = this._pros.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...proData };
    this._pros.set(id, updated);
    return updated;
  }

  async deletePro(id: string): Promise<boolean> {
    return this._pros.delete(id);
  }

  async getServiceOfferingsByProId(proId: string): Promise<ServiceOffering[]> {
    return Array.from(this._serviceOfferings.values()).filter(s => s.proId === proId);
  }

  async createServiceOffering(data: InsertServiceOffering): Promise<ServiceOffering> {
    const id = randomUUID();
    const service: ServiceOffering = { id, ...data };
    this._serviceOfferings.set(id, service);
    return service;
  }

  async updateServiceOffering(id: string, data: Partial<InsertServiceOffering>): Promise<ServiceOffering | undefined> {
    const existing = this._serviceOfferings.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this._serviceOfferings.set(id, updated);
    return updated;
  }

  async deleteServiceOffering(id: string): Promise<boolean> {
    return this._serviceOfferings.delete(id);
  }

  async getServiceAreasByProId(proId: string): Promise<ServiceArea[]> {
    return Array.from(this._serviceAreas.values()).filter(a => a.proId === proId);
  }

  async createServiceArea(data: InsertServiceArea): Promise<ServiceArea> {
    const id = randomUUID();
    const area: ServiceArea = { id, ...data };
    this._serviceAreas.set(id, area);
    return area;
  }

  async deleteServiceArea(id: string): Promise<boolean> {
    return this._serviceAreas.delete(id);
  }

  async getGalleryImagesByProId(proId: string): Promise<GalleryImage[]> {
    return Array.from(this._galleryImages.values()).filter(img => img.proId === proId);
  }

  async createGalleryImage(data: InsertGalleryImage): Promise<GalleryImage> {
    const id = randomUUID();
    const image: GalleryImage = { id, ...data, createdAt: new Date() };
    this._galleryImages.set(id, image);
    return image;
  }

  async deleteGalleryImage(id: string): Promise<boolean> {
    return this._galleryImages.delete(id);
  }

  async getReviewsByProId(proId: string): Promise<Review[]> {
    return Array.from(this._reviews.values()).filter(r => r.proId === proId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createReview(data: InsertReview): Promise<Review> {
    const id = randomUUID();
    const review: Review = { id, ...data, createdAt: new Date() };
    this._reviews.set(id, review);
    return review;
  }

  async getMessagesByProId(proId: string): Promise<Message[]> {
    return Array.from(this._messages.values()).filter(m => m.proId === proId).sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
  }

  async createMessage(data: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = { id, ...data, status: "new", sentAt: new Date() };
    this._messages.set(id, message);
    return message;
  }

  async updateMessageStatus(id: string, status: string): Promise<Message | undefined> {
    const existing = this._messages.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, status };
    this._messages.set(id, updated);
    return updated;
  }

  async getSubscriptionByProId(proId: string): Promise<Subscription | undefined> {
    return Array.from(this._subscriptions.values()).find(s => s.proId === proId);
  }

  async createSubscription(data: InsertSubscription): Promise<Subscription> {
    const id = randomUUID();
    const subscription: Subscription = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
    this._subscriptions.set(id, subscription);
    return subscription;
  }

  async updateSubscriptionStatus(proId: string, status: string): Promise<Subscription | undefined> {
    const existing = Array.from(this._subscriptions.values()).find(s => s.proId === proId);
    if (!existing) return undefined;
    const updated = { ...existing, status, updatedAt: new Date() };
    this._subscriptions.set(existing.id, updated);
    return updated;
  }

  async createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<PasswordResetToken> {
    throw new Error("Password reset not implemented for MemStorage");
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    throw new Error("Password reset not implemented for MemStorage");
  }

  async deletePasswordResetToken(token: string): Promise<boolean> {
    throw new Error("Password reset not implemented for MemStorage");
  }

  async updateUserPassword(userId: string, newPasswordHash: string): Promise<void> {
    throw new Error("Password reset not implemented for MemStorage");
  }

  async updateUserAccount(userId: string, updates: { email?: string; firstName?: string; lastName?: string }): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    const updated = { ...user, ...updates };
    this.users.set(userId, updated);
    return updated;
  }
}

export class DbStorage implements IStorage {
  private db;
  private initialized: Promise<void>;

  constructor() {
    const sql = neon(process.env.DATABASE_URL!);
    this.db = drizzle(sql);
    this.initialized = this.seedData();
  }

  private async ensureInitialized() {
    await this.initialized;
  }

  private async seedData() {
    try {
      const existingMilestones = await this.db.select().from(milestones).limit(1);
      if (existingMilestones.length > 0) {
        return;
      }
    } catch (error) {
      console.error('Error checking existing data:', error);
    }

    const sampleMilestones = [
      {
        id: "m1",
        title: "Tracks moving objects with eyes",
        description: "Your baby can now follow objects smoothly with their eyes from side to side, showing improved visual tracking abilities.",
        category: "cognitive",
        ageRange: "6-12 months",
        order: 1,
        activityIdeas: ["Move colorful toys slowly in front of baby", "Use a flashlight to create moving patterns on the wall"]
      },
      {
        id: "m2",
        title: "Sits without support",
        description: "Baby is developing core strength to sit independently. Continue tummy time and supported sitting exercises.",
        category: "motor",
        ageRange: "6-12 months",
        order: 2,
        activityIdeas: ["Practice supported sitting", "Encourage reaching for toys while sitting"]
      },
      {
        id: "m3",
        title: "Responds to own name",
        description: "Baby will start to recognize and respond when you call their name, showing awareness of identity.",
        category: "social-emotional",
        ageRange: "6-12 months",
        order: 3,
        activityIdeas: ["Call baby's name during play", "Use name in songs and conversations"]
      },
      {
        id: "m4",
        title: "Babbles with expression",
        description: "Baby is experimenting with sounds and tones, practicing for future speech development.",
        category: "language",
        ageRange: "6-12 months",
        order: 4,
        activityIdeas: ["Respond to baby's babbling", "Read books with different vocal expressions"]
      }
    ];

    await this.db.insert(milestones).values(sampleMilestones);

    const sampleProducts = [
      {
        id: "p1",
        name: "Wooden Sensory Blocks Set",
        brand: "Lovevery",
        description: "12-piece set with varied textures, colors, and sounds to stimulate sensory development",
        price: "$34.99",
        imageUrl: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        categories: ["cognitive", "motor"],
        ageRange: "6-12 months",
        rating: "4.9",
        reviewCount: 127,
        affiliateUrl: "#",
        isTopPick: true,
        isBestseller: false,
        isNew: false
      },
      {
        id: "p2",
        name: "Touch & Feel Fabric Book",
        brand: "Manhattan Toy",
        description: "Interactive cloth book with crinkle sounds and various textures for tactile exploration",
        price: "$18.99",
        imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        categories: ["language", "cognitive"],
        ageRange: "6-12 months",
        rating: "4.7",
        reviewCount: 89,
        affiliateUrl: "#",
        isTopPick: false,
        isBestseller: false,
        isNew: false
      },
      {
        id: "p3",
        name: "Rainbow Stacking Rings",
        brand: "Fisher-Price",
        description: "Classic stacking toy for hand-eye coordination and size recognition",
        price: "$24.99",
        imageUrl: "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        categories: ["motor", "cognitive"],
        ageRange: "6-12 months",
        rating: "4.8",
        reviewCount: 203,
        affiliateUrl: "#",
        isTopPick: false,
        isBestseller: true,
        isNew: false
      }
    ];

    await this.db.insert(products).values(sampleProducts);
  }

  async getUser(id: string): Promise<User | undefined> {
    await this.ensureInitialized();
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    await this.ensureInitialized();
    if (!username) return undefined;
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    await this.ensureInitialized();
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(userData: RegisterUser): Promise<User> {
    await this.ensureInitialized();
    const result = await this.db.insert(users).values({
      email: userData.email,
      passwordHash: userData.password,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      role: userData.role || "parent",
      proId: userData.proId || null,
    }).returning();
    return result[0];
  }

  async getChildrenByUserId(userId: string): Promise<ChildProfile[]> {
    await this.ensureInitialized();
    return await this.db.select().from(childProfiles).where(eq(childProfiles.userId, userId));
  }

  async createChildProfile(profile: InsertChildProfile): Promise<ChildProfile> {
    await this.ensureInitialized();
    const result = await this.db.insert(childProfiles).values(profile).returning();
    return result[0];
  }

  async getChildProfile(id: string): Promise<ChildProfile | undefined> {
    await this.ensureInitialized();
    const result = await this.db.select().from(childProfiles).where(eq(childProfiles.id, id)).limit(1);
    return result[0];
  }

  async getMilestonesByAgeRange(ageRange: string): Promise<Milestone[]> {
    await this.ensureInitialized();
    const result = await this.db.select().from(milestones).where(eq(milestones.ageRange, ageRange));
    return result.sort((a, b) => a.order - b.order);
  }

  async getAllMilestones(): Promise<Milestone[]> {
    await this.ensureInitialized();
    const result = await this.db.select().from(milestones);
    return result.sort((a, b) => a.order - b.order);
  }

  async getProductsByAgeRange(ageRange: string): Promise<Product[]> {
    await this.ensureInitialized();
    return await this.db.select().from(products).where(eq(products.ageRange, ageRange));
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    await this.ensureInitialized();
    const allProducts = await this.db.select().from(products);
    return allProducts.filter(product => product.categories?.includes(category) ?? false);
  }

  async getAllProducts(): Promise<Product[]> {
    await this.ensureInitialized();
    return await this.db.select().from(products);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    await this.ensureInitialized();
    const result = await this.db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    await this.ensureInitialized();
    const result = await this.db.insert(products).values(productData).returning();
    return result[0];
  }

  async updateProduct(id: string, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    await this.ensureInitialized();
    const result = await this.db.update(products).set(productData).where(eq(products.id, id)).returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<boolean> {
    await this.ensureInitialized();
    const result = await this.db.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  }

  async createPlayBoard(playBoard: InsertPlayBoard): Promise<PlayBoard> {
    await this.ensureInitialized();
    const result = await this.db.insert(playBoards).values(playBoard).returning();
    return result[0];
  }

  async getPlayBoard(id: string): Promise<PlayBoard | undefined> {
    await this.ensureInitialized();
    const result = await this.db.select().from(playBoards).where(eq(playBoards.id, id)).limit(1);
    return result[0];
  }

  async getAllProfessionals(): Promise<Professional[]> {
    await this.ensureInitialized();
    return await this.db.select().from(professionals);
  }

  async getProfessional(id: string): Promise<Professional | undefined> {
    await this.ensureInitialized();
    const result = await this.db.select().from(professionals).where(eq(professionals.id, id)).limit(1);
    return result[0];
  }

  async createProfessional(professionalData: InsertProfessional): Promise<Professional> {
    await this.ensureInitialized();
    const result = await this.db.insert(professionals).values(professionalData).returning();
    return result[0];
  }

  async updateProfessional(id: string, professionalData: Partial<InsertProfessional>): Promise<Professional | undefined> {
    await this.ensureInitialized();
    const result = await this.db.update(professionals).set(professionalData).where(eq(professionals.id, id)).returning();
    return result[0];
  }

  async deleteProfessional(id: string): Promise<boolean> {
    await this.ensureInitialized();
    const result = await this.db.delete(professionals).where(eq(professionals.id, id)).returning();
    return result.length > 0;
  }

  async getAllPros(filters?: { q?: string; zip?: string; radius?: number; category?: string; ratingMin?: number; priceRange?: string }): Promise<Pro[]> {
    await this.ensureInitialized();
    let allPros = await this.db.select().from(pros);

    if (filters?.q) {
      const query = filters.q.toLowerCase();
      allPros = allPros.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.about?.toLowerCase().includes(query)
      );
    }

    if (filters?.category) {
      const prosWithServices = await this.db.select().from(serviceOfferings);
      const proIdsWithCategory = prosWithServices
        .filter(s => s.category.toLowerCase().includes(filters.category!.toLowerCase()))
        .map(s => s.proId);
      allPros = allPros.filter(p => proIdsWithCategory.includes(p.id));
    }

    if (filters?.ratingMin) {
      allPros = allPros.filter(p => (p.rating || 0) >= filters.ratingMin!);
    }

    if (filters?.priceRange) {
      allPros = allPros.filter(p => p.priceRange === filters.priceRange);
    }

    return allPros;
  }

  async getProBySlug(slug: string): Promise<Pro | undefined> {
    await this.ensureInitialized();
    const result = await this.db.select().from(pros).where(eq(pros.slug, slug)).limit(1);
    return result[0];
  }

  async getProById(id: string): Promise<Pro | undefined> {
    await this.ensureInitialized();
    const result = await this.db.select().from(pros).where(eq(pros.id, id)).limit(1);
    return result[0];
  }

  async createPro(proData: InsertPro): Promise<Pro> {
    await this.ensureInitialized();
    const result = await this.db.insert(pros).values(proData).returning();
    return result[0];
  }

  async updatePro(id: string, proData: UpdatePro): Promise<Pro | undefined> {
    await this.ensureInitialized();
    const result = await this.db.update(pros).set(proData).where(eq(pros.id, id)).returning();
    return result[0];
  }

  async deletePro(id: string): Promise<boolean> {
    await this.ensureInitialized();
    const result = await this.db.delete(pros).where(eq(pros.id, id)).returning();
    return result.length > 0;
  }

  async getServiceOfferingsByProId(proId: string): Promise<ServiceOffering[]> {
    await this.ensureInitialized();
    return await this.db.select().from(serviceOfferings).where(eq(serviceOfferings.proId, proId));
  }

  async createServiceOffering(service: InsertServiceOffering): Promise<ServiceOffering> {
    await this.ensureInitialized();
    const result = await this.db.insert(serviceOfferings).values(service).returning();
    return result[0];
  }

  async updateServiceOffering(id: string, service: Partial<InsertServiceOffering>): Promise<ServiceOffering | undefined> {
    await this.ensureInitialized();
    const result = await this.db.update(serviceOfferings).set(service).where(eq(serviceOfferings.id, id)).returning();
    return result[0];
  }

  async deleteServiceOffering(id: string): Promise<boolean> {
    await this.ensureInitialized();
    const result = await this.db.delete(serviceOfferings).where(eq(serviceOfferings.id, id)).returning();
    return result.length > 0;
  }

  async getServiceAreasByProId(proId: string): Promise<ServiceArea[]> {
    await this.ensureInitialized();
    return await this.db.select().from(serviceAreas).where(eq(serviceAreas.proId, proId));
  }

  async createServiceArea(area: InsertServiceArea): Promise<ServiceArea> {
    await this.ensureInitialized();
    const result = await this.db.insert(serviceAreas).values(area).returning();
    return result[0];
  }

  async deleteServiceArea(id: string): Promise<boolean> {
    await this.ensureInitialized();
    const result = await this.db.delete(serviceAreas).where(eq(serviceAreas.id, id)).returning();
    return result.length > 0;
  }

  async getGalleryImagesByProId(proId: string): Promise<GalleryImage[]> {
    await this.ensureInitialized();
    return await this.db.select().from(galleryImages).where(eq(galleryImages.proId, proId));
  }

  async createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage> {
    await this.ensureInitialized();
    const result = await this.db.insert(galleryImages).values(image).returning();
    return result[0];
  }

  async deleteGalleryImage(id: string): Promise<boolean> {
    await this.ensureInitialized();
    const result = await this.db.delete(galleryImages).where(eq(galleryImages.id, id)).returning();
    return result.length > 0;
  }

  async getReviewsByProId(proId: string): Promise<Review[]> {
    await this.ensureInitialized();
    return await this.db.select().from(reviews).where(eq(reviews.proId, proId));
  }

  async createReview(review: InsertReview): Promise<Review> {
    await this.ensureInitialized();
    const result = await this.db.insert(reviews).values(review).returning();
    const pro = await this.getProById(review.proId);
    if (pro) {
      const allReviews = await this.getReviewsByProId(review.proId);
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await this.updatePro(review.proId, { rating: avgRating, reviewCount: allReviews.length });
    }
    return result[0];
  }

  async getMessagesByProId(proId: string): Promise<Message[]> {
    await this.ensureInitialized();
    return await this.db.select().from(messages).where(eq(messages.proId, proId));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    await this.ensureInitialized();
    const result = await this.db.insert(messages).values(message).returning();
    console.log(`New message from ${message.fromName} (${message.fromEmail}) for pro ${message.proId}: ${message.subject}`);
    return result[0];
  }

  async updateMessageStatus(id: string, status: string): Promise<Message | undefined> {
    await this.ensureInitialized();
    const result = await this.db.update(messages).set({ status }).where(eq(messages.id, id)).returning();
    return result[0];
  }

  async getSubscriptionByProId(proId: string): Promise<Subscription | undefined> {
    await this.ensureInitialized();
    const result = await this.db.select().from(subscriptions).where(eq(subscriptions.proId, proId)).limit(1);
    return result[0];
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    await this.ensureInitialized();
    const result = await this.db.insert(subscriptions).values(subscription).returning();
    return result[0];
  }

  async updateSubscriptionStatus(proId: string, status: string): Promise<Subscription | undefined> {
    await this.ensureInitialized();
    const result = await this.db.update(subscriptions).set({ status }).where(eq(subscriptions.proId, proId)).returning();
    return result[0];
  }

  async createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<PasswordResetToken> {
    await this.ensureInitialized();
    const result = await this.db.insert(passwordResetTokens).values({
      userId,
      token,
      expiresAt
    }).returning();
    return result[0];
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    await this.ensureInitialized();
    const result = await this.db
      .select()
      .from(passwordResetTokens)
      .where(and(
        eq(passwordResetTokens.token, token),
        gt(passwordResetTokens.expiresAt, new Date())
      ))
      .limit(1);
    return result[0];
  }

  async deletePasswordResetToken(token: string): Promise<boolean> {
    await this.ensureInitialized();
    const result = await this.db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token)).returning();
    return result.length > 0;
  }

  async updateUserPassword(userId: string, newPasswordHash: string): Promise<void> {
    await this.ensureInitialized();
    await this.db.update(users).set({ passwordHash: newPasswordHash }).where(eq(users.id, userId));
  }

  async updateUserAccount(userId: string, updates: { email?: string; firstName?: string; lastName?: string }): Promise<User | undefined> {
    await this.ensureInitialized();
    const result = await this.db.update(users).set(updates).where(eq(users.id, userId)).returning();
    return result[0];
  }
}

export const storage = new DbStorage();
