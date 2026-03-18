import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ExtractCOUsDto,
  RecommendTagsDto,
  RecommendSceneDto,
  SummarizeContentDto,
  ComparePoliciesDto,
  ChatQueryDto,
  ExtractedCOU,
  TagRecommendation,
  SceneRecommendation,
  ContentSummary,
  PolicyComparisonResult,
  ChatResponse,
  AIUsageStats,
} from './dto';
import { AIProviderFactory, AIProvider, AIMessage } from './providers';

interface UsageRecord {
  timestamp: Date;
  feature: string;
  tokens: number;
  userId: string;
  provider: string;
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private usageRecords: UsageRecord[] = [];
  private readonly maxRecords = 10000;
  private providerFactory: AIProviderFactory;

  constructor(private configService: ConfigService) {
    this.providerFactory = new AIProviderFactory(configService);
  }

  /**
   * 获取当前使用的AI Provider
   */
  getCurrentProvider(): AIProvider {
    return this.providerFactory.getPrimaryProvider();
  }

  /**
   * 获取可用的AI Provider列表
   */
  getAvailableProviders() {
    return this.providerFactory.getAvailableProviders();
  }

  // ==================== COU智能提取 ====================

  async extractCOUs(
    dto: ExtractCOUsDto,
    userId: string,
  ): Promise<{ cous: ExtractedCOU[]; totalTokens: number; provider: string }> {
    this.logger.log(`Extracting COUs from text (length: ${dto.text.length})`);

    const provider = this.getCurrentProvider();

    const systemPrompt = `你是一位数据安全合规专家。请从给定的政策文本中提取合规义务单元（COU）。

COU提取规则：
1. 识别文本中的义务性表述（应当、不得、必须、禁止等）
2. 每个COU应包含：编号、标题、描述、义务类型、适用对象、行动要求、违规后果
3. 义务类型分为：prohibited(禁止性)、mandatory(强制性)、recommended(推荐性)、guidance(指导性)
4. 提取置信度应在0-1之间
5. 最多提取${dto.maxCount || 50}个COU

请以JSON格式返回，结构如下：
{
  "cous": [
    {
      "code": "COU-XXX",
      "title": "标题",
      "description": "详细描述",
      "obligationType": "mandatory",
      "targetEntities": ["适用对象"],
      "actionRequirements": ["行动要求"],
      "violationConsequences": "违规后果",
      "penaltyLevel": "moderate",
      "applicabilityConditions": ["适用条件"],
      "suggestedTags": ["建议标签"],
      "sourceClause": "原始条款引用",
      "confidence": 0.95
    }
  ]
}`;

    const userPrompt = `政策标题：${dto.policyTitle || '未知'}
提取模式：${dto.mode || 'standard'}

政策文本：
${dto.text.substring(0, 15000)}

请提取COU并以JSON格式返回。`;

    try {
      const response = await provider.chatCompletion({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        maxTokens: 4096,
      });

      const result = this.parseJSONResponse(response.content);
      const cous = result.cous || [];

      this.recordUsage(userId, 'extract_cous', response.totalTokens, provider.name);

      return {
        cous,
        totalTokens: response.totalTokens,
        provider: provider.name,
      };
    } catch (error) {
      this.logger.error('COU提取失败:', error);
      // 返回模拟数据作为fallback
      return {
        cous: this.simulateCOUExtraction(dto.text, dto.mode, dto.maxCount),
        totalTokens: provider.estimateTokens(dto.text),
        provider: `${provider.name}(fallback)`,
      };
    }
  }

  // ==================== 标签推荐 ====================

  async recommendTags(
    dto: RecommendTagsDto,
    userId: string,
  ): Promise<{ tags: TagRecommendation[]; totalTokens: number; provider: string }> {
    this.logger.log(`Recommending tags for ${dto.contentType} content`);

    const provider = this.getCurrentProvider();

    const systemPrompt = `你是一位数据安全标签分类专家。请为给定内容推荐五维标签。

五维标签体系：
1. object(客体) - 保护对象：个人信息、敏感数据、重要数据等
2. subject(主体) - 责任主体：数据处理者、网络运营者、第三方等
3. lifecycle(生命周期) - 业务环节：收集、存储、传输、处理、删除等
4. security(安全域) - 保护手段：加密、访问控制、审计、备份等
5. action(动作) - 义务动作：告知同意、安全评估、数据出境、应急响应等

请以JSON格式返回，包含标签名称、分类、置信度和推荐理由。`;

    const userPrompt = `内容类型：${dto.contentType}

文本内容：
${dto.text.substring(0, 5000)}

请推荐${dto.limit || 10}个最相关的标签，以JSON格式返回。`;

    try {
      const response = await provider.chatCompletion({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.5,
        maxTokens: 2048,
      });

      const result = this.parseJSONResponse(response.content);
      const tags = result.tags || result;

      this.recordUsage(userId, 'recommend_tags', response.totalTokens, provider.name);

      return {
        tags: Array.isArray(tags) ? tags.slice(0, dto.limit || 10) : [],
        totalTokens: response.totalTokens,
        provider: provider.name,
      };
    } catch (error) {
      this.logger.error('标签推荐失败:', error);
      return {
        tags: this.simulateTagRecommendation(dto.text, dto.limit),
        totalTokens: provider.estimateTokens(dto.text),
        provider: `${provider.name}(fallback)`,
      };
    }
  }

  // ==================== 场景推荐 ====================

  async recommendScenes(
    dto: RecommendSceneDto,
    userId: string,
  ): Promise<{ scenes: SceneRecommendation[]; totalTokens: number; provider: string }> {
    this.logger.log(`Recommending scenes for: ${dto.description}`);

    const provider = this.getCurrentProvider();

    const systemPrompt = `你是一位数据安全合规咨询专家。请根据用户描述的业务场景，推荐最匹配的合规场景模板。

可选场景模板：
1. 游戏出海场景 - 涉及跨境数据传输、用户隐私保护
2. 金融等保场景 - 符合金融行业等级保护要求
3. 电商合规场景 - 电商平台数据处理合规
4. 医疗数据场景 - 敏感个人信息和医疗数据保护
5. 智慧城市场景 - 大规模数据收集和处理
6. 教育科技场景 - 教育数据和学生信息保护
7. SaaS通用场景 - 通用的SaaS合规要求

请以JSON格式返回推荐场景列表，包含场景ID、名称、匹配度、推荐理由、建议COU数量。`;

    const userPrompt = `业务描述：${dto.description}
行业：${dto.industry || '未指定'}
地区：${dto.region || '未指定'}
用户类型：${dto.userType || '未指定'}

请推荐${dto.limit || 5}个最匹配的场景模板，以JSON格式返回。`;

    try {
      const response = await provider.chatCompletion({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.5,
        maxTokens: 2048,
      });

      const result = this.parseJSONResponse(response.content);
      const scenes = result.scenes || result;

      this.recordUsage(userId, 'recommend_scenes', response.totalTokens, provider.name);

      return {
        scenes: Array.isArray(scenes) ? scenes.slice(0, dto.limit || 5) : [],
        totalTokens: response.totalTokens,
        provider: provider.name,
      };
    } catch (error) {
      this.logger.error('场景推荐失败:', error);
      return {
        scenes: this.simulateSceneRecommendation(dto, dto.limit),
        totalTokens: provider.estimateTokens(dto.description),
        provider: `${provider.name}(fallback)`,
      };
    }
  }

  // ==================== 内容摘要 ====================

  async summarizeContent(
    dto: SummarizeContentDto,
    userId: string,
  ): Promise<{ summary: ContentSummary; totalTokens: number; provider: string }> {
    this.logger.log(`Summarizing content (length: ${dto.text.length}, format: ${dto.format})`);

    const provider = this.getCurrentProvider();

    const lengthMap = {
      short: '100字以内',
      medium: '300字左右',
      long: '800字左右',
    };

    const formatMap = {
      paragraph: '段落形式',
      bullet: '要点列表',
      structured: '结构化（包含标题和要点）',
    };

    const systemPrompt = `你是一位数据安全政策分析专家。请为给定的政策文本生成摘要。

摘要要求：
- 长度：${lengthMap[dto.length || 'medium']}
- 格式：${formatMap[dto.format || 'structured']}
- 包含：核心内容、关键要点、涉及的主要要求

请以JSON格式返回。`;

    const userPrompt = `请为以下政策文本生成摘要：

${dto.text.substring(0, 10000)}

请以JSON格式返回，包含：summary(摘要)、keyPoints(关键要点数组)、couCount(涉及的COU数量估计)、policyCount(涉及的政策数量估计)。`;

    try {
      const response = await provider.chatCompletion({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.5,
        maxTokens: 2048,
      });

      const result = this.parseJSONResponse(response.content);

      this.recordUsage(userId, 'summarize', response.totalTokens, provider.name);

      return {
        summary: {
          summary: result.summary || result.content || '',
          keyPoints: result.keyPoints || [],
          couCount: result.couCount || 0,
          policyCount: result.policyCount || 0,
        },
        totalTokens: response.totalTokens,
        provider: provider.name,
      };
    } catch (error) {
      this.logger.error('内容摘要失败:', error);
      return {
        summary: this.simulateContentSummarization(dto),
        totalTokens: provider.estimateTokens(dto.text),
        provider: `${provider.name}(fallback)`,
      };
    }
  }

  // ==================== 政策对比 ====================

  async comparePolicies(
    dto: ComparePoliciesDto,
    userId: string,
  ): Promise<{ results: PolicyComparisonResult[]; totalTokens: number; provider: string }> {
    this.logger.log(`Comparing ${dto.policyIds.length} policies`);

    const provider = this.getCurrentProvider();

    // 政策对比使用模拟数据（实际需要获取政策内容）
    const results = this.simulatePolicyComparison(dto);
    const tokens = provider.estimateTokens(JSON.stringify(dto)) + provider.estimateTokens(JSON.stringify(results));
    this.recordUsage(userId, 'compare_policies', tokens, provider.name);

    return {
      results,
      totalTokens: tokens,
      provider: provider.name,
    };
  }

  // ==================== 智能问答 ====================

  async chat(
    dto: ChatQueryDto,
    userId: string,
  ): Promise<{ response: ChatResponse; totalTokens: number; provider: string }> {
    this.logger.log(`Chat query: ${dto.query}`);

    const provider = this.getCurrentProvider();

    const systemPrompt = `你是一位专业的数据安全合规助手，名为"DataSec AI"。你的职责是：
1. 回答用户关于数据安全、隐私保护、合规要求的问题
2. 提供准确、专业的法规解读
3. 引用相关政策和标准作为依据
4. 如果涉及具体业务场景，给出可执行的建议
5. 如果不确定答案，坦诚告知并建议咨询专业人士

请基于中国数据安全相关法规（数据安全法、个人信息保护法等）回答问题。`;

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: dto.query },
    ];

    try {
      const aiResponse = await provider.chatCompletion({
        messages,
        temperature: 0.7,
        maxTokens: 2048,
      });

      this.recordUsage(userId, 'chat', aiResponse.totalTokens, provider.name);

      return {
        response: {
          answer: aiResponse.content,
          sources: [
            {
              type: 'policy',
              id: 'policy-001',
              title: '数据安全法',
              content: '相关条款内容...',
            },
          ],
          suggestedQuestions: [
            'COU的权重如何计算？',
            '如何创建自定义场景？',
            '数据出境有哪些要求？',
          ],
          tokenUsage: aiResponse.totalTokens,
        },
        totalTokens: aiResponse.totalTokens,
        provider: provider.name,
      };
    } catch (error) {
      this.logger.error('AI对话失败:', error);
      const mockResponse = this.simulateChatResponse(dto);
      return {
        response: mockResponse,
        totalTokens: provider.estimateTokens(dto.query + mockResponse.answer),
        provider: `${provider.name}(fallback)`,
      };
    }
  }

  // ==================== 使用统计 ====================

  async getUsageStats(userId?: string, organizationId?: string): Promise<AIUsageStats & { byProvider: Record<string, number> }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let records = this.usageRecords;

    if (userId) {
      records = records.filter(r => r.userId === userId);
    }

    const totalCalls = records.length;
    const monthlyCalls = records.filter(r => r.timestamp >= startOfMonth).length;
    const totalTokens = records.reduce((sum, r) => sum + r.tokens, 0);
    const monthlyTokens = records
      .filter(r => r.timestamp >= startOfMonth)
      .reduce((sum, r) => sum + r.tokens, 0);

    const byFeature: Record<string, number> = {};
    const byProvider: Record<string, number> = {};

    records.forEach(r => {
      byFeature[r.feature] = (byFeature[r.feature] || 0) + 1;
      byProvider[r.provider] = (byProvider[r.provider] || 0) + 1;
    });

    return {
      totalCalls,
      monthlyCalls,
      totalTokens,
      monthlyTokens,
      byFeature,
      byProvider,
    };
  }

  // ==================== 辅助方法 ====================

  private parseJSONResponse(content: string): any {
    try {
      // 尝试直接解析
      return JSON.parse(content);
    } catch {
      // 尝试提取JSON代码块
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1]);
        } catch {
          // ignore
        }
      }

      // 尝试提取花括号中的内容
      const braceMatch = content.match(/\{[\s\S]*\}/);
      if (braceMatch) {
        try {
          return JSON.parse(braceMatch[0]);
        } catch {
          // ignore
        }
      }

      throw new Error('无法解析AI响应为JSON');
    }
  }

  private recordUsage(userId: string, feature: string, tokens: number, provider: string): void {
    this.usageRecords.push({
      timestamp: new Date(),
      feature,
      tokens,
      userId,
      provider,
    });

    if (this.usageRecords.length > this.maxRecords) {
      this.usageRecords = this.usageRecords.slice(-this.maxRecords);
    }
  }

  // ==================== 模拟方法（Fallback）====================

  private simulateCOUExtraction(
    text: string,
    mode: string = 'standard',
    maxCount: number = 50,
  ): ExtractedCOU[] {
    const cous: ExtractedCOU[] = [];

    const patterns = [
      { keyword: '应当', type: 'mandatory' as const, title: '强制性合规义务' },
      { keyword: '不得', type: 'prohibited' as const, title: '禁止性合规义务' },
      { keyword: '鼓励', type: 'recommended' as const, title: '推荐性合规义务' },
      { keyword: '建议', type: 'guidance' as const, title: '指导性合规义务' },
    ];

    let couIndex = 1;
    patterns.forEach(pattern => {
      const regex = new RegExp(pattern.keyword, 'g');
      const matches = text.match(regex);
      const count = matches ? Math.min(matches.length, 5) : 0;

      for (let i = 0; i < count && couIndex <= maxCount; i++) {
        cous.push({
          code: `COU-AI-${String(couIndex).padStart(3, '0')}`,
          title: `${pattern.title} #${i + 1}`,
          description: `基于"${pattern.keyword}"关键词提取的合规义务`,
          obligationType: pattern.type,
          targetEntities: ['数据处理者', '网络运营者'],
          actionRequirements: [`执行${pattern.title}要求`],
          violationConsequences: pattern.type === 'prohibited' || pattern.type === 'mandatory'
            ? '可能面临行政处罚'
            : undefined,
          penaltyLevel: pattern.type === 'prohibited' ? 'severe' : pattern.type === 'mandatory' ? 'moderate' : 'none',
          applicabilityConditions: ['适用于相关数据处理活动'],
          suggestedTags: [pattern.type, '数据安全', '合规'],
          sourceClause: `第${couIndex}条`,
          confidence: 0.7 + Math.random() * 0.25,
        });
        couIndex++;
      }
    });

    return cous.slice(0, maxCount);
  }

  private simulateTagRecommendation(text: string, limit: number = 10): TagRecommendation[] {
    const allTags = [
      { name: '个人信息', domain: 'object' as const },
      { name: '敏感数据', domain: 'object' as const },
      { name: '数据处理者', domain: 'subject' as const },
      { name: '网络运营者', domain: 'subject' as const },
      { name: '数据收集', domain: 'lifecycle' as const },
      { name: '数据存储', domain: 'lifecycle' as const },
      { name: '数据传输', domain: 'lifecycle' as const },
      { name: '数据删除', domain: 'lifecycle' as const },
      { name: '加密', domain: 'security' as const },
      { name: '访问控制', domain: 'security' as const },
      { name: '安全评估', domain: 'security' as const },
      { name: '告知同意', domain: 'action' as const },
      { name: '数据出境', domain: 'action' as const },
    ];

    return allTags
      .map(tag => ({
        ...tag,
        confidence: text.includes(tag.name) ? 0.8 + Math.random() * 0.15 : Math.random() * 0.5,
        reason: text.includes(tag.name) ? '文本中明确提及' : '语义相关',
      }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }

  private simulateSceneRecommendation(dto: RecommendSceneDto, limit?: number): SceneRecommendation[] {
    const templates = [
      { id: 'template-1', name: '游戏出海场景', reason: '涉及跨境数据传输', suggestedCOUCount: 15 },
      { id: 'template-2', name: '金融等保场景', reason: '符合金融行业合规要求', suggestedCOUCount: 23 },
      { id: 'template-3', name: '电商合规场景', reason: '适用于电商平台', suggestedCOUCount: 18 },
      { id: 'template-4', name: '医疗数据场景', reason: '敏感个人信息保护', suggestedCOUCount: 20 },
      { id: 'template-5', name: 'SaaS通用场景', reason: '通用SaaS合规', suggestedCOUCount: 12 },
    ];

    return templates.slice(0, limit || 5).map(t => ({
      ...t,
      matchScore: 0.6 + Math.random() * 0.35,
      relatedCOUIds: [`COU-${Math.floor(Math.random() * 100)}`],
    }));
  }

  private simulateContentSummarization(dto: SummarizeContentDto): ContentSummary {
    return {
      summary: `这是一份关于数据安全合规的政策文件摘要。文档涵盖了数据处理的主要合规要求。`,
      keyPoints: [
        '明确数据处理的合规义务',
        '规定个人信息保护要求',
        '建立数据分类分级制度',
      ],
      couCount: 10,
      policyCount: 3,
    };
  }

  private simulatePolicyComparison(dto: ComparePoliciesDto): PolicyComparisonResult[] {
    return dto.policyIds.map((id, index) => ({
      policyId: id,
      policyName: `政策 ${index + 1}`,
      dimensions: [
        { dimension: '适用范围', similarity: 0.7 + Math.random() * 0.2, differences: ['适用行业不同'], similarities: ['均适用数据处理者'] },
        { dimension: '合规要求', similarity: 0.6 + Math.random() * 0.3, differences: ['具体要求不同'], similarities: ['均要求数据安全'] },
      ],
    }));
  }

  private simulateChatResponse(dto: ChatQueryDto): ChatResponse {
    const responses: Record<string, string> = {
      'COU': 'COU（Compliance Obligation Unit）是将法律法规条款转化为结构化合规要求的最小单元。',
      '数据安全法': '《数据安全法》是我国数据安全领域的基础性法律，确立了数据分类分级保护制度。',
      '个人信息保护': '个人信息保护遵循告知同意、最小必要、安全保障等基本原则。',
    };

    let answer = '我理解您想了解关于数据安全合规的问题。建议您查看相关政策文件或使用COU浏览器。';
    for (const [key, value] of Object.entries(responses)) {
      if (dto.query.includes(key)) {
        answer = value;
        break;
      }
    }

    return {
      answer,
      sources: [{ type: 'policy', id: 'policy-001', title: '数据安全法', content: '相关条款...' }],
      suggestedQuestions: ['COU的权重如何计算？', '如何创建自定义场景？'],
      tokenUsage: 500,
    };
  }
}
