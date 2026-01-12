import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty({ message: 'ID книги не може бути порожнім' })
  @IsNumber({}, { message: 'ID книги має бути числом' })
  bookId: number;

  @IsNotEmpty({ message: 'Ім’я автора обов’язкове' })
  @IsString()
  authorName: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating: number;

  @IsOptional()
  @IsString()
  comment: string;

  @IsOptional()
  @IsDateString()
  date: Date;
}
