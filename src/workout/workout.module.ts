import { Module } from '@nestjs/common';
import { WorkoutService } from './workout.service';
import { WorkoutController } from './workout.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workout } from 'src/entities/workout.entity';
import { WorkoutExercise } from 'src/entities/workout-exercise.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Workout, WorkoutExercise])],
  controllers: [WorkoutController],
  providers: [WorkoutService],
})
export class WorkoutModule {}
