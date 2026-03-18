# API 集成指南

## 📖 概述

DataSec Policy Hub 提供 RESTful API 服务，支持企业将数据安全合规知识集成到本地系统、大模型或业务应用中。

**Base URL**：`https://api.datasec-hub.com/v1`

**认证方式**：API Key + Secret

---

## 🔑 认证

### 获取API密钥

1. 登录企业控制台
2. 进入"API密钥管理"
3. 点击"创建新密钥"
4. 保存API Key和API Secret

### 认证方式

所有API请求需要在Header中包含认证信息：

```http
Authorization: Bearer YOUR_API_KEY
X-API-Secret: YOUR_API_SECRET
Content-Type: application/json
```

### 请求签名（推荐用于生产环境）

为了增强安全性，建议使用请求签名：

```javascript
const crypto = require('crypto');

function generateSignature(method, path, timestamp, body, secret) {
  const payload = `${method}:${path}:${timestamp}:${JSON.stringify(body)}`;
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

// 使用示例
const timestamp = Date.now();
const signature = generateSignature('POST', '/api/v1/clauses/search', timestamp, requestBody, API_SECRET);

// 请求Header
headers: {
  'Authorization': `Bearer ${API_KEY}`,
  'X-Timestamp': timestamp,
  'X-Signature': signature,
  'Content-Type': 'application/json'
}
```

---

## 🌐 核心API接口

### 1. 政策检索

#### 1.1 获取政策列表

```http
GET /api/v1/policies
```

**查询参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 否 | 关键词搜索 |
| level | string | 否 | 政策级别（法律/行政法规/部门规章/国家标准/行业标准/地方性法规） |
| industry | string | 否 | 适用行业 |
| status | string | 否 | 状态（现行有效/已废止/已修订） |
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页数量，默认20，最大100 |

**请求示例**：

```bash
curl -X GET "https://api.datasec-hub.com/v1/policies?keyword=个人信息&level=法律&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "X-API-Secret: YOUR_API_SECRET"
```

**响应示例**：

```json
{
  "success": true,
  "data": [
    {
      "id": "p2",
      "title": "中华人民共和国个人信息保护法",
      "code": "中华人民共和国主席令第九十一号",
      "level": "法律",
      "industries": ["通用"],
      "publishOrg": "全国人民代表大会常务委员会",
      "publishDate": "2021-08-20",
      "effectiveDate": "2021-11-01",
      "status": "现行有效",
      "description": "为了保护个人信息权益...",
      "clauseCount": 74,
      "tags": [
        {"id": "1", "name": "个人信息保护", "color": "bg-blue-500"}
      ]
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

#### 1.2 获取政策详情

```http
GET /api/v1/policies/:id
```

**响应示例**：

```json
{
  "success": true,
  "data": {
    "id": "p2",
    "title": "中华人民共和国个人信息保护法",
    "fullText": "第一章 总则\n第一条 为了保护个人信息权益...",
    "relatedPolicies": ["p1", "p3"],
    "clauses": [
      {
        "id": "c4",
        "chapter": "第二章",
        "article": "第十三条",
        "content": "...",
        "weight": 10
      }
    ]
  }
}
```

### 2. 条款检索

#### 2.1 关键词检索

```http
GET /api/v1/clauses
```

**查询参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 是 | 搜索关键词 |
| policyId | string | 否 | 限定政策ID |
| weightMin | number | 否 | 最小权重（1-10） |
| weightMax | number | 否 | 最大权重（1-10） |
| complianceType | string | 否 | 合规类型（强制性/推荐性/指导性） |
| page | number | 否 | 页码 |
| limit | number | 否 | 每页数量 |

#### 2.2 语义搜索（AI增强）

```http
POST /api/v1/clauses/search
```

**请求体**：

```json
{
  "query": "数据出境需要满足什么条件",
  "searchMode": "semantic",
  "filters": {
    "industries": ["金融", "互联网"],
    "weightRange": [8, 10],
    "complianceType": "强制性"
  },
  "limit": 10
}
```

**响应示例**：

```json
{
  "success": true,
  "data": [
    {
      "id": "c5",
      "policyId": "p2",
      "policyTitle": "中华人民共和国个人信息保护法",
      "chapter": "第三章 个人信息跨境提供的规则",
      "article": "第三十八条",
      "content": "个人信息处理者因业务等需要，确需向中华人民共和国境外提供个人信息的...",
      "weight": 10,
      "complianceType": "强制性",
      "penalty": "由履行个人信息保护职责的部门责令改正...",
      "relevanceScore": 0.95,
      "tags": [
        {"id": "2", "name": "数据出境"},
        {"id": "3", "name": "安全评估"}
      ]
    }
  ],
  "total": 3,
  "searchTime": 0.12
}
```

### 3. 合规分析API

#### 3.1 合规检查

```http
POST /api/v1/compliance/check
```

**请求体**：

```json
{
  "description": "我们是一家互联网公司，需要将用户数据传输到新加坡的服务器进行处理",
  "industry": "互联网",
  "dataTypes": ["个人信息", "敏感个人信息"],
  "dataVolume": 150000
}
```

**响应示例**：

```json
{
  "success": true,
  "data": {
    "riskLevel": "high",
    "riskScore": 85,
    "applicableClauses": [
      {
        "clauseId": "c5",
        "title": "个人信息出境条件",
        "requirement": "需要通过安全评估",
        "priority": "必须"
      },
      {
        "clauseId": "c7",
        "title": "数据出境申报",
        "requirement": "需向网信部门申报",
        "priority": "必须"
      }
    ],
    "recommendations": [
      "开展数据出境安全评估",
      "向省级网信部门申报",
      "与境外接收方签订标准合同"
    ],
    "estimatedComplianceCost": {
      "time": "3-6个月",
      "effort": "中等"
    }
  }
}
```

#### 3.2 差距分析

```http
POST /api/v1/compliance/gap-analysis
```

**请求体**：

```json
{
  "industry": "金融",
  "currentMeasures": [
    "已建立数据分类分级制度",
    "已部署数据加密系统",
    "已开展员工培训"
  ],
  "businessScope": "个人信用评估服务"
}
```

**响应示例**：

```json
{
  "success": true,
  "data": {
    "complianceScore": 65,
    "gaps": [
      {
        "category": "数据安全管理",
        "requirement": "建立数据安全管理委员会",
        "currentStatus": "未实施",
        "priority": "高",
        "relatedClauses": ["c15"]
      },
      {
        "category": "技术措施",
        "requirement": "采用国密算法",
        "currentStatus": "部分实施",
        "priority": "中",
        "relatedClauses": ["c11"]
      }
    ],
    "actions": [
      {
        "action": "成立数据安全管理委员会",
        "deadline": "1个月内",
        "owner": "CIO/CISO"
      },
      {
        "action": "升级加密系统，采用国密算法",
        "deadline": "3个月内",
        "owner": "技术部"
      }
    ]
  }
}
```

### 4. 场景管理

#### 4.1 创建场景

```http
POST /api/v1/scenarios
```

**请求体**：

```json
{
  "name": "互联网平台数据出境合规场景",
  "description": "适用于互联网平台企业涉及数据跨境传输的合规要求",
  "industry": "互联网",
  "clauseIds": ["c4", "c5", "c6", "c7"],
  "isPublic": false,
  "tags": ["数据出境", "个人信息", "安全评估"]
}
```

**响应示例**：

```json
{
  "success": true,
  "data": {
    "id": "s123",
    "name": "互联网平台数据出境合规场景",
    "totalWeight": 39,
    "complianceScore": 95,
    "clauseCount": 4,
    "createdAt": "2024-12-24T10:30:00Z"
  }
}
```

#### 4.2 场景推荐

```http
POST /api/v1/scenarios/recommend
```

**请求体**：

```json
{
  "industry": "金融",
  "businessType": "数据出境",
  "organizationType": "关键信息基础设施运营者"
}
```

**响应示例**：

```json
{
  "success": true,
  "data": [
    {
      "scenarioId": "s_template_001",
      "name": "金融机构数据出境标准场景",
      "matchScore": 0.92,
      "clauseCount": 12,
      "estimatedImplementationTime": "3-6个月"
    }
  ]
}
```

### 5. AI增强API

#### 5.1 政策解读

```http
POST /api/v1/ai/interpret
```

**请求体**：

```json
{
  "policyId": "p2",
  "clauseId": "c5",
  "context": "我们是跨境电商平台"
}
```

**响应示例**：

```json
{
  "success": true,
  "data": {
    "summary": "该条款规定了个人信息出境的四种合法途径...",
    "keyPoints": [
      "需要通过安全评估",
      "可选择认证或标准合同",
      "关基运营者必须评估"
    ],
    "implications": "作为跨境电商平台，如果涉及个人信息出境...",
    "actionItems": [
      "评估年度个人信息出境数量",
      "选择合适的出境路径",
      "准备安全评估材料"
    ]
  }
}
```

#### 5.2 智能问答

```http
POST /api/v1/ai/qa
```

**请求体**：

```json
{
  "question": "我们公司要将客户数据存储到AWS新加坡区域，需要做什么？",
  "context": {
    "industry": "互联网",
    "userCount": 50000,
    "dataTypes": ["基本信息", "行为数据"]
  }
}
```

**响应示例**：

```json
{
  "success": true,
  "data": {
    "answer": "根据《个人信息保护法》和《数据出境安全评估办法》，您需要：\n1. 进行数据出境安全自评估\n2. 如果涉及敏感个人信息或累计超过10万人，需申报安全评估\n3. 与AWS签订标准合同或获得认证\n4. 告知用户并获得同意",
    "confidence": 0.88,
    "sources": [
      {
        "clauseId": "c5",
        "title": "个人信息出境条件",
        "relevance": 0.95
      },
      {
        "clauseId": "c7",
        "title": "数据出境安全评估申报",
        "relevance": 0.92
      }
    ],
    "relatedQuestions": [
      "数据出境安全评估需要多长时间？",
      "标准合同在哪里可以下载？"
    ]
  }
}
```

---

## 🔧 SDK 使用

### Python SDK

**安装**：

```bash
pip install datasec-policy-hub
```

**使用示例**：

```python
from datasec_hub import DataSecClient

# 初始化客户端
client = DataSecClient(
    api_key="YOUR_API_KEY",
    api_secret="YOUR_API_SECRET"
)

# 搜索政策
policies = client.policies.search(
    keyword="个人信息",
    level="法律",
    limit=10
)

# 语义搜索条款
clauses = client.clauses.semantic_search(
    query="数据出境需要哪些条件",
    filters={
        "weightRange": [8, 10],
        "complianceType": "强制性"
    }
)

# 合规检查
result = client.compliance.check(
    description="将用户数据传输到海外服务器",
    industry="互联网",
    data_volume=100000
)

print(f"风险等级: {result.risk_level}")
print(f"合规评分: {result.risk_score}")
for clause in result.applicable_clauses:
    print(f"- {clause.title}: {clause.requirement}")
```

### JavaScript/TypeScript SDK

**安装**：

```bash
npm install @datasec-hub/sdk
```

**使用示例**：

```typescript
import { DataSecClient } from '@datasec-hub/sdk';

const client = new DataSecClient({
  apiKey: process.env.DATASEC_API_KEY,
  apiSecret: process.env.DATASEC_API_SECRET,
});

// 搜索条款
const clauses = await client.clauses.semanticSearch({
  query: '数据出境需要哪些条件',
  filters: {
    weightRange: [8, 10],
    complianceType: '强制性',
  },
  limit: 10,
});

clauses.forEach(clause => {
  console.log(`${clause.article}: ${clause.content}`);
  console.log(`权重: ${clause.weight}, 相关度: ${clause.relevanceScore}`);
});
```

---

## 🤖 大模型集成

### RAG（检索增强生成）集成

DataSec Policy Hub 可以作为知识库为大模型提供检索增强能力：

```python
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Qdrant
from datasec_hub import DataSecClient

# 初始化客户端
datasec_client = DataSecClient(api_key="YOUR_API_KEY", api_secret="YOUR_API_SECRET")

def datasec_retriever(query: str, k: int = 5):
    """DataSec知识库检索器"""
    # 使用语义搜索获取相关条款
    results = datasec_client.clauses.semantic_search(
        query=query,
        limit=k
    )
    
    # 格式化为LangChain Document格式
    docs = []
    for clause in results:
        doc = Document(
            page_content=clause.content,
            metadata={
                "policy": clause.policy_title,
                "article": clause.article,
                "weight": clause.weight,
                "source": f"DataSec-{clause.id}"
            }
        )
        docs.append(doc)
    
    return docs

# 在LangChain中使用
from langchain.chains import RetrievalQA
from langchain.llms import OpenAI

qa_chain = RetrievalQA.from_chain_type(
    llm=OpenAI(),
    retriever=datasec_retriever,
    return_source_documents=True
)

# 提问
result = qa_chain({
    "query": "互联网公司将用户数据传输到境外需要满足什么条件？"
})

print(result["answer"])
print("引用来源:")
for doc in result["source_documents"]:
    print(f"- {doc.metadata['policy']} {doc.metadata['article']}")
```

### 向量数据导出

企业可以将DataSec知识库导出为向量数据，用于本地大模型训练：

```http
POST /api/v1/export/vectors
```

**请求体**：

```json
{
  "format": "qdrant",
  "filters": {
    "industries": ["金融"],
    "levels": ["法律", "行政法规"]
  },
  "embedModel": "text-embedding-ada-002"
}
```

**响应**：

```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://export.datasec-hub.com/vectors/export_xxx.zip",
    "vectorCount": 3500,
    "expiresAt": "2024-12-31T23:59:59Z"
  }
}
```

---

## 📊 使用限制

### 频率限制

| 套餐 | 每分钟请求数 | 并发数 | 每日总量 |
|------|-------------|--------|----------|
| 免费版 | 10 | 1 | 1,000 |
| 专业版 | 100 | 5 | 50,000 |
| 企业版 | 1000 | 20 | 500,000 |
| 行业版 | 无限制 | 50 | 无限制 |

**超限响应**：

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "API调用频率超限",
    "retryAfter": 60
  }
}
```

### 响应大小限制

- 单次响应最大：10MB
- 批量查询最大条目：100条

---

## ⚠️ 错误处理

### 错误码

| 错误码 | HTTP状态码 | 说明 |
|--------|-----------|------|
| UNAUTHORIZED | 401 | API密钥无效或已过期 |
| FORBIDDEN | 403 | 无权限访问该资源 |
| NOT_FOUND | 404 | 资源不存在 |
| INVALID_PARAMETERS | 400 | 请求参数不合法 |
| RATE_LIMIT_EXCEEDED | 429 | API调用频率超限 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |
| SERVICE_UNAVAILABLE | 503 | 服务暂时不可用 |

### 错误响应格式

```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETERS",
    "message": "参数 'level' 的值不合法",
    "details": {
      "field": "level",
      "allowedValues": ["法律", "行政法规", "部门规章", "国家标准", "行业标准", "地方性法规"]
    }
  }
}
```

---

## 📞 技术支持

- **文档中心**：https://docs.datasec-hub.com
- **API状态**：https://status.datasec-hub.com
- **技术论坛**：https://community.datasec-hub.com
- **工单系统**：support@datasec-hub.com
- **企业客户**：专属客户经理（企业版+）

---

**版本**：v1.0  
**最后更新**：2024-12-24
