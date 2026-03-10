import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateExerciseDto, UpdateExerciseDto } from './dto/exercise.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Exercise } from 'src/entities/exercise.entity';
import { Repository } from 'typeorm';
import { UserRole } from 'src/entities/user.entity';

@Injectable()
export class ExerciseService {
  constructor(
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
  ) {}
  async create(userRole: UserRole, createExerciseDto: CreateExerciseDto) {
    if (userRole === UserRole.ATHLETE) {
      throw new ForbiddenException('Athlete cant create exercise');
    }
    const exercise = this.exerciseRepository.create(createExerciseDto);
    const savedExercise = await this.exerciseRepository.save(exercise);
    return {
      message: 'Exercise created successfully',
      data: savedExercise,
    };
  }

  async findAll(
    page: number,
    limit: number,
    q?: string,
    muscleGroup?: string,
    difficulty?: string,
    equipment?: string,
  ) {
    const query = this.exerciseRepository.createQueryBuilder('exercise');
    if (q) {
      query.where(
        '(exercise.title ILIKE :q OR exercise.description ILIKE :q)',
        {
          q: `%${q}%`,
        },
      );
    }
    if (muscleGroup) {
      query.andWhere('exercise.muscleGroup ILIKE :muscleGroup', {
        muscleGroup: `%${muscleGroup}%`,
      });
    }
    if (difficulty) {
      query.andWhere('exercise.difficulty ILIKE :difficulty', {
        difficulty: `%${difficulty}%`,
      });
    }
    if (equipment) {
      query.andWhere('exercise.equipment ILIKE :equipment', {
        equipment: `%${equipment}%`,
      });
    }
    query.orderBy('exercise.createdAt', 'DESC');
    query.take(limit).skip((page - 1) * limit);

    const [exercise, total] = await query.getManyAndCount();
    return {
      message: 'Exercises fetched successfully',
      data: { exercise, pagination: { page, limit, total } },
    };
  }

  async findOne(id: string) {
    const exercise = await this.exerciseRepository.findOneBy({ id });
    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }
    return {
      message: 'Exercise fetched successfully',
      data: exercise,
    };
  }

  async update(
    userRole: UserRole,
    id: string,
    updateExerciseDto: UpdateExerciseDto,
  ) {
    if (userRole === UserRole.ATHLETE) {
      throw new ForbiddenException(
        'Athlete cant update exercise. Add a new request to admin',
      );
    }
    const ex = await this.exerciseRepository.findOneBy({ id });
    if (!ex) {
      throw new NotFoundException('Exercise doesnt exists');
    }
    await this.exerciseRepository.update(id, updateExerciseDto);
    const updatedExercise = await this.exerciseRepository.findOneBy({ id });
    return {
      message: 'Exercise updated successfully',
      data: updatedExercise,
    };
  }

  async remove(userRole: UserRole, id: string) {
    if (userRole === UserRole.ATHLETE) {
      throw new UnauthorizedException('Athlete cant delete exercise.');
    }
    const result = await this.exerciseRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException('No exercise found');
    }
    return {
      message: 'Exercise deleted successfully',
      data: null,
    };
  }
}
