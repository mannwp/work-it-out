import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { MailService } from 'src/mail/mail.service';
import { OtpService } from 'src/otp/otp.service';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private otpService: OtpService,
    private mailService: MailService,
  ) {}

  private async sendVerificationEmail(user: User) {
    const otp = await this.otpService.createOtp(user.id);
    const subject = 'Verify Your Email - Workout App';
    const text = `Your verification code is: ${otp}. It expires in 10 minutes.`;
    await this.mailService.sendOtp(user.email, subject, text);
  }

  async create(email: string, password: string) {
    const isEmailExists = await this.userRepository.findOne({
      where: { email },
    });
    if (isEmailExists) {
      throw new ConflictException('Email already registered');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
    });

    await this.userRepository.save(user);
    await this.sendVerificationEmail(user);

    return `Verification OTP sent to ${user.email}`;
  }

  async resendOtp(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new BadRequestException('User not found');
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) throw new BadRequestException('Invalid password');
    await this.sendVerificationEmail(user);

    return `Verification OTP sent to ${user.email}`;
  }
  async verifyOtp(email: string, otp: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    await this.otpService.verifyOtp(user.id, otp);
    await this.userRepository.update(user.id, {
      isEmailVerified: true,
    });
  }
  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }
  async findById(id: string) {
    return this.userRepository.findOne({ where: { id } });
  }
  async resetPassword(email: string, oldPassword: string, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Email does not exist');
    }
    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Incorrect old password');
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(user.id, {
      password: hashedNewPassword,
    });
    return true;
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User with this email does not exist');
    }
    const otp = await this.otpService.createOtp(user.id);
    const subject = 'Reset Your Password - Workout App';
    const text = `Your password reset code is: ${otp}. It expires in 10 minutes.`;
    await this.mailService.sendOtp(user.email, subject, text);

    return `Password reset OTP sent to ${user.email}`;
  }

  async resetPasswordWithOtp(email: string, otp: string, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    await this.otpService.verifyOtp(user.id, otp);
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(user.id, {
      password: hashedNewPassword,
    });
    return true;
  }

  async resendVerificationOtp(user: User) {
    await this.sendVerificationEmail(user);
  }
}
