import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('SearchController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /search', () => {
    it('should search with keyword', () => {
      return request(app.getHttpServer())
        .get('/search?keyword=数据安全')
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toBeDefined();
          expect(Array.isArray(res.body.items)).toBe(true);
          expect(res.body.total).toBeDefined();
        });
    });

    it('should filter by type', async () => {
      const response = await request(app.getHttpServer())
        .get('/search?keyword=数据&type=policy')
        .expect(200);

      // 如果没有真实ES，可能返回空结果
      expect(response.body.items).toBeDefined();
    });

    it('should filter by multiple criteria', () => {
      return request(app.getHttpServer())
        .get('/search?keyword=安全&levels=法律&industries=互联网')
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toBeDefined();
        });
    });

    it('should support pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/search?keyword=数据&page=1&limit=10')
        .expect(200);

      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(10);
    });
  });

  describe('GET /search/suggest', () => {
    it('should return search suggestions', () => {
      return request(app.getHttpServer())
        .get('/search/suggest?q=数据')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should handle empty query', () => {
      return request(app.getHttpServer())
        .get('/search/suggest?q=')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });
});
