// ============ 条款编辑器 ============
// 针对大规模条款数据优化设计
// 三栏布局：章节导航 | 条款表格 | 统计面板
// 支持列宽拖拽调整

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  Search,
  Filter,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Edit3,
  MoreHorizontal,
  Scale,
  Target,
  FileText,
  Goal,
  CheckCircle,
  AlertCircle,
  Sparkles,
  CheckSquare,
  Square,
  X,
  Hash,
  LayoutGrid,
  List,
  Download,
  Eye,
  MapPin,
  GripVertical,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { ScrollArea } from "../ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { toast } from "sonner";
import type { Clause, Policy } from "../../types";
import { MOCK_CLAUSES, MOCK_POLICIES } from "../../data/mockData";
import { ClauseAddModal } from "./ClauseAddModal";
import { ClauseMappingModal } from "./ClauseMappingModal";

interface ClauseEditorProps {
  initialPolicyId?: string;
  policyId?: string;
  onBack?: () => void;
  onBackToPolicies?: () => void;
  onSave?: (clauses: Clause[]) => void;
  onClauseClick?: (clause: Clause) => void;
  onNavigateToCOUs?: (clauseId: string) => void;
  onNavigateToControlObjectives?: (clauseId: string) => void;
}

// 将条款按章节分组
function groupClausesByChapter(clauses: Clause[]): Map<string, Clause[]> {
  const groups = new Map<string, Clause[]>();
  clauses.forEach((clause) => {
    let chapter = "未分类";
    const match = clause.number?.match(/第([一二三四五六七八九十\d]+)章/);
    if (match) {
      chapter = `第${match[1]}章`;
    } else if (clause.chapter) {
      chapter = clause.chapter;
    }
    if (!groups.has(chapter)) {
      groups.set(chapter, []);
    }
    groups.get(chapter)!.push(clause);
  });
  return groups;
}

// 模拟更多条款数据用于测试
function generateMockClauses(baseClauses: Clause[], policyId: string): Clause[] {
  const chapters = ["第一章", "第二章", "第三章", "第四章", "第五章", "第六章", "第七章", "第八章"];
  const result: Clause[] = [...baseClauses];

  if (baseClauses.length < 20) {
    chapters.forEach((chapter, chapterIdx) => {
      const clauseCount = 5 + Math.floor(Math.random() * 10);
      for (let i = 0; i < clauseCount; i++) {
        const clauseNum = i + 1;
        const chineseNums = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
        let numStr = "";
        if (clauseNum <= 10) {
          numStr = chineseNums[clauseNum - 1];
        } else if (clauseNum <= 20) {
          numStr = "十" + (clauseNum > 11 ? chineseNums[clauseNum - 11] : "");
        }

        result.push({
          id: `clause-${chapterIdx}-${clauseNum}`,
          policyId,
          policyTitle: baseClauses[0]?.policyTitle || "测试政策",
          policyCode: "",
          policyLevel: "部门规章",
          chapter,
          number: `第${numStr}条`,
          title: `${chapter}第${numStr}条内容示例标题`,
          content: `这是${chapter}第${numStr}条的具体内容描述，包含相关的合规要求和条款说明。本条款规定了数据处理活动中的安全保护义务，要求数据处理者采取必要措施保障数据安全。`,
          weight: Math.floor(Math.random() * 6) + 3,
          baseWeight: 5,
          penaltyWeight: 1,
          tagScore: 1,
          finalWeight: 5,
          importanceLevel: Math.random() > 0.7 ? "high" : "medium",
          complianceType: "必须遵守",
          obligationType: "强制性",
          penaltyLevel: "无",
          applicableScopes: [],
          tags: [],
          mappedControlObjectiveIds: [],
          mappingStatus: Math.random() > 0.6 ? "confirmed" : "unmapped",
        } as Clause);
      }
    });
  }

  return result;
}

// Tooltip 包装组件
function TruncatedText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={`truncate block ${className}`}>{text}</span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-md">
        <p className="text-sm">{text}</p>
      </TooltipContent>
    </Tooltip>
  );
}

// 可拖拽表头组件
interface ResizableHeaderProps {
  children: React.ReactNode;
  width: number;
  minWidth?: number;
  onResize: (newWidth: number) => void;
  className?: string;
}

function ResizableHeader({ children, width, minWidth = 60, onResize, className = "" }: ResizableHeaderProps) {
  const isResizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(width);
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    isResizingRef.current = true;
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizingRef.current) return;
      moveEvent.preventDefault();
      moveEvent.stopPropagation();

      const diff = moveEvent.clientX - startXRef.current;
      const newWidth = Math.max(minWidth, startWidthRef.current + diff);
      onResize(newWidth);
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      upEvent.preventDefault();
      isResizingRef.current = false;
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove, { capture: true });
      document.removeEventListener("mouseup", handleMouseUp, { capture: true });
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", handleMouseMove, { capture: true });
    document.addEventListener("mouseup", handleMouseUp, { capture: true });
  }, [width, minWidth, onResize]);

  return (
    <th
      className={`relative h-10 px-2 text-left align-middle font-medium text-slate-500 text-xs ${className}`}
      style={{ width, minWidth: width }}
    >
      <div className="flex items-center h-full overflow-hidden">
        {children}
      </div>
      {/* 拖拽手柄 - 使用 pointer-events-auto 确保能接收鼠标事件 */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-5 cursor-col-resize flex items-center justify-center select-none pointer-events-auto ${
          isResizing ? "bg-blue-300/50" : "bg-slate-200/0 hover:bg-slate-300/50"
        }`}
        onMouseDown={handleMouseDown}
        title="拖动调整列宽"
      >
        <div className={`w-px h-4 ${isResizing ? "bg-blue-600" : "bg-slate-400/50"}`} />
      </div>
    </th>
  );
}

export function ClauseEditor({
  initialPolicyId,
  policyId: externalPolicyId,
  onBack,
  onBackToPolicies,
  onSave,
  onClauseClick,
  onNavigateToCOUs,
  onNavigateToControlObjectives,
}: ClauseEditorProps) {
  const effectivePolicyId = initialPolicyId || externalPolicyId;
  const policy = useMemo(() => {
    if (effectivePolicyId) {
      return MOCK_POLICIES.find((p) => p.id === effectivePolicyId);
    }
    return MOCK_POLICIES[0];
  }, [effectivePolicyId]);

  const [clauses, setClauses] = useState<Clause[]>(() => {
    const baseClauses = MOCK_CLAUSES.filter((c) => c.policyId === policy?.id);
    return generateMockClauses(baseClauses, policy?.id || "");
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [importanceFilter, setImportanceFilter] = useState<string>("all");
  const [mappingFilter, setMappingFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortField, setSortField] = useState<"number" | "weight" | "chapter">("chapter");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedClauseIds, setSelectedClauseIds] = useState<Set<string>>(new Set());
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [expandedClauseId, setExpandedClauseId] = useState<string | null>(null);

  // 列宽状态
  const [columnWidths, setColumnWidths] = useState({
    chapter: 80,
    number: 90,
    content: 400,
    weight: 80,
    mapping: 100,
  });

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [mappingModalOpen, setMappingModalOpen] = useState(false);
  const [selectedClauseForMapping, setSelectedClauseForMapping] = useState<Clause | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [editingClause, setEditingClause] = useState<Clause | null>(null);

  const chapterGroups = useMemo(() => groupClausesByChapter(clauses), [clauses]);
  const chapters = useMemo(() => Array.from(chapterGroups.keys()), [chapterGroups]);

  const filteredClauses = useMemo(() => {
    let result = [...clauses];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.number?.toLowerCase().includes(query) ||
        c.title?.toLowerCase().includes(query) ||
        c.content?.toLowerCase().includes(query) ||
        c.chapter?.toLowerCase().includes(query)
      );
    }

    if (selectedChapters.length > 0) {
      result = result.filter(c => selectedChapters.includes(c.chapter || "未分类"));
    }

    if (importanceFilter !== "all") {
      result = result.filter(c => c.importanceLevel === importanceFilter);
    }

    if (mappingFilter !== "all") {
      result = result.filter(c => c.mappingStatus === mappingFilter);
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "weight":
          comparison = (a.weight || 0) - (b.weight || 0);
          break;
        case "chapter":
          comparison = (a.chapter || "").localeCompare(b.chapter || "");
          if (comparison === 0) {
            comparison = (a.number || "").localeCompare(b.number || "");
          }
          break;
        case "number":
        default:
          comparison = (a.number || "").localeCompare(b.number || "");
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [clauses, searchQuery, selectedChapters, importanceFilter, mappingFilter, sortField, sortOrder]);

  const stats = useMemo(() => {
    const total = clauses.length;
    const mapped = clauses.filter(c => c.mappingStatus === "confirmed" || c.mappingStatus === "auto_mapped").length;
    const unmapped = total - mapped;
    const highWeight = clauses.filter(c => (c.weight || 0) >= 7).length;
    return { total, mapped, unmapped, highWeight };
  }, [clauses]);

  const toggleSelectAll = useCallback(() => {
    if (selectedClauseIds.size === filteredClauses.length) {
      setSelectedClauseIds(new Set());
    } else {
      setSelectedClauseIds(new Set(filteredClauses.map(c => c.id)));
    }
  }, [filteredClauses, selectedClauseIds.size]);

  const toggleSelectClause = useCallback((id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedClauseIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleBatchSetWeight = useCallback((weight: number) => {
    setClauses(prev => prev.map(c =>
      selectedClauseIds.has(c.id) ? { ...c, weight } : c
    ));
    toast.success(`已批量设置 ${selectedClauseIds.size} 条条款权重`);
    setSelectedClauseIds(new Set());
  }, [selectedClauseIds]);

  const handleRowClick = useCallback((clauseId: string) => {
    if (isBatchMode) {
      toggleSelectClause(clauseId);
    } else {
      setExpandedClauseId(prev => prev === clauseId ? null : clauseId);
    }
  }, [isBatchMode, toggleSelectClause]);

  const openEditSheet = useCallback((clause: Clause, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingClause({ ...clause });
    setEditSheetOpen(true);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingClause) return;
    setClauses(prev => prev.map(c =>
      c.id === editingClause.id ? editingClause : c
    ));
    toast.success("条款已更新");
    setEditSheetOpen(false);
    setEditingClause(null);
  }, [editingClause]);

  const handleDelete = useCallback((id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm("确定要删除这条条款吗？")) {
      setClauses(prev => prev.filter(c => c.id !== id));
      if (expandedClauseId === id) setExpandedClauseId(null);
      toast.success("条款已删除");
    }
  }, [expandedClauseId]);

  const handleViewCOUs = useCallback((clauseId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (onNavigateToCOUs) {
      onNavigateToCOUs(clauseId);
    } else {
      toast.success(`查看条款 ${clauseId} 的COU`);
    }
  }, [onNavigateToCOUs]);

  // 查看控制目标
  const handleViewControlObjectives = useCallback((clauseId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (onNavigateToControlObjectives) {
      onNavigateToControlObjectives(clauseId);
    } else {
      toast.success(`查看条款 ${clauseId} 的控制目标`);
    }
  }, [onNavigateToControlObjectives]);

  const handleOpenMapping = useCallback((clause: Clause, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedClauseForMapping(clause);
    setMappingModalOpen(true);
  }, []);

  const handleConfirmMapping = useCallback((clauseId: string, controlObjectiveIds: string[]) => {
    setClauses(prev => prev.map(c =>
      c.id === clauseId
        ? { ...c, mappedControlObjectiveIds: controlObjectiveIds, mappingStatus: controlObjectiveIds.length > 0 ? "confirmed" : "unmapped" }
        : c
    ));
    toast.success("映射已更新");
  }, []);

  const handleBack = useCallback(() => {
    onBackToPolicies?.() || onBack?.();
  }, [onBack, onBackToPolicies]);

  const updateColumnWidth = useCallback((column: keyof typeof columnWidths, width: number) => {
    setColumnWidths(prev => ({ ...prev, [column]: width }));
  }, []);

  const getWeightColor = (weight: number) => {
    if (weight >= 8) return "bg-red-100 text-red-700 border-red-200";
    if (weight >= 6) return "bg-orange-100 text-orange-700 border-orange-200";
    if (weight >= 4) return "bg-blue-100 text-blue-700 border-blue-200";
    return "bg-slate-100 text-slate-600 border-slate-200";
  };

  const getMappingBadge = (status: string) => {
    switch (status) {
      case "confirmed":
      case "auto_mapped":
        return <Badge className="bg-green-100 text-green-700 border-green-200">已映射</Badge>;
      case "pending_review":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">待复核</Badge>;
      default:
        return <Badge variant="secondary">未映射</Badge>;
    }
  };

  if (!policy) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-slate-400">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>未找到政策信息</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回
            </Button>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <h1 className="text-base font-semibold text-slate-800">{policy.title}</h1>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Scale className="w-3 h-3" />
                  {policy.level}
                </span>
                <span>•</span>
                <span>{clauses.length} 条款</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="搜索条款编号、标题、内容..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80 pl-9 h-9 text-sm"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>

            <div className="flex items-center bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded transition-colors ${viewMode === "list" ? "bg-white shadow text-blue-600" : "text-slate-400"}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded transition-colors ${viewMode === "grid" ? "bg-white shadow text-blue-600" : "text-slate-400"}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <Button
              variant={isBatchMode ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setIsBatchMode(!isBatchMode);
                setSelectedClauseIds(new Set());
                setExpandedClauseId(null);
              }}
            >
              {isBatchMode ? <CheckSquare className="w-4 h-4 mr-1" /> : <Square className="w-4 h-4 mr-1" />}
              批量
            </Button>

            <Button size="sm" onClick={() => setAddModalOpen(true)} className="gap-1">
              <Plus className="w-4 h-4" />
              添加
            </Button>

            <Button size="sm" onClick={() => onSave?.(clauses)} className="gap-1 bg-gradient-to-r from-blue-600 to-cyan-600">
              <Save className="w-4 h-4" />
              保存
            </Button>
          </div>
        </div>

        {/* 批量操作栏 */}
        {isBatchMode && selectedClauseIds.size > 0 && (
          <div className="flex items-center justify-between px-4 py-2 bg-blue-50 border-b border-blue-200">
            <span className="text-sm font-medium text-blue-700">
              已选择 {selectedClauseIds.size} 条条款
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-600 mr-2">批量设置权重:</span>
              {[10, 7, 5, 3].map(w => (
                <Button
                  key={w}
                  variant="outline"
                  size="sm"
                  onClick={() => handleBatchSetWeight(w)}
                  className={`h-7 text-xs ${
                    w === 10 ? "bg-red-50 text-red-600 border-red-200" :
                    w === 7 ? "bg-orange-50 text-orange-600 border-orange-200" :
                    w === 5 ? "bg-blue-50 text-blue-600 border-blue-200" :
                    "bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                >
                  {w === 10 ? "核心" : w === 7 ? "重要" : w === 5 ? "普通" : "次要"}({w})
                </Button>
              ))}
              <div className="w-px h-6 bg-blue-200 mx-2" />
              <Button variant="ghost" size="sm" onClick={() => setSelectedClauseIds(new Set())} className="h-7 text-xs text-blue-600">
                取消选择
              </Button>
            </div>
          </div>
        )}

        {/* 筛选栏 */}
        <div className="flex items-center gap-3 px-4 py-2 bg-white/50 border-b border-slate-200/50">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-500">筛选:</span>
          </div>

          <Select value={importanceFilter} onValueChange={setImportanceFilter}>
            <SelectTrigger className="w-28 h-8 text-xs">
              <SelectValue placeholder="重要性" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部重要性</SelectItem>
              <SelectItem value="critical">核心</SelectItem>
              <SelectItem value="high">重要</SelectItem>
              <SelectItem value="medium">普通</SelectItem>
              <SelectItem value="low">次要</SelectItem>
            </SelectContent>
          </Select>

          <Select value={mappingFilter} onValueChange={setMappingFilter}>
            <SelectTrigger className="w-28 h-8 text-xs">
              <SelectValue placeholder="映射状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="confirmed">已映射</SelectItem>
              <SelectItem value="unmapped">未映射</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">排序:</span>
            <Select value={sortField} onValueChange={(v) => setSortField(v as typeof sortField)}>
              <SelectTrigger className="w-28 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chapter">按章节</SelectItem>
                <SelectItem value="number">按编号</SelectItem>
                <SelectItem value="weight">按权重</SelectItem>
              </SelectContent>
            </Select>
            <button
              onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
              className="p-1.5 rounded hover:bg-slate-100"
            >
              {sortOrder === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 主内容区 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 左侧章节导航 */}
          <div className="w-56 border-r border-slate-200 bg-white/50 flex flex-col">
            <div className="p-3 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Hash className="w-4 h-4" />
                章节导航
              </h3>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                <button
                  onClick={() => setSelectedChapters([])}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                    selectedChapters.length === 0 ? "bg-blue-50 text-blue-700" : "hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  <span>全部章节</span>
                  <Badge variant="secondary" className="text-xs">{clauses.length}</Badge>
                </button>
                {chapters.map(chapter => {
                  const count = chapterGroups.get(chapter)?.length || 0;
                  const isSelected = selectedChapters.includes(chapter);
                  return (
                    <button
                      key={chapter}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedChapters(prev => prev.filter(c => c !== chapter));
                        } else {
                          setSelectedChapters(prev => [...prev, chapter]);
                        }
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                        isSelected ? "bg-blue-50 text-blue-700" : "hover:bg-slate-100 text-slate-600"
                      }`}
                    >
                      <span className="truncate">{chapter}</span>
                      <Badge variant="secondary" className="text-xs">{count}</Badge>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* 中间条款列表 */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {viewMode === "list" ? (
              <>
                <div className="flex-1 overflow-auto">
                  <table className="w-full caption-bottom text-sm" style={{ tableLayout: "fixed" }}>
                    <thead className="sticky top-0 bg-white z-10 border-b">
                      <tr>
                        {isBatchMode && (
                          <th className="w-10 px-2 py-2">
                            <Checkbox
                              checked={selectedClauseIds.size === filteredClauses.length && filteredClauses.length > 0}
                              onCheckedChange={toggleSelectAll}
                            />
                          </th>
                        )}
                        <ResizableHeader
                          width={columnWidths.chapter}
                          minWidth={60}
                          onResize={(w) => updateColumnWidth("chapter", w)}
                        >
                          章节
                        </ResizableHeader>
                        <ResizableHeader
                          width={columnWidths.number}
                          minWidth={70}
                          onResize={(w) => updateColumnWidth("number", w)}
                        >
                          编号
                        </ResizableHeader>
                        <ResizableHeader
                          width={columnWidths.content}
                          minWidth={200}
                          onResize={(w) => updateColumnWidth("content", w)}
                          className="flex-1"
                        >
                          标题/内容
                        </ResizableHeader>
                        <ResizableHeader
                          width={columnWidths.weight}
                          minWidth={60}
                          onResize={(w) => updateColumnWidth("weight", w)}
                        >
                          权重
                        </ResizableHeader>
                        <ResizableHeader
                          width={columnWidths.mapping}
                          minWidth={80}
                          onResize={(w) => updateColumnWidth("mapping", w)}
                        >
                          映射状态
                        </ResizableHeader>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClauses.map((clause) => {
                        const isExpanded = expandedClauseId === clause.id;
                        return (
                          <React.Fragment key={clause.id}>
                            <tr
                              className={`border-b transition-colors ${
                                isExpanded ? "bg-blue-50/50" : "hover:bg-slate-50"
                              } ${selectedClauseIds.has(clause.id) ? "bg-blue-50" : ""}`}
                              onClick={() => handleRowClick(clause.id)}
                            >
                              {isBatchMode && (
                                <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
                                  <Checkbox
                                    checked={selectedClauseIds.has(clause.id)}
                                    onCheckedChange={() => toggleSelectClause(clause.id)}
                                  />
                                </td>
                              )}
                              <td className="px-2 py-3" style={{ width: columnWidths.chapter }}>
                                <Badge variant="outline" className="text-xs">{clause.chapter || "未分类"}</Badge>
                              </td>
                              <td className="px-2 py-3 font-medium" style={{ width: columnWidths.number }}>
                                {clause.number}
                              </td>
                              <td className="px-2 py-3" style={{ width: columnWidths.content }}>
                                <div className="min-w-0">
                                  <TruncatedText
                                    text={clause.title || clause.number}
                                    className="font-medium text-sm"
                                  />
                                  <TruncatedText
                                    text={clause.content || ""}
                                    className="text-xs text-slate-500"
                                  />
                                </div>
                              </td>
                              <td className="px-2 py-3" style={{ width: columnWidths.weight }}>
                                <Badge className={`text-xs ${getWeightColor(clause.weight || 5)}`}>
                                  {clause.weight || 5}分
                                </Badge>
                              </td>
                              <td className="px-2 py-3" style={{ width: columnWidths.mapping }}>
                                <div className="flex items-center gap-1">
                                  {getMappingBadge(clause.mappingStatus)}
                                  {isExpanded ? <ChevronUp className="w-4 h-4 text-blue-500" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                </div>
                              </td>
                            </tr>
                            {/* 展开详情 */}
                            {isExpanded && !isBatchMode && (
                              <tr className="bg-blue-50/30 border-b">
                                <td colSpan={isBatchMode ? 6 : 5} className="p-0">
                                  <div className="px-4 py-4 space-y-4">
                                    <div>
                                      <h4 className="text-sm font-semibold text-slate-700 mb-2">条款内容</h4>
                                      <p className="text-sm text-slate-600 bg-white p-3 rounded-lg border leading-relaxed">
                                        {clause.content}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        size="sm"
                                        onClick={(e) => openEditSheet(clause, e)}
                                        className="gap-1"
                                      >
                                        <Edit3 className="w-4 h-4" />
                                        编辑条款
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => handleViewCOUs(clause.id, e)}
                                        className="gap-1"
                                      >
                                        <Eye className="w-4 h-4" />
                                        查看COU
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => handleViewControlObjectives(clause.id, e)}
                                        className="gap-1"
                                      >
                                        <Target className="w-4 h-4" />
                                        查看控制目标
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => handleOpenMapping(clause, e)}
                                        className="gap-1"
                                      >
                                        <MapPin className="w-4 h-4" />
                                        映射控制目标
                                      </Button>
                                      <div className="flex-1" />
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => handleDelete(clause.id, e)}
                                        className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        删除
                                      </Button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-2 border-t border-slate-200 bg-white/50 text-xs text-slate-500">
                  显示 {filteredClauses.length} 条条款{searchQuery && ` (搜索 "${searchQuery}")`}
                </div>
              </>
            ) : (
              <ScrollArea className="flex-1 p-4">
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                  {filteredClauses.map((clause) => {
                    const isExpanded = expandedClauseId === clause.id;
                    return (
                      <div
                        key={clause.id}
                        className={`rounded-xl border bg-white transition-all cursor-pointer overflow-hidden ${
                          selectedClauseIds.has(clause.id) ? "border-blue-400 ring-1 ring-blue-400" : "border-slate-200"
                        } ${isExpanded ? "ring-1 ring-blue-400" : ""}`}
                        onClick={() => handleRowClick(clause.id)}
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {isBatchMode && (
                                <Checkbox
                                  checked={selectedClauseIds.has(clause.id)}
                                  onCheckedChange={() => toggleSelectClause(clause.id)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              )}
                              <Badge variant="outline" className="text-xs">{clause.chapter}</Badge>
                              <span className="font-medium text-sm">{clause.number}</span>
                            </div>
                            <Badge className={`text-xs ${getWeightColor(clause.weight || 5)}`}>
                              {clause.weight}分
                            </Badge>
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-sm font-medium mb-1 truncate">{clause.title || clause.number}</p>
                            </TooltipTrigger>
                            <TooltipContent><p>{clause.title || clause.number}</p></TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-xs text-slate-500 line-clamp-2 mb-3">{clause.content}</p>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm"><p>{clause.content}</p></TooltipContent>
                          </Tooltip>
                          <div className="flex items-center justify-between">
                            {getMappingBadge(clause.mappingStatus)}
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-blue-500" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                          </div>
                        </div>
                        {/* 展开详情 */}
                        {isExpanded && !isBatchMode && (
                          <div className="px-4 pb-4 pt-0 border-t border-slate-100 bg-blue-50/30">
                            <div className="pt-3 space-y-3">
                              <p className="text-sm text-slate-600 bg-white p-3 rounded-lg border leading-relaxed">
                                {clause.content}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                <Button size="sm" onClick={(e) => openEditSheet(clause, e)} className="gap-1">
                                  <Edit3 className="w-4 h-4" />编辑
                                </Button>
                                <Button variant="outline" size="sm" onClick={(e) => handleViewCOUs(clause.id, e)} className="gap-1">
                                  <Eye className="w-4 h-4" />查看COU
                                </Button>
                                <Button variant="outline" size="sm" onClick={(e) => handleViewControlObjectives(clause.id, e)} className="gap-1">
                                  <Target className="w-4 h-4" />查看控制目标
                                </Button>
                                <Button variant="outline" size="sm" onClick={(e) => handleOpenMapping(clause, e)} className="gap-1">
                                  <MapPin className="w-4 h-4" />映射
                                </Button>
                                <Button variant="ghost" size="sm" onClick={(e) => handleDelete(clause.id, e)} className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50">
                                  <Trash2 className="w-4 h-4" />删除
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* 右侧统计面板 */}
          <div className="w-64 border-l border-slate-200 bg-white/50 p-4 space-y-4 overflow-y-auto">
            <div>
              <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" />
                条款统计
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-xs text-blue-700">总条款</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-green-600">{stats.mapped}</div>
                  <div className="text-xs text-green-700">已映射</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-orange-600">{stats.highWeight}</div>
                  <div className="text-xs text-orange-700">高权重</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-slate-600">{stats.unmapped}</div>
                  <div className="text-xs text-slate-700">未映射</div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Goal className="w-4 h-4 text-purple-500" />
                映射进度
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">完成度</span>
                  <span className="font-medium">{Math.round((stats.mapped / stats.total) * 100)}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                    style={{ width: `${(stats.mapped / stats.total) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-800 mb-3">快捷操作</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs" onClick={() => toast.success("AI分析中...")}>
                  <Sparkles className="w-3.5 h-3.5 mr-2 text-amber-500" />
                  AI推荐映射
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs" onClick={() => toast.success("AI分析中...")}>
                  <Sparkles className="w-3.5 h-3.5 mr-2 text-amber-500" />
                  AI推荐权重
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(clauses, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `clauses-${policy.id}.json`;
                    a.click();
                    toast.success("条款已导出");
                  }}
                >
                  <Download className="w-3.5 h-3.5 mr-2" />
                  导出条款
                </Button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-800 mb-3">章节分布</h4>
              <div className="space-y-1">
                {chapters.slice(0, 6).map(chapter => (
                  <div key={chapter} className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 truncate">{chapter}</span>
                    <Badge variant="secondary" className="text-xs">{chapterGroups.get(chapter)?.length || 0}</Badge>
                  </div>
                ))}
                {chapters.length > 6 && (
                  <div className="text-xs text-slate-400 text-center pt-1">+{chapters.length - 6} 更多章节</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 编辑条款滑框 */}
        <Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-lg p-0">
            {editingClause && (
              <div className="h-full flex flex-col">
                <SheetHeader className="px-6 py-4 border-b">
                  <SheetTitle className="flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-blue-500" />
                    编辑条款
                  </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-auto p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">章节</label>
                      <Input
                        value={editingClause.chapter || ""}
                        onChange={(e) => setEditingClause({ ...editingClause, chapter: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">编号</label>
                      <Input
                        value={editingClause.number || ""}
                        onChange={(e) => setEditingClause({ ...editingClause, number: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">标题</label>
                    <Input
                      value={editingClause.title || ""}
                      onChange={(e) => setEditingClause({ ...editingClause, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">内容</label>
                    <textarea
                      value={editingClause.content || ""}
                      onChange={(e) => setEditingClause({ ...editingClause, content: e.target.value })}
                      className="w-full min-h-[200px] p-3 rounded-md border border-input bg-transparent text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">权重 ({editingClause.weight})</label>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={editingClause.weight || 5}
                      onChange={(e) => setEditingClause({ ...editingClause, weight: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>次要</span><span>普通</span><span>核心</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditSheetOpen(false)}>取消</Button>
                  <Button onClick={handleSaveEdit} className="bg-gradient-to-r from-blue-600 to-cyan-600">
                    <Save className="w-4 h-4 mr-1" />保存
                  </Button>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* 添加条款模态框 */}
        <ClauseAddModal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          policyId={policy.id}
          policyTitle={policy.title}
          existingClauses={clauses}
          onAddClauses={(newClauses) => {
            const clausesWithId = newClauses.map((c) => ({
              ...c,
              id: `clause-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            }));
            setClauses((prev) => [...prev, ...clausesWithId]);
            toast.success(`成功添加 ${clausesWithId.length} 条条款`);
            setAddModalOpen(false);
          }}
        />

        {/* 映射模态框 */}
        <ClauseMappingModal
          clause={selectedClauseForMapping}
          isOpen={mappingModalOpen}
          onClose={() => setMappingModalOpen(false)}
          onConfirmMapping={handleConfirmMapping}
        />
      </div>
    </TooltipProvider>
  );
}

export default ClauseEditor;
