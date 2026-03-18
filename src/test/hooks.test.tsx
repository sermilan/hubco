import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePolicies, useCOUs, useCurrentUser } from '../app/hooks/useApi';

// Mock API 模块
vi.mock('../app/services/api', () => ({
  api: {
    policy: {
      getAll: vi.fn(),
    },
    cou: {
      getAll: vi.fn(),
    },
    auth: {
      getCurrentUser: vi.fn(),
    },
  },
}));

import { api } from '../app/services/api';

describe('React Hooks', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('usePolicies', () => {
    it('should fetch policies on mount', async () => {
      const mockResponse = {
        items: [
          { id: '1', title: '数据安全法', level: '法律' },
          { id: '2', title: '个人信息保护法', level: '法律' },
        ],
        total: 2,
        page: 1,
        limit: 20,
      };

      vi.mocked(api.policy.getAll).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => usePolicies({ keyword: '数据' }));

      // 初始状态应该是加载中
      expect(result.current.loading).toBe(true);

      // 等待数据加载完成
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.data?.items).toHaveLength(2);
      expect(result.current.data?.total).toBe(2);
      expect(api.policy.getAll).toHaveBeenCalledWith({ keyword: '数据' });
    });

    it('should handle error state', async () => {
      vi.mocked(api.policy.getAll).mockRejectedValueOnce(new Error('Server error'));

      const { result } = renderHook(() => usePolicies());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toBeTruthy();
      expect(result.current.error?.message).toBe('Server error');
    });

    it('should refetch data when called', async () => {
      const mockResponse1 = {
        items: [{ id: '1', title: '数据安全法' }],
        total: 1,
        page: 1,
        limit: 20,
      };

      const mockResponse2 = {
        items: [
          { id: '1', title: '数据安全法' },
          { id: '2', title: '个人信息保护法' },
        ],
        total: 2,
        page: 1,
        limit: 20,
      };

      vi.mocked(api.policy.getAll)
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2);

      const { result } = renderHook(() => usePolicies());

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.data?.total).toBe(1);

      // 调用 refetch
      await result.current.refetch();

      expect(result.current.data?.total).toBe(2);
    });
  });

  describe('useCOUs', () => {
    it('should fetch COUs with filters', async () => {
      const mockResponse = {
        items: [
          { id: '1', title: '数据分类义务', finalWeight: 9.5 },
          { id: '2', title: '加密存储义务', finalWeight: 8.5 },
        ],
        total: 2,
        page: 1,
        limit: 20,
      };

      vi.mocked(api.cou.getAll).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useCOUs({ weightRange: [8, 10] }));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.data?.items).toHaveLength(2);
      expect(result.current.data?.items[0].finalWeight).toBe(9.5);
    });
  });

  describe('useCurrentUser', () => {
    it('should return null when not authenticated', async () => {
      vi.mocked(api.auth.getCurrentUser).mockResolvedValueOnce(null);

      const { result } = renderHook(() => useCurrentUser());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.data).toBeNull();
    });

    it('should fetch user when authenticated', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      };

      vi.mocked(api.auth.getCurrentUser).mockResolvedValueOnce(mockUser as any);

      const { result } = renderHook(() => useCurrentUser());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.data?.email).toBe('test@example.com');
      expect(result.current.data?.name).toBe('Test User');
    });
  });
});
