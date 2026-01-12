import { IsArray, IsNumber } from 'class-validator';

export class GetCountsBookId {
  @IsArray()
  @IsNumber({}, { each: true })
  bookIds: number[];
}
