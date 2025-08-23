# Foodee Project Overview - AI Model Reference Guide

## 📋 Project Description

**Foodee** is a full-stack food delivery and marketplace application that connects food sellers with buyers. The platform allows sellers to list their food products and buyers to browse, order, and pay for food items online.

## 🏗 Architecture Overview

This is a **full-stack application** with:
- **Frontend**: Next.js 15.4.4 with React 19, TypeScript, TailwindCSS
- **Backend**: NestJS with TypeORM, PostgreSQL
- **Authentication**: JWT-based with role-based access control
- **Payment**: VNPay integration for Vietnamese market
- **File Storage**: Cloudinary for media management

## 📁 Project Structure

```
/Users/tranthihieu/Documents/Foodee/
├── frontend/ (root directory)
│   ├── src/
│   │   ├── app/                 # Next.js app router pages
│   │   ├── components/          # Reusable React components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Utility functions
│   │   ├── types/              # TypeScript type definitions
│   │   └── constants/          # Application constants
│   └── package.json            # Frontend dependencies
└── backend/
    ├── src/                    # NestJS source code
    │   ├── auth/              # Authentication & authorization
    │   ├── account/           # User account management
    │   ├── product/           # Product management
    │   ├── order/             # Order processing
    │   ├── payment/           # Payment processing (VNPay)
    │   ├── review/            # Product reviews
    │   ├── cart/              # Shopping cart
    │   ├── favorite/          # User favorites
    │   ├── chat/              # Real-time messaging
    │   ├── blog/              # Blog posts
    │   └── media/             # File upload & management
    └── package.json           # Backend dependencies
```

## 🎯 Core Business Logic

### User Roles
1. **BUYER**: Can browse products, add to cart, place orders, write reviews, manage favorites
2. **SELLER**: Can create/manage products, handle orders, view analytics, chat with customers

### Key Features
- **Product Management**: Create, read, update, delete products with categories
- **Shopping Cart**: Add/remove items, quantity management
- **Order Processing**: Place orders, payment integration, order tracking
- **Review System**: Rate and review products (buyers only)
- **Real-time Chat**: Communication between buyers and sellers
- **Payment Integration**: VNPay for Vietnamese market
- **Media Management**: Cloudinary for product images
- **Blog System**: Content management for food-related articles

## 🛠 Technology Stack

### Frontend Technologies
- **Framework**: Next.js 15.4.4 (App Router)
- **React**: 19.1.0
- **TypeScript**: Latest
- **Styling**: TailwindCSS 4
- **UI Components**: Radix UI primitives
- **Form Handling**: React Hook Form + Zod validation
- **State Management**: React Context + Custom hooks
- **Animations**: Motion (Framer Motion)
- **Icons**: Lucide React

### Backend Technologies
- **Framework**: NestJS (Node.js framework)
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport
- **Payment**: VNPay integration
- **File Storage**: Cloudinary
- **Real-time**: WebSockets (Socket.io)
- **Validation**: class-validator, class-transformer
- **Caching**: Redis (ioredis)

### Development Tools
- **Language**: TypeScript throughout
- **Linting**: ESLint
- **Testing**: Jest (backend), potential React Testing Library (frontend)
- **Package Manager**: npm

## 🔑 Key Components & Services

### Frontend Key Components
- **`Header`**: Navigation with user menu, cart, favorites
- **`ProductCard`**: Product display with image, price, rating
- **`ProductDetail`**: Detailed product view with reviews
- **`ProductGrid`**: Product listing with filtering
- **`SignIn/SignUp`**: Authentication forms
- **`UserMenu`**: User profile and account management
- **`OrderSummary`**: Order review before payment

### Backend Key Services
- **`AuthService`**: JWT token management, login/logout
- **`ProductService`**: CRUD operations for products
- **`OrderService`**: Order creation, status management
- **`PaymentService`**: VNPay integration
- **`ReviewService`**: Product rating and review management
- **`ChatService`**: Real-time messaging between users

## 🔐 Authentication & Authorization

### Authentication Flow
1. User registers/logs in with username/password
2. Server generates JWT token (1 hour expiry)
3. Token stored in HTTP-only cookies
4. Protected routes check JWT validity
5. Role-based access control (BUYER/SELLER)

### Guards & Decorators
- **`JwtAuthGuard`**: Validates JWT tokens
- **`RolesGuard`**: Enforces role-based access
- **`@Roles()`**: Decorator to specify required roles

## 💳 Payment Integration

### VNPay Flow
1. User completes order
2. Payment request sent to VNPay
3. User redirected to VNPay payment page
4. VNPay processes payment
5. Callback to `/payment/vnpay-return`
6. Order status updated based on payment result

## 📊 Database Schema Overview

### Core Entities
- **User**: Base user information (id, name, username, email, role)
- **Buyer**: Extends User for customers
- **Seller**: Extends User for vendors
- **Product**: Food items with pricing, stock, categories
- **Order**: Customer orders with items and status
- **OrderItem**: Individual products within an order
- **Review**: Product ratings and comments
- **Category**: Product categorization
- **Address**: User delivery addresses

### Key Relationships
- User → Buyer/Seller (1:1)
- Seller → Products (1:many)
- Product → Reviews (1:many)
- Buyer → Orders (1:many)
- Order → OrderItems (1:many)

## 🎨 UI/UX Patterns

### Design System
- **Colors**: TailwindCSS color palette
- **Typography**: System fonts with responsive sizing
- **Components**: Consistent spacing, borders, shadows
- **Layout**: Responsive grid system
- **Navigation**: Header with dropdown menus

### User Experience
- **Responsive Design**: Mobile-first approach
- **Loading States**: Skeleton screens and spinners
- **Error Handling**: Toast notifications
- **Form Validation**: Real-time validation with Zod
- **Accessibility**: ARIA labels, keyboard navigation

## 🚀 Development Workflow

### Frontend Development
```bash
cd /Users/tranthihieu/Documents/Foodee
npm run dev              # Start development server
npm run build           # Build for production
npm run lint            # Run ESLint
```

### Backend Development
```bash
cd /Users/tranthihieu/Documents/Foodee/backend
npm run start:dev       # Start with hot reload
npm run build          # Build TypeScript
npm run db:seed        # Seed database
```

## 🔧 Configuration Files

### Environment Variables
- **Frontend**: Next.js environment variables
- **Backend**: Database, JWT, VNPay, Cloudinary credentials

### Key Config Files
- **`next.config.ts`**: Next.js configuration
- **`tailwind.config.js`**: TailwindCSS setup
- **`tsconfig.json`**: TypeScript configuration
- **`package.json`**: Dependencies and scripts

## 🧪 Testing Strategy

### Testing Approach
- **Unit Tests**: Individual functions and methods
- **Integration Tests**: API endpoints and database operations
- **E2E Tests**: Complete user workflows
- **Component Tests**: React component functionality

## 📱 API Integration

### Frontend-Backend Communication
- **Base URL**: Configuration for API endpoints
- **Error Handling**: Centralized error management
- **Authentication**: Automatic token attachment
- **Data Fetching**: Custom hooks for API calls

### Key API Patterns
- RESTful endpoints for CRUD operations
- WebSocket connections for real-time features
- File upload endpoints for media
- Payment callback handling

## 🚨 Common Requirements & Patterns

### When Working with This Project:

1. **Authentication Required**: Most features require user authentication
2. **Role-Based Access**: Always check user roles (BUYER/SELLER)
3. **Form Validation**: Use Zod schemas for type-safe validation
4. **Error Handling**: Implement proper error boundaries and toast notifications
5. **Responsive Design**: Ensure mobile compatibility
6. **TypeScript**: Maintain type safety throughout
7. **Vietnamese Language**: UI supports Vietnamese text
8. **Real-time Updates**: Consider WebSocket connections for live features

### Code Style & Conventions
- **Naming**: PascalCase for components, camelCase for functions
- **File Structure**: Group related files in feature folders
- **Imports**: Absolute imports from `src/`
- **Types**: Define interfaces in `types/` directory
- **Constants**: Store in `constants/` directory

## 🔍 Debugging & Troubleshooting

### Common Issues
- **CORS**: Backend CORS configuration for frontend
- **Authentication**: JWT token expiry and refresh
- **Database**: Connection and migration issues
- **File Upload**: Cloudinary configuration
- **Payment**: VNPay sandbox vs production environment

### Logging & Monitoring
- **Backend**: NestJS built-in logging
- **Frontend**: Console logging and error boundaries
- **Database**: TypeORM query logging
- **API**: Request/response logging

---

## 📋 Quick Reference for AI Models

### When asked to:
1. **Add new features**: Consider authentication, role permissions, database schema
2. **Fix bugs**: Check TypeScript types, API endpoints, database relations
3. **Improve UI**: Follow TailwindCSS patterns, responsive design
4. **Add API endpoints**: Use NestJS decorators, DTOs, proper error handling
5. **Update database**: Create migrations, update entities
6. **Handle payments**: Work with VNPay integration patterns
7. **Implement real-time**: Use WebSocket patterns from chat module

### Always Remember:
- This is a Vietnamese food delivery platform
- Users can be either BUYERS or SELLERS
- Payment is handled through VNPay
- All data should be properly validated
- TypeScript types must be maintained
- Mobile responsiveness is crucial
- Real-time features use WebSockets

This guide should help AI models understand the project context and make appropriate recommendations when working with the Foodee codebase.