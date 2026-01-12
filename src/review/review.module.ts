import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, ReviewSchema } from './review.shema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{
      name: Review.name,
      schema: ReviewSchema }]),
  ],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
