import { ApiProperty } from '@nestjs/swagger';

export class ExtractedCOU {
  @ApiProperty({ description: 'COU编号' })
  code: string;

  @ApiProperty({ description: 'COU标题' })
  title: string;

  @ApiProperty({ description: 'COU描述' })
  description: string;

  @ApiProperty({ description: '义务类型', enum: ['prohibited', 'mandatory', 'recommended', 'guidance'] })
  obligationType: 'prohibited' | 'mandatory' | 'recommended' | 'guidance';

  @ApiProperty({ description: '适用对象' })
  targetEntities: string[];

  @ApiProperty({ description: '行动要求' })
  actionRequirements: string[];

  @ApiProperty({ description: '违规后果' })
  violationConsequences?: string;

  @ApiProperty({ description: '罚则级别', enum: ['none', 'minor', 'moderate', 'severe', 'critical'] })
  penaltyLevel?: 'none' | 'minor' | 'moderate' | 'severe' | 'critical';

  @ApiProperty({ description: '适用条件' })
  applicabilityConditions?: string[];

  @ApiProperty({ description: '建议标签' })
  suggestedTags: string[];

  @ApiProperty({ description: '原始条款引用' })
  sourceClause?: string;

  @ApiProperty({ description: '置信度（0-1）' })
  confidence: number;
}

export class TagRecommendation {
  @ApiProperty({ description: '标签名称' })
  name: string;

  @ApiProperty({ description: '标签分类', enum: ['object', 'subject', 'lifecycle', 'security', 'action'] })
  domain: 'object' | 'subject' | 'lifecycle' | 'security' | 'action';

  @ApiProperty({ description: '置信度（0-1）' })
  confidence: number;

  @ApiProperty({ description: '推荐理由' })
  reason?: string;
}

export class SceneRecommendation {
  @ApiProperty({ description: '场景ID' })
  id: string;

  @ApiProperty({ description: '场景名称' })
  name: string;

  @ApiProperty({ description: '匹配度（0-1）' })
  matchScore: number;

  @ApiProperty({ description: '匹配原因' })
  reason: string;

  @ApiProperty({ description: '建议COU数量' })
  suggestedCOUCount: number;

  @ApiProperty({ description: '相关COU ID列表' })
  relatedCOUIds: string[];
}

export class ContentSummary {
  @ApiProperty({ description: '摘要内容' })
  summary: string;

  @ApiProperty({ description: '关键要点' })
  keyPoints: string[];

  @ApiProperty({ description: '涉及的COU数量' })
  couCount: number;

  @ApiProperty({ description: '涉及的政策数量' })
  policyCount: number;
}

export class PolicyComparisonResult {
  @ApiProperty({ description: '对比的政策ID' })
  policyId: string;

  @ApiProperty({ description: '政策名称' })
  policyName: string;

  @ApiProperty({ description: '对比维度结果' })
  dimensions: {
    dimension: string;
    similarity: number;
    differences: string[];
    similarities: string[];
  }[];
}

export class ChatResponse {
  @ApiProperty({ description: 'AI回答' })
  answer: string;

  @ApiProperty({ description: '引用来源' })
  sources: {
    type: 'policy' | 'cou' | 'clause';
    id: string;
    title: string;
    content: string;
  }[];

  @ApiProperty({ description: '建议的后续问题' })
  suggestedQuestions: string[];

  @ApiProperty({ description: '使用的token数' })
  tokenUsage: number;
}

export class AIUsageStats {
  @ApiProperty({ description: '总调用次数' })
  totalCalls: number;

  @ApiProperty({ description: '本月调用次数' })
  monthlyCalls: number;

  @ApiProperty({ description: '总token消耗' })
  totalTokens: number;

  @ApiProperty({ description: '本月token消耗' })
  monthlyTokens: number;

  @ApiProperty({ description: '功能使用统计' })
  byFeature: Record<string, number>;
}
