import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Repository } from 'typeorm';
import { User } from './user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

async function updatePasswords() {
  console.log('🔐 Updating user passwords...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

  try {
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Update buyer user
    const buyerUser = await userRepository.findOne({ where: { email: 'buyer@foodee.com' } });
    if (buyerUser) {
      buyerUser.password = hashedPassword;
      await userRepository.save(buyerUser);
      console.log('✅ Updated buyer password');
    }

    // Update seller user  
    const sellerUser = await userRepository.findOne({ where: { email: 'seller@foodee.com' } });
    if (sellerUser) {
      sellerUser.password = hashedPassword;
      await userRepository.save(sellerUser);
      console.log('✅ Updated seller password');
    }

    console.log('🎉 Password update completed!');
  } catch (error) {
    console.error('❌ Error updating passwords:', error);
  } finally {
    await app.close();
  }
}

updatePasswords();
