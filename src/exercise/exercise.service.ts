import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateExerciseDto, UpdateExerciseDto } from './dto/exercise.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Exercise } from 'src/entities/exercise.entity';
import { Repository } from 'typeorm';
import { User, UserRole } from 'src/entities/user.entity';
import { FavoriteExercise } from 'src/entities/favorite-exercise.entity';

@Injectable()
export class ExerciseService {
  constructor(
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
    @InjectRepository(FavoriteExercise)
    private favoriteExerciseRepository: Repository<FavoriteExercise>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
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
    userId: string,
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
    query.loadRelationCountAndMap(
      'exercise.favoriteCount',
      'exercise.favoriteExercise',
    );
    query.leftJoinAndMapOne(
      'exercise.userFavorite',
      FavoriteExercise,
      'favorite',
      'favorite.exerciseId = exercise.id AND favorite.userId = :userId',
      { userId },
    );
    const [exercise, total] = await query.getManyAndCount();
    const exerciseWithFavorites = exercise.map((ex) => {
      const isFavorite = !!ex['userFavorite'];
      delete ex['userFavorite'];
      return { ...ex, isFavorite };
    });
    return {
      message: 'Exercises fetched successfully',
      data: {
        exercise: exerciseWithFavorites,
        pagination: { page, limit, total },
      },
    };
  }

  async findOne(userId: string, id: string) {
    const query = this.exerciseRepository
      .createQueryBuilder('exercise')
      .where('exercise.id = :id', { id })
      .loadRelationCountAndMap(
        'exercise.favoriteCount',
        'exercise.favoriteExercise',
      )
      .leftJoinAndMapOne(
        'exercise.userFavorite',
        FavoriteExercise,
        'favorite',
        'favorite.exerciseId = exercise.id AND favorite.userId = :userId',
        { userId },
      );
    const exercise = await query.getOne();
    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }
    const isFavorite = !!exercise['userFavorite'];
    delete exercise['userFavorite'];
    return {
      message: 'Exercise fetched successfully',
      data: { ...exercise, isFavorite },
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

  async addFavorite(userId: string, exerciseId: string) {
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
    const favorite = this.favoriteExerciseRepository.create({ exercise, user });
    try {
      await this.favoriteExerciseRepository.save(favorite);
    } catch (error) {
      const err = error as { code?: string };
      if (err.code === '23505') {
        // PostgreSQL unique violation
        throw new ConflictException('Already marked favorite');
      }
      throw error;
    }
    return {
      message: 'Exercise marked favorite',
    };
  }
  async removeFavorite(userId: string, exerciseId: string) {
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
    const favorite = await this.favoriteExerciseRepository.findOne({
      where: { user: { id: userId }, exercise: { id: exerciseId } },
    });
    if (!favorite) {
      throw new NotFoundException(`Not marked favorite`);
    }
    await this.favoriteExerciseRepository.delete(favorite.id);
    return {
      message: 'Exercise marked unfavorite',
    };
  }

  async getPopularExercise() {
    const query = this.exerciseRepository
      .createQueryBuilder('exercise')
      .leftJoin('exercise.favoriteExercise', 'favorite')
      .loadRelationCountAndMap(
        'exercise.favoriteCount',
        'exercise.favoriteExercise',
      )
      .groupBy('exercise.id')
      .having('COUNT(favorite.id)>0')
      .orderBy('COUNT(favorite.id)', 'DESC');
    return await query.getMany();
  }
}
