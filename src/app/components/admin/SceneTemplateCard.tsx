// ============ 场景模板卡片 ============
// 展示预设场景模板信息

import React from "react";
import {
  Target,
  Building2,
  Globe,
  Users,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import type { SceneTemplate } from "../../types";

interface SceneTemplateCardProps {
  template: SceneTemplate;
  isSelected?: boolean;
  onClick?: () => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "出海合规": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  "行业合规": { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  "业务合规": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  "技术合规": { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
};

export function SceneTemplateCard({
  template,
  isSelected,
  onClick,
}: SceneTemplateCardProps) {
  const categoryStyle = CATEGORY_COLORS[template.category] || {
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
  };

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected
          ? "ring-2 ring-purple-500 ring-offset-2 shadow-lg"
          : "hover:border-purple-200"
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{template.icon}</div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-800">{template.name}</h3>
                {template.isPopular && (
                  <Badge className="text-xs bg-orange-100 text-orange-700 border-orange-200">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    热门
                  </Badge>
                )}
              </div>
              <Badge
                variant="outline"
                className={`text-xs ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}
              >
                {template.category}
              </Badge>
            </div>
          </div>
          <div className="text-xs text-slate-400">
            使用 {template.usageCount} 次
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* 描述 */}
        <p className="text-sm text-slate-600 line-clamp-2">
          {template.description}
        </p>

        {/* 目标信息 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">目标行业:</span>
            <div className="flex flex-wrap gap-1">
              {template.targetIndustries.map((ind) => (
                <Badge
                  key={ind}
                  variant="secondary"
                  className="text-xs bg-slate-100 text-slate-600"
                >
                  {ind}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">目标地区:</span>
            <div className="flex flex-wrap gap-1">
              {template.targetRegions.map((reg) => (
                <Badge
                  key={reg}
                  variant="secondary"
                  className="text-xs bg-slate-100 text-slate-600"
                >
                  {reg}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">适用对象:</span>
            <span className="text-slate-600">
              {template.targetUserTypes.join("、")}
            </span>
          </div>
        </div>

        {/* 标签预览 */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <Target className="w-3.5 h-3.5" />
            <span>预设标签</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {template.tagProfile.requiredTags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs bg-blue-50 text-blue-600 border-blue-200"
              >
                {tag}
              </Badge>
            ))}
            {template.tagProfile.preferredTags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs bg-purple-50 text-purple-600 border-purple-200"
              >
                {tag}
              </Badge>
            ))}
            {template.tagProfile.requiredTags.length +
              template.tagProfile.preferredTags.length >
              5 && (
              <Badge variant="outline" className="text-xs text-slate-400">
                +
                {template.tagProfile.requiredTags.length +
                  template.tagProfile.preferredTags.length -
                  5}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SceneTemplateCard;
