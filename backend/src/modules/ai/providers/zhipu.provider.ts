/**
 * 智谱AI (Zhipu AI) Provider
 * 模型: GLM-4, GLM-4-Flash, GLM-3-Turbo
 * 文档: https://open.bigmodel.cn/dev/api
 *
 * 特点:
 * - 中文理解能力强
 * - 支持长文本（128K上下文）
 * - 价格适中
 * - 国内访问稳定
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AIProvider,
  AIMessage,
  AICompletionRequest,
  AICompletionResponse,
} from './ai-provider.interface';

@Injectable()
export class ZhipuProvider implements AIProvider {
  private readonly logger = new Logger(ZhipuProvider.name);
  readonly name = '智谱AI';

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly timeout: number;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('ZHIPU_API_KEY') || '';
    this.baseUrl = this.configService.get<string>('ZHIPU_BASE_URL') || 'https://open.bigmodel.cn/api/paas/v4';
    this.model = this.configService.get<string>('ZHIPU_MODEL') || 'glm-4-flash';
    this.timeout = this.configService.get<number>('AI_TIMEOUT') || 60000;
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async chatCompletion(request: AICompletionRequest): Promise<AICompletionResponse> {
    if (!this.isAvailable()) {
      throw new Error('智谱AI未配置，请设置 ZHIPU_API_KEY');
    }

    const url = `${this.baseUrl}/chat/completions`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: request.messages,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens ?? 4096,
          stream: false,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`智谱AI请求失败: ${response.status} - ${error}`);
      }

      const data = await response.json();

      return {
        content: data.choices[0]?.message?.content || '',
        totalTokens: data.usage?.total_tokens || 0,
        promptTokens: data.usage?.prompt_tokens,
        completionTokens: data.usage?.completion_tokens,
        model: data.model,
      };
    } catch (error) {
      this.logger.error('智谱AI调用失败:', error);
      throw error;
    }
  }

  estimateTokens(text: string): number {
    // 智谱AI使用约4字符/token的估算
    return Math.ceil(text.length / 4);
  }
}
