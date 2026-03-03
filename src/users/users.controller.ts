import { Body, Controller, Get, Put, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ResetPasswordDto } from './dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfileDetails(@Request() req: { user: { userId: string } }) {
    return this.usersService.findById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('reset-password')
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.usersService.resetPassword(
      body.email,
      body.oldPassword,
      body.newPassword,
    );
  }
}
