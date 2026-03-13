import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CloudinaryService } from './cloudinary.service';
import { cloudinaryConfig } from 'src/config/cloudinary.config';
import { CloudinaryController } from './cloudinary.controller';

@Module({
  providers: [
    {
      provide: 'Cloudinary',
      inject: [ConfigService],
      useFactory: cloudinaryConfig,
    },
    CloudinaryService,
  ],
  controllers: [CloudinaryController],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
