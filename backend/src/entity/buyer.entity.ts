import { Entity, PrimaryColumn, OneToOne, JoinColumn, Column } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Buyer {
  @PrimaryColumn()
  id: number; // user id

  @OneToOne(() => User)
  @JoinColumn({ name: 'id' })
  user: User;

  @Column({ type: 'varchar', length: 100 })
  name: string;
}
