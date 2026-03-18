import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Clause } from "../types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "./ui/sheet";
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
  ChevronLeft,
  Download,
  ExternalLink,
  Hash,
  Scale as ScaleIcon,
} from "lucide-react";

interface ClauseDetailSheetProps {
  clause: Clause | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
}

export function ClauseDetailSheet({
  clause,
  open,
  onOpenChange,
  onToggleFavorite,
  isFavorite = false,
}: ClauseDetailSheetProps) {
  // 可拖拽宽度状态
  const [width, setWidth] = useState(850);
  const [isResizing, setIsResizing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(width);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 处理拖拽开始
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [width]);

  // 处理拖拽中
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const delta = startXRef.current - e.clientX;
      const newWidth = Math.max(400, Math.min(1400, startWidthRef.current + delta));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // 处理触摸事件（移动端支持）
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsResizing(true);
    startXRef.current = e.touches[0].clientX;
    startWidthRef.current = width;
  }, [width]);

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!isResizing) return;
      const delta = startXRef.current - e.touches[0].clientX;
      const newWidth = Math.max(400, Math.min(1400, startWidthRef.current + delta));
      setWidth(newWidth);
    };

    const handleTouchEnd = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isResizing]);

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

  const getComplianceGradient = (type: string) => {
    switch (type) {
      case "禁止性":
        return "from-red-500 to-pink-500";
      case "强制性":
        return "from-orange-500 to-amber-500";
      case "推荐性":
        return "from-blue-500 to-cyan-500";
      case "指导性":
        return "from-green-500 to-emerald-500";
      default:
        return "from-gray-400 to-gray-500";
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="!p-0 !gap-0 overflow-hidden flex flex-col"
        style={{
          width: isClient && window.innerWidth >= 640 ? width : '100%',
          maxWidth: '95vw',
        }}
      >
        {/* 拖拽条 */}
        <div
          className="absolute left-0 top-0 bottom-0 w-4 cursor-col-resize flex items-center justify-center z-50 group"
          onMouseDown={handleResizeStart}
          onTouchStart={handleTouchStart}
        >
          <div className="w-1 h-12 rounded-full bg-slate-300 group-hover:bg-blue-400 transition-colors" />
        </div>

        {/* 头部区域 */}
        <SheetHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className={`size-10 sm:size-12 rounded-xl bg-gradient-to-br ${getComplianceGradient(clause.complianceType)} flex items-center justify-center flex-shrink-0 shadow-lg`}>
              <ScaleIcon className="size-5 sm:size-6 text-white" />
            </div>
            <div className="flex-1 min-w-0 pr-8">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs font-mono">
                  <Hash className="size-3 mr-1" />
                  {clause.article}
                </Badge>
                <Badge className={getComplianceTypeColor(clause.complianceType)}>
                  {clause.complianceType}
                </Badge>
                <Badge className={getWeightColor(clause.weight)}>
                  {getWeightLabel(clause.weight)} {clause.weight}
                </Badge>
              </div>
              <SheetTitle className="text-base sm:text-lg leading-tight text-left">
                {clause.chapter}
              </SheetTitle>
            </div>
          </div>
        </SheetHeader>

        {/* 可滚动内容区域 */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="w-full h-auto flex flex-wrap gap-1 p-1 bg-slate-100">
                <TabsTrigger value="content" className="flex-1 min-w-[60px] text-xs sm:text-sm">
                  条款内容
                </TabsTrigger>
                <TabsTrigger value="source" className="flex-1 min-w-[60px] text-xs sm:text-sm">
                  来源信息
                </TabsTrigger>
                <TabsTrigger value="related" className="flex-1 min-w-[60px] text-xs sm:text-sm">
                  关联COU
                </TabsTrigger>
              </TabsList>

              {/* 条款内容 */}
              <TabsContent value="content" className="space-y-4 sm:space-y-6 mt-3 sm:mt-4">
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
              <TabsContent value="source" className="space-y-4 sm:space-y-6 mt-3 sm:mt-4">
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
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
                    <Shield className="size-4" />
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
              <TabsContent value="related" className="space-y-4 sm:space-y-6 mt-3 sm:mt-4">
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
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* 底部操作栏 */}
        <SheetFooter className="px-4 sm:px-6 py-3 sm:py-4 border-t bg-slate-50 gap-2 flex-row">
          <SheetClose asChild>
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
              <ChevronLeft className="size-3 sm:size-4 mr-1 sm:mr-2" />
              返回列表
            </Button>
          </SheetClose>
          <Button
            variant="outline"
            size="sm"
            className={`text-xs sm:text-sm ${isFavorite ? "text-red-500 border-red-200" : ""}`}
            onClick={onToggleFavorite}
          >
            <Bookmark className={`size-3 sm:size-4 mr-1 sm:mr-2 ${isFavorite ? "fill-current" : ""}`} />
            {isFavorite ? "已收藏" : "收藏"}
          </Button>
          <Button variant="outline" size="sm" className="text-xs sm:text-sm">
            <Download className="size-3 sm:size-4 mr-1 sm:mr-2" />
            导出
          </Button>
          <Button size="sm" className="text-xs sm:text-sm bg-blue-600">
            <ExternalLink className="size-3 sm:size-4 mr-1 sm:mr-2" />
            查看源政策
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
