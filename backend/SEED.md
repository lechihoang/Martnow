# 🌱 Database Seeding Guide

## Overview
This project uses a single consolidated seed file (`src/seed.ts`) to initialize the database with sample data for development and testing.

## What's Seeded

### 1. 👤 Users (4 users)
- **buyer1** & **buyer2**: Regular buyers
- **seller1** & **seller2**: Shop owners
- All users have password: `password123`

### 2. 📁 Categories (5 categories)
- Đồ ăn nhanh (Fast food)
- Đồ uống (Beverages) 
- Món Việt (Vietnamese food)
- Tráng miệng (Desserts)
- Món chay (Vegetarian)

### 3. 🛍️ Buyers & Sellers
- Buyers linked to users 1 & 4
- Sellers linked to users 2 & 3 with shop details

### 4. 🍔 Products (6 products)
- 3 products from "Quán Cơm Tấm Sài Gòn" (seller1)
- 3 products from "Trà Sữa House" (seller2)

### 5. 📈 Seller Stats (Initial - Zero Revenue)
Both sellers start with:
```javascript
{
  totalOrders: 0,
  totalRevenue: 0,
  totalProducts: 3, // Count of their products
  pendingOrders: 0,
  completedOrders: 0,
  averageRating: 0,
  totalReviews: 0
}
```

## What's NOT Seeded (Intentionally)

❌ **Orders** - Users will create these through the app  
❌ **Order Items** - Generated when orders are created  
❌ **Reviews** - Users will write reviews organically  
❌ **Favorites** - Users will add favorites as they browse  

## Running the Seed

### Option 1: Using npm script (Recommended)
```bash
cd backend
npm run seed
```

### Option 2: Direct execution
```bash
cd backend  
npx ts-node -r tsconfig-paths/register src/seed.ts
```

## Reset Database + Seed
```bash
cd backend
npm run db:reset  # Drops all tables and recreates schema
npm run seed      # Populate with sample data
```

## Environment Requirements

Make sure your `.env` file contains:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=foodee_db
```

## Why Initial Stats Are Zero?

🎯 **Realistic Simulation**: New sellers start with no sales history  
📊 **Real-time Updates**: Stats update as users interact with the app  
🔄 **Natural Growth**: Watch analytics grow organically from user activity  
✅ **Testing**: Perfect for testing analytics features from ground zero  

## Post-Seed Actions

After seeding, you can:

1. **Login as buyers**:
   - buyer1@example.com / password123
   - buyer2@example.com / password123

2. **Login as sellers**:  
   - seller1@example.com / password123
   - seller2@example.com / password123

3. **Start testing**:
   - Browse products as buyer
   - Create orders to see stats update
   - Add reviews and favorites
   - Monitor seller analytics in real-time

## Troubleshooting

### Error: "relation does not exist"
Your database schema might not be created. Run:
```bash
npm run db:reset
npm run seed
```

### Error: "duplicate key value"  
The seed script has conflict resolution. If you see this, it's normal - existing data is preserved.

### Error: "connection refused"
Check your database connection and `.env` configuration.

## Files Structure

```
backend/src/
├── seed.ts           # ✅ Single consolidated seed file
├── seed-simple.ts    # ❌ Removed (was duplicate)  
└── database-reset.ts # Helper to reset DB schema
```

---

## 🎉 Happy Seeding!

Your foodee database is now ready with:
- ✅ Sample users and shops
- ✅ Product catalog
- ✅ Clean slate for orders/reviews  
- ✅ Zero-revenue seller stats (ready to grow!)
