import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateExerciseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  muscleGroup: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  equipment: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  difficulty: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  videoUrl: string;
}

export class UpdateExerciseDto extends PartialType(CreateExerciseDto) {}
