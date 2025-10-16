import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChildProfileSchema, insertPlayBoardSchema, insertProductSchema, updateProductSchema, insertProfessionalSchema, updateProfessionalSchema, registerUserSchema, loginUserSchema, updateUserAccountSchema, insertProSchema, updateProSchema, insertServiceOfferingSchema, insertServiceAreaSchema, insertGalleryImageSchema, insertReviewSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth, isAuthenticated } from "./sessionAuth";
import { sendMagicLinkEmail } from "./email";
import { nanoid } from "nanoid";
import multer from "multer";
import path from "path";
import fs from "fs";
import Stripe from "stripe";

// Helper middleware to check user roles
const requireRole = (role: string): RequestHandler => {
  return async (req: any, res, next) => {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUser(userId);
    if (!user || user.role !== role) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    next();
  };
};

// Helper middleware to check ownership or admin role
const requireOwnershipOrAdmin: RequestHandler = async (req: any, res, next) => {
  const userId = req.user?.claims?.sub;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const user = await storage.getUser(userId);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Allow admins to access any resource
  if (user.role === "admin") {
    return next();
  }
  
  // Allow pros to access their own resources
  if (user.role === "pro" && user.proId === req.params.id) {
    return next();
  }
  
  return res.status(403).json({ message: "Forbidden" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);

  // Auth user endpoint - check if user is authenticated
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Magic link authentication - request login link
  app.post('/api/auth/request-login', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ message: "Email is required" });
      }

      // Find or create user by email
      let user = await storage.getUserByEmail(email.toLowerCase().trim());
      
      if (!user) {
        // Create new user if they don't exist
        user = await storage.upsertUser({
          id: nanoid(),
          email: email.toLowerCase().trim(),
          firstName: null,
          lastName: null,
          profileImageUrl: null
        });
      }

      // Generate login token
      const token = nanoid(32);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Save token to database
      await storage.createLoginToken(user.id, token, expiresAt);

      // Send magic link email
      await sendMagicLinkEmail(email, token);

      res.json({ message: "Login link sent to your email" });
    } catch (error) {
      console.error("Error sending magic link:", error);
      res.status(500).json({ message: "Failed to send login link" });
    }
  });

  // Magic link authentication - verify token and log in
  app.get('/api/auth/verify/:token', async (req, res) => {
    try {
      const { token } = req.params;

      // Verify token
      const loginToken = await storage.getLoginToken(token);

      if (!loginToken) {
        return res.status(400).send(`
          <html>
            <head><title>Invalid Login Link</title></head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h1>Invalid or Expired Login Link</h1>
              <p>This login link is invalid, has expired, or has already been used.</p>
              <p><a href="/login">Request a new login link</a></p>
            </body>
          </html>
        `);
      }

      // Mark token as used
      await storage.markLoginTokenUsed(token);

      // Get user
      const user = await storage.getUser(loginToken.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Create session (compatible with existing session system)
      req.login({ claims: { sub: user.id, email: user.email } }, async (err: any) => {
        if (err) {
          console.error("Error creating session:", err);
          return res.status(500).send(`
            <html>
              <head><title>Login Error</title></head>
              <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h1>Login Error</h1>
                <p>An error occurred while logging you in. Please try again.</p>
                <p><a href="/login">Go to login</a></p>
              </body>
            </html>
          `);
        }

        // Check if user has children to determine redirect
        const children = await storage.getChildrenByUserId(user.id);
        const redirectPath = children.length > 0 ? '/your-child' : '/onboarding';
        
        console.log(`[Auth] User ${user.id} logged in, has ${children.length} children, redirecting to ${redirectPath}`);
        
        // Successful login - redirect based on whether they have children
        res.redirect(redirectPath);
      });
    } catch (error) {
      console.error("Error verifying magic link:", error);
      res.status(500).send(`
        <html>
          <head><title>Login Error</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1>Login Error</h1>
            <p>An unexpected error occurred. Please try again.</p>
            <p><a href="/login">Go to login</a></p>
          </body>
        </html>
      `);
    }
  });

  // Client error logging endpoint
  app.post('/api/client-error', (req, res) => {
    const { message, stack, url } = req.body;
    console.error('[CLIENT ERROR]', { message, stack, url });
    res.json({ logged: true });
  });

  // Affiliate link tracker
  app.get("/api/links", (req, res) => {
    const { sku, to } = req.query;
    
    if (!sku || !to || typeof sku !== 'string' || typeof to !== 'string') {
      return res.status(400).json({ message: "Missing sku or to parameter" });
    }

    const decodedUrl = decodeURIComponent(to);
    console.log('[ANALYTICS] affiliate_click', { 
      event: 'affiliate_click', 
      sku, 
      to: decodedUrl, 
      at: new Date().toISOString() 
    });
    
    res.redirect(302, decodedUrl);
  });

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

  app.patch("/api/child-profiles/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const childProfile = await storage.updateChildProfile(id, req.body);
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

  // Product routes (public)
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

  // Professional routes (public)
  app.get("/api/professionals", async (req, res) => {
    try {
      const professionals = await storage.getAllProfessionals();
      res.json(professionals);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Admin Product routes
  app.get("/api/admin/products", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.get("/api/admin/products/:id", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.post("/api/admin/products", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.put("/api/admin/products/:id", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = updateProductSchema.parse(req.body);
      const product = await storage.updateProduct(id, validatedData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.delete("/api/admin/products/:id", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Admin Professional routes
  app.get("/api/admin/professionals", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const professionals = await storage.getAllProfessionals();
      res.json(professionals);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.get("/api/admin/professionals/:id", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      const professional = await storage.getProfessional(id);
      if (!professional) {
        return res.status(404).json({ message: "Professional not found" });
      }
      res.json(professional);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.post("/api/admin/professionals", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const validatedData = insertProfessionalSchema.parse(req.body);
      const professional = await storage.createProfessional(validatedData);
      res.json(professional);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid professional data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.put("/api/admin/professionals/:id", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = updateProfessionalSchema.parse(req.body);
      const professional = await storage.updateProfessional(id, validatedData);
      if (!professional) {
        return res.status(404).json({ message: "Professional not found" });
      }
      res.json(professional);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid professional data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.delete("/api/admin/professionals/:id", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteProfessional(id);
      if (!success) {
        return res.status(404).json({ message: "Professional not found" });
      }
      res.json({ message: "Professional deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Import from Google Sheets endpoints
  app.post("/api/admin/import-dev", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const { exec } = await import("child_process");
      const { promisify } = await import("util");
      const execAsync = promisify(exec);
      
      const { stdout, stderr } = await execAsync("python3 import_from_sheet.py");
      
      res.json({ 
        success: true, 
        message: "Development database import completed",
        output: stdout,
        errors: stderr || null
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        message: "Import failed", 
        error: error.message,
        output: error.stdout || null,
        errors: error.stderr || null
      });
    }
  });

  app.post("/api/admin/import-production", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const { exec } = await import("child_process");
      const { promisify } = await import("util");
      const execAsync = promisify(exec);
      
      const { stdout, stderr } = await execAsync("python3 import_from_sheet.py --production");
      
      res.json({ 
        success: true, 
        message: "Production database import completed",
        output: stdout,
        errors: stderr || null
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        message: "Import failed", 
        error: error.message,
        output: error.stdout || null,
        errors: error.stderr || null
      });
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

  // Configure Multer for file uploads
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const upload = multer({
    storage: multer.diskStorage({
      destination: uploadsDir,
      filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      if (extname && mimetype) {
        cb(null, true);
      } else {
        cb(new Error("Only jpg, png, and webp images are allowed"));
      }
    },
  });

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerUserSchema.parse(req.body);
      const existing = await storage.getUserByEmail(validatedData.email);
      if (existing) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const hashedPassword = await hashPassword(validatedData.password);
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      const token = generateToken(user);
      res.cookie("token", token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.json({ user: { id: user.id, email: user.email, role: user.role, proId: user.proId }, token });
    } catch (error) {
      res.status(400).json({ error: "Invalid registration data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const valid = await comparePassword(validatedData.password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = generateToken(user);
      res.cookie("token", token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.json({ user: { id: user.id, email: user.email, role: user.role, proId: user.proId }, token });
    } catch (error) {
      res.status(400).json({ error: "Invalid login data" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: "Session destruction failed" });
        }
        res.clearCookie("connect.sid");
        res.json({ message: "Logged out successfully" });
      });
    });
  });

  app.get("/api/auth/me", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Get all children linked to this user (owned + shared)
      const links = await storage.getUserChildLinks(userId);
      const childrenWithRoles = await Promise.all(
        links.map(async (link) => {
          const child = await storage.getChildProfile(link.childId);
          return child ? { ...child, linkRole: link.role } : null;
        })
      );
      
      const children = childrenWithRoles.filter(c => c !== null);
      
      res.json({ 
        user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName || null,
          lastName: user.lastName || null,
          role: user.role, 
          proId: user.proId,
          createdAt: user.createdAt
        }, 
        children 
      });
    } catch (error) {
      console.error("Error in /api/auth/me:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.patch("/api/auth/account", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const validatedData = updateUserAccountSchema.parse(req.body);
      
      if (validatedData.email) {
        const existing = await storage.getUserByEmail(validatedData.email);
        if (existing && existing.id !== userId) {
          return res.status(400).json({ error: "Email already in use" });
        }
      }

      const updatedUser = await storage.updateUserAccount(userId, validatedData);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ 
        user: { 
          id: updatedUser.id, 
          email: updatedUser.email, 
          firstName: updatedUser.firstName || null,
          lastName: updatedUser.lastName || null,
          role: updatedUser.role, 
          proId: updatedUser.proId 
        } 
      });
    } catch (error) {
      console.error("Error in /api/auth/account:", error);
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  app.get("/api/auth/children", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const children = await storage.getChildrenByUserId(userId);
      res.json(children);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/auth/children", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        console.error("Child creation failed: No userId in session");
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const childData = insertChildProfileSchema.parse({
        ...req.body,
        userId: userId,
      });
      const child = await storage.createChildProfile(childData);
      
      // Auto-create owner link for the child creator
      await storage.createUserChildLink({
        userId: userId,
        childId: child.id,
        role: "owner",
        invitedBy: null
      });
      
      res.json(child);
    } catch (error) {
      console.error("Child creation error:", error);
      res.status(400).json({ error: "Invalid child data" });
    }
  });

  // Family sharing - Generate referral code for a child
  app.post("/api/children/:childId/invite", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { childId } = req.params;
      
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      // Check if user has access to this child
      const links = await storage.getUserChildLinks(userId);
      const hasAccess = links.some(link => link.childId === childId && (link.role === "owner" || link.role === "editor"));
      
      if (!hasAccess) {
        return res.status(403).json({ error: "You don't have permission to invite others to this child's playboard" });
      }
      
      // Generate unique referral code
      const code = nanoid(10).toUpperCase();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      
      const token = await storage.createReferralToken({
        childId,
        code,
        createdBy: userId,
        expiresAt,
        maxUses: 1
      });
      
      res.json(token);
    } catch (error) {
      console.error("Error creating referral token:", error);
      res.status(500).json({ error: "Failed to create invite" });
    }
  });

  // Family sharing - Get active invites for a child
  app.get("/api/children/:childId/invites", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { childId } = req.params;
      
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      // Check if user has access to this child
      const links = await storage.getUserChildLinks(userId);
      const hasAccess = links.some(link => link.childId === childId);
      
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const tokens = await storage.getActiveReferralTokensByChild(childId);
      res.json(tokens);
    } catch (error) {
      console.error("Error fetching invites:", error);
      res.status(500).json({ error: "Failed to fetch invites" });
    }
  });

  // Family sharing - Join using referral code
  app.post("/api/children/join", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { code } = req.body;
      
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      if (!code) {
        return res.status(400).json({ error: "Invite code is required" });
      }
      
      // Validate referral code
      const token = await storage.getReferralTokenByCode(code.toUpperCase());
      
      if (!token) {
        return res.status(404).json({ error: "Invalid or expired invite code" });
      }
      
      // Check if already linked
      const existingLinks = await storage.getUserChildLinks(userId);
      if (existingLinks.some(link => link.childId === token.childId)) {
        return res.status(400).json({ error: "You already have access to this child's playboard" });
      }
      
      // Check if max uses reached
      if (token.usedCount >= token.maxUses) {
        return res.status(400).json({ error: "This invite code has already been used" });
      }
      
      // Create the link
      const link = await storage.createUserChildLink({
        userId,
        childId: token.childId,
        role: "viewer",
        invitedBy: token.createdBy
      });
      
      // Update token usage
      await storage.updateReferralTokenUsage(token.id, userId);
      
      // Get the child profile to return
      const child = await storage.getChildProfile(token.childId);
      
      res.json({ link, child });
    } catch (error) {
      console.error("Error joining with referral code:", error);
      res.status(500).json({ error: "Failed to join playboard" });
    }
  });

  // Family sharing - Get family members for a child
  app.get("/api/children/:childId/family", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { childId } = req.params;
      
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      // Check if user has access to this child
      const userLinks = await storage.getUserChildLinks(userId);
      const hasAccess = userLinks.some(link => link.childId === childId);
      
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Get all links for this child
      const links = await storage.getChildLinks(childId);
      
      // Get user info for each link
      const familyMembers = await Promise.all(
        links.map(async (link) => {
          const user = await storage.getUser(link.userId);
          return {
            ...link,
            user: user ? {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName
            } : null
          };
        })
      );
      
      res.json(familyMembers);
    } catch (error) {
      console.error("Error fetching family members:", error);
      res.status(500).json({ error: "Failed to fetch family members" });
    }
  });

  // Family sharing - Remove family member access
  app.delete("/api/children/:childId/family/:targetUserId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { childId, targetUserId } = req.params;
      
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      // Check if current user is owner
      const userLinks = await storage.getUserChildLinks(userId);
      const isOwner = userLinks.some(link => link.childId === childId && link.role === "owner");
      
      if (!isOwner) {
        return res.status(403).json({ error: "Only the owner can remove family members" });
      }
      
      // Can't remove yourself if you're the owner
      if (userId === targetUserId) {
        return res.status(400).json({ error: "Cannot remove yourself as owner" });
      }
      
      const success = await storage.deleteUserChildLink(targetUserId, childId);
      
      if (!success) {
        return res.status(404).json({ error: "Family member not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing family member:", error);
      res.status(500).json({ error: "Failed to remove family member" });
    }
  });

  // Family sharing - Revoke invite
  app.delete("/api/children/:childId/invites/:tokenId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { childId, tokenId } = req.params;
      
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      // Check if user has permission
      const links = await storage.getUserChildLinks(userId);
      const hasPermission = links.some(link => link.childId === childId && (link.role === "owner" || link.role === "editor"));
      
      if (!hasPermission) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const success = await storage.deleteReferralToken(tokenId);
      
      if (!success) {
        return res.status(404).json({ error: "Invite not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error revoking invite:", error);
      res.status(500).json({ error: "Failed to revoke invite" });
    }
  });

  // Backfill migration - Create owner links for existing children
  app.post("/api/admin/backfill-child-links", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      // Get all children
      const sql = neon(process.env.DATABASE_URL!);
      const db = drizzle(sql);
      const allChildren = await db.select().from(childProfiles);
      
      let created = 0;
      let skipped = 0;
      
      for (const child of allChildren) {
        // Check if link already exists
        const existingLinks = await storage.getUserChildLinks(child.userId);
        const hasLink = existingLinks.some(link => link.childId === child.id);
        
        if (!hasLink) {
          // Create owner link
          await storage.createUserChildLink({
            userId: child.userId,
            childId: child.id,
            role: "owner",
            invitedBy: null
          });
          created++;
        } else {
          skipped++;
        }
      }
      
      res.json({ 
        message: "Backfill complete",
        created,
        skipped,
        total: allChildren.length
      });
    } catch (error) {
      console.error("Error in backfill:", error);
      res.status(500).json({ error: "Backfill failed" });
    }
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({ message: "If an account exists, a password reset email has been sent" });
      }

      const { randomBytes } = await import("crypto");
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await storage.createPasswordResetToken(user.id, token, expiresAt);

      const { sendPasswordResetEmail } = await import("./email");
      await sendPasswordResetEmail(user.email, token);

      res.json({ message: "If an account exists, a password reset email has been sent" });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Failed to process request" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ error: "Token and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }

      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUserPassword(resetToken.userId, hashedPassword);
      await storage.deletePasswordResetToken(token);

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  // Pro directory routes (public)
  app.get("/api/pros", async (req, res) => {
    try {
      const { q, zip, radius, category, ratingMin, priceRange } = req.query;
      const filters = {
        q: q as string | undefined,
        zip: zip as string | undefined,
        radius: radius ? parseInt(radius as string) : undefined,
        category: category as string | undefined,
        ratingMin: ratingMin ? parseFloat(ratingMin as string) : undefined,
        priceRange: priceRange as string | undefined,
      };

      const pros = await storage.getAllPros(filters);
      res.json(pros);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/pros/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const pro = await storage.getProBySlug(slug);
      if (!pro) {
        return res.status(404).json({ error: "Pro not found" });
      }

      const [services, areas, gallery, reviews] = await Promise.all([
        storage.getServiceOfferingsByProId(pro.id),
        storage.getServiceAreasByProId(pro.id),
        storage.getGalleryImagesByProId(pro.id),
        storage.getReviewsByProId(pro.id),
      ]);

      res.json({ ...pro, services, areas, gallery, reviews });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/pros/:id", isAuthenticated as any, requireOwnershipOrAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const validatedData = updateProSchema.parse(req.body);
      const pro = await storage.updatePro(id, validatedData);
      if (!pro) {
        return res.status(404).json({ error: "Pro not found" });
      }
      res.json(pro);
    } catch (error) {
      res.status(400).json({ error: "Invalid pro data" });
    }
  });

  // Service offerings routes
  app.post("/api/pros/:id/services", isAuthenticated as any, requireOwnershipOrAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertServiceOfferingSchema.parse({ ...req.body, proId: id });
      const service = await storage.createServiceOffering(validatedData);
      res.json(service);
    } catch (error) {
      res.status(400).json({ error: "Invalid service data" });
    }
  });

  app.delete("/api/pros/:id/services/:serviceId", isAuthenticated as any, requireOwnershipOrAdmin, async (req: AuthRequest, res) => {
    try {
      const { serviceId } = req.params;
      const success = await storage.deleteServiceOffering(serviceId);
      if (!success) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.json({ message: "Service deleted" });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Service areas routes
  app.post("/api/pros/:id/areas", isAuthenticated as any, requireOwnershipOrAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertServiceAreaSchema.parse({ ...req.body, proId: id });
      const area = await storage.createServiceArea(validatedData);
      res.json(area);
    } catch (error) {
      res.status(400).json({ error: "Invalid area data" });
    }
  });

  app.delete("/api/pros/:id/areas/:areaId", isAuthenticated as any, requireOwnershipOrAdmin, async (req: AuthRequest, res) => {
    try {
      const { areaId } = req.params;
      const success = await storage.deleteServiceArea(areaId);
      if (!success) {
        return res.status(404).json({ error: "Area not found" });
      }
      res.json({ message: "Area deleted" });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Gallery routes
  app.post("/api/pros/:id/gallery", isAuthenticated as any, requireOwnershipOrAdmin, upload.single("image"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const imageUrl = `/uploads/${req.file.filename}`;
      const validatedData = insertGalleryImageSchema.parse({
        proId: id,
        url: imageUrl,
        title: req.body.title || null,
        description: req.body.description || null,
        tags: req.body.tags ? JSON.parse(req.body.tags) : null,
      });

      const image = await storage.createGalleryImage(validatedData);
      res.json(image);
    } catch (error) {
      res.status(400).json({ error: "Invalid gallery image data" });
    }
  });

  app.delete("/api/pros/:id/gallery/:imgId", isAuthenticated as any, requireOwnershipOrAdmin, async (req: AuthRequest, res) => {
    try {
      const { imgId } = req.params;
      const images = await storage.getGalleryImagesByProId(req.params.id);
      const image = images.find(img => img.id === imgId);
      
      if (image) {
        const filePath = path.join(uploadsDir, path.basename(image.url));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      const success = await storage.deleteGalleryImage(imgId);
      if (!success) {
        return res.status(404).json({ error: "Image not found" });
      }
      res.json({ message: "Image deleted" });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Review routes
  app.get("/api/pros/:id/reviews", async (req, res) => {
    try {
      const { id } = req.params;
      const reviews = await storage.getReviewsByProId(id);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/pros/:id/reviews", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertReviewSchema.parse({ ...req.body, proId: id });
      const review = await storage.createReview(validatedData);
      res.json(review);
    } catch (error) {
      res.status(400).json({ error: "Invalid review data" });
    }
  });

  // Message routes
  app.get("/api/pros/:id/messages", isAuthenticated as any, requireOwnershipOrAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const messages = await storage.getMessagesByProId(id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/pros/:id/messages", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertMessageSchema.parse({ ...req.body, proId: id });
      const message = await storage.createMessage(validatedData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ error: "Invalid message data" });
    }
  });

  // Subscription routes
  app.get("/api/subscriptions/:proId", isAuthenticated as any, async (req: AuthRequest, res) => {
    try {
      const { proId } = req.params;
      const subscription = await storage.getSubscriptionByProId(proId);
      res.json(subscription || { status: "inactive" });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/subscriptions/:proId/activate", isAuthenticated as any, async (req: AuthRequest, res) => {
    try {
      const { proId } = req.params;
      let subscription = await storage.getSubscriptionByProId(proId);
      
      if (subscription) {
        subscription = await storage.updateSubscriptionStatus(proId, "active");
      } else {
        subscription = await storage.createSubscription({
          proId,
          status: "active",
          plan: "professional",
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
      }

      res.json(subscription);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Stripe subscription endpoint (referencing blueprint:javascript_stripe)
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
  });

  // Endpoint to check subscription status - Early Access Period (Free through Jan 2026)
  app.get('/api/subscription-status', isAuthenticated as any, async (req: AuthRequest, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // During early access period, all authenticated users have full access
      return res.json({ 
        hasActiveSubscription: true,
        status: 'early_access' 
      });
    } catch (error: any) {
      console.error('Error checking subscription status:', error);
      return res.status(500).json({ error: { message: error.message } });
    }
  });

  app.post('/api/get-or-create-subscription', isAuthenticated as any, async (req: AuthRequest, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const userId = req.user.claims.sub;
      let user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // If user already has a subscription, check its status
      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);

        // If subscription is active or trialing, they don't need to pay again
        if (subscription.status === 'active' || subscription.status === 'trialing') {
          return res.json({
            alreadySubscribed: true,
            subscriptionId: subscription.id,
          });
        }

        // If subscription needs payment (incomplete, past_due), return client secret
        const clientSecret = (subscription.latest_invoice as any)?.payment_intent?.client_secret;
        return res.json({
          subscriptionId: subscription.id,
          clientSecret,
        });
      }

      // Create Stripe customer if not exists
      let customerId = user.stripeCustomerId;
      
      if (!customerId) {
        if (!user.email) {
          return res.status(400).json({ message: 'No user email on file' });
        }

        const customer = await stripe.customers.create({
          email: user.email,
          name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email,
        });

        customerId = customer.id;
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price: process.env.STRIPE_PRICE_ID!,
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      // Save subscription ID (access will be gated on subscription STATUS, not just ID)
      await storage.updateUserStripeInfo(userId, customerId, subscription.id);

      const clientSecret = (subscription.latest_invoice as any)?.payment_intent?.client_secret;

      return res.json({
        subscriptionId: subscription.id,
        clientSecret,
      });
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      return res.status(400).json({ error: { message: error.message } });
    }
  });

  // Feedback endpoint - send user feedback via email
  app.post('/api/feedback', async (req: any, res) => {
    try {
      const { feedback, url, timestamp } = req.body;

      if (!feedback || !feedback.trim()) {
        return res.status(400).json({ error: 'Feedback is required' });
      }

      // Get user info if authenticated
      let userInfo = 'Anonymous';
      if (req.isAuthenticated() && req.user?.claims?.sub) {
        const user = await storage.getUser(req.user.claims.sub);
        if (user) {
          userInfo = `${user.firstName} ${user.lastName} (${user.email})`;
        }
      }

      // Send email with feedback
      await sendMagicLinkEmail(
        'support@lizaandtoph.com', // Replace with your actual support email
        'User Feedback Report',
        `
          <h2>New Feedback Received</h2>
          <p><strong>From:</strong> ${userInfo}</p>
          <p><strong>Page:</strong> ${url || 'Unknown'}</p>
          <p><strong>Time:</strong> ${timestamp || new Date().toISOString()}</p>
          <hr>
          <p><strong>Feedback:</strong></p>
          <p>${feedback.replace(/\n/g, '<br>')}</p>
        `
      );

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error sending feedback:', error);
      return res.status(500).json({ error: 'Failed to send feedback' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
