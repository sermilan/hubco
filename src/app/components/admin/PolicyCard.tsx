// ============ 政策卡片组件 ============
// 在PolicyBrowser中使用的政策信息卡片

import React from "react";
import {
  FileText,
  Scale,
  Building2,
  Calendar,
  Hash,
  ChevronRight,
  Layers,
  Zap,
} from "lucide-react";
import { Badge } from "../ui/badge";
import type { Policy } from "../../types";
import { POLICY_LEVELS } from "../../data/mockData";

interface PolicyCardProps {
  policy: Policy;
  onClick?: () => void;
  isSelected?: boolean;
}

// 政策级别配置
const LEVEL_CONFIG: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  法律: {
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    icon: <Scale className="w-4 h-4" />,
  },
  行政法规: {
    color: "text-orange-600",
    bg: "bg-orange-50 border-orange-200",
    icon: <FileText className="w-4 h-4" />,
  },
  部门规章: {
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    icon: <Building2 className="w-4 h-4" />,
  },
  国家标准: {
    color: "text-green-600",
    bg: "bg-green-50 border-green-200",
    icon: <Layers className="w-4 h-4" />,
  },
  行业标准: {
    color: "text-purple-600",
    bg: "bg-purple-50 border-purple-200",
    icon: <Layers className="w-4 h-4" />,
  },
  地方性法规: {
    color: "text-cyan-600",
    bg: "bg-cyan-50 border-cyan-200",
    icon: <Building2 className="w-4 h-4" />,
  },
  规范性文件: {
    color: "text-gray-600",
    bg: "bg-gray-50 border-gray-200",
    icon: <FileText className="w-4 h-4" />,
  },
};

export function PolicyCard({ policy, onClick, isSelected }: PolicyCardProps) {
  const levelConfig = LEVEL_CONFIG[policy.level] || LEVEL_CONFIG.规范性文件;

  // 格式化日期
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "short",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        group relative bg-white rounded-xl border-2 cursor-pointer
        transition-all duration-200 ease-out
        hover:shadow-lg hover:-translate-y-1
        ${isSelected ? "border-blue-500 shadow-lg shadow-blue-500/20" : "border-slate-200 hover:border-blue-300"}
      `}
    >
      {/* 选中指示器 */}
      {isSelected && (
        <div className="absolute -top-px -right-px w-6 h-6 bg-blue-500 rounded-bl-lg rounded-tr-lg flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      <div className="p-5">
        {/* 顶部：级别标签 + 权重 */}
        <div className="flex items-start justify-between mb-3">
          <div className={`
            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
            ${levelConfig.bg} ${levelConfig.color}
          `}>
            {levelConfig.icon}
            {policy.level}
          </div>
          <div className="flex items-center gap-1 text-amber-600">
            <Zap className="w-3.5 h-3.5" />
            <span className="text-sm font-semibold">{policy.baseWeight}</span>
          </div>
        </div>

        {/* 标题 */}
        <h3 className="text-base font-semibold text-slate-800 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
          {policy.title}
        </h3>

        {/* 文号 */}
        {policy.documentNumber && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
            <Hash className="w-3 h-3" />
            <span className="truncate">{policy.documentNumber}</span>
          </div>
        )}

        {/* 行业标签 */}
        {policy.industries && policy.industries.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {policy.industries.slice(0, 3).map((industry) => (
              <Badge
                key={industry}
                variant="outline"
                className="text-[10px] px-1.5 py-0.5 bg-slate-50 text-slate-600 border-slate-200"
              >
                {industry}
              </Badge>
            ))}
            {policy.industries.length > 3 && (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0.5 bg-slate-50 text-slate-400 border-slate-200"
              >
                +{policy.industries.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* 底部信息：条款数 + 日期 */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              {policy.clauses?.length || 0}条款
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(policy.publishDate)}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </div>
  );
}

export default PolicyCard;
