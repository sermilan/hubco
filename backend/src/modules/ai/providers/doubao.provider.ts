/**
 * 字节跳动 (ByteDance / Doubao) Provider
 * 模型: Doubao-pro, Doubao-lite
 * 文档: https://www.volcengine.com/docs/82379
 *
 * 特点:
 * - 豆包大模型
 * - 字节生态集成
 * - 多模态能力
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AIProvider,
  AICompletionRequest,
  AICompletionResponse,
} from './ai-provider.interface';

@Injectable()
export class DoubaoProvider implements AIProvider {
  private readonly logger = new Logger(DoubaoProvider.name);
  readonly name = '字节豆包';

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('DOUBAO_API_KEY') || '';
    this.baseUrl = this.configService.get<string>('DOUBAO_BASE_URL') || 'https://ark.cn-beijing.volces.com/api/v3';
    this.model = this.configService.get<string>('DOUBAO_MODEL') || 'doubao-pro-32k';
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async chatCompletion(request: AICompletionRequest): Promise<AICompletionResponse> {
    if (!this.isAvailable()) {
      throw new Error('豆包AI未配置，请设置 DOUBAO_API_KEY');
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
        throw new Error(`豆包AI请求失败: ${response.status} - ${error}`);
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
      this.logger.error('豆包AI调用失败:', error);
      throw error;
    }
  }

  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
