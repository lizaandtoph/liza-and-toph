# Overview

"Liza & Toph" is a React-based web application designed to support parents in tracking their children's developmental milestones and discovering age-appropriate products. It provides personalized "Play Boards" tailored to each child's age, interests, and developmental stage, along with curated recommendations for products, toys, and books. The platform allows parents to manage multiple child profiles, each with unique personalization. The business vision is to empower parents with resources and insights for their children's development, offering a valuable and personalized experience in a growing market for educational and developmental products.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built with React 18+ and TypeScript, utilizing Vite for fast development and HMR. React Router DOM handles client-side routing. UI components are developed using `shadcn/ui` with Radix UI primitives, styled with Tailwind CSS and custom design tokens for accessibility and theming. Custom fonts (Sentient and Poppins) are used. State management employs Zustand with localStorage persistence for global and per-child data, and TanStack Query for server state. Authentication uses passwordless magic links, managed by a `useAuth` hook. Forms are handled with React Hook Form and Zod for validation. The application supports multiple child profiles, allowing parents to manage and view personalized Play Boards for each child.

## Backend Architecture

The backend is an Express.js application with TypeScript, providing a RESTful API under the `/api/` prefix. It includes public endpoints for professionals, products, and milestones, as well as admin endpoints for managing these entities. Data models are type-safe and shared between client and server via `@shared/schema`. The system uses an interface-based storage abstraction, currently supporting in-memory storage for development and PostgreSQL for production data.

## Data Storage

The application uses Drizzle ORM with PostgreSQL, configured via `@neondatabase/serverless`. Data models include Parent Accounts (authenticated via magic links), Child Profiles (name, birthday, age, developmental preferences, questionnaire answers), Saved Items (favorited brands, professionals, products), Milestones (developmental categories), Products (toy/book recommendations), and Professionals (directory with search and filter). Session management for authentication uses `connect-pg-simple`.

# External Dependencies

## UI & Styling

-   **Radix UI**: Accessible primitive components.
-   **Tailwind CSS**: Utility-first styling.
-   **Custom Fonts**: Sentient (.otf) and Poppins (Google Fonts).
-   **class-variance-authority, clsx**: Conditional className composition.

## Data & Forms

-   **TanStack Query**: Data fetching and caching.
-   **React Hook Form, @hookform/resolvers**: Form management.
-   **Zod**: Schema validation and type inference.
-   **drizzle-zod**: Automatic Zod schema generation.

## Database & ORM

-   **Drizzle ORM**: Type-safe database queries.
-   **@neondatabase/serverless**: PostgreSQL connection pooling.
-   **connect-pg-simple**: PostgreSQL session store.

## Utilities

-   **date-fns**: Date manipulation.
-   **nanoid**: Unique ID generation.
-   **lucide-react**: Icon components.
-   **cmdk**: Command palette functionality.
-   **embla-carousel-react**: Carousel components.
-   **Resend**: Email integration for magic links.