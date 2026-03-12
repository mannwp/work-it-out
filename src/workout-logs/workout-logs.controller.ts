import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Request,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { WorkoutLogsService } from './workout-logs.service';
import {
  CreateWorkoutLogDto,
  ExerciseLogDto,
  SetDto,
  UpdateWorkoutLogDto,
} from './dto/workout-log.dto';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { JwtPayload } from 'src/auth/jwt.strategy';

@Controller('workout-logs')
export class WorkoutLogsController {
  constructor(private readonly workoutLogsService: WorkoutLogsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  create(
    @Request() req: { user: JwtPayload },
    @Body() createWorkoutLogDto: CreateWorkoutLogDto,
  ) {
    return this.workoutLogsService.create(req.user.sub, createWorkoutLogDto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'workoutId', required: false })
  findAll(
    @Request() req: { user: JwtPayload },
    @Query() query: { workoutId: string },
  ) {
    return this.workoutLogsService.findAll(req.user.sub, query.workoutId);
  }

  @Get('streak')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getStreakLog(@Request() req: { user: JwtPayload }) {
    console.log(req.user);

    return this.workoutLogsService.getStreak(req.user.sub);
  }
  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  findOne(@Request() req: { user: JwtPayload }, @Param('id') id: string) {
    return this.workoutLogsService.findOne(id, req.user.sub);
  }
  @Get(':id/exercise/records')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getExerciseRecords(
    @Request() req: { user: JwtPayload },
    @Param('id') id: string,
  ) {
    return this.workoutLogsService.getRecords(req.user.sub, id);
  }
  @Post(':id/exercise')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  addExerciseLog(
    @Param('id') id: string,
    @Body() exerciseLogDto: ExerciseLogDto,
  ) {
    return this.workoutLogsService.addExerciseLog(id, exerciseLogDto);
  }

  @Post('exercise/:id/set')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  addSetLog(@Param('id') id: string, @Body() setDto: SetDto) {
    return this.workoutLogsService.addSetLog(id, setDto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  updateWorkoutLog(
    @Request() req: { user: JwtPayload },
    @Param('id') id: string,
    @Body() updateWorkoutLogDto: UpdateWorkoutLogDto,
  ) {
    return this.workoutLogsService.updateWorkoutLog(
      id,
      updateWorkoutLogDto.date,
      req.user.sub,
    );
  }
  @Patch('exercise/set/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  updateSetLog(@Param('id') id: string, @Body() updateSetLogDto: SetDto) {
    return this.workoutLogsService.updateSetLog(id, updateSetLogDto);
  }
  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  removeWorkoutLog(@Param('id') id: string) {
    return this.workoutLogsService.deleteWorkoutLog(id);
  }
  @Delete('exercise/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  removeExerciseLog(@Param('id') id: string) {
    return this.workoutLogsService.deleteExerciseLog(id);
  }
  @Delete('exercise/set/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  removeSetLog(@Param('id') id: string) {
    return this.workoutLogsService.deleteSetLog(id);
  }
}
