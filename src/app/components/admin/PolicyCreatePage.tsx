// ============ 新增政策页面 ============
// 分步表单，用于录入新政策法规

import React, { useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  FileText,
  Building2,
  Globe,
  Calendar,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";
import type {
  Policy,
  PolicyLevel,
  Industry,
  Region,
  PolicyVersion,
} from "../../types";
import { POLICY_LEVEL_WEIGHTS } from "../../types";

type Step = "basic" | "scope" | "version" | "content" | "review";

interface PolicyCreatePageProps {
  onCancel?: () => void;
  onSuccess?: (policy: Policy) => void;
}

const STEPS: { key: Step; label: string; icon: React.ElementType }[] = [
  { key: "basic", label: "基本信息", icon: FileText },
  { key: "scope", label: "适用范围", icon: Globe },
  { key: "version", label: "版本信息", icon: Calendar },
  { key: "content", label: "内容录入", icon: Building2 },
  { key: "review", label: "确认提交", icon: CheckCircle },
];

const POLICY_LEVELS: PolicyLevel[] = [
  "法律",
  "行政法规",
  "部门规章",
  "国家标准",
  "行业标准",
  "地方性法规",
  "指南指引",
];

const INDUSTRIES: Industry[] = [
  "通用",
  "金融",
  "医疗",
  "电信",
  "互联网",
  "能源",
  "教育",
  "交通",
  "政务",
  "制造",
  "游戏",
  "电商",
];

const REGIONS: Region[] = ["国内", "欧盟", "美国", "东南亚", "全球"];

export function PolicyCreatePage({ onCancel, onSuccess }: PolicyCreatePageProps) {
  const [currentStep, setCurrentStep] = useState<Step>("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 表单数据
  const [formData, setFormData] = useState<Partial<Policy>>({
    title: "",
    code: "",
    level: "部门规章",
    publishOrg: "",
    industries: [],
    regions: ["国内"],
    description: "",
    fullText: "",
    currentVersion: {
      versionId: `ver-${Date.now()}`,
      versionNumber: "v1.0",
      publishDate: new Date().toISOString().split("T")[0],
      effectiveDate: new Date().toISOString().split("T")[0],
      status: "current",
    },
    versions: [],
    tags: [],
    clauseCount: 0,
    couCount: 0,
  });

  // 验证当前步骤
  const validateStep = (step: Step): boolean => {
    switch (step) {
      case "basic":
        if (!formData.title?.trim()) {
          toast.error("请输入政策标题");
          return false;
        }
        if (!formData.code?.trim()) {
          toast.error("请输入文号");
          return false;
        }
        if (!formData.publishOrg?.trim()) {
          toast.error("请输入发布机构");
          return false;
        }
        return true;
      case "scope":
        if (!formData.industries?.length) {
          toast.error("请至少选择一个适用行业");
          return false;
        }
        if (!formData.regions?.length) {
          toast.error("请至少选择一个适用地区");
          return false;
        }
        return true;
      case "version":
        if (!formData.currentVersion?.versionNumber?.trim()) {
          toast.error("请输入版本号");
          return false;
        }
        if (!formData.currentVersion?.publishDate) {
          toast.error("请选择发布日期");
          return false;
        }
        if (!formData.currentVersion?.effectiveDate) {
          toast.error("请选择生效日期");
          return false;
        }
        return true;
      case "content":
        if (!formData.description?.trim()) {
          toast.error("请输入政策描述");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  // 下一步
  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    const stepIndex = STEPS.findIndex((s) => s.key === currentStep);
    if (stepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[stepIndex + 1].key);
    }
  };

  // 上一步
  const handleBack = () => {
    const stepIndex = STEPS.findIndex((s) => s.key === currentStep);
    if (stepIndex > 0) {
      setCurrentStep(STEPS[stepIndex - 1].key);
    }
  };

  // 提交
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      // 模拟 API 调用
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newPolicy: Policy = {
        ...(formData as Policy),
        id: `pol-${Date.now()}`,
        versions: formData.currentVersion ? [formData.currentVersion] : [],
      };

      toast.success("政策创建成功！");
      onSuccess?.(newPolicy);
    } catch (error) {
      toast.error("创建失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 更新字段
  const updateField = useCallback(<K extends keyof Policy>(
    field: K,
    value: Policy[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // 更新版本字段
  const updateVersionField = useCallback(<K extends keyof PolicyVersion>(
    field: K,
    value: PolicyVersion[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      currentVersion: {
        ...prev.currentVersion!,
        [field]: value,
      },
    }));
  }, []);

  // 切换行业选择
  const toggleIndustry = (industry: Industry) => {
    const current = formData.industries || [];
    if (current.includes(industry)) {
      updateField(
        "industries",
        current.filter((i) => i !== industry)
      );
    } else {
      updateField("industries", [...current, industry]);
    }
  };

  // 切换地区选择
  const toggleRegion = (region: Region) => {
    const current = formData.regions || [];
    if (current.includes(region)) {
      updateField(
        "regions",
        current.filter((r) => r !== region)
      );
    } else {
      updateField("regions", [...current, region]);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            返回
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-slate-800">新增政策</h1>
            <p className="text-xs text-slate-500">录入新的政策法规文件</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* 步骤指示器 */}
      <div className="px-6 py-4 bg-white/50 border-b border-slate-200/50">
        <div className="flex items-center justify-center">
          {STEPS.map((step, idx) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.key;
            const isCompleted =
              STEPS.findIndex((s) => s.key === currentStep) > idx;

            return (
              <React.Fragment key={step.key}>
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : isCompleted
                      ? "text-green-600"
                      : "text-slate-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      isActive
                        ? "bg-blue-500 text-white"
                        : isCompleted
                        ? "bg-green-500 text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <StepIcon className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">
                    {step.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`w-8 h-px mx-2 ${
                      isCompleted ? "bg-green-400" : "bg-slate-300"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 表单内容 */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* 步骤 1: 基本信息 */}
          {currentStep === "basic" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  基本信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 政策标题 */}
                <div className="space-y-2">
                  <Label htmlFor="title">
                    政策标题 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="请输入政策标题，如《数据安全法》"
                    value={formData.title}
                    onChange={(e) => updateField("title", e.target.value)}
                  />
                </div>

                {/* 文号和级别 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">
                      文号 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="code"
                      placeholder="如：主席令第45号"
                      value={formData.code}
                      onChange={(e) => updateField("code", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="level">
                      政策级别 <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.level}
                      onValueChange={(v) =>
                        updateField("level", v as PolicyLevel)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {POLICY_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            <div className="flex items-center gap-2">
                              <span>{level}</span>
                              <Badge variant="secondary" className="text-xs">
                                权重 {POLICY_LEVEL_WEIGHTS[level]}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 发布机构 */}
                <div className="space-y-2">
                  <Label htmlFor="publishOrg">
                    发布机构 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="publishOrg"
                    placeholder="如：全国人民代表大会常务委员会"
                    value={formData.publishOrg}
                    onChange={(e) => updateField("publishOrg", e.target.value)}
                  />
                </div>

                {/* 标签 */}
                <div className="space-y-2">
                  <Label>标签</Label>
                  <div className="flex flex-wrap gap-2">
                    {["数据安全", "个人信息", "网络安全", "跨境传输", "等级保护"].map(
                      (tag) => (
                        <Badge
                          key={tag}
                          variant={
                            formData.tags?.some((t) => t.name === tag)
                              ? "default"
                              : "outline"
                          }
                          className="cursor-pointer"
                          onClick={() => {
                            const current = formData.tags || [];
                            if (current.some((t) => t.name === tag)) {
                              updateField(
                                "tags",
                                current.filter((t) => t.name !== tag)
                              );
                            } else {
                              updateField("tags", [
                                ...current,
                                {
                                  id: `tag-${Date.now()}`,
                                  name: tag,
                                  color: "blue",
                                  category: "法律",
                                },
                              ]);
                            }
                          }}
                        >
                          {tag}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 步骤 2: 适用范围 */}
          {currentStep === "scope" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5 text-green-500" />
                  适用范围
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 适用行业 */}
                <div className="space-y-3">
                  <Label>
                    适用行业 <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {INDUSTRIES.map((industry) => (
                      <Badge
                        key={industry}
                        variant={
                          formData.industries?.includes(industry)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer px-3 py-1"
                        onClick={() => toggleIndustry(industry)}
                      >
                        {industry}
                      </Badge>
                    ))}
                  </div>
                  {formData.industries?.length === 0 && (
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      请至少选择一个适用行业
                    </p>
                  )}
                </div>

                {/* 适用地区 */}
                <div className="space-y-3">
                  <Label>
                    适用地区 <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {REGIONS.map((region) => (
                      <Badge
                        key={region}
                        variant={
                          formData.regions?.includes(region)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer px-3 py-1"
                        onClick={() => toggleRegion(region)}
                      >
                        {region}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* 关联政策 */}
                <div className="space-y-2">
                  <Label>关联政策（可选）</Label>
                  <Input
                    placeholder="输入政策ID或名称，多个用逗号分隔"
                    onChange={(e) =>
                      updateField(
                        "relatedPolicies",
                        e.target.value.split(",").map((s) => s.trim())
                      )
                    }
                  />
                  <p className="text-xs text-slate-500">
                    关联相关的政策法规，便于后续检索和引用
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 步骤 3: 版本信息 */}
          {currentStep === "version" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  版本信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 版本号 */}
                <div className="space-y-2">
                  <Label htmlFor="versionNumber">
                    版本号 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="versionNumber"
                    placeholder="如：v1.0"
                    value={formData.currentVersion?.versionNumber}
                    onChange={(e) =>
                      updateVersionField("versionNumber", e.target.value)
                    }
                  />
                </div>

                {/* 日期 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="publishDate">
                      发布日期 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="publishDate"
                      type="date"
                      value={formData.currentVersion?.publishDate}
                      onChange={(e) =>
                        updateVersionField("publishDate", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="effectiveDate">
                      生效日期 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="effectiveDate"
                      type="date"
                      value={formData.currentVersion?.effectiveDate}
                      onChange={(e) =>
                        updateVersionField("effectiveDate", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* 失效日期 */}
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">失效日期（可选）</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.currentVersion?.expiryDate || ""}
                    onChange={(e) =>
                      updateVersionField("expiryDate", e.target.value)
                    }
                  />
                  <p className="text-xs text-slate-500">
                    如政策有明确的废止时间，请填写此项
                  </p>
                </div>

                {/* 变更说明 */}
                <div className="space-y-2">
                  <Label htmlFor="changeLog">变更说明</Label>
                  <Textarea
                    id="changeLog"
                    placeholder="描述本次版本的主要变更内容..."
                    value={formData.currentVersion?.changeLog || ""}
                    onChange={(e) =>
                      updateVersionField("changeLog", e.target.value)
                    }
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* 步骤 4: 内容录入 */}
          {currentStep === "content" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-500" />
                  内容录入
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 政策描述 */}
                <div className="space-y-2">
                  <Label htmlFor="description">
                    政策描述 <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="简要描述政策的主要内容、目的和意义..."
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    rows={4}
                  />
                </div>

                {/* 政策全文 */}
                <div className="space-y-2">
                  <Label htmlFor="fullText">政策全文（可选）</Label>
                  <Textarea
                    id="fullText"
                    placeholder="粘贴政策的完整正文内容..."
                    value={formData.fullText || ""}
                    onChange={(e) => updateField("fullText", e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500">
                    支持后续通过 AI 自动提取条款，或手动录入条款
                  </p>
                </div>

                {/* 下载链接 */}
                <div className="space-y-2">
                  <Label htmlFor="downloadUrl">原文链接（可选）</Label>
                  <Input
                    id="downloadUrl"
                    type="url"
                    placeholder="https://..."
                    value={formData.downloadUrl || ""}
                    onChange={(e) => updateField("downloadUrl", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* 步骤 5: 确认提交 */}
          {currentStep === "review" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  确认信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 信息预览 */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">政策标题：</span>
                      <span className="font-medium">{formData.title}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">文号：</span>
                      <span className="font-medium">{formData.code}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">级别：</span>
                      <Badge variant="outline">{formData.level}</Badge>
                    </div>
                    <div>
                      <span className="text-slate-500">发布机构：</span>
                      <span className="font-medium">{formData.publishOrg}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <span className="text-slate-500 text-sm">适用行业：</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.industries?.map((ind) => (
                        <Badge key={ind} variant="secondary">
                          {ind}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <span className="text-slate-500 text-sm">适用地区：</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.regions?.map((reg) => (
                        <Badge key={reg} variant="secondary">
                          {reg}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">版本号：</span>
                      <span className="font-medium">
                        {formData.currentVersion?.versionNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">发布日期：</span>
                      <span className="font-medium">
                        {formData.currentVersion?.publishDate}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <span className="text-slate-500 text-sm">政策描述：</span>
                    <p className="mt-1 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
                      {formData.description}
                    </p>
                  </div>

                  {formData.fullText && (
                    <div className="border-t pt-4">
                      <span className="text-slate-500 text-sm">
                        已录入全文：
                      </span>
                      <Badge variant="outline" className="ml-2">
                        {formData.fullText.length} 字符
                      </Badge>
                    </div>
                  )}
                </div>

                {/* 提示 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                  <p className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    提交后将创建政策记录，您可以在条款编辑器中继续添加具体条款。
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 底部操作栏 */}
      <div className="px-6 py-4 bg-white border-t border-slate-200 flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          取消
        </Button>
        <div className="flex gap-3">
          {currentStep !== "basic" && (
            <Button variant="outline" onClick={handleBack}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              上一步
            </Button>
          )}
          {currentStep !== "review" ? (
            <Button onClick={handleNext}>
              下一步
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  提交中...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1" />
                  确认创建
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PolicyCreatePage;
