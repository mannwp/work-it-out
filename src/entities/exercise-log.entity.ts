import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SetLog } from './set-log.entity';
import { WorkoutLog } from './workout-log.entity';
import { Exercise } from './exercise.entity';

@Entity()
export class ExerciseLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Exercise)
  exercise: Exercise;

  @ManyToOne(() => WorkoutLog, (wl) => wl.exerciseLog)
  workoutLog: WorkoutLog;

  @OneToMany(() => SetLog, (sl) => sl.exerciseLog)
  sets: SetLog[];
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamptz', select: false })
  deletedAt?: Date;
}
