// ============ 基础数据类型 ============

// 政策级别（权重对应）
export type PolicyLevel = "法律" | "行政法规" | "部门规章" | "国家标准" | "行业标准" | "地方性法规" | "指南指引";

// 政策级别权重映射 ($W_L$)
export const POLICY_LEVEL_WEIGHTS: Record<PolicyLevel, number> = {
  "法律": 10,
  "行政法规": 9,
  "部门规章": 8,
  "国家标准": 7,
  "行业标准": 6,
  "地方性法规": 5,
  "指南指引": 4,
};

// 罚则力度权重映射 ($W_P$)
export type PenaltyLevel = "刑事" | "高额罚款" | "中等罚款" | "警告整改" | "无";

export const PENALTY_WEIGHTS: Record<PenaltyLevel, number> = {
  "刑事": 5,
  "高额罚款": 4,
  "中等罚款": 3,
  "警告整改": 2,
  "无": 1,
};

// 行业分类
export type Industry = 
  | "通用" 
  | "金融" 
  | "医疗" 
  | "电信" 
  | "互联网" 
  | "能源" 
  | "教育" 
  | "交通"
  | "政务"
  | "制造"
  | "游戏"
  | "电商";

// 区域
export type Region = "国内" | "欧盟" | "美国" | "东南亚" | "全球";

// 用户类型
export type UserType = "个人" | "中小企业" | "大型企业" | "上市公司" | "关基运营者";

// 标签分类
export type TagCategory = "法律" | "技术" | "管理" | "行业" | "场景";

// 标签
export interface Tag {
  id: string;
  name: string;
  color: string;
  category: TagCategory;
  weight?: number; // 标签基础权重
  relatedScenes?: string[]; // 关联场景ID
}

// ============ 五维标签系统 ============

/** 五维标签结构 */
export interface FiveDimensionalTags {
  objects: string[];      // OBJ-xxx: 客体维度 - 保护对象
  subjects: string[];     // SUB-xxx: 主体维度 - 责任主体
  lifecycles: string[];   // LIF-xxx: 业务流转维度 - 业务环节
  securities: string[];   // SEC-xxx: 安全域维度 - 保护手段
  actions: string[];      // ACT-xxx: 动作义务维度 - COU核心
}

/** 动作优先级 */
export type ActionPriority = "critical" | "high" | "medium" | "low";

/** 动作要求定义（用于生成To-Do List） */
export interface ActionRequirement {
  actionCode: string;        // 对应 ACT-xxx
  description: string;       // 具体动作描述
  deadline?: string;         // 期限要求 (如 "72小时", "立即", "年度")
  priority: ActionPriority;
  isBlocking: boolean;       // 是否阻断性要求
  checkPoints: string[];     // 检查点清单
  deliverables?: string[];   // 交付物清单
}

// ============ ControlObjective (控制目标) - 解耦映射层 ============

/** 控制类别 */
export type ControlCategory =
  | "预防性"      // Preventive - 防止事件发生的控制
  | "检测性"      // Detective - 发现已发生事件的控制
  | "纠正性"      // Corrective - 修复已造成损害的控制
  | "管理性"      // Administrative - 政策、流程、培训
  | "技术性"      // Technical - 加密、访问控制、审计日志
  | "物理性";     // Physical - 门禁、监控、环境安全

/** 控制目标版本信息 */
export interface ControlObjectiveVersion {
  versionId: string;
  versionNumber: string;     // 版本号，如 v1.0
  status: "current" | "revised" | "deprecated";
  effectiveDate: string;
  supersededBy?: string;     // 被哪个版本替代
  changeLog?: string;        // 变更说明
  impact: "breaking" | "compatible" | "cosmetic"; // 影响级别
}

/** 条款映射信息 */
export interface ClauseMapping {
  clauseId: string;          // 条款ID
  policyId: string;          // 政策ID
  policyTitle: string;       // 政策标题（反范化）
  clauseNumber: string;      // 条款编号（如"第27条"）
  mappingConfidence: number; // AI映射置信度 0-1
  mappingReason: string;     // 映射理由/依据
  mappedAt: string;          // 映射时间
  mappedBy?: string;         // 映射人（AI或用户ID）
  status: "auto" | "confirmed" | "rejected" | "pending_review"; // 映射状态
}

/** ControlObjective (控制目标) - 核心解耦层
 *
 * 设计目标：
 * 1. 将外部法规条款映射到标准控制目标库（200-500个可维护）
 * 2. 实现多对一映射：多个法规条款可映射到同一个控制目标
 * 3. 提供场景无关的标准控制要求
 * 4. 作为 COU 的模板来源
 */
export interface ControlObjective {
  id: string;
  code: string;                    // 编码，如: CO-ENCRYPT-001 (Control Objective)
  name: string;                    // 控制目标名称，如: "数据传输加密"
  nameEn?: string;                 // 英文名称
  description: string;             // 详细描述

  // 控制分类
  category: ControlCategory;       // 控制类别
  domain: string;                  // 控制域（如：数据安全、网络安全、隐私保护）

  // 五维标签（描述该控制目标适用的场景特征）
  applicableTags: FiveDimensionalTags;

  // 标准动作要求模板（作为 COU 的场景化基础）
  standardActions: ActionRequirement[];

  // 映射到法规条款（多对多）
  mappedClauses: ClauseMapping[];
  mappedClauseCount: number;       // 映射条款数量（缓存）

  // 适用场景统计
  applicableScenarios: string[];   // 适用的场景ID列表
  scenarioCount: number;           // 场景数量（缓存）

  // 权重参考值（可根据场景覆盖情况调整）
  baseWeight: number;              // 基础权重 1-10
  importance: "critical" | "high" | "medium" | "low"; // 重要性分级

  // 合规依据（国际标准、最佳实践）
  standards?: string[];            // 相关标准（如：ISO27001-A.13.2.1, GDPR-Art.32）
  bestPractices?: string[];        // 最佳实践参考

  // 版本管理
  version: string;
  versionHistory?: ControlObjectiveVersion[];
  status: "active" | "deprecated";
  createdAt: string;
  updatedAt: string;

  // LLM辅助信息
  llmMetadata?: {
    extractionConfidence: number;  // 从法规中提取的置信度
    suggestedMappings?: string[];  // AI建议映射的条款ID
    keywords?: string[];           // 用于匹配的关键词
  };
}

/** COU版本信息 */
export interface COUVersion {
  versionId: string;
  versionNumber: string;     // 版本号，如 v1.0
  status: "active" | "pending" | "deprecated";
  effectiveDate: string;
  supersededBy?: string;     // 被哪个版本替代
  changeLog?: string;        // 变更说明
  impact: "breaking" | "compatible" | "cosmetic"; // 影响级别
}

// ============ COU (Compliance Obligation Unit) 合规义务单元 ============

/** COU场景化定制信息 */
export interface COUCustomization {
  // 基于 ControlObjective 的场景化调整
  adaptedActions: ActionRequirement[];      // 调整后的动作要求
  additionalRequirements?: string[];        // 额外增加的要求
  simplifiedRequirements?: string[];        // 简化/豁免的要求（如小企业版）
  customDeadlines?: Record<string, string>; // 自定义期限 actionCode -> deadline
  customPriorities?: Record<string, ActionPriority>; // 自定义优先级

  // 场景特定说明
  scenarioNotes?: string;                   // 针对该场景的备注说明
  industrySpecificGuidance?: string;        // 行业特定指引
}

export interface COU {
  id: string;
  code: string; // COU编码，如 COU-DSL-001
  title: string; // 合规义务简述
  description: string; // 详细描述

  // ===== 核心关联关系（重构后） =====
  /** 控制目标ID - 引用标准控制目标库（核心解耦字段） */
  controlObjectiveId: string;
  /** 源条款ID列表 - 可能来自多个法规条款（多对多） */
  sourceClauseIds: string[];
  /** 场景ID - 所属的业务场景（如"游戏出海欧盟"） */
  scenarioId?: string;

  // 保留向后兼容的字段（可选）
  sourceClauseId?: string; // 旧版单条款引用（废弃，保留兼容）
  policyId?: string;       // 已移至 ControlObjective 层
  policyTitle?: string;    // 已移至 ControlObjective 层
  policyLevel?: PolicyLevel; // 已移至 ControlObjective 层

  // ===== 场景化定制 =====
  /** 场景化定制信息 - 基于 ControlObjective 的定制 */
  customization: COUCustomization;

  // ===== 合规要素 =====
  obligationType: "禁止性" | "强制性" | "推荐性" | "指导性";
  actionRequired?: string; // 要求的行动（旧版兼容，现优先使用 actionRequirements）
  deadline?: string; // 期限要求
  penalty?: string; // 违规后果描述
  penaltyLevel?: PenaltyLevel; // 罚则力度等级 ($W_P$)

  // ===== 权重系统（增强版） =====
  // Total_Weight = W_base × W_P × Tag_Match_Score × Scenario_Adjust
  baseWeight: number; // 基础权重（继承自 ControlObjective，可覆盖）
  penaltyWeight: number; // 罚则力度权重（$W_P$）
  tagMatchScore: number; // 标签匹配度（0-1）
  scenarioWeight: number; // 场景权重调整系数
  finalWeight: number; // 最终权重

  // ===== 标签系统（五维结构） =====
  tags: Tag[]; // 保留旧版标签（向后兼容）
  fiveDimensionalTags: FiveDimensionalTags; // 新版五维标签
  tagWeights: Record<string, number>; // tagCode -> weight 映射
  autoTags: string[]; // AI自动提取的标签Codes
  autoTagConfidence?: number; // AI标注置信度（<0.8需人工复核）

  // ===== 动作义务（核心！用于生成To-Do List） =====
  // 注意：实际动作是 customization.adaptedActions || ControlObjective.standardActions
  actionRequirements: ActionRequirement[];

  // ===== 适用范围 =====
  applicableIndustries: Industry[];
  applicableRegions: Region[];
  applicableUserTypes: UserType[];

  // ===== 特殊要素 =====
  specialRequirements?: string[]; // 特殊要求
  technicalMeasures?: string[]; // 技术措施
  organizationalMeasures?: string[]; // 组织措施

  // ===== 关联关系 =====
  relatedCOUs?: string[]; // 关联的其他COU
  dependsOn?: string[]; // 依赖的COU（必须先满足）
  conflicts?: string[]; // 冲突的COU

  // ===== 版本管理（双轨机制） =====
  version: string;
  status: "active" | "pending" | "deprecated";
  versionHistory?: COUVersion[]; // 版本历史
  createdAt: string;
  updatedAt: string;

  // ===== LLM辅助拆解元数据 =====
  llmMetadata?: {
    decompositionConfidence: number; // LLM拆解置信度
    reviewedBy?: string; // 人工审核人
    reviewedAt?: string; // 审核时间
    aiSuggestions?: string[]; // AI建议
  };
}

// ============ 政策文件（增强版本管理） ============

export interface PolicyVersion {
  versionId: string;
  versionNumber: string; // 版本号，如 v1.0, v2.0
  publishDate: string;
  effectiveDate: string;
  expiryDate?: string; // 失效日期
  status: "draft" | "current" | "superseded" | "deprecated";
  changeLog?: string; // 变更说明
  replacedBy?: string; // 被哪个版本替代
  replaces?: string; // 替代了哪个版本
}

export interface Policy {
  id: string;
  title: string;
  code: string; // 文号
  level: PolicyLevel;
  industries: Industry[];
  regions: Region[];
  publishOrg: string;
  
  // 版本管理
  currentVersion: PolicyVersion;
  versions: PolicyVersion[]; // 所有版本
  
  // 基础信息
  tags: Tag[];
  description: string;
  fullText?: string;
  downloadUrl?: string;
  
  // 统计信息
  clauseCount: number;
  couCount: number; // COU数量
  
  // 关联关系
  relatedPolicies?: string[];
  supersedes?: string[]; // 替代的旧政策
  supersededBy?: string; // 被哪个新政策替代
}

// ============ 条款（增强版） ============

export interface Clause {
  id: string;
  policyId: string;
  policyVersionId: string; // 所属政策版本
  policyTitle: string;
  policyCode: string;
  policyLevel: PolicyLevel;
  
  // 条款信息
  chapter: string;
  article: string;
  content: string;
  
  // 控制目标映射（核心新增 - 解耦层）
  mappedControlObjectiveIds: string[]; // 映射到的控制目标ID列表
  mappingStatus: "unmapped" | "auto_mapped" | "confirmed" | "pending_review"; // 映射状态
  mappingConfidence?: number; // AI映射置信度

  // COU关联（旧版兼容）
  couIds: string[]; // 从此条款提取的COU（废弃，改用 ControlObjective 映射）
  
  // 权重系统
  baseWeight: number; // 基于政策层级
  complianceWeight: number; // 基于合规类型
  manualAdjustment: number; // 手工微调 (-2 ~ +2)
  adjustmentReason?: string; // 微调原因说明
  finalWeight: number; // 最终权重 (baseWeight * complianceMultiplier + manualAdjustment)
  
  // 合规信息
  complianceType: "禁止性" | "强制性" | "推荐性" | "指导性";
  penalty?: string;
  
  // 标签和关键词
  tags: Tag[];
  keywords: string[];
  autoKeywords?: string[]; // AI提取的关键词
  
  // 关联关系
  relatedClauses?: string[];
  
  // 版本管理
  version: string;
  status: "current" | "superseded" | "deprecated";
  replacedBy?: string; // 被哪个条款替代
}

// ============ 场景系统（重新设计 - 五维标签版） ============

/** 场景标签配置 */
export interface SceneTagProfile {
  requiredTags: string[];       // 必须匹配的标签Codes
  preferredTags: string[];      // 优先匹配的标签Codes
  excludedTags: string[];       // 排除的标签Codes
  tagWeights: Record<string, number>;    // 场景内各标签权重系数
  tagCoefficients: Record<string, number>; // 维度系数 (ACTION维度通常更高)
}

/** 场景匹配算法配置 */
export interface SceneMatchingConfig {
  minMatchScore: number;           // 最小匹配分数阈值 (0-1)
  boostForActionTags: boolean;     // 是否提升动作标签权重
  requireAllActionTags: boolean;   // 是否要求命中所有动作标签
  includeRelatedTags: boolean;     // 是否包含关联标签
  includeHierarchy: boolean;       // 是否包含层级继承
}

/** 场景COU引用（带版本控制） */
export interface SceneCOUReference {
  couId: string;
  versionId: string;
  isLatest: boolean;
  updateAvailable: boolean;
  autoUpgrade: boolean;
  pinnedWeight?: number;           // 用户自定义权重覆盖
}

// 预设场景模板
export interface SceneTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "出海合规" | "行业合规" | "业务合规" | "技术合规";

  // 场景要素
  targetIndustries: Industry[];
  targetRegions: Region[];
  targetUserTypes: UserType[];

  // 五维标签配置（新版）
  tagProfile: SceneTagProfile;
  matchingConfig: SceneMatchingConfig;

  // 预设标签（旧版，向后兼容）
  requiredTags: string[];
  optionalTags: string[];

  // 预设COU
  recommendedCOUs: string[];

  // 使用统计
  usageCount: number;
  isPopular: boolean;
}

// 用户自定义场景
export interface CustomScene {
  id: string;
  name: string;
  description: string;
  userId: string;
  organizationId: string;

  // 场景要素
  industry: Industry;
  region: Region;
  userType: UserType;
  specialRequirements: string[];

  // 五维标签选择
  selectedTags: {
    objects: string[];
    subjects: string[];
    lifecycles: string[];
    securities: string[];
    actions: string[];
  };

  // COU组合（新版：使用引用）
  couReferences: SceneCOUReference[];
  cous: COU[];              // 保留旧版（向后兼容）
  totalCOUs: number;

  // 场景匹配配置
  matchingConfig: SceneMatchingConfig;

  // 权重分析
  totalWeight: number;
  averageWeight: number;
  highPriorityCOUs: number; // 高优先级COU数量（权重>=8）

  // 合规评分
  complianceScore: number; // 0-100
  completeness: number; // 完整度 0-100

  // 标签统计
  tagDistribution: Record<string, number>; // 标签分布

  // 版本和状态
  version: string;
  status: "draft" | "active" | "archived";
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;

  // 基于模板创建
  basedOnTemplate?: string;
}

// 场景分析结果
export interface SceneAnalysis {
  sceneId: string;
  
  // 优先级分级
  criticalCOUs: COU[]; // 关键（权重9-10）
  highPriorityCOUs: COU[]; // 高优先级（权重7-8）
  mediumPriorityCOUs: COU[]; // 中优先级（权重5-6）
  lowPriorityCOUs: COU[]; // 低优先级（权重1-4）
  
  // 分类统计
  byType: Record<string, number>; // 按合规类型统计
  byCategory: Record<string, number>; // 按标签分类统计
  byPolicy: Record<string, number>; // 按政策文件统计
  
  // 风险评估
  riskLevel: "low" | "medium" | "high" | "critical";
  gaps: string[]; // 可能的合规缺口
  recommendations: string[]; // 建议
  
  // 实施路线图
  roadmap: Array<{
    phase: string;
    cous: string[];
    estimatedTime: string;
    priority: number;
  }>;
}

// ============ 筛选条件 ============

export interface FilterCriteria {
  keyword: string;
  levels: PolicyLevel[];
  industries: Industry[];
  regions: Region[];
  tags: string[];
  weightRange: [number, number];
  complianceTypes: string[];
  status?: string[];
  dateRange?: [string, string];
  
  // COU特定筛选
  obligationTypes?: string[];
  userTypes?: UserType[];
}

// ============ 用户和组织 ============

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "member" | "viewer";
  organizationId: string;
  avatar?: string;
  createdAt: string;
  lastLoginAt: string;
  preferences: {
    defaultIndustry?: Industry;
    defaultRegion?: Region;
    emailNotifications: boolean;
  };
}

export interface Organization {
  id: string;
  name: string;
  type: "individual" | "enterprise" | "education"; // 个人/企业/高校
  industry: Industry;
  size?: "small" | "medium" | "large";
  
  // 联系信息
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  
  // 企业信息
  unifiedSocialCreditCode?: string;
  licenseUrl?: string;
  
  // 订阅信息
  subscriptionId: string;
  subscriptionStatus: "trial" | "active" | "expired" | "cancelled";
  
  // 使用统计
  userCount: number;
  sceneCount: number;
  apiCallsThisMonth: number;
  
  createdAt: string;
  status: "active" | "suspended";
}

// ============ 订阅相关 ============

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  type: "individual" | "enterprise" | "education";
  price: number;
  billingCycle: "monthly" | "yearly";
  
  features: string[];
  limits: {
    users: number;
    scenes: number;
    apiCalls: number;
    storage: number;
    exportLimit: number; // 导出次数限制
  };
  
  // 功能权限
  permissions: {
    advancedSearch: boolean;
    aiAnalysis: boolean;
    versionHistory: boolean;
    apiAccess: boolean;
    customScenes: boolean;
    bulkExport: boolean;
    prioritySupport: boolean;
  };
  
  isPopular?: boolean;
  isTrial?: boolean;
}

export interface Subscription {
  id: string;
  organizationId: string;
  planId: string;
  status: "trial" | "active" | "expired" | "cancelled";
  startDate: string;
  endDate: string;
  trialEndDate?: string;
  
  currentUsage: {
    users: number;
    scenes: number;
    apiCalls: number;
    storage: number;
    exports: number;
  };
  
  autoRenew: boolean;
  paymentMethod?: string;
}

// ============ API相关 ============

export interface ApiKey {
  id: string;
  organizationId: string;
  name: string;
  key: string;
  secret: string;
  status: "active" | "suspended" | "revoked";
  permissions: string[];
  rateLimit: number;
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
}

// ============ 统计分析 ============

export interface DataStats {
  totalPolicies: number;
  totalClauses: number;
  totalCOUs: number;
  totalScenes: number;
  
  policiesByLevel: Record<PolicyLevel, number>;
  policiesByIndustry: Record<Industry, number>;
  policiesByRegion: Record<Region, number>;
  
  recentUpdates: Array<{
    id: string;
    title: string;
    type: "policy" | "clause" | "cou";
    updateDate: string;
    changeType: "new" | "updated" | "deprecated";
  }>;
  
  popularScenes: SceneTemplate[];
  popularTags: Array<{ tag: string; count: number }>;
}

export interface UsageStats {
  date: string;
  searches: number;
  sceneCreations: number;
  exports: number;
  apiCalls: number;
  uniqueUsers: number;
  avgResponseTime: number;
}

// ============ 搜索结果 ============

export interface SearchResult {
  type: "policy" | "clause" | "cou";
  id: string;
  title: string;
  content: string;
  relevanceScore: number;
  highlights: string[];
  metadata: any;
}

// ============ Admin RBAC Re-exports ============

export {
  AdminRole,
  ROLE_DISPLAY_INFO,
  PermissionNamespace,
  PermissionAction,
  ALL_PERMISSIONS,
  ROLE_DEFAULT_PERMISSIONS,
  AuditAction,
  AuditTargetType,
  ApprovalStatus,
  ApprovalType,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getUserPermissions,
  parsePermission,
  buildPermission,
} from "./admin";

export type {
  Permission,
  AdminUser,
  AuditLog,
  ApprovalRequest,
  RoleDefinition,
} from "./admin";

// ============ 五维标签系统 Re-exports ============

export {
  TAG_DOMAIN_INFO,
  ACTION_PRIORITY_ORDER,
  ACTION_PRIORITY_INFO,
  type TagDomain,
  type TagStatus,
  type Tag,
  type COUTagRelation,
  type ActionRequirement,
  type ActionPriority,
  type ToDoItem,
  type SceneQuery,
  type MatchedCOU,
  type SceneTagProfile,
  type TagHierarchyPath,
  type LegacyTag,
  type LegacyTagCategory,
  type TagMigrationMap,
} from "./tag";
