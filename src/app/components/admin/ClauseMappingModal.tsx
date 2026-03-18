// ============ 条款映射模态框 ============
// AI 辅助将条款映射到控制目标

import React, { useState, useMemo } from "react";
import {
  X,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Target,
  Lightbulb,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { toast } from "sonner";
import type { Clause, ControlObjective } from "../../types";
import { MOCK_CONTROL_OBJECTIVES } from "../../data/mockData";

interface ClauseMappingModalProps {
  clause: Clause | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmMapping: (clauseId: string, controlObjectiveIds: string[]) => void;
}

// 模拟 AI 推荐结果
function generateAIMappings(clause: Clause | null): Array<{
  controlObjective: ControlObjective;
  confidence: number;
  reason: string;
}> {
  if (!clause) return [];

  // 基于关键词匹配模拟 AI 推荐
  const keywords = clause.keywords || [];
  const content = clause.content || "";

  return MOCK_CONTROL_OBJECTIVES.map((co) => {
    let score = 0;
    let matchedKeywords: string[] = [];

    // 关键词匹配
    keywords.forEach((kw) => {
      if (
        co.name.includes(kw) ||
        co.description.includes(kw) ||
        content.includes(kw)
      ) {
        score += 0.2;
        matchedKeywords.push(kw);
      }
    });

    // 基于条款内容智能匹配
    if (content.includes("分类") && co.code === "CO-DS-001") score += 0.4;
    if (content.includes("加密") && co.code === "CO-LC-003") score += 0.4;
    if (content.includes("出境") && co.code === "CO-XB-001") score += 0.4;
    if (content.includes("等级保护") && co.code === "CO-NS-001") score += 0.4;
    if (content.includes("培训") && co.code === "CO-ORG-002") score += 0.3;
    if (content.includes("审计") && co.code === "CO-AUD-001") score += 0.3;

    // 生成推荐理由
    let reason = "";
    if (score > 0.7) {
      reason = `关键词高度匹配：${matchedKeywords.slice(0, 3).join("、")}`;
    } else if (score > 0.4) {
      reason = `语义相关：${co.domain}域控制目标`;
    } else if (score > 0.2) {
      reason = "潜在关联，建议人工复核";
    } else {
      reason = "关联度较低";
    }

    return {
      controlObjective: co,
      confidence: Math.min(score, 0.95),
      reason,
    };
  })
    .filter((m) => m.confidence > 0.2)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);
}

export function ClauseMappingModal({
  clause,
  isOpen,
  onClose,
  onConfirmMapping,
}: ClauseMappingModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // AI 推荐结果
  const aiRecommendations = useMemo(() => {
    if (!isOpen || !clause) return [];
    return generateAIMappings(clause);
  }, [clause, isOpen]);

  // 处理选择
  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // 确认映射
  const handleConfirm = () => {
    if (!clause || selectedIds.length === 0) return;
    onConfirmMapping(clause.id, selectedIds);
    toast.success(`已确认 ${selectedIds.length} 个控制目标映射`);
    onClose();
  };

  // 模拟 AI 分析
  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      // 自动选中高置信度的推荐
      const highConfidenceIds = aiRecommendations
        .filter((r) => r.confidence > 0.7)
        .map((r) => r.controlObjective.id);
      setSelectedIds(highConfidenceIds);
    }, 1500);
  };

  if (!clause) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            条款映射到控制目标
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex gap-4 mt-4">
          {/* 左侧：条款内容 */}
          <div className="w-1/2 flex flex-col gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                <Badge variant="outline">{clause.policyTitle}</Badge>
                <span>{clause.article}</span>
              </div>
              <h4 className="font-medium text-slate-800 mb-2">{clause.chapter}</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {clause.content}
              </p>
            </div>

            {/* 关键词 */}
            {clause.keywords && clause.keywords.length > 0 && (
              <div>
                <div className="text-xs font-medium text-slate-500 mb-2">
                  提取关键词
                </div>
                <div className="flex flex-wrap gap-1">
                  {clause.keywords.map((kw) => (
                    <Badge
                      key={kw}
                      variant="secondary"
                      className="text-xs bg-blue-50 text-blue-600"
                    >
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* AI 分析按钮 */}
            <Button
              variant="outline"
              className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  AI 分析中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI 智能推荐
                </>
              )}
            </Button>
          </div>

          {/* 右侧：推荐列表 */}
          <div className="w-1/2 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-slate-700">
                推荐控制目标 ({aiRecommendations.length})
              </div>
              {selectedIds.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds([])}
                >
                  清空选择
                </Button>
              )}
            </div>

            <ScrollArea className="flex-1 pr-2">
              <div className="space-y-2">
                {aiRecommendations.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Lightbulb className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">点击"AI 智能推荐"获取映射建议</p>
                  </div>
                ) : (
                  aiRecommendations.map(({ controlObjective, confidence, reason }) => (
                    <div
                      key={controlObjective.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedIds.includes(controlObjective.id)
                          ? "bg-blue-50 border-blue-300"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                      onClick={() => toggleSelection(controlObjective.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs font-mono">
                              {controlObjective.code}
                            </Badge>
                            <span
                              className={`text-xs ${
                                confidence >= 0.8
                                  ? "text-green-600"
                                  : confidence >= 0.5
                                  ? "text-yellow-600"
                                  : "text-slate-500"
                              }`}
                            >
                              置信度 {Math.round(confidence * 100)}%
                            </span>
                          </div>
                          <div className="font-medium text-slate-800 text-sm truncate">
                            {controlObjective.name}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">{reason}</div>
                        </div>
                        {selectedIds.includes(controlObjective.id) && (
                          <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-between pt-4 border-t mt-4">
          <div className="text-sm text-slate-500">
            已选择 {selectedIds.length} 个控制目标
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selectedIds.length === 0}
              className="bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              确认映射
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ClauseMappingModal;
