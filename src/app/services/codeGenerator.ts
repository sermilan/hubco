// ============ 智能编码生成器 ============
// 自动为 COU、控制目标、条款等实体生成符合规则的编码

import type { ControlCategory, Policy, ControlObjective, COU, Clause } from "../types";

// ============ 编码规则配置 ============

/** 控制类别编码映射 */
const CATEGORY_CODE_MAP: Record<ControlCategory, string> = {
  "预防性": "PR",
  "检测性": "DE",
  "纠正性": "CO",
  "管理性": "MG",
  "技术性": "TC",
  "物理性": "PH",
};

/** 常见政策关键词映射（用于生成简码） */
const POLICY_KEYWORD_MAP: Record<string, string> = {
  "数据安全法": "DSL",
  "个人信息保护法": "PIPL",
  "网络安全法": "CSL",
  "数据出境": "DC",
  "安全评估": "SA",
  "等级保护": "MLPS",
  "关键信息基础设施": "CII",
  "个人信息": "PI",
  "数据分类分级": "DCG",
  "密码法": "CRYPTO",
  "电子签名": "ESIGN",
  "电子商务": "ECOMM",
  "消费者权益": "CONSUMER",
};

// ============ 辅助函数 ============

/**
 * 从政策标题生成简码
 * 规则：
 * 1. 匹配已知关键词优先
 * 2. 否则取首字母缩写（限3-6位）
 * 3. 冲突时添加数字后缀
 */
export function generatePolicyShortCode(title: string): string {
  // 1. 尝试匹配已知关键词
  for (const [keyword, code] of Object.entries(POLICY_KEYWORD_MAP)) {
    if (title.includes(keyword)) {
      return code;
    }
  }

  // 2. 取首字母缩写
  const initials = title
    .replace(/[《》]/g, "") // 去除书名号
    .split(/\s+|\-/)
    .map((word) => word[0])
    .filter((char) => /[a-zA-Z\u4e00-\u9fa5]/.test(char))
    .slice(0, 4)
    .join("")
    .toUpperCase();

  // 3. 如果全是中文，取拼音首字母或前6位
  if (/^[\u4e00-\u9fa5]+$/.test(initials)) {
    return title
      .replace(/[《》]/g, "")
      .slice(0, 6)
      .toUpperCase();
  }

  return initials || "GEN";
}

/**
 * 生成序号后缀（3位数字）
 */
function generateSequenceNumber(existings: string[], prefix: string): string {
  const regex = new RegExp(`^${prefix}-(\\d{3})$`);
  const numbers = existings
    .map((code) => {
      const match = code.match(regex);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => n > 0);

  const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
  return String(maxNum + 1).padStart(3, "0");
}

// ============ COU 编码生成 ============

export interface COUCodeContext {
  policy?: Policy;
  existingCodes?: string[];
}

/**
 * 生成 COU 编码
 * 格式: COU-{政策简码}-{序号:000}
 * 例: COU-DSL-001, COU-PIPL-015
 */
export function generateCOUCode(context: COUCodeContext): string {
  const { policy, existingCodes = [] } = context;

  if (!policy) {
    return "COU-NEW-001";
  }

  const shortCode = policy.code || generatePolicyShortCode(policy.title);
  const prefix = `COU-${shortCode}`;
  const sequence = generateSequenceNumber(existingCodes, prefix);

  return `${prefix}-${sequence}`;
}

/**
 * 预览 COU 编码（不生成实际序号）
 */
export function previewCOUCode(policy?: Policy): string {
  if (!policy) return "COU-XXX-000";
  const shortCode = policy.code || generatePolicyShortCode(policy.title);
  return `COU-${shortCode}-XXX`;
}

// ============ 控制目标编码生成 ============

export interface ControlObjectiveCodeContext {
  category: ControlCategory;
  existingCodes?: string[];
}

/**
 * 生成控制目标编码
 * 格式: CO-{类别码}-{序号:000}
 * 例: CO-PR-001 (预防性), CO-DE-003 (检测性)
 */
export function generateControlObjectiveCode(
  context: ControlObjectiveCodeContext
): string {
  const { category, existingCodes = [] } = context;
  const categoryCode = CATEGORY_CODE_MAP[category] || "UN";
  const prefix = `CO-${categoryCode}`;
  const sequence = generateSequenceNumber(existingCodes, prefix);

  return `${prefix}-${sequence}`;
}

/**
 * 预览控制目标编码
 */
export function previewControlObjectiveCode(category: ControlCategory): string {
  const categoryCode = CATEGORY_CODE_MAP[category] || "XX";
  return `CO-${categoryCode}-XXX`;
}

// ============ 条款编码 ============

export interface ClauseCodeContext {
  chapter?: string;
  article: string;
}

/**
 * 生成条款编码（展示用）
 * 格式: {章节}{条号}
 * 例: 第27条, 第四章第15条
 */
export function generateClauseCode(context: ClauseCodeContext): string {
  const { chapter, article } = context;

  if (chapter && chapter !== "未分类") {
    return `${chapter}${article}`;
  }
  return article;
}

// ============ 编码验证 ============

/**
 * 验证 COU 编码格式
 */
export function validateCOUCode(code: string): boolean {
  return /^COU-[A-Z]+-\d{3}$/.test(code);
}

/**
 * 验证控制目标编码格式
 */
export function validateControlObjectiveCode(code: string): boolean {
  return /^CO-[A-Z]{2}-\d{3}$/.test(code);
}

/**
 * 检查编码是否已存在
 */
export function isCodeDuplicate(code: string, existingCodes: string[]): boolean {
  return existingCodes.includes(code);
}

// ============ 批量编码生成 ============

export interface BatchCOUCodeItem {
  policy: Policy;
  suggestedCode: string;
}

/**
 * 批量生成 COU 编码（用于导入场景）
 */
export function batchGenerateCOUCodes(
  policies: Policy[],
  existingCodes: string[]
): BatchCOUCodeItem[] {
  const codeCounters: Record<string, number> = {};

  return policies.map((policy) => {
    const shortCode = policy.code || generatePolicyShortCode(policy.title);
    const prefix = `COU-${shortCode}`;

    if (!codeCounters[prefix]) {
      // 查找现有最大序号
      const regex = new RegExp(`^${prefix}-(\\d{3})$`);
      const numbers = existingCodes
        .map((code) => {
          const match = code.match(regex);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter((n) => n > 0);

      codeCounters[prefix] = numbers.length > 0 ? Math.max(...numbers) : 0;
    }

    codeCounters[prefix]++;
    const sequence = String(codeCounters[prefix]).padStart(3, "0");

    return {
      policy,
      suggestedCode: `${prefix}-${sequence}`,
    };
  });
}
