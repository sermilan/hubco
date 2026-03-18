// ============ 筛选面板组件 ============
// 多维度聚合筛选面板，用于PolicyBrowser

import React, { useState, useMemo } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  X,
  Filter,
  Building2,
  Scale,
  Calendar,
  Tag,
} from "lucide-react";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import type { Policy } from "../../types";

// 筛选选项类型
interface FilterOption {
  value: string;
  label: string;
  count: number;
}

// 筛选项分组
interface FilterGroup {
  id: string;
  label: string;
  icon: React.ReactNode;
  options: FilterOption[];
}

interface FilterPanelProps {
  policies: Policy[];
  filters: {
    search: string;
    levels: string[];
    industries: string[];
    years: string[];
    tags: string[];
  };
  onFiltersChange: (filters: FilterPanelProps["filters"]) => void;
  className?: string;
}

export function FilterPanel({
  policies,
  filters,
  onFiltersChange,
  className = "",
}: FilterPanelProps) {
  // 展开/折叠状态
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(["level", "industry", "year"])
  );

  // 计算聚合统计数据
  const filterGroups: FilterGroup[] = useMemo(() => {
    // 政策级别统计
    const levelCounts: Record<string, number> = {};
    const industryCounts: Record<string, number> = {};
    const yearCounts: Record<string, number> = {};

    policies.forEach((policy) => {
      // 级别
      if (policy.level) {
        levelCounts[policy.level] = (levelCounts[policy.level] || 0) + 1;
      }
      // 行业
      if (policy.industries) {
        policy.industries.forEach((ind) => {
          industryCounts[ind] = (industryCounts[ind] || 0) + 1;
        });
      }
      // 年份
      if (policy.publishDate) {
        const year = new Date(policy.publishDate).getFullYear().toString();
        yearCounts[year] = (yearCounts[year] || 0) + 1;
      }
    });

    // 排序函数
    const sortByCount = (a: FilterOption, b: FilterOption) => b.count - a.count;

    return [
      {
        id: "level",
        label: "政策级别",
        icon: <Scale className="w-4 h-4" />,
        options: Object.entries(levelCounts)
          .map(([value, count]) => ({ value, label: value, count }))
          .sort(sortByCount),
      },
      {
        id: "industry",
        label: "行业分类",
        icon: <Building2 className="w-4 h-4" />,
        options: Object.entries(industryCounts)
          .map(([value, count]) => ({ value, label: value, count }))
          .sort(sortByCount),
      },
      {
        id: "year",
        label: "发布时间",
        icon: <Calendar className="w-4 h-4" />,
        options: Object.entries(yearCounts)
          .map(([value, count]) => ({ value, label: `${value}年`, count }))
          .sort((a, b) => b.value.localeCompare(a.value)), // 年份降序
      },
    ];
  }, [policies]);

  // 切换分组展开
  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  // 更新筛选条件
  const updateFilter = (
    key: keyof FilterPanelProps["filters"],
    value: string,
    checked: boolean
  ) => {
    onFiltersChange({
      ...filters,
      [key]: checked
        ? [...(filters[key] as string[]), value]
        : (filters[key] as string[]).filter((v) => v !== value),
    });
  };

  // 清除所有筛选
  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      levels: [],
      industries: [],
      years: [],
      tags: [],
    });
  };

  // 当前激活的筛选数量
  const activeFilterCount =
    filters.levels.length +
    filters.industries.length +
    filters.years.length +
    filters.tags.length;

  // 搜索防抖
  const [searchInput, setSearchInput] = useState(filters.search);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({ ...filters, search: searchInput });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  return (
    <div className={`bg-white rounded-xl border border-slate-200 flex flex-col ${className}`}>
      {/* 头部 */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <Filter className="w-4 h-4 text-blue-500" />
            筛选条件
          </div>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-7 text-xs text-slate-500 hover:text-red-600"
            >
              <X className="w-3 h-3 mr-1" />
              清除 ({activeFilterCount})
            </Button>
          )}
        </div>

        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="搜索政策名称、文号..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 h-9 text-sm bg-slate-50 border-slate-200 focus:bg-white"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 筛选项列表 */}
      <div className="flex-1 overflow-y-auto p-2">
        {filterGroups.map((group) => {
          const isExpanded = expandedGroups.has(group.id);
          const selectedValues =
            group.id === "level"
              ? filters.levels
              : group.id === "industry"
              ? filters.industries
              : filters.years;

          return (
            <div key={group.id} className="mb-2">
              {/* 分组标题 */}
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <span className="text-slate-400">{group.icon}</span>
                  {group.label}
                  {selectedValues.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 text-[10px] h-4 px-1 bg-blue-100 text-blue-700"
                    >
                      {selectedValues.length}
                    </Badge>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {/* 选项列表 */}
              {isExpanded && (
                <div className="mt-1 space-y-0.5">
                  {group.options.map((option) => {
                    const isSelected = selectedValues.includes(option.value);
                    return (
                      <label
                        key={option.value}
                        className={`
                          flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer
                          transition-colors text-sm
                          ${isSelected ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50 text-slate-600"}
                        `}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) =>
                              updateFilter(
                                group.id === "level"
                                  ? "levels"
                                  : group.id === "industry"
                                  ? "industries"
                                  : "years",
                                option.value,
                                e.target.checked
                              )
                            }
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className={isSelected ? "font-medium" : ""}>{option.label}</span>
                        </div>
                        <span
                          className={`text-xs ${
                            isSelected ? "text-blue-600" : "text-slate-400"
                          }`}
                        >
                          {option.count}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 底部统计 */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl">
        <div className="text-xs text-slate-500">
          共筛选出 <span className="font-semibold text-slate-700">{policies.length}</span>; 条政策
        </div>
      </div>
    </div>
  );
}

export default FilterPanel;
