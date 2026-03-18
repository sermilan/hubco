// ============ 动作义务编辑表单 ============
// 用于定义COU的动作要求：检查点、期限、优先级等

import React, { useState, useCallback } from "react";
import {
  Plus,
  Trash2,
  AlertCircle,
  Clock,
  CheckCircle,
  X,
  GripVertical,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import type { ActionRequirement, ActionPriority } from "../../types";
import { ACTION_PRIORITY_INFO } from "../../types";
import { TAGS_BY_DOMAIN } from "../../data/tagDictionary";

// 预设期限选项
const DEADLINE_PRESETS = [
  { value: "立即", label: "立即", description: "立即执行" },
  { value: "24小时", label: "24小时", description: "24小时内完成" },
  { value: "48小时", label: "48小时", description: "48小时内完成" },
  { value: "72小时", label: "72小时", description: "72小时内完成" },
  { value: "7天", label: "7天", description: "7天内完成" },
  { value: "15天", label: "15天", description: "15天内完成" },
  { value: "30天", label: "30天", description: "30天内完成" },
  { value: "季度", label: "季度", description: "每季度执行" },
  { value: "年度", label: "年度", description: "每年执行" },
  { value: "custom", label: "自定义", description: "自定义期限" },
];

// 动作标签选项（从字典中提取ACTION维度）
const ACTION_TAGS = TAGS_BY_DOMAIN.ACTION;

interface ActionRequirementFormProps {
  value: ActionRequirement;
  onChange: (value: ActionRequirement) => void;
  onDelete?: () => void;
  className?: string;
}

export function ActionRequirementForm({
  value,
  onChange,
  onDelete,
  className = "",
}: ActionRequirementFormProps) {
  const [customDeadline, setCustomDeadline] = useState(
    value.deadline && !DEADLINE_PRESETS.find((p) => p.value === value.deadline)
      ? value.deadline
      : ""
  );

  const updateField = useCallback(
    <K extends keyof ActionRequirement>(field: K, val: ActionRequirement[K]) => {
      onChange({ ...value, [field]: val });
    },
    [onChange, value]
  );

  const addCheckPoint = useCallback(() => {
    updateField("checkPoints", [...value.checkPoints, ""]);
  }, [updateField, value.checkPoints]);

  const removeCheckPoint = useCallback(
    (index: number) => {
      const newCheckPoints = value.checkPoints.filter((_, i) => i !== index);
      updateField("checkPoints", newCheckPoints);
    },
    [updateField, value.checkPoints]
  );

  const updateCheckPoint = useCallback(
    (index: number, text: string) => {
      const newCheckPoints = [...value.checkPoints];
      newCheckPoints[index] = text;
      updateField("checkPoints", newCheckPoints);
    },
    [updateField, value.checkPoints]
  );

  const addDeliverable = useCallback(() => {
    const currentDeliverables = value.deliverables || [];
    updateField("deliverables", [...currentDeliverables, ""]);
  }, [updateField, value.deliverables]);

  const removeDeliverable = useCallback(
    (index: number) => {
      const currentDeliverables = value.deliverables || [];
      updateField(
        "deliverables",
        currentDeliverables.filter((_, i) => i !== index)
      );
    },
    [updateField, value.deliverables]
  );

  const updateDeliverable = useCallback(
    (index: number, text: string) => {
      const currentDeliverables = [...(value.deliverables || [])];
      currentDeliverables[index] = text;
      updateField("deliverables", currentDeliverables);
    },
    [updateField, value.deliverables]
  );

  const handleDeadlineChange = useCallback(
    (val: string) => {
      if (val === "custom") {
        updateField("deadline", customDeadline || "");
      } else {
        updateField("deadline", val);
      }
    },
    [customDeadline, updateField]
  );

  return (
    <Card className={`bg-slate-900 border-slate-700 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-slate-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            动作义务定义
          </CardTitle>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-slate-400 hover:text-red-400 hover:bg-red-400/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 动作类型选择 */}
        <div className="space-y-2">
          <Label className="text-slate-300 text-xs">动作类型</Label>
          <Select
            value={value.actionCode}
            onValueChange={(val) => updateField("actionCode", val)}
          >
            <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
              <SelectValue placeholder="选择动作类型" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {ACTION_TAGS.map((tag) => (
                <SelectItem
                  key={tag.code}
                  value={tag.code}
                  className="text-slate-200 focus:bg-slate-700 focus:text-slate-100"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span>{tag.name}</span>
                    <span className="text-slate-500 text-xs">({tag.code})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 动作描述 */}
        <div className="space-y-2">
          <Label className="text-slate-300 text-xs">动作描述</Label>
          <Textarea
            value={value.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="描述具体需要执行的动作..."
            className="bg-slate-800 border-slate-600 text-slate-200 placeholder:text-slate-500 min-h-[60px]"
          />
        </div>

        {/* 期限和优先级 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-300 text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" />
              期限要求
            </Label>
            <Select
              value={
                DEADLINE_PRESETS.find((p) => p.value === value.deadline)
                  ? value.deadline
                  : "custom"
              }
              onValueChange={handleDeadlineChange}
            >
              <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
                <SelectValue placeholder="选择期限" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {DEADLINE_PRESETS.map((preset) => (
                  <SelectItem
                    key={preset.value}
                    value={preset.value}
                    className="text-slate-200 focus:bg-slate-700 focus:text-slate-100"
                  >
                    <div>
                      <div>{preset.label}</div>
                      <div className="text-xs text-slate-500">
                        {preset.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(!value.deadline ||
              !DEADLINE_PRESETS.find((p) => p.value === value.deadline)) && (
              <Input
                value={customDeadline}
                onChange={(e) => {
                  setCustomDeadline(e.target.value);
                  updateField("deadline", e.target.value);
                }}
                placeholder="自定义期限描述"
                className="bg-slate-800 border-slate-600 text-slate-200 text-xs mt-2"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300 text-xs">优先级</Label>
            <div className="grid grid-cols-2 gap-2">
              {(
                ["critical", "high", "medium", "low"] as ActionPriority[]
              ).map((priority) => {
                const info = ACTION_PRIORITY_INFO[priority];
                return (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => updateField("priority", priority)}
                    className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      value.priority === priority
                        ? info.bgColor.replace("bg-", "bg-opacity-20 bg-")
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}
                    style={{
                      color:
                        value.priority === priority ? info.color : undefined,
                      border:
                        value.priority === priority
                          ? `1px solid ${info.color}`
                          : "1px solid transparent",
                    }}
                  >
                    {info.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 阻断性标记 */}
        <div className="flex items-center gap-2 p-3 bg-red-900/20 rounded-md border border-red-800/30">
          <Checkbox
            id="is-blocking"
            checked={value.isBlocking}
            onCheckedChange={(checked) =>
              updateField("isBlocking", checked as boolean)
            }
            className="border-red-500 data-[state=checked]:bg-red-600"
          />
          <Label
            htmlFor="is-blocking"
            className="text-red-300 text-sm cursor-pointer flex items-center gap-1"
          >
            <AlertCircle className="w-4 h-4" />
            标记为阻断性要求（不完成此动作将无法继续其他合规活动）
          </Label>
        </div>

        {/* 检查点清单 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-slate-300 text-xs flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              检查点清单
            </Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={addCheckPoint}
              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 h-7 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              添加检查点
            </Button>
          </div>
          <div className="space-y-2">
            {value.checkPoints.map((point, index) => (
              <div
                key={index}
                className="flex items-center gap-2 group"
              >
                <GripVertical className="w-4 h-4 text-slate-600 cursor-move" />
                <Input
                  value={point}
                  onChange={(e) => updateCheckPoint(index, e.target.value)}
                  placeholder={`检查点 ${index + 1}`}
                  className="flex-1 bg-slate-800 border-slate-600 text-slate-200 text-sm h-8"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCheckPoint(index)}
                  className="text-slate-500 hover:text-red-400 hover:bg-red-400/10 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {value.checkPoints.length === 0 && (
              <div className="text-center py-4 text-slate-500 text-sm border border-dashed border-slate-700 rounded-md">
                暂无检查点，点击上方按钮添加
              </div>
            )}
          </div>
        </div>

        {/* 交付物清单 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-slate-300 text-xs">交付物清单（可选）</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={addDeliverable}
              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 h-7 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              添加交付物
            </Button>
          </div>
          <div className="space-y-2">
            {(value.deliverables || []).map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 group"
              >
                <Badge
                  variant="outline"
                  className="bg-slate-800 border-slate-600 text-slate-400"
                >
                  {index + 1}
                </Badge>
                <Input
                  value={item}
                  onChange={(e) => updateDeliverable(index, e.target.value)}
                  placeholder="交付物名称"
                  className="flex-1 bg-slate-800 border-slate-600 text-slate-200 text-sm h-8"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDeliverable(index)}
                  className="text-slate-500 hover:text-red-400 hover:bg-red-400/10 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 空动作义务模板
export function createEmptyActionRequirement(): ActionRequirement {
  return {
    actionCode: "ACT-NOT",
    description: "",
    deadline: "30天",
    priority: "medium",
    isBlocking: false,
    checkPoints: [],
    deliverables: [],
  };
}

export default ActionRequirementForm;
