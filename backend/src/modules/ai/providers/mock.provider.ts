/**
 * Mock AI Provider (模拟模式)
 * 用于测试或演示环境，不调用真实AI服务
 */

import { Injectable } from '@nestjs/common';
import {
  AIProvider,
  AICompletionRequest,
  AICompletionResponse,
} from './ai-provider.interface';

@Injectable()
export class MockProvider implements AIProvider {
  readonly name = 'Mock (模拟模式)';

  isAvailable(): boolean {
    return true;
  }

  async chatCompletion(request: AICompletionRequest): Promise<AICompletionResponse> {
    const lastMessage = request.messages[request.messages.length - 1]?.content || '';

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    // 简单关键词匹配返回不同回复
    let response = '这是一个模拟的AI回复。请配置真实的AI服务以获得更好的体验。';

    if (lastMessage.includes('COU')) {
      response = 'COU（Compliance Obligation Unit，合规义务单元）是将法律法规条款转化为结构化合规要求的最小单元。每个COU包含明确的义务类型、行动要求和违规后果。';
    } else if (lastMessage.includes('数据安全')) {
      response = '数据安全是指通过采取必要措施，确保数据处于有效保护和合法利用的状态，以及具备保障持续安全状态的能力。主要包括数据分类分级、数据全生命周期安全管理、数据安全风险评估等内容。';
    } else if (lastMessage.includes('个人信息')) {
      response = '个人信息保护遵循告知同意、最小必要、目的限制、安全保障等基本原则。处理个人信息应当具有明确、合理的目的，并应当与处理目的直接相关，采取对个人权益影响最小的方式。';
    }

    const estimatedTokens = Math.ceil((lastMessage.length + response.length) / 4);

    return {
      content: response,
      totalTokens: estimatedTokens,
      model: 'mock',
    };
  }

  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
