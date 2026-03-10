import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateWorkoutDto, UpdateWorkoutDto } from './dto/workout.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Workout } from 'src/entities/workout.entity';
import { DataSource, Repository } from 'typeorm';
import { WorkoutExercise } from 'src/entities/workout-exercise.entity';
import { UserRole } from 'src/entities/user.entity';

@Injectable()
export class WorkoutService {
  constructor(
    @InjectRepository(Workout)
    private workoutRepository: Repository<Workout>,

    @InjectRepository(WorkoutExercise)
    private workoutExerciseRepository: Repository<WorkoutExercise>,

    private dataSource: DataSource,
  ) {}
  async create(
    userId: string,
    userRole: UserRole,
    createWorkoutDto: CreateWorkoutDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let isAdmin = false;
      if (userRole === UserRole.ADMIN) {
        isAdmin = true;
      }
      const workout = queryRunner.manager.create(Workout, {
        title: createWorkoutDto.title,
        description: createWorkoutDto.description,
        createdById: userId,
        isOfficial: isAdmin,
      });
      const savedWorkout = await queryRunner.manager.save(workout);

      const exercises = createWorkoutDto.exercises ?? [];
      const workoutExercises = exercises.map((ex) =>
        queryRunner.manager.create(WorkoutExercise, {
          workout: { id: savedWorkout.id },
          exercise: { id: ex.exerciseId },
          suggestedSetsMin: ex.suggestedSetsMin,
          suggestedSetsMax: ex.suggestedSetsMax,
          suggestedRepsMin: ex.suggestedRepsMin,
          suggestedRepsMax: ex.suggestedRepsMax,
          restTime: ex.restTime,
          order: ex.order,
        }),
      );
      await queryRunner.manager.save(workoutExercises);

      await queryRunner.commitTransaction();
      return { data: savedWorkout, message: 'Workout created successfully' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    const workouts = await this.workoutRepository.find();
    return { data: workouts, message: 'Workouts fetched successfully' };
  }

  async findOne(id: string) {
    const workout = await this.workoutRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });
    if (!workout) {
      throw new BadRequestException(`No workout found for this id: ${id}`);
    }
    const exercises = await this.workoutExerciseRepository.find({
      where: {
        workout: {
          id,
        },
      },
      relations: ['exercise'],
      order: { order: 'ASC' },
    });

    return {
      data: {
        id: workout.id,
        title: workout.title,
        description: workout.description,
        isOfficial: workout.isOfficial,
        createdByUser:
          workout.createdBy?.name || workout.createdBy?.email || 'Unknown',
        createdByProfile: workout.createdBy?.profilePic ?? null,
        createdById: workout.createdById,
        exercises: exercises,
      },
      message: 'Workout details fetched successfully',
    };
  }

  async update(
    userId: string,
    workoutId: string,
    updateWorkoutDto: UpdateWorkoutDto,
  ) {
    const workout = await this.workoutRepository.findOne({
      where: { id: workoutId },
    });
    if (!workout) {
      throw new BadRequestException('Workout not found');
    }
    if (workout.createdById !== userId) {
      throw new ForbiddenException('Workout can only be updated by creator');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(Workout, workoutId, {
        title: updateWorkoutDto.title,
        description: updateWorkoutDto.description,
      });

      if (updateWorkoutDto.exercises) {
        // remove old exercises
        await queryRunner.manager.delete(WorkoutExercise, {
          workout: { id: workoutId },
        });

        // create new exercises
        const newExercises = updateWorkoutDto.exercises.map((ex) =>
          queryRunner.manager.create(WorkoutExercise, {
            workout: { id: workoutId },
            exercise: { id: ex.exerciseId },
            suggestedSetsMin: ex.suggestedSetsMin,
            suggestedSetsMax: ex.suggestedSetsMax,
            suggestedRepsMin: ex.suggestedRepsMin,
            suggestedRepsMax: ex.suggestedRepsMax,
            restTime: ex.restTime,
            order: ex.order,
          }),
        );

        await queryRunner.manager.save(newExercises);
      }

      await queryRunner.commitTransaction();
      return { message: 'Workout updated successfully' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(userId: string, id: string) {
    const workout = await this.workoutRepository.findOne({
      where: { id },
    });
    if (!workout) {
      throw new BadRequestException(`No workout found with id: ${id}`);
    }
    if (userId !== workout.createdById) {
      throw new ForbiddenException(`Workout can only be deleted by creator`);
    }
    await this.workoutRepository.softDelete(workout.id);
    return { message: 'Workout deleted successfully' };
  }
}
