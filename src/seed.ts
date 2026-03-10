import { exerciseSeeder } from './seeders/exercise.seeder';
import { typeOrmConfig } from './config/typeorm.config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();

const configService = new ConfigService();
const options = typeOrmConfig(configService) as DataSourceOptions;

export const dataSourceOptions = new DataSource({
  ...options,
  entities: [__dirname + '/entities/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false, // Ensure synchronize is false for migrations
});

async function runSeed() {
  await dataSourceOptions.initialize();
  console.log('🌱 Running Exercise Seeder...');

  await exerciseSeeder(dataSourceOptions);

  await dataSourceOptions.destroy();
  console.log('✅ Seeding finished');
}

runSeed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
