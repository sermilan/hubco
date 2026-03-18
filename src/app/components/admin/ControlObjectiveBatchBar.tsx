// ============ 控制目标批量操作工具栏 ============
// 支持多选批量操作：修改类别、重要性、状态、导出、删除

import React from "react";
import {
  X,
  Trash2,
  Download,
  Layers,
  Scale,
  CheckCircle,
  AlertCircle,
  Target,
  Sparkles,
  Search,
  Shield,
  Link2,
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";
import type { ControlObjective, ControlCategory } from "../../types";

// 控制类别配置
const CATEGORY_OPTIONS: { value: ControlCategory; label: string; icon: React.ReactNode }[] = [
  { value: "预防性", label: "预防性", icon: <Sparkles className="w-3 h-3" /> },
  { value: "检测性", label: "检测性", icon: <Search className="w-3 h-3" /> },
  { value: "纠正性", label: "纠正性", icon: <Target className="w-3 h-3" /> },
  { value: "管理性", label: "管理性", icon: <Layers className="w-3 h-3" /> },
  { value: "技术性", label: "技术性", icon: <Scale className="w-3 h-3" /> },
  { value: "物理性", label: "物理性", icon: <Shield className="w-3 h-3" /> },
];

// 重要性选项
const IMPORTANCE_OPTIONS = [
  { value: "critical", label: "核心" },
  { value: "high", label: "高" },
  { value: "medium", label: "中" },
  { value: "low", label: "低" },
];

// 状态选项
const STATUS_OPTIONS = [
  { value: "active", label: "生效中" },
  { value: "pending", label: "待审" },
  { value: "deprecated", label: "已废弃" },
];

interface ControlObjectiveBatchBarProps {
  selectedCOs: ControlObjective[];
  onClearSelection: () => void;
  onBatchUpdate: (updates: Partial<ControlObjective>) => void;
  onBatchDelete: () => void;
  onBatchExport: () => void;
}

export function ControlObjectiveBatchBar({
  selectedCOs,
  onClearSelection,
  onBatchUpdate,
  onBatchDelete,
  onBatchExport,
}: ControlObjectiveBatchBarProps) {
  const selectedCount = selectedCOs.length;

  // 批量修改类别
  const handleCategoryChange = (category: ControlCategory) => {
    onBatchUpdate({ category });
    toast.success(`已将 ${selectedCount} 个控制目标类别修改为"${category}"`);
  };

  // 批量修改重要性
  const handleImportanceChange = (importance: string) => {
    onBatchUpdate({ importance: importance as any });
    toast.success(`已将 ${selectedCount} 个控制目标重要性修改为"${IMPORTANCE_OPTIONS.find(o => o.value === importance)?.label}"`);
  };

  // 批量修改状态
  const handleStatusChange = (status: string) => {
    onBatchUpdate({ status: status as any });
    toast.success(`已将 ${selectedCount} 个控制目标状态修改为"${STATUS_OPTIONS.find(o => o.value === status)?.label}"`);
  };

  // 批量删除
  const handleDelete = () => {
    if (window.confirm(`确定要删除选中的 ${selectedCount} 个控制目标吗？此操作不可恢复。`)) {
      onBatchDelete();
      toast.success(`已删除 ${selectedCount} 个控制目标`);
    }
  };

  // 批量导出
  const handleExport = () => {
    onBatchExport();
    toast.success(`已导出 ${selectedCount} 个控制目标`);
  };

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-200">
        {/* 选中数量 */}
        <div className="flex items-center gap-2 px-2 border-r border-slate-700">
          <Badge className="bg-blue-500 text-white border-0">{selectedCount}</Badge>
          <span className="text-sm">已选择</span>
        </div>

        {/* 批量操作 */}
        <div className="flex items-center gap-1 px-2">
          {/* 修改类别 */}
          <Select onValueChange={handleCategoryChange}>
            <SelectTrigger className="h-8 w-28 bg-slate-800 border-slate-700 text-white text-xs">
              <Layers className="w-3 h-3 mr-1" />
              <SelectValue placeholder="类别" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  <span className="flex items-center gap-2">
                    {opt.icon}
                    {opt.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 修改重要性 */}
          <Select onValueChange={handleImportanceChange}>
            <SelectTrigger className="h-8 w-28 bg-slate-800 border-slate-700 text-white text-xs">
              <AlertCircle className="w-3 h-3 mr-1" />
              <SelectValue placeholder="重要性" />
            </SelectTrigger>
            <SelectContent>
              {IMPORTANCE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 修改状态 */}
          <Select onValueChange={handleStatusChange}>
            <SelectTrigger className="h-8 w-28 bg-slate-800 border-slate-700 text-white text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-px h-6 bg-slate-700" />

        {/* 导出和删除 */}
        <div className="flex items-center gap-1 px-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-slate-300 hover:text-white hover:bg-slate-800"
            onClick={handleExport}
          >
            <Download className="w-3 h-3 mr-1" />
            导出
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/50"
            onClick={handleDelete}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            删除
          </Button>
        </div>

        <div className="w-px h-6 bg-slate-700" />

        {/* 清除选择 */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
          onClick={onClearSelection}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default ControlObjectiveBatchBar;
