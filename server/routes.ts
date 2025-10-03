import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChildProfileSchema, insertPlayBoardSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Child Profile routes
  app.post("/api/child-profiles", async (req, res) => {
    try {
      const validatedData = insertChildProfileSchema.parse(req.body);
      const childProfile = await storage.createChildProfile(validatedData);
      res.json(childProfile);
    } catch (error) {
      res.status(400).json({ message: "Invalid child profile data", error });
    }
  });

  app.get("/api/child-profiles/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const childProfile = await storage.getChildProfile(id);
      if (!childProfile) {
        return res.status(404).json({ message: "Child profile not found" });
      }
      res.json(childProfile);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Milestone routes
  app.get("/api/milestones", async (req, res) => {
    try {
      const { ageRange } = req.query;
      if (ageRange && typeof ageRange === 'string') {
        const milestones = await storage.getMilestonesByAgeRange(ageRange);
        res.json(milestones);
      } else {
        const milestones = await storage.getAllMilestones();
        res.json(milestones);
      }
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const { ageRange, category } = req.query;
      let products;
      
      if (ageRange && typeof ageRange === 'string') {
        products = await storage.getProductsByAgeRange(ageRange);
      } else if (category && typeof category === 'string') {
        products = await storage.getProductsByCategory(category);
      } else {
        products = await storage.getAllProducts();
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Play Board routes
  app.post("/api/play-boards", async (req, res) => {
    try {
      const validatedData = insertPlayBoardSchema.parse(req.body);
      
      // Generate milestone and product recommendations based on child profile
      const childProfile = await storage.getChildProfile(validatedData.childProfileId!);
      if (!childProfile) {
        return res.status(404).json({ message: "Child profile not found" });
      }

      const milestones = await storage.getMilestonesByAgeRange(childProfile.ageRange);
      const products = await storage.getProductsByAgeRange(childProfile.ageRange);

      const playBoardData = {
        ...validatedData,
        milestoneIds: milestones.map(m => m.id),
        productIds: products.slice(0, 8).map(p => p.id) // Limit to 8 products
      };

      const playBoard = await storage.createPlayBoard(playBoardData);
      res.json(playBoard);
    } catch (error) {
      res.status(400).json({ message: "Invalid play board data", error });
    }
  });

  app.get("/api/play-boards/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const playBoard = await storage.getPlayBoard(id);
      if (!playBoard) {
        return res.status(404).json({ message: "Play board not found" });
      }

      // Get associated data
      const childProfile = await storage.getChildProfile(playBoard.childProfileId!);
      const allMilestones = await storage.getAllMilestones();
      const allProducts = await storage.getAllProducts();

      const milestones = allMilestones.filter(m => playBoard.milestoneIds?.includes(m.id) ?? false);
      const products = allProducts.filter(p => playBoard.productIds?.includes(p.id) ?? false);

      res.json({
        ...playBoard,
        childProfile,
        milestones,
        products
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
