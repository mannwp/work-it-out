import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { typeOrmConfig } from '../config/typeorm.config';
// import { User } from '../entities/user.entity';
// import { WorkoutLog } from '../entities/workout-log.entity';
// import { Workout } from '../entities/workout.entity';
// import { Exercise } from '../entities/exercise.entity';
// import { WorkoutExercise } from '../entities/workout-exercise.entity';
// import { FavoriteExercise } from '../entities/favorite-exercise.entity';
// import { UserWorkout } from '../entities/user-workout.entity';
// import { ExerciseLog } from '../entities/exercise-log.entity';
// import { SetLog } from '../entities/set-log.entity';

config();

const configService = new ConfigService();
const options = typeOrmConfig(configService) as DataSourceOptions;

export default new DataSource({
  ...options,
  entities: [
    // WorkoutLog,
    // User,
    // Workout,
    // Exercise,
    // WorkoutExercise,
    // FavoriteExercise,
    // UserWorkout,
    // ExerciseLog,
    // SetLog,
  ],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false, // Ensure synchronize is false for migrations
});
