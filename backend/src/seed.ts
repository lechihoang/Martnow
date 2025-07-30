

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entity/product.entity';
import { Category } from './entity/category.entity';
import { Seller } from './entity/seller.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const categoryRepo = app.get(getRepositoryToken(Category));
  const sellerRepo = app.get(getRepositoryToken(Seller));
  const productRepo = app.get(getRepositoryToken(Product));

  // Seed categories
  const categories = await categoryRepo.save([
    { name: 'Bánh mì', description: 'Các loại bánh mì Việt Nam' },
    { name: 'Đồ uống', description: 'Nước giải khát, cà phê, trà' },
    { name: 'Đồ ăn vặt', description: 'Snack, bánh kẹo, v.v.' },
  ]);

  // Seed sellers (giả sử userId 1 và 2 đã tồn tại)
  const sellers = await sellerRepo.save([
    { user: { id: 1 }, shopName: 'Tiệm Bánh A', shopAddress: '123 Lê Lợi', shopPhone: '0901234567', description: 'Chuyên bánh mì' },
    { user: { id: 2 }, shopName: 'Quán Nước B', shopAddress: '456 Trần Hưng Đạo', shopPhone: '0902345678', description: 'Đồ uống mát lạnh' },
  ]);

  // Seed 10 products, phân bổ category và seller
  const products = [
    { name: 'Bánh mì thịt', price: 20000, description: 'Bánh mì kẹp thịt truyền thống', category: categories[0], seller: sellers[0], imageUrl: '', isAvailable: true, stock: 50, discount: 10 },
    { name: 'Bánh mì chả', price: 18000, description: 'Bánh mì chả lụa', category: categories[0], seller: sellers[0], imageUrl: '', isAvailable: true, stock: 40, discount: 5 },
    { name: 'Bánh mì trứng', price: 15000, description: 'Bánh mì trứng ốp la', category: categories[0], seller: sellers[0], imageUrl: '', isAvailable: true, stock: 30, discount: 0 },
    { name: 'Trà sữa trân châu', price: 30000, description: 'Trà sữa truyền thống', category: categories[1], seller: sellers[1], imageUrl: '', isAvailable: true, stock: 60, discount: 15 },
    { name: 'Cà phê sữa đá', price: 25000, description: 'Cà phê sữa đá Việt Nam', category: categories[1], seller: sellers[1], imageUrl: '', isAvailable: true, stock: 70, discount: 10 },
    { name: 'Nước cam vắt', price: 22000, description: 'Nước cam tươi nguyên chất', category: categories[1], seller: sellers[1], imageUrl: '', isAvailable: true, stock: 35, discount: 0 },
    { name: 'Snack rong biển', price: 12000, description: 'Snack rong biển giòn', category: categories[2], seller: sellers[0], imageUrl: '', isAvailable: true, stock: 80, discount: 5 },
    { name: 'Bánh quy bơ', price: 15000, description: 'Bánh quy bơ thơm ngon', category: categories[2], seller: sellers[0], imageUrl: '', isAvailable: true, stock: 90, discount: 0 },
    { name: 'Kẹo dẻo trái cây', price: 10000, description: 'Kẹo dẻo nhiều vị', category: categories[2], seller: sellers[1], imageUrl: '', isAvailable: true, stock: 100, discount: 2 },
    { name: 'Bim bim khoai tây', price: 13000, description: 'Bim bim vị khoai tây', category: categories[2], seller: sellers[1], imageUrl: '', isAvailable: true, stock: 60, discount: 3 },
  ];

  await productRepo.save(products);

  await app.close();
}

bootstrap();