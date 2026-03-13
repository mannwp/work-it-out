import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateWorkoutLogDto,
  ExerciseLogDto,
  SetDto,
} from './dto/workout-log.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { Workout } from 'src/entities/workout.entity';
import { WorkoutLog } from 'src/entities/workout-log.entity';
import { ExerciseLog } from 'src/entities/exercise-log.entity';
import { SetLog } from 'src/entities/set-log.entity';
import { Exercise } from 'src/entities/exercise.entity';
import { differenceInCalendarDays } from 'date-fns';

@Injectable()
export class WorkoutLogsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Workout)
    private workoutRepository: Repository<Workout>,
    @InjectRepository(WorkoutLog)
    private workoutLogRepository: Repository<WorkoutLog>,
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
    @InjectRepository(ExerciseLog)
    private exerciseLogRepository: Repository<ExerciseLog>,
    @InjectRepository(SetLog)
    private setLogRepository: Repository<SetLog>,

    private dataSource: DataSource,
  ) {}
  async create(userId: string, data: CreateWorkoutLogDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const workout = await this.workoutRepository.findOne({
      where: { id: data.workoutId },
    });
    if (!workout) {
      throw new NotFoundException('Workout not found');
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const workoutLog = queryRunner.manager.create(WorkoutLog, {
        user: { id: userId },
        workout: { id: data.workoutId },
        date: data.date,
      });
      await queryRunner.manager.save(workoutLog);
      for (const exercise of data.exercises) {
        const exerciseExists = await this.exerciseRepository.findOne({
          where: { id: exercise.exerciseId },
        });
        if (!exerciseExists) {
          throw new BadRequestException(
            `Exericse with id ${exercise.exerciseId} not found`,
          );
        }
        const exerciseLog = queryRunner.manager.create(ExerciseLog, {
          exercise: { id: exercise.exerciseId },
          workoutLog,
        });
        await queryRunner.manager.save(exerciseLog);
        let setNumber = 1;
        for (const set of exercise.sets) {
          const setsLog = queryRunner.manager.create(SetLog, {
            exerciseLog,
            reps: set.reps,
            weight: set.weight,
            set: setNumber++,
          });
          await queryRunner.manager.save(setsLog);
        }
      }
      await queryRunner.commitTransaction();
      return {
        message: 'Workout log added successfully',
        data: workoutLog,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(userId: string, workoutId: string) {
    const workoutLog = await this.workoutLogRepository.find({
      where: { user: { id: userId }, workout: { id: workoutId } },
      relations: {
        exerciseLog: {
          sets: true,
        },
      },
    });

    return {
      message: 'Workout log fetched successfully',
      data: workoutLog,
    };
  }

  async findOne(id: string, userId: string) {
    const workoutLog = await this.workoutLogRepository.findOne({
      where: { id, user: { id: userId } },
      relations: {
        exerciseLog: {
          sets: true,
        },
      },
    });
    if (!workoutLog) {
      throw new NotFoundException(`Workout with id ${id} not found`);
    }

    return {
      message: 'Workout log fetched successfully',
      data: workoutLog,
    };
  }

  async addExerciseLog(workoutLogId: string, dto: ExerciseLogDto) {
    const workoutLog = await this.workoutLogRepository.findOne({
      where: { id: workoutLogId },
    });
    if (!workoutLog) {
      throw new NotFoundException(
        `Workout log with id ${workoutLogId} not found`,
      );
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const exerciseLog = queryRunner.manager.create(ExerciseLog, {
        exercise: { id: dto.exerciseId },
        workoutLog,
      });
      await queryRunner.manager.save(exerciseLog);
      let setNumber = 1;
      for (const set of dto.sets) {
        const setsLog = queryRunner.manager.create(SetLog, {
          exerciseLog,
          reps: set.reps,
          weight: set.weight,
          set: setNumber++,
        });
        await queryRunner.manager.save(setsLog);
      }
      await queryRunner.commitTransaction();
      return {
        message: 'Exercise log added successfully',
        data: exerciseLog,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async addSetLog(exerciseLogId: string, dto: SetDto) {
    const exerciseLog = await this.exerciseLogRepository.findOne({
      where: { id: exerciseLogId },
      relations: ['sets'],
    });
    if (!exerciseLog) {
      throw new NotFoundException(
        `Exercise log with id ${exerciseLogId} not found`,
      );
    }
    const setNumber = exerciseLog.sets.length + 1;
    const setLog = this.setLogRepository.create({
      exerciseLog,
      reps: dto.reps,
      weight: dto.weight,
      set: setNumber,
    });
    await this.setLogRepository.save(setLog);
    return {
      message: 'Set log added successfully',
      data: setLog,
    };
  }

  async updateWorkoutLog(id: string, date: string, userId: string) {
    const workoutLog = await this.workoutLogRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!workoutLog) {
      throw new NotFoundException(`Workout log with id ${id} not found`);
    }
    await this.workoutLogRepository.update(id, { date });
    return {
      message: 'Workout updated successfully',
    };
  }
  async updateSetLog(id: string, dto: SetDto) {
    const setLog = await this.setLogRepository.findOne({ where: { id } });
    if (!setLog) {
      throw new NotFoundException(`Set with id ${id} not found`);
    }
    await this.setLogRepository.update(id, dto);
    return {
      message: 'Updated set successfully',
    };
  }
  async deleteWorkoutLog(id: string) {
    const workoutLog = await this.workoutLogRepository.findOne({
      where: { id },
      relations: ['exerciseLog', 'exerciseLog.sets'],
    });
    if (!workoutLog) {
      throw new NotFoundException(`Workout with ${id} not found`);
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const exercises = workoutLog.exerciseLog;
      for (const exercise of exercises) {
        for (const set of exercise.sets) {
          await queryRunner.manager.softDelete(SetLog, set.id);
        }
        await queryRunner.manager.softDelete(ExerciseLog, exercise.id);
      }
      await queryRunner.manager.softDelete(WorkoutLog, id);
      await queryRunner.commitTransaction();
      return {
        message: 'Workout deleted successfully',
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
  async deleteExerciseLog(id: string) {
    const ex = await this.exerciseLogRepository.findOne({
      where: { id },
      relations: ['sets'],
    });
    if (!ex) {
      throw new NotFoundException(`Exercise with id ${id} not found`);
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const sets = ex.sets;
      for (const set of sets) {
        await queryRunner.manager.softDelete(SetLog, set.id);
      }
      await queryRunner.manager.softDelete(ExerciseLog, id);
      await queryRunner.commitTransaction();
      return {
        message: 'Exercise deleted successfully',
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
  async deleteSetLog(id: string) {
    const setLog = await this.setLogRepository.findOne({ where: { id } });
    if (!setLog) {
      throw new NotFoundException(`Set with id ${id} not found`);
    }
    await this.setLogRepository.softDelete(id);
    return {
      message: 'Set deleted successfully',
    };
  }
  async getStreak(userId: string, userCurrentDate: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    const userWorkout = await this.workoutLogRepository.find({
      where: { user: { id: userId } },
    });
    if (!userWorkout.length) {
      return {
        message: 'No workouts found',
      };
    }

    const workoutDates: { date: Date; completed: boolean }[] = [];

    for (const workout of userWorkout) {
      workoutDates.push({ date: workout.date, completed: true });
    }
    let longestStreak = 0;
    let currentStreak = 1;
    const unique = Array.from(
      new Map(
        workoutDates.map((w) => [
          new Date(w.date).toISOString().split('T')[0], // key = YYYY-MM-DD
          w,
        ]),
      ).values(),
    );
    unique.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    for (let i = 1; i < unique.length; i++) {
      const date = new Date(unique[i].date);
      const prevDate = new Date(unique[i - 1].date);
      const diff = differenceInCalendarDays(date, prevDate);

      if (diff === 1) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
      longestStreak = Math.max(longestStreak, currentStreak);
    }
    const userDate = new Date(userCurrentDate).getTime();
    const lastUniqueDate = new Date(unique[unique.length - 1].date).getTime();
    const diff = differenceInCalendarDays(userDate, lastUniqueDate);

    if (diff > 1) {
      currentStreak = 0;
    }
    return { longestStreak, currentStreak, unique };
  }
  async getRecords(userId: string, exerciseId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    const exercise = await this.exerciseRepository.findOne({
      where: { id: exerciseId },
    });
    if (!exercise) {
      throw new NotFoundException(`Exercise not found`);
    }
    const records = await this.setLogRepository.find({
      where: {
        exerciseLog: {
          exercise: { id: exerciseId },
          workoutLog: { user: { id: userId } },
        },
      },
      relations: ['exerciseLog', 'exerciseLog.workoutLog'],
    });
    const result = records.map((r) => ({
      date: r.exerciseLog.workoutLog.date,
      weight: r.weight,
      reps: r.reps,
      estimated1rm: r.weight ? Math.floor(r.weight * (1 + r.reps / 30)) : 0,
    }));
    return result;
  }
}
