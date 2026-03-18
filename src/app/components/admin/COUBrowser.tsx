// ============ COU浏览器 ============
// 大规模数据管理设计 - 支持万级到十万级COU
// 左侧筛选面板 + 统计概览 + 虚拟滚动表格 + 右侧详情面板

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Plus,
  Upload,
  Download,
  Search,
  Filter,
  Target,
  Building2,
  Scale,
  Tag,
  ChevronDown,
  MoreHorizontal,
  FileText,
  ArrowLeftRight,
  Layers,
  ArrowLeft,
  X,
  FileSearch,
  LayoutGrid,
  List,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Star,
  Zap,
  ChevronRight,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Slider } from "../ui/slider";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";
import { VirtualTable } from "./VirtualTable";
import { BatchActionBar } from "./BatchActionBar";
import { COUDetail } from "./COUDetail";
import { COUForm } from "./COUForm";
import type { COU, PolicyLevel, Clause, Policy } from "../../types";
import { MOCK_COUS, MOCK_POLICIES, MOCK_CLAUSES } from "../../data/mockData";

interface COUBrowserProps {
  onCOUClick?: (cou: COU) => void;
  onClauseClick?: (clauseId: string) => void;
  onPolicyClick?: (policyId: string) => void;
  initialClauseId?: string;
  onBackToClauses?: () => void;
  onNavigateToWorkbench?: () => void;
}

// 级别配置
const LEVEL_CONFIG: Record<PolicyLevel, { color: string; bg: string; border: string }> = {
  法律: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  行政法规: { color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  部门规章: { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  国家标准: { color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
  行业标准: { color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
  地方性法规: { color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-200" },
  规范性文件: { color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200" },
};

// 状态配置
const STATUS_CONFIG = {
  active: { label: "当前", color: "bg-green-500", bg: "bg-green-50", text: "text-green-700" },
  pending: { label: "待审", color: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700" },
  deprecated: { label: "废弃", color: "bg-gray-500", bg: "bg-gray-50", text: "text-gray-700" },
};

// 生成大规模模拟COU数据
function generateMockCOUs(count: number): COU[] {
  const cous: COU[] = [];
  const industries = ["金融", "医疗", "互联网", "电信", "能源", "教育", "政务", "通用", "制造", "零售"];
  const statuses = ["active", "pending", "deprecated"] as const;
  const titles = [
    "建立数据安全管理制度",
    "开展数据分类分级工作",
    "实施数据加密保护措施",
    "建立数据访问控制机制",
    "开展数据安全风险评估",
    "建立数据安全应急预案",
    "实施数据备份与恢复",
    "开展数据安全培训教育",
    "建立数据安全审计机制",
    "实施数据出境安全评估",
  ];

  for (let i = 0; i < count; i++) {
    const policy = MOCK_POLICIES[i % MOCK_POLICIES.length];
    const title = titles[i % titles.length];
    cous.push({
      id: `COU-${String(i + 1).padStart(6, "0")}`,
      code: `COU-${policy.code?.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6) || "GEN"}-${String(i + 1).padStart(4, "0")}`,
      title: `${title} ${Math.floor(i / 10) + 1}`,
      description: `根据《${policy.title}》要求，${title}，确保数据处理活动符合法律法规要求，防范数据安全风险。`,
      policyId: policy.id,
      policyName: policy.title,
      clauseId: `clause-${i % 50}`,
      clauseNumber: `第${Math.floor((i % 50) / 5) + 1}条`,
      weight: Math.floor(Math.random() * 12) + 3,
      industries: [industries[i % industries.length], industries[(i + 3) % industries.length]].filter((v, i, a) => a.indexOf(v) === i),
      regions: ["国内"],
      status: statuses[i % 3],
      tags: ["必修", i % 2 === 0 ? "高优" : "常规"],
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  return cous;
}

// 统计卡片组件
function StatCard({ title, value, change, icon: Icon, color }: {
  title: string;
  value: string;
  change?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            {change && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {change}
              </p>
            )}
          </div>
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 快捷筛选标签
function QuickFilter({ label, count, active, onClick, icon: Icon }: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all w-full ${
        active
          ? "bg-purple-100 text-purple-700 border border-purple-200"
          : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="flex-1 text-left">{label}</span>
      <Badge variant="secondary" className="text-xs">
        {count}
      </Badge>
    </button>
  );
}

export function COUBrowser({
  onCOUClick,
  onClauseClick,
  onPolicyClick,
  initialClauseId,
  onBackToClauses,
  onNavigateToWorkbench,
}: COUBrowserProps) {
  // 数据状态 - 支持大规模数据
  const [cous, setCous] = useState<COU[]>(() => generateMockCOUs(1000));
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [selectedCOU, setSelectedCOU] = useState<COU | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);

  // 浏览器视图状态: list | detail | edit
  const [browserView, setBrowserView] = useState<"list" | "detail" | "edit">("list");

  // 筛选状态
  const [clauseFilter, setClauseFilter] = useState<string>(initialClauseId || "all");
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [industryFilter, setIndustryFilter] = useState<string[]>([]);
  const [weightRange, setWeightRange] = useState<[number, number]>([0, 15]);
  const [quickFilter, setQuickFilter] = useState<string | null>(null);
  const [selectedPolicyIds, setSelectedPolicyIds] = useState<string[]>([]);

  // 获取当前筛选的条款信息
  const currentClause = useMemo(() => {
    if (clauseFilter === "all") return null;
    return MOCK_CLAUSES.find((c) => c.id === clauseFilter);
  }, [clauseFilter]);

  // 统计数据
  const stats = useMemo(() => {
    const total = cous.length;
    const active = cous.filter((c) => c.status === "active").length;
    const pending = cous.filter((c) => c.status === "pending").length;
    const highWeight = cous.filter((c) => (c.weight || 0) >= 10).length;
    const thisMonth = cous.filter((c) => {
      const created = new Date(c.createdAt);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;
    return { total, active, pending, highWeight, thisMonth };
  }, [cous]);

  // 政策列表（按级别分组）
  const policiesByLevel = useMemo(() => {
    const grouped: Record<string, Policy[]> = {};
    MOCK_POLICIES.forEach((policy) => {
      if (!grouped[policy.level]) {
        grouped[policy.level] = [];
      }
      grouped[policy.level].push(policy);
    });
    return grouped;
  }, []);

  // 当 initialClauseId 变化时更新筛选
  useEffect(() => {
    if (initialClauseId) {
      setClauseFilter(initialClauseId);
    } else {
      setClauseFilter("all");
    }
  }, [initialClauseId]);

  // 显示全部COU
  const handleShowAll = useCallback(() => {
    setClauseFilter("all");
    setQuickFilter(null);
    setSelectedPolicyIds([]);
    toast.success("已显示全部COU");
  }, []);

  // 排序状态
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    order: "asc" | "desc";
  } | null>({ key: "weight", order: "desc" });

  // 选中状态
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 筛选后的数据
  const filteredCOUs = useMemo(() => {
    let data = [...cous];

    // 快捷筛选
    if (quickFilter === "high-weight") {
      data = data.filter((cou) => (cou.weight || 0) >= 10);
    } else if (quickFilter === "pending") {
      data = data.filter((cou) => cou.status === "pending");
    } else if (quickFilter === "recent") {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      data = data.filter((cou) => new Date(cou.updatedAt) > thirtyDaysAgo);
    }

    // 搜索筛选
    if (search) {
      const searchLower = search.toLowerCase();
      data = data.filter(
        (cou) =>
          cou.title?.toLowerCase().includes(searchLower) ||
          cou.code?.toLowerCase().includes(searchLower) ||
          cou.description?.toLowerCase().includes(searchLower) ||
          cou.policyName?.toLowerCase().includes(searchLower)
      );
    }

    // 政策级别筛选
    if (levelFilter !== "all") {
      data = data.filter((cou) => {
        const policy = MOCK_POLICIES.find((p) => p.id === cou.policyId);
        return policy?.level === levelFilter;
      });
    }

    // 政策多选筛选
    if (selectedPolicyIds.length > 0) {
      data = data.filter((cou) => selectedPolicyIds.includes(cou.policyId));
    }

    // 状态筛选
    if (statusFilter !== "all") {
      data = data.filter((cou) => cou.status === statusFilter);
    }

    // 行业筛选
    if (industryFilter.length > 0) {
      data = data.filter((cou) =>
        cou.industries?.some((ind) => industryFilter.includes(ind))
      );
    }

    // 权重范围筛选
    data = data.filter((cou) => {
      const weight = cou.weight || 0;
      return weight >= weightRange[0] && weight <= weightRange[1];
    });

    // 条款筛选
    if (clauseFilter !== "all") {
      data = data.filter((cou) => cou.clauseId === clauseFilter);
    }

    // 排序
    if (sortConfig) {
      data.sort((a, b) => {
        let aVal: unknown;
        let bVal: unknown;

        switch (sortConfig.key) {
          case "weight":
            aVal = a.weight || 0;
            bVal = b.weight || 0;
            break;
          case "code":
            aVal = a.code || "";
            bVal = b.code || "";
            break;
          case "policyName":
            aVal = a.policyName || "";
            bVal = b.policyName || "";
            break;
          case "updatedAt":
            aVal = new Date(a.updatedAt).getTime();
            bVal = new Date(b.updatedAt).getTime();
            break;
          default:
            aVal = a[sortConfig.key as keyof COU] || "";
            bVal = b[sortConfig.key as keyof COU] || "";
        }

        if (typeof aVal === "string") {
          return sortConfig.order === "asc"
            ? aVal.localeCompare(bVal as string)
            : (bVal as string).localeCompare(aVal);
        }

        return sortConfig.order === "asc"
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      });
    }

    return data;
  }, [cous, search, levelFilter, statusFilter, industryFilter, weightRange, clauseFilter, quickFilter, selectedPolicyIds, sortConfig]);

  // 处理排序
  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return { key, order: prev.order === "asc" ? "desc" : "asc" };
      }
      return { key, order: "desc" };
    });
  }, []);

  // 处理单选
  const handleSelect = useCallback((id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  // 处理全选
  const handleSelectAll = useCallback(
    (selected: boolean) => {
      if (selected) {
        setSelectedIds(new Set(filteredCOUs.map((cou) => cou.id)));
      } else {
        setSelectedIds(new Set());
      }
    },
    [filteredCOUs]
  );

  // 处理行点击
  const handleRowClick = useCallback((cou: COU) => {
    setSelectedCOU(cou);
    setShowDetailPanel(true);
    onCOUClick?.(cou);
  }, [onCOUClick]);

  // 查看完整详情
  const handleViewDetail = useCallback((cou: COU) => {
    setSelectedCOU(cou);
    setBrowserView("detail");
    setShowDetailPanel(false);
  }, []);

  // 编辑COU
  const handleEditCOU = useCallback((cou: COU) => {
    setSelectedCOU(cou);
    setBrowserView("edit");
    setShowDetailPanel(false);
  }, []);

  // 保存COU
  const handleSaveCOU = useCallback((updatedCOU: COU) => {
    setCous((prev) =>
      prev.map((c) => (c.id === updatedCOU.id ? updatedCOU : c))
    );
    setSelectedCOU(updatedCOU);
    setBrowserView("detail");
    toast.success("COU保存成功");
  }, []);

  // 返回列表
  const handleBackToList = useCallback(() => {
    setBrowserView("list");
    setSelectedCOU(null);
  }, []);

  // 删除COU
  const handleDeleteCOU = useCallback((id: string) => {
    setCous((prev) => prev.filter((c) => c.id !== id));
    setBrowserView("list");
    setSelectedCOU(null);
    toast.success("COU已删除");
  }, []);

  // 批量操作
  const handleBatchModifyTags = () => {
    toast.success(`修改 ${selectedIds.size} 个COU的标签`);
  };

  const handleBatchModifyIndustry = () => {
    toast.success(`修改 ${selectedIds.size} 个COU的行业`);
  };

  const handleBatchModifyWeight = () => {
    toast.success(`修改 ${selectedIds.size} 个COU的权重`);
  };

  const handleBatchExport = () => {
    toast.success(`导出 ${selectedIds.size} 个COU`);
  };

  const handleBatchDelete = () => {
    toast.success(`删除 ${selectedIds.size} 个COU`);
    setSelectedIds(new Set());
  };

  // 表格列定义
  const columns = useMemo(
    () => [
      {
        key: "code",
        title: "COU编码",
        width: 130,
        sorter: true,
        render: (cou: COU) => (
          <span className="font-mono text-xs text-slate-600">{cou.code}</span>
        ),
      },
      {
        key: "title",
        title: "义务描述",
        width: 280,
        render: (cou: COU) => (
          <div>
            <div className="font-medium text-slate-800 truncate">{cou.title}</div>
            <div className="text-xs text-slate-500 truncate">{cou.description}</div>
          </div>
        ),
      },
      {
        key: "policyName",
        title: "来源政策",
        width: 160,
        sorter: true,
        render: (cou: COU) => {
          const policy = MOCK_POLICIES.find((p) => p.id === cou.policyId);
          const level = policy?.level as PolicyLevel;
          const config = level ? LEVEL_CONFIG[level] : null;
          return (
            <div
              className="cursor-pointer hover:text-blue-600"
              onClick={(e) => {
                e.stopPropagation();
                onPolicyClick?.(cou.policyId);
              }}
            >
              <div className="truncate text-sm">{cou.policyName}</div>
              {config && (
                <Badge className={`text-[10px] ${config.bg} ${config.color} border-0`}>
                  {level}
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        key: "weight",
        title: "权重",
        width: 70,
        sorter: true,
        render: (cou: COU) => {
          const weight = cou.weight || 0;
          let colorClass = "text-blue-600";
          if (weight >= 12) colorClass = "text-red-600";
          else if (weight >= 9) colorClass = "text-orange-600";
          else if (weight >= 6) colorClass = "text-yellow-600";
          return (
            <div className="flex items-center gap-1">
              <Zap className={`w-3 h-3 ${colorClass}`} />
              <span className={`font-semibold ${colorClass}`}>{weight.toFixed(1)}</span>
            </div>
          );
        },
      },
      {
        key: "status",
        title: "状态",
        width: 70,
        render: (cou: COU) => {
          const status = STATUS_CONFIG[cou.status || "active"];
          return (
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${status.color}`} />
              <span className={`text-xs ${status.text}`}>{status.label}</span>
            </div>
          );
        },
      },
      {
        key: "updatedAt",
        title: "更新时间",
        width: 100,
        sorter: true,
        render: (cou: COU) => (
          <span className="text-xs text-slate-500">
            {new Date(cou.updatedAt).toLocaleDateString("zh-CN")}
          </span>
        ),
      },
    ],
    [onPolicyClick]
  );

  // 行业列表
  const industries = useMemo(() => {
    const set = new Set<string>();
    cous.forEach((cou) => cou.industries?.forEach((ind) => set.add(ind)));
    return Array.from(set).sort();
  }, [cous]);

  // 渲染详情视图
  if (browserView === "detail" && selectedCOU) {
    return (
      <COUDetail
        cou={selectedCOU}
        onBack={handleBackToList}
        onEdit={handleEditCOU}
        onDelete={handleDeleteCOU}
        onNavigateToClause={onClauseClick}
        onNavigateToPolicy={onPolicyClick}
      />
    );
  }

  // 渲染编辑视图
  if (browserView === "edit" && selectedCOU) {
    return (
      <COUForm
        initialCOU={selectedCOU}
        onSave={handleSaveCOU}
        onCancel={handleBackToList}
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* 顶部统计概览栏 */}
      <div className="px-6 py-3 bg-white border-b border-slate-200">
        <div className="grid grid-cols-5 gap-4">
          <StatCard
            title="COU总数"
            value={stats.total.toLocaleString()}
            change="+12%"
            icon={Target}
            color="bg-gradient-to-br from-purple-500 to-pink-500"
          />
          <StatCard
            title="当前生效"
            value={stats.active.toLocaleString()}
            change={`${((stats.active / stats.total) * 100).toFixed(0)}%`}
            icon={CheckCircle2}
            color="bg-gradient-to-br from-green-500 to-emerald-500"
          />
          <StatCard
            title="待审COU"
            value={stats.pending.toLocaleString()}
            icon={Clock}
            color="bg-gradient-to-br from-amber-500 to-orange-500"
          />
          <StatCard
            title="高权重COU"
            value={stats.highWeight.toLocaleString()}
            change="≥10分"
            icon={AlertCircle}
            color="bg-gradient-to-br from-red-500 to-rose-500"
          />
          <StatCard
            title="本月新增"
            value={stats.thisMonth.toString()}
            change="持续更新"
            icon={TrendingUp}
            color="bg-gradient-to-br from-blue-500 to-cyan-500"
          />
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧筛选面板 */}
        <div className="w-72 bg-white border-r border-slate-200 flex flex-col h-full">
          {/* 返回按钮 */}
          {onBackToClauses && (
            <div className="p-4 border-b border-slate-100 shrink-0">
              <Button variant="ghost" size="sm" onClick={onBackToClauses} className="gap-2 w-full justify-start">
                <ArrowLeft className="w-4 h-4" />
                返回条款列表
              </Button>
            </div>
          )}

          <ScrollArea className="flex-1 h-full">
            <div className="p-4 space-y-6">
              {/* 快捷筛选 */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  快捷筛选
                </h3>
                <div className="space-y-2">
                  <QuickFilter
                    label="高权重COU"
                    count={stats.highWeight}
                    active={quickFilter === "high-weight"}
                    onClick={() => setQuickFilter(quickFilter === "high-weight" ? null : "high-weight")}
                    icon={AlertCircle}
                  />
                  <QuickFilter
                    label="待审COU"
                    count={stats.pending}
                    active={quickFilter === "pending"}
                    onClick={() => setQuickFilter(quickFilter === "pending" ? null : "pending")}
                    icon={Clock}
                  />
                  <QuickFilter
                    label="最近更新"
                    count={cous.filter((c) => new Date(c.updatedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
                    active={quickFilter === "recent"}
                    onClick={() => setQuickFilter(quickFilter === "recent" ? null : "recent")}
                    icon={Activity}
                  />
                </div>
              </div>

              <Separator />

              {/* 权重范围 */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-blue-500" />
                  权重范围
                </h3>
                <div className="px-1">
                  <Slider
                    value={weightRange}
                    onValueChange={(value) => setWeightRange(value as [number, number])}
                    min={0}
                    max={15}
                    step={1}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{weightRange[0]}分</span>
                    <span>{weightRange[1]}分</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* 状态筛选 */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  状态
                </h3>
                <div className="space-y-2">
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={statusFilter === key}
                        onCheckedChange={(checked) => {
                          setStatusFilter(checked ? key : "all");
                        }}
                      />
                      <div className={`w-2 h-2 rounded-full ${config.color}`} />
                      <span className="text-sm text-slate-600">{config.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Separator />

              {/* 行业筛选 */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-cyan-500" />
                  适用行业
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {industries.map((industry) => (
                    <label key={industry} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={industryFilter.includes(industry)}
                        onCheckedChange={(checked) => {
                          setIndustryFilter((prev) =>
                            checked
                              ? [...prev, industry]
                              : prev.filter((i) => i !== industry)
                          );
                        }}
                      />
                      <span className="text-sm text-slate-600">{industry}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Separator />

              {/* 来源政策（按级别分组） */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-500" />
                  来源政策
                </h3>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {Object.entries(policiesByLevel).map(([level, policies]) => (
                    <div key={level}>
                      <div className={`text-xs font-medium mb-2 ${LEVEL_CONFIG[level as PolicyLevel]?.color || "text-slate-600"}`}>
                        {level}
                      </div>
                      <div className="space-y-1">
                        {policies.map((policy) => (
                          <label key={policy.id} className="flex items-start gap-2 cursor-pointer">
                            <Checkbox
                              checked={selectedPolicyIds.includes(policy.id)}
                              onCheckedChange={(checked) => {
                                setSelectedPolicyIds((prev) =>
                                  checked
                                    ? [...prev, policy.id]
                                    : prev.filter((id) => id !== policy.id)
                                );
                              }}
                              className="mt-0.5"
                            />
                            <span className="text-xs text-slate-600 line-clamp-2">{policy.title}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 重置筛选 - 粘性底部 */}
              <div className="sticky bottom-0 pt-4 pb-2 bg-white">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setQuickFilter(null);
                    setStatusFilter("all");
                    setIndustryFilter([]);
                    setWeightRange([0, 15]);
                    setSelectedPolicyIds([]);
                    setSearch("");
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  重置所有筛选
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* 中间内容区 */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* 工具栏 */}
          <div className="px-6 py-3 bg-white border-b border-slate-200 flex items-center gap-3">
            {/* 搜索 */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="搜索COU编码、描述、来源政策..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>

            {/* 视图切换 */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "table" ? "bg-white text-slate-700 shadow-sm" : "text-slate-400"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("card")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "card" ? "bg-white text-slate-700 shadow-sm" : "text-slate-400"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1" />

            {/* 操作按钮 */}
            {clauseFilter !== "all" && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
                onClick={handleShowAll}
              >
                <FileSearch className="w-4 h-4" />
                显示全部
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              导出
            </Button>
            <Button
              size="sm"
              className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              onClick={onNavigateToWorkbench}
            >
              <Plus className="w-4 h-4" />
              新增COU
            </Button>
          </div>

          {/* 当前条款信息提示条 */}
          {clauseFilter !== "all" && currentClause && (
            <div className="px-6 py-2 bg-purple-50 border-b border-purple-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-purple-500" />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">当前筛选：</span>
                    <Badge variant="outline" className="text-xs bg-white">
                      {currentClause.policyTitle}
                    </Badge>
                    <Badge className="text-xs bg-purple-100 text-purple-700 border-0">
                      {currentClause.chapter}
                    </Badge>
                    <span className="font-medium text-slate-800">{currentClause.article}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-slate-600 h-7 w-7 p-0"
                  onClick={handleShowAll}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* 数据表格/卡片 */}
          <div className="flex-1 p-4 overflow-y-auto">
            {viewMode === "table" ? (
              <VirtualTable
                data={filteredCOUs}
                columns={columns}
                rowKey={(record) => record.id}
                selectedIds={selectedIds}
                onSelect={handleSelect}
                onSelectAll={handleSelectAll}
                onRowClick={handleRowClick}
                sortConfig={sortConfig}
                onSort={handleSort}
                expandedRowRender={(cou) => (
                  <div className="text-sm text-slate-600 py-2">
                    <p className="mb-2"><strong>完整描述:</strong> {cou.description}</p>
                    <div className="flex gap-4 flex-wrap">
                      <span><strong>关联条款:</strong> {cou.clauseNumber}</span>
                      <span><strong>适用行业:</strong> {cou.industries?.join(", ")}</span>
                      <span><strong>适用地区:</strong> {cou.regions?.join(", ")}</span>
                      <span><strong>标签:</strong> {cou.tags?.join(", ")}</span>
                    </div>
                  </div>
                )}
              />
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredCOUs.slice(0, 50).map((cou) => (
                  <Card
                    key={cou.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedIds.has(cou.id) ? "ring-2 ring-purple-500" : ""
                    }`}
                    onClick={() => handleRowClick(cou)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {cou.code}
                        </Badge>
                        <div className={`w-2 h-2 rounded-full ${STATUS_CONFIG[cou.status || "active"].color}`} />
                      </div>
                      <h4 className="font-medium text-slate-800 mb-1 line-clamp-2">{cou.title}</h4>
                      <p className="text-xs text-slate-500 mb-3 line-clamp-2">{cou.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 truncate max-w-[120px]">{cou.policyName}</span>
                        <span className={`font-semibold ${cou.weight && cou.weight >= 10 ? "text-red-600" : "text-blue-600"}`}>
                          {cou.weight}分
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* 批量操作栏 */}
          <BatchActionBar
            selectedCount={selectedIds.size}
            totalCount={filteredCOUs.length}
            onClearSelection={() => setSelectedIds(new Set())}
            onSelectAll={() => handleSelectAll(true)}
            onModifyTags={handleBatchModifyTags}
            onModifyIndustry={handleBatchModifyIndustry}
            onModifyWeight={handleBatchModifyWeight}
            onExport={handleBatchExport}
            onDelete={handleBatchDelete}
          />
        </div>

        {/* 右侧详情面板 */}
        {showDetailPanel && selectedCOU && (
          <div className="w-80 bg-white border-l border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">COU详情</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setShowDetailPanel(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">COU编码</p>
                  <p className="font-mono text-sm text-slate-800">{selectedCOU.code}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">义务描述</p>
                  <p className="text-sm text-slate-800 font-medium">{selectedCOU.title}</p>
                  <p className="text-sm text-slate-600 mt-1">{selectedCOU.description}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-slate-500 mb-1">来源政策</p>
                  <p className="text-sm text-slate-800">{selectedCOU.policyName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">关联条款</p>
                  <p className="text-sm text-slate-800">{selectedCOU.clauseNumber}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">权重</p>
                    <p className={`text-lg font-bold ${selectedCOU.weight && selectedCOU.weight >= 10 ? "text-red-600" : "text-blue-600"}`}>
                      {selectedCOU.weight}分
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">状态</p>
                    <Badge className={`${STATUS_CONFIG[selectedCOU.status || "active"].bg} ${STATUS_CONFIG[selectedCOU.status || "active"].text}`}>
                      {STATUS_CONFIG[selectedCOU.status || "active"].label}
                    </Badge>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-slate-500 mb-1">适用行业</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedCOU.industries?.map((ind) => (
                      <Badge key={ind} variant="outline" className="text-xs">
                        {ind}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">标签</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedCOU.tags?.map((tag) => (
                      <Badge key={tag} className="text-xs bg-purple-100 text-purple-700 border-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Separator />
                <div className="text-xs text-slate-500">
                  <p>创建时间: {new Date(selectedCOU.createdAt).toLocaleString("zh-CN")}</p>
                  <p className="mt-1">更新时间: {new Date(selectedCOU.updatedAt).toLocaleString("zh-CN")}</p>
                </div>
                <div className="pt-2 space-y-2">
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={() => handleViewDetail(selectedCOU)}
                  >
                    查看完整详情
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    size="sm"
                    onClick={() => handleEditCOU(selectedCOU)}
                  >
                    编辑COU
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}

export default COUBrowser;
