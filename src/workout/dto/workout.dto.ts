import {
  IsString,
  IsArray,
  ValidateNested,
  IsUUID,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, PartialType } from '@nestjs/swagger';
export class WorkoutExerciseDto {
  @ApiProperty({
    description: 'Exercise ID',
    example: 'd1b9c6f0-7f1a-4b5c-8f1b-4bcd4e6c9c33',
  })
  @IsUUID()
  exerciseId: string;

  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(1)
  suggestedSetsMin: number;

  @ApiProperty({ example: 4 })
  @IsInt()
  @Min(1)
  suggestedSetsMax: number;

  @ApiProperty({ example: 8 })
  @IsInt()
  @Min(1)
  suggestedRepsMin: number;

  @ApiProperty({ example: 12 })
  @IsInt()
  @Min(1)
  suggestedRepsMax: number;

  @ApiProperty({
    description: 'Rest time between sets in seconds',
    example: 90,
  })
  @IsInt()
  @Min(0)
  restTime: number;

  @ApiProperty({
    description: 'Exercise order in workout',
    example: 1,
  })
  @IsInt()
  @Min(1)
  order: number;
}

export class CreateWorkoutDto {
  @ApiProperty({
    example: 'Push Day',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Chest focused workout',
  })
  @IsString()
  description: string;

  @ApiProperty({
    type: [WorkoutExerciseDto],
  })
  @Type(() => WorkoutExerciseDto)
  @IsArray()
  @ValidateNested({ each: true })
  exercises: WorkoutExerciseDto[];
}
export class UpdateWorkoutDto extends PartialType(CreateWorkoutDto) {}
