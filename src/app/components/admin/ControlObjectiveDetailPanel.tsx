// ============ 控制目标右侧详情面板 ============
// 快速预览控制目标信息，无需跳转页面

import React from "react";
import {
  X,
  Target,
  Layers,
  Scale,
  Sparkles,
  Search,
  Shield,
  Link2,
  Edit3,
  Trash2,
  FileText,
  CheckCircle,
  Tag,
  ChevronRight,
  ExternalLink,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import type { ControlObjective, ControlCategory } from "../../types";

// 控制类别配置
const CATEGORY_CONFIG: Record<
  ControlCategory,
  { color: string; bg: string; border: string; icon: React.ReactNode; description: string }
> = {
  预防性: {
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    icon: <Sparkles className="w-4 h-4" />,
    description: "防止事件发生的控制",
  },
  检测性: {
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: <Search className="w-4 h-4" />,
    description: "发现已发生事件的控制",
  },
  纠正性: {
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    icon: <Target className="w-4 h-4" />,
    description: "修复已造成损害的控制",
  },
  管理性: {
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
    icon: <Layers className="w-4 h-4" />,
    description: "政策、流程、培训",
  },
  技术性: {
    color: "text-cyan-700",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    icon: <Scale className="w-4 h-4" />,
    description: "加密、访问控制、审计日志",
  },
  物理性: {
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

interface ControlObjectiveDetailPanelProps {
  controlObjective: ControlObjective | null;
  onClose: () => void;
  onEdit?: (co: ControlObjective) => void;
  onDelete?: (id: string) => void;
  onNavigateToDetail?: (co: ControlObjective) => void;
  onNavigateToClause?: (clauseId: string) => void;
  onNavigateToPolicy?: (policyId: string) => void;
}

export function ControlObjectiveDetailPanel({
  controlObjective,
  onClose,
  onEdit,
  onDelete,
  onNavigateToDetail,
  onNavigateToClause,
  onNavigateToPolicy,
}: ControlObjectiveDetailPanelProps) {
  if (!controlObjective) return null;

  const co = controlObjective;
  const categoryConfig = CATEGORY_CONFIG[co.category];
  const importanceConfig = IMPORTANCE_CONFIG[co.importance];

  return (
    <div className="w-96 border-l border-slate-200/50 bg-white/80 backdrop-blur-xl flex flex-col animate-in slide-in-from-right-4 duration-200">
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/50">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${categoryConfig.bg} ${categoryConfig.color}`}>
            {categoryConfig.icon}
          </div>
          <span className="font-medium text-slate-800">控制目标详情</span>
        </div>
        <div className="flex items-center gap-1">
          {onNavigateToDetail && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onNavigateToDetail(co)}
              title="查看完整详情"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* 基本信息 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${categoryConfig.bg} ${categoryConfig.color} ${categoryConfig.border}`}>
                {co.code}
              </Badge>
              <Badge className={`${importanceConfig.bg} ${importanceConfig.color}`}>
                {importanceConfig.label}
              </Badge>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">{co.name}</h3>
            {co.nameEn && <p className="text-sm text-slate-500">{co.nameEn}</p>}
          </div>

          {/* 状态栏 */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${co.status === "active" ? "bg-green-500" : "bg-gray-400"}`} />
              <span className="text-slate-600">{co.status === "active" ? "生效中" : "已废弃"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              <span>v{co.version}</span>
            </div>
          </div>

          <Separator />

          {/* 描述 */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              详细描述
            </label>
            <p className="mt-1.5 text-sm text-slate-700 leading-relaxed">{co.description}</p>
          </div>

          {/* 统计信息 */}
          <Card className="bg-slate-50/50">
            <CardContent className="p-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 bg-white rounded-lg">
                  <div className="text-xl font-bold text-blue-600">{co.baseWeight}</div>
                  <div className="text-xs text-slate-500">基础权重</div>
                </div>
                <div className="text-center p-2 bg-white rounded-lg">
                  <div className="text-xl font-bold text-green-600">{co.mappedClauseCount}</div>
                  <div className="text-xs text-slate-500">映射法规</div>
                </div>
                <div className="text-center p-2 bg-white rounded-lg">
                  <div className="text-xl font-bold text-purple-600">{co.scenarioCount}</div>
                  <div className="text-xs text-slate-500">覆盖场景</div>
                </div>
                <div className="text-center p-2 bg-white rounded-lg">
                  <div className="text-xl font-bold text-orange-600">{co.standardActions.length}</div>
                  <div className="text-xs text-slate-500">标准动作</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 分类信息 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-500">控制类别</label>
              <div className="flex items-center gap-1.5">
                <div className={`p-1 rounded ${categoryConfig.bg} ${categoryConfig.color}`}>
                  {categoryConfig.icon}
                </div>
                <span className="text-sm text-slate-700">{co.category}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-500">控制域</label>
              <span className="text-sm text-slate-700">{co.domain}</span>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-500">重要性</label>
              <Badge className={`${importanceConfig.bg} ${importanceConfig.color} text-xs`}>
                {importanceConfig.label}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* 标准动作 */}
          {co.standardActions.length > 0 && (
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                <CheckCircle className="w-3.5 h-3.5" />
                标准动作 ({co.standardActions.length})
              </label>
              <div className="space-y-2">
                {co.standardActions.slice(0, 3).map((action, idx) => (
                  <div key={idx} className="p-2 bg-slate-50 rounded-lg text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {action.actionCode}
                      </Badge>
                      {action.isBlocking && (
                        <Badge className="text-[10px] bg-red-100 text-red-700">阻断性</Badge>
                      )}
                    </div>
                    <p className="text-slate-700 line-clamp-2">{action.description}</p>
                  </div>
                ))}
                {co.standardActions.length > 3 && (
                  <div className="text-center text-xs text-slate-400">
                    还有 {co.standardActions.length - 3} 个动作...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 五维标签 */}
          {co.applicableTags && (
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                <Tag className="w-3.5 h-3.5" />
                五维标签
              </label>
              <div className="space-y-2">
                <TagRow label="客体" tags={co.applicableTags.objects} color="blue" />
                <TagRow label="主体" tags={co.applicableTags.subjects} color="green" />
                <TagRow label="流转" tags={co.applicableTags.lifecycles} color="orange" />
                <TagRow label="安全" tags={co.applicableTags.securities} color="purple" />
                <TagRow label="动作" tags={co.applicableTags.actions} color="red" />
              </div>
            </div>
          )}

          {/* 法规映射 */}
          {co.mappedClauses.length > 0 && (
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                <Link2 className="w-3.5 h-3.5" />
                法规映射 ({co.mappedClauses.length})
              </label>
              <div className="space-y-2">
                {co.mappedClauses.slice(0, 3).map((mapping) => (
                  <div
                    key={mapping.clauseId}
                    className="p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => onNavigateToClause?.(mapping.clauseId)}
                  >
                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                      <span
                        className="text-blue-600 hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateToPolicy?.(mapping.policyId);
                        }}
                      >
                        {mapping.policyTitle}
                      </span>
                      <ChevronRight className="w-3 h-3" />
                      <span>{mapping.clauseNumber}</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{mapping.mappingReason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 相关标准 */}
          {co.standards && co.standards.length > 0 && (
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                <Scale className="w-3.5 h-3.5" />
                相关标准
              </label>
              <div className="flex flex-wrap gap-1">
                {co.standards.map((standard) => (
                  <Badge key={standard} variant="outline" className="text-[10px]">
                    {standard}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* 底部操作 */}
      <div className="p-4 border-t border-slate-200/50 flex gap-2">
        {onEdit && (
          <Button className="flex-1 gap-2" onClick={() => onEdit(co)}>
            <Edit3 className="w-4 h-4" />
            编辑
          </Button>
        )}
        {onDelete && (
          <Button variant="outline" className="gap-2 text-red-600 hover:text-red-700" onClick={() => onDelete(co.id)}>
            <Trash2 className="w-4 h-4" />
            删除
          </Button>
        )}
      </div>
    </div>
  );
}

// 标签行组件
function TagRow({
  label,
  tags,
  color,
}: {
  label: string;
  tags: string[];
  color: "blue" | "green" | "orange" | "purple" | "red";
}) {
  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
    green: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
    orange: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
    purple: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
    red: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
  };

  const colors = colorClasses[color];

  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex items-start gap-2">
      <span className="text-xs text-slate-500 w-8 flex-shrink-0">{label}</span>
      <div className="flex flex-wrap gap-1">
        {tags.map((tag) => (
          <Badge key={tag} variant="outline" className={`text-[10px] ${colors.bg} ${colors.text} ${colors.border}`}>
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export default ControlObjectiveDetailPanel;
