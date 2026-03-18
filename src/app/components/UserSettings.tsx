import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Slider } from "./ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  User,
  Bell,
  Shield,
  CreditCard,
  LogOut,
  Bot,
  CheckCircle,
  AlertCircle,
  Loader2,
  Zap,
  Settings2,
  BarChart3,
  RefreshCw,
  ExternalLink,
  Info,
  Trash2,
  Edit3,
} from "lucide-react";
import { aiConfigAPI, type AIProviderType, type AIProviderInfo } from "../services/api";

// 提供商图标映射
const PROVIDER_ICONS: Record<AIProviderType, string> = {
  zhipu: '🟢',
  deepseek: '🔵',
  kimi: '🟣',
  baidu: '🔴',
  aliyun: '🟠',
  doubao: '🟡',
};

// 提供商颜色主题
const PROVIDER_THEMES: Record<AIProviderType, { bg: string; border: string; text: string }> = {
  zhipu: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
  deepseek: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
  kimi: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700" },
  baidu: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700" },
  aliyun: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
  doubao: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700" },
};

interface UserSettingsProps {
  onLogout: () => void;
}

const providerDisplayNames: Record<Exclude<AIProviderType, 'mock'>, string> = {
  zhipu: '智谱AI',
  deepseek: 'DeepSeek',
  kimi: 'Kimi',
  baidu: '文心一言',
  aliyun: '通义千问',
  doubao: '豆包',
};

// 提供商描述
const PROVIDER_DESCRIPTIONS: Record<Exclude<AIProviderType, 'mock'>, string> = {
  zhipu: 'GLM-4系列，支持超长上下文',
  deepseek: 'DeepSeek-V3/R1，高性价比',
  kimi: 'Moonshot大模型，长文本专家',
  baidu: '文心一言，中文理解能力强',
  aliyun: '通义千问，多场景适配',
  doubao: '字节豆包，实时响应快',
};

// 模型推荐标签
const MODEL_TAGS: Record<string, string[]> = {
  'zhipu': ['glm-4', 'glm-4-flash', 'glm-4v'],
  'deepseek': ['deepseek-chat', 'deepseek-coder', 'deepseek-reasoner'],
  'kimi': ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
  'baidu': ['ernie-bot-4', 'ernie-bot-turbo', 'ernie-speed'],
  'aliyun': ['qwen-max', 'qwen-plus', 'qwen-turbo'],
  'doubao': ['doubao-pro', 'doubao-lite', 'doubao-vision'],
};

// 获取文档链接
const getProviderDocUrl = (provider: Exclude<AIProviderType, 'mock'>): string => {
  const urls: Record<Exclude<AIProviderType, 'mock'>, string> = {
    zhipu: 'https://open.bigmodel.cn/dev/howuse/model',
    deepseek: 'https://platform.deepseek.com/docs',
    kimi: 'https://platform.moonshot.cn/docs',
    baidu: 'https://cloud.baidu.com/doc/WENXINWORKSHOP/index.html',
    aliyun: 'https://help.aliyun.com/zh/dashscope',
    doubao: 'https://www.volcengine.com/docs/82379',
  };
  return urls[provider];
};

export function UserSettings({ onLogout }: UserSettingsProps) {
  type RealProvider = Exclude<AIProviderType, 'mock'>;

  // AI配置状态
  const [aiStatus, setAiStatus] = useState<{
    currentProvider: RealProvider;
    availableProviders: AIProviderInfo[];
    isConfigured: boolean;
  } | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<RealProvider>('zhipu');
  const [aiApiKey, setAiApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [model, setModel] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);

  // 高级设置
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [enableFallback, setEnableFallback] = useState(true);

  // 加载AI配置状态
  useEffect(() => {
    const loadAIStatus = async () => {
      try {
        const status = await aiConfigAPI.getStatus();
        // 过滤掉mock提供商
        const filteredProviders = status.availableProviders.filter(p => p.type !== 'mock');
        setAiStatus({
          currentProvider: status.currentProvider as RealProvider,
          availableProviders: filteredProviders,
          isConfigured: status.isConfigured && status.currentProvider !== 'mock',
        });
        if (status.currentProvider !== 'mock') {
          setSelectedProvider(status.currentProvider as RealProvider);
        }
        // 加载已保存的配置
        const savedConfig = await aiConfigAPI.getConfig();
        if (savedConfig.provider !== 'mock') {
          setAiApiKey(savedConfig.apiKey || '');
          setApiSecret(savedConfig.apiSecret || '');
          setModel(savedConfig.model || '');
        }
      } catch (error) {
        console.error('加载AI配置失败:', error);
      }
    };
    loadAIStatus();
  }, []);

  // 测试连接
  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await aiConfigAPI.testConnection(selectedProvider, aiApiKey, apiSecret || undefined);
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, message: '测试失败，请检查网络连接' });
    } finally {
      setTesting(false);
    }
  };

  // 保存配置
  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      await aiConfigAPI.updateConfig({
        provider: selectedProvider,
        apiKey: aiApiKey || undefined,
        apiSecret: apiSecret || undefined,
        model: model || undefined,
      });
      const status = await aiConfigAPI.getStatus();
      setAiStatus(status);
      alert('配置保存成功');
    } catch (error) {
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  // 获取当前选中提供商的模型列表
  const currentProviderModels = aiStatus?.availableProviders.find(
    p => p.type === selectedProvider
  )?.models || MODEL_TAGS[selectedProvider] || [];

  // 计算配置完成度
  const getConfigProgress = () => {
    let progress = 30; // 选择提供商默认30分
    if (aiApiKey) progress += 40;
    if (model) progress += 30;
    return progress;
  };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* 个人信息 */}
        <Card className="p-6">
          <h3 className="mb-6 flex items-center gap-2">
            <User className="size-5 text-blue-600" />
            个人信息
          </h3>

          <div className="flex items-center gap-6 mb-6">
            <Avatar className="size-20">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-2xl">
                企
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm">更换头像</Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">姓名</Label>
              <Input id="name" defaultValue="张三" />
            </div>
            <div>
              <Label htmlFor="email">邮箱</Label>
              <Input id="email" type="email" defaultValue="zhang@company.com" />
            </div>
            <div>
              <Label htmlFor="org">所属机构</Label>
              <Input id="org" defaultValue="某互联网科技有限公司" />
            </div>
            <div>
              <Label htmlFor="role">角色</Label>
              <Input id="role" defaultValue="管理员" disabled />
            </div>
          </div>

          <Button className="mt-6 bg-blue-600">保存更改</Button>
        </Card>

        {/* 订阅信息 */}
        <Card className="p-6">
          <h3 className="mb-6 flex items-center gap-2">
            <CreditCard className="size-5 text-blue-600" />
            订阅信息
          </h3>

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg mb-4">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="text-lg">企业版</span>
                <Badge className="bg-green-500">活跃</Badge>
              </div>
              <p className="text-sm text-gray-600">有效期至 2024-12-31</p>
            </div>
            <div className="text-right">
              <div className="text-2xl mb-1">¥2,999</div>
              <p className="text-sm text-gray-600">/月</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="text-xl mb-1">5 / 20</div>
              <div className="text-xs text-gray-600">用户数</div>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="text-xl mb-1">12 / ∞</div>
              <div className="text-xs text-gray-600">场景数</div>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="text-xl mb-1">3.2K / 10K</div>
              <div className="text-xs text-gray-600">API调用</div>
            </div>
          </div>

          <Button variant="outline">管理订阅</Button>
        </Card>

        {/* AI服务配置 - 新版设计 */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Bot className="size-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">AI服务配置</h3>
                <p className="text-sm text-gray-500">配置大语言模型提供商，支持智能分析、COU提取等功能</p>
              </div>
            </div>
            {aiStatus?.isConfigured && (
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <CheckCircle className="size-3 mr-1" />
                已启用
              </Badge>
            )}
          </div>

          <Tabs defaultValue="providers" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="providers" className="gap-2">
                <Zap className="size-4" />
                选择提供商
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings2 className="size-4" />
                详细配置
              </TabsTrigger>
              <TabsTrigger value="usage" className="gap-2">
                <BarChart3 className="size-4" />
                使用统计
              </TabsTrigger>
            </TabsList>

            {/* 提供商选择 */}
            <TabsContent value="providers" className="space-y-6">
              {/* 当前使用状态 */}
              {aiStatus?.isConfigured && (
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{PROVIDER_ICONS[aiStatus.currentProvider]}</div>
                      <div>
                        <div className="font-medium text-green-900">
                          当前使用：{providerDisplayNames[aiStatus.currentProvider]}
                        </div>
                        <div className="text-sm text-green-700">
                          {PROVIDER_DESCRIPTIONS[aiStatus.currentProvider]}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="border-green-300 text-green-700">
                      <RefreshCw className="size-4 mr-1" />
                      切换
                    </Button>
                  </div>
                </div>
              )}

              {/* 提供商网格 */}
              <div>
                <Label className="text-base font-medium mb-4 block">选择AI提供商</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {(Object.keys(PROVIDER_ICONS) as AIProviderType[]).map((provider) => {
                    const theme = PROVIDER_THEMES[provider];
                    const isSelected = selectedProvider === provider;
                    const isCurrent = aiStatus?.currentProvider === provider;

                    return (
                      <button
                        key={provider}
                        onClick={() => {
                          setSelectedProvider(provider);
                          setTestResult(null);
                          setAiApiKey('');
                          setApiSecret('');
                          setModel('');
                        }}
                        className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                          isSelected
                            ? `${theme.bg} ${theme.border} border-2`
                            : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }`}
                      >
                        {/* 选中标记 */}
                        {isSelected && (
                          <div className={`absolute top-2 right-2 w-5 h-5 rounded-full ${theme.bg} ${theme.border} border flex items-center justify-center`}>
                            <CheckCircle className={`size-3 ${theme.text}`} />
                          </div>
                        )}
                        {/* 当前使用标记 */}
                        {isCurrent && !isSelected && (
                          <div className="absolute top-2 right-2">
                            <Badge className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700">使用中</Badge>
                          </div>
                        )}

                        <div className="text-3xl mb-2">{PROVIDER_ICONS[provider]}</div>
                        <div className="font-medium text-sm">{providerDisplayNames[provider]}</div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {PROVIDER_DESCRIPTIONS[provider]}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 配置进度 */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">配置进度</span>
                  <span className="text-sm text-gray-500">{getConfigProgress()}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${getConfigProgress()}%` }}
                  />
                </div>
                <div className="flex gap-4 mt-3 text-xs text-gray-500">
                  <span className="text-green-600">✓ 选择提供商</span>
                  <span className={aiApiKey ? 'text-green-600' : ''}>✓ 填写密钥</span>
                  <span className={model ? 'text-green-600' : ''}>✓ 选择模型</span>
                </div>
              </div>

              {/* 快速配置区 */}
              <Card className="p-4 border-blue-200 bg-blue-50/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{PROVIDER_ICONS[selectedProvider]}</span>
                      <span className="font-medium">{providerDisplayNames[selectedProvider]} 快速配置</span>
                    </div>
                    <a
                      href={getProviderDocUrl(selectedProvider)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      获取API密钥
                      <ExternalLink className="size-3" />
                    </a>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="quick-api-key" className="flex items-center gap-2">
                        API Key
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="size-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>从{providerDisplayNames[selectedProvider]}官网获取的API密钥</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <div className="relative mt-1.5">
                        <Input
                          id="quick-api-key"
                          type={showKey ? 'text' : 'password'}
                          placeholder={`sk-...`}
                          value={aiApiKey}
                          onChange={(e) => setAiApiKey(e.target.value)}
                          className="pr-20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKey(!showKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
                        >
                          {showKey ? '隐藏' : '显示'}
                        </button>
                      </div>
                    </div>

                    {(selectedProvider === 'baidu' || selectedProvider === 'aliyun') && (
                      <div>
                        <Label htmlFor="quick-api-secret">API Secret</Label>
                        <Input
                          id="quick-api-secret"
                          type="password"
                          placeholder="输入Secret"
                          value={apiSecret}
                          onChange={(e) => setApiSecret(e.target.value)}
                          className="mt-1.5"
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="quick-model">选择模型</Label>
                      <Select value={model} onValueChange={setModel}>
                        <SelectTrigger id="quick-model" className="mt-1.5">
                          <SelectValue placeholder="推荐使用默认模型" />
                        </SelectTrigger>
                        <SelectContent>
                          {currentProviderModels.map((m) => (
                            <SelectItem key={m} value={m}>
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={handleTestConnection}
                        disabled={testing || !aiApiKey}
                        className="flex-1"
                      >
                        {testing && <Loader2 className="size-4 mr-2 animate-spin" />}
                        {testResult?.success ? '连接正常' : '测试连接'}
                      </Button>
                      <Button
                        onClick={handleSaveConfig}
                        disabled={saving || !aiApiKey}
                        className="flex-1 bg-blue-600"
                      >
                        {saving && <Loader2 className="size-4 mr-2 animate-spin" />}
                        保存配置
                      </Button>
                    </div>

                    {testResult && (
                      <div className={`flex items-center gap-2 text-sm ${
                        testResult.success ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {testResult.success ? (
                          <CheckCircle className="size-4" />
                        ) : (
                          <AlertCircle className="size-4" />
                        )}
                        {testResult.message}
                      </div>
                    )}
                  </div>
                </Card>
            </TabsContent>

            {/* 详细配置 */}
            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4">
                      <Label className="flex items-center gap-2 mb-3">
                        温度 (Temperature)
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="size-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>值越高，输出越随机创造性；值越低，输出越确定保守</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[temperature]}
                          onValueChange={(v) => setTemperature(v[0])}
                          min={0}
                          max={2}
                          step={0.1}
                          className="flex-1"
                        />
                        <span className="w-12 text-right font-mono">{temperature}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>保守</span>
                        <span>平衡</span>
                        <span>创意</span>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <Label className="flex items-center gap-2 mb-3">
                        最大Token数
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="size-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>单次请求的最大返回字数限制</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <Select value={String(maxTokens)} onValueChange={(v) => setMaxTokens(Number(v))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2048">2K (精简)</SelectItem>
                          <SelectItem value="4096">4K (标准)</SelectItem>
                          <SelectItem value="8192">8K (长文本)</SelectItem>
                          <SelectItem value="16384">16K (超长)</SelectItem>
                          <SelectItem value="32768">32K (极长)</SelectItem>
                        </SelectContent>
                      </Select>
                    </Card>
                  </div>

                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">自动降级</div>
                        <div className="text-sm text-gray-500">主服务不可用时自动切换到备用模型</div>
                      </div>
                      <Switch checked={enableFallback} onCheckedChange={setEnableFallback} />
                    </div>
                  </Card>

                  <Card className="p-4 border-amber-200 bg-amber-50">
                    <div className="flex items-start gap-3">
                      <Info className="size-5 text-amber-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-amber-900">配置提示</div>
                        <ul className="text-sm text-amber-800 mt-1 space-y-1">
                          <li>• 温度值建议：分析任务0.3-0.5，创意任务0.7-1.0</li>
                          <li>• 长文本场景建议开启32K上下文模型</li>
                          <li>• 生产环境建议启用自动降级以保证稳定性</li>
                        </ul>
                      </div>
                    </div>
                  </Card>

                  <Button onClick={handleSaveConfig} className="w-full bg-blue-600">
                    保存高级设置
                  </Button>
            </TabsContent>

            {/* 使用统计 */}
            <TabsContent value="usage" className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">12.5K</div>
                  <div className="text-sm text-gray-500">本月Token消耗</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">856</div>
                  <div className="text-sm text-gray-500">API调用次数</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">¥23.5</div>
                  <div className="text-sm text-gray-500">预估费用</div>
                </Card>
              </div>

              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">功能使用分布</h4>
                  <Badge variant="secondary">本月</Badge>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'COU智能提取', count: 320, percent: 37 },
                    { label: '政策摘要生成', count: 215, percent: 25 },
                    { label: '标签推荐', count: 180, percent: 21 },
                    { label: '合规问答', count: 141, percent: 17 },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.label}</span>
                        <span className="text-gray-500">{item.count}次</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="text-center text-sm text-gray-500">
                详细账单请前往各AI提供商控制台查看
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* 通知设置 */}
        <Card className="p-6">
          <h3 className="mb-6 flex items-center gap-2">
            <Bell className="size-5 text-blue-600" />
            通知设置
          </h3>

          <div className="space-y-4">
            {[
              { label: "邮件通知", description: "接收政策更新和系统通知邮件" },
              { label: "新政策提醒", description: "有新政策发布时通知我" },
              { label: "场景更新", description: "场景中的COU发生变化时通知我" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <div className="mb-1">{item.label}</div>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
                <Switch defaultChecked />
              </div>
            ))}
          </div>
        </Card>

        {/* 安全设置 */}
        <Card className="p-6">
          <h3 className="mb-6 flex items-center gap-2">
            <Shield className="size-5 text-blue-600" />
            安全设置
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="mb-1">修改密码</div>
                <p className="text-sm text-gray-600">定期更换密码以保护账户安全</p>
              </div>
              <Button variant="outline">修改</Button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <div className="mb-1">双因素认证</div>
                <p className="text-sm text-gray-600">启用2FA增强账户安全性</p>
              </div>
              <Button variant="outline">启用</Button>
            </div>
          </div>
        </Card>

        {/* 危险操作 */}
        <Card className="p-6 border-red-200">
          <h3 className="mb-6 text-red-600">危险操作</h3>

          <div className="flex items-center justify-between">
            <div>
              <div className="mb-1">注销账户</div>
              <p className="text-sm text-gray-600">永久删除您的账户和所有数据</p>
            </div>
            <Button variant="outline" className="text-red-600 border-red-300">
              注销账户
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
