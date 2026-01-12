import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from '../dto/createReview';
import { GetReviewsQueryDto } from '../dto/getReview';
import { GetCountsBookId } from '../dto/countsBookId';

@Controller('api/review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  async create(@Body() createReview: CreateReviewDto) {
    return this.reviewService.create(createReview);
  }

  @Get()
  async getReviews(@Query() query: GetReviewsQueryDto) {
    return this.reviewService.findByBookId(query);
  }

  @Post('_counts')
  async counts(@Body() getCountsIds: GetCountsBookId) {
    return this.reviewService.count(getCountsIds);
  }
}
