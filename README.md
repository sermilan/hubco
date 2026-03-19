# DataSec Hub - 数据安全合规知识服务平台

<div align="center">

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/sermilan/hubgo/releases)
[![License](https://img.shields.io/badge/license-GPL--2.0-blue.svg)](./LICENSE)
[![Platform](https://img.shields.io/badge/platform-Web-orange.svg)](#)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4.0-06B6D4.svg?logo=tailwindcss)](https://tailwindcss.com/)

**面向企业的专业级数据安全合规知识服务平台**

[快速开始](./docs/QUICK_START.md) · [开发状态](./docs/DEVELOPMENT_STATUS.md) · [实施指南](./docs/IMPLEMENTATION_GUIDE.md) · [商业计划](./docs/BUSINESS_PLAN.md)

</div>

---

## 🎉 项目状态

✅ **前端完成** - 所有前端功能已完整实现，包括4大页面、11个核心模块、40+组件  
🚧 **后端开发** - 准备进入后端集成阶段  
📚 **文档完善** - 提供完整的系统文档和开发指南  

**当前可用功能**：
- ✅ 完整的UI/UX界面
- ✅ 所有业务流程演示
- ✅ 模拟数据支持
- ✅ API接口设计
- ⏳ 真实后端集成（开发中）

---

## 📋 项目简介

DataSec Hub 是一个专业的数据安全政策知识服务平台，通过创新的**COU（合规义务单元）**体系，将复杂的法律法规转化为清晰、可执行的合规要求，为企业提供：

- 📚 **全面的政策库**：覆盖国内所有数据安全相关的法律法规、标准规范
- 🎯 **COU体系**：结构化的合规义务单元，清晰明确每项要求
- 🔍 **智能检索**：关键词、多维度筛选、标签系统
- 🎨 **场景构建**：自定义合规场景，智能权重计算
- 📊 **可视化分析**：权重分布、优先级排序、统计报表
- 🔌 **API服务**：支持企业系统集成和本地大模型调用

## 🌟 核心特性

### 1. COU（合规义务单元）体系

创新的合规知识结构化方法：

```typescript
COU示例：COU-DSL-001
├── 标题：重要数据处理者应当明确数据安全负责人和管理机构
├── 来源：中华人民共和国数据安全法 第27条
├── 类型：强制性
├── 基础权重：10（法律级别）
├── 适用行业：通用
├── 要求行动：
│   ├── 1. 确定数据安全负责人
│   ├── 2. 建立数据安全管理机构
│   └── 3. 落实数据安全保护责任
├── 技术措施：[组织架构设计、责任制度]
└── 关联COU：[COU-DSL-002, COU-PIPL-015]
```

### 2. 三层权重系统

科学的优先级计算：

- **基础权重** (1-10分)
  - 法律: 10分
  - 行政法规: 9分
  - 部门规章: 8分
  - 国家标准: 7分
  - 行业标准: 6分
  - 地方性法规: 5分
  - 指南指引: 4分

- **场景权重** (动态计算)
  - 标签匹配度 × 0.5
  - 行业匹配 × 1.0
  - 区域匹配 × 0.8
  - 用户类型匹配 × 0.6

- **最终权重** = 基础权重 + 场景权重

### 3. 智能场景构建

6个预设场景模板 + 自定义场景：

- 🎮 游戏出海场景
- 🏦 金融等保场景
- 🛒 电商合规场景
- 🏥 医疗数据场景
- 🏙️ 智慧城市场景
- 📚 教育科技场景

**场景分析功能**：
- 权重分布图表
- COU优先级排序
- 合规覆盖率
- 差距分析

### 4. 完整的版本管理

解决政策更新问题：

- 📜 政策版本历史追踪
- 🔄 新旧版本对比
- ⚠️ 废止政策提醒
- 🔗 版本关联关系

### 5. 双标签系统

提高检索精度：

- 🏷️ **人工标签**：专业标注的核心标签
- 🤖 **AI标签**：自动提取的辅助标签
- 📂 标签分类：法律、技术、管理、行业、场景

## 🏗️ 系统架构

### 前端技术栈

```
React 18.3 + TypeScript 5.x
├── UI框架：Tailwind CSS 4.0
├── 组件库：Radix UI (40+ components)
├── 图标库：Lucide React
├── 通知：Sonner
├── 状态管理：React Hooks
├── 图表：Recharts
└── 构建工具：Vite 6.x
```

### 核心页面（已完成）

1. **Landing Page** - 营销着陆页
   - 产品介绍
   - 核心功能展示
   - 应用场景
   - 订阅方案对比

2. **Auth Page** - 登录注册
   - 统一认证界面
   - 支持个人/企业/院校三种类型
   - 14天免费试用

3. **Main App** - 主应用（7大模块）
   - 📊 COU浏览器
   - 📚 政策浏览器
   - 🎯 场景管理器
   - 🔧 场景构建器
   - 📈 数据看板
   - ⚙️ 用户设置
   - 📖 API文档

4. **Admin Page** - 后台管理（4大模块）
   - 📄 政策管理
   - 🎯 COU管理
   - 👥 用户管理
   - ⚙️ 系统设置

```

### 后端技术栈（推荐）

详见 [实施指南](./docs/IMPLEMENTATION_GUIDE.md)

```
Node.js/NestJS 后端
├── 数据库：PostgreSQL 15
├── 搜索引擎：Elasticsearch
├── 缓存：Redis 7.x
├── 对象存储：MinIO / 阿里云OSS
├── 认证：JWT + Passport
└── AI服务：OpenAI API
```

## 📊 项目结构

```
hubgo/
├── src/
│   ├── app/
│   │   ├── App.tsx                    # 主应用入口
│   │   ├── pages/                     # 页面组件 (4个)
│   │   │   ├── LandingPage.tsx       # 营销页面
│   │   │   ├── AuthPage.tsx          # 登录注册
│   │   │   ├── MainApp.tsx           # 主应用
│   │   │   └── AdminPage.tsx         # 后台管理
│   │   ├── components/                # 业务组件 (15+)
│   │   │   ├── COUExplorer.tsx       # COU浏览器
│   │   │   ├── PolicyExplorer.tsx    # 政策浏览器
│   │   │   ├── SceneManager.tsx      # 场景管理器
│   │   │   ├── SceneBuilder.tsx      # 场景构建器
│   │   │   ├── Dashboard.tsx         # 数据看板
│   │   │   ├── UserSettings.tsx      # 用户设置
│   │   │   ├── ApiDocumentation.tsx  # API文档
│   │   │   ├── admin/                # 后台管理组件 (4个)
│   │   │   │   ├── PolicyManagement.tsx
│   │   │   │   ├── COUManagement.tsx
│   │   │   │   ├── UserManagement.tsx
│   │   │   │   └── SystemSettings.tsx
│   │   │   └── ui/                   # UI组件库 (40+)
│   │   ├── types/                    # 类型定义
│   │   │   └── index.ts
│   │   ├── data/                     # 模拟数据
│   │   │   └── mockData.ts
│   │   └── services/                 # API服务
│   │       └── api.ts
│   └── styles/                       # 样式文件
├── 📚 文档
│   ├── README.md                     # 项目说明（本文档）
│   ├── QUICK_START.md                # 快速开始指南
│   ├── DEVELOPMENT_STATUS.md         # 开发状态报告
│   ├── IMPLEMENTATION_GUIDE.md       # 后端实施指南
│   ├── SYSTEM_OVERVIEW.md            # 系统概述
│   ├── SYSTEM_GUIDE.md               # 系统使用指南
│   ├── API_INTEGRATION_GUIDE.md      # API集成指南
│   └── BUSINESS_PLAN.md              # 商业计划书
└── package.json
```

## 🚀 快速开始

### 方式一：直接运行（推荐）

```bash
# 克隆项目
git clone https://github.com/sermilan/hubgo.git

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问应用（自动打开浏览器）
# http://localhost:5173
```

### 方式二：查看文档

📖 **推荐阅读顺序**：

1. **[QUICK_START.md](./docs/QUICK_START.md)** - 5分钟快速了解系统
2. **[DEVELOPMENT_STATUS.md](./docs/DEVELOPMENT_STATUS.md)** - 查看完整开发状态
3. **[SYSTEM_OVERVIEW.md](./docs/SYSTEM_OVERVIEW.md)** - 理解系统架构
4. **[IMPLEMENTATION_GUIDE.md](./docs/IMPLEMENTATION_GUIDE.md)** - 开始后端开发

### 方式三：API集成

详见 [API集成指南](./docs/API_INTEGRATION_GUIDE.md)

## 📈 商业模式

### 订阅套餐

| 套餐 | 价格 | COU访问 | 场景数 | API调用 | 适用对象 |
|------|------|---------|--------|---------|----------|
| 个人版 | 免费 | 1,000 | 5 | - | 个人用户 |
| 企业版 | ¥2,999/月 | 无限 | 无限 | 50K/月 | 中小企业 |
| 教育版 | ¥9,999/年 | 无限 | 无限 | 无限 | 院校机构 |

### 三重护城河

1. **数据资产**：最全面的结构化政策知识库
2. **API生态**：标准化接口，易于集成
3. **专业服务**：合规咨询、培训、定制开发

详见 [商业计划书](./docs/BUSINESS_PLAN.md)

## 💡 使用场景

### 企业合规团队
快速检索相关政策，创建合规检查清单，自动化合规评估

### 法务团队
查阅最新法律法规，生成政策解读，制作咨询报告

### 产品经理
了解合规要求，将合规纳入产品设计，避免后期整改

### 技术团队
集成API到业务系统，自动化合规检查，生成合规报告

### 咨询公司
为客户提供专业合规服务，管理多个项目，批量分析

## 🎯 核心创新

### 1. COU体系
- 将复杂法律条款转化为结构化合规义务
- 清晰的行动指引和适用范围
- 科学的权重评估系统

### 2. 智能场景
- 基于标签和权重的智能匹配
- 实时权重计算
- 可视化分析报告

### 3. 版本管理
- 完整的政策版本追踪
- 自动关联新旧版本
- 及时的变更提醒

## 📚 学习资源

- [快速开始指南](/QUICK_START.md) - 5分钟上手
- [开发状态报告](/DEVELOPMENT_STATUS.md) - 了解项目进度
- [系统概述](/SYSTEM_OVERVIEW.md) - 理解系统架构
- [实施指南](/IMPLEMENTATION_GUIDE.md) - 后端开发指南
- [API集成指南](/API_INTEGRATION_GUIDE.md) - API使用说明
- [商业计划书](/BUSINESS_PLAN.md) - 商业模式和规划

## 🔧 开发者指南

### 前端开发（已完成）

所有前端功能已完整实现：
- ✅ 4个核心页面
- ✅ 11个业务模块
- ✅ 40+ UI组件
- ✅ 完整的类型系统
- ✅ 模拟数据支持

### 后端开发（进行中）

按照 [实施指南](./docs/IMPLEMENTATION_GUIDE.md) 进行：

**阶段一**：基础架构（Week 1-2）
- 搭建后端框架
- 配置数据库
- 实现认证系统

**阶段二**：核心API（Week 3-4）
- 政策和COU管理
- 场景和权重计算
- 全文搜索

**阶段三**：AI增强（Week 5-6）
- AI提取COU
- 智能标签推荐
- 性能优化

## 🤝 贡献

我们欢迎各种形式的贡献！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解如何参与。

## 📝 许可证

本项目采用 GPL-2.0 许可证 - 详见 [LICENSE](./LICENSE) 文件。

## 🙏 致谢

- [shadcn/ui](https://ui.shadcn.com/) - UI 组件库
- [Radix UI](https://www.radix-ui.com/) - Headless UI 基础组件
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先 CSS 框架

---

<div align="center">

**DataSec Hub - 让数据合规更简单**

Made with ❤️ by DataSec Team

**当前版本**: v1.0.0-frontend-complete | **最后更新**: 2024-12-26

</div>