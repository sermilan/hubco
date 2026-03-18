import { useState, useMemo } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import {
  Eye,
  Search,
  Download,
  Filter,
  Clock,
  User,
  FileText,
  CheckCircle2,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Upload,
  Shield,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
import {
  AuditLog,
  AuditAction,
  AuditTargetType,
  AdminRole,
  ROLE_DISPLAY_INFO,
} from "../../types";
import { MOCK_AUDIT_LOGS, MOCK_ADMIN_USERS } from "../../data/mockData";

// 操作类型配置
const ACTION_CONFIG: Record<
  AuditAction,
  { label: string; color: string; icon: typeof Plus }
> = {
  [AuditAction.CREATE]: {
    label: "创建",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: Plus,
  },
  [AuditAction.UPDATE]: {
    label: "更新",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Edit,
  },
  [AuditAction.DELETE]: {
    label: "删除",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: Trash2,
  },
  [AuditAction.PUBLISH]: {
    label: "发布",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    icon: Upload,
  },
  [AuditAction.EXPORT]: {
    label: "导出",
    color: "bg-orange-100 text-orange-700 border-orange-200",
    icon: Download,
  },
  [AuditAction.IMPORT]: {
    label: "导入",
    color: "bg-cyan-100 text-cyan-700 border-cyan-200",
    icon: Upload,
  },
  [AuditAction.LOGIN]: {
    label: "登录",
    color: "bg-gray-100 text-gray-700 border-gray-200",
    icon: User,
  },
  [AuditAction.LOGOUT]: {
    label: "登出",
    color: "bg-gray-100 text-gray-700 border-gray-200",
    icon: User,
  },
  [AuditAction.APPROVE]: {
    label: "审批",
    color: "bg-teal-100 text-teal-700 border-teal-200",
    icon: CheckCircle2,
  },
  [AuditAction.REJECT]: {
    label: "拒绝",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: XCircle,
  },
  [AuditAction.VIEW]: {
    label: "查看",
    color: "bg-gray-100 text-gray-700 border-gray-200",
    icon: Eye,
  },
};

// 目标类型配置
const TARGET_TYPE_CONFIG: Record<AuditTargetType, { label: string; color: string }> = {
  [AuditTargetType.POLICY]: { label: "政策", color: "bg-blue-100 text-blue-700 border-blue-200" },
  [AuditTargetType.COU]: { label: "COU", color: "bg-green-100 text-green-700 border-green-200" },
  [AuditTargetType.USER]: { label: "用户", color: "bg-purple-100 text-purple-700 border-purple-200" },
  [AuditTargetType.SYSTEM]: { label: "系统", color: "bg-gray-100 text-gray-700 border-gray-200" },
  [AuditTargetType.ROLE]: { label: "角色", color: "bg-orange-100 text-orange-700 border-orange-200" },
  [AuditTargetType.APPROVAL]: { label: "审批", color: "bg-teal-100 text-teal-700 border-teal-200" },
  [AuditTargetType.ADMIN_USER]: { label: "管理员", color: "bg-pink-100 text-pink-700 border-pink-200" },
};

// 角色颜色映射（固定颜色）
const ROLE_COLOR_MAP: Record<AdminRole, { bg: string; text: string; border: string }> = {
  [AdminRole.SUPER_ADMIN]: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
  [AdminRole.ADMIN]: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  [AdminRole.OPERATOR]: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  [AdminRole.AUDITOR]: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" },
  [AdminRole.EDITOR]: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
};

export function AuditLogCenter() {
  const [logs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterTargetType, setFilterTargetType] = useState<string>("all");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterSuccess, setFilterSuccess] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // 分页
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // 筛选日志
  const filteredLogs = useMemo(() => {
    if (!logs || logs.length === 0) return [];
    return logs.filter((log) => {
      if (!log) return false;
      const matchesSearch =
        searchTerm === "" ||
        (log.userName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (log.targetName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (log.ipAddress || "").includes(searchTerm);

      const matchesAction = filterAction === "all" || log.action === filterAction;
      const matchesTargetType =
        filterTargetType === "all" || log.targetType === filterTargetType;
      const matchesRole = filterRole === "all" || log.role === filterRole;
      const matchesSuccess =
        filterSuccess === "all" ||
        (filterSuccess === "success" && log.success) ||
        (filterSuccess === "failure" && !log.success);

      // 日期筛选
      let matchesDate = true;
      try {
        const logDate = new Date(log.timestamp);
        const now = new Date();
        if (dateRange === "today") {
          matchesDate = logDate.toDateString() === now.toDateString();
        } else if (dateRange === "week") {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = logDate >= weekAgo;
        } else if (dateRange === "month") {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = logDate >= monthAgo;
        }
      } catch {
        matchesDate = true;
      }

      return (
        matchesSearch &&
        matchesAction &&
        matchesTargetType &&
        matchesRole &&
        matchesSuccess &&
        matchesDate
      );
    });
  }, [
    logs,
    searchTerm,
    filterAction,
    filterTargetType,
    filterRole,
    filterSuccess,
    dateRange,
  ]);

  // 分页数据
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage]);

  const totalPages = Math.ceil((filteredLogs?.length || 0) / pageSize);

  // 打开详情对话框
  const handleViewDetail = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDetailDialogOpen(true);
  };

  // 导出日志
  const handleExport = () => {
    const data = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`已导出 ${filteredLogs.length} 条日志记录`);
  };

  // 获取操作徽章
  const getActionBadge = (action: AuditAction) => {
    const config = ACTION_CONFIG[action] || ACTION_CONFIG[AuditAction.VIEW];
    const Icon = config.icon;
    return (
      <Badge className={config.color} variant="outline">
        <Icon className="size-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  // 获取目标类型徽章
  const getTargetTypeBadge = (type: AuditTargetType) => {
    const config = TARGET_TYPE_CONFIG[type] || TARGET_TYPE_CONFIG[AuditTargetType.SYSTEM];
    return <Badge className={config.color} variant="outline">{config.label}</Badge>;
  };

  // 获取角色徽章
  const getRoleBadge = (role: AdminRole) => {
    const colors = ROLE_COLOR_MAP[role] || ROLE_COLOR_MAP[AdminRole.AUDITOR];
    const info = ROLE_DISPLAY_INFO[role] || ROLE_DISPLAY_INFO[AdminRole.AUDITOR];
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
        {info.label}
      </span>
    );
  };

  // 敏感操作判断
  const isSensitiveAction = (action: AuditAction, targetType: AuditTargetType) => {
    return (
      action === AuditAction.DELETE ||
      (action === AuditAction.UPDATE && targetType === AuditTargetType.SYSTEM) ||
      action === AuditAction.PUBLISH
    );
  };

  // 安全格式化日期
  const formatDate = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString("zh-CN", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return timestamp;
    }
  };

  const formatDateFull = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString("zh-CN");
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6 space-y-6 overflow-auto">
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <ClipboardList className="size-5 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-slate-800">审计日志中心</h1>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="size-4 mr-2" />
          导出日志
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="text-sm text-slate-500 mb-1">今日操作</div>
          <div className="text-2xl font-bold text-slate-800">
            {logs?.filter((l) => {
              if (!l?.timestamp) return false;
              try {
                const logDate = new Date(l.timestamp);
                const today = new Date();
                return logDate.toDateString() === today.toDateString();
              } catch {
                return false;
              }
            }).length || 0}
          </div>
        </Card>
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="text-sm text-slate-500 mb-1">敏感操作</div>
          <div className="text-2xl font-bold text-amber-600">
            {logs?.filter((l) => l && isSensitiveAction(l.action, l.targetType)).length || 0}
          </div>
        </Card>
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="text-sm text-slate-500 mb-1">失败操作</div>
          <div className="text-2xl font-bold text-red-600">
            {logs?.filter((l) => l && !l.success).length || 0}
          </div>
        </Card>
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="text-sm text-slate-500 mb-1">活跃管理员</div>
          <div className="text-2xl font-bold text-blue-600">
            {new Set(logs?.map((l) => l?.userId).filter(Boolean)).size || 0}
          </div>
        </Card>
      </div>

      {/* 筛选工具栏 */}
      <Card className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                placeholder="搜索操作人、目标对象或IP地址..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="操作类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部操作</SelectItem>
                  {Object.values(AuditAction).map((action) => (
                    <SelectItem key={action} value={action}>
                      {ACTION_CONFIG[action]?.label || action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterTargetType} onValueChange={setFilterTargetType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="目标类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  {Object.values(AuditTargetType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {TARGET_TYPE_CONFIG[type]?.label || type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部角色</SelectItem>
                  {Object.values(AdminRole).map((role) => (
                    <SelectItem key={role} value={role}>
                      {ROLE_DISPLAY_INFO[role]?.label || role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <Clock className="size-4 mr-2" />
                  <SelectValue placeholder="时间范围" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部时间</SelectItem>
                  <SelectItem value="today">今天</SelectItem>
                  <SelectItem value="week">最近7天</SelectItem>
                  <SelectItem value="month">最近30天</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <Label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="success"
                value="all"
                checked={filterSuccess === "all"}
                onChange={(e) => setFilterSuccess(e.target.value)}
              />
              全部状态
            </Label>
            <Label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="success"
                value="success"
                checked={filterSuccess === "success"}
                onChange={(e) => setFilterSuccess(e.target.value)}
              />
              成功
            </Label>
            <Label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="success"
                value="failure"
                checked={filterSuccess === "failure"}
                onChange={(e) => setFilterSuccess(e.target.value)}
              />
              失败
            </Label>
          </div>
        </div>
      </Card>

      {/* 日志列表 */}
      <Card className="flex-1 overflow-hidden">
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>时间</TableHead>
                <TableHead>操作人</TableHead>
                <TableHead>操作</TableHead>
                <TableHead>目标类型</TableHead>
                <TableHead>目标对象</TableHead>
                <TableHead>IP地址</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLogs.map((log) => (
                <TableRow
                  key={log?.id || Math.random()}
                  className={
                    !log?.success ? "bg-red-50/50" : isSensitiveAction(log?.action, log?.targetType) ? "bg-amber-50/30" : undefined
                  }
                >
                  <TableCell className="text-sm whitespace-nowrap">
                    {formatDate(log?.timestamp)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{log?.userName || "未知"}</span>
                      <span className="text-xs text-slate-500">
                        {ROLE_DISPLAY_INFO[log?.role]?.label || "未知"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getActionBadge(log?.action)}</TableCell>
                  <TableCell>{getTargetTypeBadge(log?.targetType)}</TableCell>
                  <TableCell className="max-w-xs truncate text-sm">
                    {log?.targetName || "-"}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {log?.ipAddress || "-"}
                  </TableCell>
                  <TableCell>
                    {log?.success ? (
                      <CheckCircle2 className="size-5 text-green-500" />
                    ) : (
                      <XCircle className="size-5 text-red-500" />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetail(log)}
                    >
                      <Eye className="size-4 mr-1" />
                      详情
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {paginatedLogs.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <FileText className="size-12 mx-auto mb-4 opacity-50" />
            <div>暂无符合条件的日志记录</div>
          </div>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-slate-500">
              共 {filteredLogs.length} 条记录，第 {currentPage}/{totalPages} 页
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 日志详情对话框 */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              操作详情
              {selectedLog && !selectedLog.success && (
                <Badge className="bg-red-100 text-red-700 border-red-200">失败</Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedLog && `日志ID: ${selectedLog.id}`}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6">
                {/* 基本信息 */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <Label className="text-slate-500">操作人</Label>
                    <div className="font-medium">{selectedLog.userName || "-"}</div>
                    <div className="text-xs text-slate-500">
                      {selectedLog.userEmail || "-"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-500">角色</Label>
                    <div>{getRoleBadge(selectedLog.role)}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-500">操作时间</Label>
                    <div className="font-medium">
                      {formatDateFull(selectedLog.timestamp)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-500">操作类型</Label>
                    <div>{getActionBadge(selectedLog.action)}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-500">IP地址</Label>
                    <div className="font-medium font-mono">
                      {selectedLog.ipAddress || "-"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-500">用户代理</Label>
                    <div className="text-xs text-slate-500 truncate max-w-[200px]">
                      {selectedLog.userAgent || "-"}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 目标对象信息 */}
                <div>
                  <Label className="text-slate-500 mb-2 block">目标对象</Label>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {getTargetTypeBadge(selectedLog.targetType)}
                      <span className="font-medium">
                        {selectedLog.targetName || "-"}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      ID: {selectedLog.targetId || "-"}
                    </div>
                  </div>
                </div>

                {/* 变更对比 */}
                {selectedLog.details?.before && selectedLog.details?.after && (
                  <div>
                    <Label className="text-slate-500 mb-2 block">变更对比</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                        <div className="text-xs text-red-700 mb-2 font-medium">
                          变更前
                        </div>
                        <pre className="text-xs overflow-auto max-h-40 text-slate-700">
                          {JSON.stringify(selectedLog.details.before, null, 2)}
                        </pre>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                        <div className="text-xs text-green-700 mb-2 font-medium">
                          变更后
                        </div>
                        <pre className="text-xs overflow-auto max-h-40 text-slate-700">
                          {JSON.stringify(selectedLog.details.after, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}

                {/* 变更字段列表 */}
                {selectedLog.details?.changes &&
                  selectedLog.details.changes.length > 0 && (
                    <div>
                      <Label className="text-slate-500 mb-2 block">变更字段</Label>
                      <div className="bg-slate-50 p-3 rounded-lg space-y-2">
                        {selectedLog.details.changes.map((change, idx) => (
                          <div
                            key={idx}
                            className="grid grid-cols-3 gap-2 text-sm"
                          >
                            <div className="font-medium text-slate-700">
                              {change?.field || "-"}
                            </div>
                            <div className="text-red-600 truncate">
                              {String(change?.oldValue ?? "")}
                            </div>
                            <div className="text-green-600 truncate">
                              {String(change?.newValue ?? "")}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* 元数据 */}
                {selectedLog.details?.metadata &&
                  Object.keys(selectedLog.details.metadata).length > 0 && (
                    <div>
                      <Label className="text-slate-500 mb-2 block">附加信息</Label>
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <pre className="text-xs text-slate-700">
                          {JSON.stringify(selectedLog.details.metadata, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                {/* 错误信息 */}
                {selectedLog.errorMessage && (
                  <div>
                    <Label className="text-red-600 mb-2 block flex items-center gap-1">
                      <AlertTriangle className="size-4" />
                      错误信息
                    </Label>
                    <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-red-700 text-sm">
                      {selectedLog.errorMessage}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AuditLogCenter;
