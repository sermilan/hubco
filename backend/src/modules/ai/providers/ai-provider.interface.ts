/**
 * AI Provider 接口
 * 统一不同AI服务商的调用方式
 */

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICompletionRequest {
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AICompletionResponse {
  content: string;
  totalTokens: number;
  promptTokens?: number;
  completionTokens?: number;
  model?: string;
}

export interface AIEmbeddingRequest {
  input: string | string[];
  model?: string;
}

export interface AIEmbeddingResponse {
  embeddings: number[][];
  totalTokens: number;
}

/**
 * AI Provider 统一接口
 */
export interface AIProvider {
  /**
   * Provider名称
   */
  readonly name: string;

  /**
   * 是否可用（检查配置是否完整）
   */
  isAvailable(): boolean;

  /**
   * 文本补全（对话）
   */
  chatCompletion(request: AICompletionRequest): Promise<AICompletionResponse>;

  /**
   * 文本向量化
   */
  createEmbedding?(request: AIEmbeddingRequest): Promise<AIEmbeddingResponse>;

  /**
   * 估算token数量
   */
  estimateTokens(text: string): number;
}

/**
 * AI Provider 类型
 */
export type AIProviderType =
  | 'zhipu'      // 智谱AI (GLM-4)
  | 'baidu'      // 百度千帆 (文心一言)
  | 'aliyun'     // 阿里云 (通义千问)
  | 'deepseek'   // 深度求索
  | 'kimi'       // 月之暗面
  | 'doubao'     // 字节豆包
  | 'spark'      // 讯飞星火
  | 'minimax'    // MiniMax
  | 'mock';      // 模拟模式（无真实AI）

/**
 * Provider 配置
 */
export interface AIProviderConfig {
  type: AIProviderType;
  apiKey: string;
  apiSecret?: string;      // 部分厂商需要
  baseUrl?: string;        // 自定义API地址
  model?: string;          // 指定模型
  timeout?: number;        // 超时时间（毫秒）
  maxRetries?: number;     // 最大重试次数
}
