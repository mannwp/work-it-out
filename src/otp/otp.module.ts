import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { Otp } from 'src/entities/otp.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Otp])],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
