// ============ 匹配的控制目标列表 ============
// SceneBuilder 中使用，展示匹配结果并支持选择生成COU

import React, { useState, useMemo } from "react";
import {
  Check,
  X,
  Target,
  Scale,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
  AlertCircle,
  CheckCircle2,
  Filter,
  ArrowUpDown,
  Shield,
  Goal,
  Layers,
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Slider } from "../ui/slider";
import { ControlObjective, ControlCategory, FiveDimensionalTags } from "../../types";

// 匹配结果项
export interface MatchedControlObjective {
  controlObjective: ControlObjective;
  matchScore: number;           // 匹配分数 0-1
  matchedTags?: string[];        // 匹配到的标签
  missingRequiredTags?: string[]; // 缺失的必需标签
  weightPreview?: number;        // 预估权重
  isRecommended?: boolean;       // 是否AI推荐
}

interface MatchedControlObjectiveListProps {
  // 兼容 SceneBuilder 的命名
  matchedControlObjectives?: MatchedControlObjective[];
  matches?: MatchedControlObjective[];
  selectedIds: Set<string>;
  onToggleSelection: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onGenerateCOUs?: () => void;
  isGenerating?: boolean;
  sceneName?: string;
}

// 控制类别配置
const CATEGORY_CONFIG: Record<ControlCategory, { color: string; icon: React.ReactNode }> = {
  "预防性": { color: "bg-green-100 text-green-700 border-green-200", icon: <Shield className="w-3.5 h-3.5" /> },
  "检测性": { color: "bg-blue-100 text-blue-700 border-blue-200", icon: <Target className="w-3.5 h-3.5" /> },
  "纠正性": { color: "bg-orange-100 text-orange-700 border-orange-200", icon: <AlertCircle className="w-3.5 h-3.5" /> },
  "管理性": { color: "bg-purple-100 text-purple-700 border-purple-200", icon: <Layers className="w-3.5 h-3.5" /> },
  "技术性": { color: "bg-cyan-100 text-cyan-700 border-cyan-200", icon: <Sparkles className="w-3.5 h-3.5" /> },
  "物理性": { color: "bg-slate-100 text-slate-700 border-slate-200", icon: <Goal className="w-3.5 h-3.5" /> },
};

// 重要性级别
const IMPORTANCE_LEVELS = [
  { min: 8, label: "关键", color: "bg-red-100 text-red-700 border-red-200" },
  { min: 6, label: "重要", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { min: 4, label: "中等", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { min: 0, label: "一般", color: "bg-gray-100 text-gray-700 border-gray-200" },
];

export function MatchedControlObjectiveList({
  matchedControlObjectives,
  matches,
  selectedIds,
  onToggleSelection,
  onSelectAll,
  onDeselectAll,
  onGenerateCOUs,
  isGenerating = false,
  sceneName = "当前场景",
}: MatchedControlObjectiveListProps) {
  // 统一使用 matches 作为数据源（兼容两种 prop 名称）
  const matchData = matchedControlObjectives || matches || [];
  const [sortBy, setSortBy] = useState<"score" | "weight" | "name">("score");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [minScore, setMinScore] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<ControlCategory | "all">("all");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // 过滤和排序
  const filteredAndSortedMatches = useMemo(() => {
    let result = matchData.filter((m) => {
      if (m.matchScore < minScore) return false;
      if (selectedCategory !== "all" && m.controlObjective.category !== selectedCategory) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "score":
          comparison = a.matchScore - b.matchScore;
          break;
        case "weight":
          comparison = a.weightPreview - b.weightPreview;
          break;
        case "name":
          comparison = a.controlObjective.name.localeCompare(b.controlObjective.name);
          break;
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });

    return result;
  }, [matches, sortBy, sortOrder, minScore, selectedCategory]);

  // 统计
  const stats = useMemo(() => {
    const selected = filteredAndSortedMatches.filter((m) => selectedIds.has(m.controlObjective.id));
    return {
      total: filteredAndSortedMatches.length,
      selected: selected.length,
      avgWeight: selected.length > 0
        ? selected.reduce((sum, m) => sum + (m.weightPreview || m.controlObjective.baseWeight), 0) / selected.length
        : 0,
      criticalCount: selected.filter((m) => (m.weightPreview || m.controlObjective.baseWeight) >= 8).length,
    };
  }, [filteredAndSortedMatches, selectedIds]);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getImportanceLevel = (weight: number) => {
    return IMPORTANCE_LEVELS.find((l) => weight >= l.min) || IMPORTANCE_LEVELS[3];
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600 bg-green-50";
    if (score >= 0.6) return "text-blue-600 bg-blue-50";
    if (score >= 0.4) return "text-yellow-600 bg-yellow-50";
    return "text-gray-600 bg-gray-50";
  };

  return (
    <div className="h-full flex flex-col">
      {/* 顶部统计和工具栏 */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
              <div className="text-xs text-slate-500">匹配控制目标</div>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.selected}</div>
              <div className="text-xs text-slate-500">已选择</div>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.avgWeight.toFixed(1)}</div>
              <div className="text-xs text-slate-500">平均权重</div>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.criticalCount}</div>
              <div className="text-xs text-slate-500">关键COU</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onDeselectAll}
              disabled={selectedIds.size === 0}
            >
              <X className="w-4 h-4 mr-1" />
              取消全选
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onSelectAll}
              disabled={filteredAndSortedMatches.length === 0}
            >
              <Check className="w-4 h-4 mr-1" />
              全选
            </Button>
            <Button
              size="sm"
              onClick={onGenerateCOUs}
              disabled={selectedIds.size === 0 || isGenerating}
              className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? "生成中..." : `生成 ${selectedIds.size} 个COU`}
            </Button>
          </div>
        </div>

        {/* 筛选器 */}
        <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">筛选:</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">匹配度</span>
            <Slider
              value={[minScore * 100]}
              onValueChange={([v]) => setMinScore(v / 100)}
              max={100}
              step={10}
              className="w-24"
            />
            <span className="text-xs text-slate-600 w-10">{Math.round(minScore * 100)}%</span>
          </div>

          <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as ControlCategory | "all")}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue placeholder="控制类别" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类别</SelectItem>
              <SelectItem value="预防性">预防性</SelectItem>
              <SelectItem value="检测性">检测性</SelectItem>
              <SelectItem value="纠正性">纠正性</SelectItem>
              <SelectItem value="管理性">管理性</SelectItem>
              <SelectItem value="技术性">技术性</SelectItem>
              <SelectItem value="物理性">物理性</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-28 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">匹配度</SelectItem>
                <SelectItem value="weight">预估权重</SelectItem>
                <SelectItem value="name">名称</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => setSortOrder((o) => (o === "desc" ? "asc" : "desc"))}
            >
              {sortOrder === "desc" ? "降序" : "升序"}
            </Button>
          </div>
        </div>
      </div>

      {/* 匹配列表 */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {filteredAndSortedMatches.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>没有匹配的控制目标</p>
            <p className="text-sm mt-1">请调整场景标签配置</p>
          </div>
        ) : (
          filteredAndSortedMatches.map((matchItem) => {
            const { controlObjective, matchScore, matchedTags = [], missingRequiredTags = [], weightPreview = controlObjective.baseWeight, isRecommended = false } = matchItem;
            const isSelected = selectedIds.has(controlObjective.id);
            const isExpanded = expandedIds.has(controlObjective.id);
            const importance = getImportanceLevel(weightPreview);
            const categoryConfig = CATEGORY_CONFIG[controlObjective.category];

            return (
              <div
                key={controlObjective.id}
                className={`bg-white rounded-xl border transition-all ${
                  isSelected
                    ? "border-purple-300 ring-1 ring-purple-200 shadow-md"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* 主行 */}
                <div className="flex items-start gap-3 p-4">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelection(controlObjective.id)}
                    className="mt-1"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-800">{controlObjective.name}</h4>
                          <Badge className={`text-xs ${categoryConfig.color}`}>
                            <span className="mr-1">{categoryConfig.icon}</span>
                            {controlObjective.category}
                          </Badge>
                          {isRecommended && (
                            <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200">
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI推荐
                            </Badge>
                          )}
                          <Badge className={`text-xs ${importance.color}`}>
                            <Scale className="w-3 h-3 mr-1" />
                            {importance.label} · {weightPreview.toFixed(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2">{controlObjective.description}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* 匹配度 */}
                        <div className={`px-3 py-1.5 rounded-lg ${getMatchScoreColor(matchScore)}`}>
                          <div className="text-xs text-slate-500">匹配度</div>
                          <div className="text-lg font-bold">{(matchScore * 100).toFixed(0)}%</div>
                        </div>

                        {/* 展开按钮 */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => toggleExpanded(controlObjective.id)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* 标签预览 */}
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs text-slate-400">匹配标签:</span>
                      <div className="flex flex-wrap gap-1">
                        {matchedTags.slice(0, 5).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs bg-green-50 text-green-600 border-green-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {matchedTags.length > 5 && (
                          <Badge variant="outline" className="text-xs text-slate-400">
                            +{matchedTags.length - 5}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 展开详情 */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-slate-100 pt-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                          <Info className="w-4 h-4 text-blue-500" />
                          控制目标详情
                        </h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-500">编码:</span>
                            <span className="font-mono text-slate-700">{controlObjective.code}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">控制域:</span>
                            <span className="text-slate-700">{controlObjective.domain}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">基础权重:</span>
                            <span className="text-slate-700">{controlObjective.baseWeight}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">映射法规:</span>
                            <span className="text-slate-700">{controlObjective.mappedClauseCount} 条条款</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                          <Scale className="w-4 h-4 text-orange-500" />
                          权重计算预览
                        </h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-500">基础权重:</span>
                            <span className="text-slate-700">{controlObjective.baseWeight}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">标签匹配系数:</span>
                            <span className="text-slate-700">× {matchScore.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">场景调整:</span>
                            <span className="text-slate-700">× 1.0</span>
                          </div>
                          <div className="pt-2 border-t border-slate-100 flex justify-between font-medium">
                            <span className="text-slate-700">预估最终权重:</span>
                            <span className="text-purple-600">{weightPreview.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {missingRequiredTags.length > 0 && (
                      <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center gap-2 text-xs text-yellow-700">
                          <AlertCircle className="w-4 h-4" />
                          <span>缺失的必需标签: {missingRequiredTags.join(", ")}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default MatchedControlObjectiveList;
