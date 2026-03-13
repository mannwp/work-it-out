import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserWorkout } from './user-workout.entity';
import { Workout } from './workout.entity';
import { FavoriteExercise } from './favorite-exercise.entity';
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

  @Column({ type: 'date', nullable: true })
  dob?: Date;

  @Column({ nullable: true, type: 'float' })
  height?: number;

  @Column({ nullable: true })
  weight?: number;

  @Column({ nullable: true })
  profilePic?: string;

  @Column({ nullable: true })
  profilePicPublicId?: string;

  @Column({ nullable: true })
  profilePicBlurHash?: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ default: false })
  isEmailVerified?: boolean;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.ATHLETE })
  role?: UserRole;

  @Column({ nullable: true, unique: true })
  googleId?: string;

  @OneToMany(() => UserWorkout, (uw) => uw.user)
  userWorkouts: UserWorkout[];

  @OneToMany(() => Workout, (workout) => workout.createdBy)
  workouts: Workout[];

  @OneToMany(() => FavoriteExercise, (fav) => fav.user)
  favoriteExercises: FavoriteExercise[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
