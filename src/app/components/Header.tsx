import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import {
  Shield,
  Search,
  Bell,
  Settings,
  LogOut,
  User,
  CreditCard,
} from "lucide-react";
import { ViewType } from "../pages/MainApp";

interface HeaderProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onLogout: () => void;
  onSearch?: (keyword: string) => void;
  searchKeyword?: string;
}

export function Header({ currentView, onViewChange, onLogout, onSearch, searchKeyword = '' }: HeaderProps) {
  // 判断是否为后台管理视图
  const isAdminView = currentView.startsWith("admin-");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch?.(e.target.value);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch?.(searchKeyword);
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo 和搜索 */}
          <div className="flex items-center gap-6 flex-1">
            <div className="flex items-center gap-3">
              <div className={`size-10 rounded-lg flex items-center justify-center shadow-lg ${
                isAdminView
                  ? "bg-gradient-to-br from-purple-600 to-pink-600"
                  : "bg-gradient-to-br from-blue-600 to-cyan-600 shadow-blue-500/30"
              }`}>
                <Shield className="size-6 text-white" />
              </div>
              <div>
                <div className={`text-lg bg-clip-text text-transparent ${
                  isAdminView
                    ? "bg-gradient-to-r from-purple-600 to-pink-600"
                    : "bg-gradient-to-r from-blue-600 to-cyan-600"
                }`}>
                  {isAdminView ? "后台管理系统" : "DataSec Hub"}
                </div>
                <div className="text-xs text-gray-500">
                  {isAdminView ? "Admin Dashboard" : "合规知识库"}
                </div>
              </div>
            </div>

            {/* 全局搜索 - 仅在业务模块显示 */}
            {!isAdminView && (
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <Input
                  placeholder="搜索政策、COU、场景... (⌘K)"
                  value={searchKeyword}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                  className="pl-10 pr-4 bg-slate-50/50 border-slate-200/50 hover:border-blue-300 focus:border-blue-500 transition-colors"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs text-gray-500">
                  ⌘K
                </kbd>
              </div>
            )}
          </div>

          {/* 右侧操作 */}
          <div className="flex items-center gap-3">
            {/* 通知 - 仅在业务模块显示 */}
            {!isAdminView && (
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-slate-100"
              >
                <Bell className="size-5 text-slate-600" />
                <Badge className="absolute -top-1 -right-1 size-5 p-0 flex items-center justify-center bg-gradient-to-br from-red-500 to-pink-500 text-white border-2 border-white">
                  3
                </Badge>
              </Button>
            )}

            {/* 用户菜单 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 hover:bg-slate-100">
                  <Avatar className="size-8">
                    <AvatarFallback className={`text-white ${
                      isAdminView
                        ? "bg-gradient-to-br from-purple-500 to-pink-500"
                        : "bg-gradient-to-br from-blue-500 to-cyan-500"
                    }`}>
                      {isAdminView ? "管" : "企"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden md:block">
                    <div className="text-sm">
                      {isAdminView ? "管理员" : "某互联网科技"}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <div className={`size-1.5 rounded-full ${
                        isAdminView ? "bg-purple-500" : "bg-green-500"
                      }`} />
                      {isAdminView ? "超级管理员" : "企业版"}
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>我的账户</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onViewChange("settings")}>
                  <User className="mr-2 size-4" />
                  个人设置
                </DropdownMenuItem>
                {!isAdminView && (
                  <DropdownMenuItem onClick={() => onViewChange("dashboard")}>
                    <CreditCard className="mr-2 size-4" />
                    订阅管理
                  </DropdownMenuItem>
                )}
                {!isAdminView && (
                  <DropdownMenuItem onClick={() => onViewChange("admin-overview")}>
                    <Settings className="mr-2 size-4" />
                    后台管理
                  </DropdownMenuItem>
                )}
                {isAdminView && (
                  <DropdownMenuItem onClick={() => onViewChange("cous")}>
                    <Shield className="mr-2 size-4" />
                    返回主应用
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-red-600">
                  <LogOut className="mr-2 size-4" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
