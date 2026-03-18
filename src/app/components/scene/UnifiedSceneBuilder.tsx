// ============ UnifiedSceneBuilder ============
// 统一场景构建器 - 整合后台管理和主应用的构建能力
// 支持用户模式和管理员模式

import React, { useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Save,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../ui/utils";

import {
  SceneBuilderProvider,
  useSceneBuilder,
  BuildStep,
  BuildMode,
} from "./SceneBuilderProvider";
import { StepIndicator, USER_MODE_STEPS, ADMIN_MODE_STEPS } from "./shared/StepIndicator";

import type { SceneTemplate, CustomScene, Industry, Region, UserType } from "../../types";

// ============ Props ============

interface UnifiedSceneBuilderProps {
  // 基础
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: BuildMode;

  // 数据
  initialScene?: CustomScene;
  availableTemplates: SceneTemplate[];

  // 回调
  onSave: (scene: CustomScene) => void;
  onSaveTemplate?: (template: SceneTemplate) => void;

  // 选项
  className?: string;
}

// ============ 主组件 ============

export function UnifiedSceneBuilder({
  open,
  onOpenChange,
  mode,
  initialScene,
  availableTemplates,
  onSave,
  onSaveTemplate,
  className,
}: UnifiedSceneBuilderProps) {
  return (
    <SceneBuilderProvider
      mode={mode}
      initialScene={initialScene}
    >
      <UnifiedSceneBuilderContent
        open={open}
        onOpenChange={onOpenChange}
        mode={mode}
        availableTemplates={availableTemplates}
        onSave={onSave}
        onSaveTemplate={onSaveTemplate}
        className={className}
      />
    </SceneBuilderProvider>
  );
}

// ============ 内容组件 ============

function UnifiedSceneBuilderContent({
  open,
  onOpenChange,
  mode,
  availableTemplates,
  onSave,
  onSaveTemplate,
  className,
}: Omit<UnifiedSceneBuilderProps, "initialScene">) {
  const {
    state,
    dispatch,
    loadTemplates,
    goToNextStep,
    goToPrevStep,
    canGoToStep,
    generatePreview,
    saveScene,
  } = useSceneBuilder();

  const steps = mode === "user" ? USER_MODE_STEPS : ADMIN_MODE_STEPS;

  // 加载模板
  useEffect(() => {
    if (open && availableTemplates.length > 0) {
      dispatch({ type: "SET_TEMPLATES", payload: availableTemplates });
    }
  }, [open, availableTemplates, dispatch]);

  // 处理下一步
  const handleNext = useCallback(async () => {
    // 在匹配步骤后，先生成预览
    if (state.currentStep === "matching") {
      await generatePreview();
    }

    // 在预览步骤后，保存场景
    if (state.currentStep === "preview") {
      const scene = await saveScene();
      if (scene) {
        onSave(scene);
        toast.success(mode === "user" ? "场景创建成功" : "模板保存成功");
        onOpenChange(false);
        return;
      }
    }

    goToNextStep();
  }, [
    state.currentStep,
    goToNextStep,
    generatePreview,
    saveScene,
    onSave,
    onOpenChange,
    mode,
  ]);

  // 处理上一步
  const handleBack = useCallback(() => {
    goToPrevStep();
  }, [goToPrevStep]);

  // 处理重置
  const handleReset = useCallback(() => {
    dispatch({ type: "RESET", payload: mode });
    toast.info("已重置为初始状态");
  }, [dispatch, mode]);

  // 处理步骤跳转
  const handleStepClick = useCallback(
    (step: BuildStep) => {
      if (canGoToStep(step)) {
        dispatch({ type: "GO_TO_STEP", payload: step });
      }
    },
    [canGoToStep, dispatch]
  );

  // 获取当前步骤组件
  const renderStepContent = () => {
    switch (state.currentStep) {
      case "template":
        // 用户模式：选择模板；管理员模式：配置模板基础
        return mode === "user" ? <TemplateSelectStep /> : <TemplateBasicConfigStep />;
      case "profile":
        return <BusinessProfileStep />;
      case "tags":
        return <TagConfigStep />;
      case "matching":
        return <MatchingResultStep />;
      case "preview":
        return <PreviewConfirmStep />;
      default:
        return null;
    }
  };

  // 判断是否可以继续
  const canProceed = () => {
    switch (state.currentStep) {
      case "template":
        // 用户模式：需要选择模板；管理员模式：需要填写模板名称
        return mode === "user" ? !!state.selectedTemplate : !!state.profile.name.trim();
      case "profile":
        return !!state.profile.name.trim();
      case "tags":
        return true;
      case "matching":
        return state.matching.selectedIds.size > 0;
      case "preview":
        return !!state.previewScene;
      default:
        return false;
    }
  };

  // 获取按钮文字
  const getNextButtonText = () => {
    if (state.isLoading) {
      return (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          处理中...
        </>
      );
    }

    switch (state.currentStep) {
      case "template":
        return "下一步";
      case "profile":
        return "下一步";
      case "tags":
        return "开始匹配";
      case "matching":
        return "生成预览";
      case "preview":
        return mode === "user" ? "创建场景" : "发布模板";
      default:
        return "下一步";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "!max-w-[95vw] !w-[1200px] max-h-[95vh] flex flex-col p-0",
          className
        )}
      >
        {/* 头部 */}
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-slate-50 to-purple-50/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl">
                  {mode === "user" ? "创建合规场景" : "配置场景模板"}
                </DialogTitle>
                <DialogDescription>
                  {mode === "user"
                    ? "基于模板快速生成您的专属合规场景"
                    : "配置场景模板供用户使用"}
                </DialogDescription>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={state.isLoading}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                重置
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* 步骤指示器 */}
        <div className="px-6 py-3 border-b bg-white/50">
          <StepIndicator
            steps={steps}
            currentStep={state.currentStep}
            completedSteps={state.completedSteps}
            onStepClick={handleStepClick}
          />
        </div>

        {/* 错误提示 */}
        {state.error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4" />
            {state.error}
          </div>
        )}

        {/* 主内容区 */}
        <ScrollArea className="flex-1 p-6">
          <div className="min-h-[400px]">{renderStepContent()}</div>
        </ScrollArea>

        {/* 底部操作栏 */}
        <div className="px-6 py-4 border-t bg-slate-50/50 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={state.currentStep === "template" || state.isLoading}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            上一步
          </Button>

          <div className="flex items-center gap-4">
            {/* 状态提示 */}
            {state.hasUnsavedChanges && (
              <span className="text-xs text-slate-500">
                有未保存的更改
              </span>
            )}

            <Button
              onClick={handleNext}
              disabled={!canProceed() || state.isLoading}
              className={cn(
                "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
                state.currentStep === "preview" &&
                  "from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              )}
            >
              {getNextButtonText()}
              {!state.isLoading && state.currentStep !== "preview" && (
                <ChevronRight className="w-4 h-4 ml-2" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============ 步骤组件（简化实现） ============

// 步骤1: 模板选择
function TemplateSelectStep() {
  const { state, selectTemplate } = useSceneBuilder();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">选择场景模板</h2>
        <p className="text-sm text-slate-500">
          选择一个与您业务场景最接近的模板，系统将基于此生成COU清单
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.templates.map((template) => (
          <div
            key={template.id}
            className={cn(
              "p-4 rounded-lg border cursor-pointer transition-all",
              state.selectedTemplate?.id === template.id
                ? "border-purple-500 bg-purple-50 ring-1 ring-purple-500"
                : "border-slate-200 hover:border-purple-300 hover:bg-slate-50"
            )}
            onClick={() => selectTemplate(template)}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{template.icon}</span>
              <div className="flex-1">
                <h3 className="font-medium">{template.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {template.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 步骤2: 业务画像
function BusinessProfileStep() {
  const { state, updateProfile } = useSceneBuilder();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">配置业务画像</h2>
        <p className="text-sm text-slate-500">
          描述您的业务场景，以便系统更精确地匹配COU
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">
              场景名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={state.profile.name}
              onChange={(e) =>
                updateProfile({ name: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="如：游戏出海欧盟合规方案"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">场景描述</label>
            <textarea
              value={state.profile.description}
              onChange={(e) =>
                updateProfile({ description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              placeholder="描述此场景的适用范围和目标..."
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">行业</label>
              <select
                value={state.profile.industry}
                onChange={(e) =>
                  updateProfile({ industry: e.target.value as Industry })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="互联网">互联网</option>
                <option value="金融">金融</option>
                <option value="医疗">医疗</option>
                <option value="游戏">游戏</option>
                <option value="电商">电商</option>
                <option value="教育">教育</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">区域</label>
              <select
                value={state.profile.region}
                onChange={(e) =>
                  updateProfile({ region: e.target.value as Region })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="国内">国内</option>
                <option value="欧盟">欧盟</option>
                <option value="美国">美国</option>
                <option value="东南亚">东南亚</option>
                <option value="全球">全球</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">用户类型</label>
              <select
                value={state.profile.userType}
                onChange={(e) =>
                  updateProfile({ userType: e.target.value as UserType })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="中小企业">中小企业</option>
                <option value="大型企业">大型企业</option>
                <option value="关基运营者">关基运营者</option>
                <option value="个人">个人</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">企业规模</label>
              <select
                value={state.profile.scale}
                onChange={(e) =>
                  updateProfile({
                    scale: e.target.value as
                      | "small"
                      | "medium"
                      | "large"
                      | "enterprise",
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="small">小型</option>
                <option value="medium">中型</option>
                <option value="large">大型</option>
                <option value="enterprise">集团/跨国</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 步骤3: 标签配置
function TagConfigStep() {
  const { state, addTag, removeTag } = useSceneBuilder();

  const dimensions = [
    { key: "objects", label: "客体维度", color: "blue" },
    { key: "subjects", label: "主体维度", color: "green" },
    { key: "lifecycles", label: "业务流转", color: "orange" },
    { key: "securities", label: "安全域", color: "purple" },
    { key: "actions", label: "动作义务", color: "red" },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">配置五维标签</h2>
        <p className="text-sm text-slate-500">
          调整标签以精确匹配您的业务场景（可选）
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dimensions.map((dim) => (
          <div
            key={dim.key}
            className="p-4 rounded-lg border border-slate-200"
          >
            <h3 className="font-medium mb-3">{dim.label}</h3>
            <div className="flex flex-wrap gap-2">
              {state.tags[dim.key].map((tag) => (
                <span
                  key={tag}
                  className={cn(
                    "px-2 py-1 rounded text-xs cursor-pointer hover:opacity-80",
                    `bg-${dim.color}-100 text-${dim.color}-700`
                  )}
                  onClick={() => removeTag(dim.key, tag)}
                >
                  {tag} ×
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 步骤4: 匹配结果
function MatchingResultStep() {
  const { state, toggleCOSelection, runMatching } = useSceneBuilder();

  // 首次加载时运行匹配
  useEffect(() => {
    if (state.matching.results.length === 0 && !state.matching.isLoading) {
      runMatching();
    }
  }, []);

  if (state.matching.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-500" />
          <p className="text-slate-500">正在匹配控制目标...</p>
        </div>
      </div>
    );
  }

  // 分组显示
  const recommended = state.matching.results.filter((r) => r.isRecommended);
  const others = state.matching.results.filter((r) => !r.isRecommended);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-2">匹配结果</h2>
          <p className="text-sm text-slate-500">
            系统已匹配 {state.matching.results.length} 个控制目标，请选择需要包含的COU
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-purple-600">
            {state.matching.selectedIds.size}
          </div>
          <div className="text-xs text-slate-500">已选择</div>
        </div>
      </div>

      {/* 强烈推荐 */}
      {recommended.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-purple-700 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            强烈推荐（匹配度 ≥80%）
          </h3>
          <div className="space-y-2">
            {recommended.map((match) => (
              <div
                key={match.controlObjective.id}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all",
                  state.matching.selectedIds.has(match.controlObjective.id)
                    ? "border-purple-500 bg-purple-50"
                    : "border-slate-200 hover:border-purple-300"
                )}
                onClick={() => toggleCOSelection(match.controlObjective.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">
                      {match.controlObjective.name}
                    </span>
                    <span className="text-xs text-slate-500 ml-2">
                      {match.controlObjective.code}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "text-sm",
                        match.matchScore >= 0.9
                          ? "text-green-600"
                          : "text-purple-600"
                      )}
                    >
                      匹配度 {Math.round(match.matchScore * 100)}%
                    </span>
                    <input
                      type="checkbox"
                      checked={state.matching.selectedIds.has(
                        match.controlObjective.id
                      )}
                      onChange={() => {}}
                      className="w-4 h-4"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 其他匹配 */}
      {others.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-slate-600 mb-3">
            其他匹配（匹配度 60-79%）
          </h3>
          <div className="space-y-2">
            {others.map((match) => (
              <div
                key={match.controlObjective.id}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all",
                  state.matching.selectedIds.has(match.controlObjective.id)
                    ? "border-purple-500 bg-purple-50"
                    : "border-slate-200 hover:border-purple-300"
                )}
                onClick={() => toggleCOSelection(match.controlObjective.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">
                    {match.controlObjective.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">
                      匹配度 {Math.round(match.matchScore * 100)}%
                    </span>
                    <input
                      type="checkbox"
                      checked={state.matching.selectedIds.has(
                        match.controlObjective.id
                      )}
                      onChange={() => {}}
                      className="w-4 h-4"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 步骤5: 预览确认
function PreviewConfirmStep() {
  const { state } = useSceneBuilder();

  const scene = state.previewScene;

  if (!scene) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        正在生成预览...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">场景预览</h2>
        <p className="text-sm text-slate-500">确认场景信息无误后创建</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 场景信息 */}
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <h3 className="font-medium mb-3">基本信息</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">场景名称</span>
                <span>{scene.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">行业</span>
                <span>{scene.industry}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">区域</span>
                <span>{scene.region}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <h3 className="font-medium mb-3">统计信息</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {scene.totalCOUs}
                </div>
                <div className="text-xs text-slate-500">COU总数</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {scene.totalWeight}
                </div>
                <div className="text-xs text-slate-500">总权重</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {scene.highPriorityCOUs}
                </div>
                <div className="text-xs text-slate-500">高优先级</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {scene.complianceScore}
                </div>
                <div className="text-xs text-slate-500">合规分数</div>
              </div>
            </div>
          </div>
        </div>

        {/* COU列表 */}
        <div className="p-4 bg-slate-50 rounded-lg">
          <h3 className="font-medium mb-3">
            包含的COU ({scene.cous.length})
          </h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {scene.cous.map((cou) => (
              <div
                key={cou.id}
                className="p-2 bg-white rounded border text-sm"
              >
                <div className="font-medium truncate">{cou.title}</div>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span>权重: {cou.finalWeight}</span>
                  <span>·</span>
                  <span>{cou.obligationType}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 管理员模式步骤1: 模板基础配置
function TemplateBasicConfigStep() {
  const { state, updateProfile } = useSceneBuilder();

  const categories = ["出海合规", "行业合规", "业务合规", "通用模板"];
  const icons = ["🎮", "🏦", "☁️", "🏥", "🛒", "📚", "🏭", "🔒", "📱", "💼", "📋", "🎯"];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">配置模板基础信息</h2>
        <p className="text-sm text-slate-500">
          设置场景模板的基本信息，这些信息将展示给用户
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 左侧：基本信息 */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">
              模板名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={state.profile.name}
              onChange={(e) => updateProfile({ name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="如：游戏出海欧盟合规方案"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">模板描述</label>
            <textarea
              value={state.profile.description}
              onChange={(e) => updateProfile({ description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              placeholder="描述此模板的适用范围和特点..."
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">分类</label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 右侧：图标和目标 */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">选择图标</label>
            <div className="grid grid-cols-6 gap-2">
              {icons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className={cn(
                    "h-10 rounded-lg border text-lg transition-all",
                    state.profile.icon === icon
                      ? "border-purple-500 bg-purple-50 ring-1 ring-purple-500"
                      : "border-slate-200 hover:border-purple-300 hover:bg-slate-50"
                  )}
                  onClick={() => updateProfile({ icon })}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">目标行业</label>
              <select
                multiple
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 h-24"
              >
                <option value="游戏">游戏</option>
                <option value="金融">金融</option>
                <option value="医疗">医疗</option>
                <option value="电商">电商</option>
                <option value="互联网">互联网</option>
                <option value="教育">教育</option>
              </select>
              <p className="text-xs text-slate-400 mt-1">按住 Ctrl 多选</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">目标区域</label>
              <select
                multiple
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 h-24"
              >
                <option value="国内">国内</option>
                <option value="欧盟">欧盟</option>
                <option value="美国">美国</option>
                <option value="东南亚">东南亚</option>
                <option value="全球">全球</option>
              </select>
              <p className="text-xs text-slate-400 mt-1">按住 Ctrl 多选</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">目标用户类型</label>
            <div className="flex flex-wrap gap-2">
              {["中小企业", "大型企业", "关基运营者", "个人"].map((type) => (
                <label key={type} className="flex items-center gap-1 text-sm">
                  <input type="checkbox" className="rounded" />
                  {type}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnifiedSceneBuilder;
