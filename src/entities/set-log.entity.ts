import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ExerciseLog } from './exercise-log.entity';

@Entity()
export class SetLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  set: number;

  @Column()
  reps: number;

  @Column({ nullable: true })
  weight?: number;

  @ManyToOne(() => ExerciseLog, (el) => el.sets)
  exerciseLog: ExerciseLog;
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamptz', select: false })
  deletedAt?: Date;
}
