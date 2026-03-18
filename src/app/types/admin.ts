// ============ Admin RBAC Types ============

// 管理员角色
export enum AdminRole {
  SUPER_ADMIN = "super_admin",      // 超级管理员 - 所有权限
  ADMIN = "admin",                   // 管理员 - 日常管理
  OPERATOR = "operator",             // 运营人员 - 内容管理
  AUDITOR = "auditor",               // 审计员 - 只读+日志
  EDITOR = "editor",                 // 编辑 - 内容创建
}

// 角色显示信息
export const ROLE_DISPLAY_INFO: Record<AdminRole, { label: string; color: string; description: string }> = {
  [AdminRole.SUPER_ADMIN]: {
    label: "超级管理员",
    color: "purple",
    description: "拥有系统所有权限，可管理其他管理员",
  },
  [AdminRole.ADMIN]: {
    label: "管理员",
    color: "blue",
    description: "日常管理权限，可管理内容和用户",
  },
  [AdminRole.OPERATOR]: {
    label: "运营人员",
    color: "green",
    description: "内容运营权限，管理COU和政策内容",
  },
  [AdminRole.AUDITOR]: {
    label: "审计员",
    color: "gray",
    description: "只读权限，可查看所有数据和审计日志",
  },
  [AdminRole.EDITOR]: {
    label: "编辑",
    color: "orange",
    description: "内容创建权限，发布内容需审核",
  },
};

// 权限命名空间
export enum PermissionNamespace {
  USER = "user",
  POLICY = "policy",
  COU = "cou",
  SYSTEM = "system",
  AUDIT = "audit",
  ROLE = "role",
  APPROVAL = "approval",
}

// 权限动作
export enum PermissionAction {
  VIEW = "view",
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  PUBLISH = "publish",
  EXPORT = "export",
  IMPORT = "import",
  APPROVE = "approve",
  MANAGE = "manage",  // 特殊权限，通常包含所有操作
}

// 权限字符串格式: namespace:action (e.g., "user:create")
export type Permission = `${PermissionNamespace}:${PermissionAction}`;

// 所有可用权限列表
export const ALL_PERMISSIONS: Permission[] = [
  // 用户管理权限
  "user:view",
  "user:create",
  "user:update",
  "user:delete",
  "user:export",
  "user:manage",

  // 政策管理权限
  "policy:view",
  "policy:create",
  "policy:update",
  "policy:delete",
  "policy:publish",
  "policy:export",
  "policy:import",
  "policy:manage",

  // COU管理权限
  "cou:view",
  "cou:create",
  "cou:update",
  "cou:delete",
  "cou:publish",
  "cou:export",
  "cou:import",
  "cou:manage",

  // 系统设置权限
  "system:view",
  "system:update",
  "system:manage",

  // 审计日志权限
  "audit:view",
  "audit:export",
  "audit:manage",

  // 角色管理权限
  "role:view",
  "role:create",
  "role:update",
  "role:delete",
  "role:manage",

  // 审批权限
  "approval:view",
  "approval:approve",
  "approval:manage",
];

// 角色默认权限映射
export const ROLE_DEFAULT_PERMISSIONS: Record<AdminRole, Permission[]> = {
  [AdminRole.SUPER_ADMIN]: ALL_PERMISSIONS,

  [AdminRole.ADMIN]: [
    "user:view",
    "user:create",
    "user:update",
    "user:delete",
    "user:export",
    "policy:view",
    "policy:create",
    "policy:update",
    "policy:delete",
    "policy:publish",
    "policy:export",
    "policy:import",
    "cou:view",
    "cou:create",
    "cou:update",
    "cou:delete",
    "cou:publish",
    "cou:export",
    "cou:import",
    "system:view",
    "system:update",
    "audit:view",
    "audit:export",
    "role:view",
    "approval:view",
    "approval:approve",
  ],

  [AdminRole.OPERATOR]: [
    "user:view",
    "policy:view",
    "policy:create",
    "policy:update",
    "cou:view",
    "cou:create",
    "cou:update",
    "cou:delete",
    "cou:export",
    "audit:view",
    "approval:view",
  ],

  [AdminRole.AUDITOR]: [
    "user:view",
    "policy:view",
    "cou:view",
    "system:view",
    "audit:view",
    "audit:export",
    "role:view",
    "approval:view",
  ],

  [AdminRole.EDITOR]: [
    "policy:view",
    "policy:create",
    "policy:update",
    "cou:view",
    "cou:create",
    "cou:update",
    "audit:view",
    "approval:view",
  ],
};

// ============ Admin User Types ============

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: AdminRole;
  permissions: Permission[];  // 可自定义的额外权限
  status: "active" | "inactive" | "suspended";
  lastLoginAt?: string;
  lastLoginIp?: string;
  createdAt: string;
  createdBy?: string;  // 创建者ID
  updatedAt: string;
  twoFactorEnabled?: boolean;
  department?: string;
  phone?: string;
}

// ============ Audit Log Types ============

export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  PUBLISH = "PUBLISH",
  EXPORT = "EXPORT",
  IMPORT = "IMPORT",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  APPROVE = "APPROVE",
  REJECT = "REJECT",
  VIEW = "VIEW",
}

export enum AuditTargetType {
  POLICY = "POLICY",
  COU = "COU",
  USER = "USER",
  SYSTEM = "SYSTEM",
  ROLE = "ROLE",
  APPROVAL = "APPROVAL",
  ADMIN_USER = "ADMIN_USER",
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: AdminRole;
  action: AuditAction;
  targetType: AuditTargetType;
  targetId: string;
  targetName: string;
  details: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    changes?: Array<{
      field: string;
      oldValue: unknown;
      newValue: unknown;
    }>;
    metadata?: Record<string, unknown>;
  };
  ipAddress: string;
  userAgent: string;
  sessionId?: string;
  success: boolean;
  errorMessage?: string;
}

// ============ Approval Workflow Types ============

export enum ApprovalStatus {
  DRAFT = "draft",
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  PENDING_REVISION = "pending_revision",
}

export enum ApprovalType {
  POLICY_PUBLISH = "policy_publish",
  COU_UPDATE = "cou_update",
  USER_STATUS_CHANGE = "user_status_change",
  BULK_OPERATION = "bulk_operation",
  SYSTEM_CONFIG = "system_config",
}

export interface ApprovalRequest {
  id: string;
  type: ApprovalType;
  status: ApprovalStatus;
  title: string;
  description?: string;
  submitterId: string;
  submitterName: string;
  submittedAt: string;
  reviewerId?: string;
  reviewerName?: string;
  reviewedAt?: string;
  reviewComment?: string;
  targetId: string;
  targetName: string;
  changes: {
    before: Record<string, unknown>;
    after: Record<string, unknown>;
  };
  priority: "low" | "medium" | "high" | "urgent";
  dueDate?: string;
}

// ============ Role Definition Type ============

export interface RoleDefinition {
  id: string;
  role: AdminRole;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;  // 系统预设角色不可删除
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  userCount: number;
}

// ============ Helper Functions ============

// 检查权限
export function hasPermission(
  user: AdminUser | null | undefined,
  permission: Permission
): boolean {
  if (!user) return false;
  if (user.role === AdminRole.SUPER_ADMIN) return true;

  // 获取角色的默认权限
  const rolePermissions = ROLE_DEFAULT_PERMISSIONS[user.role] || [];

  // 合并用户的自定义权限
  const allPermissions = new Set([...rolePermissions, ...user.permissions]);

  return allPermissions.has(permission);
}

// 检查多个权限（任一满足）
export function hasAnyPermission(
  user: AdminUser | null | undefined,
  permissions: Permission[]
): boolean {
  return permissions.some((p) => hasPermission(user, p));
}

// 检查多个权限（全部满足）
export function hasAllPermissions(
  user: AdminUser | null | undefined,
  permissions: Permission[]
): boolean {
  return permissions.every((p) => hasPermission(user, p));
}

// 获取用户的所有权限
export function getUserPermissions(user: AdminUser): Permission[] {
  if (user.role === AdminRole.SUPER_ADMIN) return ALL_PERMISSIONS;

  const rolePermissions = ROLE_DEFAULT_PERMISSIONS[user.role] || [];
  const allPermissions = new Set([...rolePermissions, ...user.permissions]);

  return Array.from(allPermissions);
}

// 解析权限字符串
export function parsePermission(permission: Permission): {
  namespace: PermissionNamespace;
  action: PermissionAction;
} {
  const [namespace, action] = permission.split(":") as [
    PermissionNamespace,
    PermissionAction
  ];
  return { namespace, action };
}

// 构建权限字符串
export function buildPermission(
  namespace: PermissionNamespace,
  action: PermissionAction
): Permission {
  return `${namespace}:${action}`;
}
