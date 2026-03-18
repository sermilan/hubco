import { useState, useMemo, useEffect } from "react";
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
import { Slider } from "./ui/slider";
import {
  Search,
  Filter,
  Target,
  TrendingUp,
  CheckCircle2,
  Plus,
  ArrowRight,
  Tag as TagIcon,
  Shield,
  Globe,
  Building2,
  Bookmark,
  Download,
  X,
  FileText,
  Scale,
  Hash,
  Eye,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { MOCK_COUS, MOCK_POLICIES } from "../data/mockData";
import { COU } from "../types";
import { COUDetailSheet } from "./COUDetailSheet";

interface COUExplorerProps {
  searchKeyword?: string;
}

export function COUExplorer({ searchKeyword = "" }: COUExplorerProps) {
  const [localSearchKeyword, setLocalSearchKeyword] = useState(searchKeyword);
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedObligationType, setSelectedObligationType] = useState<string>("all");
  const [weightRange, setWeightRange] = useState<[number, number]>([1, 10]);
  const [selectedCOU, setSelectedCOU] = useState<COU | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // 同步外部搜索关键词
  useEffect(() => {
    setLocalSearchKeyword(searchKeyword);
  }, [searchKeyword]);

  const filteredCOUs = useMemo(() => {
    return MOCK_COUS.filter((cou) => {
      if (localSearchKeyword) {
        const keyword = localSearchKeyword.toLowerCase();
        if (
          !cou.title.toLowerCase().includes(keyword) &&
          !cou.description.toLowerCase().includes(keyword) &&
          !cou.code.toLowerCase().includes(keyword) &&
          !cou.tags.some((tag) => tag.name.toLowerCase().includes(keyword)) &&
          !cou.autoTags?.some((tag) => tag.toLowerCase().includes(keyword))
        ) {
          return false;
        }
      }

      if (
        selectedIndustry !== "all" &&
        !cou.applicableIndustries?.includes(selectedIndustry as any)
      ) {
        return false;
      }

      if (
        selectedRegion !== "all" &&
        !cou.applicableRegions?.includes(selectedRegion as any)
      ) {
        return false;
      }

      if (
        selectedObligationType !== "all" &&
        cou.obligationType !== selectedObligationType
      ) {
        return false;
      }

      if (cou.finalWeight < weightRange[0] || cou.finalWeight > weightRange[1]) {
        return false;
      }

      return true;
    });
  }, [localSearchKeyword, selectedIndustry, selectedRegion, selectedObligationType, weightRange]);

  const handleViewDetail = (cou: COU) => {
    setSelectedCOU(cou);
    setIsDetailOpen(true);
  };

  const handleToggleFavorite = (couId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(couId)) {
        newFavorites.delete(couId);
        toast.success("已取消收藏");
      } else {
        newFavorites.add(couId);
        toast.success("已添加到收藏");
      }
      return newFavorites;
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedIndustry !== "all") count++;
    if (selectedRegion !== "all") count++;
    if (selectedObligationType !== "all") count++;
    if (weightRange[0] !== 1 || weightRange[1] !== 10) count++;
    if (localSearchKeyword) count++;
    return count;
  };

  const clearAllFilters = () => {
    setLocalSearchKeyword("");
    setSelectedIndustry("all");
    setSelectedRegion("all");
    setSelectedObligationType("all");
    setWeightRange([1, 10]);
  };

  const getPriorityColor = (weight: number) => {
    if (weight >= 9) return "from-red-500 to-pink-500";
    if (weight >= 7) return "from-orange-500 to-amber-500";
    if (weight >= 5) return "from-blue-500 to-cyan-500";
    return "from-gray-400 to-gray-500";
  };

  const getPriorityLabel = (weight: number) => {
    if (weight >= 9) return "关键";
    if (weight >= 7) return "高";
    if (weight >= 5) return "中";
    return "低";
  };

  const getObligationColor = (type: string) => {
    switch (type) {
      case "禁止性":
        return "bg-red-100 text-red-700 border-red-300";
      case "强制性":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "推荐性":
        return "bg-blue-100 text-blue-700 border-blue-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  // 按来源政策分组
  const groupedCOUs = useMemo(() => {
    const groups: Record<string, COU[]> = {};
    filteredCOUs.forEach((cou) => {
      const policyId = cou.policyId || "unknown";
      if (!groups[policyId]) {
        groups[policyId] = [];
      }
      groups[policyId].push(cou);
    });
    return groups;
  }, [filteredCOUs]);

  return (
    <div className="h-full flex">
      {/* 左侧筛选区 */}
      <aside className="w-80 bg-white/60 backdrop-blur-xl border-r border-slate-200/50">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            <div>
              <h3 className="mb-4 flex items-center gap-2">
                <Filter className="size-5 text-blue-600" />
                智能筛选
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </h3>

              {/* 搜索 */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <Input
                  placeholder="搜索COU..."
                  value={localSearchKeyword}
                  onChange={(e) => setLocalSearchKeyword(e.target.value)}
                  className="pl-10 bg-slate-50/50"
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

              {/* 行业 */}
              <div className="mb-4">
                <Label className="text-sm mb-2 flex items-center gap-1">
                  <Building2 className="size-4" />
                  适用行业
                </Label>
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger className="bg-slate-50/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部行业</SelectItem>
                    <SelectItem value="互联网">互联网</SelectItem>
                    <SelectItem value="金融">金融</SelectItem>
                    <SelectItem value="游戏">游戏</SelectItem>
                    <SelectItem value="电商">电商</SelectItem>
                    <SelectItem value="通用">通用</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 区域 */}
              <div className="mb-4">
                <Label className="text-sm mb-2 flex items-center gap-1">
                  <Globe className="size-4" />
                  适用区域
                </Label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="bg-slate-50/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部区域</SelectItem>
                    <SelectItem value="国内">国内</SelectItem>
                    <SelectItem value="欧盟">欧盟</SelectItem>
                    <SelectItem value="美国">美国</SelectItem>
                    <SelectItem value="全球">全球</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 合规类型 */}
              <div className="mb-4">
                <Label className="text-sm mb-2 flex items-center gap-1">
                  <Shield className="size-4" />
                  合规类型
                </Label>
                <Select value={selectedObligationType} onValueChange={setSelectedObligationType}>
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
              <div className="mb-4">
                <Label className="text-sm mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="size-4" />
                    权重范围
                  </span>
                  <span className="text-blue-600">
                    {weightRange[0]} - {weightRange[1]}
                  </span>
                </Label>
                <Slider
                  value={weightRange}
                  onValueChange={(v) => setWeightRange(v as [number, number])}
                  min={1}
                  max={10}
                  step={1}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>低优先级</span>
                  <span>高优先级</span>
                </div>
              </div>

              {/* 清除筛选 */}
              {getActiveFiltersCount() > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mb-4"
                  onClick={clearAllFilters}
                >
                  <X className="size-4 mr-2" />
                  清除全部筛选
                </Button>
              )}

              {/* 统计信息 */}
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">COU总数</span>
                    <span className="text-2xl font-semibold">{MOCK_COUS.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">筛选结果</span>
                    <span className="text-2xl font-semibold text-blue-600">{filteredCOUs.length}</span>
                  </div>
                  <div className="pt-2 border-t space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <div className="size-2 rounded-full bg-red-500" />
                        关键 (9-10)
                      </span>
                      <span className="text-red-600 font-medium">
                        {filteredCOUs.filter((c) => c.finalWeight >= 9).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <div className="size-2 rounded-full bg-orange-500" />
                        高 (7-8)
                      </span>
                      <span className="text-orange-600 font-medium">
                        {filteredCOUs.filter((c) => c.finalWeight >= 7 && c.finalWeight < 9).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <div className="size-2 rounded-full bg-yellow-500" />
                        中 (4-6)
                      </span>
                      <span className="text-yellow-600 font-medium">
                        {filteredCOUs.filter((c) => c.finalWeight >= 4 && c.finalWeight < 7).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <div className="size-2 rounded-full bg-blue-500" />
                        低 (1-3)
                      </span>
                      <span className="text-blue-600 font-medium">
                        {filteredCOUs.filter((c) => c.finalWeight < 4).length}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </ScrollArea>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 工具栏 */}
        <div className="bg-white/60 backdrop-blur-xl border-b border-slate-200/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-1">COU 合规义务单元</h2>
              <p className="text-sm text-gray-600">
                共 <span className="text-blue-600 font-medium">{filteredCOUs.length}</span> 个合规义务单元
                {filteredCOUs.length !== MOCK_COUS.length && (
                  <span className="text-gray-400"> / 总计 {MOCK_COUS.length} 个</span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2">
                <Download className="size-4" />
                导出结果
              </Button>
              <Button className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600">
                <Plus className="size-4" />
                批量添加到场景
              </Button>
            </div>
          </div>
        </div>

        {/* COU列表 */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {filteredCOUs.length === 0 ? (
              <Card className="p-12 text-center border-dashed border-2 bg-white/60">
                <Target className="size-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">暂无符合条件的COU</p>
                <Button
                  variant="link"
                  className="text-blue-600"
                  onClick={clearAllFilters}
                >
                  清除筛选条件
                </Button>
              </Card>
            ) : (
              Object.entries(groupedCOUs).map(([policyId, cous]) => {
                const policy = MOCK_POLICIES.find((p) => p.id === policyId);

                return (
                  <div key={policyId} className="space-y-3">
                    {/* 政策分组标题 - PolicyExplorer 风格 */}
                    <div className="flex items-center gap-3 px-1">
                      <div className="size-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                        <Shield className="size-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-gray-700 truncate">
                            {policy?.title || "未知来源"}
                          </h3>
                          {policy && (
                            <Badge variant="outline" className="text-xs shrink-0">
                              {policy.level}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">
                          {cous.length} 个COU {policy && `· ${policy.code}`}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {cous.map((cou) => (
                        <Card
                          key={cou.id}
                          className="p-6 hover:shadow-xl transition-all bg-white/80 backdrop-blur-sm group cursor-pointer"
                          onClick={() => handleViewDetail(cou)}
                        >
                          <div className="flex items-start gap-4">
                            {/* 左侧图标 */}
                            <div
                              className={`size-12 rounded-xl bg-gradient-to-br ${getPriorityColor(
                                cou.finalWeight
                              )} flex items-center justify-center flex-shrink-0 shadow-lg`}
                            >
                              <Target className="size-6 text-white" />
                            </div>

                            <div className="flex-1 min-w-0">
                              {/* 头部信息 */}
                              <div className="flex items-start justify-between mb-2 gap-4">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant="outline" className="font-mono text-xs">
                                    <Hash className="size-3 mr-1" />
                                    {cou.code}
                                  </Badge>
                                  <Badge className={getObligationColor(cou.obligationType)}>
                                    {cou.obligationType}
                                  </Badge>
                                  <Badge
                                    className={`bg-gradient-to-r ${getPriorityColor(
                                      cou.finalWeight
                                    )} text-white`}
                                  >
                                    权重 {cou.finalWeight}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className={
                                      favorites.has(cou.id)
                                        ? "text-red-500"
                                        : "text-gray-400 hover:text-red-500"
                                    }
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleFavorite(cou.id);
                                    }}
                                  >
                                    <Bookmark
                                      className={`size-4 ${
                                        favorites.has(cou.id) ? "fill-current" : ""
                                      }`}
                                    />
                                  </Button>
                                </div>
                              </div>

                              {/* 标题 */}
                              <h3 className="text-base font-medium mb-2 group-hover:text-blue-600 transition-colors">
                                {cou.title}
                              </h3>

                              {/* 描述 */}
                              <p className="text-gray-600 mb-3 leading-relaxed">
                                {cou.description}
                              </p>

                              {/* 标签 */}
                              <div className="flex flex-wrap gap-2 mb-4">
                                {cou.tags.map((tag) => (
                                  <Badge
                                    key={tag.id}
                                    className={`${tag.color} text-white text-xs`}
                                  >
                                    {tag.name}
                                  </Badge>
                                ))}
                                {cou.autoTags.slice(0, 2).map((tag, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="text-xs border-dashed"
                                  >
                                    <TagIcon className="size-3 mr-1" />
                                    {tag}
                                  </Badge>
                                ))}
                              </div>

                              {/* 底部信息 */}
                              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Building2 className="size-3.5" />
                                    {cou.applicableIndustries?.join(", ") || "通用"}
                                  </span>
                                  {cou.deadline && (
                                    <span className="flex items-center gap-1 text-orange-500">
                                      <Calendar className="size-3.5" />
                                      期限：{cou.deadline}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewDetail(cou);
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

      {/* COU详情右侧滑出面板 */}
      <COUDetailSheet
        cou={selectedCOU}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onToggleFavorite={() => selectedCOU && handleToggleFavorite(selectedCOU.id)}
        isFavorite={selectedCOU ? favorites.has(selectedCOU.id) : false}
      />
    </div>
  );
}

function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`text-sm font-medium ${className}`}>{children}</div>;
}
