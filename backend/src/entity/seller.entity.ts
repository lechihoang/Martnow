import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';

@Entity()
export class Seller {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({ type: 'varchar', length: 255 })
  shopName: string;

  @Column({ type: 'varchar', length: 255 })
  shopAddress: string;

  @Column({ type: 'varchar', length: 20 })
  shopPhone: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => Product, (product) => product.seller)
  products: Product[];
}
