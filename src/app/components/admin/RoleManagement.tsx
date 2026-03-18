import { useState, useMemo } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import {
  Shield,
  Users,
  UserPlus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Crown,
  Eye,
  Search,
  ChevronRight,
  ChevronDown,
  Lock,
  Unlock,
} from "lucide-react";
import { toast } from "sonner";
import {
  AdminRole,
  ROLE_DISPLAY_INFO,
  AdminUser,
  RoleDefinition,
  Permission,
  PermissionNamespace,
  PermissionAction,
  ALL_PERMISSIONS,
} from "../../types";
import { MOCK_ADMIN_USERS, MOCK_ROLE_DEFINITIONS } from "../../data/mockData";
import { usePermission } from "../../hooks/usePermission";
import { Permission as PermissionGuard } from "./Permission";

// 权限分组配置
const PERMISSION_GROUPS = [
  {
    namespace: PermissionNamespace.USER,
    label: "用户管理",
    icon: Users,
    actions: [
      { action: PermissionAction.VIEW, label: "查看" },
      { action: PermissionAction.CREATE, label: "创建" },
      { action: PermissionAction.UPDATE, label: "修改" },
      { action: PermissionAction.DELETE, label: "删除" },
      { action: PermissionAction.EXPORT, label: "导出" },
    ],
  },
  {
    namespace: PermissionNamespace.POLICY,
    label: "政策管理",
    icon: Shield,
    actions: [
      { action: PermissionAction.VIEW, label: "查看" },
      { action: PermissionAction.CREATE, label: "创建" },
      { action: PermissionAction.UPDATE, label: "修改" },
      { action: PermissionAction.DELETE, label: "删除" },
      { action: PermissionAction.PUBLISH, label: "发布" },
      { action: PermissionAction.EXPORT, label: "导出" },
      { action: PermissionAction.IMPORT, label: "导入" },
    ],
  },
  {
    namespace: PermissionNamespace.COU,
    label: "COU管理",
    icon: CheckCircle2,
    actions: [
      { action: PermissionAction.VIEW, label: "查看" },
      { action: PermissionAction.CREATE, label: "创建" },
      { action: PermissionAction.UPDATE, label: "修改" },
      { action: PermissionAction.DELETE, label: "删除" },
      { action: PermissionAction.PUBLISH, label: "发布" },
      { action: PermissionAction.EXPORT, label: "导出" },
      { action: PermissionAction.IMPORT, label: "导入" },
    ],
  },
  {
    namespace: PermissionNamespace.ROLE,
    label: "角色管理",
    icon: Crown,
    actions: [
      { action: PermissionAction.VIEW, label: "查看" },
      { action: PermissionAction.CREATE, label: "创建" },
      { action: PermissionAction.UPDATE, label: "修改" },
      { action: PermissionAction.DELETE, label: "删除" },
    ],
  },
  {
    namespace: PermissionNamespace.AUDIT,
    label: "审计日志",
    icon: Eye,
    actions: [
      { action: PermissionAction.VIEW, label: "查看" },
      { action: PermissionAction.EXPORT, label: "导出" },
    ],
  },
  {
    namespace: PermissionNamespace.SYSTEM,
    label: "系统设置",
    icon: Lock,
    actions: [
      { action: PermissionAction.VIEW, label: "查看" },
      { action: PermissionAction.UPDATE, label: "修改" },
    ],
  },
  {
    namespace: PermissionNamespace.APPROVAL,
    label: "审批管理",
    icon: Unlock,
    actions: [
      { action: PermissionAction.VIEW, label: "查看" },
      { action: PermissionAction.APPROVE, label: "审批" },
    ],
  },
];

export function RoleManagement() {
  const { currentAdmin, isSuperAdmin } = usePermission();
  const [roles, setRoles] = useState<RoleDefinition[]>(MOCK_ROLE_DEFINITIONS);
  const [admins, setAdmins] = useState<AdminUser[]>(MOCK_ADMIN_USERS);
  const [activeTab, setActiveTab] = useState("roles");

  // 角色编辑状态
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    permissions: [] as Permission[],
  });
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  // 管理员编辑状态
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [adminSearchTerm, setAdminSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // 筛选管理员
  const filteredAdmins = useMemo(() => {
    return admins.filter((admin) => {
      const matchesSearch =
        admin.name.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(adminSearchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || admin.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [admins, adminSearchTerm, roleFilter]);

  // 打开角色编辑对话框
  const handleEditRole = (role: RoleDefinition) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions],
    });
    setExpandedGroups([]);
    setIsRoleDialogOpen(true);
  };

  // 保存角色
  const handleSaveRole = () => {
    if (editingRole) {
      setRoles(
        roles.map((r) =>
          r.id === editingRole.id
            ? { ...r, ...roleForm, updatedAt: new Date().toISOString() }
            : r
        )
      );
      toast.success("角色权限已更新");
      setIsRoleDialogOpen(false);
    }
  };

  // 删除角色
  const handleDeleteRole = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    if (role?.isSystem) {
      toast.error("系统预设角色不可删除");
      return;
    }
    setRoles(roles.filter((r) => r.id !== roleId));
    toast.success("角色已删除");
  };

  // 切换权限
  const togglePermission = (permission: Permission) => {
    setRoleForm((prev) => {
      const hasPermission = prev.permissions.includes(permission);
      if (hasPermission) {
        return {
          ...prev,
          permissions: prev.permissions.filter((p) => p !== permission),
        };
      } else {
        return {
          ...prev,
          permissions: [...prev.permissions, permission],
        };
      }
    });
  };

  // 切换分组展开
  const toggleGroup = (namespace: string) => {
    setExpandedGroups((prev) =>
      prev.includes(namespace)
        ? prev.filter((n) => n !== namespace)
        : [...prev, namespace]
    );
  };

  // 选择分组所有权限
  const selectGroupPermissions = (namespace: PermissionNamespace, select: boolean) => {
    const group = PERMISSION_GROUPS.find((g) => g.namespace === namespace);
    if (!group) return;

    const groupPermissions = group.actions.map(
      (a) => `${namespace}:${a.action}` as Permission
    );

    setRoleForm((prev) => {
      if (select) {
        // 添加该组所有权限
        const newPermissions = new Set([...prev.permissions, ...groupPermissions]);
        return { ...prev, permissions: Array.from(newPermissions) };
      } else {
        // 移除该组所有权限
        return {
          ...prev,
          permissions: prev.permissions.filter((p) => !groupPermissions.includes(p)),
        };
      }
    });
  };

  // 获取角色颜色
  const getRoleColor = (role: AdminRole) => {
    const colors: Record<AdminRole, string> = {
      [AdminRole.SUPER_ADMIN]:
        "bg-purple-100 text-purple-700 border-purple-200",
      [AdminRole.ADMIN]: "bg-blue-100 text-blue-700 border-blue-200",
      [AdminRole.OPERATOR]: "bg-green-100 text-green-700 border-green-200",
      [AdminRole.AUDITOR]: "bg-gray-100 text-gray-700 border-gray-200",
      [AdminRole.EDITOR]: "bg-orange-100 text-orange-700 border-orange-200",
    };
    return colors[role];
  };

  // 获取状态徽章
  const getStatusBadge = (status: AdminUser["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle2 className="size-3 mr-1" />
            正常
          </Badge>
        );
      case "inactive":
        return (
          <Badge variant="outline" className="text-gray-600">
            <XCircle className="size-3 mr-1" />
            未激活
          </Badge>
        );
      case "suspended":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <Lock className="size-3 mr-1" />
            已暂停
          </Badge>
        );
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList>
        <TabsTrigger value="roles">
          <Shield className="size-4 mr-2" />
          角色权限
        </TabsTrigger>
        <TabsTrigger value="admins">
          <Users className="size-4 mr-2" />
          管理员账号
        </TabsTrigger>
      </TabsList>

      {/* 角色权限管理 */}
      <TabsContent value="roles" className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="mb-1">角色权限配置</h3>
              <p className="text-sm text-gray-600">
                管理系统角色和对应的权限设置
              </p>
            </div>
            <PermissionGuard required="role:create">
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600">
                <Shield className="size-4 mr-2" />
                新增角色
              </Button>
            </PermissionGuard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <Card key={role.id} className="p-4 border hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(
                      role.role
                    )}`}
                  >
                    {role.name}
                  </div>
                  {role.isSystem && (
                    <Badge variant="outline" className="text-xs">
                      系统
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {role.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{role.userCount} 位成员</span>
                  <span>{role.permissions.length} 项权限</span>
                </div>

                <div className="flex gap-2">
                  <PermissionGuard required="role:update">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEditRole(role)}
                    >
                      <Edit className="size-4 mr-1" />
                      配置权限
                    </Button>
                  </PermissionGuard>
                  <PermissionGuard required="role:delete">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={role.isSystem}
                      onClick={() => handleDeleteRole(role.id)}
                    >
                      <Trash2 className="size-4 text-red-500" />
                    </Button>
                  </PermissionGuard>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* 权限矩阵说明 */}
        <Card className="p-6">
          <h3 className="mb-4">权限说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="font-medium">超级管理员</span>
                <span className="text-gray-500">- 所有权限</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="font-medium">管理员</span>
                <span className="text-gray-500">- 日常管理权限</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="font-medium">运营人员</span>
                <span className="text-gray-500">- 内容管理权限</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="font-medium">编辑</span>
                <span className="text-gray-500">- 内容创建（需审批）</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-500" />
                <span className="font-medium">审计员</span>
                <span className="text-gray-500">- 只读+日志权限</span>
              </div>
            </div>
          </div>
        </Card>
      </TabsContent>

      {/* 管理员账号管理 */}
      <TabsContent value="admins" className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="搜索管理员名称或邮箱..."
                value={adminSearchTerm}
                onChange={(e) => setAdminSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background"
            >
              <option value="all">全部角色</option>
              {Object.values(AdminRole).map((role) => (
                <option key={role} value={role}>
                  {ROLE_DISPLAY_INFO[role].label}
                </option>
              ))}
            </select>

            <PermissionGuard required="role:update">
              <Button
                className="bg-gradient-to-r from-blue-600 to-cyan-600 ml-auto"
                onClick={() => {
                  setEditingAdmin(null);
                  setIsAdminDialogOpen(true);
                }}
              >
                <UserPlus className="size-4 mr-2" />
                添加管理员
              </Button>
            </PermissionGuard>
          </div>
        </Card>

        {/* 管理员列表 */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>管理员</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>部门</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>最后登录</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={admin.avatar}
                        alt={admin.name}
                        className="w-10 h-10 rounded-full bg-gray-100"
                      />
                      <div>
                        <div className="font-medium">{admin.name}</div>
                        <div className="text-xs text-gray-500">{admin.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(admin.role)}>
                      {ROLE_DISPLAY_INFO[admin.role].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {admin.department || "-"}
                  </TableCell>
                  <TableCell>{getStatusBadge(admin.status)}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {admin.lastLoginAt
                      ? new Date(admin.lastLoginAt).toLocaleString("zh-CN", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "从未登录"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <PermissionGuard required="role:update">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingAdmin(admin);
                            setIsAdminDialogOpen(true);
                          }}
                        >
                          <Edit className="size-4" />
                        </Button>
                      </PermissionGuard>
                      <PermissionGuard required="role:delete">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={admin.id === currentAdmin?.id}
                          onClick={() => {
                            setAdmins(admins.filter((a) => a.id !== admin.id));
                            toast.success("管理员已删除");
                          }}
                        >
                          <Trash2
                            className={`size-4 ${
                              admin.id === currentAdmin?.id
                                ? "text-gray-300"
                                : "text-red-500"
                            }`}
                          />
                        </Button>
                      </PermissionGuard>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredAdmins.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Users className="size-12 mx-auto mb-4 opacity-50" />
              <div>暂无符合条件的管理员</div>
            </div>
          )}
        </Card>
      </TabsContent>

      {/* 角色权限编辑对话框 */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>配置角色权限 - {editingRole?.name}</DialogTitle>
            <DialogDescription>勾选该角色拥有的权限项</DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>角色名称</Label>
                  <Input
                    value={roleForm.name}
                    onChange={(e) =>
                      setRoleForm({ ...roleForm, name: e.target.value })
                    }
                    disabled={editingRole?.isSystem}
                  />
                </div>
                <div>
                  <Label>角色标识</Label>
                  <Input value={editingRole?.role} disabled />
                </div>
              </div>

              <div>
                <Label>角色描述</Label>
                <Input
                  value={roleForm.description}
                  onChange={(e) =>
                    setRoleForm({ ...roleForm, description: e.target.value })
                  }
                />
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>权限配置</Label>
                  <span className="text-sm text-gray-500">
                    已选择 {roleForm.permissions.length} 项权限
                  </span>
                </div>

                <div className="space-y-2">
                  {PERMISSION_GROUPS.map((group) => {
                    const Icon = group.icon;
                    const isExpanded = expandedGroups.includes(group.namespace);
                    const groupPermissions = group.actions.map(
                      (a) => `${group.namespace}:${a.action}` as Permission
                    );
                    const selectedCount = groupPermissions.filter((p) =>
                      roleForm.permissions.includes(p)
                    ).length;
                    const allSelected =
                      selectedCount === groupPermissions.length;
                    const someSelected =
                      selectedCount > 0 && selectedCount < groupPermissions.length;

                    return (
                      <div
                        key={group.namespace}
                        className="border rounded-lg overflow-hidden"
                      >
                        <div
                          className="flex items-center gap-3 p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                          onClick={() => toggleGroup(group.namespace)}
                        >
                          {isExpanded ? (
                            <ChevronDown className="size-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="size-4 text-gray-500" />
                          )}
                          <Icon className="size-5 text-gray-600" />
                          <span className="font-medium flex-1">{group.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {selectedCount}/{groupPermissions.length}
                            </span>
                            <Checkbox
                              checked={allSelected}
                              ref={(el) => {
                                if (el) {
                                  (el as HTMLInputElement).indeterminate = someSelected;
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                              onCheckedChange={(checked) =>
                                selectGroupPermissions(
                                  group.namespace,
                                  checked as boolean
                                )
                              }
                            />
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="p-3 space-y-2 border-t">
                            {group.actions.map((action) => {
                              const permission = `${group.namespace}:${action.action}` as Permission;
                              return (
                                <label
                                  key={permission}
                                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                                >
                                  <Checkbox
                                    checked={roleForm.permissions.includes(permission)}
                                    onCheckedChange={() => togglePermission(permission)}
                                  />
                                  <span className="text-sm">{action.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              取消
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-600 to-cyan-600"
              onClick={handleSaveRole}
            >
              保存配置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}
