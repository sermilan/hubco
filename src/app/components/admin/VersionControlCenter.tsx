// ============ 版本管理中心 ============
// COU双轨版本管理：基准条目 vs 引用关联

import React, { useState, useMemo } from "react";
import {
  GitBranch,
  History,
  ArrowLeftRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  RotateCcw,
  Eye,
  Download,
  Bell,
  Users,
  GitCommit,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { Switch } from "../ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog";
import { MOCK_COUS } from "../../data/mockData";
import type { COU } from "../../types";

// 模拟版本历史
const MOCK_VERSIONS: Record<string, COU["versionHistory"]> =
  MOCK_COUS.reduce((acc, cou) => {
    acc[cou.id] = [
      {
        versionId: `${cou.id}-v1.0`,
        versionNumber: "1.0",
        status: "superseded",
        effectiveDate: "2025-01-01",
        changeLog: "初始版本",
        impact: "compatible",
        supersededBy: `${cou.id}-v1.1`,
      },
      {
        versionId: `${cou.id}-v1.1`,
        versionNumber: "1.1",
        status: "current",
        effectiveDate: "2025-06-01",
        changeLog: "更新了罚则描述，增加了动作义务定义",
        impact: "compatible",
        supersededBy: cou.version,
      },
      {
        versionId: cou.version,
        versionNumber: cou.version,
        status: cou.status,
        effectiveDate: cou.updatedAt,
        changeLog: "根据最新法规要求更新",
        impact: "breaking",
      },
    ];
    return acc;
  }, {} as Record<string, COU["versionHistory"]>);

// 模拟场景引用
const MOCK_SCENE_REFERENCES = [
  { sceneId: "scene-1", sceneName: "游戏出海合规包", versionId: "v1.0", autoUpgrade: true },
  { sceneId: "scene-2", sceneName: "金融等保合规包", versionId: "v1.1", autoUpgrade: false },
  { sceneId: "scene-3", sceneName: "电商数据合规", versionId: "v1.1", autoUpgrade: true },
];

// 影响级别配置
const IMPACT_CONFIG: Record<string, { label: string; color: string; bgColor: string; description: string }> = {
  breaking: { label: "破坏性", color: "#EF4444", bgColor: "bg-red-100", description: "需要重新评估合规方案" },
  compatible: { label: "兼容", color: "#22C55E", bgColor: "bg-green-100", description: "可平滑升级" },
  cosmetic: { label: "外观", color: "#6B7280", bgColor: "bg-gray-100", description: "仅文字或格式变更" },
};

export function VersionControlCenter() {
  const [selectedCOUId, setSelectedCOUId] = useState<string | null>(null);
  const [compareVersionId, setCompareVersionId] = useState<string | null>(null);
  const [showDiff, setShowDiff] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("versions");
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  const selectedCOU = useMemo(
    () => MOCK_COUS.find((c) => c.id === selectedCOUId),
    [selectedCOUId]
  );

  const versions = useMemo(() => {
    if (!selectedCOUId) return [];
    return MOCK_VERSIONS[selectedCOUId] || [];
  }, [selectedCOUId]);

  const filteredCOUs = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_COUS;
    const query = searchQuery.toLowerCase();
    return MOCK_COUS.filter(
      (c) =>
        c.code.toLowerCase().includes(query) ||
        c.title.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // 渲染COU列表
  const renderCOUList = () => (
    <div className="space-y-2">
      {filteredCOUs.map((cou) => (
        <div
          key={cou.id}
          className={`p-3 rounded-lg border cursor-pointer transition-all ${
            selectedCOUId === cou.id
              ? "bg-blue-50 border-blue-300 shadow-sm"
              : "bg-white border-slate-200 hover:border-blue-200 hover:shadow-sm"
          }`}
          onClick={() => setSelectedCOUId(cou.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-800">
                {cou.code}
              </span>
              <Badge
                variant="outline"
                className={`text-xs ${
                  cou.status === "current"
                    ? "bg-green-100 text-green-700 border-green-200"
                    : cou.status === "revised"
                    ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                    : "bg-red-100 text-red-700 border-red-200"
                }`}
              >
                {cou.status === "current"
                  ? "现行"
                  : cou.status === "revised"
                  ? "修订中"
                  : "已废止"}
              </Badge>
            </div>
            <span className="text-xs text-slate-400">v{cou.version}</span>
          </div>
          <div className="mt-1 text-sm text-slate-600 truncate">
            {cou.title}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <span>{cou.policyTitle}</span>
            <span>•</span>
            <span>权重 {cou.finalWeight}</span>
          </div>
        </div>
      ))}
    </div>
  );

  // 渲染版本历史
  const renderVersions = () => {
    if (!selectedCOU) {
      return (
        <div className="h-full flex items-center justify-center text-slate-400">
          <div className="text-center">
            <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>选择一个COU查看版本历史</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              {selectedCOU.code}
            </h3>
            <p className="text-sm text-slate-500">{selectedCOU.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDiff(true)}
              disabled={!compareVersionId}
            >
              <ArrowLeftRight className="w-4 h-4 mr-2" />
              对比版本
            </Button>
          </div>
        </div>

        <div className="relative">
          {/* 时间线 */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />

          <div className="space-y-4">
            {versions.map((version, index) => {
              const impact = IMPACT_CONFIG[version.impact];
              const isCurrent = version.status === "current";

              return (
                <div key={version.versionId} className="relative pl-10">
                  {/* 时间点 */}
                  <div
                    className={`absolute left-2 top-1 w-5 h-5 rounded-full border-2 ${
                      isCurrent
                        ? "bg-blue-500 border-blue-500"
                        : "bg-white border-slate-300"
                    }`}
                  />

                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      compareVersionId === version.versionId
                        ? "border-blue-300 shadow-md"
                        : "border-slate-200"
                    }`}
                    onClick={() =>
                      setCompareVersionId(
                        compareVersionId === version.versionId
                          ? null
                          : version.versionId
                      )
                    }
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-semibold text-slate-800">
                            v{version.versionNumber}
                          </span>
                          {isCurrent && (
                            <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                              当前版本
                            </Badge>
                          )}
                          {version.status === "superseded" && (
                            <Badge
                              variant="outline"
                              className="text-slate-500 border-slate-300"
                            >
                              已替代
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={impact.bgColor}
                            style={{
                              color: impact.color,
                              borderColor: impact.color + "40",
                            }}
                            variant="outline"
                          >
                            {impact.label}
                          </Badge>
                          {compareVersionId === version.versionId && (
                            <Badge className="bg-blue-500 text-white">
                              已选择
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 text-sm text-slate-600">
                        {version.changeLog}
                      </div>

                      <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                        <span>生效日期: {version.effectiveDate}</span>
                        {version.supersededBy && (
                          <span className="text-blue-600">
                            被 v{version.supersededBy} 替代
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // 渲染影响分析
  const renderImpact = () => {
    if (!selectedCOU) {
      return (
        <div className="h-full flex items-center justify-center text-slate-400">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>选择一个COU查看影响分析</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-slate-800">
                {MOCK_SCENE_REFERENCES.length}
              </div>
              <div className="text-sm text-slate-500 mt-1">引用场景</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-amber-600">
                {MOCK_SCENE_REFERENCES.filter((s) => !s.autoUpgrade).length}
              </div>
              <div className="text-sm text-slate-500 mt-1">需人工确认</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-600">
                {MOCK_SCENE_REFERENCES.filter((s) => s.autoUpgrade).length}
              </div>
              <div className="text-sm text-slate-500 mt-1">可自动升级</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              引用场景列表
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MOCK_SCENE_REFERENCES.map((ref) => (
                <div
                  key={ref.sceneId}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div>
                    <div className="text-sm font-medium text-slate-800">
                      {ref.sceneName}
                    </div>
                    <div className="text-xs text-slate-500">
                      当前版本: {ref.versionId}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        ref.autoUpgrade
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-yellow-100 text-yellow-700 border-yellow-200"
                      }`}
                    >
                      {ref.autoUpgrade ? "自动升级" : "需确认"}
                    </Badge>
                    <Switch
                      checked={ref.autoUpgrade}
                      onCheckedChange={() => {}}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600"
                onClick={() => setShowUpgradeDialog(true)}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                一键升级所有场景
              </Button>
              <Button
                variant="outline"
              >
                <Bell className="w-4 h-4 mr-2" />
                通知用户
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // 渲染版本对比对话框
  const renderDiffDialog = () => {
    if (!showDiff || !selectedCOU || !compareVersionId) return null;

    const compareVersion = versions.find((v) => v.versionId === compareVersionId);
    if (!compareVersion) return null;

    return (
      <Dialog open={showDiff} onOpenChange={setShowDiff}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">版本对比</DialogTitle>
            <DialogDescription className="text-slate-500">
              对比 {selectedCOU.code} 的不同版本
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <div className="text-sm text-slate-500">当前版本</div>
                <div className="text-lg font-semibold text-green-600">
                  v{selectedCOU.version}
                </div>
              </div>
              <ArrowLeftRight className="w-5 h-5 text-slate-400" />
              <div className="text-right">
                <div className="text-sm text-slate-500">对比版本</div>
                <div className="text-lg font-semibold text-blue-600">
                  v{compareVersion.versionNumber}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-slate-700">变更内容</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <div className="text-sm text-red-700 font-medium">删除</div>
                    <div className="text-sm text-slate-600 line-through">
                      旧的动作义务定义
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="text-sm text-green-700 font-medium">新增</div>
                    <div className="text-sm text-slate-700">
                      新的动作义务定义（包含检查点和期限）
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <div className="text-sm text-yellow-700 font-medium">修改</div>
                    <div className="text-sm text-slate-700">
                      权重从 {selectedCOU.finalWeight - 2} 调整为{" "}
                      {selectedCOU.finalWeight}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDiff(false)}
            >
              关闭
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600">
              <Download className="w-4 h-4 mr-2" />
              导出变更报告
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // 渲染升级确认对话框
  const renderUpgradeDialog = () => {
    if (!showUpgradeDialog) return null;

    return (
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              确认升级
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              此操作将影响所有引用该COU的场景
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="text-sm text-amber-800 font-medium mb-2">
                影响范围
              </div>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>• {MOCK_SCENE_REFERENCES.length} 个场景将更新</li>
                <li>
                  •{" "}
                  {MOCK_SCENE_REFERENCES.filter((s) => !s.autoUpgrade).length} 个场景需要人工确认
                </li>
                <li>• 所有用户将收到更新通知</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUpgradeDialog(false)}
            >
              取消
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600">
              <RefreshCw className="w-4 h-4 mr-2" />
              确认升级
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="size-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <GitBranch className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-slate-800">
              版本管理中心
            </h1>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧：COU列表 */}
        <div className="w-1/3 flex flex-col border-r border-slate-200/50 bg-white/40">
          <div className="p-4 border-b border-slate-200/50 bg-white/60">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索COU..."
            />
          </div>
          <ScrollArea className="flex-1 p-4">
            {renderCOUList()}
          </ScrollArea>
        </div>

        {/* 右侧：版本详情 */}
        <div className="flex-1 p-6 overflow-auto bg-white/20">
          {selectedCOU ? (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-white/80 border border-slate-200 mb-6">
                <TabsTrigger
                  value="versions"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white"
                >
                  <History className="w-4 h-4 mr-2" />
                  版本历史
                </TabsTrigger>
                <TabsTrigger
                  value="impact"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  影响分析
                </TabsTrigger>
              </TabsList>

              <TabsContent value="versions">{renderVersions()}</TabsContent>
              <TabsContent value="impact">{renderImpact()}</TabsContent>
            </Tabs>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
                  <GitCommit className="w-10 h-10 text-indigo-400" />
                </div>
                <p className="text-slate-600 font-medium">选择一个COU查看版本信息</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 对话框 */}
      {renderDiffDialog()}
      {renderUpgradeDialog()}
    </div>
  );
}

export default VersionControlCenter;
