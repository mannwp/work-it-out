import { Body, Controller, Get, Put, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { EditProfileDto, ResetPasswordDto } from './dto/user.dto';
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
}
