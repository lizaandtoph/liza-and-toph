import { type User, type InsertUser, type ChildProfile, type InsertChildProfile, type Milestone, type Product, type InsertProduct, type PlayBoard, type InsertPlayBoard, type Professional, type InsertProfessional, users, childProfiles, milestones, products, playBoards, professionals } from "@shared/schema";
import { randomUUID } from "crypto";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private childProfiles: Map<string, ChildProfile>;
  private milestones: Map<string, Milestone>;
  private products: Map<string, Product>;
  private playBoards: Map<string, PlayBoard>;
  private professionals: Map<string, Professional>;

  constructor() {
    this.users = new Map();
    this.childProfiles = new Map();
    this.milestones = new Map();
    this.products = new Map();
    this.playBoards = new Map();
    this.professionals = new Map();
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
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

    const sampleProfessionals = [
      {
        id: "pr1",
        name: "Dr. Sarah Mitchell",
        specialty: "Child Development Specialist",
        location: "San Francisco, CA",
        rating: "4.9",
        description: "Board-certified pediatric occupational therapist with 15 years of experience in early childhood development.",
      },
      {
        id: "pr2",
        name: "Emily Rodriguez, MS",
        specialty: "Play Therapist",
        location: "Austin, TX",
        rating: "4.8",
        description: "Licensed play therapist specializing in developmental play and sensory integration.",
      },
      {
        id: "pr3",
        name: "Dr. James Chen",
        specialty: "Pediatric Psychologist",
        location: "Seattle, WA",
        rating: "5.0",
        description: "Clinical psychologist focusing on early intervention and developmental assessment.",
      },
      {
        id: "pr4",
        name: "Maria Santos, OT",
        specialty: "Occupational Therapist",
        location: "Denver, CO",
        rating: "4.7",
        description: "Pediatric OT with expertise in fine motor development and sensory processing.",
      },
    ];

    await this.db.insert(professionals).values(sampleProfessionals);
  }

  async getUser(id: string): Promise<User | undefined> {
    await this.ensureInitialized();
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    await this.ensureInitialized();
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    await this.ensureInitialized();
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
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
}

export const storage = new DbStorage();
