# Overview

This is a React-based web application called "Liza & Toph" that helps parents track their children's developmental milestones and discover age-appropriate products, toys, and books. The application provides personalized "Play Boards" based on each child's age range, interests, and developmental stage. Parents can manage multiple children in their account, with each child having their own profile and personalized recommendations. Users complete a questionnaire for each child, and the system generates customized recommendations including developmental milestones, activity ideas, and curated product suggestions.

# User Preferences

Preferred communication style: Simple, everyday language.

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
- Parent authentication: firstName, lastName, email, password stored in zustand (localStorage-based MVP, not backend)
- Multi-child architecture: parents can add and manage multiple children, each with unique ID (nanoid), profile, and answers
- Saved items: brands, professionals, and products favorited by parents (persisted in localStorage)
- TanStack Query (React Query) for server state management, caching, and data synchronization
- React Hook Form with Zod for form validation and type-safe form handling
- Custom hooks for UI concerns (mobile detection, toast notifications)

**Component Structure**
- Reusable UI components in `client/src/components/ui/` following shadcn conventions
- Feature components for domain logic (MilestoneTimeline, ProductGrid, QuestionnaireStep)
- Pages organized by route (`home`, `login`, `onboarding`, `playboard`, `shop`, `find-pros`, `settings`)
- Child selector dropdown in Layout component for switching between children
- "Add Another Child" functionality integrated into navigation
- Settings page accessible from profile dropdown and secondary navigation
- Product cards display images, user ratings (with review counts), prices, domain tags, and age ranges on both Shop and Recommendations pages

## Backend Architecture

**Server Framework**
- Express.js with TypeScript for HTTP server and API routes
- Custom middleware for request logging, JSON parsing, and raw body capture
- Vite middleware integration in development for SSR-like capabilities

**API Design**
- RESTful API endpoints under `/api/` prefix
- Routes for child profiles (`POST /api/child-profiles`, `GET /api/child-profiles/:id`)
- Routes for milestones with filtering (`GET /api/milestones?ageRange=...`)
- Routes for products with category and age-range filtering
- Routes for play boards (personalized recommendation boards)

**Data Layer**
- In-memory storage implementation (`MemStorage`) for development/prototyping
- Interface-based storage abstraction (`IStorage`) allowing easy swap to database
- Seed data included for milestones and products
- Type-safe data models shared between client and server via `@shared/schema`
- Product data in `client/src/data/needsToProducts.json` includes: skuId, title, url, ageMin, ageMax, domains, price, rating, reviewCount, imageUrl

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
- **Parent Accounts**: Stored in localStorage via zustand persist with firstName, lastName, email, password (plaintext MVP limitation)
  - Onboarding Step 1 collects parent account info and first child info together
  - Login page validates credentials against stored parentAccount
  - Settings page allows editing name, email, and password
  - Special access: firstName "Topher" OR email "cpm@mcginnisenterprise.com" grants full access without subscription
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
- **Play Boards**: Aggregated personalized boards combining profiles, milestones, and products

**Current Implementation**
- Development uses in-memory storage with seed data
- Production-ready schema exists for PostgreSQL migration
- Storage interface allows seamless transition from mock to real database
- Parent authentication stored in localStorage (MVP only, not backend-persisted)
- Known MVP limitations: passwords stored plaintext, no multi-device sync, no password reset

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