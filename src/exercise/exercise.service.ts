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
    return await this.exerciseRepository.save(exercise);
  }

  findAll() {
    return this.exerciseRepository.find();
  }

  async findOne(id: string) {
    const exercise = await this.exerciseRepository.findOneBy({ id });
    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }
    return exercise;
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
    return { ...ex, ...updateExerciseDto };
  }

  async remove(userRole: UserRole, id: string) {
    if (userRole === UserRole.ATHLETE) {
      throw new UnauthorizedException('Athlete cant delete exercise.');
    }
    const result = await this.exerciseRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException('No exercise found');
    }
    return 'Exercise deleted successfully';
  }
}
