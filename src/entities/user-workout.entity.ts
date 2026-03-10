import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Workout } from './workout.entity';
import { DayOfWeek } from '../common/enums/day-of-week.enum';

@Entity()
export class UserWorkout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.userWorkouts)
  @Index()
  user: User;

  @ManyToOne(() => Workout)
  workout: Workout;

  @Column({
    type: 'enum',
    enum: DayOfWeek,
  })
  dayOfWeek: DayOfWeek;
}
