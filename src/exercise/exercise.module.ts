import { Module } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { ExerciseController } from './exercise.controller';
import { Exercise } from 'src/entities/exercise.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutExercise } from 'src/entities/workout-exercise.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Exercise, WorkoutExercise])],
  controllers: [ExerciseController],
  providers: [ExerciseService],
})
export class ExerciseModule {}
