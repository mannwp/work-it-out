import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Exercise } from './exercise.entity';

@Entity()
@Unique(['user', 'exercise'])
export class FavoriteExercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (u) => u.favoriteExercises)
  user: User;

  @ManyToOne(() => Exercise, (ex) => ex.favoriteExercise)
  exercise: Exercise;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
