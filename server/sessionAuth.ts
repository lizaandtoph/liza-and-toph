import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";

export function getSession() {
  const sessionTtlSeconds = 7 * 24 * 60 * 60; // 1 week in seconds
  const sessionTtlMs = sessionTtlSeconds * 1000; // 1 week in milliseconds
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtlSeconds, // TTL in seconds for connect-pg-simple
    tableName: "sessions",
  });
  
  const isProduction = process.env.NODE_ENV === 'production';
  console.log('[Session] Configuring session - production:', isProduction, 'secure:', isProduction);
  
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: sessionTtlMs, // maxAge in milliseconds for cookie
    },
  });
}

export async function setupAuth(app: Express) {
  // Set up trust proxy for production (required for secure cookies behind proxy)
  app.set("trust proxy", 1);
  
  // Set up session middleware
  app.use(getSession());
  
  // Set up Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport serialization for magic link auth
  passport.serializeUser((user: any, cb) => {
    cb(null, {
      claims: user.claims,
    });
  });
  
  passport.deserializeUser((user: any, cb) => cb(null, user));

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  return next();
};
