import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { Review, ReviewDocument } from './review.shema';
import { CreateReviewDto } from '../dto/createReview';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { GetReviewsQueryDto } from '../dto/getReview';
import { GetCountsBookId } from '../dto/countsBookId';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private readonly model: Model<ReviewDocument>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async create(createReviewDto: CreateReviewDto) {
    const { bookId } = createReviewDto;
    const baseUrl = this.configService.get<string>('SPRING_BOOT_API_URL');
    const springBootUrl = `${baseUrl}/${bookId}`;

    try {
      await firstValueFrom(this.httpService.get(springBootUrl));
    } catch (error) {
      throw new BadRequestException(
        `Перевірка не вдалася: книга з ID ${bookId} не знайдена за адресою ${springBootUrl}`,
      );
    }

    return this.model.create({
      ...createReviewDto,
      date: createReviewDto.date || new Date(),
    });
  }

  async findByBookId(query: GetReviewsQueryDto) {
    const { bookId, size, from } = query;

    const limit = size ? parseInt(size) : 10;
    const skip = from ? parseInt(from) : 0;

    return this.model
      .find({ bookId: parseInt(bookId) })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async count(
    getCountsDto: GetCountsBookId,
  ): Promise<Record<string, number>> {
    const { bookIds } = getCountsDto;

    const stats = await this.model.aggregate([
      {
        $match: { bookId: { $in: bookIds } },
      },
      {
        $group: {
          _id: '$bookId',
          total: { $sum: 1 },
        },
      },
    ]);

    const counts: Record<string, number> = {};

    // Ініціалізуємо всі ID нулями (щоб ті, для яких немає рецензій, теж були в результаті)
    bookIds.forEach((id) => {
      counts[id.toString()] = 0;
    });

    // Заповнюємо реальними даними з бази
    stats.forEach((item) => {
      counts[item._id.toString()] = item.total;
    });

    return counts;
  }
}
