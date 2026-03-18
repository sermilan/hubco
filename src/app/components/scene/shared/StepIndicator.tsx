// ============ StepIndicator ============
// 场景构建器步骤指示器组件
// 显示当前步骤进度，支持点击跳转

import React from "react";
import { CheckCircle, Circle, ChevronRight } from "lucide-react";
import { cn } from "../../ui/utils";
import type { BuildStep } from "../SceneBuilderProvider";

interface Step {
  key: BuildStep;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: BuildStep;
  completedSteps: Set<BuildStep>;
  onStepClick?: (step: BuildStep) => void;
  className?: string;
}

export function StepIndicator({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  className,
}: StepIndicatorProps) {
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className={cn("w-full", className)}>
      {/* 桌面端：水平步骤条 */}
      <div className="hidden md:flex items-center justify-center">
        <div className="flex items-center">
          {steps.map((step, index) => {
            const isActive = step.key === currentStep;
            const isCompleted = completedSteps.has(step.key);
            const isLast = index === steps.length - 1;
            const canClick =
              onStepClick && (isCompleted || step.key === currentStep);

            return (
              <React.Fragment key={step.key}>
                {/* 步骤节点 */}
                <button
                  type="button"
                  onClick={() => canClick && onStepClick(step.key)}
                  disabled={!canClick}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
                    isActive
                      ? "bg-purple-100 text-purple-700"
                      : isCompleted
                        ? "text-green-600 hover:bg-green-50"
                        : "text-slate-400",
                    canClick && "cursor-pointer",
                    !canClick && "cursor-default"
                  )}
                >
                  {/* 步骤图标 */}
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                      isActive
                        ? "bg-purple-500 text-white"
                        : isCompleted
                          ? "bg-green-500 text-white"
                          : "bg-slate-200 text-slate-500"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      step.icon || index + 1
                    )}
                  </div>

                  {/* 步骤标签 */}
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{step.label}</span>
                    {step.description && (
                      <span className="text-xs opacity-70">
                        {step.description}
                      </span>
                    )}
                  </div>
                </button>

                {/* 步骤之间的连接线 */}
                {!isLast && (
                  <ChevronRight className="w-4 h-4 text-slate-300 mx-1" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 移动端：简化步骤条 */}
      <div className="md:hidden">
        <div className="flex items-center justify-between px-2">
          {steps.map((step, index) => {
            const isActive = step.key === currentStep;
            const isCompleted = completedSteps.has(step.key);

            return (
              <React.Fragment key={step.key}>
                <div
                  className={cn(
                    "flex flex-col items-center",
                    isActive
                      ? "text-purple-600"
                      : isCompleted
                        ? "text-green-600"
                        : "text-slate-400"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                      isActive
                        ? "bg-purple-500 text-white"
                        : isCompleted
                          ? "bg-green-500 text-white"
                          : "bg-slate-200 text-slate-500"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      step.icon || index + 1
                    )}
                  </div>
                  <span className="text-xs mt-1 hidden sm:block">
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-2",
                      index < currentIndex ? "bg-green-500" : "bg-slate-200"
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* 当前步骤名称 */}
        <div className="text-center mt-3">
          <span className="text-sm font-medium text-slate-700">
            {steps[currentIndex]?.label}
          </span>
          {steps[currentIndex]?.description && (
            <p className="text-xs text-slate-500 mt-1">
              {steps[currentIndex].description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// 预设的用户模式步骤配置
export const USER_MODE_STEPS: Step[] = [
  {
    key: "template",
    label: "选择模板",
    description: "选择场景模板",
  },
  {
    key: "profile",
    label: "业务画像",
    description: "配置业务信息",
  },
  {
    key: "tags",
    label: "标签配置",
    description: "调整五维标签",
  },
  {
    key: "matching",
    label: "匹配结果",
    description: "选择COU",
  },
  {
    key: "preview",
    label: "预览确认",
    description: "确认生成场景",
  },
];

// 预设的管理员模式步骤配置
export const ADMIN_MODE_STEPS: Step[] = [
  {
    key: "template",
    label: "模板基础",
    description: "配置模板信息",
  },
  {
    key: "profile",
    label: "场景画像",
    description: "配置默认画像",
  },
  {
    key: "tags",
    label: "五维标签",
    description: "配置标签规则",
  },
  {
    key: "matching",
    label: "匹配规则",
    description: "配置匹配算法",
  },
  {
    key: "preview",
    label: "发布预览",
    description: "预览并发布",
  },
];

export default StepIndicator;
