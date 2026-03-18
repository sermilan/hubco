/**
 * 阿里云 (Aliyun / Tongyi Qianwen) Provider
 * 模型: qwen-turbo, qwen-plus, qwen-max
 * 文档: https://help.aliyun.com/zh/dashscope/developer-reference/quick-start
 *
 * 特点:
 * - 通义千问，阿里云生态
 * - 多种模型规格可选
 * - 支持长文本（32K-128K）
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AIProvider,
  AICompletionRequest,
  AICompletionResponse,
} from './ai-provider.interface';

@Injectable()
export class AliyunProvider implements AIProvider {
  private readonly logger = new Logger(AliyunProvider.name);
  readonly name = '阿里云通义千问';

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('ALIYUN_API_KEY') || '';
    this.baseUrl = this.configService.get<string>('ALIYUN_BASE_URL') || 'https://dashscope.aliyuncs.com/api/v1';
    this.model = this.configService.get<string>('ALIYUN_MODEL') || 'qwen-turbo';
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async chatCompletion(request: AICompletionRequest): Promise<AICompletionResponse> {
    if (!this.isAvailable()) {
      throw new Error('阿里云AI未配置，请设置 ALIYUN_API_KEY');
    }

    const url = `${this.baseUrl}/services/aigc/text-generation/generation`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          input: {
            messages: request.messages,
          },
          parameters: {
            temperature: request.temperature ?? 0.7,
            max_tokens: request.maxTokens ?? 2048,
            result_format: 'message',
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`阿里云AI请求失败: ${response.status} - ${error}`);
      }

      const data = await response.json();

      return {
        content: data.output?.choices[0]?.message?.content || '',
        totalTokens: data.usage?.total_tokens || 0,
        promptTokens: data.usage?.input_tokens,
        completionTokens: data.usage?.output_tokens,
        model: this.model,
      };
    } catch (error) {
      this.logger.error('阿里云AI调用失败:', error);
      throw error;
    }
  }

  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
