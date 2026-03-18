# DataSec Hub - 数据安全合规知识服务平台

## 系统概述

DataSec Hub 是一个企业级数据安全合规知识服务平台，提供全方位的数据安全法规查询、合规指引和场景构建服务。

## 核心功能模块

### 1. Landing Page（着陆页）
- **位置**: `/src/app/pages/LandingPage.tsx`
- **功能**:
  - 产品介绍和价值主张
  - 核心功能展示（6大核心功能）
  - 应用场景展示（游戏出海、金融合规、医疗健康）
  - 订阅方案（个人版、企业版、教育版）
  - 数据统计展示
- **设计风格**: 科技感渐变背景（深蓝+青色），玻璃态效果

### 2. Auth Page（登录注册页）
- **位置**: `/src/app/pages/AuthPage.tsx`
- **功能**:
  - 统一登录/注册界面
  - 支持三种账号类型：
    - 个人用户
    - 企业用户
    - 院校用户
  - 14天免费试用
- **特色**: 响应式设计，左右分栏布局

### 3. Main App（SAAS主应用）
- **位置**: `/src/app/pages/MainApp.tsx`
- **子模块**:
  
#### 3.1 COU浏览器 (COU Explorer)
- **位置**: `/src/app/components/COUExplorer.tsx`
- **功能**:
  - 展示所有合规义务单元（COU）
  - 智能筛选（行业、区域、权重范围）
  - 权重可视化（关键/高/中/低）
  - 标签系统（人工标签 + AI标签）
  - COU详情查看
- **核心概念**: COU (Compliance Obligation Unit) - 合规义务单元

#### 3.2 政策浏览器 (Policy Explorer)
- **位置**: `/src/app/components/PolicyExplorer.tsx`
- **功能**:
  - 政策文件检索
  - 版本管理
  - 政策下载
  - 条款浏览

#### 3.3 场景管理器 (Scene Manager)
- **位置**: `/src/app/components/SceneManager.tsx`
- **功能**:
  - 预设场景模板（游戏出海、金融等保、电商合规等）
  - 自定义场景创建
  - 场景分析（权重分布、优先级排序）
  - COU智能组合

#### 3.4 场景构建器 (Scene Builder)
- **位置**: `/src/app/components/SceneBuilder.tsx`
- **功能**:
  - 从模板创建场景
  - 自定义场景配置
  - 核心要素筛选（行业、区域、企业类型）
  - 特殊要求添加
  - 实时场景分析
  - 权重计算

#### 3.5 API文档
- **位置**: `/src/app/components/ApiDocumentation.tsx`
- **功能**: API接口文档展示

#### 3.6 数据看板
- **位置**: `/src/app/components/Dashboard.tsx`
- **功能**: 使用统计和数据分析

#### 3.7 用户设置
- **位置**: `/src/app/components/UserSettings.tsx`
- **功能**:
  - 个人信息管理
  - 订阅信息查看
  - 通知设置
  - 安全设置

### 4. Admin Page（后台管理）
- **位置**: `/src/app/pages/AdminPage.tsx`
- **功能**:
  - 政策管理（录入、更新、版本管理）
  - COU管理（提取、编辑、关联）
  - 用户管理
  - 系统设置
- **状态**: 基础框架已完成

## 核心数据模型

### COU (Compliance Obligation Unit) - 合规义务单元
```typescript
{
  id: string;
  code: string;              // COU编码，如 COU-DSL-001
  title: string;             // 合规义务简述
  description: string;       // 详细描述
  
  // 权重系统（三层权重）
  baseWeight: number;        // 基础权重（基于政策层级）
  scenarioWeight: number;    // 场景权重（基于标签匹配度）
  finalWeight: number;       // 最终权重
  
  // 合规要素
  obligationType: "禁止性" | "强制性" | "推荐性" | "指导性";
  actionRequired: string;    // 要求的行动
  deadline?: string;         // 期限要求
  penalty?: string;          // 违规后果
  
  // 标签系统
  tags: Tag[];              // 人工标签
  autoTags: string[];       // AI自动标签
  
  // 适用范围
  applicableIndustries: Industry[];
  applicableRegions: Region[];
  applicableUserTypes: UserType[];
  
  // 技术和组织措施
  technicalMeasures?: string[];
  organizationalMeasures?: string[];
  
  // 关联关系
  relatedCOUs?: string[];   // 关联的其他COU
  dependsOn?: string[];     // 依赖的COU
  conflicts?: string[];     // 冲突的COU
  
  // 版本管理
  version: string;
  status: "current" | "superseded" | "deprecated";
}
```

### 权重计算体系
1. **基础权重** - 基于政策层级
   - 法律: 10分
   - 行政法规: 9分
   - 部门规章: 8分
   - 国家标准: 7分
   - 行业标准: 6分
   - 地方性法规: 5分
   - 指南指引: 4分

2. **场景权重** - 基于标签匹配度
   - 根据场景标签与COU标签的匹配程度动态计算

3. **最终权重** - 综合权重
   - 最终权重 = 基础权重 + 场景权重

### 优先级分类
- **关键** (权重 9-10): 红色标识
- **高** (权重 7-8): 橙色标识
- **中** (权重 5-6): 黄色标识
- **低** (权重 1-4): 蓝色标识

## 商业模式

### 1. 个人版 - 免费
- 基础政策检索
- 1,000个COU访问
- 5个自定义场景
- 社区支持

### 2. 企业版 - ¥2,999/月
- 无限政策和COU访问
- AI智能分析
- 无限场景构建
- 版本历史追踪
- API接口
- 优先支持

### 3. 教育版 - ¥9,999/年
- 企业版全部功能
- 100个学生账号
- 教学案例库
- 实训课程支持
- 定制化场景
- 专属技术支持

## 技术栈

- **前端框架**: React 18 + TypeScript
- **UI组件**: Radix UI + Tailwind CSS v4
- **图标**: Lucide React
- **通知**: Sonner
- **构建工具**: Vite

## 设计特色

### 1. 科技感UI
- 渐变色背景（深蓝 → 青色）
- 玻璃态效果（backdrop-blur）
- 动态阴影和过渡
- 数据可视化

### 2. 权重可视化
- 颜色编码（红/橙/黄/蓝）
- 进度条和图表
- 实时统计

### 3. 智能交互
- 实时筛选
- 标签系统
- 场景推荐
- AI辅助

## 核心创新

### 1. COU体系
将复杂的合规条款转化为结构化的合规义务单元，清晰明确每项要求。

### 2. 权重系统
科学的三层权重计算，帮助企业明确合规优先级。

### 3. 场景构建
基于标签和权重的智能场景组合，快速生成定制化合规方案。

### 4. 版本管理
完整的政策版本追踪，自动关联新旧版本，避免合规漏洞。

### 5. 标签映射
人工标签 + AI自动标签，实现精准的场景匹配和COU推荐。

## 未来规划

1. **AI增强**
   - 自动COU提取
   - 智能场景推荐
   - 合规风险评估

2. **数据扩展**
   - 国际法规（GDPR、CCPA等）
   - 行业标准
   - 最佳实践案例

3. **API生态**
   - RESTful API
   - Webhook通知
   - SDK支持

4. **专业服务**
   - 合规咨询
   - 培训服务
   - 定制化开发

## 文件结构

```
/src/app/
├── App.tsx                 # 主应用入口
├── pages/
│   ├── LandingPage.tsx    # 着陆页
│   ├── AuthPage.tsx       # 登录注册
│   ├── MainApp.tsx        # 主应用
│   └── AdminPage.tsx      # 后台管理
├── components/
│   ├── Header.tsx         # 顶部导航
│   ├── Sidebar.tsx        # 侧边栏
│   ├── COUExplorer.tsx    # COU浏览器
│   ├── PolicyExplorer.tsx # 政策浏览器
│   ├── SceneManager.tsx   # 场景管理器
│   ├── SceneBuilder.tsx   # 场景构建器
│   ├── UserSettings.tsx   # 用户设置
│   ├── Dashboard.tsx      # 数据看板
│   ├── ApiDocumentation.tsx # API文档
│   └── ui/                # UI组件库
└── types/
    └── index.ts           # 类型定义
```

## 启动应用

应用会自动从 Landing Page 开始：
1. Landing Page → 点击"免费开始"或"登录"
2. Auth Page → 注册或登录
3. Main App → 进入主应用（默认显示COU浏览器）
4. Admin Page → 管理员后台（需管理员权限）

## 核心竞争力

### 三重护城河

1. **数据资产**
   - 全量政策文件
   - 结构化COU库
   - 版本历史追踪

2. **API生态**
   - 标准化接口
   - 企业系统集成
   - 本地大模型调用

3. **专业服务**
   - 合规咨询
   - 教学实训
   - 定制化开发
