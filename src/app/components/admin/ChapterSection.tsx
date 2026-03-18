// ============ 章节折叠组件 ============
// ClauseEditor 中使用，展示可折叠的章节

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Folder,
  MoreHorizontal,
  CheckSquare,
  Square,
  CheckCircle,
  AlertCircle,
  Goal,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";

interface ChapterSectionProps {
  id: string;
  title: string;
  clauseCount: number;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  actions?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  }[];
  selectedCount?: number;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  className?: string;
  // 控制目标映射统计
  mappingStats?: {
    mapped: number;
    pending: number;
    unmapped: number;
    progress: number;
  };
}

export function ChapterSection({
  id,
  title,
  clauseCount,
  children,
  defaultExpanded = false,
  onToggle,
  actions,
  selectedCount = 0,
  onSelectAll,
  onDeselectAll,
  className = "",
  mappingStats,
}: ChapterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onToggle?.(newExpanded);
  };

  const isAllSelected = selectedCount > 0 && selectedCount === clauseCount;
  const isPartiallySelected = selectedCount > 0 && selectedCount < clauseCount;

  return (
    <div className={`border border-slate-200 rounded-xl overflow-hidden bg-white ${className}`}>
      {/* 章节头部 */}
      <div
        className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors
          ${isExpanded ? "bg-blue-50/50 border-b border-slate-100" : "hover:bg-slate-50"}`}
        onClick={handleToggle}
      >
        <div className="flex items-center gap-3">
          {/* 展开图标 */}
          <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-500" />
            )}
          </div>

          {/* 文件夹图标 */}
          <div className="text-blue-500">
            {isExpanded ? (
              <FolderOpen className="w-5 h-5" />
            ) : (
              <Folder className="w-5 h-5" />
            )}
          </div>

          {/* 标题 */}
          <h3 className="font-semibold text-slate-800">{title}</h3>

          {/* 条款数量 */}
          <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600">
            {clauseCount} 条
          </Badge>

          {/* 选中状态 */}
          {selectedCount > 0 && (
            <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200">
              已选 {selectedCount}
            </Badge>
          )}

          {/* 映射进度 */}
          {mappingStats && (
            <>
              {mappingStats.mapped > 0 && (
                <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {mappingStats.mapped}/{clauseCount} 已映射
                </Badge>
              )}
              {mappingStats.pending > 0 && (
                <Badge className="text-xs bg-yellow-100 text-yellow-700 border-yellow-200">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {mappingStats.pending} 待复核
                </Badge>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* 全选/取消按钮 */}
          {(onSelectAll || onDeselectAll) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                if (isAllSelected) {
                  onDeselectAll?.();
                } else {
                  onSelectAll?.();
                }
              }}
            >
              {isAllSelected ? (
                <>
                  <CheckSquare className="w-3.5 h-3.5 mr-1" />
                  取消全选
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5 mr-1" />
                  全选
                </>
              )}
            </Button>
          )}

          {/* 更多操作 */}
          {actions && actions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actions.map((action, idx) => (
                  <DropdownMenuItem key={idx} onClick={action.onClick}>
                    {action.icon && <span className="mr-2">{action.icon}</span>}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* 章节内容 */}
      {isExpanded && (
        <div className="divide-y divide-slate-100">
          {children}
        </div>
      )}
    </div>
  );
}

export default ChapterSection;
