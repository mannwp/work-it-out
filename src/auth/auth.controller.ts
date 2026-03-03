import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  register(@Body() body: CreateUserDto) {
    return this.authService.register(body.email, body.password);
  }

  @Post('login')
  login(@Body() body: CreateUserDto) {
    return this.authService.login(body.email, body.password);
  }
}
