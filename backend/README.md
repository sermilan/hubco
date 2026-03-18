# DataSec Hub Backend

数据安全合规知识服务平台后端服务

## 技术栈

- **框架**: NestJS (Node.js)
- **语言**: TypeScript
- **数据库**: PostgreSQL 15
- **搜索引擎**: Elasticsearch 8
- **缓存**: Redis 7
- **ORM**: TypeORM
- **文档**: Swagger/OpenAPI

## 项目结构

```
backend/
├── src/
│   ├── app.module.ts          # 根模块
│   ├── main.ts                # 应用入口
│   ├── entities/              # 数据库实体
│   │   ├── user.entity.ts
│   │   ├── organization.entity.ts
│   │   ├── policy.entity.ts
│   │   ├── clause.entity.ts
│   │   ├── cou.entity.ts
│   │   ├── tag.entity.ts
│   │   ├── scene.entity.ts
│   │   └── index.ts
│   ├── config/                # 配置文件
│   │   ├── database.config.ts
│   │   ├── elasticsearch.config.ts
│   │   ├── redis.config.ts
│   │   ├── jwt.config.ts
│   │   └── index.ts
│   └── modules/               # 功能模块
│       ├── auth/              # 认证模块
│       ├── policies/          # 政策模块
│       ├── cous/              # COU模块
│       └── search/            # 搜索模块
├── docker-compose.yml         # Docker Compose配置
├── .env.example               # 环境变量示例
├── package.json
└── README.md
```

## 快速开始

### 1. 启动依赖服务

```bash
docker-compose up -d
```

这将启动:
- PostgreSQL (端口 5432)
- Elasticsearch (端口 9200)
- Redis (端口 6379)
- Kibana (端口 5601)

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件配置你的环境
```

### 3. 安装依赖

```bash
pnpm install
```

### 4. 启动开发服务器

```bash
pnpm run start:dev
```

访问:
- API: http://localhost:3000
- API文档: http://localhost:3000/api/docs

## API概览

### 认证相关
- `POST /auth/register` - 用户注册
- `POST /auth/login` - 用户登录
- `POST /auth/refresh` - 刷新Token
- `GET /auth/me` - 获取当前用户信息

### 政策管理
- `GET /policies` - 获取政策列表
- `GET /policies/:id` - 获取政策详情
- `GET /policies/:id/clauses` - 获取政策条款
- `GET /policies/:id/cous` - 获取政策COU
- `POST /policies` - 创建政策 (Admin)
- `PUT /policies/:id` - 更新政策 (Admin)
- `DELETE /policies/:id` - 删除政策 (Admin)

### COU管理
- `GET /cous` - 获取COU列表
- `GET /cous/:id` - 获取COU详情
- `GET /cous/:id/related` - 获取相关COU
- `POST /cous` - 创建COU (Admin)
- `PUT /cous/:id` - 更新COU (Admin)
- `DELETE /cous/:id` - 删除COU (Admin)

### 搜索功能
- `GET /search` - 全文搜索
- `GET /search/suggest` - 搜索建议

## 数据库实体

### 核心实体关系

```
Organization 1:N User
Organization 1:N Scene
Policy 1:N Clause
Policy 1:N COU
```

## 开发计划

- [x] 项目初始化与配置
- [x] 数据库实体设计
- [x] 认证系统 (JWT)
- [x] 政策CRUD API
- [x] COU CRUD API
- [x] 全文搜索 (Elasticsearch)
- [ ] 场景管理API
- [ ] 标签系统API
- [ ] 用户设置API
- [ ] 数据统计API
- [ ] AI集成 (RAG)
- [ ] 数据导入/导出

## 许可证

MIT
