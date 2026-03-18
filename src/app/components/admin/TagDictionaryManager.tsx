// ============ 标签字典管理 ============
// 五维标签体系的CRUD管理和可视化

import React, { useState, useMemo, useCallback } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Search,
  Layers,
  Users,
  RefreshCw,
  Shield,
  Zap,
  GitBranch,
  History,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronRight,
  ChevronDown,
  Tag,
  Settings,
  Palette,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { Switch } from "../ui/switch";
import type { Tag as TagType, TagDomain, TagStatus } from "../../types";
import { TAG_DOMAIN_INFO } from "../../types";
import {
  ALL_TAGS,
  TAGS_BY_DOMAIN,
  TAG_CODE_MAP,
  getTagAncestors,
  getTagDescendants,
  getRelatedTags,
} from "../../data/tagDictionary";

// 维度图标映射
const DOMAIN_ICONS: Record<TagDomain, React.ReactNode> = {
  OBJECT: <Layers className="w-4 h-4" />,
  SUBJECT: <Users className="w-4 h-4" />,
  LIFECYCLE: <RefreshCw className="w-4 h-4" />,
  SECURITY: <Shield className="w-4 h-4" />,
  ACTION: <Zap className="w-4 h-4" />,
};

interface TagFormData {
  code: string;
  name: string;
  nameEn: string;
  domain: TagDomain;
  description: string;
  weight: number;
  keywords: string[];
  relatedCodes: string[];
  parentCode: string;
  color: string;
  status: TagStatus;
}

const EMPTY_FORM_DATA: TagFormData = {
  code: "",
  name: "",
  nameEn: "",
  domain: "OBJECT",
  description: "",
  weight: 3,
  keywords: [],
  relatedCodes: [],
  parentCode: "",
  color: "#3B82F6",
  status: "active",
};

export function TagDictionaryManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<TagDomain | "ALL">("ALL");
  const [selectedTag, setSelectedTag] = useState<TagType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<TagFormData>(EMPTY_FORM_DATA);
  const [showHierarchy, setShowHierarchy] = useState(true);

  // 本地标签数据状态（实际项目中应该从API获取并保存）
  const [tagsData, setTagsData] = useState<TagType[]>([...ALL_TAGS]);

  // 删除确认对话框状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<TagType | null>(null);

  // 表单错误状态
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof TagFormData, string>>>({});

  // 维度管理状态
  const [domainConfig, setDomainConfig] = useState<Record<TagDomain, { name: string; nameEn: string; color: string; description: string }>>(
    { ...TAG_DOMAIN_INFO }
  );
  const [domainDialogOpen, setDomainDialogOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<TagDomain | null>(null);
  const [domainFormData, setDomainFormData] = useState({
    name: "",
    nameEn: "",
    color: "#3B82F6",
    description: "",
  });

  // 过滤标签（使用本地状态）
  const filteredTags = useMemo(() => {
    let tags = tagsData;

    if (selectedDomain !== "ALL") {
      tags = tags.filter((t) => t.domain === selectedDomain);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      tags = tags.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.code.toLowerCase().includes(query) ||
          t.keywords.some((k) => k.toLowerCase().includes(query))
      );
    }

    return tags;
  }, [tagsData, selectedDomain, searchQuery]);

  // 统计信息（使用本地状态）
  const stats = useMemo(() => {
    return {
      total: tagsData.length,
      byDomain: {
        OBJECT: tagsData.filter((t) => t.domain === "OBJECT").length,
        SUBJECT: tagsData.filter((t) => t.domain === "SUBJECT").length,
        LIFECYCLE: tagsData.filter((t) => t.domain === "LIFECYCLE").length,
        SECURITY: tagsData.filter((t) => t.domain === "SECURITY").length,
        ACTION: tagsData.filter((t) => t.domain === "ACTION").length,
      },
      active: tagsData.filter((t) => t.status === "active").length,
      deprecated: tagsData.filter((t) => t.status === "deprecated").length,
    };
  }, [tagsData]);

  // 开始编辑
  const handleEdit = useCallback((tag: TagType) => {
    setSelectedTag(tag);
    setFormData({
      code: tag.code,
      name: tag.name,
      nameEn: tag.nameEn,
      domain: tag.domain,
      description: tag.description,
      weight: tag.weight,
      keywords: [...tag.keywords],
      relatedCodes: tag.relatedCodes ? [...tag.relatedCodes] : [],
      parentCode: tag.parentCode || "",
      color: tag.color,
      status: tag.status,
    });
    setIsEditing(true);
    setIsCreating(false);
  }, []);

  // 开始创建
  const handleCreate = useCallback(() => {
    setSelectedTag(null);
    setFormData(EMPTY_FORM_DATA);
    setIsCreating(true);
    setIsEditing(false);
  }, []);

  // 表单验证
  const validateForm = useCallback((): boolean => {
    const errors: Partial<Record<keyof TagFormData, string>> = {};

    if (!formData.code.trim()) {
      errors.code = "标签代码不能为空";
    } else if (!/^[A-Z]{2,}-[A-Z]{2,}$/.test(formData.code)) {
      errors.code = "代码格式应为 XXX-XXX (如: OBJ-PI)";
    } else if (isCreating && tagsData.some((t) => t.code === formData.code)) {
      errors.code = "该代码已存在";
    }

    if (!formData.name.trim()) {
      errors.name = "标签名称不能为空";
    }

    if (!formData.nameEn.trim()) {
      errors.nameEn = "英文名称不能为空";
    }

    if (!formData.description.trim()) {
      errors.description = "描述不能为空";
    }

    if (formData.weight < 1 || formData.weight > 10) {
      errors.weight = "权重应在 1-10 之间";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, isCreating, tagsData]);

  // 保存标签
  const handleSave = useCallback(() => {
    if (!validateForm()) {
      toast.error("请检查表单填写是否正确");
      return;
    }

    const newTag: TagType = {
      id: formData.code.toLowerCase().replace("-", "-"),
      code: formData.code,
      name: formData.name,
      nameEn: formData.nameEn,
      domain: formData.domain,
      description: formData.description,
      weight: formData.weight,
      keywords: formData.keywords,
      relatedCodes: formData.relatedCodes,
      parentCode: formData.parentCode || undefined,
      color: formData.color,
      status: formData.status,
      version: "1.0",
      icon: "tag",
    };

    if (isEditing) {
      // 更新现有标签
      setTagsData((prev) =>
        prev.map((t) => (t.code === formData.code ? newTag : t))
      );
      toast.success(`标签 "${formData.name}" 已更新`);
    } else if (isCreating) {
      // 创建新标签
      setTagsData((prev) => [...prev, newTag]);
      toast.success(`标签 "${formData.name}" 已创建`);
    }

    setIsEditing(false);
    setIsCreating(false);
    setFormErrors({});
  }, [formData, isEditing, isCreating, validateForm]);

  // 打开删除确认对话框
  const openDeleteDialog = useCallback((tag: TagType) => {
    setTagToDelete(tag);
    setDeleteDialogOpen(true);
  }, []);

  // 确认删除标签
  const confirmDelete = useCallback(() => {
    if (!tagToDelete) return;

    setTagsData((prev) => prev.filter((t) => t.code !== tagToDelete.code));
    toast.success(`标签 "${tagToDelete.name}" 已删除`);

    // 如果删除的是当前选中的标签，清空选中
    if (selectedTag?.code === tagToDelete.code) {
      setSelectedTag(null);
    }

    setDeleteDialogOpen(false);
    setTagToDelete(null);
  }, [tagToDelete, selectedTag]);

  // 获取标签层级信息
  const hierarchyInfo = useMemo(() => {
    if (!selectedTag) return null;
    return {
      ancestors: getTagAncestors(selectedTag.code),
      descendants: getTagDescendants(selectedTag.code),
      related: getRelatedTags(selectedTag.code),
    };
  }, [selectedTag]);

  // 渲染标签列表
  const renderTagList = () => (
    <div className="space-y-2">
      {filteredTags.map((tag) => {
        const domainInfo = domainConfig[tag.domain];
        return (
          <div
            key={tag.code}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              selectedTag?.code === tag.code
                ? "bg-blue-50 border-blue-300 shadow-sm"
                : "bg-white border-slate-200 hover:border-blue-200 hover:shadow-sm"
            }`}
            onClick={() => setSelectedTag(tag)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="text-sm font-medium text-slate-800">
                  {tag.name}
                </span>
                <span className="text-xs text-slate-400">{tag.code}</span>
              </div>
              <div className="flex items-center gap-1">
                {tag.status === "deprecated" && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-red-100 text-red-700 border-red-200"
                  >
                    已停用
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(tag);
                  }}
                  className="h-7 w-7 p-0 text-slate-400 hover:text-blue-600"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteDialog(tag);
                  }}
                  className="h-7 w-7 p-0 text-slate-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <span style={{ color: domainInfo.color }}>
                {domainInfo.name}
              </span>
              <span>•</span>
              <span>权重 {tag.weight}</span>
              {tag.parentCode && (
                <>
                  <span>•</span>
                  <span className="text-blue-600">
                    继承自 {TAG_CODE_MAP[tag.parentCode]?.name}
                  </span>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // 渲染标签详情
  const renderTagDetail = () => {
    if (!selectedTag) {
      return (
        <div className="h-full flex items-center justify-center text-slate-400">
          <div className="text-center">
            <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>选择一个标签查看详情</p>
          </div>
        </div>
      );
    }

    const domainInfo = TAG_DOMAIN_INFO[selectedTag.domain];

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: selectedTag.color + "20" }}
                >
                  <span style={{ color: selectedTag.color }}>
                    {DOMAIN_ICONS[selectedTag.domain]}
                  </span>
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-800">
                    {selectedTag.name}
                  </CardTitle>
                  <div className="text-sm text-slate-500">
                    {selectedTag.code} · {domainInfo.name}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(selectedTag)}
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  编辑
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-slate-700">{selectedTag.description}</div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">英文名称:</span>
                <span className="text-slate-700 ml-2">
                  {selectedTag.nameEn}
                </span>
              </div>
              <div>
                <span className="text-slate-500">基础权重:</span>
                <span className="text-blue-600 ml-2 font-medium">
                  {selectedTag.weight}
                </span>
              </div>
              <div>
                <span className="text-slate-500">版本:</span>
                <span className="text-slate-700 ml-2">
                  {selectedTag.version}
                </span>
              </div>
              <div>
                <span className="text-slate-500">状态:</span>
                <Badge
                  variant="outline"
                  className={`ml-2 ${
                    selectedTag.status === "active"
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-red-100 text-red-700 border-red-200"
                  }`}
                >
                  {selectedTag.status === "active" ? "活跃" : "已停用"}
                </Badge>
              </div>
            </div>

            {selectedTag.keywords.length > 0 && (
              <div>
                <span className="text-slate-500 text-sm">AI匹配关键词:</span>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedTag.keywords.map((kw) => (
                    <Badge
                      key={kw}
                      variant="secondary"
                      className="bg-slate-100 text-slate-700"
                    >
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 层级关系 */}
        {showHierarchy && hierarchyInfo && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-blue-500" />
                层级关系
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hierarchyInfo.ancestors.length > 0 && (
                <div>
                  <span className="text-slate-500 text-xs">继承链:</span>
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    {hierarchyInfo.ancestors.map((ancestor, idx) => (
                      <React.Fragment key={ancestor.code}>
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{ borderColor: ancestor.color + "50" }}
                        >
                          {ancestor.name}
                        </Badge>
                        {idx < hierarchyInfo.ancestors.length - 1 && (
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                        )}
                      </React.Fragment>
                    ))}
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                    <Badge
                      className="text-xs"
                      style={{ backgroundColor: selectedTag.color }}
                    >
                      {selectedTag.name}
                    </Badge>
                  </div>
                </div>
              )}

              {hierarchyInfo.descendants.length > 0 && (
                <div>
                  <span className="text-slate-500 text-xs">子标签:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {hierarchyInfo.descendants.map((desc) => (
                      <Badge
                        key={desc.code}
                        variant="outline"
                        className="text-xs"
                        style={{
                          borderColor: desc.color + "50",
                          color: desc.color,
                        }}
                      >
                        {desc.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {hierarchyInfo.related.length > 0 && (
                <div>
                  <span className="text-slate-500 text-xs">关联标签:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {hierarchyInfo.related.map((rel) => (
                      <Badge
                        key={rel.code}
                        variant="outline"
                        className="text-xs"
                        style={{
                          borderColor: rel.color + "50",
                          color: rel.color,
                        }}
                      >
                        {rel.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // 渲染编辑/创建对话框
  const renderFormDialog = () => {
    const isOpen = isEditing || isCreating;
    const title = isCreating ? "创建新标签" : "编辑标签";

    return (
      <Dialog open={isOpen} onOpenChange={() => {
        setIsEditing(false);
        setIsCreating(false);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>标签代码</Label>
                <Input
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="如: OBJ-PI"
                  disabled={isEditing}
                  className={formErrors.code ? "border-red-500" : ""}
                />
                {formErrors.code && (
                  <p className="text-xs text-red-500">{formErrors.code}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>维度</Label>
                <Select
                  value={formData.domain}
                  onValueChange={(v) =>
                    setFormData({ ...formData, domain: v as TagDomain })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(domainConfig) as TagDomain[]).map(
                      (domain) => (
                        <SelectItem
                          key={domain}
                          value={domain}
                        >
                          {domainConfig[domain].name}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>名称</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="中文名称"
                  className={formErrors.name ? "border-red-500" : ""}
                />
                {formErrors.name && (
                  <p className="text-xs text-red-500">{formErrors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>英文名称</Label>
                <Input
                  value={formData.nameEn}
                  onChange={(e) =>
                    setFormData({ ...formData, nameEn: e.target.value })
                  }
                  placeholder="English name"
                  className={formErrors.nameEn ? "border-red-500" : ""}
                />
                {formErrors.nameEn && (
                  <p className="text-xs text-red-500">{formErrors.nameEn}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>描述</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="标签详细描述..."
                className={`min-h-[80px] ${formErrors.description ? "border-red-500" : ""}`}
              />
              {formErrors.description && (
                <p className="text-xs text-red-500">{formErrors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>基础权重 (1-10)</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      weight: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>颜色</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="w-12 h-9 p-1"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>父标签</Label>
              <Select
                value={formData.parentCode || "none"}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    parentCode: v === "none" ? "" : v,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="无父标签" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="none">
                    无父标签
                  </SelectItem>
                  {ALL_TAGS.filter(
                    (t) =>
                      t.domain === formData.domain && t.code !== formData.code
                  ).map((tag) => (
                    <SelectItem
                      key={tag.code}
                      value={tag.code}
                    >
                      {tag.name} ({tag.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                关键词 (用逗号分隔)
              </Label>
              <Input
                value={formData.keywords.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    keywords: e.target.value
                      .split(",")
                      .map((k) => k.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="关键词1, 关键词2, 关键词3"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <Label>标签状态</Label>
                <p className="text-xs text-slate-500">
                  停用后该标签将不再用于新的COU匹配
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm ${
                    formData.status === "active"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formData.status === "active" ? "活跃" : "已停用"}
                </span>
                <Switch
                  checked={formData.status === "active"}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      status: checked ? "active" : "deprecated",
                    })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setIsCreating(false);
              }}
            >
              取消
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              <Save className="w-4 h-4 mr-2" />
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="size-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Tag className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-slate-800">
              标签字典管理
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Badge
              variant="outline"
              className="bg-slate-100 text-slate-700 border-slate-200"
            >
              总计: {stats.total}
            </Badge>
            <Badge
              variant="outline"
              className="bg-green-100 text-green-700 border-green-200"
            >
              活跃: {stats.active}
            </Badge>
            <Badge
              variant="outline"
              className="bg-red-100 text-red-700 border-red-200"
            >
              已停用: {stats.deprecated}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDomainDialogOpen(true)}
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            管理维度
          </Button>
          <Button
            onClick={handleCreate}
            className="bg-gradient-to-r from-blue-600 to-cyan-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            创建标签
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-5 gap-4 px-6 py-4 bg-white/40 border-b border-slate-200/50">
        {(Object.keys(domainConfig) as TagDomain[]).map((domain) => {
          const info = domainConfig[domain];
          return (
            <Card
              key={domain}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedDomain === domain
                  ? "border-blue-300 shadow-md"
                  : "border-slate-200"
              }`}
              onClick={() =>
                setSelectedDomain(selectedDomain === domain ? "ALL" : domain)
              }
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div
                    className="p-1.5 rounded"
                    style={{ backgroundColor: info.color + "20" }}
                  >
                    <span style={{ color: info.color }}>
                      {DOMAIN_ICONS[domain] || <Tag className="w-4 h-4" />}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">{info.name}</div>
                    <div className="text-lg font-semibold text-slate-800">
                      {stats.byDomain[domain]}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧：标签列表 */}
        <div className="w-1/2 flex flex-col border-r border-slate-200/50 bg-white/40 h-full">
          <div className="p-4 border-b border-slate-200/50 bg-white/60">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索标签名称、代码或关键词..."
                className="pl-10"
              />
            </div>
          </div>
          <ScrollArea className="flex-1 p-4 overflow-auto">
            {renderTagList()}
          </ScrollArea>
        </div>

        {/* 右侧：标签详情 */}
        <div className="w-1/2 h-full overflow-auto bg-white/20">
          <ScrollArea className="h-full p-4">
            {renderTagDetail()}
          </ScrollArea>
        </div>
      </div>

      {/* 编辑/创建对话框 */}
      {renderFormDialog()}

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              确认删除标签
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-700">
              您确定要删除标签 <strong>"{tagToDelete?.name}"</strong> (
              {tagToDelete?.code}) 吗？
            </p>
            <p className="text-sm text-slate-500 mt-2">
              此操作不可撤销。如果该标签已被用于COU匹配，删除后可能会影响相关合规义务的准确性。
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 维度管理对话框 */}
      <Dialog open={domainDialogOpen} onOpenChange={setDomainDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              维度配置管理
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-slate-500">
              您可以修改维度的显示名称、颜色和描述。注意：维度代码是系统预定义的，不可修改。
            </p>
            {(Object.keys(domainConfig) as TagDomain[]).map((domain) => {
              const info = domainConfig[domain];
              const icon = DOMAIN_ICONS[domain] || <Tag className="w-4 h-4" />;
              return (
                <Card key={domain} className="p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: info.color + "20" }}
                    >
                      <span style={{ color: info.color }}>{icon}</span>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-800">{info.name}</div>
                          <div className="text-xs text-slate-500">{domain} · {info.nameEn}</div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingDomain(domain);
                            setDomainFormData({
                              name: info.name,
                              nameEn: info.nameEn,
                              color: info.color,
                              description: info.description,
                            });
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {editingDomain === domain ? (
                        <div className="space-y-3 pt-2 border-t border-slate-200">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">显示名称</Label>
                              <Input
                                value={domainFormData.name}
                                onChange={(e) =>
                                  setDomainFormData({ ...domainFormData, name: e.target.value })
                                }
                                className="h-8"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">英文名称</Label>
                              <Input
                                value={domainFormData.nameEn}
                                onChange={(e) =>
                                  setDomainFormData({ ...domainFormData, nameEn: e.target.value })
                                }
                                className="h-8"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">描述</Label>
                            <Input
                              value={domainFormData.description}
                              onChange={(e) =>
                                setDomainFormData({ ...domainFormData, description: e.target.value })
                              }
                              className="h-8"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">颜色</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="color"
                                value={domainFormData.color}
                                onChange={(e) =>
                                  setDomainFormData({ ...domainFormData, color: e.target.value })
                                }
                                className="w-12 h-8 p-1"
                              />
                              <Input
                                value={domainFormData.color}
                                onChange={(e) =>
                                  setDomainFormData({ ...domainFormData, color: e.target.value })
                                }
                                className="h-8 flex-1"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-2">
                            <Button
                              type="button"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDomainConfig((prev) => ({
                                  ...prev,
                                  [domain]: { ...domainFormData },
                                }));
                                setEditingDomain(null);
                                toast.success(`维度 "${domainFormData.name}" 已更新`);
                              }}
                            >
                              <Save className="w-4 h-4 mr-1" />
                              保存
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingDomain(null);
                              }}
                            >
                              <X className="w-4 h-4 mr-1" />
                              取消
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-600">{info.description}</p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDomainDialogOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TagDictionaryManager;
