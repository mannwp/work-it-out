import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private usersService: UsersService,
    configService: ConfigService,
  ) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    if (!clientID || !clientSecret) {
      throw new Error(
        `GoogleStrategy initialization failed: Missing OAuth credentials.\n` +
          `clientID: '${clientID}'\nclientSecret: '${clientSecret}'\n` +
          `Ensure configService.get('GOOGLE_CLIENT_ID') and configService.get('GOOGLE_CLIENT_SECRET') return valid values.`,
      );
    }
    super({
      clientID,
      clientSecret,
      callbackURL: configService.get<string>(
        'GOOGLE_CALLBACK_URL',
        'http://localhost:3000/auth/google/callback',
      ),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (error: Error | null, user?: Express.User | false) => void,
  ) {
    const { id, emails, displayName, photos } = profile;
    if (!emails || emails.length === 0) {
      return done(new Error('No email found in Google profile'));
    }
    const user = await this.usersService.findOrCreateGoogleUser({
      googleId: id,
      email: emails[0].value,
      name: displayName,
      profileUrl: photos ? photos[0].value : undefined,
    });
    done(null, user);
  }
}
