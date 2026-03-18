import { useState } from "react";
import {
  MOCK_SUBSCRIPTION,
  MOCK_ORGANIZATION,
  SUBSCRIPTION_PLANS,
  MOCK_API_KEYS,
  MOCK_USAGE_STATS,
} from "../data/mockData";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Key,
  CreditCard,
  Building2,
  Users,
  Database,
  Zap,
  Copy,
  Eye,
  EyeOff,
  Plus,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

export function Dashboard() {
  const [showApiSecret, setShowApiSecret] = useState<Record<string, boolean>>({});
  const subscription = MOCK_SUBSCRIPTION;
  const organization = MOCK_ORGANIZATION;
  const currentPlan = SUBSCRIPTION_PLANS.find(
    (p) => p.id === subscription.planId
  )!;

  // 计算使用率
  const apiUsagePercent =
    (subscription.currentUsage.apiCalls / currentPlan.limits.apiCalls) * 100;
  const userUsagePercent =
    currentPlan.limits.users === -1
      ? 0
      : (subscription.currentUsage.users / currentPlan.limits.users) * 100;
  const storageUsagePercent =
    (subscription.currentUsage.storage / currentPlan.limits.storage) * 100;

  // 最近7天统计
  const recentStats = MOCK_USAGE_STATS.slice(-7);
  const totalApiCalls = recentStats.reduce((sum, stat) => sum + stat.apiCalls, 0);
  const avgResponseTime =
    recentStats.reduce((sum, stat) => sum + stat.avgResponseTime, 0) /
    recentStats.length;
  const avgErrorRate =
    recentStats.reduce((sum, stat) => sum + stat.errorRate, 0) /
    recentStats.length;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("已复制到剪贴板");
  };

  const toggleSecretVisibility = (keyId: string) => {
    setShowApiSecret((prev) => ({
      ...prev,
      [keyId]: !prev[keyId],
    }));
  };

  return (
    <div className="min-h-full bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-6">
          <h2 className="text-2xl mb-2">企业控制台</h2>
          <p className="text-gray-600">管理您的订阅、API密钥和使用情况</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">
              <BarChart3 className="size-4 mr-2" />
              概览
            </TabsTrigger>
            <TabsTrigger value="api-keys">
              <Key className="size-4 mr-2" />
              API密钥
            </TabsTrigger>
            <TabsTrigger value="subscription">
              <CreditCard className="size-4 mr-2" />
              订阅管理
            </TabsTrigger>
            <TabsTrigger value="organization">
              <Building2 className="size-4 mr-2" />
              企业信息
            </TabsTrigger>
          </TabsList>

          {/* 概览页 */}
          <TabsContent value="overview" className="space-y-6">
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">7日API调用</span>
                  <Activity className="size-5 text-blue-600" />
                </div>
                <div className="text-3xl mb-1">{totalApiCalls.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="size-4" />
                  <span>+12.5%</span>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">平均响应时间</span>
                  <Zap className="size-5 text-yellow-600" />
                </div>
                <div className="text-3xl mb-1">{Math.round(avgResponseTime)}ms</div>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingDown className="size-4" />
                  <span>-5.2%</span>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">错误率</span>
                  <Activity className="size-5 text-red-600" />
                </div>
                <div className="text-3xl mb-1">{avgErrorRate.toFixed(2)}%</div>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingDown className="size-4" />
                  <span>-0.3%</span>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">本月剩余配额</span>
                  <Database className="size-5 text-purple-600" />
                </div>
                <div className="text-3xl mb-1">
                  {(
                    currentPlan.limits.apiCalls - subscription.currentUsage.apiCalls
                  ).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">
                  / {currentPlan.limits.apiCalls.toLocaleString()}
                </div>
              </Card>
            </div>

            {/* 使用量统计 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="mb-6">资源使用情况</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">API调用次数</span>
                      <span className="text-sm">
                        {subscription.currentUsage.apiCalls.toLocaleString()} /{" "}
                        {currentPlan.limits.apiCalls.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={apiUsagePercent} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                      已使用 {apiUsagePercent.toFixed(1)}%
                    </p>
                  </div>

                  {currentPlan.limits.users !== -1 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">团队成员</span>
                        <span className="text-sm">
                          {subscription.currentUsage.users} /{" "}
                          {currentPlan.limits.users}
                        </span>
                      </div>
                      <Progress value={userUsagePercent} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        已使用 {userUsagePercent.toFixed(1)}%
                      </p>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">存储空间</span>
                      <span className="text-sm">
                        {subscription.currentUsage.storage} MB /{" "}
                        {currentPlan.limits.storage} MB
                      </span>
                    </div>
                    <Progress value={storageUsagePercent} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                      已使用 {storageUsagePercent.toFixed(1)}%
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">自定义场景</span>
                      <span className="text-sm">
                        {subscription.currentUsage.scenarios}
                        {currentPlan.limits.scenarios === -1
                          ? " / 无限"
                          : ` / ${currentPlan.limits.scenarios}`}
                      </span>
                    </div>
                    <Progress
                      value={
                        currentPlan.limits.scenarios === -1
                          ? 0
                          : (subscription.currentUsage.scenarios /
                              currentPlan.limits.scenarios) *
                            100
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="mb-6">API调用趋势</h3>
                <div className="space-y-2">
                  {recentStats.map((stat) => (
                    <div
                      key={stat.date}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                    >
                      <span className="text-sm text-gray-600">{stat.date}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm">
                          {stat.apiCalls.toLocaleString()} 次
                        </span>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${
                                (stat.apiCalls /
                                  Math.max(...recentStats.map((s) => s.apiCalls))) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* 热门接口 */}
            <Card className="p-6">
              <h3 className="mb-4">热门API接口（近7日）</h3>
              <div className="space-y-3">
                {recentStats[recentStats.length - 1].topEndpoints.map(
                  (endpoint, idx) => (
                    <div
                      key={endpoint.endpoint}
                      className="flex items-center gap-4"
                    >
                      <Badge variant="outline" className="text-xs">
                        #{idx + 1}
                      </Badge>
                      <code className="flex-1 text-sm bg-gray-50 px-3 py-2 rounded">
                        {endpoint.endpoint}
                      </code>
                      <span className="text-sm text-gray-600">
                        {endpoint.count.toLocaleString()} 次
                      </span>
                    </div>
                  )
                )}
              </div>
            </Card>
          </TabsContent>

          {/* API密钥管理 */}
          <TabsContent value="api-keys" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="mb-1">API密钥管理</h3>
                  <p className="text-sm text-gray-600">
                    管理您的API密钥，保护好密钥信息
                  </p>
                </div>
                <Button>
                  <Plus className="size-4 mr-2" />
                  创建新密钥
                </Button>
              </div>

              <div className="space-y-4">
                {MOCK_API_KEYS.map((apiKey) => (
                  <Card key={apiKey.id} className="p-5 bg-gray-50">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4>{apiKey.name}</h4>
                          <Badge
                            variant={
                              apiKey.status === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {apiKey.status === "active" ? "活跃" : "已停用"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          创建于 {apiKey.createdAt}
                          {apiKey.lastUsedAt && (
                            <span className="ml-2">
                              • 最后使用：{new Date(apiKey.lastUsedAt).toLocaleString()}
                            </span>
                          )}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        编辑
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                          API Key (公钥)
                        </label>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 bg-white px-3 py-2 rounded border text-sm">
                            {apiKey.key}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(apiKey.key)}
                          >
                            <Copy className="size-4" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                          API Secret (私钥)
                        </label>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 bg-white px-3 py-2 rounded border text-sm">
                            {showApiSecret[apiKey.id]
                              ? apiKey.secret
                              : "sk_live_" + "•".repeat(20)}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleSecretVisibility(apiKey.id)}
                          >
                            {showApiSecret[apiKey.id] ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(apiKey.secret)}
                          >
                            <Copy className="size-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">
                          频率限制：{apiKey.rateLimit} 次/分钟
                        </span>
                        <span className="text-gray-600">
                          权限：{apiKey.permissions.length} 项
                        </span>
                        {apiKey.expiresAt && (
                          <span className="text-gray-600">
                            过期时间：{apiKey.expiresAt}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ 请妥善保管您的API Secret，不要在客户端代码中硬编码或提交到版本控制系统
                </p>
              </div>
            </Card>
          </TabsContent>

          {/* 订阅管理 */}
          <TabsContent value="subscription" className="space-y-6">
            <Card className="p-6">
              <h3 className="mb-6">当前订阅</h3>
              <div className="flex items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h2>{currentPlan.name}</h2>
                    <Badge className="bg-blue-600">当前套餐</Badge>
                  </div>
                  <p className="text-gray-600 mb-4">{currentPlan.description}</p>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-3xl">¥{currentPlan.price}</span>
                    <span className="text-gray-600">/月</span>
                  </div>
                  <div className="space-y-2 mb-6">
                    {currentPlan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="size-5 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-green-600 text-xs">✓</span>
                        </div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline">更换套餐</Button>
                    <Button variant="ghost" className="text-red-600">
                      取消订阅
                    </Button>
                  </div>
                </div>
                <div className="w-80 space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">订阅状态</div>
                    <Badge className="bg-green-600">
                      {subscription.status === "active" ? "活跃" : "已过期"}
                    </Badge>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">订阅周期</div>
                    <div className="text-sm">
                      {subscription.startDate} 至 {subscription.endDate}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">自动续费</div>
                    <Badge variant={subscription.autoRenew ? "default" : "secondary"}>
                      {subscription.autoRenew ? "已开启" : "已关闭"}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* 其他套餐 */}
            <div>
              <h3 className="mb-4">升级套餐</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SUBSCRIPTION_PLANS.filter((p) => p.id !== subscription.planId).map(
                  (plan) => (
                    <Card
                      key={plan.id}
                      className={`p-6 ${
                        plan.isPopular ? "border-2 border-blue-500" : ""
                      }`}
                    >
                      {plan.isPopular && (
                        <Badge className="mb-3 bg-blue-600">推荐</Badge>
                      )}
                      <h3 className="mb-2">{plan.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {plan.description}
                      </p>
                      <div className="flex items-baseline gap-2 mb-6">
                        <span className="text-3xl">¥{plan.price}</span>
                        <span className="text-gray-600">/月</span>
                      </div>
                      <div className="space-y-2 mb-6">
                        {plan.features.slice(0, 4).map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="size-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-green-600 text-xs">✓</span>
                            </div>
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                      <Button className="w-full" variant="outline">
                        {plan.price > currentPlan.price ? "升级" : "了解更多"}
                      </Button>
                    </Card>
                  )
                )}
              </div>
            </div>
          </TabsContent>

          {/* 企业信息 */}
          <TabsContent value="organization">
            <Card className="p-6 max-w-3xl">
              <h3 className="mb-6">企业信息</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    企业名称
                  </label>
                  <div className="text-sm">{organization.name}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    所属行业
                  </label>
                  <div className="text-sm">{organization.industry}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    联系人
                  </label>
                  <div className="text-sm">{organization.contactPerson}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    联系电话
                  </label>
                  <div className="text-sm">{organization.phone}</div>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-gray-600 mb-1 block">
                    联系邮箱
                  </label>
                  <div className="text-sm">{organization.email}</div>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-gray-600 mb-1 block">
                    企业地址
                  </label>
                  <div className="text-sm">{organization.address}</div>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-gray-600 mb-1 block">
                    统一社会信用代码
                  </label>
                  <div className="text-sm">
                    {organization.unifiedSocialCreditCode}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-gray-600 mb-1 block">
                    注册时间
                  </label>
                  <div className="text-sm">{organization.createdAt}</div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t">
                <Button>编辑企业信息</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
