// ============ 控制目标卡片 ============
// 展示单个控制目标的核心信息

import React from "react";
import {
  Target,
  Link2,
  Layers,
  Scale,
  Sparkles,
  Search,
  Shield,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import type { ControlObjective, ControlCategory } from "../../types";

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
const IMPORTANCE_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  critical: { color: "text-red-700", bg: "bg-red-100", label: "核心" },
  high: { color: "text-orange-700", bg: "bg-orange-100", label: "高" },
  medium: { color: "text-yellow-700", bg: "bg-yellow-100", label: "中" },
  low: { color: "text-slate-700", bg: "bg-slate-100", label: "低" },
};

interface ControlObjectiveCardProps {
  controlObjective: ControlObjective;
  isSelected?: boolean;
  onClick?: () => void;
}

export function ControlObjectiveCard({
  controlObjective: co,
  isSelected,
  onClick,
}: ControlObjectiveCardProps) {
  const categoryConfig = CATEGORY_CONFIG[co.category];
  const importanceConfig = IMPORTANCE_CONFIG[co.importance];

  // 获取五维标签的简要展示
  const getTagSummary = () => {
    const tags = [
      ...co.applicableTags.objects.slice(0, 1),
      ...co.applicableTags.subjects.slice(0, 1),
      ...co.applicableTags.actions.slice(0, 1),
    ];
    return tags.length > 0 ? tags.join(", ") : "未配置标签";
  };

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* 顶部：编码和重要性 */}
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs font-mono">
                {co.code}
              </Badge>
              <Badge className={`text-xs ${importanceConfig.bg} ${importanceConfig.color} border-0`}>
                {importanceConfig.label}
              </Badge>
              {co.status === "deprecated" && (
                <Badge variant="outline" className="text-xs text-gray-500">
                  已废弃
                </Badge>
              )}
            </div>

            {/* 名称 */}
            <h3 className="font-semibold text-slate-800 truncate" title={co.name}>
              {co.name}
            </h3>
          </div>

          {/* 类别图标 */}
          <div
            className={`p-2 rounded-lg ${categoryConfig.bg} ${categoryConfig.color} ml-2`}
            title={categoryConfig.description}
          >
            {categoryConfig.icon}
          </div>
        </div>

        {/* 类别标签 */}
        <div className="mt-2">
          <Badge
            variant="outline"
            className={`text-xs ${categoryConfig.color} ${categoryConfig.bg} ${categoryConfig.border}`}
          >
            {co.category}
          </Badge>
          <span className="text-xs text-slate-400 ml-2">{co.domain}</span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* 描述 */}
        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
          {co.description}
        </p>

        {/* 统计信息 */}
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Link2 className="w-3.5 h-3.5" />
            <span>{co.mappedClauseCount} 条法规</span>
          </div>
          <div className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            <span>{co.scenarioCount} 个场景</span>
          </div>
          <div className="flex items-center gap-1">
            <Scale className="w-3.5 h-3.5" />
            <span>权重 {co.baseWeight}</span>
          </div>
        </div>

        {/* 动作数量 */}
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-slate-500">
              <FileText className="w-3.5 h-3.5" />
              <span>{co.standardActions.length} 个标准动作</span>
            </div>
            <div className="text-slate-400">
              v{co.version}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ControlObjectiveCard;
