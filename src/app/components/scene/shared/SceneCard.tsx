// ============ SceneCard ============
// 场景卡片组件 - 用于展示场景模板或已创建场景

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import {
  Sparkles,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  BarChart3,
  TrendingUp,
  Target,
  Clock,
} from "lucide-react";
import { cn } from "../../ui/utils";
import type { SceneTemplate, CustomScene } from "../../../types";

// 模板卡片属性
interface TemplateCardProps {
  template: SceneTemplate;
  isSelected?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  className?: string;
}

// 场景卡片属性
interface SceneCardProps {
  scene: CustomScene;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAnalyze?: () => void;
  onDuplicate?: () => void;
  className?: string;
}

// 模板卡片
export function TemplateCard({
  template,
  isSelected,
  onClick,
  onEdit,
  onDelete,
  showActions,
  className,
}: TemplateCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-purple-500 bg-purple-50/50",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="text-3xl">{template.icon}</div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="truncate">{template.name}</span>
                {template.isPopular && (
                  <Badge className="bg-orange-500 text-white text-[10px] shrink-0">
                    热门
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs line-clamp-2 mt-1">
                {template.description}
              </CardDescription>
            </div>
          </div>
          {showActions && (onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                    <Edit className="h-4 w-4 mr-2" />
                    编辑
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      删除
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Badge variant="outline" className="text-[10px]">
            {template.category}
          </Badge>
          <span>·</span>
          <span>{template.usageCount} 次使用</span>
        </div>
        <div className="flex flex-wrap gap-1 mt-3">
          {template.targetIndustries.slice(0, 2).map((ind) => (
            <Badge key={ind} variant="secondary" className="text-[10px]">
              {ind}
            </Badge>
          ))}
          {template.targetIndustries.length > 2 && (
            <Badge variant="secondary" className="text-[10px]">
              +{template.targetIndustries.length - 2}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// 已创建场景卡片
export function UserSceneCard({
  scene,
  onClick,
  onEdit,
  onDelete,
  onAnalyze,
  onDuplicate,
  className,
}: SceneCardProps) {
  const getComplianceColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50";
    if (score >= 70) return "text-blue-600 bg-blue-50";
    if (score >= 50) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <Card
      className={cn(
        "hover:shadow-xl transition-all bg-white/80 backdrop-blur-sm",
        className
      )}
    >
      <CardContent className="p-6">
        {/* 头部 */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="size-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="size-6 text-white" />
            </div>
            <div>
              <h3
                className="font-semibold text-lg mb-1 cursor-pointer hover:text-purple-600 transition-colors"
                onClick={onClick}
              >
                {scene.name}
              </h3>
              <p className="text-sm text-slate-600 line-clamp-1">
                {scene.description}
              </p>
            </div>
          </div>
        </div>

        {/* 统计数据 */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{scene.totalCOUs}</div>
            <div className="text-xs text-slate-600">总COU数</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {scene.highPriorityCOUs}
            </div>
            <div className="text-xs text-slate-600">高优先级</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div
              className={cn(
                "text-2xl font-bold",
                getComplianceColor(scene.complianceScore)
              )}
            >
              {scene.complianceScore}
            </div>
            <div className="text-xs text-slate-600">合规分数</div>
          </div>
        </div>

        {/* 底部操作 */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock className="size-4" />
            <span>创建于 {new Date(scene.createdAt).toLocaleDateString("zh-CN")}</span>
          </div>

          <div className="flex gap-2">
            {onAnalyze && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1"
                onClick={onAnalyze}
              >
                <BarChart3 className="size-4" />
                分析
              </Button>
            )}
            {onEdit && (
              <Button size="sm" variant="outline" onClick={onEdit}>
                <Edit className="size-4" />
              </Button>
            )}
            {onDuplicate && (
              <Button size="sm" variant="outline" onClick={onDuplicate}>
                <Copy className="size-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={onDelete}
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 简化版场景卡片（用于列表展示）
export function CompactSceneCard({
  scene,
  onClick,
  className,
}: {
  scene: CustomScene;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-slate-50 cursor-pointer transition-all",
        className
      )}
      onClick={onClick}
    >
      <div className="size-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
        <Sparkles className="size-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{scene.name}</h4>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>{scene.totalCOUs}个COU</span>
          <span>·</span>
          <span>权重{scene.totalWeight}</span>
        </div>
      </div>
      <Badge
        variant="outline"
        className={cn(
          "text-xs",
          scene.complianceScore >= 80
            ? "text-green-600 border-green-200"
            : "text-yellow-600 border-yellow-200"
        )}
      >
        {scene.complianceScore}分
      </Badge>
    </div>
  );
}

// 空状态卡片
export function EmptySceneCard({
  onCreate,
  className,
}: {
  onCreate?: () => void;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "p-12 text-center border-dashed border-2 bg-slate-50/50",
        className
      )}
    >
      <Sparkles className="size-16 text-slate-300 mx-auto mb-4" />
      <p className="text-slate-500 mb-4">暂无合规场景</p>
      {onCreate && (
        <Button className="bg-purple-600 hover:bg-purple-700" onClick={onCreate}>
          <Sparkles className="size-4 mr-2" />
          创建第一个场景
        </Button>
      )}
    </Card>
  );
}

export default TemplateCard;
