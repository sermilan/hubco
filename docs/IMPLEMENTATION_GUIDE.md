# 实施指南 - DataSec Hub 后端集成

## 🎉 前端完成情况

### ✅ 已完成的核心模块

#### 1. 用户界面层 (4/4)
- ✅ **Landing Page** - 营销着陆页，展示产品价值和订阅方案
- ✅ **Auth Page** - 统一登录注册页面，支持三种用户类型
- ✅ **Main App** - SaaS主应用，完整的业务功能
- ✅ **Admin Page** - 后台管理系统，完整的管理功能

#### 2. 主应用功能模块 (7/7)
- ✅ **COU Explorer** - COU浏览器，智能筛选和详情查看
- ✅ **Policy Explorer** - 政策浏览器，政策检索和版本管理
- ✅ **Scene Manager** - 场景管理器，预设模板和自定义场景
- ✅ **Scene Builder** - 场景构建器，可视化场景配置
- ✅ **Dashboard** - 企业控制台，使用统计和API管理
- ✅ **User Settings** - 用户设置，个人信息和订阅管理
- ✅ **API Documentation** - API文档，完整的接口说明和示例

#### 3. 后台管理模块 (4/4)
- ✅ **Policy Management** - 政策管理，新增/编辑/版本控制
- ✅ **COU Management** - COU管理，手动/AI智能提取
- ✅ **User Management** - 用户管理，订阅状态和权限控制
- ✅ **System Settings** - 系统设置，权重配置/标签字典/通知设置

#### 4. 核心组件 (10+)
- ✅ Header / Sidebar - 导航组件
- ✅ FilterPanel - 筛选面板
- ✅ ClauseCard / PolicyCard - 卡片组件
- ✅ PolicyDetail - 政策详情
- ✅ 完整的 UI 组件库 (基于 Radix UI)

### 📊 代码统计

- **总文件数**: 60+
- **组件数量**: 40+
- **代码行数**: 10,000+
- **类型定义**: 完整的 TypeScript 类型系统
- **模拟数据**: 完整的示例数据集

---

## 🚀 下一步：后端集成

### 阶段一：基础架构搭建

#### 1.1 技术栈选择

**推荐方案：**
```
- 后端框架: Node.js + Express / NestJS
- 数据库: PostgreSQL (主数据库)
- 搜索引擎: Elasticsearch (全文检索)
- 缓存: Redis
- 对象存储: MinIO / 阿里云OSS (文件存储)
- 认证: JWT + Passport
```

#### 1.2 数据库设计

**核心表结构：**

```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  user_type VARCHAR(20), -- '个人' | '企业' | '院校'
  status VARCHAR(20),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- 组织/企业表
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  industry VARCHAR(100),
  unified_social_credit_code VARCHAR(50),
  contact_person VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  created_at TIMESTAMP
);

-- 订阅表
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  plan_id VARCHAR(50), -- 'personal' | 'enterprise' | 'education'
  status VARCHAR(20), -- 'active' | 'trial' | 'expired'
  start_date DATE,
  end_date DATE,
  auto_renew BOOLEAN,
  created_at TIMESTAMP
);

-- 政策文件表
CREATE TABLE policies (
  id UUID PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  code VARCHAR(100),
  level VARCHAR(50), -- PolicyLevel
  issuer VARCHAR(255),
  publish_date DATE,
  effective_date DATE,
  status VARCHAR(20), -- 'draft' | 'published' | 'archived'
  version VARCHAR(20),
  full_text TEXT,
  file_url VARCHAR(500),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- 政策版本关系表
CREATE TABLE policy_versions (
  id UUID PRIMARY KEY,
  policy_id UUID REFERENCES policies(id),
  previous_version_id UUID REFERENCES policies(id),
  change_summary TEXT,
  created_at TIMESTAMP
);

-- COU表
CREATE TABLE cous (
  id UUID PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  policy_id UUID REFERENCES policies(id),
  source_clause_id UUID,
  obligation_type VARCHAR(20), -- '禁止性' | '强制性' | '推荐性' | '指导性'
  action_required TEXT,
  deadline VARCHAR(100),
  penalty TEXT,
  base_weight INTEGER,
  version VARCHAR(20),
  status VARCHAR(20), -- 'current' | 'superseded' | 'deprecated'
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- COU适用范围表
CREATE TABLE cou_applicability (
  id UUID PRIMARY KEY,
  cou_id UUID REFERENCES cous(id),
  industries JSONB, -- ['金融', '医疗']
  regions JSONB,    -- ['国内', '欧盟']
  user_types JSONB  -- ['中小企业', '上市公司']
);

-- COU关联关系表
CREATE TABLE cou_relationships (
  id UUID PRIMARY KEY,
  cou_id UUID REFERENCES cous(id),
  related_cou_id UUID REFERENCES cous(id),
  relationship_type VARCHAR(20) -- 'related' | 'depends_on' | 'conflicts'
);

-- 标签表
CREATE TABLE tags (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50), -- TagCategory
  color VARCHAR(50),
  weight INTEGER,
  created_at TIMESTAMP
);

-- COU标签关联表
CREATE TABLE cou_tags (
  id UUID PRIMARY KEY,
  cou_id UUID REFERENCES cous(id),
  tag_id UUID REFERENCES tags(id),
  is_auto BOOLEAN -- 是否为AI自动标签
);

-- 场景表
CREATE TABLE scenarios (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255),
  description TEXT,
  config JSONB, -- 场景配置信息
  is_template BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- 场景COU关联表
CREATE TABLE scenario_cous (
  id UUID PRIMARY KEY,
  scenario_id UUID REFERENCES scenarios(id),
  cou_id UUID REFERENCES cous(id),
  scenario_weight DECIMAL(4,2),
  final_weight DECIMAL(4,2)
);

-- API密钥表
CREATE TABLE api_keys (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255),
  key_hash VARCHAR(255) NOT NULL,
  secret_hash VARCHAR(255) NOT NULL,
  permissions JSONB,
  rate_limit INTEGER,
  status VARCHAR(20), -- 'active' | 'revoked'
  last_used_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP
);

-- 使用统计表
CREATE TABLE usage_stats (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  date DATE,
  api_calls INTEGER DEFAULT 0,
  cou_access INTEGER DEFAULT 0,
  scenarios_created INTEGER DEFAULT 0,
  created_at TIMESTAMP
);
```

#### 1.3 API端点实现

**核心API路由：**

```javascript
// routes/api/v1/index.js

// 认证相关
POST   /api/v1/auth/register       // 用户注册
POST   /api/v1/auth/login          // 用户登录
POST   /api/v1/auth/refresh        // 刷新Token
POST   /api/v1/auth/logout         // 登出

// 政策相关
GET    /api/v1/policies            // 获取政策列表
GET    /api/v1/policies/:id        // 获取政策详情
POST   /api/v1/policies            // 创建政策（管理员）
PUT    /api/v1/policies/:id        // 更新政策（管理员）
GET    /api/v1/policies/:id/versions // 获取政策版本历史
GET    /api/v1/policies/:id/clauses  // 获取政策条款

// COU相关
GET    /api/v1/cous                // 获取COU列表（支持筛选）
GET    /api/v1/cous/:id            // 获取COU详情
POST   /api/v1/cous                // 创建COU（管理员）
PUT    /api/v1/cous/:id            // 更新COU（管理员）
GET    /api/v1/cous/search         // 全文搜索COU
POST   /api/v1/cous/extract        // AI提取COU（管理员）

// 场景相关
GET    /api/v1/scenarios           // 获取用户场景列表
GET    /api/v1/scenarios/templates // 获取场景模板
GET    /api/v1/scenarios/:id       // 获取场景详情
POST   /api/v1/scenarios           // 创建场景
PUT    /api/v1/scenarios/:id       // 更新场景
DELETE /api/v1/scenarios/:id       // 删除场景
POST   /api/v1/scenarios/:id/analyze // 分析场景

// 标签相关
GET    /api/v1/tags                // 获取标签列表
POST   /api/v1/tags                // 创建标签（管理员）
PUT    /api/v1/tags/:id            // 更新标签（管理员）

// 用户相关
GET    /api/v1/users/me            // 获取当前用户信息
PUT    /api/v1/users/me            // 更新用户信息
GET    /api/v1/users/subscription  // 获取订阅信息
GET    /api/v1/users/usage         // 获取使用统计

// API密钥管理
GET    /api/v1/api-keys            // 获取API密钥列表
POST   /api/v1/api-keys            // 创建API密钥
DELETE /api/v1/api-keys/:id        // 删除API密钥

// 管理员相关
GET    /api/v1/admin/users         // 用户管理
GET    /api/v1/admin/stats         // 统计数据
PUT    /api/v1/admin/settings      // 系统设置
```

### 阶段二：核心功能实现

#### 2.1 认证与授权

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

// JWT认证中间件
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// 权限检查中间件
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};
```

#### 2.2 全文搜索实现

```javascript
// services/elasticsearch.js
const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: process.env.ELASTICSEARCH_URL
});

// 索引COU
const indexCOU = async (cou) => {
  await client.index({
    index: 'cous',
    id: cou.id,
    body: {
      code: cou.code,
      title: cou.title,
      description: cou.description,
      policy_title: cou.policyTitle,
      tags: cou.tags.map(t => t.name),
      obligation_type: cou.obligationType,
      base_weight: cou.baseWeight,
      industries: cou.applicableIndustries,
      regions: cou.applicableRegions
    }
  });
};

// 搜索COU
const searchCOUs = async (query, filters) => {
  const must = [];
  
  if (query) {
    must.push({
      multi_match: {
        query,
        fields: ['title^3', 'description^2', 'tags'],
        fuzziness: 'AUTO'
      }
    });
  }
  
  const filter = [];
  
  if (filters.industries?.length > 0) {
    filter.push({ terms: { industries: filters.industries } });
  }
  
  if (filters.obligationType) {
    filter.push({ term: { obligation_type: filters.obligationType } });
  }
  
  if (filters.weightRange) {
    filter.push({
      range: {
        base_weight: {
          gte: filters.weightRange[0],
          lte: filters.weightRange[1]
        }
      }
    });
  }
  
  const result = await client.search({
    index: 'cous',
    body: {
      query: {
        bool: { must, filter }
      },
      sort: [
        { base_weight: 'desc' },
        '_score'
      ]
    }
  });
  
  return result.hits.hits.map(hit => hit._source);
};
```

#### 2.3 场景权重计算

```javascript
// services/scenario-calculator.js

const calculateScenarioWeight = (cou, scenario) => {
  let scenarioWeight = 0;
  
  // 1. 标签匹配权重
  const matchedTags = cou.tags.filter(tag => 
    scenario.tags.includes(tag.id)
  );
  scenarioWeight += matchedTags.length * 0.5;
  
  // 2. 行业匹配权重
  const industryMatch = scenario.industries.some(ind =>
    cou.applicableIndustries.includes(ind)
  );
  if (industryMatch) {
    scenarioWeight += 1.0;
  }
  
  // 3. 区域匹配权重
  const regionMatch = scenario.regions.some(reg =>
    cou.applicableRegions.includes(reg)
  );
  if (regionMatch) {
    scenarioWeight += 0.8;
  }
  
  // 4. 用户类型匹配权重
  const userTypeMatch = scenario.userTypes.some(type =>
    cou.applicableUserTypes.includes(type)
  );
  if (userTypeMatch) {
    scenarioWeight += 0.6;
  }
  
  // 计算最终权重
  const finalWeight = cou.baseWeight + scenarioWeight;
  
  return {
    scenarioWeight,
    finalWeight: Math.min(finalWeight, 10) // 最高10分
  };
};

// 分析场景
const analyzeScenario = async (scenarioId) => {
  const scenario = await Scenario.findById(scenarioId);
  const allCOUs = await COU.find({ status: 'current' });
  
  const scoredCOUs = allCOUs.map(cou => {
    const weights = calculateScenarioWeight(cou, scenario);
    return {
      ...cou.toObject(),
      scenarioWeight: weights.scenarioWeight,
      finalWeight: weights.finalWeight
    };
  });
  
  // 按最终权重排序
  scoredCOUs.sort((a, b) => b.finalWeight - a.finalWeight);
  
  // 统计分析
  const analysis = {
    totalCOUs: scoredCOUs.length,
    criticalCOUs: scoredCOUs.filter(c => c.finalWeight >= 9).length,
    highCOUs: scoredCOUs.filter(c => c.finalWeight >= 7 && c.finalWeight < 9).length,
    mediumCOUs: scoredCOUs.filter(c => c.finalWeight >= 5 && c.finalWeight < 7).length,
    lowCOUs: scoredCOUs.filter(c => c.finalWeight < 5).length,
    avgWeight: scoredCOUs.reduce((sum, c) => sum + c.finalWeight, 0) / scoredCOUs.length,
    weightDistribution: calculateDistribution(scoredCOUs),
    topCOUs: scoredCOUs.slice(0, 20)
  };
  
  return analysis;
};
```

### 阶段三：AI功能集成

#### 3.1 AI提取COU

```javascript
// services/ai-extractor.js
const { Configuration, OpenAIApi } = require('openai');

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY
}));

const extractCOUs = async (policyText, policyMetadata) => {
  const prompt = `
请从以下政策文本中提取合规义务单元（COU）。

政策信息：
- 名称：${policyMetadata.title}
- 级别：${policyMetadata.level}
- 发布机构：${policyMetadata.issuer}

政策全文：
${policyText}

请按以下格式提取每个合规义务：
{
  "title": "义务简述",
  "description": "详细描述",
  "obligationType": "禁止性|强制性|推荐性|指导性",
  "actionRequired": "要求的具体行动",
  "deadline": "期限要求（如有）",
  "penalty": "违规后果（如有）",
  "applicableIndustries": ["行业1", "行业2"],
  "tags": ["标签1", "标签2"],
  "technicalMeasures": ["技术措施1"],
  "organizationalMeasures": ["组织措施1"]
}
`;

  const response = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "你是一个专业的数据安全合规专家，擅长分析政策法规并提取合规义务。"
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.3
  });

  const extractedCOUs = JSON.parse(response.data.choices[0].message.content);
  
  // 为每个COU生成编码
  const cousWithCodes = extractedCOUs.map((cou, index) => ({
    ...cou,
    code: generateCOUCode(policyMetadata, index),
    policyId: policyMetadata.id,
    baseWeight: POLICY_LEVEL_WEIGHTS[policyMetadata.level],
    version: '1.0',
    status: 'current'
  }));
  
  return cousWithCodes;
};
```

#### 3.2 智能标签推荐

```javascript
// services/tag-recommender.js

const recommendTags = async (couText) => {
  // 使用词频分析和预训练模型推荐标签
  const response = await openai.createEmbedding({
    model: "text-embedding-ada-002",
    input: couText
  });
  
  const embedding = response.data.data[0].embedding;
  
  // 计算与现有标签的相似度
  const allTags = await Tag.find();
  const similarities = await Promise.all(
    allTags.map(async tag => {
      const tagEmbedding = await getTagEmbedding(tag.id);
      const similarity = cosineSimilarity(embedding, tagEmbedding);
      return { tag, similarity };
    })
  );
  
  // 返回相似度最高的标签
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5)
    .map(s => s.tag);
};
```

### 阶段四：性能优化

#### 4.1 缓存策略

```javascript
// config/redis.js
const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

// 缓存中间件
const cacheMiddleware = (duration = 3600) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    
    try {
      const cached = await redis.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      // 重写res.json以缓存结果
      const originalJson = res.json.bind(res);
      res.json = (data) => {
        redis.setex(key, duration, JSON.stringify(data));
        return originalJson(data);
      };
      
      next();
    } catch (error) {
      next();
    }
  };
};

// 使用示例
app.get('/api/v1/policies', cacheMiddleware(3600), getPolicies);
```

#### 4.2 数据库优化

```sql
-- 创建索引
CREATE INDEX idx_cous_policy_id ON cous(policy_id);
CREATE INDEX idx_cous_status ON cous(status);
CREATE INDEX idx_cous_base_weight ON cous(base_weight DESC);
CREATE INDEX idx_policies_level ON policies(level);
CREATE INDEX idx_policies_effective_date ON policies(effective_date DESC);

-- 创建全文搜索索引
CREATE INDEX idx_cous_fulltext ON cous USING gin(to_tsvector('chinese', title || ' ' || description));
CREATE INDEX idx_policies_fulltext ON policies USING gin(to_tsvector('chinese', title || ' ' || full_text));
```

---

## 📝 开发流程建议

### 第一周：基础设施
1. 搭建开发环境（Node.js, PostgreSQL, Redis, Elasticsearch）
2. 实现数据库schema和迁移脚本
3. 配置环境变量和部署配置
4. 实现基础认证和授权系统

### 第二周：核心API
1. 实现政策CRUD API
2. 实现COU CRUD API
3. 实现全文搜索功能
4. 实现基础的筛选和分页

### 第三周：场景和权重
1. 实现场景管理API
2. 实现权重计算逻辑
3. 实现场景分析功能
4. 前后端集成测试

### 第四周：AI和优化
1. 集成AI提取COU功能
2. 实现智能标签推荐
3. 添加缓存和性能优化
4. 完善错误处理和日志

---

## 🔗 前后端集成

### 环境配置

在前端项目中创建 `.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_WS_URL=ws://localhost:3000
```

### API客户端配置

```typescript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000
});

// 请求拦截器
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      // 处理未授权
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 数据获取示例

```typescript
// src/services/couService.ts
import api from './api';
import { COU, FilterCriteria } from '../types';

export const couService = {
  // 获取COU列表
  async getCOUs(filters: FilterCriteria): Promise<COU[]> {
    const response = await api.get('/cous', { params: filters });
    return response.data;
  },

  // 获取COU详情
  async getCOU(id: string): Promise<COU> {
    const response = await api.get(`/cous/${id}`);
    return response.data;
  },

  // 搜索COU
  async searchCOUs(query: string, filters?: FilterCriteria): Promise<COU[]> {
    const response = await api.get('/cous/search', {
      params: { q: query, ...filters }
    });
    return response.data;
  }
};
```

---

## 🎯 关键要点

1. **渐进式开发**: 先完成基础功能，再逐步添加AI等高级功能
2. **API优先**: 设计清晰的API接口，前后端并行开发
3. **性能优先**: 从一开始就考虑缓存和索引优化
4. **安全第一**: 实现完善的认证授权和数据验证
5. **文档完善**: 维护API文档，使用Swagger/OpenAPI

---

## 📚 推荐资源

- **NestJS文档**: https://nestjs.com/
- **PostgreSQL文档**: https://www.postgresql.org/docs/
- **Elasticsearch指南**: https://www.elastic.co/guide/
- **OpenAI API**: https://platform.openai.com/docs/
- **Redis最佳实践**: https://redis.io/docs/

---

**祝开发顺利！如有问题，请参考代码注释或联系技术团队。** 🚀
