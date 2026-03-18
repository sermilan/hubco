// ============ COU编辑表单 ============
// 用于创建和编辑COU
// 包含基本信息、五维标签、动作要求编辑

import React, { useState, useCallback, useMemo } from "react";
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Layers,
  Briefcase,
  Sparkles,
  Link2,
  Globe,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { toast } from "sonner";
import type {
  COU,
  ActionRequirement,
  FiveDimensionalTags,
  PolicyLevel,
  PenaltyLevel,
  Industry,
  Region,
  UserType,
} from "../../types";
import { POLICY_LEVEL_WEIGHTS, PENALTY_WEIGHTS } from "../../types";
import { MOCK_POLICIES, MOCK_CLAUSES, MOCK_CONTROL_OBJECTIVES } from "../../data/mockData";
import {
  createEmptyFiveDimensionalTags,
  validateFiveDimensionalTags,
} from "../../services/tagMatching";
import { ActionRequirementForm, createEmptyActionRequirement } from "./ActionRequirementForm";
import { FiveDimensionalTagSelector } from "./FiveDimensionalTagSelector";

interface COUFormProps {
  initialCOU?: COU;
  onSave: (cou: COU) => void;
  onCancel: () => void;
}

// 义务类型选项
const OBLIGATION_TYPES: COU["obligationType"][] = [
  "禁止性",
  "强制性",
  "推荐性",
  "指导性",
];

// 状态选项
const STATUS_OPTIONS: { value: COU["status"]; label: string }[] = [
  { value: "current", label: "当前生效" },
  { value: "revised", label: "已修订" },
  { value: "deprecated", label: "已废弃" },
];

// 行业选项
const INDUSTRY_OPTIONS: Industry[] = [
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

// 地区选项
const REGION_OPTIONS: Region[] = ["国内", "欧盟", "美国", "东南亚", "全球"];

// 用户类型选项
const USER_TYPE_OPTIONS: UserType[] = [
  "个人",
  "中小企业",
  "大型企业",
  "上市公司",
  "关基运营者",
];

export function COUForm({ initialCOU, onSave, onCancel }: COUFormProps) {
  const isEditing = !!initialCOU;

  // ============ 表单状态 ============
  const [code, setCode] = useState(initialCOU?.code || "");
  const [title, setTitle] = useState(initialCOU?.title || "");
  const [description, setDescription] = useState(initialCOU?.description || "");
  const [obligationType, setObligationType] = useState<COU["obligationType"]>(
    initialCOU?.obligationType || "强制性"
  );
  const [status, setStatus] = useState<COU["status"]>(
    initialCOU?.status || "current"
  );
  const [version, setVersion] = useState(initialCOU?.version || "1.0");

  // 关联关系
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>(
    initialCOU?.policyId || ""
  );
  const [selectedClauseIds, setSelectedClauseIds] = useState<string[]>(
    initialCOU?.sourceClauseIds || []
  );
  const [controlObjectiveId, setControlObjectiveId] = useState<string>(
    initialCOU?.controlObjectiveId || ""
  );

  // 合规要素
  const [actionRequired, setActionRequired] = useState(
    initialCOU?.actionRequired || ""
  );
  const [deadline, setDeadline] = useState(initialCOU?.deadline || "");
  const [penalty, setPenalty] = useState(initialCOU?.penalty || "");
  const [penaltyLevel, setPenaltyLevel] = useState<PenaltyLevel>(
    initialCOU?.penaltyLevel || "无"
  );

  // 权重
  const [baseWeight, setBaseWeight] = useState(
    initialCOU?.baseWeight || 5
  );
  const [penaltyWeight, setPenaltyWeight] = useState(
    initialCOU?.penaltyWeight || 1
  );

  // 标签
  const [fiveDimTags, setFiveDimTags] = useState<FiveDimensionalTags>(
    initialCOU?.fiveDimensionalTags || createEmptyFiveDimensionalTags()
  );

  // 适用范围
  const [applicableIndustries, setApplicableIndustries] = useState<Industry[]>(
    initialCOU?.applicableIndustries || ["通用"]
  );
  const [applicableRegions, setApplicableRegions] = useState<Region[]>(
    initialCOU?.applicableRegions || ["国内"]
  );
  const [applicableUserTypes, setApplicableUserTypes] = useState<UserType[]>(
    initialCOU?.applicableUserTypes || ["大型企业"]
  );

  // 动作要求
  const [actionRequirements, setActionRequirements] = useState<
    ActionRequirement[]
  >(initialCOU?.actionRequirements || []);

  // 验证状态
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // ============ 派生数据 ============
  const selectedPolicy = useMemo(
    () => MOCK_POLICIES.find((p) => p.id === selectedPolicyId),
    [selectedPolicyId]
  );

  const policyClauses = useMemo(
    () => MOCK_CLAUSES.filter((c) => c.policyId === selectedPolicyId),
    [selectedPolicyId]
  );

  // 根据选择政策自动更新基础权重
  const autoBaseWeight = useMemo(() => {
    if (selectedPolicy) {
      return POLICY_LEVEL_WEIGHTS[selectedPolicy.level as PolicyLevel] || 5;
    }
    return 5;
  }, [selectedPolicy]);

  // 当政策变化时自动更新基础权重
  React.useEffect(() => {
    if (selectedPolicy && !isEditing) {
      setBaseWeight(autoBaseWeight);
    }
  }, [autoBaseWeight, selectedPolicy, isEditing]);

  // 罚则力度变化时更新罚则权重
  React.useEffect(() => {
    setPenaltyWeight(PENALTY_WEIGHTS[penaltyLevel]);
  }, [penaltyLevel]);

  // ============ 事件处理 ============
  const handleAddActionRequirement = useCallback(() => {
    setActionRequirements([...actionRequirements, createEmptyActionRequirement()]);
  }, [actionRequirements]);

  const handleUpdateActionRequirement = useCallback(
    (index: number, updated: ActionRequirement) => {
      const newRequirements = [...actionRequirements];
      newRequirements[index] = updated;
      setActionRequirements(newRequirements);
    },
    [actionRequirements]
  );

  const handleRemoveActionRequirement = useCallback(
    (index: number) => {
      setActionRequirements(actionRequirements.filter((_, i) => i !== index));
    },
    [actionRequirements]
  );

  const toggleClauseSelection = (clauseId: string) => {
    setSelectedClauseIds((prev) =>
      prev.includes(clauseId)
        ? prev.filter((id) => id !== clauseId)
        : [...prev, clauseId]
    );
  };

  // 验证表单
  const validateForm = useCallback((): boolean => {
    const errors: string[] = [];

    if (!code.trim()) errors.push("COU编码不能为空");
    if (!title.trim()) errors.push("标题不能为空");
    if (!description.trim()) errors.push("描述不能为空");
    if (!selectedPolicyId) errors.push("请选择来源政策");
    if (selectedClauseIds.length === 0) errors.push("请至少选择一个来源条款");
    if (!controlObjectiveId) errors.push("请选择关联的控制目标");

    const tagValidation = validateFiveDimensionalTags(fiveDimTags);
    if (!tagValidation.valid) {
      errors.push(...tagValidation.errors.filter((e) => !e.startsWith("警告")));
    }

    setValidationErrors(errors);
    return errors.length === 0;
  }, [
    code,
    title,
    description,
    selectedPolicyId,
    selectedClauseIds,
    controlObjectiveId,
    fiveDimTags,
  ]);

  // 保存COU
  const handleSave = useCallback(
    (isDraft: boolean = false) => {
      if (!validateForm()) {
        toast.error("请修复表单中的错误");
        return;
      }

      const newCOU: COU = {
        id: initialCOU?.id || `cou-${Date.now()}`,
        code,
        title,
        description,
        controlObjectiveId,
        sourceClauseIds: selectedClauseIds,
        policyId: selectedPolicyId,
        policyTitle: selectedPolicy?.title || "",
        policyLevel: (selectedPolicy?.level || "部门规章") as PolicyLevel,

        // 场景化定制（简化版）
        customization: {
          adaptedActions: actionRequirements,
          additionalRequirements: [],
          simplifiedRequirements: [],
          customDeadlines: {},
          customPriorities: {},
        },

        obligationType,
        actionRequired: actionRequired || undefined,
        deadline: deadline || undefined,
        penalty: penalty || undefined,
        penaltyLevel,

        baseWeight,
        penaltyWeight,
        tagMatchScore: initialCOU?.tagMatchScore || 0,
        scenarioWeight: initialCOU?.scenarioWeight || 1,
        finalWeight:
          initialCOU?.finalWeight ||
          baseWeight * penaltyWeight,

        tags: initialCOU?.tags || [],
        fiveDimensionalTags: fiveDimTags,
        tagWeights: initialCOU?.tagWeights || {},
        autoTags: initialCOU?.autoTags || [],
        autoTagConfidence: initialCOU?.autoTagConfidence,

        actionRequirements,

        applicableIndustries,
        applicableRegions,
        applicableUserTypes,

        version,
        status: isDraft ? "revised" : status,

        createdAt: initialCOU?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),

        llmMetadata: initialCOU?.llmMetadata,
      };

      onSave(newCOU);
      toast.success(isEditing ? "COU已更新" : "COU已创建");
    },
    [
      validateForm,
      code,
      title,
      description,
      controlObjectiveId,
      selectedClauseIds,
      selectedPolicyId,
      selectedPolicy,
      obligationType,
      actionRequired,
      deadline,
      penalty,
      penaltyLevel,
      baseWeight,
      penaltyWeight,
      fiveDimTags,
      actionRequirements,
      applicableIndustries,
      applicableRegions,
      applicableUserTypes,
      version,
      status,
      initialCOU,
      onSave,
      isEditing,
    ]
  );

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onCancel} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            返回
          </Button>
          <div className="h-6 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-800">
                {isEditing ? "编辑COU" : "新建COU"}
              </h1>
              <p className="text-xs text-slate-500">
                {isEditing ? `编辑 ${initialCOU?.code}` : "创建新的合规义务单元"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleSave(true)}>
            <Clock className="w-4 h-4 mr-2" />
            保存草稿
          </Button>
          <Button
            onClick={() => handleSave(false)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isEditing ? "保存修改" : "发布COU"}
          </Button>
        </div>
      </div>

      {/* 验证错误提示 */}
      {validationErrors.length > 0 && (
        <div className="px-6 py-3 bg-red-50 border-b border-red-100">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-medium text-red-700 mb-1">
                请修复以下问题：
              </div>
              <ul className="text-sm text-red-600 space-y-0.5">
                {validationErrors.map((error, idx) => (
                  <li key={idx}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 主内容区 */}
      <ScrollArea className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-500" />
                基本信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-600 text-xs">COU编码</Label>
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="如: COU-DSL-001"
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600 text-xs">版本号</Label>
                  <Input
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="如: 1.0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-600 text-xs">义务类型</Label>
                  <Select
                    value={obligationType}
                    onValueChange={(v) => setObligationType(v as COU["obligationType"])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OBLIGATION_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600 text-xs">状态</Label>
                  <Select
                    value={status}
                    onValueChange={(v) => setStatus(v as COU["status"])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600 text-xs">标题</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="简短描述合规义务"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600 text-xs">详细描述</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="详细描述合规要求..."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* 关联关系 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Link2 className="w-4 h-4 text-purple-500" />
                关联关系
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-600 text-xs">来源政策</Label>
                  <Select
                    value={selectedPolicyId}
                    onValueChange={(v) => {
                      setSelectedPolicyId(v);
                      setSelectedClauseIds([]);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择政策文件" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_POLICIES.map((policy) => (
                        <SelectItem key={policy.id} value={policy.id}>
                          {policy.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600 text-xs">控制目标</Label>
                  <Select
                    value={controlObjectiveId}
                    onValueChange={setControlObjectiveId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择控制目标" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_CONTROL_OBJECTIVES.map((co) => (
                        <SelectItem key={co.id} value={co.id}>
                          {co.code} - {co.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 条款多选 */}
              {selectedPolicyId && (
                <div className="space-y-2">
                  <Label className="text-slate-600 text-xs">来源条款</Label>
                  <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                    {policyClauses.map((clause) => (
                      <label
                        key={clause.id}
                        className="flex items-start gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedClauseIds.includes(clause.id)}
                          onChange={() => toggleClauseSelection(clause.id)}
                          className="mt-1 rounded border-slate-300"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium">
                            {clause.chapter} {clause.article}
                          </span>
                          <p className="text-xs text-slate-500 line-clamp-1">
                            {clause.content}
                          </p>
                        </div>
                      </label>
                    ))}
                    {policyClauses.length === 0 && (
                      <p className="text-sm text-slate-400 text-center py-2">
                        该政策下暂无条款
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 合规要素 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                合规要素
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-600 text-xs">要求的行动</Label>
                <Input
                  value={actionRequired}
                  onChange={(e) => setActionRequired(e.target.value)}
                  placeholder="如：建立数据安全管理制度、开展安全评估等"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-600 text-xs">期限要求</Label>
                  <Input
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    placeholder="如：30天、立即、年度"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600 text-xs">罚则力度</Label>
                  <Select
                    value={penaltyLevel}
                    onValueChange={(v) => setPenaltyLevel(v as PenaltyLevel)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PENALTY_WEIGHTS).map(([level, weight]) => (
                        <SelectItem key={level} value={level}>
                          {level} (权重{weight})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600 text-xs">违规后果</Label>
                <Textarea
                  value={penalty}
                  onChange={(e) => setPenalty(e.target.value)}
                  placeholder="描述违规后的法律责任..."
                  className="min-h-[60px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* 权重配置 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-orange-500" />
                权重配置
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-600 text-xs">基础权重</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={baseWeight}
                    onChange={(e) => setBaseWeight(Number(e.target.value))}
                  />
                  {selectedPolicy && (
                    <p className="text-xs text-slate-400">
                      基于政策级别「{selectedPolicy.level}」自动计算
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600 text-xs">罚则权重</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={penaltyWeight}
                    disabled
                  />
                  <p className="text-xs text-slate-400">
                    基于罚则力度「{penaltyLevel}」自动计算
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 适用范围 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-500" />
                适用范围
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-600 text-xs">适用行业</Label>
                <div className="flex flex-wrap gap-2">
                  {INDUSTRY_OPTIONS.map((industry) => (
                    <label
                      key={industry}
                      className={`px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors ${
                        applicableIndustries.includes(industry)
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={applicableIndustries.includes(industry)}
                        onChange={() => {
                          setApplicableIndustries((prev) =>
                            prev.includes(industry)
                              ? prev.filter((i) => i !== industry)
                              : [...prev, industry]
                          );
                        }}
                      />
                      {industry}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600 text-xs">适用地区</Label>
                <div className="flex flex-wrap gap-2">
                  {REGION_OPTIONS.map((region) => (
                    <label
                      key={region}
                      className={`px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors ${
                        applicableRegions.includes(region)
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={applicableRegions.includes(region)}
                        onChange={() => {
                          setApplicableRegions((prev) =>
                            prev.includes(region)
                              ? prev.filter((r) => r !== region)
                              : [...prev, region]
                          );
                        }}
                      />
                      {region}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600 text-xs">适用用户类型</Label>
                <div className="flex flex-wrap gap-2">
                  {USER_TYPE_OPTIONS.map((type) => (
                    <label
                      key={type}
                      className={`px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors ${
                        applicableUserTypes.includes(type)
                          ? "bg-purple-100 text-purple-700"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={applicableUserTypes.includes(type)}
                        onChange={() => {
                          setApplicableUserTypes((prev) =>
                            prev.includes(type)
                              ? prev.filter((t) => t !== type)
                              : [...prev, type]
                          );
                        }}
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 五维标签 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" />
                五维标签
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FiveDimensionalTagSelector
                value={fiveDimTags}
                onChange={setFiveDimTags}
                showPreview={true}
              />
            </CardContent>
          </Card>

          {/* 动作要求 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                动作义务定义
                <Badge
                  variant="outline"
                  className="text-xs bg-red-100 text-red-700 border-red-200"
                >
                  核心
                </Badge>
              </CardTitle>
              <Button variant="outline" size="sm" onClick={handleAddActionRequirement}>
                <Plus className="w-4 h-4 mr-1" />
                添加动作
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {actionRequirements.length === 0 ? (
                <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-lg">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">暂无动作义务定义</p>
                  <p className="text-xs mt-1">点击上方按钮添加</p>
                </div>
              ) : (
                actionRequirements.map((req, index) => (
                  <ActionRequirementForm
                    key={index}
                    value={req}
                    onChange={(updated) =>
                      handleUpdateActionRequirement(index, updated)
                    }
                    onDelete={() => handleRemoveActionRequirement(index)}
                  />
                ))
              )}
            </CardContent>
          </Card>

          {/* 底部操作按钮 */}
          <div className="flex items-center justify-end gap-2 pb-6">
            <Button variant="outline" onClick={onCancel}>
              取消
            </Button>
            <Button variant="outline" onClick={() => handleSave(true)}>
              <Clock className="w-4 h-4 mr-2" />
              保存草稿
            </Button>
            <Button
              onClick={() => handleSave(false)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? "保存修改" : "发布COU"}
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

export default COUForm;
