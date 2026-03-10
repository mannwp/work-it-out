import { Module } from '@nestjs/common';
import { WorkoutLogsService } from './workout-logs.service';
import { WorkoutLogsController } from './workout-logs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Workout } from 'src/entities/workout.entity';
import { WorkoutLog } from 'src/entities/workout-log.entity';
import { ExerciseLog } from 'src/entities/exercise-log.entity';
import { SetLog } from 'src/entities/set-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Workout, WorkoutLog, ExerciseLog, SetLog]),
  ],
  controllers: [WorkoutLogsController],
  providers: [WorkoutLogsService],
})
export class WorkoutLogsModule {}
