import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { SellerModule } from './seller/seller.module';

@Module({
  imports: [UserModule, SellerModule],
  exports: [UserModule, SellerModule],
})
export class AccountModule {}
