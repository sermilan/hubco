/**
 * 百度千帆 (Baidu Qianfan) Provider
 * 模型: ERNIE-Bot, ERNIE-Bot-Turbo, ERNIE-Bot-4
 * 文档: https://cloud.baidu.com/doc/WENXINWORKSHOP/index.html
 *
 * 特点:
 * - 文心一言，国内最早的大模型
 * - 丰富的行业解决方案
 * - 百度生态集成
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AIProvider,
  AICompletionRequest,
  AICompletionResponse,
} from './ai-provider.interface';

@Injectable()
export class BaiduProvider implements AIProvider {
  private readonly logger = new Logger(BaiduProvider.name);
  readonly name = '百度文心一言';

  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly baseUrl: string;
  private readonly model: string;
  private accessToken: string | null = null;
  private tokenExpireTime: number = 0;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('BAIDU_API_KEY') || '';
    this.apiSecret = this.configService.get<string>('BAIDU_API_SECRET') || '';
    this.baseUrl = this.configService.get<string>('BAIDU_BASE_URL') || 'https://aip.baidubce.com';
    this.model = this.configService.get<string>('BAIDU_MODEL') || 'ernie-bot-4';
  }

  isAvailable(): boolean {
    return !!this.apiKey && !!this.apiSecret;
  }

  private async getAccessToken(): Promise<string> {
    // Token缓存，避免频繁获取
    if (this.accessToken && Date.now() < this.tokenExpireTime) {
      return this.accessToken;
    }

    const url = `${this.baseUrl}/oauth/2.0/token?grant_type=client_credentials&client_id=${this.apiKey}&client_secret=${this.apiSecret}`;

    const response = await fetch(url, { method: 'POST' });
    if (!response.ok) {
      throw new Error('获取百度AccessToken失败');
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    // Token有效期通常为30天，提前1小时过期
    this.tokenExpireTime = Date.now() + (data.expires_in - 3600) * 1000;

    return this.accessToken!;
  }

  private getModelEndpoint(): string {
    const endpoints: Record<string, string> = {
      'ernie-bot': 'completions',
      'ernie-bot-turbo': 'completions',
      'ernie-bot-4': 'completions_pro',
      'ernie-bot-8k': 'completions',
    };
    return endpoints[this.model] || 'completions';
  }

  async chatCompletion(request: AICompletionRequest): Promise<AICompletionResponse> {
    if (!this.isAvailable()) {
      throw new Error('百度AI未配置，请设置 BAIDU_API_KEY 和 BAIDU_API_SECRET');
    }

    const token = await this.getAccessToken();
    const url = `${this.baseUrl}/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/${this.getModelEndpoint()}?access_token=${token}`;

    try {
      // 转换消息格式
      const messages = request.messages;
      const systemMessage = messages.find(m => m.role === 'system');
      const userMessages = messages.filter(m => m.role !== 'system');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: userMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          system: systemMessage?.content,
          temperature: request.temperature ?? 0.7,
          max_output_tokens: request.maxTokens ?? 2048,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`百度AI请求失败: ${response.status} - ${error}`);
      }

      const data = await response.json();

      return {
        content: data.result || '',
        totalTokens: data.usage?.total_tokens || 0,
        promptTokens: data.usage?.prompt_tokens,
        completionTokens: data.usage?.completion_tokens,
        model: this.model,
      };
    } catch (error) {
      this.logger.error('百度AI调用失败:', error);
      throw error;
    }
  }

  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
