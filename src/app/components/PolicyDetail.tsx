import { Policy, Clause } from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { ClauseCard } from "./ClauseCard";
import { Card } from "./ui/card";
import {
  Calendar,
  Building2,
  FileText,
  Globe,
  Tag,
  Download,
  Bookmark,
  X,
  ExternalLink,
  Scale,
  Hash,
} from "lucide-react";

interface PolicyDetailProps {
  policy: Policy | null;
  clauses: Clause[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddClauseToScenario?: (clause: Clause) => void;
}

export function PolicyDetail({
  policy,
  clauses,
  open,
  onOpenChange,
  onAddClauseToScenario,
}: PolicyDetailProps) {
  if (!policy) return null;

  const policyClauses = clauses.filter((c) => c.policyId === policy.id);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "法律":
        return "bg-red-100 text-red-700 border-red-300";
      case "行政法规":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "部门规章":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "国家标准":
        return "bg-green-100 text-green-700 border-green-300";
      case "行业标准":
        return "bg-purple-100 text-purple-700 border-purple-300";
      case "地方性法规":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getLevelGradient = (level: string) => {
    switch (level) {
      case "法律":
        return "from-red-500 to-red-600";
      case "行政法规":
        return "from-orange-500 to-orange-600";
      case "部门规章":
        return "from-blue-500 to-blue-600";
      case "国家标准":
        return "from-green-500 to-green-600";
      case "行业标准":
        return "from-purple-500 to-purple-600";
      case "地方性法规":
        return "from-yellow-500 to-yellow-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[95vw] !max-w-5xl !h-[90vh] !p-0 !gap-0 overflow-hidden flex flex-col !rounded-lg">
        {/* 头部区域 */}
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className={`size-10 sm:size-12 rounded-xl bg-gradient-to-br ${getLevelGradient(policy.level)} flex items-center justify-center flex-shrink-0 shadow-lg`}>
              <Scale className="size-5 sm:size-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge className={getLevelColor(policy.level)} variant="outline">
                  {policy.level}
                </Badge>
                <Badge variant="outline" className="font-mono text-xs">
                  <Hash className="size-3 mr-1" />
                  {policy.code}
                </Badge>
              </div>
              <DialogTitle className="text-base sm:text-lg leading-tight pr-8">
                {policy.title}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        {/* 可滚动内容区域 */}
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* 标签区域 */}
            {policy.tags && policy.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {policy.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    className={`${tag.color} text-white text-xs`}
                  >
                    <Tag className="size-3 mr-1" />
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* 政策元信息卡片 */}
            <Card className="p-3 sm:p-4 bg-slate-50/50 border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="size-4 text-blue-500 flex-shrink-0" />
                  <span className="text-gray-500 flex-shrink-0">发布机构：</span>
                  <span className="truncate">{policy.publishOrg}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="size-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-500 flex-shrink-0">生效日期：</span>
                  <span>{policy.currentVersion?.effectiveDate || policy.effectiveDate || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="size-4 text-purple-500 flex-shrink-0" />
                  <span className="text-gray-500 flex-shrink-0">条款数量：</span>
                  <span>{policy.clauseCount} 条</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="size-4 text-cyan-500 flex-shrink-0" />
                  <span className="text-gray-500 flex-shrink-0">适用区域：</span>
                  <span>{policy.regions?.join('、') || '国内'}</span>
                </div>
              </div>

              {/* 适用行业 */}
              <div className="mt-3 pt-3 border-t border-slate-200">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-500">适用行业：</span>
                  {policy.industries.map((industry) => (
                    <span
                      key={industry}
                      className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded-md text-xs"
                    >
                      {industry}
                    </span>
                  ))}
                </div>
              </div>
            </Card>

            {/* 描述区域 */}
            {policy.description && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="size-4 text-gray-400" />
                  政策概述
                </h4>
                <div className="p-3 sm:p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    {policy.description}
                  </p>
                </div>
              </div>
            )}

            {/* 条款列表 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Scale className="size-4 text-gray-400" />
                相关条款
              </h4>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="w-full h-auto flex flex-wrap gap-1 p-1 bg-slate-100">
                  <TabsTrigger value="all" className="flex-1 min-w-[80px] text-xs sm:text-sm">
                    全部 ({policyClauses.length})
                  </TabsTrigger>
                  <TabsTrigger value="high" className="flex-1 min-w-[80px] text-xs sm:text-sm">
                    关键 ({policyClauses.filter((c) => c.weight >= 9).length})
                  </TabsTrigger>
                  <TabsTrigger value="medium" className="flex-1 min-w-[80px] text-xs sm:text-sm">
                    高权重 ({policyClauses.filter((c) => c.weight >= 7 && c.weight < 9).length})
                  </TabsTrigger>
                  <TabsTrigger value="low" className="flex-1 min-w-[80px] text-xs sm:text-sm">
                    其他 ({policyClauses.filter((c) => c.weight < 7).length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
                  {policyClauses.length > 0 ? (
                    policyClauses.map((clause) => (
                      <ClauseCard
                        key={clause.id}
                        clause={clause}
                        onAddToScenario={
                          onAddClauseToScenario
                            ? () => onAddClauseToScenario(clause)
                            : undefined
                        }
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <FileText className="size-12 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">暂无相关条款</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="high" className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
                  {policyClauses.filter((c) => c.weight >= 9).length > 0 ? (
                    policyClauses
                      .filter((c) => c.weight >= 9)
                      .map((clause) => (
                        <ClauseCard
                          key={clause.id}
                          clause={clause}
                          onAddToScenario={
                            onAddClauseToScenario
                              ? () => onAddClauseToScenario(clause)
                              : undefined
                          }
                        />
                      ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <p className="text-sm">暂无关键权重条款</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="medium" className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
                  {policyClauses.filter((c) => c.weight >= 7 && c.weight < 9).length > 0 ? (
                    policyClauses
                      .filter((c) => c.weight >= 7 && c.weight < 9)
                      .map((clause) => (
                        <ClauseCard
                          key={clause.id}
                          clause={clause}
                          onAddToScenario={
                            onAddClauseToScenario
                              ? () => onAddClauseToScenario(clause)
                              : undefined
                          }
                        />
                      ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <p className="text-sm">暂无高权重条款</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="low" className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
                  {policyClauses.filter((c) => c.weight < 7).length > 0 ? (
                    policyClauses
                      .filter((c) => c.weight < 7)
                      .map((clause) => (
                        <ClauseCard
                          key={clause.id}
                          clause={clause}
                          onAddToScenario={
                            onAddClauseToScenario
                              ? () => onAddClauseToScenario(clause)
                              : undefined
                          }
                        />
                      ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <p className="text-sm">暂无其他条款</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </ScrollArea>

        {/* 底部操作栏 */}
        <DialogFooter className="px-4 sm:px-6 py-3 sm:py-4 border-t bg-slate-50 gap-2">
          <Button variant="outline" size="sm" className="text-xs sm:text-sm">
            <Bookmark className="size-3 sm:size-4 mr-1 sm:mr-2" />
            收藏
          </Button>
          <Button variant="outline" size="sm" className="text-xs sm:text-sm">
            <Download className="size-3 sm:size-4 mr-1 sm:mr-2" />
            下载
          </Button>
          <Button variant="outline" size="sm" className="text-xs sm:text-sm">
            <ExternalLink className="size-3 sm:size-4 mr-1 sm:mr-2" />
            原文链接
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}