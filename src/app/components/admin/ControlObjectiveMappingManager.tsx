// ============ 控制目标映射关系管理器 ============
// 可视化编辑控制目标与条款/COU的映射关系
// 支持拖拽、批量关联、置信度调整

import React, { useState, useMemo } from "react";
import {
  X,
  Link2,
  Unlink,
  Search,
  Plus,
  Trash2,
  Save,
  ArrowRight,
  ChevronRight,
  FileText,
  Target,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Slider } from "../ui/slider";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from "sonner";
import type { ControlObjective, Clause, COU, ClauseMapping } from "../../types";
import { MOCK_CLAUSES, MOCK_COUS, MOCK_POLICIES } from "../../data/mockData";

interface ControlObjectiveMappingManagerProps {
  controlObjective: ControlObjective;
  onClose: () => void;
  onSave: (mappings: ClauseMapping[]) => void;
}

type MappingStatus = "auto" | "confirmed" | "rejected" | "pending_review";

const STATUS_CONFIG: Record<MappingStatus, { label: string; color: string; bg: string }> = {
  auto: { label: "自动映射", color: "text-blue-700", bg: "bg-blue-100" },
  confirmed: { label: "已确认", color: "text-green-700", bg: "bg-green-100" },
  rejected: { label: "已拒绝", color: "text-red-700", bg: "bg-red-100" },
  pending_review: { label: "待复核", color: "text-yellow-700", bg: "bg-yellow-100" },
};

export function ControlObjectiveMappingManager({
  controlObjective,
  onClose,
  onSave,
}: ControlObjectiveMappingManagerProps) {
  const [mappings, setMappings] = useState<ClauseMapping[]>(controlObjective.mappedClauses || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClauses, setSelectedClauses] = useState<string[]>([]);
  const [confidenceValue, setConfidenceValue] = useState(0.85);
  const [mappingReason, setMappingReason] = useState("");
  const [activeTab, setActiveTab] = useState<"clauses" | "cous">("clauses");

  // 获取已映射的条款ID
  const mappedClauseIds = useMemo(() => mappings.map((m) => m.clauseId), [mappings]);

  // 筛选未映射的条款
  const availableClauses = useMemo(() => {
    return MOCK_CLAUSES.filter((c) => {
      if (mappedClauseIds.includes(c.id)) return false;
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        c.title?.toLowerCase().includes(query) ||
        c.content?.toLowerCase().includes(query) ||
        c.number?.toLowerCase().includes(query)
      );
    });
  }, [mappedClauseIds, searchQuery]);

  // 获取政策名称
  const getPolicyTitle = (policyId: string) => {
    return MOCK_POLICIES.find((p) => p.id === policyId)?.title || "未知政策";
  };

  // 添加映射
  const handleAddMappings = () => {
    if (selectedClauses.length === 0) {
      toast.error("请先选择条款");
      return;
    }

    const newMappings: ClauseMapping[] = selectedClauses.map((clauseId) => {
      const clause = MOCK_CLAUSES.find((c) => c.id === clauseId)!;
      return {
        clauseId,
        policyId: clause.policyId,
        policyTitle: getPolicyTitle(clause.policyId),
        clauseNumber: clause.number || "",
        clauseTitle: clause.title || "",
        mappingConfidence: confidenceValue,
        mappingReason: mappingReason || `与${controlObjective.name}相关联`,
        status: "confirmed" as MappingStatus,
        mappedAt: new Date().toISOString(),
        mappedBy: "current_user",
      };
    });

    setMappings((prev) => [...prev, ...newMappings]);
    setSelectedClauses([]);
    setMappingReason("");
    toast.success(`已添加 ${newMappings.length} 个映射关系`);
  };

  // 删除映射
  const handleRemoveMapping = (clauseId: string) => {
    setMappings((prev) => prev.filter((m) => m.clauseId !== clauseId));
    toast.success("已删除映射关系");
  };

  // 更新映射状态
  const handleUpdateStatus = (clauseId: string, status: MappingStatus) => {
    setMappings((prev) =>
      prev.map((m) => (m.clauseId === clauseId ? { ...m, status } : m))
    );
  };

  // 更新映射置信度
  const handleUpdateConfidence = (clauseId: string, confidence: number) => {
    setMappings((prev) =>
      prev.map((m) => (m.clauseId === clauseId ? { ...m, mappingConfidence: confidence } : m))
    );
  };

  // 保存所有映射
  const handleSave = () => {
    onSave(mappings);
    toast.success("映射关系已保存");
    onClose();
  };

  // 自动映射（模拟AI推荐）
  const handleAutoMap = () => {
    toast.info("正在分析最佳映射关系...", { duration: 1500 });
    setTimeout(() => {
      // 模拟找到3个推荐映射
      const recommendations = availableClauses.slice(0, 3);
      if (recommendations.length === 0) {
        toast.warning("未找到推荐的映射关系");
        return;
      }

      const newMappings: ClauseMapping[] = recommendations.map((clause) => ({
        clauseId: clause.id,
        policyId: clause.policyId,
        policyTitle: getPolicyTitle(clause.policyId),
        clauseNumber: clause.number || "",
        clauseTitle: clause.title || "",
        mappingConfidence: 0.75 + Math.random() * 0.2,
        mappingReason: `基于语义相似性自动推荐：${controlObjective.name} 与 ${clause.title || clause.number} 内容高度相关`,
        status: "pending_review",
        mappedAt: new Date().toISOString(),
        mappedBy: "ai_system",
      }));

      setMappings((prev) => [...prev, ...newMappings]);
      toast.success(`AI推荐了 ${newMappings.length} 个映射关系，请复核后确认`);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50"
    >
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200"
      >
        <div className="flex items-center gap-4"
        >
          <Button variant="ghost" size="sm" onClick={onClose} className="gap-2"
          >
            <X className="w-4 h-4" />
            关闭
          </Button>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <h1 className="text-lg font-semibold text-slate-800"
            >映射关系管理</h1
            >
            <p className="text-xs text-slate-500"
            >
              {controlObjective.code} · {controlObjective.name}
            </p
            >
          </div>
        </div>

        <div className="flex items-center gap-2"
        >
          <Button variant="outline" size="sm" className="gap-2" onClick={handleAutoMap}
          >
            <Sparkles className="w-4 h-4" />
            AI自动推荐
          </Button>
          <Button size="sm" className="gap-2" onClick={handleSave}
          >
            <Save className="w-4 h-4" />
            保存
          </Button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden"
      >
        {/* 左侧：已映射关系 */}
        <div className="w-1/2 border-r border-slate-200 bg-white flex flex-col"
        >
          <div className="p-4 border-b border-slate-200"
          >
            <div className="flex items-center justify-between"
            >
              <h2 className="font-medium text-slate-800 flex items-center gap-2"
              >
                <Link2 className="w-4 h-4 text-blue-500" />
                已映射条款 ({mappings.length})
              </h2>
              <Badge variant="outline" className="text-xs"
              >
                平均置信度: {mappings.length > 0
                  ? Math.round(
                      (mappings.reduce((sum, m) => sum + m.mappingConfidence, 0) / mappings.length) *
                        100
                    )
                  : 0}
                %
              </Badge>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4"
          >
            <div className="space-y-3"
            >
              {mappings.map((mapping) => (
                <MappingCard
                  key={mapping.clauseId}
                  mapping={mapping}
                  onRemove={() => handleRemoveMapping(mapping.clauseId)}
                  onUpdateStatus={(status) => handleUpdateStatus(mapping.clauseId, status)}
                  onUpdateConfidence={(conf) => handleUpdateConfidence(mapping.clauseId, conf)}
                />
              ))}
              {mappings.length === 0 && (
                <div className="text-center py-12 text-slate-400"
                >
                  <Link2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>暂无映射关系</p>
                  <p className="text-sm mt-1">点击右侧添加条款映射</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* 右侧：添加映射 */}
        <div className="w-1/2 flex flex-col bg-slate-50"
        >
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col"
          >
            <div className="px-4 pt-4"
            >
              <TabsList className="w-full"
              >
                <TabsTrigger value="clauses" className="flex-1 gap-2"
                >
                  <FileText className="w-4 h-4" />
                  关联条款
                </TabsTrigger>
                <TabsTrigger value="cous" className="flex-1 gap-2"
                >
                  <Target className="w-4 h-4" />
                  关联COU
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="clauses" className="flex-1 flex flex-col m-0 mt-4"
            >
              {/* 搜索和筛选 */}
              <div className="px-4 mb-4"
              >
                <div className="relative"
                >
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="搜索条款..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* 映射设置 */}
              <div className="px-4 mb-4"
              >
                <Card className="bg-white"
                >
                  <CardContent className="p-4 space-y-4"
                  >
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block"
                      >
                        置信度: {Math.round(confidenceValue * 100)}%
                      </label>
                      <Slider
                        value={[confidenceValue * 100]}
                        onValueChange={(v) => setConfidenceValue(v[0] / 100)}
                        min={50}
                        max={100}
                        step={5}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block"
                      >映射原因</label
                      >
                      <Input
                        placeholder="说明映射原因..."
                        value={mappingReason}
                        onChange={(e) => setMappingReason(e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 可选条款列表 */}
              <ScrollArea className="flex-1 px-4"
              >
                <div className="space-y-2 pb-4"
                >
                  {availableClauses.map((clause) => {
                    const policy = MOCK_POLICIES.find((p) => p.id === clause.policyId);
                    const isSelected = selectedClauses.includes(clause.id);

                    return (
                      <div
                        key={clause.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? "bg-blue-50 border-blue-300"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedClauses((prev) => prev.filter((id) => id !== clause.id));
                          } else {
                            setSelectedClauses((prev) => [...prev, clause.id]);
                          }
                        }}
                      >
                        <div className="flex items-start gap-3"
                        >
                          <div
                            className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center ${
                              isSelected
                                ? "bg-blue-500 border-blue-500"
                                : "border-slate-300"
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <div className="flex-1"
                          >
                            <div className="flex items-center gap-2 mb-1"
                            >
                              <Badge variant="outline" className="text-[10px]"
                              >
                                {policy?.level}
                              </Badge>
                              <span className="text-xs text-slate-500"
                              >{policy?.title}</span
                              >
                            </div>
                            <p className="text-sm font-medium text-slate-800"
                            >
                              {clause.number} {clause.title}
                            </p
                            >
                            <p className="text-xs text-slate-500 line-clamp-2 mt-1"
                            >
                              {clause.content?.substring(0, 100)}...
                            </p
                            >
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* 底部添加按钮 */}
              {selectedClauses.length > 0 && (
                <div className="p-4 bg-white border-t border-slate-200"
                >
                  <Button className="w-full gap-2" onClick={handleAddMappings}
                  >
                    <Plus className="w-4 h-4" />
                    添加 {selectedClauses.length} 个映射
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="cous" className="flex-1 m-0 mt-4 px-4"
            >
              <div className="h-full flex items-center justify-center text-slate-400"
              >
                <div className="text-center"
                >
                  <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>COU关联功能开发中</p>
                  <p className="text-sm mt-1">请先使用条款关联</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// 映射卡片组件
function MappingCard({
  mapping,
  onRemove,
  onUpdateStatus,
  onUpdateConfidence,
}: {
  mapping: ClauseMapping;
  onRemove: () => void;
  onUpdateStatus: (status: MappingStatus) => void;
  onUpdateConfidence: (confidence: number) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusConfig = STATUS_CONFIG[mapping.status as MappingStatus];

  return (
    <div className="p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
    >
      <div className="flex items-start justify-between"
      >
        <div className="flex-1"
        >
          <div className="flex items-center gap-2 mb-1"
          >
            <Badge className={`text-[10px] ${statusConfig.bg} ${statusConfig.color}`}
            >
              {statusConfig.label}
            </Badge>
            <span className="text-xs text-slate-400"
            >
              置信度 {Math.round(mapping.mappingConfidence * 100)}%
            </span
            >
          </div>
          <p className="text-sm font-medium text-slate-800"
          >
            {mapping.clauseNumber} {mapping.clauseTitle}
          </p
          >
          <p className="text-xs text-slate-500"
          >{mapping.policyTitle}</p
          >
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={onRemove}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {mapping.mappingReason && (
        <p className="text-xs text-slate-500 mt-2 line-clamp-2"
        >{mapping.mappingReason}</p
        >
      )}

      {mapping.status === "pending_review" && (
        <div className="flex gap-2 mt-3"
        >
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs flex-1"
            onClick={() => onUpdateStatus("confirmed")}
          >
            <CheckCircle2 className="w-3 h-3 mr-1" />
            确认
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs flex-1 text-red-600 hover:text-red-700"
            onClick={() => onUpdateStatus("rejected")}
          >
            <AlertCircle className="w-3 h-3 mr-1" />
            拒绝
          </Button>
        </div>
      )}
    </div>
  );
}

export default ControlObjectiveMappingManager;
