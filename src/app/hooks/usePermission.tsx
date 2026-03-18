import { useCallback, useContext, createContext, useState, ReactNode } from "react";
import {
  AdminUser,
  Permission,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  AdminRole,
} from "../types";

// 当前登录管理员上下文
interface AdminAuthContextType {
  currentAdmin: AdminUser | null;
  login: (admin: AdminUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);

  const login = useCallback((admin: AdminUser) => {
    setCurrentAdmin(admin);
    // 存储到 localStorage 以便持久化
    localStorage.setItem("currentAdmin", JSON.stringify(admin));
  }, []);

  const logout = useCallback(() => {
    setCurrentAdmin(null);
    localStorage.removeItem("currentAdmin");
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{
        currentAdmin,
        login,
        logout,
        isAuthenticated: !!currentAdmin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}

// 权限检查 Hook
export function usePermission() {
  const { currentAdmin } = useAdminAuth();

  const checkPermission = useCallback(
    (permission: Permission): boolean => {
      return hasPermission(currentAdmin, permission);
    },
    [currentAdmin]
  );

  const checkAnyPermission = useCallback(
    (permissions: Permission[]): boolean => {
      return hasAnyPermission(currentAdmin, permissions);
    },
    [currentAdmin]
  );

  const checkAllPermissions = useCallback(
    (permissions: Permission[]): boolean => {
      return hasAllPermissions(currentAdmin, permissions);
    },
    [currentAdmin]
  );

  const isSuperAdmin = useCallback((): boolean => {
    return currentAdmin?.role === AdminRole.SUPER_ADMIN;
  }, [currentAdmin]);

  const canManageAdmins = useCallback((): boolean => {
    return (
      currentAdmin?.role === AdminRole.SUPER_ADMIN ||
      currentAdmin?.role === AdminRole.ADMIN
    );
  }, [currentAdmin]);

  const canDelete = useCallback((): boolean => {
    if (!currentAdmin) return false;
    return (
      currentAdmin.role === AdminRole.SUPER_ADMIN ||
      currentAdmin.role === AdminRole.ADMIN
    );
  }, [currentAdmin]);

  const canPublish = useCallback((): boolean => {
    if (!currentAdmin) return false;
    return (
      currentAdmin.role === AdminRole.SUPER_ADMIN ||
      currentAdmin.role === AdminRole.ADMIN ||
      currentAdmin.role === AdminRole.OPERATOR
    );
  }, [currentAdmin]);

  const needsApproval = useCallback((): boolean => {
    if (!currentAdmin) return false;
    return currentAdmin.role === AdminRole.EDITOR;
  }, [currentAdmin]);

  return {
    currentAdmin,
    checkPermission,
    checkAnyPermission,
    checkAllPermissions,
    isSuperAdmin,
    canManageAdmins,
    canDelete,
    canPublish,
    needsApproval,
    isAuthenticated: !!currentAdmin,
  };
}

// 用于模拟登录的 Hook（开发测试用）
export function useMockAdminAuth() {
  const { login } = useAdminAuth();

  const loginAsSuperAdmin = useCallback(() => {
    const superAdmin: AdminUser = {
      id: "admin_001",
      name: "超级管理员",
      email: "superadmin@datasechub.com",
      role: AdminRole.SUPER_ADMIN,
      permissions: [],
      status: "active",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
      lastLoginAt: new Date().toISOString(),
      lastLoginIp: "127.0.0.1",
    };
    login(superAdmin);
  }, [login]);

  const loginAsAdmin = useCallback(() => {
    const admin: AdminUser = {
      id: "admin_002",
      name: "管理员",
      email: "admin@datasechub.com",
      role: AdminRole.ADMIN,
      permissions: [],
      status: "active",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
      lastLoginAt: new Date().toISOString(),
      lastLoginIp: "127.0.0.1",
    };
    login(admin);
  }, [login]);

  const loginAsEditor = useCallback(() => {
    const editor: AdminUser = {
      id: "admin_003",
      name: "编辑",
      email: "editor@datasechub.com",
      role: AdminRole.EDITOR,
      permissions: [],
      status: "active",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
      lastLoginAt: new Date().toISOString(),
      lastLoginIp: "127.0.0.1",
    };
    login(editor);
  }, [login]);

  return {
    loginAsSuperAdmin,
    loginAsAdmin,
    loginAsEditor,
  };
}
