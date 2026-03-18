// ============ 场景模板管理器 ============
// 管理场景模板的创建、编辑、发布
// 模板可在主应用的场景构建器中使用

import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  Copy,
  Eye,
  MoreHorizontal,
  Search,
  Filter,
  LayoutGrid,
  List,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Tag,
  Target,
  BarChart3,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "../ui/utils";
import type { SceneTemplate } from "../../types";
import { UnifiedSceneBuilder } from "../scene/UnifiedSceneBuilder";

// 模拟模板数据 - 实际应从API获取
const MOCK_TEMPLATES: SceneTemplate[] = [
  {
    id: "scene-game-eu",
    name: "游戏出海欧盟",
    description: "面向欧盟市场的游戏产品合规方案，涵盖GDPR、数字服务法等法规要求",
    icon: "🎮",
    category: "出海合规",
    targetIndustries: ["游戏", "互联网"],
    targetRegions: ["欧盟"],
    targetUserTypes: ["大型企业"],
    tagProfile: {
      requiredTags: ["OBJ-PI", "LIF-SHA", "SEC-CRY"],
      preferredTags: ["ACT-CON", "ACT-NOT", "ACT-RES"],
      excludedTags: [],
      tagWeights: { "OBJ-PI": 2.0, "LIF-SHA": 1.5, "SEC-CRY": 1.5 },
      tagCoefficients: { objects: 1.2, subjects: 1.0, lifecycles: 1.3, securities: 1.2, actions: 1.0 },
    },
    matchingConfig: {
      minMatchScore: 0.6,
      boostForActionTags: true,
      requireAllActionTags: false,
      includeRelatedTags: true,
      includeHierarchy: true,
    },
    recommendedCOUs: [],
    usageCount: 128,
    isPopular: true,
    requiredTags: ["OBJ-PI", "LIF-SHA", "SEC-CRY"],
    optionalTags: ["ACT-CON", "ACT-NOT", "ACT-RES"],
  },
  {
    id: "scene-finance-ml3",
    name: "金融等保三级",
    description: "金融机构等保三级合规方案，涵盖数据安全、网络安全、应用安全等全方位要求",
    icon: "🏦",
    category: "行业合规",
    targetIndustries: ["金融"],
    targetRegions: ["国内"],
    targetUserTypes: ["大型企业", "关基运营者"],
    tagProfile: {
      requiredTags: ["OBJ-IMP", "SUB-CII", "SEC-ORG", "SEC-TEC"],
      preferredTags: ["ACT-AUD", "ACT-ASS", "ACT-IMP"],
      excludedTags: [],
      tagWeights: { "OBJ-IMP": 2.5, "SUB-CII": 2.0, "SEC-ORG": 1.8 },
      tagCoefficients: { objects: 1.5, subjects: 1.3, lifecycles: 1.0, securities: 1.5, actions: 1.2 },
    },
    matchingConfig: {
      minMatchScore: 0.7,
      boostForActionTags: true,
      requireAllActionTags: false,
      includeRelatedTags: true,
      includeHierarchy: true,
    },
    recommendedCOUs: [],
    usageCount: 256,
    isPopular: true,
    requiredTags: ["OBJ-IMP", "SUB-CII", "SEC-ORG", "SEC-TEC"],
    optionalTags: ["ACT-AUD", "ACT-ASS", "ACT-IMP"],
  },
  {
    id: "scene-saas-general",
    name: "SaaS平台通用合规",
    description: "面向国内SaaS平台的通用合规方案，涵盖数据安全法、个人信息保护法等基础要求",
    icon: "☁️",
    category: "业务合规",
    targetIndustries: ["互联网"],
    targetRegions: ["国内"],
    targetUserTypes: ["中小企业", "大型企业"],
    tagProfile: {
      requiredTags: ["OBJ-PI", "SEC-ORG"],
      preferredTags: ["ACT-DOC", "ACT-TRA", "ACT-AUD"],
      excludedTags: [],
      tagWeights: { "OBJ-PI": 2.0, "SEC-ORG": 1.5 },
      tagCoefficients: { objects: 1.3, subjects: 1.0, lifecycles: 1.0, securities: 1.2, actions: 1.0 },
    },
    matchingConfig: {
      minMatchScore: 0.5,
      boostForActionTags: true,
      requireAllActionTags: false,
      includeRelatedTags: true,
      includeHierarchy: true,
    },
    recommendedCOUs: [],
    usageCount: 512,
    isPopular: true,
    requiredTags: ["OBJ-PI", "SEC-ORG"],
    optionalTags: ["ACT-DOC", "ACT-TRA", "ACT-AUD"],
  },
  {
    id: "scene-medical-data",
    name: "医疗数据合规",
    description: "医疗机构数据处理合规方案，重点关注患者隐私保护、医疗数据安全管理",
    icon: "🏥",
    category: "行业合规",
    targetIndustries: ["医疗"],
    targetRegions: ["国内"],
    targetUserTypes: ["大型企业"],
    tagProfile: {
      requiredTags: ["OBJ-SPI", "SUB-PRO", "SEC-CRY"],
      preferredTags: ["ACT-ASS", "ACT-ENC", "ACT-ACC"],
      excludedTags: [],
      tagWeights: { "OBJ-SPI": 3.0, "SEC-CRY": 2.0, "ACT-ASS": 2.0 },
      tagCoefficients: { objects: 1.5, subjects: 1.2, lifecycles: 1.0, securities: 1.5, actions: 1.3 },
    },
    matchingConfig: {
      minMatchScore: 0.7,
      boostForActionTags: true,
      requireAllActionTags: true,
      includeRelatedTags: true,
      includeHierarchy: true,
    },
    recommendedCOUs: [],
    usageCount: 89,
    isPopular: false,
    requiredTags: ["OBJ-SPI", "SUB-PRO", "SEC-CRY"],
    optionalTags: ["ACT-ASS", "ACT-ENC", "ACT-ACC"],
  },
];

// 模板状态类型
type TemplateStatus = "published" | "draft" | "deprecated";

// 扩展模板类型，添加状态管理
interface ManagedTemplate extends SceneTemplate {
  status: TemplateStatus;
  version: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export function TemplateManager() {
  // 状态
  const [templates, setTemplates] = useState<ManagedTemplate[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<TemplateStatus | "all">("all");

  // 构建器对话框状态
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SceneTemplate | null>(null);
  const [builderMode, setBuilderMode] = useState<"create" | "edit">("create");

  // 统计状态
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    totalUsage: 0,
  });

  // 初始化加载
  useEffect(() => {
    // 模拟加载数据
    const managedTemplates: ManagedTemplate[] = MOCK_TEMPLATES.map((t) => ({
      ...t,
      status: "published",
      version: "1.0.0",
      createdBy: "admin",
      createdAt: "2024-01-01",
      updatedAt: "2024-03-01",
      publishedAt: "2024-01-15",
    }));
    setTemplates(managedTemplates);

    // 计算统计
    setStats({
      total: managedTemplates.length,
      published: managedTemplates.filter((t) => t.status === "published").length,
      draft: managedTemplates.filter((t) => t.status === "draft").length,
      totalUsage: managedTemplates.reduce((sum, t) => sum + t.usageCount, 0),
    });
  }, []);

  // 过滤模板
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || template.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" || template.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // 获取所有分类
  const categories = ["all", ...new Set(templates.map((t) => t.category))];

  // 处理创建模板
  const handleCreateTemplate = () => {
    setBuilderMode("create");
    setEditingTemplate(null);
    setShowBuilder(true);
  };

  // 处理编辑模板
  const handleEditTemplate = (template: ManagedTemplate) => {
    setBuilderMode("edit");
    setEditingTemplate(template);
    setShowBuilder(true);
  };

  // 处理删除模板
  const handleDeleteTemplate = (templateId: string) => {
    if (confirm("确定要删除此模板吗？此操作不可恢复。")) {
      setTemplates(templates.filter((t) => t.id !== templateId));
      toast.success("模板已删除");
    }
  };

  // 处理复制模板
  const handleDuplicateTemplate = (template: ManagedTemplate) => {
    const newTemplate: ManagedTemplate = {
      ...template,
      id: `scene-${Date.now()}`,
      name: `${template.name} (副本)`,
      status: "draft",
      version: "1.0.0",
      usageCount: 0,
      isPopular: false,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };
    setTemplates([...templates, newTemplate]);
    toast.success("模板已复制");
  };

  // 处理发布模板
  const handlePublishTemplate = (templateId: string) => {
    setTemplates(
      templates.map((t) =>
        t.id === templateId
          ? { ...t, status: "published", publishedAt: new Date().toISOString().split("T")[0] }
          : t
      )
    );
    toast.success("模板已发布");
  };

  // 处理保存模板
  const handleSaveTemplate = (templateData: SceneTemplate) => {
    if (builderMode === "edit" && editingTemplate) {
      // 更新现有模板
      setTemplates(
        templates.map((t) =>
          t.id === editingTemplate.id
            ? {
                ...(t as ManagedTemplate),
                ...templateData,
                updatedAt: new Date().toISOString().split("T")[0],
              }
            : t
        )
      );
      toast.success("模板已更新");
    } else {
      // 创建新模板
      const newTemplate: ManagedTemplate = {
        ...templateData,
        status: "draft",
        version: "1.0.0",
        createdBy: "admin",
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      };
      setTemplates([...templates, newTemplate]);
      toast.success("模板已创建");
    }
    setShowBuilder(false);
  };

  // 获取状态徽章
  const getStatusBadge = (status: TemplateStatus) => {
    switch (status) {
      case "published":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            已发布
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            草稿
          </Badge>
        );
      case "deprecated":
        return (
          <Badge className="bg-gray-100 text-gray-700 border-gray-200">
            <XCircle className="w-3 h-3 mr-1" />
            已弃用
          </Badge>
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50">
      {/* 顶部工具栏 */}
      <div className="px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">场景模板管理</h1>
            <p className="text-sm text-slate-500 mt-1">
              管理场景模板，供用户在场景构建器中使用
            </p>
          </div>

          <Button
            className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600"
            onClick={handleCreateTemplate}
          >
            <Plus className="w-4 h-4" />
            创建模板
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="px-6 py-4 grid grid-cols-4 gap-4">
        <Card className="bg-white/60 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">模板总数</p>
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <LayoutGrid className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">已发布</p>
                <p className="text-2xl font-bold text-green-600">{stats.published}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">草稿</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.draft}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">总使用次数</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalUsage}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选和工具栏 */}
      <div className="px-6 py-3 bg-white/50 border-y border-slate-200/50 flex items-center gap-4">
        {/* 搜索 */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="搜索模板名称、描述..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* 分类筛选 */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-9 px-3 rounded-md border border-slate-200 text-sm bg-white"
        >
          <option value="all">所有分类</option>
          {categories
            .filter((c) => c !== "all")
            .map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
        </select>

        {/* 状态筛选 */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TemplateStatus | "all")}
          className="h-9 px-3 rounded-md border border-slate-200 text-sm bg-white"
        >
          <option value="all">所有状态</option>
          <option value="published">已发布</option>
          <option value="draft">草稿</option>
          <option value="deprecated">已弃用</option>
        </select>

        <div className="flex-1" />

        {/* 视图切换 */}
        <div className="flex items-center bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              viewMode === "grid" ? "bg-white text-slate-700 shadow-sm" : "text-slate-400"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              viewMode === "list" ? "bg-white text-slate-700 shadow-sm" : "text-slate-400"
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 模板列表 */}
      <ScrollArea className="flex-1 p-6">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="group hover:shadow-lg transition-all bg-white/80 backdrop-blur-sm"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{template.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-base truncate">
                            {template.name}
                          </CardTitle>
                          {template.isPopular && (
                            <Badge className="bg-orange-500 text-white text-[10px] shrink-0">
                              热门
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-xs line-clamp-2">
                          {template.description}
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                          <Edit3 className="h-4 w-4 mr-2" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                          <Copy className="h-4 w-4 mr-2" />
                          复制
                        </DropdownMenuItem>
                        {template.status !== "published" && (
                          <DropdownMenuItem
                            onClick={() => handlePublishTemplate(template.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            发布
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                    {getStatusBadge(template.status)}
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
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

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t">
                    <span>版本 {template.version}</span>
                    <span>{template.usageCount} 次使用</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-lg border hover:shadow-md transition-all"
              >
                <div className="text-2xl">{template.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{template.name}</span>
                    {template.isPopular && (
                      <Badge className="bg-orange-500 text-white text-[10px]">
                        热门
                      </Badge>
                    )}
                    {getStatusBadge(template.status)}
                  </div>
                  <p className="text-sm text-slate-500 truncate">
                    {template.description}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <Badge variant="outline">{template.category}</Badge>
                  <span>版本 {template.version}</span>
                  <span>{template.usageCount} 次使用</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditTemplate(template)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicateTemplate(template)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">没有找到匹配的模板</p>
          </div>
        )}
      </ScrollArea>

      {/* 场景构建器对话框 - 用于创建/编辑模板 */}
      <UnifiedSceneBuilder
        open={showBuilder}
        onOpenChange={setShowBuilder}
        mode="admin"
        availableTemplates={templates}
        onSave={(scene) => {
          // 从构建的场景中提取模板信息并保存
          const templateData: SceneTemplate = {
            id: editingTemplate?.id || `scene-${Date.now()}`,
            name: scene.name,
            description: scene.description,
            icon: scene.icon || "📋",
            category: scene.category || "业务合规",
            targetIndustries: scene.targetIndustries || ["互联网"],
            targetRegions: scene.targetRegions || ["国内"],
            targetUserTypes: scene.targetUserTypes || ["中小企业"],
            tagProfile: scene.tagProfile || {
              requiredTags: [],
              preferredTags: [],
              excludedTags: [],
              tagWeights: {},
              tagCoefficients: {
                objects: 1,
                subjects: 1,
                lifecycles: 1,
                securities: 1,
                actions: 1,
              },
            },
            matchingConfig: scene.matchingConfig || {
              minMatchScore: 0.6,
              boostForActionTags: true,
              requireAllActionTags: false,
              includeRelatedTags: true,
              includeHierarchy: true,
            },
            recommendedCOUs: scene.cous?.map(c => c.id) || [],
            usageCount: editingTemplate?.usageCount || 0,
            isPopular: editingTemplate?.isPopular || false,
            requiredTags: scene.tagProfile?.requiredTags || [],
            optionalTags: scene.tagProfile?.preferredTags || [],
          };
          handleSaveTemplate(templateData);
        }}
        onSaveTemplate={handleSaveTemplate}
      />
    </div>
  );
}

export default TemplateManager;
