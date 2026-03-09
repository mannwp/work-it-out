import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string) {
    return await this.userService.create(email, password);
  }
  async verifyOtp(email: string, otp: string) {
    return await this.userService.verifyOtp(email, otp);
  }
  async resendOtp(email: string, password: string) {
    return await this.userService.resendOtp(email, password);
  }
  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException();
    }

    if (!user.password) {
      throw new BadRequestException(
        'Registered with google no existing password',
      );
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }
    if (!user.isEmailVerified) {
      await this.userService.resendVerificationOtp(user);
      throw new UnauthorizedException(
        'Email not verified. Please verify your email.',
      );
    }
    const payload = { sub: user.id, role: user.role };
    return {
      token: this.jwtService.sign(payload),
    };
  }

  async forgotPassword(email: string) {
    return await this.userService.forgotPassword(email);
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    return await this.userService.resetPasswordWithOtp(email, otp, newPassword);
  }

  googleLogin(user: { id: string; role?: string }) {
    const payload = { sub: user.id, role: user.role };
    return {
      token: this.jwtService.sign(payload),
    };
  }
}
