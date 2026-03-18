import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('COUsController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let createdCOUId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // 注册并登录获取token
    const authResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'cou-test@example.com',
        password: 'password123',
        name: 'COU Test',
      });

    authToken = authResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /cous', () => {
    it('should create a new COU', async () => {
      const response = await request(app.getHttpServer())
        .post('/cous')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: 'COU-TEST-001',
          title: '测试COU',
          description: '这是一个测试COU',
          obligationType: 'mandatory',
          applicableIndustries: ['互联网'],
          applicableRegions: ['国内'],
          finalWeight: 8.5,
          baseWeight: 7,
          penaltyWeight: 1.2,
        })
        .expect(201);

      createdCOUId = response.body.id;
      expect(createdCOUId).toBeDefined();
      expect(response.body.title).toBe('测试COU');
      expect(response.body.finalWeight).toBe(8.5);
    });
  });

  describe('GET /cous', () => {
    it('should get all COUs', () => {
      return request(app.getHttpServer())
        .get('/cous')
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toBeDefined();
          expect(Array.isArray(res.body.items)).toBe(true);
          expect(res.body.total).toBeDefined();
        });
    });

    it('should filter COUs by weight range', async () => {
      const response = await request(app.getHttpServer())
        .get('/cous?weightMin=8&weightMax=10')
        .expect(200);

      expect(response.body.items.every((c: any) => c.finalWeight >= 8 && c.finalWeight <= 10)).toBe(true);
    });

    it('should filter COUs by keyword', async () => {
      const response = await request(app.getHttpServer())
        .get('/cous?keyword=测试')
        .expect(200);

      expect(response.body.items.length).toBeGreaterThan(0);
    });
  });

  describe('GET /cous/:id', () => {
    it('should get COU by id', () => {
      return request(app.getHttpServer())
        .get(`/cous/${createdCOUId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdCOUId);
          expect(res.body.title).toBe('测试COU');
        });
    });
  });

  describe('GET /cous/:id/related', () => {
    it('should get related COUs', () => {
      return request(app.getHttpServer())
        .get(`/cous/${createdCOUId}/related`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('GET /cous/stats', () => {
    it('should get COU statistics', () => {
      return request(app.getHttpServer())
        .get('/cous/stats')
        .expect(200)
        .expect((res) => {
          expect(res.body.total).toBeDefined();
          expect(res.body.byObligationType).toBeDefined();
        });
    });
  });

  describe('PUT /cous/:id', () => {
    it('should update a COU', () => {
      return request(app.getHttpServer())
        .put(`/cous/${createdCOUId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: '更新后的测试COU',
          finalWeight: 9.0,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('更新后的测试COU');
          expect(res.body.finalWeight).toBe(9.0);
        });
    });
  });

  describe('DELETE /cous/:id', () => {
    it('should delete a COU', () => {
      return request(app.getHttpServer())
        .delete(`/cous/${createdCOUId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });
  });
});
