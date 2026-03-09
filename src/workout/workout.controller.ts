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
} from '@nestjs/common';
import { WorkoutService } from './workout.service';
import { CreateWorkoutDto, UpdateWorkoutDto } from './dto/workout.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtPayload } from 'src/auth/jwt.strategy';

@Controller('workout')
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}
  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  create(
    @Request() req: { user: JwtPayload },
    @Body() createWorkoutDto: CreateWorkoutDto,
  ) {
    return this.workoutService.create(
      req.user.sub,
      req.user.role,
      createWorkoutDto,
    );
  }

  @Get()
  findAll() {
    return this.workoutService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workoutService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  update(
    @Request() req: { user: JwtPayload },
    @Param('id') id: string,
    @Body() updateWorkoutDto: UpdateWorkoutDto,
  ) {
    return this.workoutService.update(req.user.sub, id, updateWorkoutDto);
  }
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Request() req: { user: JwtPayload }, @Param('id') id: string) {
    return this.workoutService.remove(req.user.sub, id);
  }
}
