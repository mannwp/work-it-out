import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ExerciseLog } from './exercise-log.entity';
import { Workout } from './workout.entity';

@Entity()
export class WorkoutLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  date: string;

  @ManyToOne(() => User)
  @Index()
  user: User;

  @ManyToOne(() => Workout)
  workout: Workout;

  @OneToMany(() => ExerciseLog, (el) => el.workoutLog)
  exerciseLog: ExerciseLog[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', select: false })
  deletedAt?: Date;
}
