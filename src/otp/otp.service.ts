import { Injectable, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Otp } from 'src/entities/otp.entity';
import * as crypto from 'crypto';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
  ) {}

  generateOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  hashOtp(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  async createOtp(userId: string) {
    const otp = this.generateOtp();
    const otpHash = this.hashOtp(otp);

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // delete old OTPs
    await this.otpRepository.delete({ userId });

    await this.otpRepository.save({
      userId,
      otpHash,
      expiresAt,
    });

    return {
      data: otp,
      message: 'OTP created successfully',
    };
  }

  async verifyOtp(userId: string, enteredOtp: string) {
    const record = await this.otpRepository.findOne({
      where: { userId },
    });

    if (!record) throw new BadRequestException('User not exists');
    if (record.used) throw new BadRequestException('Already used');
    if (record.expiresAt < new Date())
      throw new BadRequestException('OTP expired');

    if (record.attempts >= 5)
      throw new BadRequestException('Too many attempts');

    const hashed = this.hashOtp(enteredOtp);

    if (hashed !== record.otpHash) {
      record.attempts += 1;
      await this.otpRepository.save(record);
      throw new BadRequestException('Invalid OTP');
    }

    record.used = true;
    await this.otpRepository.save(record);

    return { message: 'OTP verified successfully' };
  }
}
