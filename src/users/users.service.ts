import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { MailService } from 'src/mail/mail.service';
import { OtpService } from 'src/otp/otp.service';
import { EditProfileDto } from './dto/user.dto';
import { DayOfWeek } from '../common/enums/day-of-week.enum';
import { UserWorkout } from '../entities/user-workout.entity';
import { Workout } from '../entities/workout.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Workout)
    private workoutRepository: Repository<Workout>,
    @InjectRepository(UserWorkout)
    private userWorkoutsRepository: Repository<UserWorkout>,
    private otpService: OtpService,
    private mailService: MailService,
    private cloudinaryService: CloudinaryService,
  ) {}

  private async sendVerificationEmail(user: User) {
    const { data: otp } = await this.otpService.createOtp(user.id);
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

    return {
      message: `Verification OTP sent to ${user.email}`,
    };
  }

  async resendOtp(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new BadRequestException('User not found');
    if (!user.password) {
      throw new BadRequestException(
        'This account was registered with Google and has no password',
      );
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) throw new BadRequestException('Invalid password');
    await this.sendVerificationEmail(user);

    return { message: `Verification OTP sent to ${user.email}` };
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
    return { message: 'Email verified successfully' };
  }
  async findByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email },
    });
  }
  async findById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'name',
        'profilePic',
        'googleId',
        'isEmailVerified',
        'role',
      ],
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return {
      message: 'User fetched successfully',
      data: user,
    };
  }
  async resetPassword(email: string, oldPassword: string, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Email does not exist');
    }
    if (!user.password) {
      throw new BadRequestException(
        'Registered with google no existing password',
      );
    }
    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Incorrect old password');
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(user.id, {
      password: hashedNewPassword,
    });
    return { message: 'Password reset successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User with this email does not exist');
    }
    const { data: otp } = await this.otpService.createOtp(user.id);
    const subject = 'Reset Your Password - Workout App';
    const text = `Your password reset code is: ${otp}. It expires in 10 minutes.`;
    await this.mailService.sendOtp(user.email, subject, text);

    return { message: `Password reset OTP sent to ${user.email}` };
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
    return { message: 'Password reset successfully' };
  }

  async resendVerificationOtp(user: User) {
    await this.sendVerificationEmail(user);
  }

  async findOrCreateGoogleUser(profile: {
    googleId: string;
    email: string;
    name: string;
    profileUrl?: string;
  }) {
    // Try finding by googleId first
    let user = await this.userRepository.findOne({
      where: { googleId: profile.googleId },
    });
    if (user) return user;

    // Try finding by email (account already exists with email/password)
    user = await this.userRepository.findOne({
      where: { email: profile.email },
    });
    if (user) {
      // Link the Google ID to the existing account
      await this.userRepository.update(user.id, {
        googleId: profile.googleId,
        isEmailVerified: true,
      });
      return { ...user, googleId: profile.googleId, isEmailVerified: true };
    }

    // Create a brand-new Google user (no password, already verified)
    const newUser = this.userRepository.create({
      email: profile.email,
      name: profile.name,
      profilePic: profile.profileUrl,
      googleId: profile.googleId,
      isEmailVerified: true,
    });
    return this.userRepository.save(newUser);
  }
  async edit(id: string, data: EditProfileDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    await this.userRepository.update(id, data);
    const updatedUser = await this.userRepository.findOne({ where: { id } });
    return { data: updatedUser, message: 'Profile updated successfully' };
  }

  async uploadProfile(userId: string, file: Express.Multer.File) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (file.size > 2000000) {
      throw new BadRequestException('File limit 2MB only');
    }
    if (!file.mimetype.includes('image')) {
      throw new BadRequestException('Only images supported');
    }
    const upload = await this.cloudinaryService.upload(file).catch(() => {
      throw new BadRequestException('Failed to upload');
    });
    const url = upload?.data?.url as string;
    const publicId = upload?.data?.public_id as string;
    const blurHash = upload.blurhash;
    await this.userRepository.save({
      ...user,
      profilePic: url,
      profilePicBlurHash: blurHash,
      profilePicPublicId: publicId,
    });
    if (user.profilePicPublicId) {
      await this.cloudinaryService.delete(user.profilePicPublicId);
    }

    return {
      message: 'Profile photo uploaded successfully',
    };
  }

  async addWorkoutInPlan(
    userId: string,
    workoutId: string,
    dayOfWeek: DayOfWeek,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const workout = await this.workoutRepository.findOne({
      where: { id: workoutId },
    });
    if (!workout) {
      throw new BadRequestException('Workout not found');
    }
    const userWorkout = this.userWorkoutsRepository.create({
      user,
      workout,
      dayOfWeek,
    });
    const savedUserWorkout =
      await this.userWorkoutsRepository.save(userWorkout);
    return { data: savedUserWorkout, message: 'Workout added to plan' };
  }
  async removeWorkoutInPlan(workoutId: string, dayOfWeek: DayOfWeek) {
    const workout = await this.workoutRepository.findOne({
      where: { id: workoutId },
      relations: ['createdBy'],
    });
    if (!workout) {
      throw new BadRequestException(`No workout found with id: ${workoutId}`);
    }
    const userWorkout = await this.userWorkoutsRepository.findOne({
      where: { workout: { id: workout.id }, dayOfWeek: dayOfWeek },
    });
    if (!userWorkout) {
      throw new BadRequestException(`No User workout found for ${dayOfWeek}`);
    }
    await this.userWorkoutsRepository.delete(userWorkout.id);
    return { message: 'Workout removed from plan' };
  }
  async getWorkoutsInPlan(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const userWorkouts = await this.userWorkoutsRepository.find({
      where: { user: { id: user.id } },
      relations: ['workout'],
    });
    return {
      data: userWorkouts,
      message: 'Workouts in plan fetched successfully',
    };
  }
}
