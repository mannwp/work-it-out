import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { DayOfWeek } from '../../common/enums/day-of-week.enum';
import { User } from '../../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    default: 'mannpatel3118@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    default: 'Test@1234',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
export class VerifyUserOtp {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  otp: string;
}
export class ResetPasswordDto {
  @ApiProperty({
    default: 'mann@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    default: '1234',
  })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({
    default: '5678',
  })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    default: 'mann@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordWithOtpDto {
  @ApiProperty({
    default: 'mann@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  otp: string;

  @ApiProperty({
    default: '5678',
  })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

export class EditProfileDto extends PartialType(User) {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsDate()
  @IsOptional()
  dob?: Date;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  height?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  profilePic?: string;
}
export class AddWorkoutDto {
  @ApiProperty()
  workoutId: string;
  @ApiProperty()
  dayOfWeek: DayOfWeek;
}
export class RemoveWorkoutDto extends AddWorkoutDto {}
