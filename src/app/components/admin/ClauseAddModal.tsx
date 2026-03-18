// ============ 添加条款模态框 ============
// 支持单条添加、批量从全文提取、AI智能识别

import React, { useState, useCallback } from "react";
import {
  Plus,
  X,
  FileText,
  Sparkles,
  Wand2,
  ChevronRight,
  ChevronLeft,
  Save,
  Trash2,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Hash,
  AlignLeft,
  Scale,
  Edit3,
  Layers,
  Zap,
  Check,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Sheet,
  SheetContent,
} from "../ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner";
import type { Clause } from "../../types";

interface ClauseAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  policyId: string;
  policyTitle: string;
  onAddClauses: (clauses: Omit<Clause, "id">[]) => void;
  existingClauses?: Clause[];
}

// 提取的条款预览
type ExtractedClause = {
  number: string;
  chapter: string;
  title: string;
  content: string;
  weight: number;
  selected: boolean;
};

export function ClauseAddModal({
  isOpen,
  onClose,
  policyId,
  policyTitle,
  onAddClauses,
  existingClauses = [],
}: ClauseAddModalProps) {
  const [activeTab, setActiveTab] = useState<"single" | "batch" | "smart">("single");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedClauses, setExtractedClauses] = useState<ExtractedClause[]>([]);

  // 单条添加表单
  const [singleForm, setSingleForm] = useState({
    chapter: "第一章",
    number: "第一条",
    title: "",
    content: "",
    weight: 5,
  });

  // 批量添加 - 全文输入
  const [fullText, setFullText] = useState("");

  // 智能解析结果
  const [smartText, setSmartText] = useState("");
  const [parsedClauses, setParsedClauses] = useState<ExtractedClause[]>([]);

  // 重置表单
  const resetForm = () => {
    setSingleForm({
      chapter: "第一章",
      number: "第一条",
      title: "",
      content: "",
      weight: 5,
    });
    setFullText("");
    setSmartText("");
    setExtractedClauses([]);
    setParsedClauses([]);
  };

  // 处理关闭
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // 单条添加提交
  const handleSingleSubmit = () => {
    if (!singleForm.content.trim()) {
      toast.error("请输入条款内容");
      return;
    }

    const newClause: Omit<Clause, "id"> = {
      policyId,
      policyTitle,
      policyCode: "",
      policyLevel: "部门规章",
      chapter: singleForm.chapter,
      number: singleForm.number,
      title: singleForm.title || `${singleForm.number}`,
      content: singleForm.content,
      weight: singleForm.weight,
      baseWeight: singleForm.weight,
      penaltyWeight: 1,
      tagScore: 1,
      finalWeight: singleForm.weight,
      importanceLevel: singleForm.weight >= 7 ? "critical" : singleForm.weight >= 5 ? "high" : "medium",
      complianceType: "必须遵守",
      obligationType: "强制性",
      penaltyLevel: "无",
      applicableScopes: [],
      tags: [],
      mappedControlObjectiveIds: [],
      mappingStatus: "unmapped",
    };

    onAddClauses([newClause]);
    toast.success("条款添加成功");
    handleClose();
  };

  // 从全文提取条款（简单规则）
  const handleExtractFromText = () => {
    if (!fullText.trim()) {
      toast.error("请输入政策全文");
      return;
    }

    setIsExtracting(true);

    // 模拟提取过程
    setTimeout(() => {
      const extracted: ExtractedClause[] = [];

      // 简单的条款提取规则
      // 匹配 "第X条" 或 "第一条" 等格式
      const clauseRegex = /第[一二三四五六七八九十百千\d]+条[、.:\s]*([^\n]*)([\s\S]*?)(?=第[一二三四五六七八九十百千\d]+条|$)/g;

      let match;
      let index = 0;
      const text = fullText + "第9999条"; // 添加结束标记

      while ((match = clauseRegex.exec(text)) !== null && index < 50) {
        const number = match[0].match(/第[一二三四五六七八九十百千\d]+条/)?.[0] || `第${index + 1}条`;
        const title = match[1]?.trim() || "";
        const content = match[2]?.trim() || "";

        if (content.length > 10) {
          extracted.push({
            number,
            chapter: "未分类",
            title: title.slice(0, 50),
            content: content.slice(0, 500),
            weight: 5,
            selected: true,
          });
          index++;
        }
      }

      // 如果没匹配到，尝试按段落分割
      if (extracted.length === 0) {
        const paragraphs = fullText.split(/\n\s*\n/).filter(p => p.trim().length > 20);
        paragraphs.slice(0, 20).forEach((p, i) => {
          extracted.push({
            number: `第${i + 1}条`,
            chapter: "未分类",
            title: "",
            content: p.trim().slice(0, 500),
            weight: 5,
            selected: true,
          });
        });
      }

      setExtractedClauses(extracted);
      setIsExtracting(false);

      if (extracted.length > 0) {
        toast.success(`成功提取 ${extracted.length} 条条款`);
      } else {
        toast.warning("未识别到条款格式，请检查文本");
      }
    }, 800);
  };

  // AI智能解析
  const handleSmartParse = () => {
    if (!smartText.trim()) {
      toast.error("请粘贴政策文本");
      return;
    }

    setIsExtracting(true);

    // 模拟AI解析
    setTimeout(() => {
      const parsed: ExtractedClause[] = [];

      // 识别章节
      const chapterRegex = /第[一二三四五六七八九十]+章[\s:：]*([^\n]+)/g;
      const chapters: { name: string; startIndex: number }[] = [];
      let chapterMatch;

      while ((chapterMatch = chapterRegex.exec(smartText)) !== null) {
        chapters.push({
          name: `第${chapterMatch[0].match(/[一二三四五六七八九十]+/)?.[0]}章`,
          startIndex: chapterMatch.index,
        });
      }

      // 识别条款
      const lines = smartText.split("\n");
      let currentChapter = "第一章";
      let currentClause: ExtractedClause | null = null;

      lines.forEach((line) => {
        const trimmed = line.trim();

        // 检测章节
        const chapterMatch = trimmed.match(/第[一二三四五六七八九十]+章/);
        if (chapterMatch && trimmed.length < 50) {
          currentChapter = chapterMatch[0];
        }

        // 检测条款
        const clauseMatch = trimmed.match(/第[一二三四五六七八九十百千\d]+条[、.:\s]*/);
        if (clauseMatch) {
          if (currentClause) {
            parsed.push({ ...currentClause, chapter: currentChapter });
          }

          const number = clauseMatch[0].replace(/[、.:\s]*$/, "");
          const rest = trimmed.slice(clauseMatch[0].length).trim();

          currentClause = {
            number,
            chapter: currentChapter,
            title: rest.slice(0, 30),
            content: rest,
            weight: 5,
            selected: true,
          };
        } else if (currentClause && trimmed) {
          currentClause.content += "\n" + trimmed;
        }
      });

      if (currentClause) {
        parsed.push(currentClause);
      }

      setParsedClauses(parsed);
      setIsExtracting(false);

      if (parsed.length > 0) {
        toast.success(`智能解析完成，识别 ${parsed.length} 条条款`);
      } else {
        toast.warning("未识别到条款，请尝试手动添加");
      }
    }, 1200);
  };

  // 批量添加选中的条款
  const handleBatchAdd = (clauses: ExtractedClause[]) => {
    const selected = clauses.filter(c => c.selected);

    if (selected.length === 0) {
      toast.error("请至少选择一条条款");
      return;
    }

    const newClauses: Omit<Clause, "id">[] = selected.map((c, index) => ({
      policyId,
      policyTitle,
      policyCode: "",
      policyLevel: "部门规章",
      chapter: c.chapter,
      number: c.number || `第${index + 1}条`,
      title: c.title || c.number,
      content: c.content,
      weight: c.weight,
      baseWeight: c.weight,
      penaltyWeight: 1,
      tagScore: 1,
      finalWeight: c.weight,
      importanceLevel: c.weight >= 7 ? "critical" : c.weight >= 5 ? "high" : "medium",
      complianceType: "必须遵守",
      obligationType: "强制性",
      penaltyLevel: "无",
      applicableScopes: [],
      tags: [],
      mappedControlObjectiveIds: [],
      mappingStatus: "unmapped",
    }));

    onAddClauses(newClauses);
    toast.success(`成功添加 ${newClauses.length} 条条款`);
    handleClose();
  };

  // 更新提取的条款
  const updateExtractedClause = (index: number, updates: Partial<ExtractedClause>) => {
    setExtractedClauses(prev => prev.map((c, i) => i === index ? { ...c, ...updates } : c));
  };

  const updateParsedClause = (index: number, updates: Partial<ExtractedClause>) => {
    setParsedClauses(prev => prev.map((c, i) => i === index ? { ...c, ...updates } : c));
  };

  // 全选/取消全选
  const toggleSelectAll = (clauses: ExtractedClause[], setClauses: React.Dispatch<React.SetStateAction<ExtractedClause[]>>) => {
    const allSelected = clauses.every(c => c.selected);
    setClauses(prev => prev.map(c => ({ ...c, selected: !allSelected })));
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-4xl p-0 overflow-hidden">
        <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
          {/* 顶部 - 与 PolicyCreateFlexible 风格一致 */}
          <div className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-slate-800">添加条款</h1>
                <p className="text-xs text-slate-500">{policyTitle}</p>
              </div>
            </div>

            {/* 模式切换 - 简洁风格 */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-auto">
              <TabsList className="grid w-[280px] grid-cols-3">
                <TabsTrigger value="single" className="text-xs">
                  <Edit3 className="w-3 h-3 mr-1" />
                  单条
                </TabsTrigger>
                <TabsTrigger value="batch" className="text-xs">
                  <Layers className="w-3 h-3 mr-1" />
                  批量
                </TabsTrigger>
                <TabsTrigger value="smart" className="text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  智能
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* 主内容 */}
          <div className="flex-1 overflow-hidden">
            {/* 单条添加 */}
            {activeTab === "single" && (
              <div className="h-full overflow-auto p-6">
                <div className="max-w-3xl mx-auto">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Edit3 className="w-5 h-5 text-blue-500" />
                        条款信息
                        <Badge variant="secondary" className="text-xs font-normal">手动录入</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* 章节和编号 */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>章节</Label>
                          <Input
                            value={singleForm.chapter}
                            onChange={(e) => setSingleForm({ ...singleForm, chapter: e.target.value })}
                            placeholder="如：第一章"
                          />
                          <div className="flex flex-wrap gap-2">
                            {["第一章", "第二章", "第三章", "第四章", "第五章"].map((ch) => (
                              <Badge
                                key={ch}
                                variant={singleForm.chapter === ch ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => setSingleForm({ ...singleForm, chapter: ch })}
                              >
                                {ch}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>条款编号</Label>
                          <Input
                            value={singleForm.number}
                            onChange={(e) => setSingleForm({ ...singleForm, number: e.target.value })}
                            placeholder="如：第一条"
                          />
                          <div className="flex flex-wrap gap-2">
                            {["第一条", "第二条", "第三条", "第四条", "第五条"].map((num) => (
                              <Badge
                                key={num}
                                variant={singleForm.number === num ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => setSingleForm({ ...singleForm, number: num })}
                              >
                                {num}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* 条款标题 */}
                      <div className="space-y-2">
                        <Label>
                          条款标题 <span className="text-slate-400">（可选）</span>
                        </Label>
                        <Input
                          value={singleForm.title}
                          onChange={(e) => setSingleForm({ ...singleForm, title: e.target.value })}
                          placeholder="条款简短标题"
                        />
                      </div>

                      {/* 条款内容 */}
                      <div className="space-y-2">
                        <Label>
                          条款内容 <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          value={singleForm.content}
                          onChange={(e) => setSingleForm({ ...singleForm, content: e.target.value })}
                          placeholder="请输入条款完整内容..."
                          rows={6}
                        />
                      </div>

                      {/* 权重 */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            <Scale className="w-4 h-4 text-amber-500" />
                            重要性权重
                          </Label>
                          <Badge variant={singleForm.weight >= 7 ? "destructive" : singleForm.weight >= 5 ? "default" : "secondary"}>
                            {singleForm.weight} 分
                          </Badge>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={10}
                          value={singleForm.weight}
                          onChange={(e) => setSingleForm({ ...singleForm, weight: parseInt(e.target.value) })}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>次要 (1)</span>
                          <span>普通 (5)</span>
                          <span>核心 (10)</span>
                        </div>
                      </div>

                      {/* 底部按钮 */}
                      <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={handleClose}>
                          取消
                        </Button>
                        <Button onClick={handleSingleSubmit} className="bg-gradient-to-r from-blue-600 to-cyan-600">
                          <Plus className="w-4 h-4 mr-1" />
                          添加条款
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* 批量提取 */}
            {activeTab === "batch" && (
              <div className="h-full flex flex-col">
                {extractedClauses.length === 0 ? (
                  <div className="flex-1 overflow-auto p-6">
                    <div className="max-w-3xl mx-auto space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Layers className="w-5 h-5 text-cyan-500" />
                            批量提取
                            <Badge variant="secondary" className="text-xs font-normal">从全文自动识别</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="space-y-2">
                            <Label>粘贴政策全文</Label>
                            <Textarea
                              value={fullText}
                              onChange={(e) => setFullText(e.target.value)}
                              placeholder={`请粘贴包含条款的政策全文，系统将自动识别：\n\n示例格式：\n第一条 为了规范数据处理活动，保障数据安全，促进数据开发利用，保护个人、组织的合法权益，维护国家主权、安全和发展利益，制定本法。\n\n第二条 在中华人民共和国境内开展数据处理活动及其安全监管，适用本法。\n\n第三条 本法所称数据，是指任何以电子或者其他方式对信息的记录。...`}
                              rows={12}
                              className="font-mono text-sm"
                            />
                          </div>

                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                            <p className="flex items-center gap-2 font-medium mb-2">
                              <AlertCircle className="w-4 h-4" />
                              提取规则
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-blue-600">
                              <li>自动识别 "第X条" 格式</li>
                              <li>按段落分割长文本</li>
                              <li>提取前50条，超长文本建议分批处理</li>
                            </ul>
                          </div>

                          <div className="flex justify-end">
                            <Button
                              onClick={handleExtractFromText}
                              disabled={isExtracting || !fullText.trim()}
                              className="bg-gradient-to-r from-blue-600 to-cyan-600"
                            >
                              {isExtracting ? (
                                <>
                                  <Sparkles className="w-4 h-4 mr-1 animate-spin" />
                                  提取中...
                                </>
                              ) : (
                                <>
                                  <Layers className="w-4 h-4 mr-1" />
                                  提取条款
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col">
                    {/* 顶部工具栏 */}
                    <div className="px-6 py-3 bg-white/50 border-b border-slate-200/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="font-medium">已提取 {extractedClauses.length} 条条款</span>
                        <Badge variant="secondary">
                          {extractedClauses.filter(c => c.selected).length} 条已选中
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleSelectAll(extractedClauses, setExtractedClauses)}
                        >
                          全选
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setExtractedClauses([])}
                        >
                          重新提取
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleBatchAdd(extractedClauses)}
                          className="bg-gradient-to-r from-blue-600 to-cyan-600"
                        >
                          添加选中 ({extractedClauses.filter(c => c.selected).length})
                        </Button>
                      </div>
                    </div>

                    {/* 条款列表 */}
                    <ScrollArea className="flex-1 p-6">
                      <div className="max-w-3xl mx-auto space-y-3">
                        {extractedClauses.map((clause, index) => (
                          <Card key={index} className={clause.selected ? "border-blue-300" : "opacity-60"}>
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  checked={clause.selected}
                                  onCheckedChange={(checked) =>
                                    updateExtractedClause(index, { selected: checked as boolean })
                                  }
                                />
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Input
                                      value={clause.number}
                                      onChange={(e) => updateExtractedClause(index, { number: e.target.value })}
                                      className="w-24 h-8 text-sm"
                                    />
                                    <Input
                                      value={clause.title}
                                      onChange={(e) => updateExtractedClause(index, { title: e.target.value })}
                                      placeholder="条款标题"
                                      className="flex-1 h-8 text-sm"
                                    />
                                    <Input
                                      value={clause.chapter}
                                      onChange={(e) => updateExtractedClause(index, { chapter: e.target.value })}
                                      className="w-24 h-8 text-sm"
                                    />
                                  </div>
                                  <Textarea
                                    value={clause.content}
                                    onChange={(e) => updateExtractedClause(index, { content: e.target.value })}
                                    rows={2}
                                    className="text-sm resize-none"
                                  />
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setExtractedClauses(prev => prev.filter((_, i) => i !== index))}
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            )}

            {/* 智能解析 */}
            {activeTab === "smart" && (
              <div className="h-full flex flex-col">
                {parsedClauses.length === 0 ? (
                  <div className="flex-1 overflow-auto p-6">
                    <div className="max-w-3xl mx-auto space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Zap className="w-5 h-5 text-purple-500" />
                            智能解析
                            <Badge variant="secondary" className="text-xs font-normal">AI 识别章节结构</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="space-y-2">
                            <Label>粘贴政策文本 <span className="text-slate-400">（支持任意格式）</span></Label>
                            <Textarea
                              value={smartText}
                              onChange={(e) => setSmartText(e.target.value)}
                              placeholder={`粘贴任意格式的政策文本，AI将智能识别：\n\n• 章节结构（第一章、第二章...）\n• 条款编号（第一条、第X条...）\n• 条款内容\n\n支持：法律、法规、标准、通知等各种格式`}
                              rows={12}
                              className="font-mono text-sm"
                            />
                          </div>

                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm text-purple-700">
                            <p className="flex items-center gap-2 font-medium mb-2">
                              <Wand2 className="w-4 h-4" />
                              AI 智能解析
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-purple-600">
                              <li>自动识别章节和条款层级</li>
                              <li>支持中文数字（一二三四）和阿拉伯数字</li>
                              <li>智能合并多行条款内容</li>
                            </ul>
                          </div>

                          <div className="flex justify-end">
                            <Button
                              onClick={handleSmartParse}
                              disabled={isExtracting || !smartText.trim()}
                              className="bg-gradient-to-r from-purple-600 to-pink-600"
                            >
                              {isExtracting ? (
                                <>
                                  <Sparkles className="w-4 h-4 mr-1 animate-spin" />
                                  解析中...
                                </>
                              ) : (
                                <>
                                  <Zap className="w-4 h-4 mr-1" />
                                  智能解析
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col">
                    {/* 顶部工具栏 */}
                    <div className="px-6 py-3 bg-white/50 border-b border-slate-200/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="font-medium">解析完成，识别 {parsedClauses.length} 条条款</span>
                        <Badge variant="secondary">
                          {parsedClauses.filter(c => c.selected).length} 条已选中
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleSelectAll(parsedClauses, setParsedClauses)}
                        >
                          全选
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setParsedClauses([])}
                        >
                          重新解析
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleBatchAdd(parsedClauses)}
                          className="bg-gradient-to-r from-purple-600 to-pink-600"
                        >
                          添加选中 ({parsedClauses.filter(c => c.selected).length})
                        </Button>
                      </div>
                    </div>

                    {/* 条款列表 */}
                    <ScrollArea className="flex-1 p-6">
                      <div className="max-w-3xl mx-auto space-y-3">
                        {parsedClauses.map((clause, index) => (
                          <Card key={index} className={clause.selected ? "border-purple-300" : "opacity-60"}>
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  checked={clause.selected}
                                  onCheckedChange={(checked) =>
                                    updateParsedClause(index, { selected: checked as boolean })
                                  }
                                />
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">{clause.chapter}</Badge>
                                    <Input
                                      value={clause.number}
                                      onChange={(e) => updateParsedClause(index, { number: e.target.value })}
                                      className="w-24 h-8 text-sm"
                                    />
                                    <Input
                                      value={clause.title}
                                      onChange={(e) => updateParsedClause(index, { title: e.target.value })}
                                      placeholder="条款标题"
                                      className="flex-1 h-8 text-sm"
                                    />
                                  </div>
                                  <Textarea
                                    value={clause.content}
                                    onChange={(e) => updateParsedClause(index, { content: e.target.value })}
                                    rows={3}
                                    className="text-sm resize-none"
                                  />
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setParsedClauses(prev => prev.filter((_, i) => i !== index))}
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default ClauseAddModal;
