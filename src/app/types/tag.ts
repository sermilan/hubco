// ============ 五维标签字典体系 ============
// Five-Dimensional Tag Dictionary System

/** 标签维度类型 */
export type TagDomain =
  | "OBJECT"      // 客体维度 - 保护对象
  | "SUBJECT"     // 主体维度 - 责任主体
  | "LIFECYCLE"   // 业务流转维度 - 业务环节
  | "SECURITY"    // 安全域维度 - 保护手段
  | "ACTION";     // 动作义务维度 - COU核心

/** 标签维度显示信息 */
export const TAG_DOMAIN_INFO: Record<TagDomain, { name: string; nameEn: string; color: string; description: string }> = {
  OBJECT: {
    name: "客体维度",
    nameEn: "Object Domain",
    color: "#3B82F6", // blue-500
    description: "保护对象 - 数据类型和敏感级别",
  },
  SUBJECT: {
    name: "主体维度",
    nameEn: "Subject Domain",
    color: "#8B5CF6", // violet-500
    description: "责任主体 - 数据处理者类型",
  },
  LIFECYCLE: {
    name: "业务流转",
    nameEn: "Lifecycle Domain",
    color: "#10B981", // emerald-500
    description: "业务环节 - 数据生命周期阶段",
  },
  SECURITY: {
    name: "安全域",
    nameEn: "Security Domain",
    color: "#F59E0B", // amber-500
    description: "保护手段 - 技术和管理措施",
  },
  ACTION: {
    name: "动作义务",
    nameEn: "Action Domain",
    color: "#EF4444", // red-500
    description: "核心义务 - 必须执行的动作",
  },
};

/** 标签状态 */
export type TagStatus = "active" | "deprecated";

/** 五维标签定义 */
export interface Tag {
  id: string;
  code: string;              // 机器可读: OBJ-PI, ACT-ASS
  name: string;              // 人类可读: 个人信息, 评估与审计
  nameEn: string;            // 英文名称
  domain: TagDomain;         // 所属维度
  description: string;       // 详细描述
  weight: number;            // 基础权重贡献 (1-10)
  keywords: string[];        // AI自动匹配关键词
  relatedCodes?: string[];   // 关联的其他Tag Code
  parentCode?: string;       // 父标签Code（层级继承）
  childrenCodes?: string[];  // 子标签Codes
  version: string;           // 标签版本
  status: TagStatus;
  color: string;             // UI展示颜色
  icon?: string;             // 图标标识
}

/** 标签与COU的关联关系 */
export interface COUTagRelation {
  couId: string;
  tagCode: string;
  weight: number;            // 该COU中此标签的具体权重
  confidence: number;        // 自动匹配置信度 (0-1)
  isAutoTagged: boolean;     // 是否AI自动标注
  sourceClauseId?: string;   // 来源条款ID
}

/** 动作优先级 */
export type ActionPriority = "critical" | "high" | "medium" | "low";

/** 动作优先级排序值（用于排序，越小越优先） */
export const ACTION_PRIORITY_ORDER: Record<ActionPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

/** 动作优先级显示信息 */
export const ACTION_PRIORITY_INFO: Record<ActionPriority, { name: string; color: string; bgColor: string }> = {
  critical: { name: "阻断性", color: "#DC2626", bgColor: "bg-red-100" },
  high: { name: "高优先级", color: "#EA580C", bgColor: "bg-orange-100" },
  medium: { name: "中优先级", color: "#CA8A04", bgColor: "bg-yellow-100" },
  low: { name: "低优先级", color: "#16A34A", bgColor: "bg-green-100" },
};

/** 动作要求定义 */
export interface ActionRequirement {
  actionCode: string;        // 对应 ACT-xxx
  description: string;       // 具体动作描述
  deadline?: string;         // 期限要求 (如 "72小时", "立即", "年度")
  priority: ActionPriority;
  isBlocking: boolean;       // 是否阻断性要求
  checkPoints: string[];     // 检查点清单
  deliverables?: string[];   // 交付物清单
}

/** To-Do 任务项 */
export interface ToDoItem {
  id: string;
  title: string;
  description?: string;
  sourceCOU: string;         // COU Code
  sourcePolicy: string;      // 政策标题
  actionType: string;        // ACT-xxx
  priority: ActionPriority;
  deadline?: string;
  dueDate?: Date;
  isBlocking: boolean;
  checkPoints: string[];
  deliverables?: string[];
  status: "pending" | "in_progress" | "completed" | "overdue";
  completedAt?: Date;
  assignedTo?: string;
  tags: string[];            // 相关标签Codes
  createdAt: Date;
  updatedAt: Date;
}

/** 场景查询条件 */
export interface SceneQuery {
  // 用户画像
  industry?: string;
  regions: string[];
  userType?: string;

  // 标签选择（用户勾选）
  selectedTags: {
    objects: string[];       // OBJ-xxx
    subjects: string[];      // SUB-xxx
    lifecycles: string[];    // LIF-xxx
    securities: string[];    // SEC-xxx
    actions: string[];       // ACT-xxx
  };

  // 匹配配置
  matchingConfig: {
    minMatchScore: number;           // 最小匹配分数阈值
    boostForActionTags: boolean;     // 是否提升动作标签权重
    requireAllActionTags: boolean;   // 是否要求命中所有动作标签
    includeRelatedTags: boolean;     // 是否包含关联标签
  };
}

/** 匹配结果 */
export interface MatchedCOU {
  couId: string;
  matchScore: number;        // 匹配分数
  matchedTags: string[];     // 匹配到的标签Codes
  missedRequiredTags: string[]; // 未匹配到的必需标签
  tagWeights: Record<string, number>; // 各标签贡献权重
  confidence: number;        // 整体置信度
}

/** 场景标签配置 */
export interface SceneTagProfile {
  requiredTags: string[];       // 必须匹配的标签
  preferredTags: string[];      // 优先匹配的标签
  excludedTags: string[];       // 排除的标签
  tagWeights: Record<string, number>; // 场景内各标签权重系数
  tagCoefficients: Record<string, number>; // 维度系数 (ACTION维度通常更高)
}

/** 标签层级路径（用于继承计算） */
export interface TagHierarchyPath {
  tag: Tag;
  ancestors: Tag[];          // 祖先标签（从根到父）
  descendants: Tag[];        // 后代标签
  siblings: Tag[];           // 同级标签
}

// ============ 旧版标签兼容性 ============

/** 旧版标签分类（用于向后兼容） */
export type LegacyTagCategory = "法律" | "技术" | "管理" | "行业" | "场景";

/** 旧版标签（用于数据迁移） */
export interface LegacyTag {
  id: string;
  name: string;
  color: string;
  category: LegacyTagCategory;
  weight?: number;
  relatedScenes?: string[];
}

/** 标签映射关系（旧标签 -> 新标签Codes） */
export interface TagMigrationMap {
  legacyTagName: string;
  newTagCodes: string[];     // 可能一对多
  confidence: number;        // 映射置信度
  migrationNote?: string;
}
