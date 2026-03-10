import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import {
  AddWorkoutDto,
  EditProfileDto,
  RemoveWorkoutDto,
  ResetPasswordDto,
} from './dto/user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfileDetails(@Request() req: { user: { userId: string } }) {
    return this.usersService.findById(req.user.userId);
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('reset-password')
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.usersService.resetPassword(
      body.email,
      body.oldPassword,
      body.newPassword,
    );
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('profile')
  editProfile(
    @Request() req: { user: { userId: string } },
    @Body() body: EditProfileDto,
  ) {
    return this.usersService.edit(req.user.userId, body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('add-workout')
  addWorkoutInPlan(
    @Request() req: { user: { userId: string } },
    @Body()
    body: AddWorkoutDto,
  ) {
    return this.usersService.addWorkoutInPlan(
      req.user.userId,
      body.workoutId,
      body.dayOfWeek,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('remove-workout')
  removeWorkoutInPlan(
    @Request() req: { user: { userId: string } },
    @Body()
    body: RemoveWorkoutDto,
  ) {
    return this.usersService.removeWorkoutInPlan(
      body.workoutId,
      body.dayOfWeek,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('get-workouts')
  getWorkoutsInPlan(@Request() req: { user: { userId: string } }) {
    return this.usersService.getWorkoutsInPlan(req.user.userId);
  }
}
