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
import { JwtPayload } from 'src/auth/jwt.strategy';

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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'muscleGroup', required: false })
  @ApiQuery({ name: 'difficulty', required: false })
  @ApiQuery({ name: 'equipment', required: false })
  findAll(
    @Request() req: { user: JwtPayload },
    @Query('page')
    page = 1,
    @Query('limit') limit = 10,
    @Query('q') q = '',
    @Query('muscleGroup') muscleGroup = '',
    @Query('difficulty') difficulty = '',
    @Query('equipment') equipment = '',
  ) {
    return this.exerciseService.findAll(
      req.user.sub,
      page,
      limit,
      q,
      muscleGroup,
      difficulty,
      equipment,
    );
  }
  @Get('popular')
  getPopular() {
    return this.exerciseService.getPopularExercise();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Request() req: { user: JwtPayload }, @Param('id') id: string) {
    return this.exerciseService.findOne(req.user.sub, id);
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

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  addfavorite(@Request() req: { user: JwtPayload }, @Param('id') id: string) {
    return this.exerciseService.addFavorite(req.user.sub, id);
  }
  @Delete(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  removefavorite(
    @Request() req: { user: JwtPayload },
    @Param('id') id: string,
  ) {
    return this.exerciseService.removeFavorite(req.user.sub, id);
  }
}
