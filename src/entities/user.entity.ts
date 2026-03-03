import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
export enum UserRole {
  ADMIN = 'admin',
  ATHLETE = 'athlete',
}
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  name?: string;

  @CreateDateColumn({ type: 'timestamptz', nullable: true })
  dob?: Date;

  @Column({ nullable: true })
  height?: number;

  @Column({ nullable: true })
  weight?: number;

  @Column({ nullable: true })
  profile_pic?: string;

  @Column({ nullable: true })
  password: string;

  @Column({ default: false })
  is_email_verified?: boolean;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.ATHLETE })
  role?: UserRole;
}
