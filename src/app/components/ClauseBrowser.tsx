import { useState, useMemo, useEffect } from "react";
import { Clause, Policy } from "../types";
import { MOCK_CLAUSES, MOCK_POLICIES } from "../data/mockData";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Search,
  Filter,
  FileText,
  BookOpen,
  Scale,
  Tag,
  X,
  ArrowRight,
  Bookmark,
  Hash,
  Eye,
  Scale as ScaleIcon,
  Calendar,
  Building2,
  ChevronLeft,
} from "lucide-react";
import { ClauseDetailSheet } from "./ClauseDetailSheet";

interface ClauseBrowserProps {
  searchKeyword?: string;
}

export function ClauseBrowser({ searchKeyword = "" }: ClauseBrowserProps) {
  const [localSearchKeyword, setLocalSearchKeyword] = useState(searchKeyword);

  // 同步外部搜索关键词
  useEffect(() => {
    setLocalSearchKeyword(searchKeyword);
  }, [searchKeyword]);
  const [selectedPolicy, setSelectedPolicy] = useState<string>("all");
  const [selectedComplianceType, setSelectedComplianceType] = useState<string>("all");
  const [selectedWeightRange, setSelectedWeightRange] = useState<string>("all");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedClause, setSelectedClause] = useState<Clause | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredClauses = useMemo(() => {
    return MOCK_CLAUSES.filter((clause) => {
      // 关键词搜索
      if (localSearchKeyword) {
        const keyword = localSearchKeyword.toLowerCase();
        const matchesContent = clause.content.toLowerCase().includes(keyword);
        const matchesArticle = clause.article.toLowerCase().includes(keyword);
        const matchesPolicy = clause.policyTitle.toLowerCase().includes(keyword);
        const matchesKeywords = clause.keywords?.some((k) =>
          k.toLowerCase().includes(keyword)
        );
        if (!matchesContent && !matchesArticle && !matchesPolicy && !matchesKeywords) {
          return false;
        }
      }

      // 政策筛选
      if (selectedPolicy !== "all" && clause.policyId !== selectedPolicy) {
        return false;
      }

      // 合规类型筛选
      if (
        selectedComplianceType !== "all" &&
        clause.complianceType !== selectedComplianceType
      ) {
        return false;
      }

      // 权重范围筛选
      if (selectedWeightRange !== "all") {
        const weight = clause.weight;
        switch (selectedWeightRange) {
          case "critical":
            if (weight < 9) return false;
            break;
          case "high":
            if (weight < 7 || weight >= 9) return false;
            break;
          case "medium":
            if (weight < 4 || weight >= 7) return false;
            break;
          case "low":
            if (weight >= 4) return false;
            break;
        }
      }

      return true;
    });
  }, [localSearchKeyword, selectedPolicy, selectedComplianceType, selectedWeightRange]);

  const getComplianceTypeColor = (type: string) => {
    switch (type) {
      case "禁止性":
        return "bg-red-100 text-red-700 border-red-300";
      case "强制性":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "推荐性":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "指导性":
        return "bg-green-100 text-green-700 border-green-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getWeightColor = (weight: number) => {
    if (weight >= 9) return "text-red-600 bg-red-50";
    if (weight >= 7) return "text-orange-600 bg-orange-50";
    if (weight >= 4) return "text-yellow-600 bg-yellow-50";
    return "text-blue-600 bg-blue-50";
  };

  const getWeightLabel = (weight: number) => {
    if (weight >= 9) return "关键";
    if (weight >= 7) return "高";
    if (weight >= 4) return "中";
    return "低";
  };

  const toggleFavorite = (clauseId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(clauseId)) {
        newFavorites.delete(clauseId);
      } else {
        newFavorites.add(clauseId);
      }
      return newFavorites;
    });
  };

  const handleViewDetail = (clause: Clause) => {
    setSelectedClause(clause);
    setIsDetailOpen(true);
  };

  const handleToggleFavoriteDetail = () => {
    if (selectedClause) {
      toggleFavorite(selectedClause.id);
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedPolicy !== "all") count++;
    if (selectedComplianceType !== "all") count++;
    if (selectedWeightRange !== "all") count++;
    if (localSearchKeyword) count++;
    return count;
  };

  const clearAllFilters = () => {
    setLocalSearchKeyword("");
    setSelectedPolicy("all");
    setSelectedComplianceType("all");
    setSelectedWeightRange("all");
  };

  // 按政策分组显示
  const groupedClauses = useMemo(() => {
    const groups: Record<string, Clause[]> = {};
    filteredClauses.forEach((clause) => {
      if (!groups[clause.policyId]) {
        groups[clause.policyId] = [];
      }
      groups[clause.policyId].push(clause);
    });
    return groups;
  }, [filteredClauses]);

  // 获取合规类型的渐变颜色
  const getComplianceGradient = (type: string) => {
    switch (type) {
      case "禁止性":
        return "from-red-500 to-pink-500";
      case "强制性":
        return "from-orange-500 to-amber-500";
      case "推荐性":
        return "from-blue-500 to-cyan-500";
      case "指导性":
        return "from-green-500 to-emerald-500";
      default:
        return "from-gray-400 to-gray-500";
    }
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
                      placeholder="搜索条款内容、条文号..."
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

                {/* 政策筛选 */}
                <div>
                  <label className="text-sm mb-2 block flex items-center gap-1">
                    <BookOpen className="size-4" />
                    所属政策
                  </label>
                  <Select value={selectedPolicy} onValueChange={setSelectedPolicy}>
                    <SelectTrigger className="bg-slate-50/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部政策</SelectItem>
                      {MOCK_POLICIES.map((policy) => (
                        <SelectItem key={policy.id} value={policy.id}>
                          {policy.title.length > 20 ? policy.title.slice(0, 20) + "..." : policy.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 合规类型 */}
                <div>
                  <label className="text-sm mb-2 block flex items-center gap-1">
                    <ScaleIcon className="size-4" />
                    合规类型
                  </label>
                  <Select
                    value={selectedComplianceType}
                    onValueChange={setSelectedComplianceType}
                  >
                    <SelectTrigger className="bg-slate-50/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部类型</SelectItem>
                      <SelectItem value="禁止性">禁止性</SelectItem>
                      <SelectItem value="强制性">强制性</SelectItem>
                      <SelectItem value="推荐性">推荐性</SelectItem>
                      <SelectItem value="指导性">指导性</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 权重范围 */}
                <div>
                  <label className="text-sm mb-2 block flex items-center gap-1">
                    <Tag className="size-4" />
                    权重范围
                  </label>
                  <Select
                    value={selectedWeightRange}
                    onValueChange={setSelectedWeightRange}
                  >
                    <SelectTrigger className="bg-slate-50/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部权重</SelectItem>
                      <SelectItem value="critical">关键 (9-10)</SelectItem>
                      <SelectItem value="high">高 (7-8)</SelectItem>
                      <SelectItem value="medium">中 (4-6)</SelectItem>
                      <SelectItem value="low">低 (1-3)</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <span className="text-sm text-gray-600">条款总数</span>
                    <span className="text-2xl font-semibold">
                      {MOCK_CLAUSES.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">筛选结果</span>
                    <span className="text-2xl font-semibold text-blue-600">
                      {filteredClauses.length}
                    </span>
                  </div>
                  <div className="pt-2 border-t space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">关键条款</span>
                      <span className="text-red-600">
                        {filteredClauses.filter((c) => c.weight >= 9).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">强制/禁止性</span>
                      <span className="text-orange-600">
                        {
                          filteredClauses.filter(
                            (c) =>
                              c.complianceType === "强制性" ||
                              c.complianceType === "禁止性"
                          ).length
                        }
                      </span>
                    </div>
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
              <h2 className="text-lg font-semibold mb-1">条款库</h2>
              <p className="text-sm text-gray-600">
                共{" "}
                <span className="text-blue-600 font-medium">
                  {filteredClauses.length}
                </span>{" "}
                个条款
                {filteredClauses.length !== MOCK_CLAUSES.length && (
                  <span className="text-gray-400">
                    {" "}
                    / 总计 {MOCK_CLAUSES.length} 个
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {filteredClauses.length === 0 ? (
              <Card className="p-12 text-center border-dashed border-2 bg-white/60">
                <ScaleIcon className="size-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">暂无符合条件的条款</p>
                <Button
                  variant="link"
                  className="text-blue-600"
                  onClick={clearAllFilters}
                >
                  清除筛选条件
                </Button>
              </Card>
            ) : (
              Object.entries(groupedClauses).map(([policyId, clauses]) => {
                const policy = MOCK_POLICIES.find((p) => p.id === policyId);
                if (!policy) return null;

                return (
                  <div key={policyId} className="space-y-3">
                    {/* 政策分组标题 - PolicyExplorer 风格 */}
                    <div className="flex items-center gap-3 px-1">
                      <div className="size-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <BookOpen className="size-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-gray-700 truncate">
                            {policy.title}
                          </h3>
                          <Badge variant="outline" className="text-xs shrink-0">{policy.level}</Badge>
                        </div>
                        <p className="text-xs text-gray-400">
                          {clauses.length} 个条款 · {policy.code}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {clauses.map((clause) => (
                        <Card
                          key={clause.id}
                          className="p-6 hover:shadow-xl transition-all bg-white/80 backdrop-blur-sm group cursor-pointer"
                          onClick={() => handleViewDetail(clause)}
                        >
                          <div className="flex items-start gap-4">
                            {/* 左侧图标 */}
                            <div className={`size-12 rounded-xl bg-gradient-to-br ${getComplianceGradient(clause.complianceType)} flex items-center justify-center flex-shrink-0`}>
                              <ScaleIcon className="size-6 text-white" />
                            </div>

                            <div className="flex-1 min-w-0">
                              {/* 头部信息 */}
                              <div className="flex items-start justify-between mb-2 gap-4">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge
                                    variant="outline"
                                    className="font-mono text-xs"
                                  >
                                    <Hash className="size-3 mr-1" />
                                    {clause.article}
                                  </Badge>
                                  <Badge
                                    className={getComplianceTypeColor(
                                      clause.complianceType
                                    )}
                                  >
                                    {clause.complianceType}
                                  </Badge>
                                  <Badge
                                    className={`${getWeightColor(clause.weight)}`}
                                  >
                                    权重 {clause.weight}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={
                                      favorites.has(clause.id)
                                        ? "text-red-500"
                                        : "text-gray-400 hover:text-red-500"
                                    }
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFavorite(clause.id);
                                    }}
                                  >
                                    <Bookmark
                                      className={`size-4 ${
                                        favorites.has(clause.id) ? "fill-current" : ""
                                      }`}
                                    />
                                  </Button>
                                </div>
                              </div>

                              {/* 条款内容 */}
                              <p className="text-gray-700 leading-relaxed mb-4 group-hover:text-gray-900 transition-colors">
                                {clause.content}
                              </p>

                              {/* 底部信息 */}
                              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="size-3.5" />
                                    {clause.chapter}
                                  </span>
                                  {clause.penalty && (
                                    <span className="text-red-500 flex items-center gap-1">
                                      <ScaleIcon className="size-3.5" />
                                      有违规处罚
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {clause.tags && clause.tags.length > 0 && (
                                    <div className="flex gap-1">
                                      {clause.tags.slice(0, 3).map((tag) => (
                                        <Badge
                                          key={tag.id}
                                          className={`${tag.color} text-white text-xs`}
                                        >
                                          {tag.name}
                                        </Badge>
                                      ))}
                                      {clause.tags.length > 3 && (
                                        <Badge variant="outline" className="text-xs">
                                          +{clause.tags.length - 3}
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                  <Button
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewDetail(clause);
                                    }}
                                  >
                                    <Eye className="size-4 mr-2" />
                                    查看详情
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* 条款详情右侧滑出面板 */}
      <ClauseDetailSheet
        clause={selectedClause}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onToggleFavorite={handleToggleFavoriteDetail}
        isFavorite={selectedClause ? favorites.has(selectedClause.id) : false}
      />
    </div>
  );
}
