import { type User, type InsertUser, type ChildProfile, type InsertChildProfile, type Milestone, type Product, type PlayBoard, type InsertPlayBoard } from "@shared/schema";
import { randomUUID } from "crypto";

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
  
  createPlayBoard(playBoard: InsertPlayBoard): Promise<PlayBoard>;
  getPlayBoard(id: string): Promise<PlayBoard | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private childProfiles: Map<string, ChildProfile>;
  private milestones: Map<string, Milestone>;
  private products: Map<string, Product>;
  private playBoards: Map<string, PlayBoard>;

  constructor() {
    this.users = new Map();
    this.childProfiles = new Map();
    this.milestones = new Map();
    this.products = new Map();
    this.playBoards = new Map();
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
}

export const storage = new MemStorage();
