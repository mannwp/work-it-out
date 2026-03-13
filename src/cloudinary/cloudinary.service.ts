import { Injectable } from '@nestjs/common';
import { encode } from 'blurhash';
import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from 'cloudinary';
import sharp from 'sharp';
@Injectable()
export class CloudinaryService {
  async upload(file: Express.Multer.File) {
    const optimizedFile = await sharp(file.buffer)
      .rotate()
      .toFormat('webp', { quality: 80 })
      .toBuffer();
    const { data, info } = await sharp(optimizedFile)
      .raw()
      .ensureAlpha()
      .toBuffer({ resolveWithObject: true });

    const blurhash = encode(
      new Uint8ClampedArray(data),
      info.width,
      info.height,
      4,
      4,
    );

    const upload: UploadApiResponse | UploadApiErrorResponse | undefined =
      await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: 'uploads' }, (err, result) => {
            if (err)
              return reject(
                new Error(err.message || 'Cloudinary upload failed'),
              );
            resolve(result);
          })
          .end(optimizedFile);
      });
    return { data: upload, blurhash };
  }
  async delete(publicId: string) {
    const result = (await cloudinary.uploader.destroy(publicId)) as {
      result: string;
    };

    if (result.result === 'error') {
      throw new Error('Cloudinary deletion failed');
    }

    return result;
  }
}
