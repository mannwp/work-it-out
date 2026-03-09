import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CreateUserDto,
  ForgotPasswordDto,
  ResetPasswordWithOtpDto,
  VerifyUserOtp,
} from 'src/users/dto/user.dto';
import { GoogleAuthGuard } from './google-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  register(@Body() body: CreateUserDto) {
    return this.authService.register(body.email, body.password);
  }
  @Post('verify-otp')
  verifyOtp(@Body() body: VerifyUserOtp) {
    return this.authService.verifyOtp(body.email, body.otp);
  }
  @Post('resend-otp')
  resendOtp(@Body() body: CreateUserDto) {
    return this.authService.resendOtp(body.email, body.password);
  }
  @Post('login')
  login(@Body() body: CreateUserDto) {
    return this.authService.login(body.email, body.password);
  }
  @Post('forgot-password')
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body.email);
  }
  @Post('reset-password')
  resetPassword(@Body() body: ResetPasswordWithOtpDto) {
    return this.authService.resetPassword(
      body.email,
      body.otp,
      body.newPassword,
    );
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google')
  googleAuth() {
    // Redirects to Google — handled by the guard
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  googleCallback(@Request() req: { user: { id: string; role?: string } }) {
    return this.authService.googleLogin(req.user);
  }
}
