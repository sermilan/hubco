// ============ 五维标签选择器 ============
// 支持拖拽选择和层级继承展示

import React, { useState, useMemo, useCallback } from "react";
import {
  Search,
  X,
  ChevronDown,
  ChevronRight,
  Layers,
  Users,
  RefreshCw,
  Shield,
  Zap,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import type { TagDomain, FiveDimensionalTags } from "../../types";
import { TAG_DOMAIN_INFO } from "../../types";
import {
  ALL_TAGS,
  TAGS_BY_DOMAIN,
  TAG_CODE_MAP,
  getTagAncestors,
  getTagDescendants,
  getRelatedTags,
} from "../../data/tagDictionary";

// 维度图标映射
const DOMAIN_ICONS: Record<TagDomain, React.ReactNode> = {
  OBJECT: <Layers className="w-4 h-4" />,
  SUBJECT: <Users className="w-4 h-4" />,
  LIFECYCLE: <RefreshCw className="w-4 h-4" />,
  SECURITY: <Shield className="w-4 h-4" />,
  ACTION: <Zap className="w-4 h-4" />,
};

interface FiveDimensionalTagSelectorProps {
  value: FiveDimensionalTags;
  onChange: (value: FiveDimensionalTags) => void;
  className?: string;
  showPreview?: boolean;
}

export function FiveDimensionalTagSelector({
  value,
  onChange,
  className = "",
  showPreview = true,
}: FiveDimensionalTagSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDomains, setExpandedDomains] = useState<Set<TagDomain>>(
    new Set(["OBJECT", "SUBJECT", "LIFECYCLE", "SECURITY", "ACTION"])
  );
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);

  // 搜索过滤
  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return ALL_TAGS;
    const query = searchQuery.toLowerCase();
    return ALL_TAGS.filter(
      (tag) =>
        tag.name.toLowerCase().includes(query) ||
        tag.code.toLowerCase().includes(query) ||
        tag.keywords.some((k) => k.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  // 按维度分组
  const tagsByDomain = useMemo(() => {
    const grouped: Record<TagDomain, typeof ALL_TAGS> = {
      OBJECT: [],
      SUBJECT: [],
      LIFECYCLE: [],
      SECURITY: [],
      ACTION: [],
    };
    for (const tag of filteredTags) {
      grouped[tag.domain].push(tag);
    }
    return grouped;
  }, [filteredTags]);

  // 获取所有已选标签
  const allSelectedTags = useMemo(() => {
    return [
      ...value.objects,
      ...value.subjects,
      ...value.lifecycles,
      ...value.securities,
      ...value.actions,
    ];
  }, [value]);

  // 切换域展开状态
  const toggleDomain = useCallback((domain: TagDomain) => {
    setExpandedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) {
        next.delete(domain);
      } else {
        next.add(domain);
      }
      return next;
    });
  }, []);

  // 切换标签选择
  const toggleTag = useCallback(
    (tagCode: string, domain: TagDomain) => {
      const key = getDomainKey(domain);
      const currentSelection = value[key];
      const isSelected = currentSelection.includes(tagCode);

      let newSelection: string[];
      if (isSelected) {
        newSelection = currentSelection.filter((code) => code !== tagCode);
      } else {
        newSelection = [...currentSelection, tagCode];
      }

      onChange({ ...value, [key]: newSelection });
    },
    [onChange, value]
  );

  // 移除已选标签
  const removeTag = useCallback(
    (tagCode: string) => {
      const tag = TAG_CODE_MAP[tagCode];
      if (!tag) return;

      const key = getDomainKey(tag.domain);
      onChange({
        ...value,
        [key]: value[key].filter((code) => code !== tagCode),
      });
    },
    [onChange, value]
  );

  // 清空所有选择
  const clearAll = useCallback(() => {
    onChange({
      objects: [],
      subjects: [],
      lifecycles: [],
      securities: [],
      actions: [],
    });
  }, [onChange]);

  // 获取标签继承信息
  const getInheritanceInfo = useCallback((tagCode: string) => {
    const tag = TAG_CODE_MAP[tagCode];
    if (!tag) return null;

    const ancestors = getTagAncestors(tagCode);
    const descendants = getTagDescendants(tagCode);
    const related = getRelatedTags(tagCode);

    return { ancestors, descendants, related };
  }, []);

  return (
    <TooltipProvider>
      <div className={`space-y-4 ${className}`}>
        {/* 搜索栏 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索标签名称、代码或关键词..."
            className="pl-10 bg-white border-slate-200 text-slate-700 placeholder:text-slate-400"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* 已选标签预览 */}
        {showPreview && allSelectedTags.length > 0 && (
          <Card className="bg-blue-50/50 border-blue-200">
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-slate-700">
                  已选标签 ({allSelectedTags.length})
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="text-xs text-slate-500 hover:text-red-500 h-7"
                >
                  清空全部
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {allSelectedTags.map((code) => {
                  const tag = TAG_CODE_MAP[code];
                  if (!tag) return null;
                  return (
                    <Badge
                      key={code}
                      className="cursor-pointer hover:opacity-80"
                      style={{
                        backgroundColor: tag.color + "30",
                        color: tag.color,
                        borderColor: tag.color + "50",
                      }}
                      variant="outline"
                      onClick={() => setSelectedPreview(code)}
                    >
                      {tag.name}
                      <X
                        className="w-3 h-3 ml-1 hover:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTag(code);
                        }}
                      />
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 五维标签选择区 */}
        <div className="grid grid-cols-1 gap-4">
          {(
            ["OBJECT", "SUBJECT", "LIFECYCLE", "SECURITY", "ACTION"] as TagDomain[]
          ).map((domain) => {
            const domainInfo = TAG_DOMAIN_INFO[domain];
            const domainTags = tagsByDomain[domain];
            const domainKey = getDomainKey(domain);
            const selectedCount = value[domainKey].length;
            const isExpanded = expandedDomains.has(domain);

            return (
              <Card
                key={domain}
                className={`bg-white border-slate-200 shadow-sm ${
                  isExpanded ? "lg:col-span-1" : ""
                }`}
              >
                <CardHeader
                  className="py-3 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => toggleDomain(domain)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="p-1.5 rounded"
                        style={{ backgroundColor: domainInfo.color + "20" }}
                      >
                        <span style={{ color: domainInfo.color }}>
                          {DOMAIN_ICONS[domain]}
                        </span>
                      </div>
                      <div>
                        <CardTitle
                          className="text-sm text-slate-800"
                        >
                          {domainInfo.name}
                        </CardTitle>
                        {selectedCount > 0 && (
                          <Badge
                            variant="secondary"
                            className="text-xs mt-0.5"
                          >
                            已选 {selectedCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="space-y-1 max-h-[400px] overflow-y-auto">
                      {domainTags.length === 0 ? (
                        <div className="text-center py-4 text-slate-400 text-sm">
                          无匹配标签
                        </div>
                      ) : (
                        domainTags.map((tag) => {
                          const isSelected = value[domainKey].includes(tag.code);
                          return (
                            <Tooltip key={tag.code}>
                              <TooltipTrigger asChild>
                                <div
                                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                                    isSelected
                                      ? "bg-blue-50 border border-blue-200"
                                      : "hover:bg-slate-100"
                                  }`}
                                  onClick={() => toggleTag(tag.code, domain)}
                                >
                                  <Checkbox
                                    checked={isSelected}
                                    className="border-slate-300 data-[state=checked]:bg-blue-600"
                                  />
                                  <span
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: tag.color }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm text-slate-700 truncate">
                                      {tag.name}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      {tag.code} · 权重{tag.weight}
                                    </div>
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent
                                side="right"
                                className="max-w-xs bg-white border-slate-200"
                              >
                                <div className="space-y-2">
                                  <div className="font-medium text-slate-800">{tag.name}</div>
                                  <div className="text-xs text-slate-600">
                                    {tag.description}
                                  </div>
                                  {tag.parentCode && (
                                    <div className="text-xs text-blue-600">
                                      继承自: {TAG_CODE_MAP[tag.parentCode]?.name}
                                    </div>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* 标签详情预览 */}
        {selectedPreview && (
          <TagDetailPanel
            tagCode={selectedPreview}
            inheritanceInfo={getInheritanceInfo(selectedPreview)}
            onClose={() => setSelectedPreview(null)}
          />
        )}
      </div>
    </TooltipProvider>
  );
}

// 标签详情面板
interface TagDetailPanelProps {
  tagCode: string;
  inheritanceInfo: ReturnType<typeof getTagAncestors> | null;
  onClose: () => void;
}

function TagDetailPanel({ tagCode, inheritanceInfo, onClose }: TagDetailPanelProps) {
  const tag = TAG_CODE_MAP[tagCode];
  if (!tag) return null;

  return (
    <Card className="bg-white border-slate-200 shadow-sm mt-4">
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: tag.color }}
            />
            <CardTitle className="text-base text-slate-800">{tag.name}</CardTitle>
            <Badge variant="outline" className="text-xs text-slate-600">
              {tag.code}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-slate-600">{tag.description}</div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500">维度:</span>{" "}
            <span style={{ color: TAG_DOMAIN_INFO[tag.domain].color }}>
              {TAG_DOMAIN_INFO[tag.domain].name}
            </span>
          </div>
          <div>
            <span className="text-slate-500">基础权重:</span>{" "}
            <span className="text-blue-600 font-medium">{tag.weight}</span>
          </div>
        </div>

        {tag.keywords.length > 0 && (
          <div>
            <span className="text-slate-500 text-sm">AI匹配关键词:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {tag.keywords.map((kw) => (
                <Badge
                  key={kw}
                  variant="secondary"
                  className="text-xs bg-slate-100 text-slate-600"
                >
                  {kw}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {inheritanceInfo && inheritanceInfo.ancestors.length > 0 && (
          <div>
            <span className="text-slate-500 text-sm">继承链:</span>
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              {inheritanceInfo.ancestors.map((ancestor, idx) => (
                <React.Fragment key={ancestor.code}>
                  <Badge
                    variant="outline"
                    className="text-xs"
                    style={{ borderColor: ancestor.color + "50", color: ancestor.color }}
                  >
                    {ancestor.name}
                  </Badge>
                  {idx < inheritanceInfo.ancestors.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  )}
                </React.Fragment>
              ))}
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <Badge className="text-xs text-white" style={{ backgroundColor: tag.color }}>
                {tag.name}
              </Badge>
            </div>
          </div>
        )}

        {tag.relatedCodes && tag.relatedCodes.length > 0 && (
          <div>
            <span className="text-slate-500 text-sm">关联标签:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {tag.relatedCodes.map((code) => {
                const relatedTag = TAG_CODE_MAP[code];
                if (!relatedTag) return null;
                return (
                  <Badge
                    key={code}
                    variant="outline"
                    className="text-xs"
                    style={{
                      borderColor: relatedTag.color + "50",
                      color: relatedTag.color,
                    }}
                  >
                    {relatedTag.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 辅助函数：获取domain对应的key
function getDomainKey(domain: TagDomain): keyof FiveDimensionalTags {
  switch (domain) {
    case "OBJECT":
      return "objects";
    case "SUBJECT":
      return "subjects";
    case "LIFECYCLE":
      return "lifecycles";
    case "SECURITY":
      return "securities";
    case "ACTION":
      return "actions";
  }
}

export default FiveDimensionalTagSelector;
