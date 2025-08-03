
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';

@Entity()
export class Seller {
  @PrimaryGeneratedColumn()
  id: number; // id duy nhất của bảng Seller

  @Column({ unique: true })
  userId: number; // liên kết với id của bảng User, duy nhất

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  shopName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  shopAddress: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  shopPhone: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => Product, (product) => product.seller)
  products: Product[];
}
