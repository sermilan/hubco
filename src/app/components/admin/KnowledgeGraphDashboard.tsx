// ============ 知识图谱看板 ============
// COU覆盖密度可视化和关联关系展示

import React, { useState, useMemo } from "react";
import {
  Network,
  Target,
  FileText,
  Users,
  Layers,
  BarChart3,
  Activity,
  TrendingUp,
  PieChart,
  Globe,
  Building2,
  Cpu,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Progress } from "../ui/progress";
import { MOCK_POLICIES, MOCK_COUS } from "../../data/mockData";
import { TAGS_BY_DOMAIN } from "../../data/tagDictionary";
import { TAG_DOMAIN_INFO } from "../../types";
import type { TagDomain } from "../../types";

// 模拟统计数据
const MOCK_STATS = {
  totalCOUs: 1247,
  totalPolicies: 523,
  totalClauses: 3456,
  totalScenes: 89,

  byIndustry: {
    金融: 186,
    医疗: 142,
    互联网: 198,
    电信: 98,
    能源: 87,
    教育: 76,
    政务: 134,
    游戏: 65,
    电商: 112,
    通用: 149,
  },

  byRegion: {
    国内: 892,
    欧盟: 187,
    美国: 98,
    东南亚: 45,
    全球: 25,
  },

  byDomain: {
    OBJECT: 312,
    SUBJECT: 198,
    LIFECYCLE: 276,
    SECURITY: 234,
    ACTION: 227,
  },

  coverage: {
    industry: 92, // 行业覆盖率
    lifecycle: 88, // 生命周期覆盖率
    security: 85, // 安全措施覆盖率
    action: 91, // 动作义务覆盖率
  },

  recentUpdates: [
    { date: "2026-03-09", type: "COU", count: 12 },
    { date: "2026-03-08", type: "政策", count: 2 },
    { date: "2026-03-07", type: "COU", count: 8 },
    { date: "2026-03-06", type: "场景", count: 3 },
    { date: "2026-03-05", type: "COU", count: 15 },
  ],
};

// 五维雷达图数据
const RADAR_DATA = [
  { domain: "客体维度", value: 85, fullMark: 100 },
  { domain: "主体维度", value: 72, fullMark: 100 },
  { domain: "业务流转", value: 91, fullMark: 100 },
  { domain: "安全域", value: 78, fullMark: 100 },
  { domain: "动作义务", value: 88, fullMark: 100 },
];

export function KnowledgeGraphDashboard() {
  const [activeView, setActiveView] = useState<"overview" | "network" | "heatmap">(
    "overview"
  );

  // 计算统计数据
  const stats = useMemo(() => {
    return {
      totalCOUs: MOCK_COUS.length,
      totalPolicies: MOCK_POLICIES.length,
      avgWeight: Math.round(
        MOCK_COUS.reduce((sum, c) => sum + c.finalWeight, 0) / MOCK_COUS.length
      ),
      highPriorityCOUs: MOCK_COUS.filter((c) => c.finalWeight >= 15).length,
    };
  }, []);

  // 渲染概览视图
  const renderOverview = () => (
    <div className="space-y-6">
      {/* 关键指标卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-slate-800">
                  {stats.totalCOUs}
                </div>
                <div className="text-sm text-slate-500 mt-1">总COU数量</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-green-600 font-medium">+12</span>
              <span className="text-slate-400">本周新增</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-slate-800">
                  {stats.totalPolicies}
                </div>
                <div className="text-sm text-slate-500 mt-1">政策文件</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-slate-400">覆盖</span>
              <span className="text-blue-600 font-medium">{Object.keys(MOCK_STATS.byIndustry).length}个行业</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-slate-800">
                  {stats.avgWeight}
                </div>
                <div className="text-sm text-slate-500 mt-1">平均权重</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <Progress
                value={stats.avgWeight * 5}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-slate-800">
                  {stats.highPriorityCOUs}
                </div>
                <div className="text-sm text-slate-500 mt-1">高优先级COU</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-slate-400">权重≥15</span>
              <Badge
                variant="outline"
                className="text-xs bg-red-100 text-red-700 border-red-200"
              >
                需优先关注
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 覆盖度分析和五维雷达图 */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-500" />
              覆盖度分析
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(MOCK_STATS.coverage).map(([key, value]) => {
              const labels: Record<string, string> = {
                industry: "行业覆盖",
                lifecycle: "生命周期覆盖",
                security: "安全措施覆盖",
                action: "动作义务覆盖",
              };
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-700">{labels[key]}</span>
                    <span className="text-sm text-blue-600 font-medium">{value}%</span>
                  </div>
                  <Progress value={value} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" />
              五维标签分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(Object.keys(TAG_DOMAIN_INFO) as TagDomain[]).map((domain) => {
                const info = TAG_DOMAIN_INFO[domain];
                const count = MOCK_STATS.byDomain[domain];
                const total = Object.values(MOCK_STATS.byDomain).reduce(
                  (a, b) => a + b,
                  0
                );
                const percentage = Math.round((count / total) * 100);

                return (
                  <div key={domain} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: info.color }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700">
                          {info.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div
                        className="h-2 rounded-full mt-1 bg-slate-100"
                        style={{ width: "100%" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: info.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 行业分布和地区分布 */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-500" />
              行业分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(MOCK_STATS.byIndustry).map(
                ([industry, count]) => (
                  <div
                    key={industry}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <span className="text-sm text-slate-700">{industry}</span>
                    <Badge
                      variant="outline"
                      className="bg-white text-slate-700 border-slate-200"
                    >
                      {count}
                    </Badge>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" />
              地区分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(MOCK_STATS.byRegion).map(([region, count]) => {
                const total = Object.values(MOCK_STATS.byRegion).reduce(
                  (a, b) => a + b,
                  0
                );
                const percentage = Math.round((count / total) * 100);

                return (
                  <div key={region}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-700">{region}</span>
                      <span className="text-sm text-blue-600 font-medium">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 最近更新 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" />
            最近更新
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-32">
            {MOCK_STATS.recentUpdates.map((update, idx) => {
              const maxCount = Math.max(
                ...MOCK_STATS.recentUpdates.map((u) => u.count)
              );
              const height = (update.count / maxCount) * 100;

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-md transition-all hover:opacity-80 relative group"
                    style={{ height: `${height}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {update.type}: {update.count}
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">
                    {update.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // 渲染网络视图
  const renderNetwork = () => (
    <Card className="h-[600px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Network className="w-4 h-4 text-blue-500" />
          关联图谱
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full flex items-center justify-center">
        <div className="text-center text-slate-400">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center mx-auto mb-4">
            <Network className="w-10 h-10 text-blue-400" />
          </div>
          <p className="text-slate-600 font-medium">关联图谱功能开发中... ⏳</p>
          <p className="text-sm mt-2 text-slate-400">
            将展示 政策 → 条款 → COU → 场景 → 标签 的关联关系
          </p>
        </div>
      </CardContent>
    </Card>
  );

  // 渲染热力图视图
  const renderHeatmap = () => (
    <Card className="h-[600px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Cpu className="w-4 h-4 text-blue-500" />
          覆盖密度热力图
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full flex items-center justify-center">
        <div className="text-center text-slate-400">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center mx-auto mb-4">
            <Cpu className="w-10 h-10 text-orange-400" />
          </div>
          <p className="text-slate-600 font-medium">热力图功能开发中... ⏳</p>
          <p className="text-sm mt-2 text-slate-400">
            将展示 行业 × 场景 × 标签维度 的覆盖密度矩阵
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="size-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-slate-800">
              知识图谱看板
            </h1>
          </div>
        </div>

        <Tabs
          value={activeView}
          onValueChange={(v) => setActiveView(v as typeof activeView)}
        >
          <TabsList className="bg-white/80 border border-slate-200">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white"
            >
              概览
            </TabsTrigger>
            <TabsTrigger
              value="network"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white"
            >
              关联图谱
            </TabsTrigger>
            <TabsTrigger
              value="heatmap"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white"
            >
              热力图
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 p-6 overflow-auto">
        {activeView === "overview" && renderOverview()}
        {activeView === "network" && renderNetwork()}
        {activeView === "heatmap" && renderHeatmap()}
      </div>
    </div>
  );
}

export default KnowledgeGraphDashboard;
