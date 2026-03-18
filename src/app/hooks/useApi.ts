/**
 * React Hooks for API calls
 * 提供带缓存、加载状态、错误处理的API调用hooks
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { api, PolicyFilters, COUFilters, SceneFilters, SearchFilters } from '../services/api';
import type { Policy, COU, Scenario, User, Tag, Clause } from '../types';

// ==================== 通用Hook ====================

interface UseApiOptions<T> {
  initialData?: T;
  immediate?: boolean;
  deps?: unknown[];
}

interface UseApiResult<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  setData: (data: T) => void;
}

function useApi<T>(
  fetchFn: () => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const { initialData, immediate = true, deps = [] } = options;
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);
  const fetchRef = useRef(fetchFn);

  // Update ref when fetchFn changes
  fetchRef.current = fetchFn;

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchRef.current();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (immediate) {
      refetch();
    }
  }, deps);

  return { data, loading, error, refetch, setData };
}

// ==================== 认证Hooks ====================

export function useCurrentUser() {
  return useApi<User | null>(() => api.auth.getCurrentUser(), {
    initialData: null,
    immediate: true,
  });
}

// ==================== 政策Hooks ====================

export function usePolicies(filters?: PolicyFilters) {
  const fetchFn = useCallback(() => api.policy.getAll(filters), [JSON.stringify(filters)]);

  return useApi(fetchFn, {
    initialData: { items: [], total: 0, page: 1, limit: 20 },
    immediate: true,
    deps: [JSON.stringify(filters)],
  });
}

export function usePolicy(id: string | null) {
  const fetchFn = useCallback(
    () => (id ? api.policy.getById(id) : Promise.resolve(null)),
    [id]
  );

  return useApi(fetchFn, {
    initialData: null,
    immediate: !!id,
    deps: [id],
  });
}

export function usePolicyClauses(policyId: string | null) {
  const fetchFn = useCallback(
    () => (policyId ? api.policy.getClauses(policyId) : Promise.resolve([])),
    [policyId]
  );

  return useApi<Clause[]>(fetchFn, {
    initialData: [],
    immediate: !!policyId,
    deps: [policyId],
  });
}

export function usePolicyCOUs(policyId: string | null) {
  const fetchFn = useCallback(
    () => (policyId ? api.policy.getCOUs(policyId) : Promise.resolve([])),
    [policyId]
  );

  return useApi<COU[]>(fetchFn, {
    initialData: [],
    immediate: !!policyId,
    deps: [policyId],
  });
}

export function usePolicyStats() {
  return useApi(
    () => api.policy.getStats(),
    {
      initialData: { total: 0, byLevel: {}, byIndustry: {}, byRegion: {} },
      immediate: true,
    }
  );
}

// ==================== COU Hooks ====================

export function useCOUs(filters?: COUFilters) {
  const fetchFn = useCallback(() => api.cou.getAll(filters), [JSON.stringify(filters)]);

  return useApi(fetchFn, {
    initialData: { items: [], total: 0, page: 1, limit: 20 },
    immediate: true,
    deps: [JSON.stringify(filters)],
  });
}

export function useCOU(id: string | null) {
  const fetchFn = useCallback(
    () => (id ? api.cou.getById(id) : Promise.resolve(null)),
    [id]
  );

  return useApi(fetchFn, {
    initialData: null,
    immediate: !!id,
    deps: [id],
  });
}

export function useRelatedCOUs(couId: string | null) {
  const fetchFn = useCallback(
    () => (couId ? api.cou.getRelated(couId) : Promise.resolve([])),
    [couId]
  );

  return useApi<COU[]>(fetchFn, {
    initialData: [],
    immediate: !!couId,
    deps: [couId],
  });
}

export function useCOUStats() {
  return useApi(
    () => api.cou.getStats(),
    {
      initialData: {
        total: 0,
        byObligationType: {},
        byIndustry: {},
        byRegion: {},
      },
      immediate: true,
    }
  );
}

// ==================== 场景Hooks ====================

export function useScenarios(filters?: SceneFilters) {
  const fetchFn = useCallback(() => api.scenario.getAll(filters), [JSON.stringify(filters)]);

  return useApi(fetchFn, {
    initialData: { items: [], total: 0, page: 1, limit: 20 },
    immediate: true,
    deps: [JSON.stringify(filters)],
  });
}

export function useScenario(id: string | null) {
  const fetchFn = useCallback(
    () => (id ? api.scenario.getById(id) : Promise.resolve(null)),
    [id]
  );

  return useApi(fetchFn, {
    initialData: null,
    immediate: !!id,
    deps: [id],
  });
}

export function useScenarioTemplates() {
  return useApi<Scenario[]>(
    () => api.scenario.getTemplates(),
    {
      initialData: [],
      immediate: true,
    }
  );
}

export function useScenarioStats() {
  return useApi(
    () => api.scenario.getStats(),
    {
      initialData: {
        total: 0,
        byStatus: {},
        byIndustry: {},
        byRegion: {},
      },
      immediate: true,
    }
  );
}

// ==================== 标签Hooks ====================

export function useTags() {
  return useApi(
    () => api.tag.getAll(),
    {
      initialData: { items: [], total: 0, page: 1, limit: 50 },
      immediate: true,
    }
  );
}

export function useTagDimensions() {
  return useApi(
    () => api.tag.getDimensions(),
    {
      initialData: {
        objects: [],
        subjects: [],
        lifecycles: [],
        securities: [],
        actions: [],
      },
      immediate: true,
    }
  );
}

// ==================== 搜索Hooks ====================

export function useSearch(filters: SearchFilters) {
  const fetchFn = useCallback(() => api.search.search(filters), [JSON.stringify(filters)]);

  return useApi(fetchFn, {
    initialData: { items: [], total: 0, page: 1, limit: 20 },
    immediate: !!filters.keyword || !!filters.type?.length,
    deps: [JSON.stringify(filters)],
  });
}

export function useSearchSuggestions(keyword: string, debounceMs = 300) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!keyword) {
      setSuggestions([]);
      return;
    }

    setLoading(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        const result = await api.search.suggest(keyword, 10);
        setSuggestions(result);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [keyword, debounceMs]);

  return { suggestions, loading };
}

// ==================== 用户Hooks ====================

export function useUserSubscription() {
  return useApi(
    () => api.user.getSubscription(),
    {
      initialData: null,
      immediate: true,
    }
  );
}

export function useUserUsageStats() {
  return useApi(
    () => api.user.getUsageStats(),
    {
      initialData: { searches: 0, views: 0, exports: 0, apiCalls: 0 },
      immediate: true,
    }
  );
}

// ==================== 导出 ====================

export { useApi };
export default useApi;
