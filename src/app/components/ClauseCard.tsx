import { Clause } from "../types";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { BookOpen, Weight, Tag, Hash } from "lucide-react";

interface ClauseCardProps {
  clause: Clause;
  onAddToScenario?: () => void;
  selected?: boolean;
}

export function ClauseCard({ clause, onAddToScenario, selected }: ClauseCardProps) {
  const getWeightColor = (weight: number) => {
    if (weight >= 9) return "text-red-600";
    if (weight >= 7) return "text-orange-600";
    if (weight >= 5) return "text-yellow-600";
    return "text-green-600";
  };

  const getWeightBg = (weight: number) => {
    if (weight >= 9) return "bg-red-100";
    if (weight >= 7) return "bg-orange-100";
    if (weight >= 5) return "bg-yellow-100";
    return "bg-green-100";
  };

  const getComplianceTypeBadge = (type: string) => {
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

  return (
    <Card
      className={`p-3 sm:p-4 hover:shadow-md transition-all cursor-pointer ${
        selected ? "ring-2 ring-blue-500" : ""
      }`}
      onClick={onAddToScenario}
    >
      {/* 头部信息 */}
      <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
            <BookOpen className="size-3.5 sm:size-4 text-gray-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-gray-500 truncate">
              {clause.policyTitle}
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs font-mono">
              {clause.article}
            </Badge>
            {clause.complianceType && (
              <Badge className={`text-xs ${getComplianceTypeBadge(clause.complianceType)}`}>
                {clause.complianceType}
              </Badge>
            )}
          </div>
        </div>
        <div
          className={`flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full ${getWeightBg(
            clause.weight
          )} flex-shrink-0`}
        >
          <Weight className={`size-3 sm:size-4 ${getWeightColor(clause.weight)}`} />
          <span className={`text-xs sm:text-sm font-medium ${getWeightColor(clause.weight)}`}>
            {clause.weight}
          </span>
        </div>
      </div>

      {/* 条款内容 */}
      <p className="text-sm sm:text-base text-gray-700 mb-2 sm:mb-3 leading-relaxed line-clamp-3">
        {clause.content}
      </p>

      {/* 标签区域 */}
      {clause.tags && clause.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-2">
          {clause.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag.id}
              className={`${tag.color} text-white text-xs`}
              variant="secondary"
            >
              <Tag className="size-2.5 sm:size-3 mr-0.5 sm:mr-1" />
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

      {/* 关键词 */}
      {clause.keywords && clause.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1 sm:gap-1.5">
          {clause.keywords.slice(0, 4).map((keyword, idx) => (
            <span
              key={idx}
              className="px-1.5 sm:px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs flex items-center gap-0.5"
            >
              <Hash className="size-2.5 sm:size-3" />
              {keyword}
            </span>
          ))}
          {clause.keywords.length > 4 && (
            <span className="text-xs text-gray-400 px-1">
              +{clause.keywords.length - 4}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
