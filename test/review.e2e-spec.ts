import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

describe('Review System (Integration Tests)', () => {
  let app: INestApplication;
  let httpService: HttpService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Enable validation pipes to test DTO constraints during integration tests
    app.useGlobalPipes(new ValidationPipe());

    httpService = moduleFixture.get<HttpService>(HttpService);
    await app.init();
  });

  describe('POST /api/review', () => {
    it('should create a review when Spring Boot confirms the book exists', async () => {
      // Mock successful external API response from Spring Boot
      const mockResponse = { data: { id: 5 }, status: 200 };
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse as any));

      const response = await request(app.getHttpServer())
        .post('/api/review')
        .send({
          bookId: 5,
          authorName: 'Olena',
          rating: 5,
          comment: 'Great book for testing!',
        });

      // Verify successful creation and response structure
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.bookId).toBe(5);
    });

    it('should return 400 if book does not exist in Spring Boot', async () => {
      // Mock failed external API response (404 Not Found)
      jest.spyOn(httpService, 'get').mockReturnValue(
        throwError(() => ({
          response: { status: 404 },
        })),
      );

      const response = await request(app.getHttpServer())
        .post('/api/review')
        .send({
          bookId: 999,
          authorName: 'Anon',
          rating: 1,
        });

      // Assert that the application throws a BadRequestException (400)
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Перевірка не вдалася');
    });
  });

  describe('GET /api/review', () => {
    it('should return reviews for a specific book', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/review')
        .query({ bookId: 5, size: 10, from: 0 });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 400 if required bookId is missing in query params', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/review')
        .query({ size: 10 });

      // ValidationPipe catches the missing bookId based on DTO decorators
      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/review/_counts', () => {
    it('should return an aggregated counts object for given IDs', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/review/_counts')
        .send({
          bookIds: [5, 10],
        });

      // Verify status and check if response keys match the requested IDs
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('5');
      expect(typeof response.body['5']).toBe('number');
    });

    it('should return 400 if bookIds is not an array', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/review/_counts')
        .send({
          bookIds: 'invalid-input-type',
        });

      expect(response.status).toBe(400);
    });
  });

  afterEach(() => {
    // Reset all mocks to ensure test isolation
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    // Explicitly close Mongoose connection to avoid memory leaks or hanging processes
    const connection = app.get<Connection>(getConnectionToken());
    await connection.close();
    await app.close();
  });
});
