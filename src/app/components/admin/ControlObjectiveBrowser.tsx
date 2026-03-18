// ============ 控制目标浏览器 ============
// 核心解耦层 - 管理标准控制目标库
// 展示 ControlObjective 与 Clause/COU 的映射关系
// 支持：批量操作、右侧详情面板、条款联动、快速筛选

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Plus,
  Search,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  Target,
  Layers,
  Scale,
  Link2,
  Sparkles,
  Filter,
  X,
  ArrowLeft,
  FileSearch,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { ScrollArea } from "../ui/scroll-area";
import { ControlObjectiveCard } from "./ControlObjectiveCard";
import { ControlObjectiveDetail } from "./ControlObjectiveDetail";
import { ControlObjectiveForm } from "./ControlObjectiveForm";
import { ControlObjectiveBatchBar } from "./ControlObjectiveBatchBar";
import { ControlObjectiveDetailPanel } from "./ControlObjectiveDetailPanel";
import { ControlObjectiveMappingManager } from "./ControlObjectiveMappingManager";
import { toast } from "sonner";
import type { ControlObjective, ControlCategory, Clause } from "../../types";

// 模拟数据
import { MOCK_CONTROL_OBJECTIVES, MOCK_CLAUSES, MOCK_POLICIES } from "../../data/mockData";

// 视图模式
type BrowserView = "list" | "detail" | "create" | "edit" | "mapping";

// 视图类型
type ViewMode = "grid" | "list";

// 分页配置
const PAGE_SIZE_OPTIONS = [20, 50, 100];

// 控制类别配置
const CATEGORY_CONFIG: Record<ControlCategory, { color: string; bg: string; icon: React.ReactNode }> = {
  "预防性": { color: "text-green-600", bg: "bg-green-100", icon: <Sparkles className="w-3 h-3" /> },
  "检测性": { color: "text-blue-600", bg: "bg-blue-100", icon: <Search className="w-3 h-3" /> },
  "纠正性": { color: "text-orange-600", bg: "bg-orange-100", icon: <Target className="w-3 h-3" /> },
  "管理性": { color: "text-purple-600", bg: "bg-purple-100", icon: <Layers className="w-3 h-3" /> },
  "技术性": { color: "text-cyan-600", bg: "bg-cyan-100", icon: <Scale className="w-3 h-3" /> },
  "物理性": { color: "text-gray-600", bg: "bg-gray-100", icon: <Link2 className="w-3 h-3" /> },
};

// 快速筛选配置
const QUICK_FILTERS = [
  { id: "high-weight", label: "高权重", icon: TrendingUp, color: "red", minWeight: 7 },
  { id: "pending", label: "待审", icon: Clock, color: "yellow", status: "pending" },
  { id: "unmapped", label: "未映射", icon: AlertCircle, color: "gray", unmapped: true },
  { id: "recent", label: "最近更新", icon: Clock, color: "blue", recent: true },
];

interface ControlObjectiveBrowserProps {
  onControlObjectiveClick?: (co: ControlObjective) => void;
  onControlObjectiveSelect?: (co: ControlObjective) => void;
  selectedControlObjectiveId?: string;
  onNavigateToClause?: (clauseId: string) => void;
  onNavigateToPolicy?: (policyId: string) => void;
  // 条款联动
  initialClauseId?: string;
  onBackToClauses?: () => void;
}

export function ControlObjectiveBrowser({
  onControlObjectiveClick,
  onControlObjectiveSelect,
  selectedControlObjectiveId,
  onNavigateToClause,
  onNavigateToPolicy,
  initialClauseId,
  onBackToClauses,
}: ControlObjectiveBrowserProps) {
  // 浏览器视图状态
  const [browserView, setBrowserView] = useState<BrowserView>("list");
  const [selectedCO, setSelectedCO] = useState<ControlObjective | null>(null);

  // 列表视图状态
  const [listViewMode, setListViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // 筛选状态
  const [filters, setFilters] = useState({
    search: "",
    categories: [] as ControlCategory[],
    domains: [] as string[],
    importance: [] as string[],
    mappingStatus: [] as string[],
  });

  // 快速筛选
  const [quickFilter, setQuickFilter] = useState<string | null>(null);

  // 批量选择
  const [selectedCOIds, setSelectedCOIds] = useState<string[]>([]);

  // 右侧详情面板
  const [showDetailPanel, setShowDetailPanel] = useState(false);

  // 数据
  const [allControlObjectives, setAllControlObjectives] = useState<ControlObjective[]>(MOCK_CONTROL_OBJECTIVES);

  // 当前条款信息（用于条款联动）
  const currentClause = useMemo(() => {
    if (!initialClauseId) return null;
    const clause = MOCK_CLAUSES.find((c) => c.id === initialClauseId);
    const policy = clause ? MOCK_POLICIES.find((p) => p.id === clause.policyId) : null;
    return clause && policy ? { clause, policy } : null;
  }, [initialClauseId]);

  // 筛选逻辑
  const filteredControlObjectives = useMemo(() => {
    return allControlObjectives.filter((co) => {
      // 搜索筛选
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchSearch =
          co.name?.toLowerCase().includes(searchLower) ||
          co.code?.toLowerCase().includes(searchLower) ||
          co.description?.toLowerCase().includes(searchLower);
        if (!matchSearch) return false;
      }

      // 类别筛选
      if (filters.categories.length > 0 && !filters.categories.includes(co.category)) {
        return false;
      }

      // 领域筛选
      if (filters.domains.length > 0 && !filters.domains.includes(co.domain)) {
        return false;
      }

      // 重要性筛选
      if (filters.importance.length > 0 && !filters.importance.includes(co.importance)) {
        return false;
      }

      // 条款联动筛选
      if (initialClauseId) {
        const isMappedToClause = co.mappedClauses.some((m) => m.clauseId === initialClauseId);
        if (!isMappedToClause) return false;
      }

      // 快速筛选
      if (quickFilter) {
        const filter = QUICK_FILTERS.find((f) => f.id === quickFilter);
        if (filter) {
          if (filter.minWeight && co.baseWeight < filter.minWeight) return false;
          if (filter.status && co.status !== filter.status) return false;
          if (filter.unmapped && co.mappedClauseCount > 0) return false;
          if (filter.recent) {
            const updatedAt = new Date(co.updatedAt);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            if (updatedAt < sevenDaysAgo) return false;
          }
        }
      }

      return true;
    });
  }, [allControlObjectives, filters, initialClauseId, quickFilter]);

  // 分页逻辑
  const totalPages = Math.ceil(filteredControlObjectives.length / pageSize);
  const paginatedControlObjectives = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredControlObjectives.slice(start, end);
  }, [filteredControlObjectives, page, pageSize]);

  // 统计数据
  const stats = useMemo(() => {
    const total = allControlObjectives.length;
    const active = allControlObjectives.filter((co) => co.status === "active").length;
    const withMappings = allControlObjectives.filter((co) => co.mappedClauseCount > 0).length;
    const totalMappings = allControlObjectives.reduce((sum, co) => sum + co.mappedClauseCount, 0);
    return { total, active, withMappings, totalMappings };
  }, [allControlObjectives]);

  // 领域列表（去重）
  const domains = useMemo(() => {
    return [...new Set(allControlObjectives.map((co) => co.domain))];
  }, [allControlObjectives]);

  // 处理点击 - 显示右侧详情面板
  const handleControlObjectiveClick = useCallback(
    (co: ControlObjective) => {
      setSelectedCO(co);
      setShowDetailPanel(true);
      onControlObjectiveClick?.(co);
    },
    [onControlObjectiveClick]
  );

  // 处理选择（批量操作）
  const handleSelect = useCallback((co: ControlObjective, selected: boolean) => {
    setSelectedCOIds((prev) => {
      if (selected) {
        return [...prev, co.id];
      }
      return prev.filter((id) => id !== co.id);
    });
  }, []);

  // 全选/取消全选
  const handleSelectAll = useCallback(() => {
    if (selectedCOIds.length === paginatedControlObjectives.length) {
      setSelectedCOIds([]);
    } else {
      setSelectedCOIds(paginatedControlObjectives.map((co) => co.id));
    }
  }, [paginatedControlObjectives, selectedCOIds.length]);

  // 获取选中的控制目标对象
  const selectedCOs = useMemo(() => {
    return allControlObjectives.filter((co) => selectedCOIds.includes(co.id));
  }, [allControlObjectives, selectedCOIds]);

  // 清除选择
  const handleClearSelection = useCallback(() => {
    setSelectedCOIds([]);
  }, []);

  // 批量更新
  const handleBatchUpdate = useCallback((updates: Partial<ControlObjective>) => {
    setAllControlObjectives((prev) =>
      prev.map((co) => (selectedCOIds.includes(co.id) ? { ...co, ...updates } : co))
    );
    handleClearSelection();
  }, [selectedCOIds]);

  // 批量删除
  const handleBatchDelete = useCallback(() => {
    setAllControlObjectives((prev) => prev.filter((co) => !selectedCOIds.includes(co.id)));
    handleClearSelection();
  }, [selectedCOIds]);

  // 批量导出
  const handleBatchExport = useCallback(() => {
    const data = selectedCOs.map((co) => ({
      code: co.code,
      name: co.name,
      category: co.category,
      importance: co.importance,
    }));
    console.log("Export data:", data);
    handleClearSelection();
  }, [selectedCOs]);

  // 处理创建
  const handleCreate = () => {
    setBrowserView("create");
  };

  // 处理编辑
  const handleEdit = (co: ControlObjective) => {
    setSelectedCO(co);
    setBrowserView("edit");
  };

  // 处理删除
  const handleDelete = (id: string) => {
    setAllControlObjectives((prev) => prev.filter((co) => co.id !== id));
    setShowDetailPanel(false);
    toast.success("控制目标已删除");
  };

  // 处理表单提交
  const handleFormSubmit = (co: ControlObjective) => {
    if (browserView === "create") {
      setAllControlObjectives((prev) => [co, ...prev]);
      toast.success(`控制目标 ${co.code} 创建成功`);
    } else {
      setAllControlObjectives((prev) =>
        prev.map((item) => (item.id === co.id ? co : item))
      );
      toast.success(`控制目标 ${co.code} 更新成功`);
    }
    setBrowserView("list");
  };

  // 返回列表
  const handleBackToList = () => {
    setBrowserView("list");
    setSelectedCO(null);
  };

  // 打开映射管理器
  const handleOpenMapping = (co: ControlObjective) => {
    setSelectedCO(co);
    setBrowserView("mapping");
  };

  // 保存映射关系
  const handleSaveMappings = (mappings: any[]) => {
    if (selectedCO) {
      setAllControlObjectives((prev) =>
        prev.map((co) =>
          co.id === selectedCO.id
            ? { ...co, mappedClauses: mappings, mappedClauseCount: mappings.length }
            : co
        )
      );
      setSelectedCO((prev) =>
        prev ? { ...prev, mappedClauses: mappings, mappedClauseCount: mappings.length } : null
      );
    }
  };

  // 重置筛选
  const handleResetFilters = () => {
    setFilters({
      search: "",
      categories: [],
      domains: [],
      importance: [],
      mappingStatus: [],
    });
    setQuickFilter(null);
    setPage(1);
  };

  // 清除条款筛选
  const handleClearClauseFilter = () => {
    onBackToClauses?.();
  };

  // 显示全部控制目标
  const handleShowAll = () => {
    handleResetFilters();
  };

  // 当筛选条件变化时重置页码
  useEffect(() => {
    setPage(1);
  }, [filters, pageSize, quickFilter]);

  // 渲染详情视图
  if (browserView === "detail" && selectedCO) {
    return (
      <ControlObjectiveDetail
        controlObjective={selectedCO}
        onBack={handleBackToList}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onNavigateToClause={onNavigateToClause}
        onNavigateToPolicy={onNavigateToPolicy}
      />
    );
  }

  // 渲染创建视图
  if (browserView === "create") {
    return (
      <ControlObjectiveForm
        mode="create"
        onSubmit={handleFormSubmit}
        onCancel={handleBackToList}
      />
    );
  }

  // 渲染编辑视图
  if (browserView === "edit" && selectedCO) {
    return (
      <ControlObjectiveForm
        mode="edit"
        initialData={selectedCO}
        onSubmit={handleFormSubmit}
        onCancel={handleBackToList}
      />
    );
  }

  // 渲染映射管理视图
  if (browserView === "mapping" && selectedCO) {
    return (
      <ControlObjectiveMappingManager
        controlObjective={selectedCO}
        onClose={handleBackToList}
        onSave={handleSaveMappings}
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* 条款联动提示条 */}
      {currentClause && (
        <div className="px-6 py-3 bg-purple-50 border-b border-purple-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-purple-100 rounded-lg">
                <FileSearch className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-600">当前查看条款：</span>
                  <span className="font-medium text-slate-800">{currentClause.policy.title}</span>
                  <span className="text-slate-400">·</span>
                  <span className="font-medium text-slate-800">
                    {currentClause.clause.number}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                  {currentClause.clause.content?.substring(0, 100)}...
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleShowAll}>
                显示全部控制目标
              </Button>
              {onBackToClauses && (
                <Button variant="ghost" size="sm" onClick={handleClearClauseFilter}>
                  返回条款列表
                </Button>
              )}
              <button
                onClick={handleClearClauseFilter}
                className="p-1 hover:bg-purple-100 rounded text-purple-400 hover:text-purple-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-800">控制目标管理</h1>
              <p className="text-xs text-slate-500">
                共 {stats.total} 个控制目标 · {stats.withMappings} 个已映射 · {stats.totalMappings} 条法规映射
                {initialClauseId && " · 当前筛选条款关联控制目标"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* 视图切换 */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <Button
              variant={listViewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setListViewMode("grid")}
              className="h-8 w-8 p-0"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={listViewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setListViewMode("list")}
              className="h-8 w-8 p-0"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            新增控制目标
          </Button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧筛选面板 */}
        <div className="w-64 border-r border-slate-200/50 bg-white/50 p-4 overflow-y-auto">
          <div className="space-y-6">
            {/* 快速筛选 */}
            <div>
              <label className="text-xs font-medium text-slate-600 mb-3 block">快速筛选</label>
              <div className="space-y-1">
                {QUICK_FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setQuickFilter(quickFilter === filter.id ? null : filter.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                      quickFilter === filter.id
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <filter.icon className={`w-4 h-4 text-${filter.color}-500`} />
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 搜索 */}
            <div>
              <label className="text-xs font-medium text-slate-600 mb-2 block">搜索</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="搜索控制目标..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-9 h-9 text-sm"
                />
              </div>
            </div>

            {/* 控制类别 */}
            <div>
              <label className="text-xs font-medium text-slate-600 mb-2 block">控制类别</label>
              <div className="space-y-1">
                {(Object.keys(CATEGORY_CONFIG) as ControlCategory[]).map((category) => (
                  <label
                    key={category}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-100 cursor-pointer"
                  >
                    <Checkbox
                      checked={filters.categories.includes(category)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilters({ ...filters, categories: [...filters.categories, category] });
                        } else {
                          setFilters({
                            ...filters,
                            categories: filters.categories.filter((c) => c !== category),
                          });
                        }
                      }}
                    />
                    <span className="text-sm text-slate-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 控制域 */}
            <div>
              <label className="text-xs font-medium text-slate-600 mb-2 block">控制域</label>
              <div className="space-y-1">
                {domains.map((domain) => (
                  <label
                    key={domain}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-100 cursor-pointer"
                  >
                    <Checkbox
                      checked={filters.domains.includes(domain)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilters({ ...filters, domains: [...filters.domains, domain] });
                        } else {
                          setFilters({
                            ...filters,
                            domains: filters.domains.filter((d) => d !== domain),
                          });
                        }
                      }}
                    />
                    <span className="text-sm text-slate-700">{domain}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 重要性 */}
            <div>
              <label className="text-xs font-medium text-slate-600 mb-2 block">重要性</label>
              <div className="space-y-1">
                {[
                  { value: "critical", label: "核心" },
                  { value: "high", label: "高" },
                  { value: "medium", label: "中" },
                  { value: "low", label: "低" },
                ].map((level) => (
                  <label
                    key={level.value}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-100 cursor-pointer"
                  >
                    <Checkbox
                      checked={filters.importance.includes(level.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilters({ ...filters, importance: [...filters.importance, level.value] });
                        } else {
                          setFilters({
                            ...filters,
                            importance: filters.importance.filter((i) => i !== level.value),
                          });
                        }
                      }}
                    />
                    <span className="text-sm text-slate-700">{level.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 重置按钮 */}
            <Button variant="outline" size="sm" className="w-full" onClick={handleResetFilters}>
              <Filter className="w-3 h-3 mr-1" />
              重置筛选
            </Button>
          </div>
        </div>

        {/* 右侧内容区 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 统计卡片 */}
          <div className="grid grid-cols-4 gap-4 p-4">
            <Card className="bg-white/60">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
                <div className="text-xs text-slate-500">控制目标总数</div>
              </CardContent>
            </Card>
            <Card className="bg-white/60">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                <div className="text-xs text-slate-500">生效中</div>
              </CardContent>
            </Card>
            <Card className="bg-white/60">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{stats.withMappings}</div>
                <div className="text-xs text-slate-500">已映射法规</div>
              </CardContent>
            </Card>
            <Card className="bg-white/60">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">{stats.totalMappings}</div>
                <div className="text-xs text-slate-500">总映射关系</div>
              </CardContent>
            </Card>
          </div>

          {/* 列表/网格内容 */}
          <div className="flex-1 overflow-y-auto p-4">
            {paginatedControlObjectives.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>暂无匹配的控制目标</p>
                </div>
              </div>
            ) : listViewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {paginatedControlObjectives.map((co) => (
                  <div
                    key={co.id}
                    className={`relative group cursor-pointer transition-all ${
                      selectedCOIds.includes(co.id) ? "ring-2 ring-blue-500 rounded-xl" : ""
                    }`}
                    onClick={() => handleControlObjectiveClick(co)}
                  >
                    {/* 选择框 */}
                    <div
                      className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={selectedCOIds.includes(co.id)}
                        onCheckedChange={(checked) => handleSelect(co, checked as boolean)}
                      />
                    </div>
                    <ControlObjectiveCard
                      controlObjective={co}
                      isSelected={co.id === selectedControlObjectiveId}
                      onClick={() => handleControlObjectiveClick(co)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {/* 表头 */}
                <div className="flex items-center gap-4 px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium text-slate-600">
                  <Checkbox
                    checked={
                      selectedCOIds.length === paginatedControlObjectives.length &&
                      paginatedControlObjectives.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="w-32">编码</span>
                  <span className="flex-1">名称</span>
                  <span className="w-24">类别</span>
                  <span className="w-20">映射</span>
                  <span className="w-20">场景</span>
                </div>
                {paginatedControlObjectives.map((co) => (
                  <div
                    key={co.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedCOIds.includes(co.id)
                        ? "bg-blue-50 border-blue-300"
                        : co.id === selectedControlObjectiveId
                        ? "bg-blue-50 border-blue-300"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                    onClick={() => handleControlObjectiveClick(co)}
                  >
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedCOIds.includes(co.id)}
                        onCheckedChange={(checked) => handleSelect(co, checked as boolean)}
                      />
                    </div>
                    <Badge className={`w-28 justify-center ${CATEGORY_CONFIG[co.category].bg} ${CATEGORY_CONFIG[co.category].color} border-0`}>
                      {co.code}
                    </Badge>
                    <span className="flex-1 font-medium text-slate-800 truncate">{co.name}</span>
                    <span className="w-24 text-sm text-slate-600">{co.category}</span>
                    <span className="w-20 text-sm text-slate-500">{co.mappedClauseCount}</span>
                    <span className="w-20 text-sm text-slate-500">{co.scenarioCount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 分页 */}
          <div className="flex items-center justify-between px-4 py-3 bg-white/60 border-t border-slate-200/50">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">
                显示 {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, filteredControlObjectives.length)} 共{" "}
                {filteredControlObjectives.length} 条
              </span>
              <Select
                value={pageSize.toString()}
                onValueChange={(v) => setPageSize(Number(v))}
              >
                <SelectTrigger className="w-20 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}条/页
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-slate-600">
                {page} / {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages || totalPages === 0}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* 右侧详情面板 */}
        {showDetailPanel && (
          <ControlObjectiveDetailPanel
            controlObjective={selectedCO}
            onClose={() => setShowDetailPanel(false)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onNavigateToDetail={(co) => {
              setSelectedCO(co);
              setBrowserView("detail");
            }}
            onNavigateToClause={onNavigateToClause}
            onNavigateToPolicy={onNavigateToPolicy}
          />
        )}
      </div>

      {/* 批量操作工具栏 */}
      <ControlObjectiveBatchBar
        selectedCOs={selectedCOs}
        onClearSelection={handleClearSelection}
        onBatchUpdate={handleBatchUpdate}
        onBatchDelete={handleBatchDelete}
        onBatchExport={handleBatchExport}
      />
    </div>
  );
}

export default ControlObjectiveBrowser;
