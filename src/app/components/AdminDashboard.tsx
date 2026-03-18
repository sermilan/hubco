import { useState, useEffect, useCallback } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Database,
  Target,
  Users,
  FileText,
  BarChart3,
} from "lucide-react";
import { PolicyBrowser } from "./admin/PolicyBrowser";
import { ClauseEditor } from "./admin/ClauseEditor";
import { COUBrowser } from "./admin/COUBrowser";
import { ControlObjectiveBrowser } from "./admin/ControlObjectiveBrowser";
import { TemplateManager } from "./admin/TemplateManager";
import { UserManagement } from "./admin/UserManagement";
import { SystemSettings } from "./admin/SystemSettings";
import { RoleManagement } from "./admin/RoleManagement";
import { AuditLogCenter } from "./admin/AuditLogCenter";
import { COUWorkbench } from "./admin/COUWorkbench";
import { TagDictionaryManager } from "./admin/TagDictionaryManager";
import { KnowledgeGraphDashboard } from "./admin/KnowledgeGraphDashboard";
import { VersionControlCenter } from "./admin/VersionControlCenter";
import { usePermission, useMockAdminAuth, AdminAuthProvider } from "../hooks/usePermission";
import { AdminRole, ROLE_DISPLAY_INFO } from "../types";
import { MOCK_AUDIT_LOGS } from "../data/mockData";
import { ViewType } from "../pages/MainApp";

// 角色颜色映射
const ROLE_COLORS: Record<AdminRole, { bg: string; text: string; border: string }> = {
  [AdminRole.SUPER_ADMIN]: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
  [AdminRole.ADMIN]: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  [AdminRole.OPERATOR]: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  [AdminRole.AUDITOR]: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" },
  [AdminRole.EDITOR]: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
};

interface AdminDashboardProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

function AdminDashboardContent({ currentView, onViewChange }: AdminDashboardProps) {
  const { currentAdmin, isSuperAdmin } = usePermission();
  const { loginAsSuperAdmin } = useMockAdminAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 跨视图状态：选中的政策ID（用于 PolicyBrowser → ClauseEditor 联动）
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | undefined>(undefined);
  // 跨视图状态：选中的条款ID（用于 ClauseEditor → COUBrowser 联动）
  const [selectedClauseId, setSelectedClauseId] = useState<string | undefined>(undefined);

  // 模拟登录（开发测试用）
  useEffect(() => {
    if (!isLoggedIn && !currentAdmin) {
      loginAsSuperAdmin();
      setIsLoggedIn(true);
    }
  }, [isLoggedIn, currentAdmin, loginAsSuperAdmin]);

  // 处理从 PolicyBrowser 跳转到 ClauseEditor
  const handleNavigateToClauses = useCallback((policyId: string) => {
    setSelectedPolicyId(policyId);
    onViewChange("admin-clauses");
  }, [onViewChange]);

  // 处理从 ClauseEditor 跳转到 COUBrowser
  const handleNavigateToCOUs = useCallback((clauseId: string) => {
    setSelectedClauseId(clauseId);
    onViewChange("admin-cous");
  }, [onViewChange]);

  // 处理从 ClauseEditor 跳转到 ControlObjectiveBrowser
  const handleNavigateToControlObjectives = useCallback((clauseId: string) => {
    setSelectedClauseId(clauseId);
    onViewChange("admin-control-objectives");
  }, [onViewChange]);

  // 返回政策列表
  const handleBackToPolicies = useCallback(() => {
    setSelectedPolicyId(undefined);
    onViewChange("admin-policies");
  }, [onViewChange]);

  // 返回条款编辑器
  const handleBackToClauses = useCallback(() => {
    setSelectedClauseId(undefined);
    onViewChange("admin-clauses");
  }, [onViewChange]);

  // 处理从 COUBrowser 跳转到 COUWorkbench
  const handleNavigateToWorkbench = useCallback(() => {
    onViewChange("admin-workbench");
  }, [onViewChange]);

  // 获取最近活动
  const recentActivities = MOCK_AUDIT_LOGS.slice(0, 5).map(log => ({
    action: log.action,
    title: log.targetName,
    time: new Date(log.timestamp).toLocaleString("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    user: log.userName,
    role: log.role,
  }));

  // 获取角色徽章样式
  const getRoleBadgeStyle = (role: AdminRole) => {
    const colors = ROLE_COLORS[role];
    return `${colors.bg} ${colors.text} ${colors.border}`;
  };

  // 提取当前 admin 标签
  const currentTab = currentView.replace("admin-", "");

  // 判断是否为需要内部滚动的管理视图
  const isInternalScrollView = [
    "admin-policies",
    "admin-clauses",
    "admin-cous",
    "admin-control-objectives",
    "admin-workbench",
    "admin-scene-builder",
    "admin-tags",
    "admin-graph",
    "admin-versions",
    "admin-users",
    "admin-roles",
    "admin-audit",
    "admin-settings",
  ].includes(currentView);

  return (
    <div className={`h-full ${isInternalScrollView ? "overflow-hidden" : "overflow-auto"} p-6`}>
      {/* 概览视图 */}
      {currentView === "admin-overview" && (
        <div className="space-y-6">
          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "政策文件", value: "523", icon: FileText, color: "from-blue-500 to-cyan-500" },
              { label: "COU单元", value: "10,247", icon: Target, color: "from-purple-500 to-pink-500" },
              { label: "注册用户", value: "1,234", icon: Users, color: "from-orange-500 to-red-500" },
              { label: "活跃场景", value: "456", icon: Database, color: "from-green-500 to-teal-500" },
            ].map((stat, idx) => (
              <Card key={idx} className="p-6 hover:shadow-lg transition-shadow">
                <div className={`size-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <stat.icon className="size-6 text-white" />
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 最近活动 */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">最近活动</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewChange("admin-audit")}
                >
                  查看全部
                </Button>
              </div>
              <div className="space-y-3">
                {recentActivities.map((activity, idx) => (
                  <div key={idx} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <Badge variant="outline" className="text-xs">
                          {activity.action}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-sm font-medium">{activity.title}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                          <span>{activity.user}</span>
                          <span>•</span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getRoleBadgeStyle(activity.role as AdminRole)}`}
                          >
                            {ROLE_DISPLAY_INFO[activity.role as AdminRole].label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{activity.time}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* 系统状态 */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">系统状态</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm">系统运行正常</span>
                  </div>
                  <span className="text-xs text-gray-500">运行时间: 30天</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-sm">数据库连接正常</span>
                  </div>
                  <span className="text-xs text-gray-500">延迟: 12ms</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="text-sm">API服务正常</span>
                  </div>
                  <span className="text-xs text-gray-500">成功率: 99.9%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span className="text-sm">今日API调用</span>
                  </div>
                  <span className="text-sm font-medium">12,580 次</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* 政策管理 */}
      {currentView === "admin-policies" && (
        <div className="h-[calc(100vh-140px)]">
          <PolicyBrowser
            onNavigateToClauses={handleNavigateToClauses}
            selectedPolicyId={selectedPolicyId}
          />
        </div>
      )}

      {/* 条款管理 */}
      {currentView === "admin-clauses" && (
        <div className="h-[calc(100vh-140px)]">
          <ClauseEditor
            initialPolicyId={selectedPolicyId}
            onNavigateToCOUs={handleNavigateToCOUs}
            onNavigateToControlObjectives={handleNavigateToControlObjectives}
            onBackToPolicies={handleBackToPolicies}
          />
        </div>
      )}

      {/* COU管理 */}
      {currentView === "admin-cous" && (
        <div className="h-[calc(100vh-140px)]">
          <COUBrowser
            initialClauseId={selectedClauseId}
            onBackToClauses={handleBackToClauses}
            onNavigateToWorkbench={handleNavigateToWorkbench}
          />
        </div>
      )}

      {/* 控制目标管理 */}
      {currentView === "admin-control-objectives" && (
        <div className="h-[calc(100vh-140px)]">
          <ControlObjectiveBrowser
            initialClauseId={selectedClauseId}
            onBackToClauses={handleBackToClauses}
            onNavigateToClause={(clauseId) => {
              setSelectedClauseId(clauseId);
              onViewChange("admin-clauses");
            }}
            onNavigateToPolicy={(policyId) => {
              setSelectedPolicyId(policyId);
              onViewChange("admin-clauses");
            }}
          />
        </div>
      )}

      {/* COU拆解工作台 */}
      {currentView === "admin-workbench" && (
        <div className="h-[calc(100vh-140px)]">
          <COUWorkbench
            onSave={(cou) => {
              console.log("保存COU:", cou);
            }}
          />
        </div>
      )}

      {/* 场景模板管理 */}
      {currentView === "admin-scene-builder" && (
        <div className="h-[calc(100vh-140px)]">
          <TemplateManager />
        </div>
      )}

      {/* 标签字典管理 */}
      {currentView === "admin-tags" && (
        <div className="h-[calc(100vh-140px)]">
          <TagDictionaryManager />
        </div>
      )}

      {/* 知识图谱看板 */}
      {currentView === "admin-graph" && (
        <div className="h-[calc(100vh-140px)]">
          <KnowledgeGraphDashboard />
        </div>
      )}

      {/* 版本管理中心 */}
      {currentView === "admin-versions" && (
        <div className="h-[calc(100vh-140px)]">
          <VersionControlCenter />
        </div>
      )}

      {/* 用户管理 */}
      {currentView === "admin-users" && <UserManagement />}

      {/* 角色权限 */}
      {currentView === "admin-roles" && <RoleManagement />}

      {/* 审计日志 */}
      {currentView === "admin-audit" && <AuditLogCenter />}

      {/* 系统设置 */}
      {currentView === "admin-settings" && <SystemSettings />}
    </div>
  );
}

// 包装组件，提供权限上下文
export function AdminDashboard(props: AdminDashboardProps) {
  return (
    <AdminAuthProvider>
      <AdminDashboardContent {...props} />
    </AdminAuthProvider>
  );
}
