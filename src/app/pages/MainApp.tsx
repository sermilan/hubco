import { useState, useMemo } from "react";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { PolicyExplorer } from "../components/PolicyExplorer";
import { COUExplorer } from "../components/COUExplorer";
import { SceneManager } from "../components/SceneManager";
import { Dashboard } from "../components/Dashboard";
import { UserSettings } from "../components/UserSettings";
import { ClauseBrowser } from "../components/ClauseBrowser";
import { AdminDashboard } from "../components/AdminDashboard";

interface MainAppProps {
  onLogout: () => void;
}

export type ViewType =
  // 业务模块
  | "policies" | "clauses" | "cous" | "scenes" | "dashboard" | "settings"
  // 后台管理模块
  | "admin-overview" | "admin-policies" | "admin-clauses" | "admin-control-objectives" | "admin-cous" | "admin-workbench"
  | "admin-scene-builder" | "admin-tags" | "admin-graph" | "admin-versions" | "admin-users"
  | "admin-roles" | "admin-audit" | "admin-settings";

export function MainApp({ onLogout }: MainAppProps) {
  const [currentView, setCurrentView] = useState<ViewType>("cous");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [globalSearchKeyword, setGlobalSearchKeyword] = useState("");

  // 判断是否为后台管理视图
  const isAdminView = currentView.startsWith("admin-");

  // 处理全局搜索
  const handleSearch = (keyword: string) => {
    setGlobalSearchKeyword(keyword);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex flex-col overflow-hidden">
      {/* 顶部导航栏 */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        onLogout={onLogout}
        onSearch={handleSearch}
        searchKeyword={globalSearchKeyword}
      />

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 侧边栏 */}
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* 内容区域 */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {/* 业务模块 */}
          {currentView === "policies" && <PolicyExplorer searchKeyword={globalSearchKeyword} />}
          {currentView === "clauses" && <ClauseBrowser searchKeyword={globalSearchKeyword} />}
          {currentView === "cous" && <COUExplorer searchKeyword={globalSearchKeyword} />}
          {currentView === "scenes" && <SceneManager searchKeyword={globalSearchKeyword} />}
          {currentView === "dashboard" && <Dashboard />}
          {currentView === "settings" && <UserSettings onLogout={onLogout} />}

          {/* 后台管理模块 */}
          {isAdminView && (
            <AdminDashboard
              currentView={currentView}
              onViewChange={setCurrentView}
            />
          )}
        </main>
      </div>
    </div>
  );
}