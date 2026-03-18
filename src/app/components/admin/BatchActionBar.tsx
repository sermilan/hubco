// ============ 批量操作工具栏 ============
// COUBrowser 中使用，选中多项后显示的操作栏

import React from "react";
import {
  X,
  CheckSquare,
  Tag,
  Building2,
  Scale,
  Download,
  Trash2,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface BatchActionBarProps {
  selectedCount: number;
  totalCount: number;
  onClearSelection: () => void;
  onSelectAll: () => void;
  onModifyTags?: () => void;
  onModifyIndustry?: () => void;
  onModifyWeight?: () => void;
  onExport?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function BatchActionBar({
  selectedCount,
  totalCount,
  onClearSelection,
  onSelectAll,
  onModifyTags,
  onModifyIndustry,
  onModifyWeight,
  onExport,
  onDelete,
  className = "",
}: BatchActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white rounded-xl shadow-2xl border border-slate-200 px-4 py-3 flex items-center gap-4 ${className}`}
    >
      {/* 选中统计 */}
      <div className="flex items-center gap-3 pr-4 border-r border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center">
            <CheckSquare className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-medium text-slate-800">
            已选中 {selectedCount} 项
          </span>
        </div>
        <button
          onClick={onSelectAll}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          全选({totalCount})
        </button>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center gap-2">
        {onModifyTags && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={onModifyTags}
          >
            <Tag className="w-3.5 h-3.5" />
            修改标签
          </Button>
        )}

        {onModifyIndustry && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={onModifyIndustry}
          >
            <Building2 className="w-3.5 h-3.5" />
            修改行业
          </Button>
        )}

        {onModifyWeight && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={onModifyWeight}
          >
            <Scale className="w-3.5 h-3.5" />
            修改权重
          </Button>
        )}

        {onExport && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={onExport}
          >
            <Download className="w-3.5 h-3.5" />
            导出选中
          </Button>
        )}

        {onDelete && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            onClick={onDelete}
          >
            <Trash2 className="w-3.5 h-3.5" />
            删除
          </Button>
        )}
      </div>

      {/* 关闭按钮 */}
      <button
        onClick={onClearSelection}
        className="ml-2 p-1 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <X className="w-4 h-4 text-slate-400" />
      </button>
    </div>
  );
}

export default BatchActionBar;
