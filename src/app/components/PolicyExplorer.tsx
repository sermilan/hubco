import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "./ui/sheet";
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  Building2,
  Tag,
  Tags,
  ArrowRight,
  X,
  Bookmark,
  ExternalLink,
  Scale,
  Hash,
  Globe,
  ChevronLeft,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";
import { MOCK_POLICIES, TAGS, MOCK_CLAUSES } from "../data/mockData";
import { Policy, Clause } from "../types";
import { ClauseCard } from "./ClauseCard";

interface PolicyExplorerProps {
  searchKeyword?: string;
}

export function PolicyExplorer({ searchKeyword = "" }: PolicyExplorerProps) {
  const [localSearchKeyword, setLocalSearchKeyword] = useState(searchKeyword);
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // 同步外部搜索关键词
  useEffect(() => {
    setLocalSearchKeyword(searchKeyword);
  }, [searchKeyword]);

  const filteredPolicies = useMemo(() => {
    return MOCK_POLICIES.filter((policy) => {
      if (localSearchKeyword) {
        const keyword = localSearchKeyword.toLowerCase();
        if (
          !policy.title.toLowerCase().includes(keyword) &&
          !policy.code.toLowerCase().includes(keyword) &&
          !policy.description?.toLowerCase().includes(keyword)
        ) {
          return false;
        }
      }

      if (selectedLevel !== "all" && policy.level !== selectedLevel) {
        return false;
      }

      if (selectedIndustry !== "all" && !policy.industries.includes(selectedIndustry as any)) {
        return false;
      }

      if (selectedStatus !== "all" && policy.status !== selectedStatus) {
        return false;
      }

      if (selectedTags.length > 0) {
        const hasMatchingTag = policy.tags?.some(tag =>
          selectedTags.includes(tag.name)
        );
        if (!hasMatchingTag) return false;
      }

      return true;
    });
  }, [localSearchKeyword, selectedLevel, selectedIndustry, selectedStatus, selectedTags]);

  const handleViewDetail = (policy: Policy) => {
    setSelectedPolicy(policy);
    setIsDetailOpen(true);
  };

  const toggleTagFilter = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedLevel !== "all") count++;
    if (selectedIndustry !== "all") count++;
    if (selectedStatus !== "all") count++;
    if (localSearchKeyword) count++;
    count += selectedTags.length;
    return count;
  };

  const clearAllFilters = () => {
    setLocalSearchKeyword("");
    setSelectedLevel("all");
    setSelectedIndustry("all");
    setSelectedStatus("all");
    setSelectedTags([]);
  };

  return (
    <div className="h-full flex">
      {/* 左侧筛选 */}
      <aside className="w-80 bg-white/60 backdrop-blur-xl border-r border-slate-200/50">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            <div>
              <h3 className="mb-4 flex items-center gap-2">
                <Filter className="size-5 text-blue-600" />
                筛选条件
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </h3>

              <div className="space-y-4">
                {/* 搜索 */}
                <div>
                  <label className="text-sm mb-2 block">关键词搜索</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      placeholder="搜索政策名称、文号..."
                      value={localSearchKeyword}
                      onChange={(e) => setLocalSearchKeyword(e.target.value)}
                      className="pl-9 bg-slate-50/50"
                    />
                    {localSearchKeyword && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 size-6 p-0"
                        onClick={() => setLocalSearchKeyword("")}
                      >
                        <X className="size-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* 政策层级 */}
                <div>
                  <label className="text-sm mb-2 block">政策层级</label>
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger className="bg-slate-50/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部层级</SelectItem>
                      <SelectItem value="法律">法律</SelectItem>
                      <SelectItem value="行政法规">行政法规</SelectItem>
                      <SelectItem value="部门规章">部门规章</SelectItem>
                      <SelectItem value="国家标准">国家标准</SelectItem>
                      <SelectItem value="行业标准">行业标准</SelectItem>
                      <SelectItem value="地方性法规">地方性法规</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 适用行业 */}
                <div>
                  <label className="text-sm mb-2 block">适用行业</label>
                  <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                    <SelectTrigger className="bg-slate-50/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部行业</SelectItem>
                      <SelectItem value="通用">通用</SelectItem>
                      <SelectItem value="金融">金融</SelectItem>
                      <SelectItem value="互联网">互联网</SelectItem>
                      <SelectItem value="医疗">医疗</SelectItem>
                      <SelectItem value="教育">教育</SelectItem>
                      <SelectItem value="电信">电信</SelectItem>
                      <SelectItem value="能源">能源</SelectItem>
                      <SelectItem value="交通">交通</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 生效状态 */}
                <div>
                  <label className="text-sm mb-2 block">生效状态</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="bg-slate-50/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部状态</SelectItem>
                      <SelectItem value="现行有效">现行有效</SelectItem>
                      <SelectItem value="即将生效">即将生效</SelectItem>
                      <SelectItem value="已废止">已废止</SelectItem>
                      <SelectItem value="已修订">已修订</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 标签筛选 */}
                <div>
                  <label className="text-sm mb-2 block">标签筛选</label>
                  <div className="flex flex-wrap gap-1.5">
                    {TAGS.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => toggleTagFilter(tag.name)}
                        className={`text-xs px-2 py-1 rounded-full transition-all ${
                          selectedTags.includes(tag.name)
                            ? `${tag.color} text-white ring-2 ring-offset-1 ring-blue-500`
                            : `${tag.color} text-white opacity-60 hover:opacity-100`
                        }`}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 清除筛选 */}
                {getActiveFiltersCount() > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={clearAllFilters}
                  >
                    <X className="size-4 mr-2" />
                    清除全部筛选
                  </Button>
                )}
              </div>

              {/* 统计信息 */}
              <Card className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">政策总数</span>
                    <span className="text-xl font-semibold">{MOCK_POLICIES.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">筛选结果</span>
                    <span className="text-xl font-semibold text-blue-600">{filteredPolicies.length}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </ScrollArea>
      </aside>

      {/* 主内容 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white/60 backdrop-blur-xl border-b border-slate-200/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-1">政策文件库</h2>
              <p className="text-sm text-gray-600">
                共 <span className="text-blue-600 font-medium">{filteredPolicies.length}</span> 个政策文件
                {filteredPolicies.length !== MOCK_POLICIES.length && (
                  <span className="text-gray-400"> / 总计 {MOCK_POLICIES.length} 个</span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {filteredPolicies.length === 0 ? (
              <Card className="p-12 text-center border-dashed border-2 bg-white/60">
                <FileText className="size-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">暂无符合条件的政策文件</p>
                <Button
                  variant="link"
                  className="text-blue-600"
                  onClick={clearAllFilters}
                >
                  清除筛选条件
                </Button>
              </Card>
            ) : (
              filteredPolicies.map((policy) => (
                <Card key={policy.id} className="p-6 hover:shadow-xl transition-all bg-white/80 backdrop-blur-sm group">
                  <div className="flex items-start gap-4">
                    <div className="size-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                      <FileText className="size-6 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2 gap-4">
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => handleViewDetail(policy)}
                        >
                          <h3 className="text-base font-medium mb-1 group-hover:text-blue-600 transition-colors truncate hover:text-blue-600">{policy.title}</h3>
                          <p className="text-sm text-gray-600 hover:text-gray-800">{policy.code}</p>
                        </div>
                        <Badge className="bg-blue-600 text-white shrink-0">{policy.level}</Badge>
                      </div>

                      {/* 标签展示 */}
                      {policy.tags && policy.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {policy.tags.slice(0, 4).map((tag) => (
                            <Badge
                              key={tag.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTagFilter(tag.name);
                              }}
                              className={`${tag.color} text-white text-xs cursor-pointer transition-all hover:ring-2 hover:ring-offset-1 hover:ring-blue-400 ${
                                selectedTags.includes(tag.name) ? 'ring-2 ring-offset-1 ring-blue-500' : ''
                              }`}
                            >
                              {tag.name}
                            </Badge>
                          ))}
                          {policy.tags.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{policy.tags.length - 4}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Building2 className="size-4 shrink-0" />
                          <span className="truncate">{policy.publishOrg}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="size-4 shrink-0" />
                          <span>生效日期：{policy.effectiveDate}</span>
                        </div>
                      </div>

                      {policy.description && (
                        <p
                          className="text-sm text-gray-600 mb-4 line-clamp-2 cursor-pointer hover:text-gray-800 transition-colors"
                          onClick={() => handleViewDetail(policy)}
                        >
                          {policy.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Tag className="size-3.5" />
                            {policy.clauseCount || MOCK_CLAUSES.filter(c => c.policyId === policy.id).length} 条款
                          </span>
                          <span>·</span>
                          <span>{policy.couCount || Math.floor((policy.clauseCount || 10) * 1.5)} COU</span>
                          <span>·</span>
                          <span className={policy.status === "现行有效" ? "text-green-600" : "text-gray-500"}>
                            {policy.status}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="hidden sm:flex">
                            <Download className="size-4 mr-2" />
                            下载
                          </Button>
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleViewDetail(policy)}
                          >
                            <Eye className="size-4 mr-2" />
                            查看详情
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>

      {/* 政策详情右侧滑出面板 */}
      <PolicyDetailSheet
        policy={selectedPolicy}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  );
}

// 政策详情右侧滑出面板组件
interface PolicyDetailSheetProps {
  policy: Policy | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function PolicyDetailSheet({ policy, open, onOpenChange }: PolicyDetailSheetProps) {
  // 可拖拽宽度状态
  const [width, setWidth] = useState(850);
  const [isResizing, setIsResizing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(width);

  // 条款筛选和排序状态
  const [clauseFilterType, setClauseFilterType] = useState("all");
  const [clauseComplianceType, setClauseComplianceType] = useState("all");
  const [clauseSortBy, setClauseSortBy] = useState("default");

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 重置筛选状态当政策变化时
  useEffect(() => {
    setClauseFilterType("all");
    setClauseComplianceType("all");
    setClauseSortBy("default");
  }, [policy?.id]);

  // 处理拖拽开始
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [width]);

  // 处理拖拽中
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const delta = startXRef.current - e.clientX;
      const newWidth = Math.max(400, Math.min(1400, startWidthRef.current + delta));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // 处理触摸事件（移动端支持）
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsResizing(true);
    startXRef.current = e.touches[0].clientX;
    startWidthRef.current = width;
  }, [width]);

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!isResizing) return;
      const delta = startXRef.current - e.touches[0].clientX;
      const newWidth = Math.max(400, Math.min(1400, startWidthRef.current + delta));
      setWidth(newWidth);
    };

    const handleTouchEnd = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isResizing]);

  // 获取当前政策的条款列表（必须在 early return 之前调用 hook）
  const policyClauses = useMemo(() => {
    if (!policy) return [];
    return MOCK_CLAUSES.filter((c) => c.policyId === policy.id);
  }, [policy]);

  // 筛选和排序后的条款列表
  const filteredClauses = useMemo(() => {
    let result = [...policyClauses];

    // 按类型筛选
    switch (clauseFilterType) {
      case 'tagged':
        result = result.filter(c => c.tags?.length > 0);
        break;
      case 'highWeight':
        result = result.filter(c => c.weight >= 7);
        break;
      case 'prohibited':
        result = result.filter(c => c.complianceType === '禁止性' || c.complianceType === '强制性');
        break;
      case 'penalty':
        result = result.filter(c => c.penalty);
        break;
      case 'other':
        result = result.filter(c => c.weight < 7);
        break;
      default:
      // all - 不过滤
    }

    // 按合规类型筛选
    if (clauseComplianceType !== 'all') {
      result = result.filter(c => c.complianceType === clauseComplianceType);
    }

    // 排序
    switch (clauseSortBy) {
      case 'weightDesc':
        result.sort((a, b) => b.weight - a.weight);
        break;
      case 'weightAsc':
        result.sort((a, b) => a.weight - b.weight);
        break;
      case 'article':
        result.sort((a, b) => a.article.localeCompare(b.article, 'zh-CN'));
        break;
      default:
      // default - 不排序（保持原有顺序）
    }

    return result;
  }, [policyClauses, clauseFilterType, clauseComplianceType, clauseSortBy]);

  if (!policy) return null;

  const getLevelColor = (level: string) => {
    switch (level) {
      case "法律":
        return "bg-red-100 text-red-700 border-red-300";
      case "行政法规":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "部门规章":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "国家标准":
        return "bg-green-100 text-green-700 border-green-300";
      case "行业标准":
        return "bg-purple-100 text-purple-700 border-purple-300";
      case "地方性法规":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getLevelGradient = (level: string) => {
    switch (level) {
      case "法律":
        return "from-red-500 to-red-600";
      case "行政法规":
        return "from-orange-500 to-orange-600";
      case "部门规章":
        return "from-blue-500 to-blue-600";
      case "国家标准":
        return "from-green-500 to-green-600";
      case "行业标准":
        return "from-purple-500 to-purple-600";
      case "地方性法规":
        return "from-yellow-500 to-yellow-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="!p-0 !gap-0 overflow-hidden flex flex-col"
        style={{
          width: isClient && window.innerWidth >= 640 ? width : '100%',
          maxWidth: '95vw',
        }}
      >
        {/* 拖拽条 */}
        <div
          className="absolute left-0 top-0 bottom-0 w-4 cursor-col-resize flex items-center justify-center z-50 group"
          onMouseDown={handleResizeStart}
          onTouchStart={handleTouchStart}
        >
          <div className="w-1 h-12 rounded-full bg-slate-300 group-hover:bg-blue-400 transition-colors" />
        </div>
        {/* 头部区域 */}
        <SheetHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className={`size-10 sm:size-12 rounded-xl bg-gradient-to-br ${getLevelGradient(policy.level)} flex items-center justify-center flex-shrink-0 shadow-lg`}>
              <Scale className="size-5 sm:size-6 text-white" />
            </div>
            <div className="flex-1 min-w-0 pr-8">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge className={getLevelColor(policy.level)} variant="outline">
                  {policy.level}
                </Badge>
                <Badge variant="outline" className="font-mono text-xs">
                  <Hash className="size-3 mr-1" />
                  {policy.code}
                </Badge>
              </div>
              <SheetTitle className="text-base sm:text-lg leading-tight text-left">
                {policy.title}
              </SheetTitle>
            </div>
          </div>
        </SheetHeader>

        {/* 可滚动内容区域 */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* 标签区域 */}
            {policy.tags && policy.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {policy.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    className={`${tag.color} text-white text-xs`}
                  >
                    <Tag className="size-3 mr-1" />
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* 政策元信息卡片 */}
            <Card className="p-3 sm:p-4 bg-slate-50/50 border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="size-4 text-blue-500 flex-shrink-0" />
                  <span className="text-gray-500 flex-shrink-0">发布机构：</span>
                  <span className="truncate">{policy.publishOrg}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="size-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-500 flex-shrink-0">生效日期：</span>
                  <span>{policy.effectiveDate || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="size-4 text-purple-500 flex-shrink-0" />
                  <span className="text-gray-500 flex-shrink-0">条款数量：</span>
                  <span>{policy.clauseCount} 条</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="size-4 text-cyan-500 flex-shrink-0" />
                  <span className="text-gray-500 flex-shrink-0">适用区域：</span>
                  <span>{policy.regions?.join('、') || '国内'}</span>
                </div>
              </div>

              {/* 适用行业 */}
              <div className="mt-3 pt-3 border-t border-slate-200">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-500">适用行业：</span>
                  {policy.industries.map((industry) => (
                    <span
                      key={industry}
                      className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded-md text-xs"
                    >
                      {industry}
                    </span>
                  ))}
                </div>
              </div>
            </Card>

            {/* 描述区域 */}
            {policy.description && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="size-4 text-gray-400" />
                  政策概述
                </h4>
                <div className="p-3 sm:p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    {policy.description}
                  </p>
                </div>
              </div>
            )}

            {/* 条款列表 */}
            <div>
              {/* 条款筛选栏 */}
              <div className="mb-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Scale className="size-4 text-gray-400" />
                    相关条款
                    <span className="text-xs font-normal text-gray-500">
                      （共 {filteredClauses.length} 个
                      {filteredClauses.length !== policyClauses.length && ` / 总计 ${policyClauses.length}`}）
                    </span>
                  </h4>
                </div>

                {/* 筛选器行 */}
                <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mr-1">
                    <SlidersHorizontal className="size-3.5" />
                    <span>筛选</span>
                  </div>

                  {/* 条款类型筛选 */}
                  <Select value={clauseFilterType} onValueChange={setClauseFilterType}>
                    <SelectTrigger className="h-8 text-xs bg-white border-slate-200 w-[140px]">
                      <SelectValue placeholder="条款类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部条款</SelectItem>
                      <SelectItem value="tagged">有标签（关键）</SelectItem>
                      <SelectItem value="highWeight">高权重（≥7）</SelectItem>
                      <SelectItem value="prohibited">禁止性/强制性</SelectItem>
                      <SelectItem value="penalty">有处罚条款</SelectItem>
                      <SelectItem value="other">其他（权重&lt;7）</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* 合规类型筛选 */}
                  <Select value={clauseComplianceType} onValueChange={setClauseComplianceType}>
                    <SelectTrigger className="h-8 text-xs bg-white border-slate-200 w-[120px]">
                      <SelectValue placeholder="合规类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部类型</SelectItem>
                      <SelectItem value="禁止性">禁止性</SelectItem>
                      <SelectItem value="强制性">强制性</SelectItem>
                      <SelectItem value="推荐性">推荐性</SelectItem>
                      <SelectItem value="指导性">指导性</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex-1" />

                  {/* 排序方式 */}
                  <Select value={clauseSortBy} onValueChange={setClauseSortBy}>
                    <SelectTrigger className="h-8 text-xs bg-white border-slate-200 w-[130px]">
                      <SelectValue placeholder="排序方式" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">默认顺序</SelectItem>
                      <SelectItem value="weightDesc">权重降序</SelectItem>
                      <SelectItem value="weightAsc">权重升序</SelectItem>
                      <SelectItem value="article">条款编号</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* 清除筛选按钮 */}
                  {(clauseFilterType !== 'all' || clauseComplianceType !== 'all' || clauseSortBy !== 'default') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs text-gray-500 hover:text-gray-700"
                      onClick={() => {
                        setClauseFilterType('all');
                        setClauseComplianceType('all');
                        setClauseSortBy('default');
                      }}
                    >
                      <X className="size-3 mr-1" />
                      清除
                    </Button>
                  )}
                </div>
              </div>

              {/* 条款列表内容 */}
              <div className="space-y-2 sm:space-y-3">
                {filteredClauses.length > 0 ? (
                  filteredClauses.map((clause) => (
                    <ClauseCard key={clause.id} clause={clause} />
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-400 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                    <Filter className="size-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm mb-1">暂无符合条件的条款</p>
                    <p className="text-xs text-gray-400">尝试调整筛选条件</p>
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-2 text-blue-600"
                      onClick={() => {
                        setClauseFilterType('all');
                        setClauseComplianceType('all');
                        setClauseSortBy('default');
                      }}
                    >
                      清除全部筛选
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 底部操作栏 */}
        <SheetFooter className="px-4 sm:px-6 py-3 sm:py-4 border-t bg-slate-50 gap-2 flex-row">
          <SheetClose asChild>
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
              <ChevronLeft className="size-3 sm:size-4 mr-1 sm:mr-2" />
              返回列表
            </Button>
          </SheetClose>
          <Button variant="outline" size="sm" className="text-xs sm:text-sm">
            <Bookmark className="size-3 sm:size-4 mr-1 sm:mr-2" />
            收藏
          </Button>
          <Button variant="outline" size="sm" className="text-xs sm:text-sm">
            <Download className="size-3 sm:size-4 mr-1 sm:mr-2" />
            下载
          </Button>
          <Button size="sm" className="text-xs sm:text-sm bg-blue-600">
            <ExternalLink className="size-3 sm:size-4 mr-1 sm:mr-2" />
            原文链接
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
