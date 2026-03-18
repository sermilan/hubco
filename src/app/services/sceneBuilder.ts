// ============ SceneBuilderService ============
// 场景构建器服务层 - 纯逻辑，无UI
// 提供模板管理、智能匹配、COU生成、权重计算等功能

import type {
  SceneTemplate,
  ControlObjective,
  FiveDimensionalTags,
  COU,
  CustomScene,
  Industry,
  Region,
  UserType,
  SceneMatchingConfig,
  MatchedControlObjective,
  WeightedCOU,
  ComplianceScoreResult,
  SceneCOUReference,
  SceneTemplateVersion,
} from "../types";
import { MOCK_CONTROL_OBJECTIVES, MOCK_COUS, MOCK_POLICIES } from "../data/mockData";

// 业务画像类型
export interface BusinessProfile {
  name: string;
  description: string;
  industry: Industry;
  region: Region;
  userType: UserType;
  scale: "small" | "medium" | "large" | "enterprise";
  dataTypes: string[];
  specialRequirements: string[];
}

// 匹配结果类型
export interface MatchingResult {
  controlObjectives: MatchedControlObjective[];
  totalMatched: number;
  recommendedCount: number;
  highMatchCount: number;
  mediumMatchCount: number;
  lowMatchCount: number;
}

// 场景生成配置
export interface SceneGenerationConfig {
  template: SceneTemplate;
  profile: BusinessProfile;
  tags: FiveDimensionalTags;
  selectedCOIds: string[];
  autoSelectRecommended: boolean;
}

// 场景构建器服务类
export class SceneBuilderService {
  private controlObjectives: ControlObjective[] = [];
  private cous: COU[] = [];

  constructor() {
    // 初始化时加载模拟数据
    this.controlObjectives = MOCK_CONTROL_OBJECTIVES;
    this.cous = MOCK_COUS;
  }

  // ============ 模板管理 ============

  /**
   * 加载所有可用的场景模板
   */
  async loadTemplates(): Promise<SceneTemplate[]> {
    // 实际项目中应从API获取
    // 这里返回模拟数据
    return this.getMockTemplates();
  }

  /**
   * 根据ID加载特定模板
   */
  async loadTemplateById(templateId: string): Promise<SceneTemplate | null> {
    const templates = await this.loadTemplates();
    return templates.find((t) => t.id === templateId) || null;
  }

  /**
   * 保存模板（创建或更新）
   */
  async saveTemplate(template: SceneTemplate): Promise<SceneTemplate> {
    // 实际项目中应调用API保存
    console.log("Saving template:", template);
    return template;
  }

  /**
   * 获取模板的所有版本
   */
  async getTemplateVersions(templateId: string): Promise<SceneTemplateVersion[]> {
    // 实际项目中应从API获取
    return this.getMockTemplateVersions(templateId);
  }

  // ============ 智能匹配 ============

  /**
   * 基于标签配置匹配ControlObjective
   */
  async matchControlObjectives(
    tags: FiveDimensionalTags,
    config: SceneMatchingConfig,
    customObjectives?: ControlObjective[]
  ): Promise<MatchedControlObjective[]> {
    const objectives = customObjectives || this.controlObjectives;

    const matches = objectives.map((co) => {
      const matchScore = this.calculateMatchScore(co, tags, config);
      const matchedTags = this.getMatchedTags(co, tags);
      const missingRequiredTags = this.getMissingRequiredTags(
        co,
        tags,
        config.requiredTags || []
      );

      // 计算预估权重
      const weightPreview = this.calculateWeightPreview(co, matchScore, config);

      return {
        controlObjective: co,
        matchScore,
        weightPreview,
        matchedTags,
        missingRequiredTags,
        isRecommended: matchScore >= (config.minMatchScore || 0.6),
      };
    });

    // 过滤和排序
    return matches
      .filter((m) => m.matchScore >= (config.minMatchScore || 0.6))
      .sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * 计算ControlObjective与场景标签的匹配度
   */
  private calculateMatchScore(
    controlObjective: ControlObjective,
    sceneTags: FiveDimensionalTags,
    config: SceneMatchingConfig
  ): number {
    const coTags = controlObjective.applicableTags;
    let totalScore = 0;
    let maxPossibleScore = 0;

    const dimensions: (keyof FiveDimensionalTags)[] = [
      "objects",
      "subjects",
      "lifecycles",
      "securities",
      "actions",
    ];

    dimensions.forEach((dim) => {
      const sceneDimTags = sceneTags[dim] || [];
      const coDimTags = coTags[dim] || [];
      const coefficient = config.tagCoefficients?.[dim] || 1;

      if (sceneDimTags.length > 0) {
        maxPossibleScore += sceneDimTags.length * coefficient;

        sceneDimTags.forEach((tag) => {
          if (coDimTags.includes(tag)) {
            totalScore += coefficient;
          } else if (config.includeRelatedTags) {
            // 检查标签层级关系
            const tagPrefix = tag.split("-")[0];
            const hasRelated = coDimTags.some((coTag) =>
              coTag.startsWith(tagPrefix)
            );
            if (hasRelated) {
              totalScore += coefficient * 0.5;
            }
          }
        });
      }
    });

    // 动作标签加权
    if (config.boostForActionTags && coTags.actions?.length > 0) {
      const actionMatch = sceneTags.actions?.filter((tag) =>
        coTags.actions.includes(tag)
      ).length;
      if (actionMatch > 0) {
        totalScore *= 1.2;
      }
    }

    // 检查必需标签
    if (config.requiredTags?.length) {
      const allCOTags = Object.values(coTags).flat();
      const hasRequiredTags = config.requiredTags.some((tag) =>
        allCOTags.includes(tag)
      );
      if (!hasRequiredTags) {
        return 0; // 没有必需标签，匹配度为0
      }
    }

    return maxPossibleScore > 0 ? Math.min(1, totalScore / maxPossibleScore) : 0;
  }

  /**
   * 获取匹配的标签列表
   */
  private getMatchedTags(
    controlObjective: ControlObjective,
    sceneTags: FiveDimensionalTags
  ): string[] {
    const coTags = controlObjective.applicableTags;
    const matched: string[] = [];

    const allSceneTags = [
      ...(sceneTags.objects || []),
      ...(sceneTags.subjects || []),
      ...(sceneTags.lifecycles || []),
      ...(sceneTags.securities || []),
      ...(sceneTags.actions || []),
    ];

    const allCOTags = [
      ...(coTags.objects || []),
      ...(coTags.subjects || []),
      ...(coTags.lifecycles || []),
      ...(coTags.securities || []),
      ...(coTags.actions || []),
    ];

    allSceneTags.forEach((tag) => {
      if (allCOTags.includes(tag)) {
        matched.push(tag);
      }
    });

    return [...new Set(matched)];
  }

  /**
   * 获取缺失的必需标签
   */
  private getMissingRequiredTags(
    controlObjective: ControlObjective,
    sceneTags: FiveDimensionalTags,
    requiredTags: string[]
  ): string[] {
    const allCOTags = Object.values(controlObjective.applicableTags).flat();
    return requiredTags.filter((tag) => !allCOTags.includes(tag));
  }

  /**
   * 计算预估权重
   */
  private calculateWeightPreview(
    controlObjective: ControlObjective,
    matchScore: number,
    config: SceneMatchingConfig
  ): number {
    // 基础权重 * (0.5 + 匹配度 * 0.5)
    // 匹配度越高，权重越接近基础权重上限
    const baseWeight = controlObjective.baseWeight;
    return Math.round(baseWeight * (0.5 + matchScore * 0.5) * 10) / 10;
  }

  // ============ COU生成 ============

  /**
   * 基于选中的ControlObjectives生成COU
   */
  async generateCOUs(
    selectedObjectives: ControlObjective[],
    profile: BusinessProfile,
    template: SceneTemplate
  ): Promise<COU[]> {
    const generatedCOUs: COU[] = [];

    for (const co of selectedObjectives) {
      // 查找是否已有基于此CO的COU
      const existingCOU = this.cous.find(
        (c) => c.controlObjectiveId === co.id
      );

      if (existingCOU) {
        // 复制并自定义
        generatedCOUs.push(
          this.customizeCOU(existingCOU, profile, template)
        );
      } else {
        // 创建新的COU
        generatedCOUs.push(
          this.createNewCOU(co, profile, template)
        );
      }
    }

    return generatedCOUs;
  }

  /**
   * 自定义现有COU
   */
  private customizeCOU(
    cou: COU,
    profile: BusinessProfile,
    template: SceneTemplate
  ): COU {
    return {
      ...cou,
      // 根据业务画像调整适用范围
      applicableIndustries: [profile.industry],
      applicableRegions: [profile.region],
      applicableUserTypes: [profile.userType],
      // 根据模板调整标签权重
      tagWeights: this.calculateTagWeights(cou, template),
      // 重新计算最终权重
      finalWeight: this.calculateFinalWeight(cou, template),
      // 添加场景化定制信息
      customization: {
        adaptedActions: cou.customization?.adaptedActions || [],
        notes: `针对${profile.industry}行业${profile.region}场景的定制`,
      },
    };
  }

  /**
   * 创建新的COU
   */
  private createNewCOU(
    co: ControlObjective,
    profile: BusinessProfile,
    template: SceneTemplate
  ): COU {
    const baseWeight = co.baseWeight;
    const penaltyWeight = 1;
    const tagMatchScore = 0.8;
    const scenarioWeight = 1;

    return {
      id: `COU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      code: `COU-${co.code}`,
      title: co.name,
      description: co.description,
      controlObjectiveId: co.id,
      sourceClauseIds: [],
      customization: {
        adaptedActions: [],
        notes: `基于${template.name}场景生成`,
      },
      obligationType: "强制性",
      baseWeight,
      penaltyWeight,
      tagMatchScore,
      scenarioWeight,
      finalWeight: baseWeight * penaltyWeight * tagMatchScore * scenarioWeight,
      tags: [],
      fiveDimensionalTags: co.applicableTags,
      tagWeights: this.calculateTagWeightsFromCO(co, template),
      autoTags: [],
      actionRequirements: [],
      applicableIndustries: [profile.industry],
      applicableRegions: [profile.region],
      applicableUserTypes: [profile.userType],
      relatedCOUs: [],
      dependsOn: [],
      conflicts: [],
      version: "1.0",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // ============ 权重计算 ============

  /**
   * 计算标签权重
   */
  private calculateTagWeights(
    cou: COU,
    template: SceneTemplate
  ): Record<string, number> {
    const weights: Record<string, number> = {};
    const allTags = [
      ...cou.fiveDimensionalTags.objects,
      ...cou.fiveDimensionalTags.subjects,
      ...cou.fiveDimensionalTags.lifecycles,
      ...cou.fiveDimensionalTags.securities,
      ...cou.fiveDimensionalTags.actions,
    ];

    allTags.forEach((tag) => {
      // 如果模板中有标签权重配置，使用配置值
      weights[tag] = template.tagProfile?.tagWeights?.[tag] || 1;
    });

    return weights;
  }

  /**
   * 从ControlObjective计算标签权重
   */
  private calculateTagWeightsFromCO(
    co: ControlObjective,
    template: SceneTemplate
  ): Record<string, number> {
    const weights: Record<string, number> = {};
    const allTags = [
      ...co.applicableTags.objects,
      ...co.applicableTags.subjects,
      ...co.applicableTags.lifecycles,
      ...co.applicableTags.securities,
      ...co.applicableTags.actions,
    ];

    allTags.forEach((tag) => {
      weights[tag] = template.tagProfile?.tagWeights?.[tag] || 1;
    });

    return weights;
  }

  /**
   * 计算COU最终权重
   */
  private calculateFinalWeight(cou: COU, template: SceneTemplate): number {
    const baseWeight = cou.baseWeight;
    const penaltyWeight = cou.penaltyWeight || 1;
    const tagMatchScore = cou.tagMatchScore || 1;
    const scenarioWeight = template.tagProfile?.tagWeights
      ? Object.values(template.tagProfile.tagWeights).reduce(
          (sum, w) => sum + w,
          0
        ) /
        Object.keys(template.tagProfile.tagWeights).length
      : 1;

    return baseWeight * penaltyWeight * tagMatchScore * scenarioWeight;
  }

  /**
   * 批量计算COU权重
   */
  calculateWeights(
    cous: COU[],
    profile: BusinessProfile
  ): WeightedCOU[] {
    return cous.map((cou) => ({
      ...cou,
      calculatedWeight: this.calculateCOUWeight(cou, profile),
      priority: this.getPriorityByWeight(cou.finalWeight),
    }));
  }

  /**
   * 计算单个COU权重
   */
  private calculateCOUWeight(cou: COU, profile: BusinessProfile): number {
    // 基础权重
    let weight = cou.baseWeight;

    // 行业调整
    if (cou.applicableIndustries?.includes(profile.industry)) {
      weight *= 1.2;
    }

    // 规模调整
    const scaleMultiplier = {
      small: 0.8,
      medium: 1.0,
      large: 1.2,
      enterprise: 1.5,
    };
    weight *= scaleMultiplier[profile.scale];

    return Math.round(weight * 10) / 10;
  }

  /**
   * 根据权重获取优先级
   */
  private getPriorityByWeight(weight: number): "critical" | "high" | "medium" | "low" {
    if (weight >= 9) return "critical";
    if (weight >= 7) return "high";
    if (weight >= 5) return "medium";
    return "low";
  }

  // ============ 合规评分 ============

  /**
   * 计算场景合规评分
   */
  calculateComplianceScore(
    cous: COU[],
    profile: BusinessProfile
  ): ComplianceScoreResult {
    const totalCOUs = cous.length;
    const criticalCOUs = cous.filter((c) => c.finalWeight >= 9).length;
    const highCOUs = cous.filter(
      (c) => c.finalWeight >= 7 && c.finalWeight < 9
    ).length;
    const mediumCOUs = cous.filter(
      (c) => c.finalWeight >= 5 && c.finalWeight < 7
    ).length;
    const lowCOUs = cous.filter((c) => c.finalWeight < 5).length;

    // 基础分60，根据COU数量和分布加分
    const baseScore = 60;
    const countBonus = Math.min(20, totalCOUs * 0.5);
    const priorityBonus = criticalCOUs * 3 + highCOUs * 2 + mediumCOUs * 1;

    const totalScore = Math.min(100, baseScore + countBonus + priorityBonus);

    return {
      overallScore: Math.round(totalScore),
      breakdown: {
        baseline: baseScore,
        coverage: countBonus,
        priority: Math.min(20, priorityBonus),
      },
      distribution: {
        critical: criticalCOUs,
        high: highCOUs,
        medium: mediumCOUs,
        low: lowCOUs,
      },
      suggestions: this.generateSuggestions(cous, profile),
    };
  }

  /**
   * 生成合规建议
   */
  private generateSuggestions(
    cous: COU[],
    profile: BusinessProfile
  ): string[] {
    const suggestions: string[] = [];

    if (cous.length < 10) {
      suggestions.push("建议增加更多COU以提高合规覆盖度");
    }

    const criticalCount = cous.filter((c) => c.finalWeight >= 9).length;
    if (criticalCount < 3) {
      suggestions.push("关键COU数量较少，建议检查是否有遗漏的高权重合规要求");
    }

    if (profile.industry === "金融" || profile.industry === "医疗") {
      suggestions.push(`针对${profile.industry}行业，建议关注数据分类分级要求`);
    }

    return suggestions;
  }

  // ============ 场景生成 ============

  /**
   * 完整场景生成流程
   */
  async generateScene(
    config: SceneGenerationConfig
  ): Promise<CustomScene> {
    const { template, profile, tags, selectedCOIds, autoSelectRecommended } = config;

    // 1. 匹配ControlObjective
    const matchedCOs = await this.matchControlObjectives(
      tags,
      template.matchingConfig
    );

    // 2. 自动选择推荐的CO（如果启用）
    let finalSelectedIds = selectedCOIds;
    if (autoSelectRecommended && selectedCOIds.length === 0) {
      finalSelectedIds = matchedCOs
        .filter((m) => m.isRecommended)
        .map((m) => m.controlObjective.id);
    }

    // 3. 获取选中的ControlObjectives
    const selectedObjectives = matchedCOs
      .filter((m) => finalSelectedIds.includes(m.controlObjective.id))
      .map((m) => m.controlObjective);

    // 4. 生成COU
    const generatedCOUs = await this.generateCOUs(
      selectedObjectives,
      profile,
      template
    );

    // 5. 计算权重和评分
    const weightedCOUs = this.calculateWeights(generatedCOUs, profile);
    const complianceScore = this.calculateComplianceScore(
      generatedCOUs,
      profile
    );

    // 6. 构建场景引用
    const couReferences: SceneCOUReference[] = generatedCOUs.map((cou) => ({
      couId: cou.id,
      versionId: `${cou.version}-initial`,
      isLatest: true,
      updateAvailable: false,
      autoUpgrade: false,
      pinnedWeight: cou.finalWeight,
    }));

    // 7. 构建标签分布
    const tagDistribution: Record<string, number> = {};
    generatedCOUs.forEach((cou) => {
      cou.tags.forEach((tag) => {
        tagDistribution[tag.name] = (tagDistribution[tag.name] || 0) + 1;
      });
    });

    // 8. 组装CustomScene
    const now = new Date().toISOString();
    const scene: CustomScene = {
      id: `scene-${Date.now()}`,
      name: profile.name,
      description: profile.description,
      userId: "user_001",
      organizationId: "org_001",
      industry: profile.industry,
      region: profile.region,
      userType: profile.userType,
      specialRequirements: profile.specialRequirements,
      selectedTags: tags,
      couReferences,
      cous: generatedCOUs,
      totalCOUs: generatedCOUs.length,
      totalWeight: generatedCOUs.reduce((sum, c) => sum + c.finalWeight, 0),
      averageWeight:
        generatedCOUs.length > 0
          ? generatedCOUs.reduce((sum, c) => sum + c.finalWeight, 0) /
            generatedCOUs.length
          : 0,
      highPriorityCOUs: generatedCOUs.filter((c) => c.finalWeight >= 8).length,
      complianceScore: complianceScore.overallScore,
      completeness: Math.min(100, (generatedCOUs.length / 20) * 100),
      tagDistribution,
      version: "1.0",
      status: "active",
      isPublic: false,
      matchingConfig: template.matchingConfig,
      basedOnTemplate: template.id,
      createdAt: now,
      updatedAt: now,
    };

    return scene;
  }

  // ============ 辅助方法 ============

  /**
   * 获取模拟模板数据
   */
  private getMockTemplates(): SceneTemplate[] {
    return [
      {
        id: "scene-game-eu",
        name: "游戏出海欧盟",
        description: "面向欧盟市场的游戏产品合规方案，涵盖GDPR、数字服务法等法规要求",
        icon: "🎮",
        category: "出海合规",
        targetIndustries: ["游戏", "互联网"],
        targetRegions: ["欧盟"],
        targetUserTypes: ["大型企业"],
        tagProfile: {
          requiredTags: ["OBJ-PI", "LIF-SHA", "SEC-CRY"],
          preferredTags: ["ACT-CON", "ACT-NOT", "ACT-RES"],
          excludedTags: [],
          tagWeights: { "OBJ-PI": 2.0, "LIF-SHA": 1.5, "SEC-CRY": 1.5 },
          tagCoefficients: {
            objects: 1.2,
            subjects: 1.0,
            lifecycles: 1.3,
            securities: 1.2,
            actions: 1.0,
          },
        },
        matchingConfig: {
          minMatchScore: 0.6,
          boostForActionTags: true,
          requireAllActionTags: false,
          includeRelatedTags: true,
          includeHierarchy: true,
        },
        recommendedCOUs: [],
        usageCount: 128,
        isPopular: true,
        requiredTags: ["OBJ-PI", "LIF-SHA", "SEC-CRY"],
        optionalTags: ["ACT-CON", "ACT-NOT", "ACT-RES"],
      },
      {
        id: "scene-finance-ml3",
        name: "金融等保三级",
        description: "金融机构等保三级合规方案，涵盖数据安全、网络安全、应用安全等全方位要求",
        icon: "🏦",
        category: "行业合规",
        targetIndustries: ["金融"],
        targetRegions: ["国内"],
        targetUserTypes: ["大型企业", "关基运营者"],
        tagProfile: {
          requiredTags: ["OBJ-IMP", "SUB-CII", "SEC-ORG", "SEC-TEC"],
          preferredTags: ["ACT-AUD", "ACT-ASS", "ACT-IMP"],
          excludedTags: [],
          tagWeights: { "OBJ-IMP": 2.5, "SUB-CII": 2.0, "SEC-ORG": 1.8 },
          tagCoefficients: {
            objects: 1.5,
            subjects: 1.3,
            lifecycles: 1.0,
            securities: 1.5,
            actions: 1.2,
          },
        },
        matchingConfig: {
          minMatchScore: 0.7,
          boostForActionTags: true,
          requireAllActionTags: false,
          includeRelatedTags: true,
          includeHierarchy: true,
        },
        recommendedCOUs: [],
        usageCount: 256,
        isPopular: true,
        requiredTags: ["OBJ-IMP", "SUB-CII", "SEC-ORG", "SEC-TEC"],
        optionalTags: ["ACT-AUD", "ACT-ASS", "ACT-IMP"],
      },
      {
        id: "scene-saas-general",
        name: "SaaS平台通用合规",
        description: "面向国内SaaS平台的通用合规方案，涵盖数据安全法、个人信息保护法等基础要求",
        icon: "☁️",
        category: "业务合规",
        targetIndustries: ["互联网"],
        targetRegions: ["国内"],
        targetUserTypes: ["中小企业", "大型企业"],
        tagProfile: {
          requiredTags: ["OBJ-PI", "SEC-ORG"],
          preferredTags: ["ACT-DOC", "ACT-TRA", "ACT-AUD"],
          excludedTags: [],
          tagWeights: { "OBJ-PI": 2.0, "SEC-ORG": 1.5 },
          tagCoefficients: {
            objects: 1.3,
            subjects: 1.0,
            lifecycles: 1.0,
            securities: 1.2,
            actions: 1.0,
          },
        },
        matchingConfig: {
          minMatchScore: 0.5,
          boostForActionTags: true,
          requireAllActionTags: false,
          includeRelatedTags: true,
          includeHierarchy: true,
        },
        recommendedCOUs: [],
        usageCount: 512,
        isPopular: true,
        requiredTags: ["OBJ-PI", "SEC-ORG"],
        optionalTags: ["ACT-DOC", "ACT-TRA", "ACT-AUD"],
      },
    ];
  }

  /**
   * 获取模拟模板版本数据
   */
  private getMockTemplateVersions(
    templateId: string
  ): SceneTemplateVersion[] {
    return [
      {
        templateId,
        versionId: `${templateId}-v1.0`,
        versionNumber: "1.0.0",
        status: "published",
        changes: ["初始版本"],
        scenesCreated: 128,
        createdAt: "2024-01-01T00:00:00Z",
        publishedAt: "2024-01-15T00:00:00Z",
        tagProfile: {
          requiredTags: [],
          preferredTags: [],
          excludedTags: [],
        },
        matchingConfig: {
          minMatchScore: 0.6,
          boostForActionTags: true,
          requireAllActionTags: false,
          includeRelatedTags: true,
          includeHierarchy: true,
        },
      },
      {
        templateId,
        versionId: `${templateId}-v1.1`,
        versionNumber: "1.1.0",
        status: "published",
        changes: ["优化金融场景标签配置", "增加数据出境相关COU"],
        scenesCreated: 64,
        createdAt: "2024-02-01T00:00:00Z",
        publishedAt: "2024-02-10T00:00:00Z",
        tagProfile: {
          requiredTags: [],
          preferredTags: [],
          excludedTags: [],
        },
        matchingConfig: {
          minMatchScore: 0.65,
          boostForActionTags: true,
          requireAllActionTags: false,
          includeRelatedTags: true,
          includeHierarchy: true,
        },
      },
    ];
  }
}

// 导出单例实例
export const sceneBuilderService = new SceneBuilderService();

// 导出类型
export type {
  BusinessProfile,
  MatchingResult,
  SceneGenerationConfig,
} from "./sceneBuilder";
