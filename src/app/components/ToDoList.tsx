// ============ To-Do List 展示组件 ============
// 基于五维标签系统生成的合规待办任务清单

import React, { useState, useMemo } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Calendar,
  User,
  Tag,
  Filter,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import type { ToDoItem, ActionPriority } from "../types";
import {
  ACTION_PRIORITY_INFO,
  ACTION_PRIORITY_ORDER,
} from "../types";
import {
  groupToDoItemsByPriority,
  groupToDoItemsByStatus,
  calculateToDoStats,
  sortToDoItems,
} from "../services/todoGenerator";
import { TAG_CODE_MAP, TAG_DOMAIN_INFO } from "../data/tagDictionary";

// ============ 类型定义 ============

interface ToDoListProps {
  items: ToDoItem[];
  onStatusChange?: (id: string, status: ToDoItem["status"]) => void;
  onItemClick?: (item: ToDoItem) => void;
  showStats?: boolean;
  showFilters?: boolean;
  className?: string;
}

type GroupBy = "priority" | "status" | "deadline" | "none";

// ============ 辅助函数 ============

function getPriorityBadge(priority: ActionPriority, isBlocking: boolean) {
  if (isBlocking) {
    return (
      <Badge className="bg-red-600 text-white hover:bg-red-700">
        <AlertTriangle className="w-3 h-3 mr-1" />
        阻断性
      </Badge>
    );
  }

  const info = ACTION_PRIORITY_INFO[priority];
  const colorMap: Record<ActionPriority, string> = {
    critical: "bg-red-100 text-red-800 hover:bg-red-200",
    high: "bg-orange-100 text-orange-800 hover:bg-orange-200",
    medium: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    low: "bg-green-100 text-green-800 hover:bg-green-200",
  };

  return (
    <Badge className={colorMap[priority]}>
      {info.name}
    </Badge>
  );
}

function getStatusIcon(status: ToDoItem["status"]) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    case "in_progress":
      return <Clock className="w-5 h-5 text-blue-600" />;
    case "overdue":
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    default:
      return <Circle className="w-5 h-5 text-gray-400" />;
  }
}

function formatDueDate(date?: Date): string {
  if (!date) return "无截止日期";

  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `逾期 ${Math.abs(diffDays)} 天`;
  if (diffDays === 0) return "今天到期";
  if (diffDays === 1) return "明天到期";
  if (diffDays <= 7) return `${diffDays} 天后到期`;

  return date.toLocaleDateString("zh-CN");
}

function getDueDateColor(date?: Date, status?: ToDoItem["status"]): string {
  if (status === "completed") return "text-gray-500";
  if (status === "overdue") return "text-red-600 font-semibold";

  if (!date) return "text-gray-500";

  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "text-red-600 font-semibold";
  if (diffDays <= 3) return "text-orange-600 font-semibold";
  if (diffDays <= 7) return "text-yellow-600";
  return "text-gray-600";
}

// ============ 子组件 ============

interface ToDoItemCardProps {
  item: ToDoItem;
  onStatusChange?: (id: string, status: ToDoItem["status"]) => void;
  onClick?: (item: ToDoItem) => void;
}

function ToDoItemCard({ item, onStatusChange, onClick }: ToDoItemCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCheckboxChange = (checked: boolean) => {
    if (onStatusChange) {
      onStatusChange(item.id, checked ? "completed" : "pending");
    }
  };

  const actionTag = TAG_CODE_MAP[item.actionType];
  const domainColor = actionTag
    ? TAG_DOMAIN_INFO[actionTag.domain].color
    : "#6B7280";

  return (
    <Card
      className={`mb-3 hover:shadow-md transition-shadow cursor-pointer ${
        item.status === "completed" ? "opacity-60" : ""
      }`}
      onClick={() => onClick?.(item)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className="mt-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={item.status === "completed"}
              onCheckedChange={handleCheckboxChange}
              className="w-5 h-5"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4
                  className={`font-medium text-sm ${
                    item.status === "completed"
                      ? "line-through text-gray-500"
                      : "text-gray-900"
                  }`}
                >
                  {item.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  来源：{item.sourcePolicy} · {item.sourceCOU}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {getPriorityBadge(item.priority, item.isBlocking)}
                {getStatusIcon(item.status)}
              </div>
            </div>

            <div className="flex items-center gap-4 mt-2 text-xs">
              <span className={getDueDateColor(item.dueDate, item.status)}>
                <Calendar className="w-3 h-3 inline mr-1" />
                {formatDueDate(item.dueDate)}
              </span>

              {actionTag && (
                <span
                  className="flex items-center"
                  style={{ color: domainColor }}
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {actionTag.name}
                </span>
              )}

              {item.assignedTo && (
                <span className="text-gray-500">
                  <User className="w-3 h-3 inline mr-1" />
                  {item.assignedTo}
                </span>
              )}
            </div>

            {/* 检查点折叠面板 */}
            {item.checkPoints.length > 0 && (
              <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-7 text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isOpen ? (
                      <ChevronDown className="w-3 h-3 mr-1" />
                    ) : (
                      <ChevronRight className="w-3 h-3 mr-1" />
                    )}
                    检查点 ({item.checkPoints.length})
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ul className="mt-2 space-y-1">
                    {item.checkPoints.map((point, index) => (
                      <li
                        key={index}
                        className="text-xs text-gray-600 flex items-start gap-2"
                      >
                        <span className="text-gray-400 mt-0.5">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* 交付物 */}
            {item.deliverables && item.deliverables.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {item.deliverables.map((deliverable, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs font-normal"
                  >
                    {deliverable}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ToDoStatsPanelProps {
  items: ToDoItem[];
}

function ToDoStatsPanel({ items }: ToDoStatsPanelProps) {
  const stats = useMemo(() => calculateToDoStats(items), [items]);
  const byStatus = useMemo(() => groupToDoItemsByStatus(items), [items]);
  const byPriority = useMemo(() => groupToDoItemsByPriority(items), [items]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-gray-900">
            {stats.total}
          </div>
          <div className="text-xs text-gray-500">总任务</div>
          <Progress
            value={stats.completionRate * 100}
            className="mt-2 h-1"
          />
          <div className="text-xs text-gray-400 mt-1">
            完成率 {Math.round(stats.completionRate * 100)}%
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-orange-600">
            {byPriority.blocking.length + byPriority.critical.length}
          </div>
          <div className="text-xs text-gray-500">关键/阻断性</div>
          <div className="text-xs text-gray-400 mt-1">
            需优先处理
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-blue-600">
            {byStatus.inProgress.length}
          </div>
          <div className="text-xs text-gray-500">进行中</div>
          <div className="text-xs text-gray-400 mt-1">
            待跟进
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div
            className={`text-2xl font-bold ${
              byStatus.overdue.length > 0 ? "text-red-600" : "text-gray-900"
            }`}
          >
            {byStatus.overdue.length}
          </div>
          <div className="text-xs text-gray-500">已逾期</div>
          <div className="text-xs text-gray-400 mt-1">
            {stats.overdueRate > 0
              ? `逾期率 ${Math.round(stats.overdueRate * 100)}%`
              : "无逾期任务"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============ 主组件 ============

export function ToDoList({
  items,
  onStatusChange,
  onItemClick,
  showStats = true,
  showFilters = true,
  className = "",
}: ToDoListProps) {
  const [groupBy, setGroupBy] = useState<GroupBy>("priority");
  const [filterPriority, setFilterPriority] = useState<ActionPriority[]>([]);
  const [filterStatus, setFilterStatus] = useState<ToDoItem["status"][]>([]);

  // 排序和过滤
  const sortedAndFilteredItems = useMemo(() => {
    let result = sortToDoItems([...items]);

    if (filterPriority.length > 0) {
      result = result.filter((item) =>
        filterPriority.includes(item.priority)
      );
    }

    if (filterStatus.length > 0) {
      result = result.filter((item) =>
        filterStatus.includes(item.status)
      );
    }

    return result;
  }, [items, filterPriority, filterStatus]);

  // 分组
  const groupedItems = useMemo(() => {
    switch (groupBy) {
      case "priority":
        return groupToDoItemsByPriority(sortedAndFilteredItems);
      case "status":
        return groupToDoItemsByStatus(sortedAndFilteredItems);
      default:
        return { all: sortedAndFilteredItems };
    }
  }, [sortedAndFilteredItems, groupBy]);

  // 渲染分组列表
  const renderGroupedList = () => {
    if (groupBy === "priority") {
      const groups = groupedItems as ReturnType<
        typeof groupToDoItemsByPriority
      >;
      const order: (keyof typeof groups)[] = [
        "blocking",
        "critical",
        "high",
        "medium",
        "low",
      ];

      return order.map((key) => {
        const groupItems = groups[key];
        if (groupItems.length === 0) return null;

        const titles: Record<string, string> = {
          blocking: "阻断性任务",
          critical: "关键任务",
          high: "高优先级",
          medium: "中优先级",
          low: "低优先级",
        };

        return (
          <div key={key} className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <span
                className={`w-2 h-2 rounded-full mr-2 ${
                  key === "blocking"
                    ? "bg-red-600"
                    : key === "critical"
                    ? "bg-red-400"
                    : key === "high"
                    ? "bg-orange-400"
                    : key === "medium"
                    ? "bg-yellow-400"
                    : "bg-green-400"
                }`}
              />
              {titles[key]} ({groupItems.length})
            </h3>
            {groupItems.map((item) => (
              <ToDoItemCard
                key={item.id}
                item={item}
                onStatusChange={onStatusChange}
                onClick={onItemClick}
              />
            ))}
          </div>
        );
      });
    }

    if (groupBy === "status") {
      const groups = groupedItems as ReturnType<
        typeof groupToDoItemsByStatus
      >;
      const order: (keyof typeof groups)[] = [
        "overdue",
        "inProgress",
        "pending",
        "completed",
      ];

      return order.map((key) => {
        const groupItems = groups[key];
        if (groupItems.length === 0) return null;

        const titles: Record<string, string> = {
          overdue: "已逾期",
          inProgress: "进行中",
          pending: "待处理",
          completed: "已完成",
        };

        return (
          <div key={key} className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              {titles[key]} ({groupItems.length})
            </h3>
            {groupItems.map((item) => (
              <ToDoItemCard
                key={item.id}
                item={item}
                onStatusChange={onStatusChange}
                onClick={onItemClick}
              />
            ))}
          </div>
        );
      });
    }

    // 无分组
    return (groupedItems as { all: ToDoItem[] }).all.map((item) => (
      <ToDoItemCard
        key={item.id}
        item={item}
        onStatusChange={onStatusChange}
        onClick={onItemClick}
      />
    ));
  };

  return (
    <div className={className}>
      {showStats && <ToDoStatsPanel items={items} />}

      {showFilters && (
        <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">分组：</span>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupBy)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="priority">按优先级</option>
              <option value="status">按状态</option>
              <option value="none">不分组</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">优先级：</span>
            {(["critical", "high", "medium", "low"] as ActionPriority[]).map(
              (p) => (
                <label key={p} className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={filterPriority.includes(p)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilterPriority([...filterPriority, p]);
                      } else {
                        setFilterPriority(filterPriority.filter((x) => x !== p));
                      }
                    }}
                    className="rounded"
                  />
                  {ACTION_PRIORITY_INFO[p].name}
                </label>
              )
            )}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {sortedAndFilteredItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>暂无待办任务</p>
            <p className="text-sm text-gray-400 mt-1">
              所有合规义务已处理完毕
            </p>
          </div>
        ) : (
          renderGroupedList()
        )}
      </div>
    </div>
  );
}

export default ToDoList;
