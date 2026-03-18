import { CustomScene, COU } from "../types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Clock,
  FileText,
  Download,
  Lightbulb,
} from "lucide-react";
import { MOCK_COUS } from "../data/mockData";

interface SceneAnalysisProps {
  scene: CustomScene;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COLORS = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#3b82f6",
};

export function SceneAnalysis({
  scene,
  open,
  onOpenChange,
}: SceneAnalysisProps) {
  // 分析COU数据
  const sceneCOUs = scene.cous || [];

  const priorityData = [
    {
      name: "关键",
      value: sceneCOUs.filter((c) => c.finalWeight >= 9).length,
      color: COLORS.critical,
    },
    {
      name: "高",
      value: sceneCOUs.filter((c) => c.finalWeight >= 7 && c.finalWeight < 9)
        .length,
      color: COLORS.high,
    },
    {
      name: "中",
      value: sceneCOUs.filter((c) => c.finalWeight >= 4 && c.finalWeight < 7)
        .length,
      color: COLORS.medium,
    },
    {
      name: "低",
      value: sceneCOUs.filter((c) => c.finalWeight < 4).length,
      color: COLORS.low,
    },
  ].filter((d) => d.value > 0);

  // 按合规类型统计
  const typeCount: Record<string, number> = {};
  sceneCOUs.forEach((cou) => {
    typeCount[cou.obligationType] = (typeCount[cou.obligationType] || 0) + 1;
  });
  const typeData = Object.entries(typeCount).map(([name, value]) => ({
    name,
    value,
  }));

  // 按政策来源统计
  const policyCount: Record<string, number> = {};
  sceneCOUs.forEach((cou) => {
    policyCount[cou.policyTitle] = (policyCount[cou.policyTitle] || 0) + 1;
  });
  const policyData = Object.entries(policyCount)
    .map(([name, value]) => ({ name: name.slice(0, 10) + "...", value }))
    .slice(0, 8);

  // 计算统计数据
  const totalWeight = sceneCOUs.reduce((sum, c) => sum + c.finalWeight, 0);
  const avgWeight =
    sceneCOUs.length > 0 ? (totalWeight / sceneCOUs.length).toFixed(1) : "0";
  const criticalCount = sceneCOUs.filter((c) => c.finalWeight >= 9).length;
  const highCount = sceneCOUs.filter(
    (c) => c.finalWeight >= 7 && c.finalWeight < 9
  ).length;

  // 风险评级
  const getRiskLevel = () => {
    const criticalRatio = sceneCOUs.length > 0 ? criticalCount / sceneCOUs.length : 0;
    if (criticalRatio > 0.3) return { level: "极高", color: "text-red-600", bg: "bg-red-50" };
    if (criticalRatio > 0.2) return { level: "高", color: "text-orange-600", bg: "bg-orange-50" };
    if (criticalRatio > 0.1) return { level: "中", color: "text-yellow-600", bg: "bg-yellow-50" };
    return { level: "低", color: "text-green-600", bg: "bg-green-50" };
  };

  const risk = getRiskLevel();

  // 生成实施路线图建议
  const generateRoadmap = () => {
    const phases = [
      {
        phase: "第一阶段：基础合规",
        duration: "1-2个月",
        cous: sceneCOUs
          .filter((c) => c.finalWeight >= 9)
          .slice(0, 3)
          .map((c) => c.code),
        description: "优先处理关键合规义务",
      },
      {
        phase: "第二阶段：重点完善",
        duration: "2-3个月",
        cous: sceneCOUs
          .filter((c) => c.finalWeight >= 7 && c.finalWeight < 9)
          .slice(0, 4)
          .map((c) => c.code),
        description: "完善高优先级合规要求",
      },
      {
        phase: "第三阶段：全面优化",
        duration: "3-6个月",
        cous: sceneCOUs
          .filter((c) => c.finalWeight < 7)
          .slice(0, 5)
          .map((c) => c.code),
        description: "完成中低优先级合规义务",
      },
    ];
    return phases;
  };

  const roadmap = generateRoadmap();

  // 合规建议
  const recommendations = [
    "建议优先实施关键优先级（权重9-10）的合规义务，确保核心合规要求得到满足",
    `当前场景包含${criticalCount}个关键COU，建议成立专项工作组重点推进`,
    "建议定期进行合规自评估，持续跟踪合规状态",
    "建议建立合规培训机制，提升员工数据安全意识",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Target className="size-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl">{scene.name}</DialogTitle>
              <p className="text-sm text-gray-500">场景合规分析报告</p>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="charts">统计分析</TabsTrigger>
            <TabsTrigger value="roadmap">实施路线图</TabsTrigger>
            <TabsTrigger value="recommendations">合规建议</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            {/* 概览 */}
            <TabsContent value="overview" className="space-y-6">
              {/* 关键指标 */}
              <div className="grid grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="size-4 text-blue-500" />
                    <span className="text-sm text-gray-500">总COU数</span>
                  </div>
                  <div className="text-3xl font-bold">{scene.totalCOUs}</div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="size-4 text-orange-500" />
                    <span className="text-sm text-gray-500">平均权重</span>
                  </div>
                  <div className="text-3xl font-bold">{avgWeight}</div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="size-4 text-green-500" />
                    <span className="text-sm text-gray-500">合规评分</span>
                  </div>
                  <div className="text-3xl font-bold text-green-600">
                    {scene.complianceScore}
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="size-4 text-red-500" />
                    <span className="text-sm text-gray-500">风险等级</span>
                  </div>
                  <div className={`text-2xl font-bold ${risk.color}`}>
                    {risk.level}
                  </div>
                </Card>
              </div>

              {/* 优先级分布 */}
              <Card className="p-6">
                <h4 className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
                  <Target className="size-4" />
                  COU优先级分布
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-20 text-sm text-gray-500">关键</div>
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500"
                        style={{
                          width: `${
                            sceneCOUs.length > 0
                              ? (criticalCount / sceneCOUs.length) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <div className="w-12 text-right font-medium">
                      {criticalCount}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-20 text-sm text-gray-500">高</div>
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500"
                        style={{
                          width: `${
                            sceneCOUs.length > 0
                              ? (highCount / sceneCOUs.length) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <div className="w-12 text-right font-medium">{highCount}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-20 text-sm text-gray-500">中</div>
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-500"
                        style={{
                          width: `${
                            sceneCOUs.length > 0
                              ? ((sceneCOUs.filter((c) => c.finalWeight >= 4 && c.finalWeight < 7).length /
                                  sceneCOUs.length) *
                                100)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <div className="w-12 text-right font-medium">
                      {sceneCOUs.filter((c) => c.finalWeight >= 4 && c.finalWeight < 7).length}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-20 text-sm text-gray-500">低</div>
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{
                          width: `${
                            sceneCOUs.length > 0
                              ? ((sceneCOUs.filter((c) => c.finalWeight < 4).length /
                                  sceneCOUs.length) *
                                100)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <div className="w-12 text-right font-medium">
                      {sceneCOUs.filter((c) => c.finalWeight < 4).length}
                    </div>
                  </div>
                </div>
              </Card>

              {/* 场景信息 */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    适用行业
                  </h4>
                  <Badge variant="outline">{scene.industry}</Badge>
                </Card>
                <Card className="p-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    适用区域
                  </h4>
                  <Badge variant="outline">{scene.region}</Badge>
                </Card>
                <Card className="p-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    用户类型
                  </h4>
                  <Badge variant="outline">{scene.userType}</Badge>
                </Card>
              </div>
            </TabsContent>

            {/* 统计分析 */}
            <TabsContent value="charts" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* 权重分布饼图 */}
                <Card className="p-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-4">
                    权重分布
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={priorityData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {priorityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* 合规类型分布 */}
                <Card className="p-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-4">
                    合规类型分布
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={typeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              {/* 政策来源分布 */}
              <Card className="p-4">
                <h4 className="text-sm font-medium text-gray-500 mb-4">
                  COU来源政策分布
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={policyData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={120} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </TabsContent>

            {/* 实施路线图 */}
            <TabsContent value="roadmap" className="space-y-6">
              {roadmap.map((phase, idx) => (
                <Card key={idx} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-medium">{phase.phase}</h4>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {phase.duration}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4">{phase.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {phase.cous.map((couCode) => (
                          <Badge key={couCode} variant="secondary">
                            {couCode}
                          </Badge>
                        ))}
                        {phase.cous.length === 0 && (
                          <span className="text-sm text-gray-400">
                            该阶段暂无COU
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            {/* 合规建议 */}
            <TabsContent value="recommendations" className="space-y-6">
              <Card className={`p-6 ${risk.bg}`}>
                <div className="flex items-start gap-4">
                  <AlertTriangle className={`size-6 ${risk.color} flex-shrink-0`} />
                  <div>
                    <h4 className={`text-lg font-medium mb-2 ${risk.color}`}>
                      风险评级：{risk.level}
                    </h4>
                    <p className="text-gray-600">
                      基于场景COU的权重分布和数量，该场景的风险等级为{risk.level}。
                      {risk.level === "极高" && "建议立即采取行动，优先处理关键合规义务。"}
                      {risk.level === "高" && "建议加强合规管理，重点关注关键和高优先级COU。"}
                      {risk.level === "中" && "建议按计划推进合规工作，确保按期完成。"}
                      {risk.level === "低" && "当前合规风险较低，建议持续监控并完善。"}
                    </p>
                  </div>
                </div>
              </Card>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Lightbulb className="size-4" />
                  合规建议
                </h4>
                {recommendations.map((rec, idx) => (
                  <Card key={idx} className="p-4 flex items-start gap-3">
                    <CheckCircle2 className="size-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">{rec}</p>
                  </Card>
                ))}
              </div>

              {/* 标签分布 */}
              {scene.tagDistribution &&
                Object.keys(scene.tagDistribution).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                      <Target className="size-4" />
                      标签分布
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(scene.tagDistribution)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 10)
                        .map(([tag, count]) => (
                          <Badge key={tag} variant="outline" className="text-sm">
                            {tag}: {count}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
          <Button variant="outline">
            <Download className="size-4 mr-2" />
            导出报告
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
