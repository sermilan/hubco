// ============ 政策浏览器 ============
// 新设计方案 - 宏观视图
// 卡片网格 + 左侧筛选面板，适合大规模数据管理

import React, { useState, useMemo, useCallback } from "react";
import {
  Plus,
  Upload,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  FileText,
  Building2,
  Scale,
  Sparkles,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { PolicyCard } from "./PolicyCard";
import { FilterPanel } from "./FilterPanel";
import { PolicyCreateFlexible } from "./PolicyCreateFlexible";
import { PolicyImportPage } from "./PolicyImportPage";
import { toast } from "sonner";
import type { Policy } from "../../types";

// 模拟数据导入 - 实际项目中应该从API获取
import { MOCK_POLICIES } from "../../data/mockData";

// 视图类型
 type ViewMode = "grid" | "list";

// 分页配置
const PAGE_SIZE_OPTIONS = [20, 50, 100];

interface PolicyBrowserProps {
  onPolicyClick?: (policy: Policy) => void;
  onPolicySelect?: (policy: Policy) => void;
  selectedPolicyId?: string;
  /** 跳转到条款编辑器的回调 */
  onNavigateToClauses?: (policyId: string) => void;
}

export function PolicyBrowser({
  onPolicyClick,
  onPolicySelect,
  selectedPolicyId,
  onNavigateToClauses,
}: PolicyBrowserProps) {
  // 视图状态
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isImportSheetOpen, setIsImportSheetOpen] = useState(false);

  // 政策数据状态（支持导入新增）
  const [allPolicies, setAllPolicies] = useState<Policy[]>(MOCK_POLICIES);

  // 筛选状态
  const [filters, setFilters] = useState({
    search: "",
    levels: [] as string[],
    industries: [] as string[],
    years: [] as string[],
    tags: [] as string[],
  });

  // 筛选逻辑
  const filteredPolicies = useMemo(() => {
    return allPolicies.filter((policy) => {
      // 搜索筛选
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchSearch =
          policy.title?.toLowerCase().includes(searchLower) ||
          policy.documentNumber?.toLowerCase().includes(searchLower) ||
          policy.summary?.toLowerCase().includes(searchLower);
        if (!matchSearch) return false;
      }

      // 级别筛选
      if (filters.levels.length > 0 && !filters.levels.includes(policy.level)) {
        return false;
      }

      // 行业筛选
      if (filters.industries.length > 0) {
        const hasIndustry = policy.industries?.some((ind) =>
          filters.industries.includes(ind)
        );
        if (!hasIndustry) return false;
      }

      // 年份筛选
      if (filters.years.length > 0) {
        const policyYear = new Date(policy.publishDate).getFullYear().toString();
        if (!filters.years.includes(policyYear)) return false;
      }

      return true;
    });
  }, [allPolicies, filters]);

  // 分页逻辑
  const totalPages = Math.ceil(filteredPolicies.length / pageSize);
  const paginatedPolicies = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredPolicies.slice(start, end);
  }, [filteredPolicies, page, pageSize]);

  // 处理政策点击
  const handlePolicyClick = useCallback(
    (policy: Policy) => {
      if (onPolicyClick) {
        onPolicyClick(policy);
      } else if (onPolicySelect) {
        onPolicySelect(policy);
      } else if (onNavigateToClauses) {
        // 跳转到条款编辑器
        onNavigateToClauses(policy.id);
      } else {
        // 默认行为：提示
        toast.success(`正在打开《${policy.title}》的条款编辑...`);
      }
    },
    [onPolicyClick, onPolicySelect, onNavigateToClauses, toast]
  );

  // 处理新增政策
  const handleAddPolicy = () => {
    setIsCreateSheetOpen(true);
  };

  // 处理创建成功
  const handleCreateSuccess = (newPolicy: Policy) => {
    setAllPolicies((prev) => [newPolicy, ...prev]);
    setIsCreateSheetOpen(false);
    toast.success(`政策《${newPolicy.title}》创建成功！`);
  };

  // 处理批量导入
  const handleImport = () => {
    setIsImportSheetOpen(true);
  };

  // 处理导入成功
  const handleImportSuccess = (newPolicies: Policy[]) => {
    setAllPolicies((prev) => [...newPolicies, ...prev]);
    setIsImportSheetOpen(false);
    toast.success(`成功导入 ${newPolicies.length} 条政策！`);
  };

  // 当筛选条件变化时重置页码
  React.useEffect(() => {
    setPage(1);
  }, [filters, pageSize]);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-800">
                政策文件管理
              </h1>
              <p className="text-xs text-slate-500">
                共 {filteredPolicies.length} 条政策
                {filteredPolicies.length !== allPolicies.length &&
                  ` (筛选自 ${allPolicies.length} 条)`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* 视图切换 */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-blue-100 text-blue-600"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-blue-100 text-blue-600"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* 操作按钮 */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleImport}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            导入
          </Button>
          <Button
            size="sm"
            onClick={handleAddPolicy}
            className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            <Plus className="w-4 h-4" />
            新增政策
          </Button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧筛选面板 */}
        <div className="w-72 p-4 overflow-y-auto">
          <FilterPanel
            policies={allPolicies}
            filters={filters}
            onFiltersChange={setFilters}
            className="h-full"
          />
        </div>

        {/* 右侧内容区 */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          {/* 网格/列表视图 */}
          <div className="flex-1 overflow-y-auto">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {paginatedPolicies.map((policy) => (
                  <PolicyCard
                    key={policy.id}
                    policy={policy}
                    onClick={() => handlePolicyClick(policy)}
                    isSelected={policy.id === selectedPolicyId}
                  />
                ))}
              </div>
            ) : (
              <PolicyListView
                policies={paginatedPolicies}
                onPolicyClick={handlePolicyClick}
                selectedPolicyId={selectedPolicyId}
              />
            )}

            {/* 空状态 */}
            {filteredPolicies.length === 0 && (
              <Card className="h-64 flex items-center justify-center">
                <CardContent className="text-center text-slate-400">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-600 font-medium">暂无匹配的政策</p>
                  <p className="text-sm mt-1">请调整筛选条件或搜索关键词</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 分页栏 */}
          {filteredPolicies.length > 0 && (
            <div className="mt-4 flex items-center justify-between bg-white rounded-lg border border-slate-200 p-3">
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500">
                  第 {(page - 1) * pageSize + 1} -{" "}
                  {Math.min(page * pageSize, filteredPolicies.length)} 条，共{" "}
                  {filteredPolicies.length} 条
                </span>

                {/* 每页条数选择 */}
                <Select
                  value={pageSize.toString()}
                  onValueChange={(v) => setPageSize(Number(v))}
                >
                  <SelectTrigger className="w-[100px] h-8 text-xs">
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

              {/* 分页按钮 */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {/* 页码显示 */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                          page === pageNum
                            ? "bg-blue-600 text-white"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 新增政策 Sheet */}
      <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-5xl p-0">
          <PolicyCreateFlexible
            onCancel={() => setIsCreateSheetOpen(false)}
            onSuccess={handleCreateSuccess}
          />
        </SheetContent>
      </Sheet>

      {/* 批量导入 Sheet */}
      <Sheet open={isImportSheetOpen} onOpenChange={setIsImportSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-5xl p-0">
          <PolicyImportPage
            onCancel={() => setIsImportSheetOpen(false)}
            onSuccess={handleImportSuccess}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

// 列表视图组件
interface PolicyListViewProps {
  policies: Policy[];
  onPolicyClick: (policy: Policy) => void;
  selectedPolicyId?: string;
}

function PolicyListView({
  policies,
  onPolicyClick,
  selectedPolicyId,
}: PolicyListViewProps) {
  const levelColors: Record<string, string> = {
    法律: "bg-red-100 text-red-700",
    行政法规: "bg-orange-100 text-orange-700",
    部门规章: "bg-blue-100 text-blue-700",
    国家标准: "bg-green-100 text-green-700",
    行业标准: "bg-purple-100 text-purple-700",
    地方性法规: "bg-cyan-100 text-cyan-700",
    规范性文件: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">
              政策名称
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">
              级别
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">
              行业
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">
              条款数
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">
              权重
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">
              发布时间
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {policies.map((policy) => (
            <tr
              key={policy.id}
              onClick={() => onPolicyClick(policy)}
              className={`cursor-pointer transition-colors hover:bg-slate-50 ${
                policy.id === selectedPolicyId ? "bg-blue-50" : ""
              }`}
            >
              <td className="px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-slate-800">
                    {policy.title}
                  </div>
                  {policy.documentNumber && (
                    <div className="text-xs text-slate-500 mt-0.5">
                      {policy.documentNumber}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <Badge
                  variant="outline"
                  className={`text-xs ${levelColors[policy.level] || "bg-gray-100 text-gray-700"}`}
                >
                  {policy.level}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {policy.industries?.slice(0, 2).map((ind) => (
                    <span key={ind} className="text-xs text-slate-600">
                      {ind}
                    </span>
                  ))}
                  {policy.industries && policy.industries.length > 2 && (
                    <span className="text-xs text-slate-400">
                      +{policy.industries.length - 2}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="text-sm text-slate-600">
                  {policy.clauses?.length || 0}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="text-sm font-medium text-amber-600">
                  {policy.baseWeight}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="text-sm text-slate-500">
                  {new Date(policy.publishDate).toLocaleDateString("zh-CN")}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PolicyBrowser;
