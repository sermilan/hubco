// ============ 控制目标详情页 ============
// 展示单个控制目标的完整信息
// 包括五维标签、标准动作、法规映射、版本历史

import React, { useState } from "react";
import {
  ArrowLeft,
  Target,
  Edit3,
  Link2,
  Layers,
  Scale,
  Sparkles,
  Search,
  Shield,
  FileText,
  History,
  Tag,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronRight,
  Plus,
  Trash2,
  Save,
  ExternalLink,
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { toast } from "sonner";
import type {
  ControlObjective,
  ControlCategory,
  ActionRequirement,
  ClauseMapping,
} from "../../types";

// 控制类别配置
const CATEGORY_CONFIG: Record<
  ControlCategory,
  { color: string; bg: string; border: string; icon: React.ReactNode; description: string }
> = {
  "预防性": {
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    icon: <Sparkles className="w-4 h-4" />,
    description: "防止事件发生的控制",
  },
  "检测性": {
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: <Search className="w-4 h-4" />,
    description: "发现已发生事件的控制",
  },
  "纠正性": {
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    icon: <Target className="w-4 h-4" />,
    description: "修复已造成损害的控制",
  },
  "管理性": {
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
    icon: <Layers className="w-4 h-4" />,
    description: "政策、流程、培训",
  },
  "技术性": {
    color: "text-cyan-700",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    icon: <Scale className="w-4 h-4" />,
    description: "加密、访问控制、审计日志",
  },
  "物理性": {
    color: "text-gray-700",
    bg: "bg-gray-50",
    border: "border-gray-200",
    icon: <Shield className="w-4 h-4" />,
    description: "门禁、监控、环境安全",
  },
};

// 重要性配置
const IMPORTANCE_CONFIG: Record<string, { color: string; bg: string; label: string; desc: string }> = {
  critical: { color: "text-red-700", bg: "bg-red-100", label: "核心", desc: "必须实施的关键控制" },
  high: { color: "text-orange-700", bg: "bg-orange-100", label: "高", desc: "强烈建议实施" },
  medium: { color: "text-yellow-700", bg: "bg-yellow-100", label: "中", desc: "根据实际情况实施" },
  low: { color: "text-slate-700", bg: "bg-slate-100", label: "低", desc: "可选实施" },
};

// 优先级配置
const PRIORITY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  critical: { color: "text-red-700", bg: "bg-red-100", label: "关键" },
  high: { color: "text-orange-700", bg: "bg-orange-100", label: "高" },
  medium: { color: "text-blue-700", bg: "bg-blue-100", label: "中" },
  low: { color: "text-slate-700", bg: "bg-slate-100", label: "低" },
};

interface ControlObjectiveDetailProps {
  controlObjective: ControlObjective;
  onBack: () => void;
  onEdit: (co: ControlObjective) => void;
  onDelete?: (id: string) => void;
  onNavigateToClause?: (clauseId: string) => void;
  onNavigateToPolicy?: (policyId: string) => void;
}

export function ControlObjectiveDetail({
  controlObjective: co,
  onBack,
  onEdit,
  onDelete,
  onNavigateToClause,
  onNavigateToPolicy,
}: ControlObjectiveDetailProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const categoryConfig = CATEGORY_CONFIG[co.category];
  const importanceConfig = IMPORTANCE_CONFIG[co.importance];

  // 删除确认
  const handleDelete = () => {
    if (window.confirm("确定要删除此控制目标吗？此操作不可恢复。")) {
      onDelete?.(co.id);
      toast.success("控制目标已删除");
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            返回列表
          </Button>
          <div className="h-6 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${categoryConfig.bg} ${categoryConfig.color}`}>
              {categoryConfig.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-slate-500">{co.code}</span>
                <Badge className={`text-xs ${importanceConfig.bg} ${importanceConfig.color} border-0`}>
                  {importanceConfig.label}
                </Badge>
                {co.status === "deprecated" && (
                  <Badge variant="outline" className="text-xs text-gray-500">已废弃</Badge>
                )}
              </div>
              <h1 className="text-lg font-semibold text-slate-800">{co.name}</h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(co)} className="gap-2">
            <Edit3 className="w-4 h-4" />
            编辑
          </Button>
          {onDelete && (
            <Button variant="outline" size="sm" onClick={handleDelete} className="gap-2 text-red-600 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
              删除
            </Button>
          )}
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="px-6 py-2 bg-white/60 border-b border-slate-200/50">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-100">
            <TabsTrigger value="overview" className="gap-2">
              <Target className="w-4 h-4" />
              概览
            </TabsTrigger>
            <TabsTrigger value="actions" className="gap-2">
              <CheckCircle className="w-4 h-4" />
              标准动作 ({co.standardActions.length})
            </TabsTrigger>
            <TabsTrigger value="mappings" className="gap-2">
              <Link2 className="w-4 h-4" />
              法规映射 ({co.mappedClauseCount})
            </TabsTrigger>
            <TabsTrigger value="tags" className="gap-2">
              <Tag className="w-4 h-4" />
              五维标签
            </TabsTrigger>
            <TabsTrigger value="versions" className="gap-2">
              <History className="w-4 h-4" />
              版本历史
            </TabsTrigger>
          </TabsList>

          {/* 概览标签页 */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {/* 基本信息卡片 */}
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    基本信息
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-500">控制目标名称</label>
                    <p className="text-base font-medium text-slate-800">{co.name}</p>
                    {co.nameEn && <p className="text-sm text-slate-500">{co.nameEn}</p>}
                  </div>
                  <div>
                    <label className="text-sm text-slate-500">详细描述</label>
                    <p className="text-sm text-slate-700 leading-relaxed">{co.description}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-slate-500">控制类别</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`${categoryConfig.bg} ${categoryConfig.color} ${categoryConfig.border}`}>
                          {co.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{categoryConfig.description}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500">控制域</label>
                      <p className="text-sm font-medium text-slate-700 mt-1">{co.domain}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500">重要性级别</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`${importanceConfig.bg} ${importanceConfig.color}`}>
                          {importanceConfig.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{importanceConfig.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 统计信息卡片 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Scale className="w-4 h-4 text-purple-500" />
                    统计信息
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600">{co.baseWeight}</div>
                      <div className="text-xs text-blue-700">基础权重</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-600">{co.mappedClauseCount}</div>
                      <div className="text-xs text-green-700">映射法规</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-purple-600">{co.scenarioCount}</div>
                      <div className="text-xs text-purple-700">覆盖场景</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-orange-600">{co.standardActions.length}</div>
                      <div className="text-xs text-orange-700">标准动作</div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">当前版本</span>
                      <Badge variant="outline">v{co.version}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-slate-500">状态</span>
                      <Badge className={co.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                        {co.status === "active" ? "生效中" : "已废弃"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-slate-500">更新时间</span>
                      <span className="text-slate-700">{new Date(co.updatedAt).toLocaleDateString("zh-CN")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 相关标准 */}
            {co.standards && co.standards.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Scale className="w-4 h-4 text-indigo-500" />
                    相关标准与最佳实践
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {co.standards.map((standard) => (
                      <Badge key={standard} variant="outline" className="text-xs">
                        {standard}
                      </Badge>
                    ))}
                  </div>
                  {co.bestPractices && co.bestPractices.length > 0 && (
                    <div className="mt-4">
                      <label className="text-sm text-slate-500">最佳实践参考</label>
                      <ul className="mt-2 space-y-1">
                        {co.bestPractices.map((practice, idx) => (
                          <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                            {practice}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 标准动作标签页 */}
          <TabsContent value="actions" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  标准动作要求
                </CardTitle>
                <Button size="sm" variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  添加动作
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {co.standardActions.map((action, idx) => (
                    <ActionCard key={action.actionCode} action={action} index={idx} />
                  ))}
                  {co.standardActions.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>暂无标准动作要求</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 法规映射标签页 */}
          <TabsContent value="mappings" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-blue-500" />
                  法规条款映射
                </CardTitle>
                <Button size="sm" variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  添加映射
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {co.mappedClauses.map((mapping) => (
                    <MappingCard
                      key={mapping.clauseId}
                      mapping={mapping}
                      onNavigateToClause={onNavigateToClause}
                      onNavigateToPolicy={onNavigateToPolicy}
                    />
                  ))}
                  {co.mappedClauses.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <Link2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>暂无法规映射</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 五维标签标签页 */}
          <TabsContent value="tags" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Tag className="w-4 h-4 text-purple-500" />
                  五维标签系统
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <TagDimensionCard
                    title="客体维度"
                    subtitle="保护对象"
                    icon={<Shield className="w-4 h-4" />}
                    color="blue"
                    tags={co.applicableTags.objects}
                    prefix="OBJ"
                  />
                  <TagDimensionCard
                    title="主体维度"
                    subtitle="责任主体"
                    icon={<Layers className="w-4 h-4" />}
                    color="green"
                    tags={co.applicableTags.subjects}
                    prefix="SUB"
                  />
                  <TagDimensionCard
                    title="业务流转维度"
                    subtitle="业务环节"
                    icon={<Clock className="w-4 h-4" />}
                    color="orange"
                    tags={co.applicableTags.lifecycles}
                    prefix="LIF"
                  />
                  <TagDimensionCard
                    title="安全域维度"
                    subtitle="保护手段"
                    icon={<Scale className="w-4 h-4" />}
                    color="purple"
                    tags={co.applicableTags.securities}
                    prefix="SEC"
                  />
                  <TagDimensionCard
                    title="动作义务维度"
                    subtitle="COU核心"
                    icon={<CheckCircle className="w-4 h-4" />}
                    color="red"
                    tags={co.applicableTags.actions}
                    prefix="ACT"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 版本历史标签页 */}
          <TabsContent value="versions" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-500" />
                  版本历史
                </CardTitle>
              </CardHeader>
              <CardContent>
                {co.versionHistory && co.versionHistory.length > 0 ? (
                  <div className="space-y-4">
                    {co.versionHistory.map((version) => (
                      <div
                        key={version.versionId}
                        className="flex items-start gap-4 p-4 rounded-lg border border-slate-200"
                      >
                        <div className="flex-shrink-0">
                          <Badge variant={version.status === "current" ? "default" : "outline"}>
                            v{version.versionNumber}
                          </Badge>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{version.changeLog || "版本更新"}</span>
                            <Badge variant="outline" className="text-xs">
                              {version.impact === "breaking" ? "破坏性变更" : version.impact === "compatible" ? "兼容变更" : "外观变更"}
                            </Badge>
                          </div>
                          <div className="text-sm text-slate-500">
                            生效日期: {new Date(version.effectiveDate).toLocaleDateString("zh-CN")}
                            {version.status === "deprecated" && version.supersededBy && (
                              <span className="ml-2">已被 {version.supersededBy} 替代</span>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Badge className={
                            version.status === "current" ? "bg-green-100 text-green-700" :
                            version.status === "revised" ? "bg-yellow-100 text-yellow-700" :
                            "bg-gray-100 text-gray-700"
                          }>
                            {version.status === "current" ? "当前版本" : version.status === "revised" ? "已修订" : "已废弃"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>暂无版本历史记录</p>
                    <p className="text-sm mt-1">当前版本: v{co.version}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// 动作卡片组件
function ActionCard({ action, index }: { action: ActionRequirement; index: number }) {
  const priorityConfig = PRIORITY_CONFIG[action.priority];

  return (
    <div className="p-4 rounded-lg border border-slate-200 bg-white">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="font-mono text-xs">
              {action.actionCode}
            </Badge>
            <Badge className={`text-xs ${priorityConfig.bg} ${priorityConfig.color}`}>
              {priorityConfig.label}优先级
            </Badge>
            {action.isBlocking && (
              <Badge className="bg-red-100 text-red-700 text-xs">阻断性</Badge>
            )}
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {action.deadline}
            </span>
          </div>
          <p className="text-sm font-medium text-slate-800 mb-2">{action.description}</p>

          {/* 检查点 */}
          {action.checkPoints.length > 0 && (
            <div className="mt-3">
              <label className="text-xs text-slate-500">检查点:</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {action.checkPoints.map((point, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {point}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 交付物 */}
          {action.deliverables && action.deliverables.length > 0 && (
            <div className="mt-2">
              <label className="text-xs text-slate-500">交付物:</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {action.deliverables.map((item, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs bg-blue-50">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 映射卡片组件
function MappingCard({
  mapping,
  onNavigateToClause,
  onNavigateToPolicy,
}: {
  mapping: ClauseMapping;
  onNavigateToClause?: (id: string) => void;
  onNavigateToPolicy?: (id: string) => void;
}) {
  const statusConfig = {
    auto: { color: "bg-blue-100 text-blue-700", label: "自动映射" },
    confirmed: { color: "bg-green-100 text-green-700", label: "已确认" },
    rejected: { color: "bg-red-100 text-red-700", label: "已拒绝" },
    pending_review: { color: "bg-yellow-100 text-yellow-700", label: "待复核" },
  }[mapping.status];

  return (
    <div className="p-4 rounded-lg border border-slate-200 bg-white hover:border-blue-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={`text-xs ${statusConfig.color}`}>{statusConfig.label}</Badge>
            <span className="text-xs text-slate-400">
              置信度: {Math.round(mapping.mappingConfidence * 100)}%
            </span>
            <span className="text-xs text-slate-400">
              映射时间: {new Date(mapping.mappedAt).toLocaleDateString("zh-CN")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => onNavigateToPolicy?.(mapping.policyId)}
              className="text-blue-600 hover:underline"
            >
              {mapping.policyTitle}
            </button>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <button
              onClick={() => onNavigateToClause?.(mapping.clauseId)}
              className="text-blue-600 hover:underline"
            >
              {mapping.clauseNumber}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">{mapping.mappingReason}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// 标签维度卡片组件
function TagDimensionCard({
  title,
  subtitle,
  icon,
  color,
  tags,
  prefix,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  tags: string[];
  prefix: string;
}) {
  const colorClasses: Record<string, { bg: string; text: string; border: string; lightBg: string }> = {
    blue: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", lightBg: "bg-blue-50" },
    green: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", lightBg: "bg-green-50" },
    orange: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200", lightBg: "bg-orange-50" },
    purple: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200", lightBg: "bg-purple-50" },
    red: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200", lightBg: "bg-red-50" },
  };

  const colors = colorClasses[color];

  return (
    <div className={`p-4 rounded-lg border ${colors.border} ${colors.lightBg}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-1.5 rounded ${colors.bg} ${colors.text}`}>
          {icon}
        </div>
        <div>
          <h4 className="font-medium text-slate-800">{title}</h4>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {tags.length > 0 ? (
          tags.map((tag) => (
            <Badge key={tag} variant="outline" className={`text-xs ${colors.bg} ${colors.text} ${colors.border}`}>
              {tag}
            </Badge>
          ))
        ) : (
          <span className="text-xs text-slate-400">未配置标签</span>
        )}
      </div>
    </div>
  );
}

export default ControlObjectiveDetail;
