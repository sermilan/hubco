import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AIController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

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
        email: 'ai-test@example.com',
        password: 'password123',
        name: 'AI Test',
      });

    authToken = authResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /ai/status', () => {
    it('should get AI service status', () => {
      return request(app.getHttpServer())
        .get('/ai/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.currentProvider).toBeDefined();
          expect(res.body.availableProviders).toBeDefined();
          expect(Array.isArray(res.body.availableProviders)).toBe(true);
        });
    });
  });

  describe('POST /ai/extract-cous', () => {
    it('should extract COUs from text', () => {
      return request(app.getHttpServer())
        .post('/ai/extract-cous')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: '数据处理者应当建立健全全流程数据安全管理制度。数据处理者不得泄露、篡改、毁损其收集的个人信息。',
          policyTitle: '测试政策',
          mode: 'standard',
          maxCount: 10,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.cous).toBeDefined();
          expect(Array.isArray(res.body.cous)).toBe(true);
          expect(res.body.totalTokens).toBeDefined();
          expect(res.body.provider).toBeDefined();
        });
    });

    it('should fail without text', () => {
      return request(app.getHttpServer())
        .post('/ai/extract-cous')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('POST /ai/recommend-tags', () => {
    it('should recommend tags for content', () => {
      return request(app.getHttpServer())
        .post('/ai/recommend-tags')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: '本政策规定了个人信息处理者在收集、存储、使用个人信息时应遵守的安全要求，包括数据加密、访问控制、安全评估等措施。',
          contentType: 'policy',
          limit: 5,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.tags).toBeDefined();
          expect(Array.isArray(res.body.tags)).toBe(true);
          expect(res.body.totalTokens).toBeDefined();
          expect(res.body.provider).toBeDefined();
        });
    });
  });

  describe('POST /ai/recommend-scenes', () => {
    it('should recommend scenes based on description', () => {
      return request(app.getHttpServer())
        .post('/ai/recommend-scenes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: '我们是一家游戏公司，需要将用户数据存储在海外服务器，涉及跨境数据传输。',
          industry: '游戏',
          region: '海外',
          limit: 3,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.scenes).toBeDefined();
          expect(Array.isArray(res.body.scenes)).toBe(true);
          expect(res.body.totalTokens).toBeDefined();
          expect(res.body.provider).toBeDefined();
        });
    });
  });

  describe('POST /ai/summarize', () => {
    it('should summarize content', () => {
      return request(app.getHttpServer())
        .post('/ai/summarize')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: '《数据安全法》是为了规范数据处理活动，保障数据安全，促进数据开发利用，保护个人、组织的合法权益，维护国家主权、安全和发展利益，制定的法律。本法所称数据，是指任何以电子或者其他方式对信息的记录。',
          length: 'medium',
          format: 'structured',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.summary).toBeDefined();
          expect(res.body.summary.summary).toBeDefined();
          expect(res.body.summary.keyPoints).toBeDefined();
          expect(Array.isArray(res.body.summary.keyPoints)).toBe(true);
          expect(res.body.totalTokens).toBeDefined();
          expect(res.body.provider).toBeDefined();
        });
    });
  });

  describe('POST /ai/chat', () => {
    it('should answer compliance questions', () => {
      return request(app.getHttpServer())
        .post('/ai/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: '什么是COU？',
          contextType: 'general',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.response).toBeDefined();
          expect(res.body.response.answer).toBeDefined();
          expect(res.body.response.sources).toBeDefined();
          expect(res.body.totalTokens).toBeDefined();
          expect(res.body.provider).toBeDefined();
        });
    });
  });

  describe('GET /ai/usage-stats', () => {
    it('should get AI usage statistics', () => {
      return request(app.getHttpServer())
        .get('/ai/usage-stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.totalCalls).toBeDefined();
          expect(res.body.monthlyCalls).toBeDefined();
          expect(res.body.totalTokens).toBeDefined();
          expect(res.body.monthlyTokens).toBeDefined();
          expect(res.body.byFeature).toBeDefined();
          expect(res.body.byProvider).toBeDefined();
        });
    });
  });
});
