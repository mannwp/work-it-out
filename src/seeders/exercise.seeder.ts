import { DataSource } from 'typeorm';
import exercises from '../data/exercises.json';
import { Exercise } from '../entities/exercise.entity';

export const exerciseSeeder = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(Exercise);

  for (const exercise of exercises) {
    const duplicate = await repo.findOne({ where: { title: exercise.title } });
    if (duplicate) {
      await repo.update(duplicate.id, exercise);
    } else {
      const entity = repo.create(exercise);
      await repo.save(entity);
    }
  }

  console.log('Exercises seeded');
};
