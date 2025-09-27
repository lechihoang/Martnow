# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Foodee is a full-stack food marketplace application with NestJS backend and Next.js frontend. The application supports buyer/seller roles, product management, order processing, VNPay payment integration, and blog functionality.

## Development Commands

### Frontend (Next.js)
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Backend (NestJS)
- `cd backend && npm run start:dev` - Start backend development server (port 3001)
- `cd backend && npm run build` - Build backend
- `cd backend && npm run start:prod` - Start production backend
- `cd backend && npm run lint` - Run ESLint on backend
- `cd backend && npm run test` - Run unit tests
- `cd backend && npm run test:e2e` - Run E2E tests
- `cd backend && npm run test:cov` - Run tests with coverage
- `cd backend && npm run seed` - Seed database with sample data

## Architecture Overview

### Backend (NestJS + PostgreSQL)
- **Authentication**: Supabase Auth integration with custom guards
- **Database**: PostgreSQL with TypeORM, entities auto-synchronized in development
- **Modules**: Modular structure with Account, Product, Order, Payment, Review, Favorite, Media, Blog modules
- **Payment**: VNPay integration for Vietnamese market
- **Authorization**: Role-based access control (Buyer/Seller roles)

### Frontend (Next.js 15 + React 19)
- **UI**: Tailwind CSS with Radix UI components
- **State Management**: Zustand with persistence for cart and favorites
- **Authentication**: Supabase client-side integration
- **API Layer**: Centralized API client with error handling and auth headers

### Key Integrations
- **Supabase**: Authentication and session management
- **Cloudinary**: Media file uploads (avatars, product images)
- **VNPay**: Payment processing for Vietnamese market

## Database Entities

Core entities include User, Buyer, Seller, Product, Category, Order, OrderItem, Review, Favorite, Blog, BlogComment, BlogVote, and SellerStats. The system uses inheritance with User as base class for Buyer and Seller entities.

## API Structure

- Backend runs on port 3001
- Frontend runs on port 3000
- API endpoints follow RESTful conventions
- Authentication via Bearer tokens in Authorization headers
- Error responses include status and detailed error messages

## State Management

### Frontend State (Zustand)
- **Cart**: Local storage with persistent cart items
- **Favorites**: Hybrid local/backend sync for favorites
- **Authentication**: Managed through Supabase auth context

### Backend State
- **Sessions**: Stateless JWT-based authentication
- **Database**: TypeORM with PostgreSQL connection pooling

## Development Workflow

1. Run both frontend and backend in parallel for full development
2. Backend seeds available via `npm run seed` in backend directory
3. Database auto-synchronizes in development mode
4. CORS configured for localhost:3000 and localhost:3001

## Authentication Flow

1. Users authenticate via Supabase Auth
2. Frontend stores session and provides auth headers
3. Backend validates tokens using SupabaseAuthGuard
4. Role-based access enforced via RoleGuard decorators

## File Upload Pattern

Media uploads use Cloudinary integration through the MediaModule. Files are uploaded via FormData to `/media/upload` endpoint with authentication required.

## Testing

Backend includes Jest configuration for unit and E2E tests. Test files follow `.spec.ts` naming convention and are located alongside source files.