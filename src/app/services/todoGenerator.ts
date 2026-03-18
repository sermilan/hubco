// ============ To-Do List 生成器 ============
// 基于 COU 的动作义务维度生成待办任务清单

import type {
  COU,
  ToDoItem,
  ActionRequirement,
  ActionPriority,
  MatchedCOU,
} from "../types";
import {
  ACTION_PRIORITY_ORDER,
  ACTION_PRIORITY_INFO,
} from "../types";
import { TAG_CODE_MAP } from "../data/tagDictionary";

// ============ 配置常量 ============

/** 截止日期计算规则 */
const DEADLINE_RULES: Record<string, (baseDate: Date) => Date> = {
  "立即": () => new Date(),
  "24小时": (base) => {
    const d = new Date(base);
    d.setHours(d.getHours() + 24);
    return d;
  },
  "48小时": (base) => {
    const d = new Date(base);
    d.setHours(d.getHours() + 48);
    return d;
  },
  "72小时": (base) => {
    const d = new Date(base);
    d.setHours(d.getHours() + 72);
    return d;
  },
  "7天": (base) => {
    const d = new Date(base);
    d.setDate(d.getDate() + 7);
    return d;
  },
  "15天": (base) => {
    const d = new Date(base);
    d.setDate(d.getDate() + 15);
    return d;
  },
  "30天": (base) => {
    const d = new Date(base);
    d.setDate(d.getDate() + 30);
    return d;
  },
  "季度": (base) => {
    const d = new Date(base);
    d.setMonth(d.getMonth() + 3);
    return d;
  },
  "年度": (base) => {
    const d = new Date(base);
    d.setFullYear(d.getFullYear() + 1);
    return d;
  },
};

/** 优先级分组配置 */
const PRIORITY_GROUPS = {
  blocking: { label: "阻断性任务", order: 0 },
  critical: { label: "关键任务", order: 1 },
  high: { label: "高优先级", order: 2 },
  medium: { label: "中优先级", order: 3 },
  low: { label: "低优先级", order: 4 },
};

// ============ 核心生成函数 ============

/**
 * 从匹配的 COU 列表生成 To-Do List
 *
 * @param matchedCOUs - 匹配的 COU 列表（含匹配分数）
 * @param allCOUs - 所有 COU 数据（用于查找完整信息）
 * @param options - 生成选项
 * @returns 排序后的 To-Do 任务列表
 */
export function generateToDoList(
  matchedCOUs: MatchedCOU[],
  allCOUs: COU[],
  options: {
    includeNonAction?: boolean;    // 是否包含无动作标签的 COU
    baseDate?: Date;               // 计算截止日期的基准日期
    assignedTo?: string;           // 默认分配人
    filterByPriority?: ActionPriority[]; // 按优先级筛选
  } = {}
): ToDoItem[] {
  const {
    includeNonAction = false,
    baseDate = new Date(),
    assignedTo,
    filterByPriority,
  } = options;

  const todoItems: ToDoItem[] = [];

  for (const matched of matchedCOUs) {
    const cou = allCOUs.find((c) => c.id === matched.couId);
    if (!cou) continue;

    // 跳过无动作标签的 COU（除非明确指定包含）
    if (!includeNonAction && cou.fiveDimensionalTags.actions.length === 0) {
      continue;
    }

    // 从 actionRequirements 生成 To-Do
    if (cou.actionRequirements && cou.actionRequirements.length > 0) {
      for (const action of cou.actionRequirements) {
        // 优先级筛选
        if (filterByPriority && !filterByPriority.includes(action.priority)) {
          continue;
        }

        const todo = createToDoItemFromAction(
          cou,
          action,
          matched,
          baseDate,
          assignedTo
        );
        todoItems.push(todo);
      }
    } else {
      // 如果没有明确的 actionRequirements，从动作标签生成基础 To-Do
      for (const actionCode of cou.fiveDimensionalTags.actions) {
        const todo = createToDoItemFromActionTag(
          cou,
          actionCode,
          matched,
          baseDate,
          assignedTo
        );
        if (todo) todoItems.push(todo);
      }
    }
  }

  // 排序：阻断性 > 关键 > 高 > 中 > 低，相同优先级按截止日期
  return sortToDoItems(todoItems);
}

/**
 * 从 ActionRequirement 创建 To-Do 项
 */
function createToDoItemFromAction(
  cou: COU,
  action: ActionRequirement,
  matched: MatchedCOU,
  baseDate: Date,
  assignedTo?: string
): ToDoItem {
  const dueDate = calculateDueDate(action.deadline, baseDate);

  return {
    id: `${cou.id}-${action.actionCode}-${Date.now()}`,
    title: action.description,
    description: `${cou.title}\n来源：${cou.policyTitle} ${cou.code}`,
    sourceCOU: cou.code,
    sourcePolicy: cou.policyTitle,
    actionType: action.actionCode,
    priority: action.priority,
    deadline: action.deadline,
    dueDate,
    isBlocking: action.isBlocking,
    checkPoints: action.checkPoints || [],
    deliverables: action.deliverables || [],
    status: "pending",
    assignedTo,
    tags: [
      ...matched.matchedTags,
      ...cou.fiveDimensionalTags.objects,
      ...cou.fiveDimensionalTags.lifecycles,
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * 从动作标签创建基础 To-Do 项
 */
function createToDoItemFromActionTag(
  cou: COU,
  actionCode: string,
  matched: MatchedCOU,
  baseDate: Date,
  assignedTo?: string
): ToDoItem | null {
  const tag = TAG_CODE_MAP[actionCode];
  if (!tag) return null;

  // 根据标签推断优先级
  const priority = inferPriorityFromTag(tag.domain, tag.weight);

  // 根据标签推断截止日期
  const deadline = inferDeadlineFromActionCode(actionCode);
  const dueDate = calculateDueDate(deadline, baseDate);

  // 生成检查点
  const checkPoints = generateCheckPointsFromAction(actionCode);

  return {
    id: `${cou.id}-${actionCode}-${Date.now()}`,
    title: `执行${tag.name}：${cou.actionRequired || cou.title}`,
    description: `${cou.title}\n来源：${cou.policyTitle} ${cou.code}`,
    sourceCOU: cou.code,
    sourcePolicy: cou.policyTitle,
    actionType: actionCode,
    priority,
    deadline,
    dueDate,
    isBlocking: priority === "critical",
    checkPoints,
    deliverables: [],
    status: "pending",
    assignedTo,
    tags: matched.matchedTags,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ============ 排序与分组 ============

/**
 * 排序 To-Do 列表
 *
 * 排序规则：
 * 1. 阻断性任务优先
 * 2. 按优先级（critical > high > medium > low）
 * 3. 相同优先级按截止日期（越近越优先）
 * 4. 相同截止日期按匹配分数
 */
export function sortToDoItems(items: ToDoItem[]): ToDoItem[] {
  return [...items].sort((a, b) => {
    // 阻断性优先
    if (a.isBlocking !== b.isBlocking) {
      return a.isBlocking ? -1 : 1;
    }

    // 优先级排序
    const priorityDiff =
      ACTION_PRIORITY_ORDER[a.priority] - ACTION_PRIORITY_ORDER[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // 截止日期排序（越近越优先）
    if (a.dueDate && b.dueDate) {
      return a.dueDate.getTime() - b.dueDate.getTime();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;

    return 0;
  });
}

/**
 * 按优先级分组 To-Do 列表
 */
export function groupToDoItemsByPriority(items: ToDoItem[]): {
  blocking: ToDoItem[];
  critical: ToDoItem[];
  high: ToDoItem[];
  medium: ToDoItem[];
  low: ToDoItem[];
} {
  return {
    blocking: items.filter((i) => i.isBlocking),
    critical: items.filter((i) => !i.isBlocking && i.priority === "critical"),
    high: items.filter((i) => i.priority === "high"),
    medium: items.filter((i) => i.priority === "medium"),
    low: items.filter((i) => i.priority === "low"),
  };
}

/**
 * 按状态分组 To-Do 列表
 */
export function groupToDoItemsByStatus(items: ToDoItem[]): {
  pending: ToDoItem[];
  inProgress: ToDoItem[];
  completed: ToDoItem[];
  overdue: ToDoItem[];
} {
  const now = new Date();

  return {
    pending: items.filter(
      (i) => i.status === "pending" && (!i.dueDate || i.dueDate > now)
    ),
    inProgress: items.filter((i) => i.status === "in_progress"),
    completed: items.filter((i) => i.status === "completed"),
    overdue: items.filter(
      (i) =>
        i.status !== "completed" && i.dueDate && i.dueDate < now
    ),
  };
}

// ============ 辅助函数 ============

/**
 * 计算截止日期
 */
function calculateDueDate(
  deadlineRule?: string,
  baseDate: Date = new Date()
): Date | undefined {
  if (!deadlineRule) return undefined;

  const rule = DEADLINE_RULES[deadlineRule];
  if (rule) {
    return rule(baseDate);
  }

  // 尝试解析天数
  const daysMatch = deadlineRule.match(/(\d+)天?/);
  if (daysMatch) {
    const days = parseInt(daysMatch[1], 10);
    const d = new Date(baseDate);
    d.setDate(d.getDate() + days);
    return d;
  }

  // 尝试解析为日期
  const parsedDate = new Date(deadlineRule);
  if (!isNaN(parsedDate.getTime())) {
    return parsedDate;
  }

  return undefined;
}

/**
 * 从标签推断优先级
 */
function inferPriorityFromTag(
  domain: string,
  weight: number
): ActionPriority {
  if (domain === "ACTION" && weight >= 5) return "critical";
  if (weight >= 5) return "high";
  if (weight >= 3) return "medium";
  return "low";
}

/**
 * 从动作代码推断默认截止日期规则
 */
function inferDeadlineFromActionCode(actionCode: string): string | undefined {
  const deadlineMap: Record<string, string> = {
    "ACT-REP": "72小时",    // 报告类通常有72小时要求
    "ACT-RES": "15天",      // 响应请求通常15天
    "ACT-REM": "立即",      // 整改通常要求立即
    "ACT-REG": "30天",      // 备案通常30天
    "ACT-ASS": "季度",      // 评估通常季度
    "ACT-AUD": "年度",      // 审计通常年度
  };

  return deadlineMap[actionCode];
}

/**
 * 从动作代码生成检查点
 */
function generateCheckPointsFromActionCode(actionCode: string): string[] {
  const checkPointsMap: Record<string, string[]> = {
    "ACT-NOT": [
      "制定隐私政策/告知文本",
      "确定告知方式和时机",
      "获取用户确认记录",
    ],
    "ACT-CON": [
      "设计同意机制",
      "记录同意证据",
      "提供撤回同意渠道",
    ],
    "ACT-ASS": [
      "识别评估范围",
      "开展影响评估",
      "形成评估报告",
      "留存评估记录",
    ],
    "ACT-REP": [
      "确认报告触发条件",
      "准备报告材料",
      "在规定时间内提交",
    ],
    "ACT-RES": [
      "验证请求人身份",
      "检索相关数据",
      "在规定时间内响应",
    ],
    "ACT-REG": [
      "确认备案类型和要求",
      "准备备案材料",
      "提交备案申请",
    ],
    "ACT-CTR": [
      "识别需要签署合同的场景",
      "准备标准合同条款",
      "签署并留存合同",
    ],
    "ACT-DOC": [
      "确定记录范围",
      "建立记录模板",
      "定期更新记录",
    ],
    "ACT-AUD": [
      "制定审计计划",
      "执行审计程序",
      "形成审计报告",
    ],
    "ACT-REM": [
      "识别整改事项",
      "制定整改方案",
      "执行整改措施",
      "验证整改效果",
    ],
  };

  return checkPointsMap[actionCode] || ["执行相应合规动作"];
}

// ============ 进度统计 ============

/**
 * To-Do 列表统计信息
 */
export interface ToDoStats {
  total: number;
  byStatus: {
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
  };
  byPriority: {
    blocking: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  completionRate: number;      // 完成率 (0-1)
  overdueRate: number;         // 逾期率 (0-1)
  averageCompletionTime?: number; // 平均完成时间（小时）
}

/**
 * 计算 To-Do 列表统计
 */
export function calculateToDoStats(items: ToDoItem[]): ToDoStats {
  const byStatus = groupToDoItemsByStatus(items);
  const byPriority = groupToDoItemsByPriority(items);

  const total = items.length;
  const completed = byStatus.completed.length;
  const overdue = byStatus.overdue.length;

  return {
    total,
    byStatus: {
      pending: byStatus.pending.length,
      inProgress: byStatus.inProgress.length,
      completed: completed,
      overdue: overdue,
    },
    byPriority: {
      blocking: byPriority.blocking.length,
      critical: byPriority.critical.length,
      high: byPriority.high.length,
      medium: byPriority.medium.length,
      low: byPriority.low.length,
    },
    completionRate: total > 0 ? completed / total : 0,
    overdueRate: total > 0 ? overdue / total : 0,
  };
}

// ============ 更新操作 ============

/**
 * 更新 To-Do 状态
 */
export function updateToDoStatus(
  item: ToDoItem,
  newStatus: ToDoItem["status"]
): ToDoItem {
  const updates: Partial<ToDoItem> = {
    status: newStatus,
    updatedAt: new Date(),
  };

  if (newStatus === "completed" && !item.completedAt) {
    updates.completedAt = new Date();
  }

  return { ...item, ...updates };
}

/**
 * 批量更新 To-Do 状态
 */
export function batchUpdateToDoStatus(
  items: ToDoItem[],
  ids: string[],
  newStatus: ToDoItem["status"]
): ToDoItem[] {
  const idSet = new Set(ids);
  return items.map((item) =>
    idSet.has(item.id) ? updateToDoStatus(item, newStatus) : item
  );
}

/**
 * 检查并标记逾期任务
 */
export function markOverdueItems(items: ToDoItem[]): ToDoItem[] {
  const now = new Date();

  return items.map((item) => {
    if (
      item.status !== "completed" &&
      item.dueDate &&
      item.dueDate < now &&
      item.status !== "overdue"
    ) {
      return { ...item, status: "overdue", updatedAt: new Date() };
    }
    return item;
  });
}
