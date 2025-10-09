# Overview

This is a React-based web application called "Liza & Toph" that helps parents track their children's developmental milestones and discover age-appropriate products, toys, and books. The application provides personalized "Play Boards" based on each child's age range, interests, and developmental stage. Parents can manage multiple children in their account, with each child having their own profile and personalized recommendations. Users complete a questionnaire for each child, and the system generates customized recommendations including developmental milestones, activity ideas, and curated product suggestions.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes

## October 8, 2025 - Early Access Period Implementation
- **Removed Subscription Requirements**: All authenticated users have full, unrestricted access through January 2026
- **Early Access Welcome Page**: Replaced Subscribe page with early access message and feedback collection CTA
- **Backend Access Control**: Modified `/api/subscription-status` to always return `hasActiveSubscription: true` with status 'early_access' for all authenticated users
- **Removed Paywall UI**: Removed all paywall overlays, subscription banners, and locked content sections from PlayBoard
- **Settings Page Update**: Removed subscription tab and subscription-related functionality
- **Feedback Collection**: Added prominent CTA button linking to app-feedback.lizaandtoph.com for user feedback during early access period

## October 7, 2025 - Production Authentication & Data Sync Fixes
- **Critical Production Fix**: Moved `app.set("trust proxy", 1)` to before session middleware setup (required for cookies to work properly with HTTPS in production)
- **Dynamic Auth Strategy**: Implemented dynamic authentication strategy creation that auto-detects and supports ANY domain (lizaandtoph.com, replit.dev, etc.) without requiring REPLIT_DOMAINS configuration
- **Data Sync Fix**: Removed `children.length === 0` guard in Layout so children/answers always refresh from server when authenticated (prevents stale data issues)
- **Duplication Prevention**: Added submission guard in onboarding to prevent double-submit during async child creation
- **Milestone Display**: Added `effectiveAgeBand` fallback calculation for children without ageBand field
- **Product Integration**: Recommendations page now uses same database products as Shop page with age/need-based filtering

# System Architecture

## Frontend Architecture

**Framework & Build System**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server for fast compilation and HMR
- React Router DOM for client-side routing
- Path aliases configured for clean imports (`@/`, `@shared/`, `@assets/`)

**UI Component System**
- shadcn/ui component library with Radix UI primitives for accessible, customizable components
- Tailwind CSS for utility-first styling with custom design tokens
- CSS variables for theming (light/dark mode support built-in)
- Custom fonts: Sentient (headings), Poppins (body and subheaders)

**State Management & Data Fetching**
- Zustand with localStorage persistence for global state (multi-child support, active child selection, per-child questionnaire answers, parent account, saved items)
- **Authentication**: Passwordless magic link authentication with session-based storage in PostgreSQL
  - `useAuth` hook provides user data (firstName, lastName, email) from authenticated session
  - Parent info can be entered manually in onboarding (editable fields unless pre-populated from user profile)
  - No password management - users receive a secure login link via email (Resend integration)
- Multi-child architecture: parents can add and manage multiple children, each with unique ID (nanoid), profile, and answers
- Saved items: brands, professionals, and products favorited by parents (persisted in localStorage)
- TanStack Query (React Query) for server state management, caching, and data synchronization
- React Hook Form with Zod for form validation and type-safe form handling
- Custom hooks for UI concerns (mobile detection, toast notifications, authentication)

**Component Structure**
- Reusable UI components in `client/src/components/ui/` following shadcn conventions
- Feature components for domain logic (MilestoneTimeline, ProductGrid, QuestionnaireStep)
- Pages organized by route (`home`, `login`, `onboarding`, `your-child`, `playboard`, `shop`, `pros`, `settings`)
- Child selector dropdown in Layout component for switching between children
- "Add Another Child" functionality integrated into navigation
- Your Child page (`/your-child`) displays all children in responsive cards with avatar, name, age/age band, stage nickname, developmental journey teasers, and "View Play Board" CTA
  - Shows empty state with "Add Your Child" button when no children exist
  - Responsive layout: single column on mobile, 2-column grid on desktop
  - Each child card links to their individual Play Board via `/playboard/:childId`
  - "Add Another Child" card routes to onboarding for new profiles
- Play Board page supports both `/playboard` (uses active child) and `/playboard/:childId` (sets specific child as active)
- Settings page accessible from profile dropdown and secondary navigation
- Product cards display images, user ratings (with review counts), prices, domain tags, and age ranges on both Shop and Recommendations pages

## Backend Architecture

**Server Framework**
- Express.js with TypeScript for HTTP server and API routes
- Custom middleware for request logging, JSON parsing, and raw body capture
- Vite middleware integration in development for SSR-like capabilities

**API Design**
- RESTful API endpoints under `/api/` prefix
- **Public endpoints** (used by public-facing pages):
  - `GET /api/professionals` - List all professionals for Find Pros page
  - `GET /api/products` - List all products for Shop page (with optional ageRange/category filters)
  - `GET /api/milestones?ageRange=...` - Milestones with filtering
- **Admin endpoints** (used by admin management pages):
  - `GET /api/admin/professionals` - Admin professional list
  - `POST /api/admin/professionals` - Create professional
  - `GET /api/admin/products` - Admin product list
  - `POST /api/admin/products` - Create product
- Routes for child profiles (`POST /api/child-profiles`, `GET /api/child-profiles/:id`)
- Routes for play boards (personalized recommendation boards)

**Data Layer**
- In-memory storage implementation (`MemStorage`) for development/prototyping
- Interface-based storage abstraction (`IStorage`) allowing easy swap to database
- Seed data included for milestones, products, and professionals
- Type-safe data models shared between client and server via `@shared/schema`
- **Products & Professionals**: Now managed via database with admin pages
  - Admin pages (AdminPros, Admin) manage data
  - Public pages (FindPros, Shop) fetch from public API endpoints
  - Age range parsing handles formats like "6-12 months", "0-6 years", or plain numbers

**Schema & Validation**
- Drizzle ORM schema definitions in PostgreSQL dialect
- Zod schemas generated from Drizzle schemas for runtime validation
- Type inference from schemas ensures end-to-end type safety
- Tables: users, childProfiles, milestones, products, playBoards

## Data Storage

**Database Configuration**
- Drizzle ORM configured for PostgreSQL via `@neondatabase/serverless`
- Connection via `DATABASE_URL` environment variable
- Migrations output to `./migrations` directory
- Schema-first approach with shared type definitions

**Data Models**
- **Parent Accounts**: Authenticated via passwordless magic link, user data stored in PostgreSQL users table
  - Onboarding Step 1 allows parent info entry (firstName, lastName, email) - fields only disabled if pre-populated from profile
  - Settings page displays user info (name and email) - no password required with magic link authentication
  - Child's first name (not full name) collected in onboarding
- **Child Profiles**: Stores child information with unique ID (nanoid), name, birthday, calculated age, age band, and developmental preferences
  - Multiple children per parent account supported
  - Each child has separate questionnaire answers (schemas, barriers, interests)
  - Active child selection tracked for personalized view
  - Settings page allows editing child name/birthday and deleting children
- **Saved Items**: Favorited brands, professionals, and products tracked per parent account
  - Three categories: brands, professionals, products
  - Can be viewed and removed from Settings page
- **Milestones**: Developmental milestones categorized by type (cognitive, motor, language, social-emotional)
- **Products**: Toy/book recommendations with pricing, ratings, categories, affiliate links
  - Schema fields: id, name, brand, description, price, imageUrl, categories (array), ageRange, rating, reviewCount, affiliateUrl, isTopPick, isBestseller, isNew
  - Managed via Admin page, displayed on Shop page
  - Shop page transforms Product schema to UI format (id→skuId, name→title, affiliateUrl→url)
- **Professionals**: Healthcare and development professionals directory
  - Schema fields: id, name, specialty, location, rating (string), description, email (nullable)
  - Managed via AdminPros page (/admin-pros), displayed on Professionals page (/pros)
  - Professionals page features search, specialty filter, and rating filter
  - Contact button opens mailto: link using professional's email (disabled if no email)
  - /find-pros redirects to /pros for backward compatibility
- **Play Boards**: Aggregated personalized boards combining profiles, milestones, and products

**Current Implementation**
- Development uses in-memory storage with seed data for products and professionals
- PostgreSQL database for users, sessions, and child profiles
- Storage interface allows seamless transition from mock to real database
- **Authentication**: Passwordless magic link authentication with PostgreSQL session store (connect-pg-simple)
  - Session cookies configured with `sameSite: 'lax'` and conditional `secure` flag for production  
  - Passport.js for session serialization
  - Magic link tokens sent via Resend email integration

## External Dependencies

**UI & Styling**
- Radix UI components for accessible primitives (dialogs, dropdowns, tooltips, etc.)
- Tailwind CSS with PostCSS for styling pipeline
- Custom fonts: Sentient (self-hosted .otf files for headers), Poppins (Google Fonts for body text)
- class-variance-authority and clsx for conditional className composition

**Data & Forms**
- TanStack Query for data fetching and caching
- React Hook Form with @hookform/resolvers for form management
- Zod for schema validation and type inference
- drizzle-zod for automatic Zod schema generation from ORM models

**Database & ORM**
- Drizzle ORM for type-safe database queries
- @neondatabase/serverless for PostgreSQL connection pooling
- connect-pg-simple for PostgreSQL session store (authentication sessions)

**Development Tools**
- tsx for running TypeScript server code directly
- esbuild for production server bundling
- @replit specific plugins for development environment integration (error overlay, cartographer, dev banner)

**Utilities**
- date-fns for date manipulation
- nanoid for unique ID generation
- lucide-react for icon components
- cmdk for command palette functionality
- embla-carousel-react for carousel components