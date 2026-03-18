/**
 * DeepSeek Provider
 * 模型: DeepSeek-V3, DeepSeek-R1
 * 文档: https://platform.deepseek.com/api-docs
 *
 * 特点:
 * - 开源模型，性价比高
 * - 推理能力强（R1版本）
 * - 支持128K上下文
 * - 价格极具竞争力
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AIProvider,
  AICompletionRequest,
  AICompletionResponse,
} from './ai-provider.interface';

@Injectable()
export class DeepSeekProvider implements AIProvider {
  private readonly logger = new Logger(DeepSeekProvider.name);
  readonly name = 'DeepSeek';

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('DEEPSEEK_API_KEY') || '';
    this.baseUrl = this.configService.get<string>('DEEPSEEK_BASE_URL') || 'https://api.deepseek.com';
    this.model = this.configService.get<string>('DEEPSEEK_MODEL') || 'deepseek-chat';
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async chatCompletion(request: AICompletionRequest): Promise<AICompletionResponse> {
    if (!this.isAvailable()) {
      throw new Error('DeepSeek未配置，请设置 DEEPSEEK_API_KEY');
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
        throw new Error(`DeepSeek请求失败: ${response.status} - ${error}`);
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
      this.logger.error('DeepSeek调用失败:', error);
      throw error;
    }
  }

  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
