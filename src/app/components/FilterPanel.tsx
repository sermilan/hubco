import { FilterCriteria, PolicyLevel, Industry } from "../types";
import { TAGS } from "../data/mockData";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import { Search, X } from "lucide-react";
import { Button } from "./ui/button";

interface FilterPanelProps {
  filters: FilterCriteria;
  onFilterChange: (filters: FilterCriteria) => void;
}

const POLICY_LEVELS: PolicyLevel[] = ["法律", "行政法规", "部门规章", "国家标准", "行业标准", "地方性法规"];
const INDUSTRIES: Industry[] = [
  "通用",
  "金融",
  "医疗",
  "电信",
  "互联网",
  "能源",
  "教育",
  "交通",
  "政务",
  "制造",
];

export function FilterPanel({ filters, onFilterChange }: FilterPanelProps) {
  const handleLevelToggle = (level: PolicyLevel) => {
    const newLevels = filters.levels.includes(level)
      ? filters.levels.filter((l) => l !== level)
      : [...filters.levels, level];
    onFilterChange({ ...filters, levels: newLevels });
  };

  const handleIndustryToggle = (industry: Industry) => {
    const newIndustries = filters.industries.includes(industry)
      ? filters.industries.filter((i) => i !== industry)
      : [...filters.industries, industry];
    onFilterChange({ ...filters, industries: newIndustries });
  };

  const handleTagToggle = (tagId: string) => {
    const newTags = filters.tags.includes(tagId)
      ? filters.tags.filter((t) => t !== tagId)
      : [...filters.tags, tagId];
    onFilterChange({ ...filters, tags: newTags });
  };

  const handleWeightChange = (value: number[]) => {
    onFilterChange({
      ...filters,
      weightRange: [value[0], value[1]],
    });
  };

  const resetFilters = () => {
    onFilterChange({
      keyword: "",
      levels: [],
      industries: [],
      tags: [],
      weightRange: [1, 10],
    });
  };

  const hasActiveFilters =
    filters.keyword ||
    filters.levels.length > 0 ||
    filters.industries.length > 0 ||
    filters.tags.length > 0 ||
    filters.weightRange[0] !== 1 ||
    filters.weightRange[1] !== 10;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3>筛选条件</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-sm"
          >
            <X className="size-4 mr-1" />
            清除筛选
          </Button>
        )}
      </div>

      {/* 关键词搜索 */}
      <div className="space-y-2">
        <Label>关键词搜索</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input
            placeholder="搜索政策或条款..."
            value={filters.keyword}
            onChange={(e) =>
              onFilterChange({ ...filters, keyword: e.target.value })
            }
            className="pl-10"
          />
        </div>
      </div>

      {/* 政策级别 */}
      <div className="space-y-3">
        <Label>政策级别</Label>
        <div className="space-y-2">
          {POLICY_LEVELS.map((level) => (
            <div key={level} className="flex items-center space-x-2">
              <Checkbox
                id={`level-${level}`}
                checked={filters.levels.includes(level)}
                onCheckedChange={() => handleLevelToggle(level)}
              />
              <label
                htmlFor={`level-${level}`}
                className="text-sm cursor-pointer select-none"
              >
                {level}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* 行业分类 */}
      <div className="space-y-3">
        <Label>行业分类</Label>
        <div className="space-y-2">
          {INDUSTRIES.map((industry) => (
            <div key={industry} className="flex items-center space-x-2">
              <Checkbox
                id={`industry-${industry}`}
                checked={filters.industries.includes(industry)}
                onCheckedChange={() => handleIndustryToggle(industry)}
              />
              <label
                htmlFor={`industry-${industry}`}
                className="text-sm cursor-pointer select-none"
              >
                {industry}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* 标签 */}
      <div className="space-y-3">
        <Label>标签筛选</Label>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => (
            <Badge
              key={tag.id}
              className={`cursor-pointer transition-all ${
                filters.tags.includes(tag.id)
                  ? `${tag.color} text-white`
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => handleTagToggle(tag.id)}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* 权重范围 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>权重范围</Label>
          <span className="text-sm text-gray-600">
            {filters.weightRange[0]} - {filters.weightRange[1]}
          </span>
        </div>
        <Slider
          min={1}
          max={10}
          step={1}
          value={filters.weightRange}
          onValueChange={handleWeightChange}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>低权重</span>
          <span>高权重</span>
        </div>
      </div>
    </div>
  );
}