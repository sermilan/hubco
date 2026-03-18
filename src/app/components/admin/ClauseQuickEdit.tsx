// ============ 条款快速编辑行 ============
// ClauseEditor 中使用，支持快速编辑权重

import React, { useState } from "react";
import {
  ChevronDown,
  Edit2,
  Check,
  X,
  Sparkles,
  Target,
  Info,
  Goal,
  Link2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import type { Clause, PolicyLevel } from "../../types";
import { POLICY_LEVEL_WEIGHTS } from "../../types";

// 重要性级别配置
const IMPORTANCE_LEVELS = [
  { value: "critical", label: "核心", weightOffset: 4, color: "bg-red-100 text-red-700 border-red-200" },
  { value: "high", label: "重要", weightOffset: 2, color: "bg-orange-100 text-orange-700 border-orange-200" },
  { value: "normal", label: "普通", weightOffset: 0, color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "low", label: "次要", weightOffset: -2, color: "bg-gray-100 text-gray-700 border-gray-200" },
];

interface ClauseQuickEditProps {
  clause: Clause;
  policyLevel: PolicyLevel;
  isSelected?: boolean;
  isBatchMode?: boolean;
  onSelect?: (selected: boolean) => void;
  onWeightChange?: (clauseId: string, newWeight: number, reason: string) => void;
  onEdit?: (clause: Clause) => void;
  onViewCOUs?: (clauseId: string) => void;
  onMapControlObjective?: () => void;
}

export function ClauseQuickEdit({
  clause,
  policyLevel,
  isSelected = false,
  isBatchMode = false,
  onSelect,
  onWeightChange,
  onEdit,
  onViewCOUs,
  onMapControlObjective,
}: ClauseQuickEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [customOffset, setCustomOffset] = useState(0);

  // 计算基础权重
  const baseWeight = POLICY_LEVEL_WEIGHTS[policyLevel] || 5;

  // 计算当前权重
  const currentWeight = clause.weight !== undefined ? clause.weight : baseWeight;

  // 获取当前重要性级别
  const getCurrentLevel = () => {
    const offset = currentWeight - baseWeight;
    if (offset >= 4) return IMPORTANCE_LEVELS[0];
    if (offset >= 2) return IMPORTANCE_LEVELS[1];
    if (offset <= -2) return IMPORTANCE_LEVELS[3];
    return IMPORTANCE_LEVELS[2];
  };

  const currentLevel = getCurrentLevel();

  // 处理重要性级别变更
  const handleLevelChange = (levelValue: string) => {
    const level = IMPORTANCE_LEVELS.find((l) => l.value === levelValue);
    if (level) {
      const newWeight = baseWeight + level.weightOffset;
      onWeightChange?.(clause.id, newWeight, `设置为${level.label}`);
    }
  };

  // 处理自定义权重
  const handleCustomWeight = (offset: number) => {
    setCustomOffset(offset);
    const newWeight = baseWeight + offset;
    onWeightChange?.(clause.id, newWeight, `自定义微调 ${offset > 0 ? '+' : ''}${offset}`);
    setIsEditing(false);
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors ${
        isSelected ? "bg-blue-50/50" : ""
      }`}
    >
      {/* 批量选择框 */}
      {isBatchMode && (
        <div className="pt-1">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect?.(checked as boolean)}
          />
        </div>
      )}

      <div className="flex-1 min-w-0">
        {/* 第一行：条款编号和标题 */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-slate-700">
                {clause.number}
              </span>
              <h4 className="font-semibold text-slate-800">{clause.title}</h4>
            </div>
            <p className="text-sm text-slate-600 line-clamp-2">{clause.content}</p>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => onEdit?.(clause)}
            >
              <Edit2 className="w-3.5 h-3.5 mr-1" />
              编辑
            </Button>
          </div>
        </div>

        {/* 第二行：权重和COU信息 */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-4">
            {/* 重要性选择 */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">重要性:</span>
              <Select
                value={currentLevel.value}
                onValueChange={handleLevelChange}
              >
                <SelectTrigger className={`h-7 text-xs w-24 ${currentLevel.color}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {IMPORTANCE_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${level.color}`}>{level.label}</Badge>
                        <span className="text-xs text-slate-400">
                          {level.weightOffset >= 0 ? '+' : ''}{level.weightOffset}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 权重显示 */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">权重:</span>
              <div className="flex items-center gap-1">
                <span
                  className={`text-sm font-bold ${
                    currentWeight >= 12
                      ? "text-red-600"
                      : currentWeight >= 9
                      ? "text-orange-600"
                      : "text-blue-600"
                  }`}
                >
                  {currentWeight.toFixed(1)}
                </span>
                <span className="text-xs text-slate-400">
                  (基础{baseWeight})
                </span>

                {/* 自定义微调 */}
                <div className="relative">
                  {isEditing ? (
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0 text-xs"
                        onClick={() => handleCustomWeight(-1)}
                      >
                        -1
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0 text-xs"
                        onClick={() => handleCustomWeight(1)}
                      >
                        +1
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setIsEditing(false)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-slate-400 hover:text-blue-600"
                      onClick={() => setIsEditing(true)}
                    >
                      微调
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 控制目标映射状态 */}
          <div className="flex items-center gap-3">
            {/* 映射状态徽章 */}
            {clause.mappingStatus === "confirmed" || clause.mappingStatus === "auto_mapped" ? (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>已映射 {clause.mappedControlObjectiveIds?.length || 0} 个</span>
              </div>
            ) : clause.mappingStatus === "pending_review" ? (
              <div className="flex items-center gap-1 text-xs text-yellow-600">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>待复核</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <span>未映射</span>
              </div>
            )}

            {/* 映射按钮 */}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              onClick={onMapControlObjective}
            >
              <Goal className="w-3.5 h-3.5 mr-1" />
              {clause.mappingStatus === "unmapped" ? "映射" : "调整映射"}
            </Button>

            {/* COU数量 */}
            <button
              onClick={() => onViewCOUs?.(clause.id)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 transition-colors"
            >
              <Target className="w-3.5 h-3.5" />
              {clause.couCount || 0} 个COU
            </button>
          </div>
        </div>

        {/* AI推荐提示（可选） */}
        {clause.aiRecommendation && (
          <div className="flex items-center gap-2 mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs text-amber-700">
              AI推荐: {clause.aiRecommendation}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 text-xs text-amber-600 hover:text-amber-800"
              onClick={() => {
                if (clause.aiSuggestedWeight) {
                  onWeightChange?.(clause.id, clause.aiSuggestedWeight, "AI推荐权重");
                }
              }}
            >
              应用
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClauseQuickEdit;
