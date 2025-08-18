# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Foodee is a full-stack food delivery application built with Next.js (frontend) and NestJS (backend), using PostgreSQL as the database. The application supports two user roles: buyers who can order food and sellers who can manage products and orders.

## Development Commands

### Frontend (Next.js)
```bash
# Development
npm run dev                    # Start development server with Turbopack
npm run build                  # Build for production
npm start                      # Start production server
npm run lint                   # Run ESLint
npm run seed                   # Seed database with sample data
npm run dev:seed              # Seed data and start dev server

# Testing
npm test                       # Run tests (if configured)
```

### Backend (NestJS)
```bash
# Development
cd backend
npm run start:dev             # Start development server with watch mode
npm run start:debug           # Start with debug mode
npm run start:prod            # Start production server
npm run build                 # Build the application
npm run format                # Format code with Prettier
npm run lint                  # Run ESLint with auto-fix

# Database
npm run db:reset              # Reset database (drops and recreates)
npm run db:drop               # Drop all tables
npm run seed                  # Seed database with sample data

# Testing
npm run test                  # Run unit tests
npm run test:watch            # Run tests in watch mode
npm run test:cov              # Run tests with coverage
npm run test:debug            # Run tests in debug mode
npm run test:e2e              # Run end-to-end tests
```

### Project-wide
```bash
# Install dependencies for both frontend and backend
npm install && cd backend && npm install && cd ..

# Start both frontend and backend in development
# Terminal 1:
npm run dev

# Terminal 2:
cd backend && npm run start:dev
```

## Code Architecture

### Frontend Architecture (Next.js 15 + TypeScript)

**Key Technologies:**
- Next.js 15 with App Router
- React 19
- TypeScript 5
- Tailwind CSS 4
- Zod for validation
- React Hook Form
- React Hot Toast
- Auth0 for authentication

**Directory Structure:**
```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes group
│   ├── shop/              # Product listing and details
│   ├── cart/              # Shopping cart
│   ├── orders/            # Order management
│   ├── payment/           # Payment processing
│   └── layout.tsx         # Root layout
├── components/            # Reusable React components
│   ├── ui/               # Basic UI components
│   ├── forms/            # Form components
│   └── layout/           # Layout components (Header, Footer)
├── lib/                  # Utilities and configurations
├── types/               # TypeScript type definitions
├── hooks/               # Custom React hooks
└── constants/           # Application constants
```

**State Management:**
- Server state: React Server Components + fetch
- Client state: React hooks and Context API
- Form state: React Hook Form with Zod validation

### Backend Architecture (NestJS + TypeORM)

**Key Technologies:**
- NestJS 11 framework
- TypeORM with PostgreSQL
- JWT authentication with Passport
- Class-validator for validation
- Bcrypt for password hashing
- VNPay integration for payments
- Cloudinary for image storage

**Directory Structure:**
```
backend/src/
├── account/               # User management
│   ├── user/             # User entity and service
│   ├── buyer/            # Buyer-specific logic
│   └── seller/           # Seller-specific logic
├── auth/                 # Authentication & authorization
│   ├── guards/           # JWT and role guards
│   └── strategies/       # Passport strategies
├── product/              # Product management
├── order/                # Order processing
├── payment/              # VNPay payment integration
├── review/               # Product reviews
├── favorite/             # User favorites
├── media/                # File/image handling
└── common/               # Shared utilities
```

**Key Design Patterns:**
- **Modular Architecture**: Each feature is organized as a NestJS module
- **Repository Pattern**: TypeORM repositories for data access
- **DTO Pattern**: Data Transfer Objects for API requests/responses
- **Guard-based Authorization**: Role-based access control using NestJS guards
- **Entity Relationships**: Proper foreign key relationships with TypeORM decorators

### Database Schema

**Core Entities:**
- **User**: Base user information with role (BUYER/SELLER)
- **Buyer**: Extended buyer profile with orders and favorites
- **Seller**: Extended seller profile with products and shop details
- **Product**: Product information with images and category
- **Order**: Orders with items and payment status
- **Review**: Product reviews with ratings
- **Category**: Product categorization

**Key Relationships:**
- User 1:1 Buyer/Seller (role-based)
- Seller 1:N Products
- Product 1:N Reviews, Images, OrderItems
- Buyer 1:N Orders, Reviews, Favorites

## Authentication & Security

**Authentication Flow:**
1. JWT-based authentication with HTTP-only cookies
2. Role-based authorization (BUYER/SELLER)
3. Password hashing with bcrypt (10 rounds)
4. CORS configuration for cross-origin requests
5. Rate limiting and request validation

**Security Features:**
- HTTP-only cookies for JWT tokens
- CSRF protection with SameSite cookies
- Input validation with class-validator
- SQL injection protection via TypeORM
- Password strength requirements

## API Integration

**Frontend ↔ Backend Communication:**
- RESTful API endpoints
- Cookie-based authentication
- JSON request/response format
- Error handling with proper HTTP status codes
- File upload support for product images

**Key API Endpoints:**
- `/auth/*` - Authentication (login, register, profile)
- `/products/*` - Product management
- `/orders/*` - Order processing
- `/payment/*` - VNPay integration
- `/reviews/*` - Product reviews

## Payment Integration

**VNPay Integration:**
- Sandbox mode for development
- Secure payment processing
- Order status tracking
- Payment confirmation webhooks

## Development Workflow

**Getting Started:**
1. Clone repository and install dependencies
2. Set up PostgreSQL database
3. Configure environment variables (`.env` files)
4. Run database migrations/seeding
5. Start backend and frontend servers

**Environment Variables:**
- Database connection (PostgreSQL)
- JWT secret keys
- VNPay credentials
- Cloudinary configuration
- API URLs and ports

**Code Quality:**
- TypeScript for type safety
- ESLint + Prettier for code formatting
- Zod for runtime validation
- Comprehensive error handling
- Modular component architecture

## Testing Strategy

**Backend Testing:**
- Unit tests with Jest
- Integration tests for API endpoints
- Database testing with test fixtures
- Mock services for external dependencies

**Frontend Testing:**
- Component testing (when configured)
- E2E testing capabilities
- Form validation testing

## Deployment Notes

**Production Considerations:**
- Docker containerization support
- Environment-specific configurations
- Database migrations
- Static file serving
- SSL/HTTPS configuration
- Performance monitoring

**Build Process:**
- Next.js optimized builds
- NestJS compilation
- Asset optimization
- Database connection pooling

## Common Development Tasks

**Adding New Features:**
1. Backend: Create module → entity → service → controller → DTO
2. Frontend: Create components → hooks → API integration → routing
3. Database: Update entities → run migrations → seed data

**Database Changes:**
1. Modify entity definitions
2. Generate/run TypeORM migrations
3. Update seed data if needed
4. Test with fresh database

**API Development:**
1. Define DTOs for request/response
2. Implement service logic
3. Add controller endpoints
4. Apply authentication guards
5. Test with Postman or frontend

This architecture supports a scalable, maintainable food delivery platform with clear separation of concerns and modern development practices.
