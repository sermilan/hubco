/**
 * AI Provider 工厂
 * 根据配置创建对应的AI Provider实例
 * 支持主备切换
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AIProvider,
  AIProviderType,
  AIProviderConfig,
} from './ai-provider.interface';
import { ZhipuProvider } from './zhipu.provider';
import { DeepSeekProvider } from './deepseek.provider';
import { KimiProvider } from './kimi.provider';
import { BaiduProvider } from './baidu.provider';
import { AliyunProvider } from './aliyun.provider';
import { DoubaoProvider } from './doubao.provider';
import { MockProvider } from './mock.provider';

@Injectable()
export class AIProviderFactory {
  private readonly logger = new Logger(AIProviderFactory.name);
  private providers: Map<AIProviderType, AIProvider> = new Map();
  private fallbackChain: AIProviderType[] = [];

  constructor(private configService: ConfigService) {
    this.initializeProviders();
    this.buildFallbackChain();
  }

  /**
   * 初始化所有Provider
   */
  private initializeProviders(): void {
    this.providers.set('zhipu', new ZhipuProvider(this.configService));
    this.providers.set('deepseek', new DeepSeekProvider(this.configService));
    this.providers.set('kimi', new KimiProvider(this.configService));
    this.providers.set('baidu', new BaiduProvider(this.configService));
    this.providers.set('aliyun', new AliyunProvider(this.configService));
    this.providers.set('doubao', new DoubaoProvider(this.configService));
    this.providers.set('mock', new MockProvider());
  }

  /**
   * 构建fallback链（按优先级）
   */
  private buildFallbackChain(): void {
    // 读取配置的优先级链
    const chainConfig = this.configService.get<string>('AI_FALLBACK_CHAIN');
    if (chainConfig) {
      this.fallbackChain = chainConfig.split(',').map(t => t.trim() as AIProviderType);
    } else {
      // 默认优先级：智谱 > DeepSeek > Kimi > 阿里 > 百度 > 豆包 > Mock
      this.fallbackChain = ['zhipu', 'deepseek', 'kimi', 'aliyun', 'baidu', 'doubao', 'mock'];
    }
  }

  /**
   * 获取主Provider
   */
  getPrimaryProvider(): AIProvider {
    const configuredType = this.configService.get<AIProviderType>('AI_PROVIDER', 'mock');
    const provider = this.providers.get(configuredType);

    if (provider && provider.isAvailable()) {
      this.logger.log(`使用AI Provider: ${provider.name}`);
      return provider;
    }

    // 配置的Provider不可用，尝试fallback链
    this.logger.warn(`配置的AI Provider ${configuredType} 不可用，尝试fallback链`);
    return this.getAvailableProvider();
  }

  /**
   * 获取指定类型的Provider
   */
  getProvider(type: AIProviderType): AIProvider | undefined {
    return this.providers.get(type);
  }

  /**
   * 获取可用的Provider（按fallback链）
   */
  private getAvailableProvider(): AIProvider {
    for (const type of this.fallbackChain) {
      const provider = this.providers.get(type);
      if (provider && provider.isAvailable()) {
        this.logger.log(`Fallback到AI Provider: ${provider.name}`);
        return provider;
      }
    }

    // 所有Provider都不可用，返回Mock
    this.logger.warn('所有AI Provider都不可用，使用Mock模式');
    return this.providers.get('mock')!;
  }

  /**
   * 获取所有可用的Provider列表
   */
  getAvailableProviders(): { type: AIProviderType; name: string; available: boolean }[] {
    return Array.from(this.providers.entries()).map(([type, provider]) => ({
      type,
      name: provider.name,
      available: provider.isAvailable(),
    }));
  }

  /**
   * 检查指定Provider是否可用
   */
  isProviderAvailable(type: AIProviderType): boolean {
    const provider = this.providers.get(type);
    return provider ? provider.isAvailable() : false;
  }

  /**
   * 重新加载配置
   */
  reload(): void {
    this.providers.clear();
    this.initializeProviders();
    this.buildFallbackChain();
  }
}
