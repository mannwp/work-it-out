import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { typeOrmConfig } from '../config/typeorm.config';
import { User } from '../entities/user.entity';

config();

const configService = new ConfigService();
const options = typeOrmConfig(configService) as DataSourceOptions;

export default new DataSource({
  ...options,
  entities: [User],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false, // Ensure synchronize is false for migrations
});
