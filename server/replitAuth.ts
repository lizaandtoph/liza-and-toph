import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  const userData = {
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  };
  console.log('[Replit Auth] Upserting user:', userData);
  const result = await storage.upsertUser(userData);
  console.log('[Replit Auth] User after upsert - role:', result.role, 'proId:', result.proId);
}

export async function setupAuth(app: Express) {
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  // Create a map to store strategies by hostname
  const strategyMap = new Map<string, Strategy>();

  // Helper to get or create strategy for a hostname
  const getOrCreateStrategy = (hostname: string, protocol: string = 'https') => {
    if (strategyMap.has(hostname)) {
      return strategyMap.get(hostname)!;
    }

    const strategy = new Strategy(
      {
        name: `replitauth:${hostname}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `${protocol}://${hostname}/api/callback`,
      },
      verify,
    );
    
    passport.use(strategy);
    strategyMap.set(hostname, strategy);
    return strategy;
  };

  // Pre-register strategies for known domains
  const domains = process.env.REPLIT_DOMAINS!.split(",");
  for (const domain of domains) {
    getOrCreateStrategy(domain.trim(), 'https');
  }
  
  // Pre-register local development strategies
  getOrCreateStrategy('127.0.0.1', 'http');
  getOrCreateStrategy('localhost', 'http');
  
  // Pre-register custom domain if it exists
  if (process.env.CUSTOM_DOMAIN) {
    getOrCreateStrategy(process.env.CUSTOM_DOMAIN, 'https');
  }

  passport.serializeUser((user: any, cb) => {
    cb(null, {
      claims: user.claims,
      access_token: user.access_token,
      refresh_token: user.refresh_token,
      expires_at: user.expires_at,
    });
  });
  
  passport.deserializeUser((user: any, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    // Dynamically create strategy if it doesn't exist
    const protocol = req.protocol || (req.secure ? 'https' : 'http');
    getOrCreateStrategy(req.hostname, protocol);
    
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    // Dynamically create strategy if it doesn't exist
    const protocol = req.protocol || (req.secure ? 'https' : 'http');
    getOrCreateStrategy(req.hostname, protocol);
    
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
