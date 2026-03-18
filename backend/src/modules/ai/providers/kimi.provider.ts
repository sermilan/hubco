/**
 * 月之暗面 (Moonshot AI / Kimi) Provider
 * 模型: Kimi-K2, Kimi-K1.5
 * 文档: https://platform.moonshot.cn/docs
 *
 * 特点:
 * - 超长上下文（200K，测试阶段支持200万汉字）
 * - 擅长长文档处理
 * - 中文理解能力强
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AIProvider,
  AICompletionRequest,
  AICompletionResponse,
} from './ai-provider.interface';

@Injectable()
export class KimiProvider implements AIProvider {
  private readonly logger = new Logger(KimiProvider.name);
  readonly name = 'Kimi';

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('KIMI_API_KEY') || '';
    this.baseUrl = this.configService.get<string>('KIMI_BASE_URL') || 'https://api.moonshot.cn/v1';
    this.model = this.configService.get<string>('KIMI_MODEL') || 'moonshot-v1-8k';
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async chatCompletion(request: AICompletionRequest): Promise<AICompletionResponse> {
    if (!this.isAvailable()) {
      throw new Error('Kimi未配置，请设置 KIMI_API_KEY');
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
        throw new Error(`Kimi请求失败: ${response.status} - ${error}`);
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
      this.logger.error('Kimi调用失败:', error);
      throw error;
    }
  }

  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
