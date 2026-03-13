import {
  IsUUID,
  IsDateString,
  ValidateNested,
  IsArray,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SetDto {
  @ApiProperty({ example: 10 })
  @IsNumber()
  reps: number;

  @ApiProperty({ example: 50 })
  @IsNumber()
  weight: number;
}

export class ExerciseLogDto {
  @ApiProperty({ example: 'uuid-v4-string' })
  @IsUUID()
  exerciseId: string;

  @ApiProperty({ type: [SetDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetDto)
  sets: SetDto[];
}

export class CreateWorkoutLogDto {
  @ApiProperty({ example: 'uuid-v4-string' })
  @IsUUID()
  workoutId: string;

  @ApiProperty({ example: '2023-10-27T10:00:00Z' })
  @IsDateString()
  date: string;

  @ApiProperty({ type: [ExerciseLogDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseLogDto)
  exercises: ExerciseLogDto[];
}
export class UpdateWorkoutLogDto {
  @ApiProperty({ example: 'uuid-v4-string' })
  @IsUUID()
  workoutId: string;
  @ApiProperty({ example: '2023-10-27T10:00:00Z' })
  @IsDateString()
  date: string;
}
export class StreakDto {
  @ApiProperty({ example: '2023-10-27T10:00:00Z' })
  @IsDateString()
  date: string;
}
