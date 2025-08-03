import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', unique: true })
  username: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20 })
  role: string; // 'buyer' hoặc 'seller'

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar: string;
}
