/*
Ví dụ minh họa cách TypeORM quản lý relationship

Giả sử có:
- Seller ID = 1 (Shop ABC)
- Tạo 3 products với sellerId = 1
*/

// 1. Tạo products
const products = [
  { name: "Bánh mì", sellerId: 1, price: 25000 },
  { name: "Phở", sellerId: 1, price: 45000 },
  { name: "Cơm tấm", sellerId: 1, price: 35000 }
];

// 2. Database state sau khi tạo:

// Bảng SELLER (KHÔNG THAY ĐỔI)
/*
| id | userId | name     | shopName | shopAddress |
|----|--------|----------|----------|-------------|
| 1  | 10     | Shop ABC | null     | null        |
*/

// Bảng PRODUCT (CÓ THÊM 3 RECORDS)  
/*
| id  | sellerId | name     | price |
|-----|----------|----------|-------|
| 101 | 1        | Bánh mì  | 25000 |
| 102 | 1        | Phở      | 45000 |
| 103 | 1        | Cơm tấm  | 35000 |
*/

// 3. Khi query seller với products:
const seller = await sellerRepository.findOne({
  where: { id: 1 },
  relations: ['products']
});

// Kết quả:
/*
{
  id: 1,
  userId: 10,
  name: "Shop ABC",
  products: [
    { id: 101, name: "Bánh mì", price: 25000, sellerId: 1 },
    { id: 102, name: "Phở", price: 45000, sellerId: 1 },
    { id: 103, name: "Cơm tấm", price: 35000, sellerId: 1 }
  ]
}
*/

// 4. Cách TypeORM thực hiện JOIN:
/*
SQL được tạo tự động:
SELECT 
  s.id, s.userId, s.name, s.shopName,
  p.id as product_id, p.name as product_name, p.price, p.sellerId
FROM seller s
LEFT JOIN product p ON s.id = p.sellerId  
WHERE s.id = 1
*/
