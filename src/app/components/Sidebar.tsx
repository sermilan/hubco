import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Database,
  Target,
  Sparkles,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutDashboard,
  Briefcase,
  Tags,
  Network,
  Users,
  UserCog,
  ClipboardList,
  GitBranch,
  Shield,
  Goal,
} from "lucide-react";
import { ViewType } from "../pages/MainApp";

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  currentView,
  onViewChange,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  // 判断是否为后台管理视图
  const isAdminView = currentView.startsWith("admin-");

  // 业务模块导航
  const businessNavItems = [
    { id: "policies" as ViewType, label: "政策文件", icon: FileText, badge: "10+", badgeColor: "bg-blue-500" },
    { id: "clauses" as ViewType, label: "条款库", icon: Database, badge: "15+", badgeColor: "bg-indigo-500" },
    { id: "cous" as ViewType, label: "COU合规单元", icon: Target, badge: "15+", badgeColor: "bg-cyan-500" },
    { id: "scenes" as ViewType, label: "场景管理", icon: Sparkles, badge: "New", badgeColor: "bg-purple-500" },
    { id: "dashboard" as ViewType, label: "数据看板", icon: BarChart3, badge: null, badgeColor: "" },
  ];

  // 后台管理导航
  const adminNavItems = [
    { id: "admin-overview" as ViewType, label: "概览看板", icon: LayoutDashboard },
    { id: "admin-policies" as ViewType, label: "政策管理", icon: FileText },
    { id: "admin-clauses" as ViewType, label: "条款管理", icon: Database },
    { id: "admin-control-objectives" as ViewType, label: "控制目标", icon: Goal, badge: "新" },
    { id: "admin-cous" as ViewType, label: "COU管理", icon: Target },
    { id: "admin-workbench" as ViewType, label: "拆解工作台", icon: Briefcase },
    { id: "admin-scene-builder" as ViewType, label: "场景构建器", icon: Sparkles, badge: "新" },
    { id: "admin-tags" as ViewType, label: "标签字典", icon: Tags },
    { id: "admin-graph" as ViewType, label: "知识图谱", icon: Network },
    { id: "admin-versions" as ViewType, label: "版本控制", icon: GitBranch },
    { id: "admin-users" as ViewType, label: "用户管理", icon: Users },
    { id: "admin-roles" as ViewType, label: "角色权限", icon: UserCog },
    { id: "admin-audit" as ViewType, label: "审计日志", icon: ClipboardList },
    { id: "admin-settings" as ViewType, label: "系统设置", icon: Settings },
  ];

  return (
    <aside
      className={`bg-white/60 backdrop-blur-xl border-r border-slate-200/50 flex flex-col transition-all duration-300 h-full ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* 导航列表 */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {/* 业务模块组 - 仅在业务视图显示 */}
        {!isAdminView && (
          <>
            {businessNavItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                      : "hover:bg-slate-100 text-slate-700"
                  } ${collapsed ? "px-2" : "px-4"}`}
                  onClick={() => onViewChange(item.id)}
                >
                  <item.icon className="size-5 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <Badge
                          className={`${
                            isActive
                              ? "bg-white/20 text-white"
                              : `${item.badgeColor} text-white`
                          } text-xs`}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
              );
            })}
          </>
        )}

        {/* 后台管理组 - 仅在后台视图显示 */}
        {isAdminView && (
          <>
            {/* 管理模块标题 */}
            {!collapsed && (
              <div className="px-4 py-2 text-xs font-semibold text-purple-600 uppercase tracking-wider">
                后台管理中心
              </div>
            )}
            {collapsed && <div className="py-2" />}

            {adminNavItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30"
                      : "hover:bg-purple-50 text-slate-700"
                  } ${collapsed ? "px-2" : "px-4"}`}
                  onClick={() => onViewChange(item.id)}
                >
                  <item.icon className="size-5 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <Badge
                          className={`${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-orange-500 text-white"
                          } text-xs`}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
              );
            })}
          </>
        )}
      </nav>

      {/* 底部操作 */}
      <div className="mt-auto p-3 border-t border-slate-200/50 space-y-1 flex-shrink-0">
        {/* 后台管理入口 - 仅在业务视图显示 */}
        {!isAdminView && (
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 text-purple-700 hover:bg-purple-50 ${
              collapsed ? "px-2" : "px-4"
            }`}
            onClick={() => onViewChange("admin-overview")}
          >
            <Shield className="size-5 flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">后台管理</span>
                <Badge className="bg-purple-500 text-white text-xs">Admin</Badge>
              </>
            )}
          </Button>
        )}

        {/* 返回主应用 - 仅在后台视图显示 */}
        {isAdminView && (
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 text-blue-700 hover:bg-blue-50 ${
              collapsed ? "px-2" : "px-4"
            }`}
            onClick={() => onViewChange("cous")}
          >
            <Shield className="size-5 flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">返回主应用</span>
                <Badge className="bg-blue-500 text-white text-xs">Back</Badge>
              </>
            )}
          </Button>
        )}

        {/* 设置 */}
        <Button
          variant="ghost"
          className={`w-full justify-start gap-3 text-slate-700 hover:bg-slate-100 ${
            collapsed ? "px-2" : "px-4"
          }`}
          onClick={() => onViewChange("settings")}
        >
          <Settings className="size-5 flex-shrink-0" />
          {!collapsed && <span className="flex-1 text-left">设置</span>}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="w-full text-slate-500 hover:bg-slate-100"
          onClick={onToggleCollapse}
        >
          {collapsed ? (
            <ChevronRight className="size-5" />
          ) : (
            <ChevronLeft className="size-5" />
          )}
        </Button>
      </div>
    </aside>
  );
}
