// ============ 灵活政策录入 ============
// 支持多种录入方式：向导模式、快速模式、智能识别模式
// 解决文号不统一、格式多样的政策文件录入问题

import React, { useState, useCallback, useEffect } from "react";
import {
  FileText,
  Zap,
  Brain,
  ChevronRight,
  ChevronLeft,
  Save,
  X,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Copy,
  Wand2,
  Plus,
  Trash2,
  Tag,
  Building,
  Calendar,
  Globe,
  Scale,
  FileInput,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { toast } from "sonner";
import type { Policy, PolicyLevel, Industry, Region } from "../../types";
import { POLICY_LEVEL_WEIGHTS } from "../../types";

// 录入模式
type InputMode = "wizard" | "quick" | "smart";

// 文件标识类型 - 灵活适应不同政策文件
interface DocumentIdentifier {
  type: "wenhao" | "biaozhun" | "gonggao" | "tongzhi" | "custom" | "none";
  value: string;
  label: string;
}

const IDENTIFIER_TYPES: { key: DocumentIdentifier["type"]; label: string; placeholder: string; example: string }[] = [
  { key: "wenhao", label: "发文字号", placeholder: "如：主席令第45号", example: "主席令第45号、工信部信管〔2023〕第X号" },
  { key: "biaozhun", label: "标准编号", placeholder: "如：GB/T 35273-2020", example: "GB/T 35273-2020、JR/T 0071-2020" },
  { key: "gonggao", label: "公告编号", placeholder: "如：2023年第1号公告", example: "2023年第1号公告、国家网信办公告" },
  { key: "tongzhi", label: "通知文号", placeholder: "如：教技〔2023〕X号", example: "教技〔2023〕X号、卫办医发〔2023〕X号" },
  { key: "custom", label: "其他编号", placeholder: "自定义编号", example: "内部文件编号、白皮书版本号等" },
  { key: "none", label: "无编号", placeholder: "无编号", example: "白皮书、指导意见、无名称为准" },
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
  "通用", "金融", "医疗", "电信", "互联网", "能源",
  "教育", "交通", "政务", "制造", "游戏", "电商"
];

const REGIONS: Region[] = ["国内", "欧盟", "美国", "东南亚", "全球"];

// 预设标签
const PRESET_TAGS = [
  "数据安全", "个人信息", "网络安全", "跨境传输", "等级保护",
  "密码管理", "风险评估", "应急响应", "合规审计", "数据出境"
];

interface PolicyCreateFlexibleProps {
  onCancel?: () => void;
  onSuccess?: (policy: Policy) => void;
  initialData?: Partial<Policy>;
}

// 智能解析结果
interface ParsedResult {
  title?: string;
  code?: string;
  identifierType?: DocumentIdentifier["type"];
  publishOrg?: string;
  level?: PolicyLevel;
  publishDate?: string;
  effectiveDate?: string;
  description?: string;
  industries?: Industry[];
  confidence: number;
}

export function PolicyCreateFlexible({ onCancel, onSuccess, initialData }: PolicyCreateFlexibleProps) {
  const [mode, setMode] = useState<InputMode>("wizard");
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [smartParsing, setSmartParsing] = useState(false);
  const [rawText, setRawText] = useState("");
  const [parsedResult, setParsedResult] = useState<ParsedResult | null>(null);

  // 表单数据
  const [formData, setFormData] = useState<{
    title: string;
    identifier: DocumentIdentifier;
    publishOrg: string;
    level: PolicyLevel;
    industries: Industry[];
    regions: Region[];
    tags: string[];
    publishDate: string;
    effectiveDate: string;
    description: string;
    fullText: string;
    sourceUrl: string;
  }>({
    title: initialData?.title || "",
    identifier: { type: "wenhao", value: initialData?.code || "", label: "" },
    publishOrg: initialData?.publishOrg || "",
    level: (initialData?.level as PolicyLevel) || "部门规章",
    industries: initialData?.industries || [],
    regions: initialData?.regions || ["国内"],
    tags: [],
    publishDate: initialData?.currentVersion?.publishDate || new Date().toISOString().split("T")[0],
    effectiveDate: initialData?.currentVersion?.effectiveDate || "",
    description: initialData?.description || "",
    fullText: initialData?.fullText || "",
    sourceUrl: initialData?.downloadUrl || "",
  });

  // 向导步骤
  const wizardSteps = [
    { key: "basic", label: "文件标识", icon: FileText },
    { key: "source", label: "来源信息", icon: Building },
    { key: "scope", label: "适用范围", icon: Globe },
    { key: "content", label: "内容", icon: Scale },
  ];

  // 更新字段
  const updateField = useCallback(<K extends keyof typeof formData>(
    field: K,
    value: typeof formData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // 切换行业
  const toggleIndustry = (industry: Industry) => {
    const current = formData.industries;
    if (current.includes(industry)) {
      updateField("industries", current.filter((i) => i !== industry));
    } else {
      updateField("industries", [...current, industry]);
    }
  };

  // 切换标签
  const toggleTag = (tag: string) => {
    const current = formData.tags;
    if (current.includes(tag)) {
      updateField("tags", current.filter((t) => t !== tag));
    } else {
      updateField("tags", [...current, tag]);
    }
  };

  // 智能解析文本
  const handleSmartParse = async () => {
    if (!rawText.trim()) {
      toast.error("请粘贴政策文本");
      return;
    }

    setSmartParsing(true);

    // 模拟AI解析
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const result: ParsedResult = {
      confidence: 0,
    };

    // 提取标题（第一行或包含《》的内容）
    const lines = rawText.split("\n").filter((l) => l.trim());
    const titleMatch = rawText.match(/《([^》]+)》/) || lines[0]?.match(/《([^》]+)》/);
    if (titleMatch) {
      result.title = `《${titleMatch[1]}》`;
      result.confidence += 0.3;
    } else if (lines[0]?.length < 100) {
      result.title = lines[0].trim();
      result.confidence += 0.2;
    }

    // 提取文号
    const wenhaoMatch = rawText.match(/(主席令|国务院令|工信部|教技|卫办)[\(〔\[]?(\d{4})[\)〕\]]?第?\s*(\d+)\s*号/i) ||
                       rawText.match(/(\d{4})年第\s*(\d+)\s*号/);
    if (wenhaoMatch) {
      result.code = wenhaoMatch[0];
      result.identifierType = "wenhao";
      result.confidence += 0.25;
    }

    // 提取标准号
    const biaozhunMatch = rawText.match(/(GB|GB\/T|JR\/T|T\/\w+)[\s/-]?(\d+[.-]?\d*)/i);
    if (biaozhunMatch) {
      result.code = biaozhunMatch[0];
      result.identifierType = "biaozhun";
      result.confidence += 0.25;
    }

    // 提取发布机构
    const orgPatterns = [
      /(全国人民代表大会常务委员会|全国人大常委会)/,
      /(国务院)/,
      /(国家\w+委员会|国家\w+局)/,
      /(工业和信息化部|工信部)/,
      /(教育部|教育部办公厅)/,
      /(国家卫生健康委员会|国家卫健委)/,
      /(中国人民银行|央行)/,
    ];
    for (const pattern of orgPatterns) {
      const match = rawText.match(pattern);
      if (match) {
        result.publishOrg = match[0];
        result.confidence += 0.2;
        break;
      }
    }

    // 推断级别
    if (rawText.includes("法律") || result.title?.includes("法")) {
      result.level = "法律";
    } else if (rawText.includes("国务院") || rawText.includes("条例")) {
      result.level = "行政法规";
    } else if (rawText.includes("标准") || rawText.includes("GB")) {
      result.level = rawText.includes("GB/T") || rawText.includes("/T") ? "国家标准" : "国家标准";
    } else if (rawText.includes("指南") || rawText.includes("指引")) {
      result.level = "指南指引";
    }

    // 提取日期
    const dateMatch = rawText.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
    if (dateMatch) {
      result.publishDate = `${dateMatch[1]}-${dateMatch[2].padStart(2, "0")}-${dateMatch[3].padStart(2, "0")}`;
      result.confidence += 0.1;
    }

    // 提取描述（前200字）
    const descMatch = rawText.match(/(?:为了|为|根据|依据)[\s\S]{50,200}?[。；]/);
    if (descMatch) {
      result.description = descMatch[0].slice(0, 200);
      result.confidence += 0.15;
    }

    setParsedResult(result);
    setSmartParsing(false);

    // 自动填充表单
    if (result.title) updateField("title", result.title);
    if (result.code) {
      updateField("identifier", {
        ...formData.identifier,
        type: result.identifierType || "wenhao",
        value: result.code,
      });
    }
    if (result.publishOrg) updateField("publishOrg", result.publishOrg);
    if (result.level) updateField("level", result.level);
    if (result.publishDate) updateField("publishDate", result.publishDate);
    if (result.description) updateField("description", result.description);
    updateField("fullText", rawText);

    toast.success(`智能解析完成，置信度 ${Math.round(result.confidence * 100)}%`);
  };

  // 提交
  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("请输入政策标题");
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newPolicy: Policy = {
        id: `pol-${Date.now()}`,
        title: formData.title,
        code: formData.identifier.value,
        level: formData.level,
        industries: formData.industries,
        regions: formData.regions,
        publishOrg: formData.publishOrg,
        currentVersion: {
          versionId: `ver-${Date.now()}`,
          versionNumber: "v1.0",
          publishDate: formData.publishDate,
          effectiveDate: formData.effectiveDate,
          status: "current",
        },
        versions: [],
        tags: formData.tags.map((t) => ({
          id: `tag-${t}`,
          name: t,
          color: "blue",
          category: "法律",
        })),
        description: formData.description,
        fullText: formData.fullText,
        downloadUrl: formData.sourceUrl,
        clauseCount: 0,
        couCount: 0,
      };

      toast.success("政策创建成功！");
      onSuccess?.(newPolicy);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 验证当前步骤
  const validateStep = () => {
    switch (wizardSteps[currentStep].key) {
      case "basic":
        if (!formData.title.trim()) {
          toast.error("请输入政策标题");
          return false;
        }
        return true;
      case "source":
        if (!formData.publishOrg.trim()) {
          toast.error("请输入发布机构");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  // 下一步
  const nextStep = () => {
    if (validateStep() && currentStep < wizardSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  // 上一步
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* 顶部 */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-slate-800">新增政策</h1>
            <p className="text-xs text-slate-500">支持多种录入方式，灵活适应不同文件格式</p>
          </div>
        </div>

        {/* 模式切换 */}
        <Tabs value={mode} onValueChange={(v) => setMode(v as InputMode)} className="w-auto">
          <TabsList className="grid w-[320px] grid-cols-3">
            <TabsTrigger value="wizard" className="text-xs">
              <ChevronRight className="w-3 h-3 mr-1" />
              向导
            </TabsTrigger>
            <TabsTrigger value="quick" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              快速
            </TabsTrigger>
            <TabsTrigger value="smart" className="text-xs">
              <Brain className="w-3 h-3 mr-1" />
              智能
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 主内容 */}
      <div className="flex-1 overflow-hidden">
        {/* 向导模式 */}
        {mode === "wizard" && (
          <div className="h-full flex flex-col">
            {/* 步骤指示器 */}
            <div className="px-6 py-3 bg-white/50 border-b border-slate-200/50">
              <div className="flex items-center justify-center">
                {wizardSteps.map((step, idx) => {
                  const StepIcon = step.icon;
                  const isActive = currentStep === idx;
                  const isCompleted = currentStep > idx;

                  return (
                    <React.Fragment key={step.key}>
                      <div
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          isActive ? "bg-blue-100 text-blue-700" : isCompleted ? "text-green-600" : "text-slate-400"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                            isActive ? "bg-blue-500 text-white" : isCompleted ? "bg-green-500 text-white" : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {isCompleted ? <CheckCircle className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                        </div>
                        <span className="text-sm font-medium hidden sm:block">{step.label}</span>
                      </div>
                      {idx < wizardSteps.length - 1 && <ChevronRight className="w-4 h-4 text-slate-300 mx-1" />}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* 表单内容 */}
            <div className="flex-1 overflow-auto p-6">
              <div className="max-w-3xl mx-auto">
                {/* 步骤 1: 文件标识 */}
                {currentStep === 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-500" />
                        文件标识
                        <Badge variant="secondary" className="text-xs font-normal">支持多种编号格式</Badge>
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
                          placeholder="如：《数据安全法》"
                          value={formData.title}
                          onChange={(e) => updateField("title", e.target.value)}
                        />
                      </div>

                      {/* 文件标识类型 */}
                      <div className="space-y-2">
                        <Label>文件标识类型</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {IDENTIFIER_TYPES.map((type) => (
                            <button
                              key={type.key}
                              onClick={() => updateField("identifier", { ...formData.identifier, type: type.key })}
                              className={`p-3 rounded-lg border text-left transition-all ${
                                formData.identifier.type === type.key
                                  ? "border-blue-500 bg-blue-50 text-blue-700"
                                  : "border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              <div className="font-medium text-sm">{type.label}</div>
                              <div className="text-xs text-slate-500 mt-1 truncate">{type.example}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 标识值 */}
                      {formData.identifier.type !== "none" && (
                        <div className="space-y-2">
                          <Label htmlFor="identifier">
                            {IDENTIFIER_TYPES.find((t) => t.key === formData.identifier.type)?.label}
                          </Label>
                          <Input
                            id="identifier"
                            placeholder={IDENTIFIER_TYPES.find((t) => t.key === formData.identifier.type)?.placeholder}
                            value={formData.identifier.value}
                            onChange={(e) =>
                              updateField("identifier", { ...formData.identifier, value: e.target.value })
                            }
                          />
                          <p className="text-xs text-slate-500">
                            {IDENTIFIER_TYPES.find((t) => t.key === formData.identifier.type)?.example}
                          </p>
                        </div>
                      )}

                      {/* 政策级别 */}
                      <div className="space-y-2">
                        <Label>政策级别</Label>
                        <div className="flex flex-wrap gap-2">
                          {POLICY_LEVELS.map((level) => (
                            <Badge
                              key={level}
                              variant={formData.level === level ? "default" : "outline"}
                              className="cursor-pointer px-3 py-1"
                              onClick={() => updateField("level", level)}
                            >
                              {level}
                              <span className="ml-1 opacity-70">({POLICY_LEVEL_WEIGHTS[level]})</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 步骤 2: 来源信息 */}
                {currentStep === 1 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building className="w-5 h-5 text-green-500" />
                        来源信息
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
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
                        <div className="flex flex-wrap gap-2 mt-2">
                          {["全国人大常委会", "国务院", "工信部", "教育部", "国家网信办", "央行"].map((org) => (
                            <Badge
                              key={org}
                              variant="outline"
                              className="cursor-pointer"
                              onClick={() => updateField("publishOrg", org)}
                            >
                              {org}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="publishDate">发布日期</Label>
                          <Input
                            id="publishDate"
                            type="date"
                            value={formData.publishDate}
                            onChange={(e) => updateField("publishDate", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="effectiveDate">生效日期</Label>
                          <Input
                            id="effectiveDate"
                            type="date"
                            value={formData.effectiveDate}
                            onChange={(e) => updateField("effectiveDate", e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sourceUrl">原文链接</Label>
                        <Input
                          id="sourceUrl"
                          type="url"
                          placeholder="https://..."
                          value={formData.sourceUrl}
                          onChange={(e) => updateField("sourceUrl", e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 步骤 3: 适用范围 */}
                {currentStep === 2 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Globe className="w-5 h-5 text-purple-500" />
                        适用范围
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>适用行业</Label>
                        <div className="flex flex-wrap gap-2">
                          {INDUSTRIES.map((industry) => (
                            <Badge
                              key={industry}
                              variant={formData.industries.includes(industry) ? "default" : "outline"}
                              className="cursor-pointer px-3 py-1"
                              onClick={() => toggleIndustry(industry)}
                            >
                              {industry}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>适用地区</Label>
                        <div className="flex flex-wrap gap-2">
                          {REGIONS.map((region) => (
                            <Badge
                              key={region}
                              variant={formData.regions.includes(region) ? "default" : "outline"}
                              className="cursor-pointer px-3 py-1"
                              onClick={() =>
                                updateField(
                                  "regions",
                                  formData.regions.includes(region)
                                    ? formData.regions.filter((r) => r !== region)
                                    : [...formData.regions, region]
                                )
                              }
                            >
                              {region}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>标签</Label>
                        <div className="flex flex-wrap gap-2">
                          {PRESET_TAGS.map((tag) => (
                            <Badge
                              key={tag}
                              variant={formData.tags.includes(tag) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => toggleTag(tag)}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <Input
                          placeholder="自定义标签，回车添加"
                          className="mt-2"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const value = (e.target as HTMLInputElement).value.trim();
                              if (value && !formData.tags.includes(value)) {
                                toggleTag(value);
                                (e.target as HTMLInputElement).value = "";
                              }
                            }
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 步骤 4: 内容 */}
                {currentStep === 3 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Scale className="w-5 h-5 text-amber-500" />
                        内容
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="description">政策描述</Label>
                        <Textarea
                          id="description"
                          placeholder="简要描述政策的主要内容..."
                          value={formData.description}
                          onChange={(e) => updateField("description", e.target.value)}
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fullText">全文内容（可选）</Label>
                        <Textarea
                          id="fullText"
                          placeholder="粘贴政策的完整正文..."
                          value={formData.fullText}
                          onChange={(e) => updateField("fullText", e.target.value)}
                          rows={10}
                          className="font-mono text-sm"
                        />
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
                {currentStep > 0 && (
                  <Button variant="outline" onClick={prevStep}>
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    上一步
                  </Button>
                )}
                {currentStep < wizardSteps.length - 1 ? (
                  <Button onClick={nextStep}>
                    下一步
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-gradient-to-r from-blue-600 to-cyan-600">
                    {isSubmitting ? "提交中..." : "确认创建"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 快速模式 */}
        {mode === "quick" && (
          <ScrollArea className="h-full">
            <div className="max-w-3xl mx-auto p-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    快速录入
                    <Badge variant="outline" className="text-xs">一行一个字段</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>标题 *</Label>
                    <Input
                      placeholder="《数据安全法》"
                      value={formData.title}
                      onChange={(e) => updateField("title", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>标识类型</Label>
                      <Select
                        value={formData.identifier.type}
                        onValueChange={(v) => updateField("identifier", { ...formData.identifier, type: v as DocumentIdentifier["type"] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {IDENTIFIER_TYPES.map((t) => (
                            <SelectItem key={t.key} value={t.key}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.identifier.type !== "none" && (
                      <div className="space-y-2">
                        <Label>标识</Label>
                        <Input
                          placeholder="编号"
                          value={formData.identifier.value}
                          onChange={(e) => updateField("identifier", { ...formData.identifier, value: e.target.value })}
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>级别</Label>
                      <Select value={formData.level} onValueChange={(v) => updateField("level", v as PolicyLevel)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {POLICY_LEVELS.map((l) => (
                            <SelectItem key={l} value={l}>
                              {l}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>发布机构</Label>
                      <Input
                        placeholder="发布机构"
                        value={formData.publishOrg}
                        onChange={(e) => updateField("publishOrg", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>发布日期</Label>
                      <Input
                        type="date"
                        value={formData.publishDate}
                        onChange={(e) => updateField("publishDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>生效日期</Label>
                      <Input
                        type="date"
                        value={formData.effectiveDate}
                        onChange={(e) => updateField("effectiveDate", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>描述</Label>
                    <Textarea
                      placeholder="政策描述..."
                      value={formData.description}
                      onChange={(e) => updateField("description", e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>全文（可选）</Label>
                    <Textarea
                      placeholder="粘贴全文..."
                      value={formData.fullText}
                      onChange={(e) => updateField("fullText", e.target.value)}
                      rows={6}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={onCancel}>
                  取消
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-gradient-to-r from-blue-600 to-cyan-600">
                  {isSubmitting ? "提交中..." : "快速创建"}
                </Button>
              </div>
            </div>
          </ScrollArea>
        )}

        {/* 智能模式 */}
        {mode === "smart" && (
          <ScrollArea className="h-full">
            <div className="max-w-3xl mx-auto p-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-500" />
                    智能识别录入
                    <Badge variant="outline" className="text-xs">粘贴文本自动提取</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 原始文本输入 */}
                  <div className="space-y-2">
                    <Label htmlFor="rawText">粘贴政策文本</Label>
                    <Textarea
                      id="rawText"
                      placeholder={`粘贴政策文件的任意文本内容，系统将自动识别：
• 标题（《书名号的标题》或第一行）
• 编号（发文字号、标准号、公告号等）
• 发布机构
• 发布日期
• 政策级别

示例：
《中华人民共和国数据安全法》
（2021年6月10日第十三届全国人民代表大会常务委员会第二十九次会议通过）
主席令 第四十五号
...`}
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      rows={12}
                      className="font-mono text-sm"
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-slate-500">
                        支持：法律条文、标准文件、通知公告、白皮书等各种格式
                      </p>
                      <Button
                        size="sm"
                        onClick={handleSmartParse}
                        disabled={smartParsing || !rawText.trim()}
                        className="bg-gradient-to-r from-purple-600 to-pink-600"
                      >
                        {smartParsing ? (
                          <>
                            <Sparkles className="w-4 h-4 mr-1 animate-pulse" />
                            识别中...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4 mr-1" />
                            智能识别
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* 识别结果预览 */}
                  {parsedResult && (
                    <div className="space-y-4">
                      <Separator />
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          识别结果
                        </h4>
                        <Badge variant={parsedResult.confidence > 0.6 ? "default" : "secondary"}>
                          置信度 {Math.round(parsedResult.confidence * 100)}%
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                        {parsedResult.title && (
                          <div>
                            <span className="text-xs text-slate-500">标题</span>
                            <p className="text-sm font-medium">{parsedResult.title}</p>
                          </div>
                        )}
                        {parsedResult.code && (
                          <div>
                            <span className="text-xs text-slate-500">
                              {IDENTIFIER_TYPES.find((t) => t.key === parsedResult.identifierType)?.label || "编号"}
                            </span>
                            <p className="text-sm font-medium">{parsedResult.code}</p>
                          </div>
                        )}
                        {parsedResult.publishOrg && (
                          <div>
                            <span className="text-xs text-slate-500">发布机构</span>
                            <p className="text-sm font-medium">{parsedResult.publishOrg}</p>
                          </div>
                        )}
                        {parsedResult.level && (
                          <div>
                            <span className="text-xs text-slate-500">级别</span>
                            <p className="text-sm font-medium">{parsedResult.level}</p>
                          </div>
                        )}
                        {parsedResult.publishDate && (
                          <div>
                            <span className="text-xs text-slate-500">发布日期</span>
                            <p className="text-sm font-medium">{parsedResult.publishDate}</p>
                          </div>
                        )}
                      </div>

                      {parsedResult.confidence < 0.5 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          识别置信度较低，请检查并补充信息
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 表单数据确认 */}
              {(parsedResult || formData.title) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">信息确认与补充</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>标题 *</Label>
                        <Input
                          value={formData.title}
                          onChange={(e) => updateField("title", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>标识</Label>
                        <div className="flex gap-2">
                          <Select
                            value={formData.identifier.type}
                            onValueChange={(v) =>
                              updateField("identifier", { ...formData.identifier, type: v as DocumentIdentifier["type"] })
                            }
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {IDENTIFIER_TYPES.map((t) => (
                                <SelectItem key={t.key} value={t.key}>
                                  {t.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {formData.identifier.type !== "none" && (
                            <Input
                              className="flex-1"
                              placeholder="编号"
                              value={formData.identifier.value}
                              onChange={(e) =>
                                updateField("identifier", { ...formData.identifier, value: e.target.value })
                              }
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>发布机构</Label>
                        <Input
                          value={formData.publishOrg}
                          onChange={(e) => updateField("publishOrg", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>级别</Label>
                        <Select value={formData.level} onValueChange={(v) => updateField("level", v as PolicyLevel)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {POLICY_LEVELS.map((l) => (
                              <SelectItem key={l} value={l}>
                                {l}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>描述</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => updateField("description", e.target.value)}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={onCancel}>
                  取消
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting || !formData.title} className="bg-gradient-to-r from-purple-600 to-pink-600">
                  {isSubmitting ? "提交中..." : "创建政策"}
                </Button>
              </div>
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}

export default PolicyCreateFlexible;
