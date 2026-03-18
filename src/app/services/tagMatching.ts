// ============ 五维标签匹配与检索引擎 ============
// Five-Dimensional Tag Matching & Search Engine

import type {
  COU,
  SceneQuery,
  MatchedCOU,
  SceneTagProfile,
  SceneMatchingConfig,
  FiveDimensionalTags,
  PolicyLevel,
} from "../types";
import {
  POLICY_LEVEL_WEIGHTS,
  PENALTY_WEIGHTS,
} from "../types";
import {
  ALL_TAGS,
  TAG_CODE_MAP,
  getTagAncestors,
  getTagDescendants,
  getRelatedTags,
  SCENE_TAG_TEMPLATES,
} from "../data/tagDictionary";

// ============ 权重计算配置 ============

/** 默认匹配配置 */
export const DEFAULT_MATCHING_CONFIG: SceneMatchingConfig = {
  minMatchScore: 0.3,
  boostForActionTags: true,
  requireAllActionTags: false,
  includeRelatedTags: true,
  includeHierarchy: true,
};

/** 维度系数（ACTION维度权重更高） */
export const DOMAIN_COEFFICIENTS: Record<string, number> = {
  OBJECT: 1.0,
  SUBJECT: 1.2,
  LIFECYCLE: 1.0,
  SECURITY: 0.8,
  ACTION: 1.5, // 动作义务维度权重最高
};

/** 场景匹配奖励系数 */
const SCENARIO_BONUS_FACTOR = 0.1;

// ============ 核心匹配函数 ============

/**
 * 计算 COU 与场景查询的匹配分数
 *
 * 算法：MatchScore = Σ(tagWeight × tagCoefficient × confidence) / Σ(queryTagWeights)
 *
 * @param cou - 待匹配的 COU
 * @param query - 场景查询条件
 * @returns 匹配分数 (0-1)
 */
export function calculateMatchScore(
  cou: COU,
  query: SceneQuery
): number {
  const { selectedTags, matchingConfig } = query;
  const config = { ...DEFAULT_MATCHING_CONFIG, ...matchingConfig };

  // 合并所有查询标签
  const allQueryTags = [
    ...selectedTags.objects,
    ...selectedTags.subjects,
    ...selectedTags.lifecycles,
    ...selectedTags.securities,
    ...selectedTags.actions,
  ];

  if (allQueryTags.length === 0) return 0;

  // 获取 COU 的所有标签Codes
  const couTags = flattenFiveDimensionalTags(cou.fiveDimensionalTags);

  let matchScore = 0;
  let totalWeight = 0;
  let actionMatchCount = 0;

  for (const queryCode of allQueryTags) {
    const queryTag = TAG_CODE_MAP[queryCode];
    if (!queryTag) continue;

    const tagWeight = queryTag.weight;
    totalWeight += tagWeight;

    // 维度系数
    const domainCoefficient =
      DOMAIN_COEFFICIENTS[queryTag.domain] ?? 1.0;

    // 检查直接匹配
    if (couTags.includes(queryCode)) {
      let score = tagWeight * domainCoefficient * 1.0;

      // 动作标签权重加成
      if (config.boostForActionTags && queryTag.domain === "ACTION") {
        score *= 1.3;
        actionMatchCount++;
      }

      matchScore += score;
      continue;
    }

    // 检查层级继承匹配
    if (config.includeHierarchy) {
      // 祖先匹配（查询标签是 COU 标签的祖先）
      for (const couCode of couTags) {
        const ancestors = getTagAncestors(couCode);
        if (ancestors.some((t) => t.code === queryCode)) {
          matchScore += tagWeight * domainCoefficient * 0.8;
          break;
        }

        // 后代匹配（查询标签是 COU 标签的后代）
        const descendants = getTagDescendants(couCode);
        if (descendants.some((t) => t.code === queryCode)) {
          matchScore += tagWeight * domainCoefficient * 0.9;
          break;
        }
      }
    }

    // 检查关联标签匹配
    if (config.includeRelatedTags) {
      for (const couCode of couTags) {
        const related = getRelatedTags(couCode);
        if (related.some((t) => t.code === queryCode)) {
          matchScore += tagWeight * domainCoefficient * 0.6;
          break;
        }
      }
    }
  }

  // 如果要求匹配所有动作标签但未全部匹配，大幅降低分数
  if (config.requireAllActionTags && selectedTags.actions.length > 0) {
    const requiredActionMatches = selectedTags.actions.filter((code) =>
      couTags.includes(code)
    ).length;
    if (requiredActionMatches < selectedTags.actions.length) {
      return 0;
    }
  }

  // 场景匹配奖励：匹配到的标签越多，奖励越高
  const matchRatio = totalWeight > 0 ? matchScore / totalWeight : 0;
  const scenarioBonus = matchRatio * SCENARIO_BONUS_FACTOR;

  const finalScore = totalWeight > 0 ? matchScore / totalWeight + scenarioBonus : 0;

  return Math.min(finalScore, 1.0);
}

/**
 * 计算 COU 的最终权重
 *
 * 公式：FinalWeight = W_L × W_P × (1 + TagMatchScore) × ScenarioBonus
 *
 * @param cou - COU对象
 * @param matchScore - 标签匹配分数
 * @returns 最终权重
 */
export function calculateFinalWeight(
  cou: COU,
  matchScore: number = 0
): number {
  // 基础权重（政策层级 $W_L$）
  const levelWeight = POLICY_LEVEL_WEIGHTS[cou.policyLevel] ?? 5;

  // 罚则力度权重（$W_P$）
  const penaltyWeight = cou.penaltyLevel
    ? PENALTY_WEIGHTS[cou.penaltyLevel]
    : calculatePenaltyWeightFromDescription(cou.penalty);

  // 场景匹配奖励
  const scenarioBonus = 1 + matchScore * 0.5;

  // 计算最终权重
  const finalWeight =
    levelWeight * penaltyWeight * (1 + matchScore) * scenarioBonus;

  return Math.round(finalWeight * 10) / 10; // 保留一位小数
}

/**
 * 从违规后果描述推断罚则力度权重
 */
function calculatePenaltyWeightFromDescription(
  penaltyDesc?: string
): number {
  if (!penaltyDesc) return 1;

  const desc = penaltyDesc.toLowerCase();

  if (desc.includes("刑事") || desc.includes("判刑") || desc.includes("拘役")) {
    return 5;
  }
  if (desc.includes("1000万") || desc.includes("5000万") || desc.includes("上一年度营业额")) {
    return 4;
  }
  if (desc.includes("100万") || desc.includes("500万") || desc.includes("罚款")) {
    return 3;
  }
  if (desc.includes("警告") || desc.includes("整改") || desc.includes("限期")) {
    return 2;
  }

  return 1;
}

/**
 * 查找匹配的标签
 */
export function findMatchedTags(
  cou: COU,
  query: SceneQuery
): string[] {
  const couTags = flattenFiveDimensionalTags(cou.fiveDimensionalTags);
  const allQueryTags = flattenSelectedTags(query.selectedTags);

  const matched: string[] = [];

  for (const queryCode of allQueryTags) {
    // 直接匹配
    if (couTags.includes(queryCode)) {
      matched.push(queryCode);
      continue;
    }

    // 层级匹配
    for (const couCode of couTags) {
      const ancestors = getTagAncestors(couCode);
      const descendants = getTagDescendants(couCode);

      if (
        ancestors.some((t) => t.code === queryCode) ||
        descendants.some((t) => t.code === queryCode)
      ) {
        matched.push(queryCode);
        break;
      }
    }
  }

  return [...new Set(matched)];
}

/**
 * 查找未匹配的必需标签
 */
export function findMissedRequiredTags(
  cou: COU,
  query: SceneQuery,
  requiredTags?: string[]
): string[] {
  if (!requiredTags || requiredTags.length === 0) return [];

  const matchedTags = findMatchedTags(cou, query);
  return requiredTags.filter((code) => !matchedTags.includes(code));
}

// ============ 检索函数 ============

/**
 * 搜索匹配的 COU 列表
 *
 * @param cous - 所有 COU 列表
 * @param query - 场景查询条件
 * @returns 按匹配分数排序的结果
 */
export function searchCOUs(
  cous: COU[],
  query: SceneQuery
): MatchedCOU[] {
  const config = { ...DEFAULT_MATCHING_CONFIG, ...query.matchingConfig };

  const results: MatchedCOU[] = cous
    .map((cou) => {
      const matchScore = calculateMatchScore(cou, query);
      const matchedTags = findMatchedTags(cou, query);

      // 计算各标签贡献的权重
      const tagWeights: Record<string, number> = {};
      for (const tagCode of matchedTags) {
        const tag = TAG_CODE_MAP[tagCode];
        if (tag) {
          tagWeights[tagCode] = tag.weight;
        }
      }

      return {
        couId: cou.id,
        matchScore,
        matchedTags,
        missedRequiredTags: findMissedRequiredTags(cou, query),
        tagWeights,
        confidence: calculateConfidence(cou, matchScore),
      };
    })
    .filter((result) => result.matchScore >= config.minMatchScore)
    .sort((a, b) => b.matchScore - a.matchScore);

  return results;
}

/**
 * 计算匹配置信度
 */
function calculateConfidence(cou: COU, matchScore: number): number {
  // 基于 AI 标注置信度和匹配分数计算
  const aiConfidence = cou.autoTagConfidence ?? 1.0;
  return Math.round(aiConfidence * matchScore * 100) / 100;
}

// ============ 场景预设模板 ============

/**
 * 根据预设模板创建场景查询
 */
export function createQueryFromTemplate(
  templateKey: keyof typeof SCENE_TAG_TEMPLATES,
  regions: string[] = ["国内"]
): SceneQuery {
  const template = SCENE_TAG_TEMPLATES[templateKey];

  // 根据模板标签推断各维度
  const selectedTags: FiveDimensionalTags = {
    objects: [],
    subjects: [],
    lifecycles: [],
    securities: [],
    actions: [],
  };

  const allTags = [
    ...template.requiredTags,
    ...template.preferredTags,
  ];

  for (const code of allTags) {
    const tag = TAG_CODE_MAP[code];
    if (!tag) continue;

    switch (tag.domain) {
      case "OBJECT":
        selectedTags.objects.push(code);
        break;
      case "SUBJECT":
        selectedTags.subjects.push(code);
        break;
      case "LIFECYCLE":
        selectedTags.lifecycles.push(code);
        break;
      case "SECURITY":
        selectedTags.securities.push(code);
        break;
      case "ACTION":
        selectedTags.actions.push(code);
        break;
    }
  }

  return {
    regions,
    selectedTags,
    matchingConfig: DEFAULT_MATCHING_CONFIG,
  };
}

// ============ 辅助函数 ============

/**
 * 将五维标签结构扁平化为 Code 数组
 */
function flattenFiveDimensionalTags(tags: FiveDimensionalTags): string[] {
  return [
    ...tags.objects,
    ...tags.subjects,
    ...tags.lifecycles,
    ...tags.securities,
    ...tags.actions,
  ];
}

/**
 * 将选择的标签结构扁平化为 Code 数组
 */
function flattenSelectedTags(selectedTags: {
  objects: string[];
  subjects: string[];
  lifecycles: string[];
  securities: string[];
  actions: string[];
}): string[] {
  return [
    ...selectedTags.objects,
    ...selectedTags.subjects,
    ...selectedTags.lifecycles,
    ...selectedTags.securities,
    ...selectedTags.actions,
  ];
}

/**
 * 创建空的五维标签结构
 */
export function createEmptyFiveDimensionalTags(): FiveDimensionalTags {
  return {
    objects: [],
    subjects: [],
    lifecycles: [],
    securities: [],
    actions: [],
  };
}

/**
 * 验证五维标签是否有效
 */
export function validateFiveDimensionalTags(
  tags: FiveDimensionalTags
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 检查每个标签 Code 是否存在于字典中
  const allCodes = flattenFiveDimensionalTags(tags);
  for (const code of allCodes) {
    if (!TAG_CODE_MAP[code]) {
      errors.push(`无效的标签 Code: ${code}`);
    }
  }

  // 检查是否有至少一个动作标签（推荐）
  if (tags.actions.length === 0) {
    errors.push("警告: 没有动作义务标签，无法生成 To-Do List");
  }

  return {
    valid: errors.length === 0 || errors.every((e) => e.startsWith("警告")),
    errors,
  };
}

// ============ 权重计算工具 ============

/**
 * 计算标签组合的总权重
 */
export function calculateTagCombinationWeight(tagCodes: string[]): number {
  return tagCodes.reduce((total, code) => {
    const tag = TAG_CODE_MAP[code];
    return total + (tag?.weight ?? 0);
  }, 0);
}

/**
 * 获取权重的风险等级
 */
export function getWeightRiskLevel(weight: number): "low" | "medium" | "high" | "critical" {
  if (weight >= 20) return "critical";
  if (weight >= 15) return "high";
  if (weight >= 8) return "medium";
  return "low";
}

/**
 * 导出所有匹配结果（带详细分析）
 */
export interface DetailedMatchResult extends MatchedCOU {
  cou?: COU;
  analysis: {
    levelWeight: number;
    penaltyWeight: number;
    tagMatchScore: number;
    finalWeight: number;
    riskLevel: "low" | "medium" | "high" | "critical";
  };
}

export function searchCOUsDetailed(
  cous: COU[],
  query: SceneQuery
): DetailedMatchResult[] {
  const matches = searchCOUs(cous, query);

  return matches.map((match) => {
    const cou = cous.find((c) => c.id === match.couId);
    if (!cou) {
      return {
        ...match,
        analysis: {
          levelWeight: 0,
          penaltyWeight: 0,
          tagMatchScore: 0,
          finalWeight: 0,
          riskLevel: "low",
        },
      };
    }

    const levelWeight = POLICY_LEVEL_WEIGHTS[cou.policyLevel] ?? 5;
    const penaltyWeight = cou.penaltyLevel
      ? PENALTY_WEIGHTS[cou.penaltyLevel]
      : 1;
    const finalWeight = calculateFinalWeight(cou, match.matchScore);

    return {
      ...match,
      cou,
      analysis: {
        levelWeight,
        penaltyWeight,
        tagMatchScore: match.matchScore,
        finalWeight,
        riskLevel: getWeightRiskLevel(finalWeight),
      },
    };
  });
}
