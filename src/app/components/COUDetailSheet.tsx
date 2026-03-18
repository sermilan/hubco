import { useState, useCallback, useEffect, useRef } from "react";
import { COU } from "../types";
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
  Target,
  Shield,
  Building2,
  Globe,
  Users,
  Clock,
  AlertTriangle,
  Bookmark,
  Download,
  Plus,
  ArrowRight,
  CheckCircle2,
  FileText,
  Tag,
  ChevronLeft,
  Hash,
  TrendingUp,
  Calendar,
} from "lucide-react";

interface COUDetailSheetProps {
  cou: COU | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
  onAddToScene?: (cou: COU) => void;
}

export function COUDetailSheet({
  cou,
  open,
  onOpenChange,
  onToggleFavorite,
  isFavorite = false,
  onAddToScene,
}: COUDetailSheetProps) {
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

  if (!cou) return null;

  const getPriorityColor = (weight: number) => {
    if (weight >= 9) return "from-red-500 to-pink-500";
    if (weight >= 7) return "from-orange-500 to-amber-500";
    if (weight >= 5) return "from-blue-500 to-cyan-500";
    return "from-gray-400 to-gray-500";
  };

  const getPriorityLabel = (weight: number) => {
    if (weight >= 9) return "关键";
    if (weight >= 7) return "高";
    if (weight >= 5) return "中";
    return "低";
  };

  const getObligationColor = (type: string) => {
    switch (type) {
      case "禁止性":
        return "bg-red-100 text-red-700 border-red-300";
      case "强制性":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "推荐性":
        return "bg-blue-100 text-blue-700 border-blue-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getWeightProgressColor = (weight: number) => {
    if (weight >= 9) return "bg-red-500";
    if (weight >= 7) return "bg-orange-500";
    if (weight >= 5) return "bg-yellow-500";
    return "bg-blue-500";
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
            <div className={`size-10 sm:size-12 rounded-xl bg-gradient-to-br ${getPriorityColor(cou.finalWeight)} flex items-center justify-center flex-shrink-0 shadow-lg`}>
              <Target className="size-5 sm:size-6 text-white" />
            </div>
            <div className="flex-1 min-w-0 pr-8">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs font-mono">
                  <Hash className="size-3 mr-1" />
                  {cou.code}
                </Badge>
                <Badge className={getObligationColor(cou.obligationType)}>
                  {cou.obligationType}
                </Badge>
                <Badge className={`bg-gradient-to-r ${getPriorityColor(cou.finalWeight)} text-white`}>
                  {getPriorityLabel(cou.finalWeight)} {cou.finalWeight}
                </Badge>
              </div>
              <SheetTitle className="text-base sm:text-lg leading-tight text-left">
                {cou.title}
              </SheetTitle>
            </div>
          </div>
        </SheetHeader>

        {/* 可滚动内容区域 */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full h-auto flex flex-wrap gap-1 p-1 bg-slate-100">
                <TabsTrigger value="overview" className="flex-1 min-w-[60px] text-xs sm:text-sm">
                  概览
                </TabsTrigger>
                <TabsTrigger value="measures" className="flex-1 min-w-[60px] text-xs sm:text-sm">
                  措施要求
                </TabsTrigger>
                <TabsTrigger value="scope" className="flex-1 min-w-[60px] text-xs sm:text-sm">
                  适用范围
                </TabsTrigger>
                <TabsTrigger value="source" className="flex-1 min-w-[60px] text-xs sm:text-sm">
                  来源条款
                </TabsTrigger>
              </TabsList>

              {/* 概览 */}
              <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-3 sm:mt-4">
                {/* 描述 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                    <FileText className="size-4" />
                    合规义务描述
                  </h4>
                  <p className="text-gray-700 leading-relaxed bg-slate-50 p-4 rounded-lg">
                    {cou.description}
                  </p>
                </div>

                {/* 权重可视化 */}
                <Card className="p-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
                    <TrendingUp className="size-4" />
                    权重分析
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">最终权重</span>
                        <span className={`text-2xl font-bold ${
                          cou.finalWeight >= 9
                            ? "text-red-600"
                            : cou.finalWeight >= 7
                            ? "text-orange-600"
                            : cou.finalWeight >= 5
                            ? "text-yellow-600"
                            : "text-blue-600"
                        }`}>
                          {cou.finalWeight}
                        </span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getWeightProgressColor(cou.finalWeight)} transition-all duration-500`}
                          style={{ width: `${cou.finalWeight * 10}%` }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">基础权重</span>
                        <span className="font-medium">{cou.baseWeight}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">场景权重</span>
                        <span className={`font-medium ${
                          cou.scenarioWeight > 0
                            ? "text-green-600"
                            : cou.scenarioWeight < 0
                            ? "text-red-600"
                            : ""
                        }`}>
                          {cou.scenarioWeight > 0 ? "+" : ""}
                          {cou.scenarioWeight}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* 行动要求 */}
                <Card className="p-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="size-4" />
                    行动要求
                  </h4>
                  <p className="text-gray-700">{cou.actionRequired}</p>
                  {cou.deadline && (
                    <div className="mt-3 flex items-center gap-2 text-sm">
                      <Clock className="size-4 text-orange-500" />
                      <span className="text-orange-600 font-medium">
                        期限要求：{cou.deadline}
                      </span>
                    </div>
                  )}
                </Card>

                {/* 违规后果 */}
                {cou.penalty && (
                  <Card className="p-4 border-red-200 bg-red-50">
                    <h4 className="text-sm font-medium text-red-600 mb-2 flex items-center gap-2">
                      <AlertTriangle className="size-4" />
                      违规后果
                    </h4>
                    <p className="text-red-700 text-sm">{cou.penalty}</p>
                  </Card>
                )}

                {/* 标签 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                    <Tag className="size-4" />
                    标签
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {cou.tags.map((tag) => (
                      <Badge key={tag.id} className={`${tag.color} text-white`}>
                        {tag.name}
                      </Badge>
                    ))}
                    {cou.autoTags?.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="border-dashed">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* 措施要求 */}
              <TabsContent value="measures" className="space-y-4 sm:space-y-6 mt-3 sm:mt-4">
                {/* 技术措施 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                    <Shield className="size-4" />
                    技术措施
                  </h4>
                  {cou.technicalMeasures && cou.technicalMeasures.length > 0 ? (
                    <div className="space-y-2">
                      {cou.technicalMeasures.map((measure, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                        >
                          <CheckCircle2 className="size-5 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-gray-700">{measure}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">暂无技术措施要求</p>
                  )}
                </div>

                {/* 组织措施 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                    <Building2 className="size-4" />
                    组织措施
                  </h4>
                  {cou.organizationalMeasures && cou.organizationalMeasures.length > 0 ? (
                    <div className="space-y-2">
                      {cou.organizationalMeasures.map((measure, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                        >
                          <CheckCircle2 className="size-5 text-blue-500 shrink-0 mt-0.5" />
                          <span className="text-gray-700">{measure}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">暂无组织措施要求</p>
                  )}
                </div>

                {/* 特殊要求 */}
                {cou.specialRequirements && cou.specialRequirements.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                      <AlertTriangle className="size-4" />
                      特殊要求
                    </h4>
                    <div className="space-y-2">
                      {cou.specialRequirements.map((req, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                        >
                          <AlertTriangle className="size-5 text-yellow-600 shrink-0 mt-0.5" />
                          <span className="text-yellow-800">{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* 适用范围 */}
              <TabsContent value="scope" className="space-y-4 sm:space-y-6 mt-3 sm:mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* 适用行业 */}
                  <Card className="p-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                      <Building2 className="size-4" />
                      适用行业
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {cou.applicableIndustries?.map((industry) => (
                        <Badge key={industry} variant="outline">
                          {industry}
                        </Badge>
                      ))}
                    </div>
                  </Card>

                  {/* 适用区域 */}
                  <Card className="p-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                      <Globe className="size-4" />
                      适用区域
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {cou.applicableRegions?.map((region) => (
                        <Badge key={region} variant="outline">
                          {region}
                        </Badge>
                      ))}
                    </div>
                  </Card>

                  {/* 适用用户类型 */}
                  <Card className="p-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                      <Users className="size-4" />
                      用户类型
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {cou.applicableUserTypes?.map((type) => (
                        <Badge key={type} variant="outline">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* 来源条款 */}
              <TabsContent value="source" className="space-y-4 sm:space-y-6 mt-3 sm:mt-4">
                <Card className="p-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
                    <Shield className="size-4" />
                    来源政策
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">政策名称</span>
                      <span className="font-medium text-right">{cou.policyTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">政策层级</span>
                      <Badge variant="outline">{cou.policyLevel}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">条款编号</span>
                      <span className="font-mono text-sm">{cou.sourceClauseId}</span>
                    </div>
                  </div>
                </Card>

                {/* 关联COU */}
                {cou.relatedCOUs && cou.relatedCOUs.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                      <ArrowRight className="size-4" />
                      关联COU
                    </h4>
                    <div className="space-y-2">
                      {cou.relatedCOUs.map((relatedId) => (
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

                {/* 版本信息 */}
                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                  <span>版本: {cou.version}</span>
                  <span>状态: {cou.status === "current" ? "现行有效" : cou.status}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    更新于: {cou.updatedAt}
                  </span>
                </div>
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
          <Button
            size="sm"
            className="text-xs sm:text-sm bg-blue-600"
            onClick={() => onAddToScene?.(cou)}
          >
            <Plus className="size-3 sm:size-4 mr-1 sm:mr-2" />
            添加到场景
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
