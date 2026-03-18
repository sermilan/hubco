import { ReactNode } from "react";
import { Permission as PermissionType, AdminRole } from "../../types";
import { usePermission } from "../../hooks/usePermission";

interface PermissionProps {
  required: PermissionType | PermissionType[];
  mode?: "all" | "any"; // 需要满足所有权限还是任一权限
  children: ReactNode;
  fallback?: ReactNode;
}

export function Permission({
  required,
  mode = "all",
  children,
  fallback = null,
}: PermissionProps) {
  const { checkPermission, checkAnyPermission, checkAllPermissions } =
    usePermission();

  const permissions = Array.isArray(required) ? required : [required];

  let hasAccess = false;
  if (permissions.length === 1) {
    hasAccess = checkPermission(permissions[0]);
  } else if (mode === "any") {
    hasAccess = checkAnyPermission(permissions);
  } else {
    hasAccess = checkAllPermissions(permissions);
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// 基于角色的权限控制组件
interface RolePermissionProps {
  allowedRoles: AdminRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RolePermission({
  allowedRoles,
  children,
  fallback = null,
}: RolePermissionProps) {
  const { currentAdmin } = usePermission();

  if (!currentAdmin || !allowedRoles.includes(currentAdmin.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// 超级管理员专用组件
interface SuperAdminOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function SuperAdminOnly({ children, fallback = null }: SuperAdminOnlyProps) {
  const { isSuperAdmin } = usePermission();

  if (!isSuperAdmin()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// 可删除权限组件
interface CanDeleteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function CanDelete({ children, fallback = null }: CanDeleteProps) {
  const { canDelete } = usePermission();

  if (!canDelete()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// 可发布权限组件
interface CanPublishProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function CanPublish({ children, fallback = null }: CanPublishProps) {
  const { canPublish } = usePermission();

  if (!canPublish()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// 需要审批提示组件
interface ApprovalRequiredProps {
  children: ReactNode;
  action: string;
}

export function ApprovalRequired({ children, action }: ApprovalRequiredProps) {
  const { needsApproval } = usePermission();

  if (needsApproval()) {
    return (
      <div className="relative">
        <div className="absolute -top-2 -right-2 bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full border border-yellow-200">
          需审批
        </div>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}

// 权限受限提示组件
interface PermissionDeniedProps {
  message?: string;
  showIcon?: boolean;
}

export function PermissionDenied({
  message = "您没有权限执行此操作",
  showIcon = true,
}: PermissionDeniedProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-gray-500">
      {showIcon && (
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
      )}
      <p className="text-sm">{message}</p>
    </div>
  );
}
