import { Clause } from "../types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { Card } from "./ui/card";
import {
  FileText,
  BookOpen,
  Scale,
  Tag,
  AlertTriangle,
  Bookmark,
  ArrowRight,
  Shield,
  Target,
  CheckCircle2,
  Link2,
} from "lucide-react";

interface ClauseDetailDialogProps {
  clause: Clause | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
}

export function ClauseDetailDialog({
  clause,
  open,
  onOpenChange,
  onToggleFavorite,
  isFavorite = false,
}: ClauseDetailDialogProps) {
  if (!clause) return null;

  const getComplianceTypeColor = (type: string) => {
    switch (type) {
      case "禁止性":
        return "bg-red-100 text-red-700 border-red-300";
      case "强制性":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "推荐性":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "指导性":
        return "bg-green-100 text-green-700 border-green-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getWeightColor = (weight: number) => {
    if (weight >= 9) return "text-red-600 bg-red-50";
    if (weight >= 7) return "text-orange-600 bg-orange-50";
    if (weight >= 4) return "text-yellow-600 bg-yellow-50";
    return "text-blue-600 bg-blue-50";
  };

  const getWeightLabel = (weight: number) => {
    if (weight >= 9) return "关键";
    if (weight >= 7) return "高";
    if (weight >= 4) return "中";
    return "低";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="size-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg">
              <FileText className="size-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs font-mono">
                  {clause.article}
                </Badge>
                <Badge className={getComplianceTypeColor(clause.complianceType)}>
                  {clause.complianceType}
                </Badge>
                <Badge className={getWeightColor(clause.weight)}>
                  {getWeightLabel(clause.weight)} {clause.weight}
                </Badge>
              </div>
              <DialogTitle className="text-lg leading-tight">
                {clause.chapter}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="content" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">条款内容</TabsTrigger>
            <TabsTrigger value="source">来源信息</TabsTrigger>
            <TabsTrigger value="related">关联COU</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            {/* 条款内容 */}
            <TabsContent value="content" className="space-y-6">
              <Card className="p-4">
                <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                  <FileText className="size-4" />
                  条款原文
                </h4>
                <p className="text-gray-700 leading-relaxed bg-slate-50 p-4 rounded-lg">
                  {clause.content}
                </p>
              </Card>

              {/* 关键词 */}
              {clause.keywords && clause.keywords.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                    <Tag className="size-4" />
                    关键词
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {clause.keywords.map((keyword, idx) => (
                      <Badge key={idx} variant="outline" className="border-dashed">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* 违规处罚 */}
              {clause.penalty && (
                <Card className="p-4 border-red-200 bg-red-50">
                  <h4 className="text-sm font-medium text-red-600 mb-2 flex items-center gap-2">
                    <AlertTriangle className="size-4" />
                    违规处罚
                  </h4>
                  <p className="text-red-700 text-sm">{clause.penalty}</p>
                </Card>
              )}

              {/* 标签 */}
              {clause.tags && clause.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                    <Scale className="size-4" />
                    合规标签
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {clause.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        className={`${tag.color} text-white`}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* 来源信息 */}
            <TabsContent value="source" className="space-y-6">
              <Card className="p-4">
                <h4 className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
                  <BookOpen className="size-4" />
                  所属政策
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">政策名称</span>
                    <span className="font-medium text-right">{clause.policyTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">文号</span>
                    <span className="font-mono text-sm">{clause.policyCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">政策层级</span>
                    <Badge variant="outline">{clause.policyLevel}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">政策版本</span>
                    <span className="text-sm">{clause.policyVersionId}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
                  <Shield className="size-4" />
                  条款信息
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">条款ID</span>
                    <span className="font-mono text-sm">{clause.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">版本</span>
                    <span>{clause.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">状态</span>
                    <Badge variant={clause.status === "current" ? "default" : "secondary"}>
                      {clause.status === "current" ? "现行有效" : clause.status}
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* 权重信息 */}
              <Card className="p-4">
                <h4 className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
                  <Target className="size-4" />
                  权重分析
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">最终权重</span>
                    <span className={`font-bold ${clause.finalWeight >= 9 ? 'text-red-600' : clause.finalWeight >= 7 ? 'text-orange-600' : 'text-blue-600'}`}>
                      {clause.finalWeight}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">基础权重</span>
                    <span>{clause.baseWeight}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">合规类型权重</span>
                    <span>{clause.complianceWeight}</span>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* 关联COU */}
            <TabsContent value="related" className="space-y-6">
              {clause.couIds && clause.couIds.length > 0 ? (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="size-4" />
                    提取的COU ({clause.couIds.length}个)
                  </h4>
                  <div className="space-y-2">
                    {clause.couIds.map((couId) => (
                      <Card key={couId} className="p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm">{couId}</span>
                          <Button variant="ghost" size="sm" className="gap-1">
                            查看
                            <ArrowRight className="size-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <CheckCircle2 className="size-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">暂无关联COU</p>
                </Card>
              )}

              {clause.relatedClauses && clause.relatedClauses.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                    <Link2 className="size-4" />
                    关联条款
                  </h4>
                  <div className="space-y-2">
                    {clause.relatedClauses.map((relatedId) => (
                      <Button
                        key={relatedId}
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <span>{relatedId}</span>
                        <ArrowRight className="size-4" />
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onToggleFavorite}
            className={isFavorite ? "text-red-500 border-red-200" : ""}
          >
            <Bookmark
              className={`size-4 mr-2 ${isFavorite ? "fill-current" : ""}`}
            />
            {isFavorite ? "已收藏" : "收藏"}
          </Button>
          <Button variant="outline">复制条款</Button>
          <Button className="bg-blue-600">查看源政策</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
