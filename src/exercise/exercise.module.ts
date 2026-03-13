import { Module } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { ExerciseController } from './exercise.controller';
import { Exercise } from 'src/entities/exercise.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutExercise } from 'src/entities/workout-exercise.entity';
import { User } from 'src/entities/user.entity';
import { FavoriteExercise } from 'src/entities/favorite-exercise.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Exercise,
      WorkoutExercise,
      User,
      FavoriteExercise,
    ]),
  ],
  controllers: [ExerciseController],
  providers: [ExerciseService],
})
export class ExerciseModule {}
