import { Test, TestingModule } from '@nestjs/testing';
import { ReviewService } from './review.service';
import { INestApplication } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AppModule } from '../app.module';
import { of, throwError } from 'rxjs';
import request from 'supertest';

describe('ReviewService', () => {
  let service: ReviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewService],
    }).compile();

    service = module.get<ReviewService>(ReviewService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

