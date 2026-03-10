import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { CreateExerciseDto, UpdateExerciseDto } from './dto/exercise.dto';
import { UserRole } from 'src/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@Controller('exercise')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(
    @Request() req: { user: { userRole: UserRole } },
    @Body() createExerciseDto: CreateExerciseDto,
  ) {
    return this.exerciseService.create(req.user.userRole, createExerciseDto);
  }

  @Get()
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'muscleGroup', required: false })
  @ApiQuery({ name: 'difficulty', required: false })
  @ApiQuery({ name: 'equipment', required: false })
  findAll(
    @Query('page')
    page = 1,
    @Query('limit') limit = 10,
    @Query('q') q = '',
    @Query('muscleGroup') muscleGroup = '',
    @Query('difficulty') difficulty = '',
    @Query('equipment') equipment = '',
  ) {
    return this.exerciseService.findAll(
      page,
      limit,
      q,
      muscleGroup,
      difficulty,
      equipment,
    );
  }

  @Get(':id')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.exerciseService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(
    @Request() req: { user: { userRole: UserRole } },
    @Param('id') id: string,
    @Body() updateExerciseDto: UpdateExerciseDto,
  ) {
    return this.exerciseService.update(
      req.user.userRole,
      id,
      updateExerciseDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(
    @Request() req: { user: { userRole: UserRole } },
    @Param('id') id: string,
  ) {
    return this.exerciseService.remove(req.user.userRole, id);
  }
}
