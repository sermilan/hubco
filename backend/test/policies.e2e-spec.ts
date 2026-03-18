import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('PoliciesController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let createdPolicyId: string;

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
        email: 'policy-test@example.com',
        password: 'password123',
        name: 'Policy Test',
      });

    authToken = authResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /policies', () => {
    it('should create a new policy', async () => {
      const response = await request(app.getHttpServer())
        .post('/policies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: '测试政策',
          code: 'TEST-2024-001',
          level: '部门规章',
          description: '这是一个测试政策',
          issuingAuthority: '测试机构',
          industries: ['互联网'],
          regions: ['国内'],
          effectiveDate: '2024-01-01',
          tags: [{ id: '1', name: '测试标签', color: 'blue', category: '技术' }],
        })
        .expect(201);

      createdPolicyId = response.body.id;
      expect(createdPolicyId).toBeDefined();
      expect(response.body.title).toBe('测试政策');
    });

    it('should fail without auth token', () => {
      return request(app.getHttpServer())
        .post('/policies')
        .send({
          title: '测试政策',
          code: 'TEST-2024-002',
        })
        .expect(401);
    });
  });

  describe('GET /policies', () => {
    it('should get all policies', () => {
      return request(app.getHttpServer())
        .get('/policies')
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toBeDefined();
          expect(Array.isArray(res.body.items)).toBe(true);
          expect(res.body.total).toBeDefined();
          expect(res.body.page).toBeDefined();
        });
    });

    it('should filter policies by keyword', async () => {
      const response = await request(app.getHttpServer())
        .get('/policies?keyword=测试')
        .expect(200);

      expect(response.body.items.length).toBeGreaterThan(0);
      expect(response.body.items[0].title).toContain('测试');
    });

    it('should filter policies by level', async () => {
      const response = await request(app.getHttpServer())
        .get('/policies?levels=部门规章')
        .expect(200);

      expect(response.body.items.every((p: any) => p.level === '部门规章')).toBe(true);
    });
  });

  describe('GET /policies/:id', () => {
    it('should get policy by id', () => {
      return request(app.getHttpServer())
        .get(`/policies/${createdPolicyId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdPolicyId);
          expect(res.body.title).toBe('测试政策');
        });
    });

    it('should return 404 for non-existent policy', () => {
      return request(app.getHttpServer())
        .get('/policies/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('PUT /policies/:id', () => {
    it('should update a policy', () => {
      return request(app.getHttpServer())
        .put(`/policies/${createdPolicyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: '更新后的测试政策',
          description: '更新后的描述',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('更新后的测试政策');
          expect(res.body.description).toBe('更新后的描述');
        });
    });
  });

  describe('GET /policies/:id/clauses', () => {
    it('should get policy clauses', () => {
      return request(app.getHttpServer())
        .get(`/policies/${createdPolicyId}/clauses`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('GET /policies/stats', () => {
    it('should get policy statistics', () => {
      return request(app.getHttpServer())
        .get('/policies/stats')
        .expect(200)
        .expect((res) => {
          expect(res.body.total).toBeDefined();
          expect(res.body.byLevel).toBeDefined();
          expect(res.body.byIndustry).toBeDefined();
        });
    });
  });

  describe('DELETE /policies/:id', () => {
    it('should delete a policy', () => {
      return request(app.getHttpServer())
        .delete(`/policies/${createdPolicyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });

    it('should return 404 for deleted policy', () => {
      return request(app.getHttpServer())
        .get(`/policies/${createdPolicyId}`)
        .expect(404);
    });
  });
});
