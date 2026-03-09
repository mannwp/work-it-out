import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Workout } from './workout.entity';
import { Exercise } from './exercise.entity';

@Entity()
export class WorkoutExercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Workout, (workout) => workout.workoutExercise)
  workout: Workout;

  @ManyToOne(() => Exercise, (ex) => ex.workoutExercise)
  exercise: Exercise;

  @Column()
  suggestedSetsMin: number;

  @Column()
  suggestedSetsMax: number;

  @Column()
  suggestedRepsMin: number;

  @Column()
  suggestedRepsMax: number;

  @Column()
  restTime: number;

  @Column()
  order: number;
}
