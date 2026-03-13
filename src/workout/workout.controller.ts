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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { WorkoutService } from './workout.service';
import { CreateWorkoutDto, UpdateWorkoutDto } from './dto/workout.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtPayload } from 'src/auth/jwt.strategy';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('workout')
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}
  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('coverImage'))
  create(
    @Request() req: { user: JwtPayload },
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateWorkoutDto,
  ) {
    const dto: CreateWorkoutDto = {
      ...body,
      coverImage: file,
    };

    return this.workoutService.create(req.user.sub, req.user.role, dto);
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
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('coverImage'))
  update(
    @Request() req: { user: JwtPayload },
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateWorkoutDto: UpdateWorkoutDto,
  ) {
    const dto: UpdateWorkoutDto = {
      ...updateWorkoutDto,
      coverImage: file,
    };
    return this.workoutService.update(req.user.sub, id, dto);
  }
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Request() req: { user: JwtPayload }, @Param('id') id: string) {
    return this.workoutService.remove(req.user.sub, id);
  }
}
