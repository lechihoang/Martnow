import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @Column({ type: 'varchar', length: 255 })
  addressLine: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 100 })
  district: string;

  @Column({ type: 'varchar', length: 100 })
  ward: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;
}
