// ============ COU详情页 ============
// 展示单个COU的完整信息
// 包括概览、义务描述、五维标签、法规映射、控制目标、动作要求、版本历史

import React, { useState } from "react";
import {
  ArrowLeft,
  Target,
  Edit3,
  Link2,
  Layers,
  Scale,
  CheckCircle,
  FileText,
  History,
  Tag,
  Shield,
  Clock,
  ChevronRight,
  Plus,
  Trash2,
  ExternalLink,
  Zap,
  Briefcase,
  AlertCircle,
  Building2,
  Globe,
  Users,
  Sparkles,
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { toast } from "sonner";
import type {
  COU,
  PolicyLevel,
  ActionRequirement,
  ControlObjective,
  Clause,
} from "../../types";
import { POLICY_LEVEL_WEIGHTS, PENALTY_WEIGHTS } from "../../types";
import { MOCK_CONTROL_OBJECTIVES, MOCK_CLAUSES, MOCK_POLICIES } from "../../data/mockData";

// 义务类型配置
const OBLIGATION_TYPE_CONFIG: Record<
  COU["obligationType"],
  { color: string; bg: string; border: string; label: string; desc: string }
> = {
  "禁止性": {
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    label: "禁止性",
    desc: "明令禁止的行为",
  },
  "强制性": {
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    label: "强制性",
    desc: "必须履行的义务",
  },
  "推荐性": {
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    label: "推荐性",
    desc: "建议实施的要求",
  },
  "指导性": {
    color: "text-gray-700",
    bg: "bg-gray-50",
    border: "border-gray-200",
    label: "指导性",
    desc: "参考性指引",
  },
};

// 状态配置 - 与COUBrowser保持一致
const STATUS_CONFIG: Record<
  string,
  { color: string; bg: string; text: string; label: string }
> = {
  active: {
    color: "bg-green-500",
    bg: "bg-green-50",
    text: "text-green-700",
    label: "当前生效",
  },
  pending: {
    color: "bg-yellow-500",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    label: "待审核",
  },
  deprecated: {
    color: "bg-gray-500",
    bg: "bg-gray-50",
    text: "text-gray-700",
    label: "已废弃",
  },
};

// 优先级配置
const PRIORITY_CONFIG: Record<
  ActionRequirement["priority"],
  { color: string; bg: string; label: string }
> = {
  critical: { color: "text-red-700", bg: "bg-red-100", label: "关键" },
  high: { color: "text-orange-700", bg: "bg-orange-100", label: "高" },
  medium: { color: "text-blue-700", bg: "bg-blue-100", label: "中" },
  low: { color: "text-slate-700", bg: "bg-slate-100", label: "低" },
};

interface COUDetailProps {
  cou: COU;
  onBack: () => void;
  onEdit: (cou: COU) => void;
  onDelete?: (id: string) => void;
  onNavigateToClause?: (clauseId: string) => void;
  onNavigateToPolicy?: (policyId: string) => void;
  onNavigateToControlObjective?: (coId: string) => void;
}

export function COUDetail({
  cou,
  onBack,
  onEdit,
  onDelete,
  onNavigateToClause,
  onNavigateToPolicy,
  onNavigateToControlObjective,
}: COUDetailProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const obligationConfig = OBLIGATION_TYPE_CONFIG[cou.obligationType || '强制性'] || OBLIGATION_TYPE_CONFIG['强制性'];
  const statusConfig = STATUS_CONFIG[cou.status || 'active'] || STATUS_CONFIG.active;

  // 获取关联的控制目标
  const controlObjective = cou.controlObjectiveId
    ? MOCK_CONTROL_OBJECTIVES.find((co) => co.id === cou.controlObjectiveId)
    : undefined;

  // 获取关联的条款
  const sourceClauses = MOCK_CLAUSES.filter((c) =>
    cou.sourceClauseIds?.includes(c.id)
  );

  // 删除确认
  const handleDelete = () => {
    if (window.confirm("确定要删除此COU吗？此操作不可恢复。")) {
      onDelete?.(cou.id);
      toast.success("COU已删除");
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
            <div
              className={`p-2 rounded-lg ${obligationConfig.bg} ${obligationConfig.color}`}
            >
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-slate-500">
                  {cou.code}
                </span>
                <Badge
                  className={`text-xs ${obligationConfig.bg} ${obligationConfig.color} ${obligationConfig.border}`}
                >
                  {obligationConfig.label}
                </Badge>
                {cou.status !== "active" && (
                  <Badge
                    className={`text-xs ${statusConfig.bg} ${statusConfig.text}`}
                  >
                    {statusConfig.label}
                  </Badge>
                )}
              </div>
              <h1 className="text-lg font-semibold text-slate-800 line-clamp-1">
                {cou.title}
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(cou)}
            className="gap-2"
          >
            <Edit3 className="w-4 h-4" />
            编辑
          </Button>
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="gap-2 text-red-600 hover:text-red-700"
            >
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
            <TabsTrigger value="obligation" className="gap-2">
              <FileText className="w-4 h-4" />
              义务描述
            </TabsTrigger>
            <TabsTrigger value="tags" className="gap-2">
              <Tag className="w-4 h-4" />
              五维标签
            </TabsTrigger>
            <TabsTrigger value="mappings" className="gap-2">
              <Link2 className="w-4 h-4" />
              法规映射 ({sourceClauses.length})
            </TabsTrigger>
            <TabsTrigger value="control-objective" className="gap-2">
              <Shield className="w-4 h-4" />
              控制目标
            </TabsTrigger>
            <TabsTrigger value="actions" className="gap-2">
              <CheckCircle className="w-4 h-4" />
              动作要求 ({cou.actionRequirements?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="versions" className="gap-2">
              <History className="w-4 h-4" />
              版本历史
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-200px)]">
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
                      <label className="text-sm text-slate-500">COU名称</label>
                      <p className="text-base font-medium text-slate-800">
                        {cou.title}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500">详细描述</label>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {cou.description}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-slate-500">义务类型</label>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            className={`${obligationConfig.bg} ${obligationConfig.color} ${obligationConfig.border}`}
                          >
                            {obligationConfig.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {obligationConfig.desc}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-slate-500">状态</label>
                        <div className="flex items-center gap-2 mt-1">
                          <div
                            className={`w-2 h-2 rounded-full ${statusConfig.color}`}
                          />
                          <Badge
                            className={`${statusConfig.bg} ${statusConfig.text}`}
                          >
                            {statusConfig.label}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-slate-500">版本</label>
                        <p className="text-sm font-medium text-slate-700 mt-1">
                          v{cou.version}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 统计信息卡片 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Scale className="w-4 h-4 text-purple-500" />
                      权重与统计
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 最终权重 */}
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-4 text-center text-white">
                      <div className="text-3xl font-bold">
                        {cou.finalWeight?.toFixed(1) || "0.0"}
                      </div>
                      <div className="text-xs text-white/80">最终权重</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-blue-600">
                          {cou.baseWeight}
                        </div>
                        <div className="text-xs text-blue-700">基础权重</div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-red-600">
                          {cou.penaltyWeight || 1}
                        </div>
                        <div className="text-xs text-red-700">罚则权重</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-green-600">
                          {((cou.tagMatchScore || 0) * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-green-700">标签匹配度</div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-orange-600">
                          {cou.scenarioWeight || 1}
                        </div>
                        <div className="text-xs text-orange-700">场景权重</div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">关联条款</span>
                        <span className="text-slate-700">
                          {sourceClauses.length} 个
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">动作要求</span>
                        <span className="text-slate-700">
                          {cou.actionRequirements?.length || 0} 个
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">更新时间</span>
                        <span className="text-slate-700">
                          {new Date(cou.updatedAt).toLocaleDateString("zh-CN")}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 适用范围 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-500" />
                    适用范围
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm text-slate-500 flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        适用行业
                      </label>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {cou.applicableIndustries?.map((ind) => (
                          <Badge key={ind} variant="outline" className="text-xs">
                            {ind}
                          </Badge>
                        )) || <span className="text-sm text-slate-400">未设置</span>}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        适用地区
                      </label>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {cou.applicableRegions?.map((region) => (
                          <Badge key={region} variant="outline" className="text-xs">
                            {region}
                          </Badge>
                        )) || <span className="text-sm text-slate-400">未设置</span>}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        适用用户类型
                      </label>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {cou.applicableUserTypes?.map((type) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        )) || <span className="text-sm text-slate-400">未设置</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI元数据 */}
              {cou.llmMetadata && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      AI拆解信息
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">拆解置信度:</span>
                      <Badge
                        variant="outline"
                        className={`${
                          cou.llmMetadata.decompositionConfidence >= 0.8
                            ? "bg-green-100 text-green-700"
                            : cou.llmMetadata.decompositionConfidence >= 0.6
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {Math.round(cou.llmMetadata.decompositionConfidence * 100)}%
                      </Badge>
                    </div>
                    {cou.llmMetadata.aiSuggestions && (
                      <div>
                        <span className="text-sm text-slate-500">AI建议:</span>
                        <ul className="mt-1 space-y-1">
                          {cou.llmMetadata.aiSuggestions.map((suggestion, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-slate-700 flex items-start gap-2"
                            >
                              <ChevronRight className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {cou.llmMetadata.reviewedBy && (
                      <div className="text-sm text-slate-500">
                        审核人: {cou.llmMetadata.reviewedBy} (
                        {cou.llmMetadata.reviewedAt
                          ? new Date(cou.llmMetadata.reviewedAt).toLocaleDateString(
                              "zh-CN"
                            )
                          : "未记录时间"}
                        )
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* 义务描述标签页 */}
            <TabsContent value="obligation" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    合规义务描述
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm text-slate-500">标题</label>
                    <p className="text-lg font-medium text-slate-800 mt-1">
                      {cou.title}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <label className="text-sm text-slate-500">详细描述</label>
                    <p className="text-sm text-slate-700 leading-relaxed mt-2 whitespace-pre-wrap">
                      {cou.description}
                    </p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-slate-500">要求的行动</label>
                      <p className="text-sm text-slate-700 mt-1">
                        {cou.actionRequired || "未指定"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500">期限要求</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-700">
                          {cou.deadline || "未指定"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <label className="text-sm text-slate-500">违规后果</label>
                    <p className="text-sm text-slate-700 mt-2">
                      {cou.penalty || "未指定"}
                    </p>
                    {cou.penaltyLevel && (
                      <div className="mt-2">
                        <Badge
                          variant="outline"
                          className="text-xs bg-red-50 text-red-700 border-red-200"
                        >
                          罚则力度: {cou.penaltyLevel} (权重
                          {PENALTY_WEIGHTS[cou.penaltyLevel]})
                        </Badge>
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
                      tags={cou.fiveDimensionalTags?.objects || []}
                      prefix="OBJ"
                    />
                    <TagDimensionCard
                      title="主体维度"
                      subtitle="责任主体"
                      icon={<Layers className="w-4 h-4" />}
                      color="green"
                      tags={cou.fiveDimensionalTags?.subjects || []}
                      prefix="SUB"
                    />
                    <TagDimensionCard
                      title="业务流转维度"
                      subtitle="业务环节"
                      icon={<Clock className="w-4 h-4" />}
                      color="orange"
                      tags={cou.fiveDimensionalTags?.lifecycles || []}
                      prefix="LIF"
                    />
                    <TagDimensionCard
                      title="安全域维度"
                      subtitle="保护手段"
                      icon={<Scale className="w-4 h-4" />}
                      color="purple"
                      tags={cou.fiveDimensionalTags?.securities || []}
                      prefix="SEC"
                    />
                    <TagDimensionCard
                      title="动作义务维度"
                      subtitle="COU核心"
                      icon={<CheckCircle className="w-4 h-4" />}
                      color="red"
                      tags={cou.fiveDimensionalTags?.actions || []}
                      prefix="ACT"
                    />
                  </div>

                  {/* 自动标签 */}
                  {cou.autoTags && cou.autoTags.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-slate-700 mb-2">
                        AI自动提取标签
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {cou.autoTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      {cou.autoTagConfidence && (
                        <p className="text-xs text-slate-400 mt-2">
                          自动标注置信度: {Math.round(cou.autoTagConfidence * 100)}%
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 法规映射标签页 */}
            <TabsContent value="mappings" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-blue-500" />
                    来源法规条款
                  </CardTitle>
                  <Button size="sm" variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" />
                    添加映射
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sourceClauses.map((clause) => {
                      const policy = MOCK_POLICIES.find(
                        (p) => p.id === clause.policyId
                      );
                      return (
                        <ClauseMappingCard
                          key={clause.id}
                          clause={clause}
                          policy={policy}
                          onNavigateToClause={onNavigateToClause}
                          onNavigateToPolicy={onNavigateToPolicy}
                        />
                      );
                    })}
                    {sourceClauses.length === 0 && (
                      <div className="text-center py-8 text-slate-400">
                        <Link2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>暂无法规映射</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 控制目标标签页 */}
            <TabsContent value="control-objective" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    关联控制目标
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {controlObjective ? (
                    <div className="p-4 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant="outline"
                              className="font-mono text-xs"
                            >
                              {controlObjective.code}
                            </Badge>
                            <Badge
                              className={`text-xs ${
                                {
                                  critical: "bg-red-100 text-red-700",
                                  high: "bg-orange-100 text-orange-700",
                                  medium: "bg-yellow-100 text-yellow-700",
                                  low: "bg-slate-100 text-slate-700",
                                }[controlObjective.importance]
                              }`}
                            >
                              {{
                                critical: "核心",
                                high: "高",
                                medium: "中",
                                low: "低",
                              }[controlObjective.importance]}
                            </Badge>
                          </div>
                          <h3 className="font-medium text-slate-800 mb-1">
                            {controlObjective.name}
                          </h3>
                          <p className="text-sm text-slate-600 mb-3">
                            {controlObjective.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>类别: {controlObjective.category}</span>
                            <span>域: {controlObjective.domain}</span>
                            <span>基础权重: {controlObjective.baseWeight}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2"
                          onClick={() =>
                            onNavigateToControlObjective?.(controlObjective.id)
                          }
                        >
                          查看详情
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>未关联控制目标</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 动作要求标签页 */}
            <TabsContent value="actions" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    动作要求清单
                  </CardTitle>
                  <Button size="sm" variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" />
                    添加动作
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cou.actionRequirements?.map((action, idx) => (
                      <ActionCard key={action.actionCode} action={action} index={idx} />
                    )) || (
                      <div className="text-center py-8 text-slate-400">
                        <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>暂无动作要求</p>
                      </div>
                    )}
                    {(cou.actionRequirements?.length || 0) === 0 && (
                      <div className="text-center py-8 text-slate-400">
                        <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>暂无动作要求</p>
                      </div>
                    )}
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
                  {cou.versionHistory && cou.versionHistory.length > 0 ? (
                    <div className="space-y-4">
                      {cou.versionHistory.map((version) => (
                        <div
                          key={version.versionId}
                          className="flex items-start gap-4 p-4 rounded-lg border border-slate-200"
                        >
                          <div className="flex-shrink-0">
                            <Badge
                              variant={
                                version.status === "active" ? "default" : "outline"
                              }
                            >
                              v{version.versionNumber}
                            </Badge>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">
                                {version.changeLog || "版本更新"}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {version.impact === "breaking"
                                  ? "破坏性变更"
                                  : version.impact === "compatible"
                                  ? "兼容变更"
                                  : "外观变更"}
                              </Badge>
                            </div>
                            <div className="text-sm text-slate-500">
                              生效日期:{" "}
                              {new Date(version.effectiveDate).toLocaleDateString(
                                "zh-CN"
                              )}
                              {version.status === "deprecated" &&
                                version.supersededBy && (
                                  <span className="ml-2">
                                    已被 {version.supersededBy} 替代
                                  </span>
                                )}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <Badge
                              className={
                                version.status === "active"
                                  ? "bg-green-100 text-green-700"
                                  : version.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                              }
                            >
                              {version.status === "active"
                                ? "当前版本"
                                : version.status === "pending"
                                ? "待审核"
                                : "已废弃"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>暂无版本历史记录</p>
                      <p className="text-sm mt-1">当前版本: v{cou.version}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
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
            {action.deadline && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {action.deadline}
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-slate-800 mb-2">
            {action.description}
          </p>

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

// 条款映射卡片组件
function ClauseMappingCard({
  clause,
  policy,
  onNavigateToClause,
  onNavigateToPolicy,
}: {
  clause: Clause;
  policy?: { id: string; title: string; level: string };
  onNavigateToClause?: (id: string) => void;
  onNavigateToPolicy?: (id: string) => void;
}) {
  return (
    <div className="p-4 rounded-lg border border-slate-200 bg-white hover:border-blue-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="text-xs bg-blue-100 text-blue-700">来源条款</Badge>
            <span className="text-xs text-slate-400">
              {clause.chapter} {clause.article}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm mb-2">
            <button
              onClick={() => onNavigateToPolicy?.(clause.policyId)}
              className="text-blue-600 hover:underline"
            >
              {policy?.title || clause.policyTitle}
            </button>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <button
              onClick={() => onNavigateToClause?.(clause.id)}
              className="text-blue-600 hover:underline"
            >
              {clause.article}
            </button>
          </div>
          <p className="text-xs text-slate-500 line-clamp-2">{clause.content}</p>
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <ExternalLink className="w-4 h-4" />
        </Button>
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
  const colorClasses: Record<
    string,
    { bg: string; text: string; border: string; lightBg: string }
  > = {
    blue: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      border: "border-blue-200",
      lightBg: "bg-blue-50",
    },
    green: {
      bg: "bg-green-100",
      text: "text-green-700",
      border: "border-green-200",
      lightBg: "bg-green-50",
    },
    orange: {
      bg: "bg-orange-100",
      text: "text-orange-700",
      border: "border-orange-200",
      lightBg: "bg-orange-50",
    },
    purple: {
      bg: "bg-purple-100",
      text: "text-purple-700",
      border: "border-purple-200",
      lightBg: "bg-purple-50",
    },
    red: {
      bg: "bg-red-100",
      text: "text-red-700",
      border: "border-red-200",
      lightBg: "bg-red-50",
    },
  };

  const colors = colorClasses[color];

  return (
    <div className={`p-4 rounded-lg border ${colors.border} ${colors.lightBg}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-1.5 rounded ${colors.bg} ${colors.text}`}>{icon}</div>
        <div>
          <h4 className="font-medium text-slate-800">{title}</h4>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {tags.length > 0 ? (
          tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className={`text-xs ${colors.bg} ${colors.text} ${colors.border}`}
            >
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

export default COUDetail;
