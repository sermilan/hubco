import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api, authAPI, policyAPI, couAPI, scenarioAPI } from '../app/services/api';

// 测试环境使用 mock
describe('API Services', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Auth API', () => {
    it('should store tokens after login', async () => {
      const mockResponse = {
        user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'user' },
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
      };

      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await authAPI.login({
        email: 'test@example.com',
        password: 'password',
      });

      expect(result.accessToken).toBe('mock_access_token');
      expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', 'mock_access_token');
    });

    it('should remove tokens on logout', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 204,
      } as Response);

      await authAPI.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refresh_token');
    });
  });

  describe('Policy API', () => {
    it('should fetch policies with filters', async () => {
      const mockPolicies = {
        items: [
          { id: '1', title: '数据安全法', level: '法律' },
          { id: '2', title: '个人信息保护法', level: '法律' },
        ],
        total: 2,
        page: 1,
        limit: 20,
      };

      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockPolicies,
      } as Response);

      const result = await policyAPI.getAll({ keyword: '数据', page: 1 });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should fetch policy by id', async () => {
      const mockPolicy = { id: '1', title: '数据安全法', level: '法律' };

      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockPolicy,
      } as Response);

      const result = await policyAPI.getById('1');

      expect(result?.title).toBe('数据安全法');
    });

    it('should return null for non-existent policy', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      const result = await policyAPI.getById('999');

      expect(result).toBeNull();
    });
  });

  describe('COU API', () => {
    it('should fetch COUs with filters', async () => {
      const mockCOUs = {
        items: [
          { id: '1', title: '数据分类义务', finalWeight: 9.5 },
          { id: '2', title: '加密存储义务', finalWeight: 8.5 },
        ],
        total: 2,
        page: 1,
        limit: 20,
      };

      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockCOUs,
      } as Response);

      const result = await couAPI.getAll({ weightRange: [8, 10] });

      expect(result.items).toHaveLength(2);
      expect(result.items[0].finalWeight).toBe(9.5);
    });

    it('should search COUs by keyword', async () => {
      const mockCOUs = {
        items: [{ id: '1', title: '数据出境评估', finalWeight: 9.0 }],
        total: 1,
        page: 1,
        limit: 20,
      };

      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockCOUs,
      } as Response);

      const result = await couAPI.search('出境');

      expect(result.items).toHaveLength(1);
      expect(result.items[0].title).toContain('出境');
    });
  });

  describe('Scenario API', () => {
    it('should create scenario', async () => {
      const mockScenario = {
        id: 'scene-1',
        name: '游戏出海场景',
        status: 'draft',
      };

      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockScenario,
      } as Response);

      const result = await scenarioAPI.create({ name: '游戏出海场景' });

      expect(result.name).toBe('游戏出海场景');
      expect(result.status).toBe('draft');
    });

    it('should clone scenario', async () => {
      const mockCloned = {
        id: 'scene-2',
        name: '游戏出海场景 (复制)',
        status: 'draft',
      };

      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockCloned,
      } as Response);

      const result = await scenarioAPI.clone('scene-1');

      expect(result.name).toContain('复制');
    });
  });

  describe('Error Handling', () => {
    it('should throw error on API failure', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ message: 'Server error' }),
      } as Response);

      await expect(policyAPI.getAll()).rejects.toThrow('Server error');
    });

    it('should throw error for network failure', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

      await expect(policyAPI.getAll()).rejects.toThrow('Network error');
    });
  });
});
