/**
 * API服务层 - 支持真实API和Mock数据切换
 *
 * 配置方式:
 * - 环境变量 VITE_USE_MOCK_API=true 使用Mock数据
 * - 否则使用真实后端API (http://localhost:3000)
 */

import type {
  COU,
  Policy,
  Scenario,
  User,
  Subscription,
  ApiKey,
  Tag,
  Clause,
} from "../types";
import {
  MOCK_COUS,
  MOCK_POLICIES,
  MOCK_SCENARIOS,
  MOCK_SUBSCRIPTION,
  MOCK_API_KEYS,
  MOCK_USAGE_STATS,
  TAGS,
} from "../data/mockData";

// ==================== 配置 ====================

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true' || false;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// ==================== 工具函数 ====================

const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

const getAuthToken = () => {
  return localStorage.getItem('auth_token') || '';
};

// ==================== 真实API请求 ====================

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// ==================== 认证API ====================

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  organizationName?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authAPI = {
  async register(userData: RegisterData): Promise<AuthResponse> {
    if (USE_MOCK) {
      await delay(500);
      const token = 'mock_token_' + Math.random().toString(36);
      localStorage.setItem('auth_token', token);

      return {
        user: {
          id: `user-${Date.now()}`,
          email: userData.email,
          name: userData.name || '',
          role: 'user',
          createdAt: new Date().toISOString(),
        } as User,
        accessToken: token,
        refreshToken: 'mock_refresh_' + Math.random().toString(36),
      };
    }

    const response = await request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    localStorage.setItem('auth_token', response.accessToken);
    localStorage.setItem('refresh_token', response.refreshToken);
    return response;
  },

  async login(credentials: LoginData): Promise<AuthResponse> {
    if (USE_MOCK) {
      await delay(500);
      const token = 'mock_token_' + Math.random().toString(36);
      localStorage.setItem('auth_token', token);

      return {
        user: {
          id: 'user-1',
          email: credentials.email,
          name: '测试用户',
          role: 'user',
          createdAt: new Date().toISOString(),
        } as User,
        accessToken: token,
        refreshToken: 'mock_refresh_' + Math.random().toString(36),
      };
    }

    const response = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    localStorage.setItem('auth_token', response.accessToken);
    localStorage.setItem('refresh_token', response.refreshToken);
    return response;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');

    if (USE_MOCK) {
      await delay();
      return;
    }

    try {
      await request('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore error on logout
    }
  },

  async refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
    if (USE_MOCK) {
      await delay();
      const token = 'mock_token_' + Math.random().toString(36);
      localStorage.setItem('auth_token', token);
      return { accessToken: token, refreshToken: 'mock_refresh_' + Math.random().toString(36) };
    }

    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await request<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    localStorage.setItem('auth_token', response.accessToken);
    localStorage.setItem('refresh_token', response.refreshToken);
    return response;
  },

  async getCurrentUser(): Promise<User | null> {
    const token = getAuthToken();
    if (!token) return null;

    if (USE_MOCK) {
      await delay();
      return null;
    }

    try {
      return await request<User>('/auth/me');
    } catch {
      return null;
    }
  },
};

// ==================== 政策API ====================

export interface PolicyListResponse {
  items: Policy[];
  total: number;
  page: number;
  limit: number;
}

export interface PolicyFilters {
  keyword?: string;
  levels?: string[];
  industries?: string[];
  regions?: string[];
  effectiveDateStart?: string;
  effectiveDateEnd?: string;
  page?: number;
  limit?: number;
}

export const policyAPI = {
  async getAll(filters?: PolicyFilters): Promise<PolicyListResponse> {
    if (USE_MOCK) {
      await delay();

      let filtered = [...MOCK_POLICIES];

      if (filters?.keyword) {
        const keyword = filters.keyword.toLowerCase();
        filtered = filtered.filter(p =>
          p.title.toLowerCase().includes(keyword) ||
          p.code.toLowerCase().includes(keyword)
        );
      }

      if (filters?.levels?.length) {
        filtered = filtered.filter(p => filters.levels!.includes(p.level));
      }

      if (filters?.industries?.length) {
        filtered = filtered.filter(p =>
          p.industries.some(i => filters.industries!.includes(i))
        );
      }

      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const start = (page - 1) * limit;
      const end = start + limit;

      return {
        items: filtered.slice(start, end),
        total: filtered.length,
        page,
        limit,
      };
    }

    const params = new URLSearchParams();
    if (filters?.keyword) params.append('keyword', filters.keyword);
    if (filters?.levels) filters.levels.forEach(l => params.append('levels', l));
    if (filters?.industries) filters.industries.forEach(i => params.append('industries', i));
    if (filters?.regions) filters.regions.forEach(r => params.append('regions', r));
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const query = params.toString();
    return request<PolicyListResponse>(`/policies${query ? `?${query}` : ''}`);
  },

  async getById(id: string): Promise<Policy | null> {
    if (USE_MOCK) {
      await delay();
      return MOCK_POLICIES.find(p => p.id === id) || null;
    }

    try {
      return await request<Policy>(`/policies/${id}`);
    } catch {
      return null;
    }
  },

  async getStats(): Promise<{
    total: number;
    byLevel: Record<string, number>;
    byIndustry: Record<string, number>;
    byRegion: Record<string, number>;
  }> {
    if (USE_MOCK) {
      await delay();
      return {
        total: MOCK_POLICIES.length,
        byLevel: {},
        byIndustry: {},
        byRegion: {},
      };
    }

    return request('/policies/stats');
  },

  async getClauses(id: string): Promise<Clause[]> {
    if (USE_MOCK) {
      await delay();
      const policy = MOCK_POLICIES.find(p => p.id === id);
      return policy?.clauses || [];
    }

    return request<Clause[]>(`/policies/${id}/clauses`);
  },

  async getCOUs(id: string): Promise<COU[]> {
    if (USE_MOCK) {
      await delay();
      return MOCK_COUS.filter(c => c.policyId === id);
    }

    return request<COU[]>(`/policies/${id}/cous`);
  },

  async create(policyData: Partial<Policy>): Promise<Policy> {
    if (USE_MOCK) {
      await delay();
      return { ...policyData, id: `policy-${Date.now()}` } as Policy;
    }

    return request<Policy>('/policies', {
      method: 'POST',
      body: JSON.stringify(policyData),
    });
  },

  async update(id: string, policyData: Partial<Policy>): Promise<Policy> {
    if (USE_MOCK) {
      await delay();
      const existing = MOCK_POLICIES.find(p => p.id === id);
      return { ...existing, ...policyData } as Policy;
    }

    return request<Policy>(`/policies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(policyData),
    });
  },

  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      await delay();
      return;
    }

    return request<void>(`/policies/${id}`, { method: 'DELETE' });
  },
};

// ==================== COU API ====================

export interface COUListResponse {
  items: COU[];
  total: number;
  page: number;
  limit: number;
}

export interface COUFilters {
  keyword?: string;
  policyId?: string;
  obligationTypes?: string[];
  applicableIndustries?: string[];
  applicableRegions?: string[];
  weightRange?: [number, number];
  page?: number;
  limit?: number;
}

export const couAPI = {
  async getAll(filters?: COUFilters): Promise<COUListResponse> {
    if (USE_MOCK) {
      await delay();

      let filtered = [...MOCK_COUS];

      if (filters?.keyword) {
        const keyword = filters.keyword.toLowerCase();
        filtered = filtered.filter(c =>
          c.title.toLowerCase().includes(keyword) ||
          c.description.toLowerCase().includes(keyword)
        );
      }

      if (filters?.policyId) {
        filtered = filtered.filter(c => c.policyId === filters.policyId);
      }

      if (filters?.weightRange) {
        filtered = filtered.filter(c =>
          c.finalWeight >= filters.weightRange![0] &&
          c.finalWeight <= filters.weightRange![1]
        );
      }

      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const start = (page - 1) * limit;
      const end = start + limit;

      return {
        items: filtered.slice(start, end),
        total: filtered.length,
        page,
        limit,
      };
    }

    const params = new URLSearchParams();
    if (filters?.keyword) params.append('keyword', filters.keyword);
    if (filters?.policyId) params.append('policyId', filters.policyId);
    if (filters?.obligationTypes) filters.obligationTypes.forEach(t => params.append('obligationTypes', t));
    if (filters?.applicableIndustries) filters.applicableIndustries.forEach(i => params.append('applicableIndustries', i));
    if (filters?.weightRange) {
      params.append('weightMin', String(filters.weightRange[0]));
      params.append('weightMax', String(filters.weightRange[1]));
    }
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const query = params.toString();
    return request<COUListResponse>(`/cous${query ? `?${query}` : ''}`);
  },

  async getById(id: string): Promise<COU | null> {
    if (USE_MOCK) {
      await delay();
      return MOCK_COUS.find(c => c.id === id) || null;
    }

    try {
      return await request<COU>(`/cous/${id}`);
    } catch {
      return null;
    }
  },

  async getStats(): Promise<{
    total: number;
    byObligationType: Record<string, number>;
    byIndustry: Record<string, number>;
    byRegion: Record<string, number>;
  }> {
    if (USE_MOCK) {
      await delay();
      return {
        total: MOCK_COUS.length,
        byObligationType: {},
        byIndustry: {},
        byRegion: {},
      };
    }

    return request('/cous/stats');
  },

  async getRelated(id: string): Promise<COU[]> {
    if (USE_MOCK) {
      await delay();
      const cou = MOCK_COUS.find(c => c.id === id);
      if (!cou) return [];
      return MOCK_COUS.filter(c =>
        c.id !== id &&
        c.policyId === cou.policyId
      ).slice(0, 5);
    }

    return request<COU[]>(`/cous/${id}/related`);
  },

  async search(query: string, filters?: COUFilters): Promise<COUListResponse> {
    return this.getAll({ ...filters, keyword: query });
  },

  async create(couData: Partial<COU>): Promise<COU> {
    if (USE_MOCK) {
      await delay();
      return { ...couData, id: `cou-${Date.now()}` } as COU;
    }

    return request<COU>('/cous', {
      method: 'POST',
      body: JSON.stringify(couData),
    });
  },

  async update(id: string, couData: Partial<COU>): Promise<COU> {
    if (USE_MOCK) {
      await delay();
      const existing = MOCK_COUS.find(c => c.id === id);
      return { ...existing, ...couData } as COU;
    }

    return request<COU>(`/cous/${id}`, {
      method: 'PUT',
      body: JSON.stringify(couData),
    });
  },

  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      await delay();
      return;
    }

    return request<void>(`/cous/${id}`, { method: 'DELETE' });
  },
};

// ==================== 场景API ====================

export interface SceneListResponse {
  items: Scenario[];
  total: number;
  page: number;
  limit: number;
}

export interface SceneFilters {
  keyword?: string;
  status?: 'draft' | 'active' | 'archived';
  industry?: string;
  region?: string;
  templateId?: string;
  isPublic?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export const scenarioAPI = {
  async getAll(filters?: SceneFilters): Promise<SceneListResponse> {
    if (USE_MOCK) {
      await delay();

      let filtered = [...MOCK_SCENARIOS];

      if (filters?.keyword) {
        const keyword = filters.keyword.toLowerCase();
        filtered = filtered.filter(s => s.name.toLowerCase().includes(keyword));
      }

      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const start = (page - 1) * limit;
      const end = start + limit;

      return {
        items: filtered.slice(start, end),
        total: filtered.length,
        page,
        limit,
      };
    }

    const params = new URLSearchParams();
    if (filters?.keyword) params.append('keyword', filters.keyword);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const query = params.toString();
    return request<SceneListResponse>(`/scenes${query ? `?${query}` : ''}`);
  },

  async getById(id: string): Promise<Scenario | null> {
    if (USE_MOCK) {
      await delay();
      return MOCK_SCENARIOS.find(s => s.id === id) || null;
    }

    try {
      return await request<Scenario>(`/scenes/${id}`);
    } catch {
      return null;
    }
  },

  async create(scenarioData: Partial<Scenario>): Promise<Scenario> {
    if (USE_MOCK) {
      await delay();
      return {
        ...scenarioData,
        id: `scenario-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Scenario;
    }

    return request<Scenario>('/scenes', {
      method: 'POST',
      body: JSON.stringify(scenarioData),
    });
  },

  async update(id: string, scenarioData: Partial<Scenario>): Promise<Scenario> {
    if (USE_MOCK) {
      await delay();
      const existing = MOCK_SCENARIOS.find(s => s.id === id);
      return { ...existing, ...scenarioData, updatedAt: new Date().toISOString() } as Scenario;
    }

    return request<Scenario>(`/scenes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(scenarioData),
    });
  },

  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      await delay();
      return;
    }

    return request<void>(`/scenes/${id}`, { method: 'DELETE' });
  },

  async clone(id: string, newName?: string): Promise<Scenario> {
    if (USE_MOCK) {
      await delay();
      const existing = MOCK_SCENARIOS.find(s => s.id === id);
      return {
        ...existing,
        id: `scenario-${Date.now()}`,
        name: newName || `${existing?.name} (复制)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Scenario;
    }

    return request<Scenario>(`/scenes/${id}/clone`, {
      method: 'POST',
      body: JSON.stringify({ name: newName }),
    });
  },

  async createVersion(id: string, notes?: string): Promise<Scenario> {
    if (USE_MOCK) {
      await delay();
      return this.getById(id) as Promise<Scenario>;
    }

    return request<Scenario>(`/scenes/${id}/versions`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  },

  async getStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byIndustry: Record<string, number>;
    byRegion: Record<string, number>;
  }> {
    if (USE_MOCK) {
      await delay();
      return {
        total: MOCK_SCENARIOS.length,
        byStatus: {},
        byIndustry: {},
        byRegion: {},
      };
    }

    return request('/scenes/stats/overview');
  },

  async getTemplates(): Promise<Scenario[]> {
    if (USE_MOCK) {
      await delay();
      return MOCK_SCENARIOS.filter(s => s.isTemplate);
    }

    return request<Scenario[]>('/scenes/templates/list');
  },

  async createFromTemplate(templateId: string, customizations?: {
    name?: string;
    description?: string;
    industry?: string;
    region?: string;
  }): Promise<Scenario> {
    if (USE_MOCK) {
      await delay();
      const template = MOCK_SCENARIOS.find(s => s.id === templateId);
      return {
        ...template,
        id: `scenario-${Date.now()}`,
        name: customizations?.name || template?.name || '新场景',
        isTemplate: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Scenario;
    }

    return request<Scenario>(`/scenes/from-template/${templateId}`, {
      method: 'POST',
      body: JSON.stringify(customizations),
    });
  },
};

// ==================== 标签API ====================

export interface TagListResponse {
  items: Tag[];
  total: number;
  page: number;
  limit: number;
}

export const tagAPI = {
  async getAll(): Promise<TagListResponse> {
    if (USE_MOCK) {
      await delay();
      return {
        items: TAGS,
        total: TAGS.length,
        page: 1,
        limit: TAGS.length,
      };
    }

    return request<TagListResponse>('/tags');
  },

  async getById(id: string): Promise<Tag | null> {
    if (USE_MOCK) {
      await delay();
      return TAGS.find(t => t.id === id) || null;
    }

    try {
      return await request<Tag>(`/tags/${id}`);
    } catch {
      return null;
    }
  },

  async create(tagData: Partial<Tag>): Promise<Tag> {
    if (USE_MOCK) {
      await delay();
      return { ...tagData, id: `tag-${Date.now()}` } as Tag;
    }

    return request<Tag>('/tags', {
      method: 'POST',
      body: JSON.stringify(tagData),
    });
  },

  async update(id: string, tagData: Partial<Tag>): Promise<Tag> {
    if (USE_MOCK) {
      await delay();
      const existing = TAGS.find(t => t.id === id);
      return { ...existing, ...tagData } as Tag;
    }

    return request<Tag>(`/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tagData),
    });
  },

  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      await delay();
      return;
    }

    return request<void>(`/tags/${id}`, { method: 'DELETE' });
  },

  async getDimensions(): Promise<{
    objects: Tag[];
    subjects: Tag[];
    lifecycles: Tag[];
    securities: Tag[];
    actions: Tag[];
  }> {
    if (USE_MOCK) {
      await delay();
      return {
        objects: TAGS.slice(0, 3),
        subjects: TAGS.slice(3, 6),
        lifecycles: TAGS.slice(6, 9),
        securities: TAGS.slice(9, 12),
        actions: TAGS.slice(12, 14),
      };
    }

    return request('/tags/dimensions/all');
  },
};

// ==================== 搜索API ====================

export interface SearchFilters {
  keyword?: string;
  type?: ('policy' | 'cou' | 'clause')[];
  levels?: string[];
  industries?: string[];
  regions?: string[];
  tags?: string[];
  weightMin?: number;
  weightMax?: number;
  page?: number;
  limit?: number;
}

export interface SearchResult {
  items: (Policy | COU | Clause)[];
  total: number;
  page: number;
  limit: number;
}

export const searchAPI = {
  async search(filters: SearchFilters): Promise<SearchResult> {
    if (USE_MOCK) {
      await delay();

      let results: (Policy | COU | Clause)[] = [];

      if (!filters.type || filters.type.includes('policy')) {
        results = [...results, ...MOCK_POLICIES];
      }
      if (!filters.type || filters.type.includes('cou')) {
        results = [...results, ...MOCK_COUS];
      }

      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        results = results.filter((item: any) =>
          (item.title || item.name)?.toLowerCase().includes(keyword) ||
          item.description?.toLowerCase().includes(keyword)
        );
      }

      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const start = (page - 1) * limit;
      const end = start + limit;

      return {
        items: results.slice(start, end),
        total: results.length,
        page,
        limit,
      };
    }

    const params = new URLSearchParams();
    if (filters.keyword) params.append('keyword', filters.keyword);
    if (filters.type) filters.type.forEach(t => params.append('type', t));
    if (filters.levels) filters.levels.forEach(l => params.append('levels', l));
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const query = params.toString();
    return request<SearchResult>(`/search${query ? `?${query}` : ''}`);
  },

  async suggest(keyword: string, size?: number): Promise<string[]> {
    if (USE_MOCK) {
      await delay();
      return ['个人信息保护', '数据出境', '安全评估', '加密要求', '网络安全'];
    }

    const params = new URLSearchParams();
    params.append('q', keyword);
    if (size) params.append('size', String(size));

    return request<string[]>(`/search/suggest?${params.toString()}`);
  },
};

// ==================== 用户API ====================

export const userAPI = {
  async getCurrentUser(): Promise<User | null> {
    return authAPI.getCurrentUser();
  },

  async update(userData: Partial<User>): Promise<User> {
    if (USE_MOCK) {
      await delay();
      return userData as User;
    }

    return request<User>('/user-settings/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  async getSubscription(): Promise<Subscription> {
    if (USE_MOCK) {
      await delay();
      return MOCK_SUBSCRIPTION;
    }

    // 订阅现在免费，返回固定数据
    return {
      id: 'sub-free',
      plan: '免费版',
      status: 'active',
      maxPolicies: -1,
      maxScenarios: -1,
      maxAPICalls: -1,
      features: ['全量政策库', '智能检索', '场景构建', '合规分析'],
      validUntil: '2099-12-31',
    };
  },

  async getUsageStats(): Promise<{
    searches: number;
    views: number;
    exports: number;
    apiCalls: number;
  }> {
    if (USE_MOCK) {
      await delay();
      return MOCK_USAGE_STATS;
    }

    return request('/analytics/user/usage');
  },
};

// ==================== AI配置API ====================

export type AIProviderType = 'zhipu' | 'deepseek' | 'kimi' | 'baidu' | 'aliyun' | 'doubao';

export interface AIProviderInfo {
  type: AIProviderType;
  name: string;
  available: boolean;
  description: string;
  models: string[];
}

export interface AIConfig {
  provider: AIProviderType;
  apiKey?: string;
  apiSecret?: string;
  model?: string;
  baseUrl?: string;
  timeout?: number;
  fallbackChain?: AIProviderType[];
}

export interface AIStatus {
  currentProvider: AIProviderType;
  availableProviders: AIProviderInfo[];
  isConfigured: boolean;
  lastError?: string;
}

export const aiConfigAPI = {
  async getStatus(): Promise<AIStatus> {
    if (USE_MOCK) {
      await delay();
      return {
        currentProvider: 'zhipu',
        availableProviders: [
          { type: 'zhipu', name: '智谱AI', available: true, description: 'GLM-4系列模型', models: ['glm-4', 'glm-4-flash'] },
          { type: 'deepseek', name: 'DeepSeek', available: false, description: 'DeepSeek-V3/R1', models: ['deepseek-chat', 'deepseek-reasoner'] },
          { type: 'kimi', name: 'Kimi', available: false, description: 'Moonshot大模型', models: ['moonshot-v1-8k', 'moonshot-v1-32k'] },
          { type: 'baidu', name: '文心一言', available: false, description: '百度文心大模型', models: ['ernie-bot-4', 'ernie-bot-turbo'] },
          { type: 'aliyun', name: '通义千问', available: false, description: '阿里通义大模型', models: ['qwen-max', 'qwen-plus'] },
          { type: 'doubao', name: '豆包', available: false, description: '字节豆包大模型', models: ['doubao-pro', 'doubao-lite'] },
        ],
        isConfigured: false,
      };
    }

    return request<AIStatus>('/ai/status');
  },

  async getConfig(): Promise<AIConfig> {
    if (USE_MOCK) {
      await delay();
      return {
        provider: 'zhipu',
        model: 'glm-4',
        timeout: 30000,
        fallbackChain: ['zhipu', 'deepseek'],
      };
    }

    return request<AIConfig>('/ai/config');
  },

  async updateConfig(config: Partial<AIConfig>): Promise<AIConfig> {
    if (USE_MOCK) {
      await delay(800);
      return { ...config, provider: config.provider || 'zhipu' } as AIConfig;
    }

    return request<AIConfig>('/ai/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  },

  async testConnection(provider: AIProviderType, apiKey: string, apiSecret?: string): Promise<{ success: boolean; message: string }> {
    if (USE_MOCK) {
      await delay(1500);
      if (apiKey.length < 10) {
        return { success: false, message: 'API Key 无效，请检查配置' };
      }
      return { success: true, message: `${provider} 连接测试成功` };
    }

    return request<{ success: boolean; message: string }>('/ai/test-connection', {
      method: 'POST',
      body: JSON.stringify({ provider, apiKey, apiSecret }),
    });
  },
};

// ==================== API密钥管理 ====================

export const apiKeyAPI = {
  async getAll(): Promise<ApiKey[]> {
    if (USE_MOCK) {
      await delay();
      return MOCK_API_KEYS;
    }

    return request<ApiKey[]>('/user-settings/api-keys');
  },

  async create(keyData: Partial<ApiKey>): Promise<ApiKey> {
    if (USE_MOCK) {
      await delay();
      return {
        id: `key-${Date.now()}`,
        key: `pk_live_${Math.random().toString(36).substring(2)}`,
        createdAt: new Date().toISOString(),
        ...keyData,
      } as ApiKey;
    }

    return request<ApiKey>('/user-settings/api-keys', {
      method: 'POST',
      body: JSON.stringify(keyData),
    });
  },

  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      await delay();
      return;
    }

    return request<void>(`/user-settings/api-keys/${id}`, { method: 'DELETE' });
  },
};

// ==================== 统一导出 ====================

export const api = {
  auth: authAPI,
  policy: policyAPI,
  cou: couAPI,
  scenario: scenarioAPI,
  tag: tagAPI,
  search: searchAPI,
  user: userAPI,
  apiKey: apiKeyAPI,
  aiConfig: aiConfigAPI,
};

export default api;
