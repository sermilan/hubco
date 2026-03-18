// ============ 政策批量导入页面 ============
// 支持 Excel/CSV 文件上传、预览、字段映射和批量导入

import React, { useState, useCallback, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  Table,
  FileJson,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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
import { Checkbox } from "../ui/checkbox";
import { ScrollArea } from "../ui/scroll-area";
import { toast } from "sonner";
import type { Policy, PolicyLevel, Industry, Region } from "../../types";

type Step = "upload" | "preview" | "mapping" | "importing" | "result";

interface PolicyImportPageProps {
  onCancel?: () => void;
  onSuccess?: (policies: Policy[]) => void;
}

interface PreviewRow {
  rowNumber: number;
  data: Record<string, string>;
  isValid: boolean;
  errors: string[];
}

interface FieldMapping {
  sourceField: string;
  targetField: string;
}

const TARGET_FIELDS = [
  { key: "title", label: "政策标题", required: true },
  { key: "identifierType", label: "标识类型", required: false },
  { key: "code", label: "标识编号", required: false },
  { key: "level", label: "政策级别", required: true },
  { key: "publishOrg", label: "发布机构", required: true },
  { key: "industries", label: "适用行业", required: false },
  { key: "regions", label: "适用地区", required: false },
  { key: "publishDate", label: "发布日期", required: false },
  { key: "effectiveDate", label: "生效日期", required: false },
  { key: "description", label: "政策描述", required: false },
  { key: "tags", label: "标签", required: false },
] as const;

const POLICY_LEVELS: PolicyLevel[] = [
  "法律",
  "行政法规",
  "部门规章",
  "国家标准",
  "行业标准",
  "地方性法规",
  "指南指引",
];

export function PolicyImportPage({ onCancel, onSuccess }: PolicyImportPageProps) {
  const [currentStep, setCurrentStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<{
    success: number;
    failed: number;
    errors: { row: number; message: string }[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件上传
  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const uploadedFile = event.target.files?.[0];
      if (!uploadedFile) return;

      const validExtensions = [".csv", ".xlsx", ".xls", ".json"];
      const fileExtension = uploadedFile.name
        .slice(uploadedFile.name.lastIndexOf("."))
        .toLowerCase();

      if (!validExtensions.includes(fileExtension)) {
        toast.error("请上传 CSV、Excel 或 JSON 格式的文件");
        return;
      }

      setFile(uploadedFile);

      // 模拟解析文件
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          let parsedData: Record<string, string>[] = [];

          if (fileExtension === ".json") {
            parsedData = JSON.parse(content);
          } else {
            // 模拟 CSV/Excel 解析
            parsedData = parseCSV(content);
          }

          // 生成预览数据
          const preview: PreviewRow[] = parsedData.slice(0, 100).map((row, index) => ({
            rowNumber: index + 1,
            data: row,
            isValid: true,
            errors: [],
          }));

          setPreviewData(preview);

          // 自动字段映射建议
          const headers = Object.keys(parsedData[0] || {});
          const suggestedMapping = headers.map((header) => ({
            sourceField: header,
            targetField: suggestFieldMapping(header),
          }));
          setFieldMapping(suggestedMapping);

          setCurrentStep("preview");
          toast.success(`成功解析 ${parsedData.length} 条数据`);
        } catch (error) {
          toast.error("文件解析失败，请检查文件格式");
        }
      };

      reader.readAsText(uploadedFile);
    },
    []
  );

  // 解析 CSV（简化版）
  const parseCSV = (content: string): Record<string, string>[] => {
    const lines = content.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
    const data: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""));
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });
      data.push(row);
    }

    return data;
  };

  // 智能字段映射建议
  const suggestFieldMapping = (header: string): string => {
    const lower = header.toLowerCase();
    if (lower.includes("标题") || lower.includes("title") || lower.includes("名称")) {
      return "title";
    }
    if (lower.includes("文号") || lower.includes("code") || lower.includes("编号")) {
      return "code";
    }
    if (lower.includes("级别") || lower.includes("level") || lower.includes("类型")) {
      return "level";
    }
    if (lower.includes("机构") || lower.includes("org") || lower.includes("发布")) {
      return "publishOrg";
    }
    if (lower.includes("行业") || lower.includes("industry")) {
      return "industries";
    }
    if (lower.includes("地区") || lower.includes("region") || lower.includes("区域")) {
      return "regions";
    }
    if (lower.includes("发布日期") || lower.includes("publish")) {
      return "publishDate";
    }
    if (lower.includes("生效") || lower.includes("effective")) {
      return "effectiveDate";
    }
    if (lower.includes("描述") || lower.includes("desc") || lower.includes("摘要")) {
      return "description";
    }
    if (lower.includes("标签") || lower.includes("tag")) {
      return "tags";
    }
    return "";
  };

  // 验证数据
  const validateData = useCallback((): boolean => {
    let hasError = false;

    const validated = previewData.map((row) => {
      const errors: string[] = [];

      // 检查必填字段映射
      const requiredTargets = TARGET_FIELDS.filter((f) => f.required).map((f) => f.key);
      const mappedTargets = fieldMapping.map((m) => m.targetField).filter(Boolean);

      requiredTargets.forEach((target) => {
        if (!mappedTargets.includes(target)) {
          errors.push(`缺少必填字段映射: ${target}`);
        }
      });

      // 检查每行数据
      fieldMapping.forEach((mapping) => {
        if (mapping.targetField === "title" && !row.data[mapping.sourceField]?.trim()) {
          errors.push("政策标题不能为空");
        }
        if (mapping.targetField === "code" && !row.data[mapping.sourceField]?.trim()) {
          errors.push("文号不能为空");
        }
        if (mapping.targetField === "level") {
          const value = row.data[mapping.sourceField];
          if (value && !POLICY_LEVELS.includes(value as PolicyLevel)) {
            errors.push(`无效的级别: ${value}，应为: ${POLICY_LEVELS.join(", ")}`);
          }
        }
      });

      if (errors.length > 0) hasError = true;

      return { ...row, isValid: errors.length === 0, errors };
    });

    setPreviewData(validated);
    return !hasError;
  }, [previewData, fieldMapping]);

  // 开始导入
  const handleStartImport = async () => {
    if (!validateData()) {
      toast.error("数据验证失败，请检查错误");
      setCurrentStep("preview");
      return;
    }

    setCurrentStep("importing");

    // 模拟导入进度
    const total = previewData.length;
    let success = 0;
    let failed = 0;
    const errors: { row: number; message: string }[] = [];

    for (let i = 0; i < total; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 模拟 10% 失败率
      if (Math.random() < 0.1) {
        failed++;
        errors.push({ row: i + 1, message: "模拟错误：数据格式不正确" });
      } else {
        success++;
      }

      setImportProgress(Math.round(((i + 1) / total) * 100));
    }

    setImportResult({ success, failed, errors });
    setCurrentStep("result");

    if (failed === 0) {
      toast.success(`成功导入 ${success} 条政策`);
    } else {
      toast.warning(`导入完成：${success} 成功，${failed} 失败`);
    }
  };

  // 下载模板
  const downloadTemplate = () => {
    const headers = TARGET_FIELDS.map((f) => f.label).join(",");

    // 多样化的示例数据，展示不同标识类型
    const samples = [
      // 法律 - 发文字号
      "《数据安全法》,发文字号,主席令第45号,法律,全国人民代表大会常务委员会,通用|互联网,国内,2021-06-10,2021-09-01,规范数据处理活动，保障数据安全...",
      // 标准 - 标准编号
      "《个人信息安全规范》,标准编号,GB/T 35273-2020,国家标准,全国信息安全标准化技术委员会,通用,国内,2020-03-06,2020-10-01,规定了个人信息安全规范...",
      // 公告 - 公告编号
      "《网络安全审查办法》修订,公告编号,2021年第6号公告,部门规章,国家互联网信息办公室,互联网|政务,国内,2021-12-28,2022-02-15,网络安全审查办法修订版...",
      // 通知 - 通知文号
      "《数据出境安全评估申报》,通知文号,网信办发〔2022〕3号,部门规章,国家互联网信息办公室,互联网|金融|医疗,国内,2022-08-31,2022-09-01,数据出境安全评估申报指南...",
      // 无编号 - 白皮书
      "《中国数据安全白皮书》,无编号,,指南指引,中国信息通信研究院,通用,国内,2023-05-20,2023-05-20,全面介绍中国数据安全发展现状...",
      // 其他 - 自定义编号
      "《金融数据安全 数据安全分级指南》,标准编号,JR/T 0197-2020,行业标准,中国人民银行,金融,2020-09-23,2020-09-23,金融行业数据安全分级指南...",
    ];

    // 添加说明行
    const comments = [
      "# 政策导入模板",
      "# 说明：",
      "# - 标识类型可选值：发文字号/标准编号/公告编号/通知文号/其他编号/无编号",
      "# - 多条数据使用 | 分隔（如多个行业：通用|金融|医疗）",
      "# - 无编号的文件，标识类型填「无编号」，标识编号留空",
      "# - 日期格式：YYYY-MM-DD",
      "#",
      "# 政策级别可选值：法律/行政法规/部门规章/国家标准/行业标准/地方性法规/指南指引",
    ].join("\n");

    const csv = `${comments}\n${headers}\n${samples.join("\n")}`;

    // 添加 UTF-8 BOM 头，确保 Excel 正确识别中文编码
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "政策导入模板_多标识类型.csv";
    link.click();

    toast.success("模板下载成功");
  };

  // 渲染步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case "upload":
        return (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-500" />
                上传文件
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 文件上传区域 */}
              <div
                className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDrop={(e) => {
                  e.preventDefault();
                  const droppedFile = e.dataTransfer.files[0];
                  if (droppedFile) {
                    const event = { target: { files: [droppedFile] } } as any;
                    handleFileUpload(event);
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <FileSpreadsheet className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-slate-700 mb-2">
                  点击或拖拽文件到此处上传
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  支持 CSV、Excel (.xlsx, .xls) 或 JSON 格式
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls,.json"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button variant="outline" type="button">
                  选择文件
                </Button>
              </div>

              {/* 模板下载 */}
              <div className="bg-slate-50 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Table className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">导入模板</p>
                    <p className="text-xs text-slate-500">下载标准模板，按格式填写数据</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={downloadTemplate}>
                  <Download className="w-4 h-4 mr-1" />
                  下载模板
                </Button>
              </div>

              {/* 说明 */}
              <div className="space-y-2 text-sm text-slate-600">
                <p className="font-medium">导入说明：</p>
                <ul className="list-disc list-inside space-y-1 text-slate-500">
                  <li>文件首行应为列标题</li>
                  <li>必填字段：政策标题、政策级别、发布机构</li>
                  <li><strong>标识类型</strong>支持：发文字号/标准编号/公告编号/通知文号/其他编号/无编号</li>
                  <li>无编号文件（如白皮书），标识类型填"无编号"，标识编号留空</li>
                  <li>多条数据使用 | 分隔（如多个行业）</li>
                  <li>日期格式：YYYY-MM-DD</li>
                  <li>单次建议不超过 1000 条记录</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        );

      case "preview":
        return (
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Table className="w-5 h-5 text-green-500" />
                数据预览
                <Badge variant="secondary">{previewData.length} 条</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden flex flex-col">
              {/* 字段映射 */}
              <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                <h4 className="text-sm font-medium mb-3">字段映射</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {fieldMapping.map((mapping, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 truncate max-w-[100px]">
                        {mapping.sourceField}
                      </span>
                      <ChevronRight className="w-3 h-3 text-slate-300" />
                      <Select
                        value={mapping.targetField}
                        onValueChange={(value) => {
                          const newMapping = [...fieldMapping];
                          newMapping[index].targetField = value;
                          setFieldMapping(newMapping);
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs w-[120px]">
                          <SelectValue placeholder="选择字段" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">-- 不导入 --</SelectItem>
                          {TARGET_FIELDS.map((field) => (
                            <SelectItem key={field.key} value={field.key}>
                              {field.label}
                              {field.required && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              {/* 数据预览表格 */}
              <ScrollArea className="flex-1 border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-slate-500 w-16">
                        行号
                      </th>
                      {fieldMapping.map((m, i) => (
                        <th key={i} className="px-3 py-2 text-left font-medium text-slate-500">
                          {m.sourceField}
                          {m.targetField && (
                            <Badge variant="outline" className="ml-1 text-xs">
                              {TARGET_FIELDS.find((f) => f.key === m.targetField)?.label}
                            </Badge>
                          )}
                        </th>
                      ))}
                      <th className="px-3 py-2 text-left font-medium text-slate-500 w-20">
                        状态
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {previewData.slice(0, 50).map((row) => (
                      <tr key={row.rowNumber} className={row.isValid ? "" : "bg-red-50"}>
                        <td className="px-3 py-2 text-slate-500">{row.rowNumber}</td>
                        {fieldMapping.map((m, i) => (
                          <td key={i} className="px-3 py-2 truncate max-w-[200px]">
                            {row.data[m.sourceField]}
                          </td>
                        ))}
                        <td className="px-3 py-2">
                          {row.isValid ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <div className="group relative">
                              <AlertCircle className="w-4 h-4 text-red-500 cursor-help" />
                              <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-48 p-2 bg-red-100 text-red-700 text-xs rounded-lg z-10">
                                {row.errors.join("，")}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>

              {previewData.length > 50 && (
                <p className="text-xs text-slate-500 mt-2 text-center">
                  仅显示前 50 条，共 {previewData.length} 条
                </p>
              )}
            </CardContent>
          </Card>
        );

      case "importing":
        return (
          <Card className="h-full flex flex-col items-center justify-center p-12">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-6">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
            <h3 className="text-xl font-medium text-slate-800 mb-2">正在导入...</h3>
            <p className="text-slate-500 mb-6">请勿关闭页面</p>

            {/* 进度条 */}
            <div className="w-full max-w-md">
              <div className="flex justify-between text-sm text-slate-500 mb-2">
                <span>进度</span>
                <span>{importProgress}%</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
            </div>

            <p className="text-sm text-slate-400 mt-4">
              已处理 {Math.round((importProgress / 100) * previewData.length)} /{" "}
              {previewData.length} 条
            </p>
          </Card>
        );

      case "result":
        return (
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                导入完成
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden flex flex-col">
              {/* 统计 */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {importResult?.success}
                  </div>
                  <div className="text-sm text-green-700">导入成功</div>
                </div>
                <div
                  className={`rounded-lg p-4 text-center ${
                    importResult?.failed ? "bg-red-50" : "bg-slate-50"
                  }`}
                >
                  <div
                    className={`text-3xl font-bold ${
                      importResult?.failed ? "text-red-600" : "text-slate-600"
                    }`}
                  >
                    {importResult?.failed}
                  </div>
                  <div
                    className={`text-sm ${
                      importResult?.failed ? "text-red-700" : "text-slate-700"
                    }`}
                  >
                    导入失败
                  </div>
                </div>
              </div>

              {/* 错误列表 */}
              {importResult?.failed && importResult.errors.length > 0 && (
                <div className="flex-1 overflow-hidden flex flex-col">
                  <h4 className="text-sm font-medium mb-2">错误详情</h4>
                  <ScrollArea className="flex-1 border rounded-lg p-3">
                    <div className="space-y-2">
                      {importResult.errors.map((error, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm text-red-600"
                        >
                          <AlertCircle className="w-4 h-4" />
                          <span className="font-medium">第 {error.row} 行:</span>
                          <span>{error.message}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex justify-center gap-3 mt-6">
                <Button variant="outline" onClick={onCancel}>
                  返回列表
                </Button>
                {importResult && importResult.failed > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentStep("preview");
                      validateData();
                    }}
                  >
                    查看错误
                  </Button>
                )}
                <Button
                  onClick={() => {
                    setFile(null);
                    setPreviewData([]);
                    setFieldMapping([]);
                    setImportProgress(0);
                    setImportResult(null);
                    setCurrentStep("upload");
                  }}
                >
                  继续导入
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-slate-800">批量导入政策</h1>
            <p className="text-xs text-slate-500">通过文件批量录入政策数据</p>
          </div>
        </div>
      </div>

      {/* 步骤指示器 */}
      <div className="px-6 py-3 bg-white/50 border-b border-slate-200/50">
        <div className="flex items-center justify-center gap-2">
          {[
            { key: "upload", label: "上传文件" },
            { key: "preview", label: "预览数据" },
            { key: "importing", label: "导入中" },
            { key: "result", label: "完成" },
          ].map((step, idx, arr) => {
            const isActive = currentStep === step.key;
            const isPast =
              arr.findIndex((s) => s.key === currentStep) > idx;

            return (
              <React.Fragment key={step.key}>
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : isPast
                      ? "text-green-600"
                      : "text-slate-400"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      isActive
                        ? "bg-blue-500 text-white"
                        : isPast
                        ? "bg-green-500 text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {isPast ? <CheckCircle className="w-3 h-3" /> : idx + 1}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">
                    {step.label}
                  </span>
                </div>
                {idx < arr.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full max-w-6xl mx-auto">{renderStepContent()}</div>
      </div>

      {/* 底部操作栏 */}
      {currentStep !== "importing" && currentStep !== "result" && (
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex justify-between">
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
          <div className="flex gap-3">
            {currentStep === "preview" && (
              <>
                <Button variant="outline" onClick={() => setCurrentStep("upload")}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  重新上传
                </Button>
                <Button onClick={handleStartImport}>开始导入</Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PolicyImportPage;
