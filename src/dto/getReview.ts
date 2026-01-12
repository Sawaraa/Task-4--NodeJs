import { IsNotEmpty, IsNumberString, IsOptional } from 'class-validator';

export class GetReviewsQueryDto {
  @IsNotEmpty()
  @IsNumberString()
  bookId: string;

  @IsOptional()
  @IsNumberString()
  size?: string;

  @IsOptional()
  @IsNumberString()
  from?: string;
}
