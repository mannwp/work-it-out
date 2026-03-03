import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

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

    return this.userRepository.save(user);
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
      throw new UnauthorizedException('Email doesnt');
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
}
