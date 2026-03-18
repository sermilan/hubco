import { useState } from "react";
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
import {
  Users,
  UserPlus,
  Mail,
  Building2,
  GraduationCap,
  Crown,
  Shield,
  Edit,
  Trash2,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  userType: "个人" | "企业" | "院校";
  plan: "个人版" | "企业版" | "教育版";
  status: "active" | "trial" | "expired" | "suspended";
  registeredAt: string;
  expiresAt?: string;
  usage: {
    couAccess: number;
    scenariosCreated: number;
    apiCalls: number;
  };
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "张三",
      email: "zhangsan@example.com",
      userType: "个人",
      plan: "个人版",
      status: "active",
      registeredAt: "2024-01-15",
      usage: {
        couAccess: 234,
        scenariosCreated: 3,
        apiCalls: 0,
      },
    },
    {
      id: "2",
      name: "某科技有限公司",
      email: "admin@techcorp.com",
      userType: "企业",
      plan: "企业版",
      status: "active",
      registeredAt: "2023-12-01",
      expiresAt: "2024-12-01",
      usage: {
        couAccess: 5678,
        scenariosCreated: 45,
        apiCalls: 12340,
      },
    },
    {
      id: "3",
      name: "数据科学与工程学院",
      email: "ds@university.edu.cn",
      userType: "院校",
      plan: "教育版",
      status: "trial",
      registeredAt: "2024-02-10",
      expiresAt: "2024-02-24",
      usage: {
        couAccess: 890,
        scenariosCreated: 12,
        apiCalls: 230,
      },
    },
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // 筛选逻辑
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === "all" || user.plan === filterPlan;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;

    return matchesSearch && matchesPlan && matchesStatus;
  });

  const handleAddUser = () => {
    toast.success("用户添加成功");
    setIsAddDialogOpen(false);
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter((u) => u.id !== id));
    toast.success("用户已删除");
  };

  const getUserTypeIcon = (userType: User["userType"]) => {
    switch (userType) {
      case "个人":
        return <Users className="size-4" />;
      case "企业":
        return <Building2 className="size-4" />;
      case "院校":
        return <GraduationCap className="size-4" />;
    }
  };

  const getPlanBadge = (plan: User["plan"]) => {
    const styles = {
      个人版: "bg-gray-100 text-gray-700 border-gray-200",
      企业版: "bg-blue-100 text-blue-700 border-blue-200",
      教育版: "bg-purple-100 text-purple-700 border-purple-200",
    };
    const icons = {
      个人版: Users,
      企业版: Crown,
      教育版: GraduationCap,
    };
    const Icon = icons[plan];
    return (
      <Badge className={styles[plan]}>
        <Icon className="size-3 mr-1" />
        {plan}
      </Badge>
    );
  };

  const getStatusBadge = (status: User["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle2 className="size-3 mr-1" />
            正常
          </Badge>
        );
      case "trial":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <Clock className="size-3 mr-1" />
            试用中
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-orange-100 text-orange-700 border-orange-200">
            <XCircle className="size-3 mr-1" />
            已过期
          </Badge>
        );
      case "suspended":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="size-3 mr-1" />
            已暂停
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 工具栏 */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="搜索用户名称或邮箱..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:max-w-xs"
          />

          <Select value={filterPlan} onValueChange={setFilterPlan}>
            <SelectTrigger className="md:w-40">
              <SelectValue placeholder="订阅方案" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部方案</SelectItem>
              <SelectItem value="个人版">个人版</SelectItem>
              <SelectItem value="企业版">企业版</SelectItem>
              <SelectItem value="教育版">教育版</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="md:w-40">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="active">正常</SelectItem>
              <SelectItem value="trial">试用中</SelectItem>
              <SelectItem value="expired">已过期</SelectItem>
              <SelectItem value="suspended">已暂停</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm">
              <Download className="size-4 mr-2" />
              导出数据
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-cyan-600"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <UserPlus className="size-4 mr-2" />
              新增用户
            </Button>
          </div>
        </div>
      </Card>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">总用户数</div>
          <div className="text-2xl">{users.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">企业用户</div>
          <div className="text-2xl text-blue-600">
            {users.filter((u) => u.plan === "企业版").length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">试用用户</div>
          <div className="text-2xl text-orange-600">
            {users.filter((u) => u.status === "trial").length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">活跃用户</div>
          <div className="text-2xl text-green-600">
            {users.filter((u) => u.status === "active").length}
          </div>
        </Card>
      </div>

      {/* 用户列表 */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户信息</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>订阅方案</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>注册日期</TableHead>
              <TableHead>使用情况</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="size-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white">
                      {getUserTypeIcon(user.userType)}
                    </div>
                    <div>
                      <div className="mb-0.5">{user.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Mail className="size-3" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{user.userType}</Badge>
                </TableCell>
                <TableCell>{getPlanBadge(user.plan)}</TableCell>
                <TableCell>{getStatusBadge(user.status)}</TableCell>
                <TableCell className="text-sm">
                  <div>{user.registeredAt}</div>
                  {user.expiresAt && (
                    <div className="text-xs text-gray-500">
                      到期: {user.expiresAt}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-xs space-y-1">
                    <div className="text-gray-600">
                      COU访问: {user.usage.couAccess.toLocaleString()}
                    </div>
                    <div className="text-gray-600">
                      场景: {user.usage.scenariosCreated}
                    </div>
                    {user.usage.apiCalls > 0 && (
                      <div className="text-gray-600">
                        API: {user.usage.apiCalls.toLocaleString()}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="icon">
                      <Shield className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="size-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Users className="size-12 mx-auto mb-4 opacity-50" />
            <div>暂无符合条件的用户</div>
          </div>
        )}
      </Card>

      {/* 新增用户对话框 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>新增用户</DialogTitle>
            <DialogDescription>
              手动创建新用户账号并分配订阅方案
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>用户类型</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="选择用户类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="个人">个人用户</SelectItem>
                  <SelectItem value="企业">企业用户</SelectItem>
                  <SelectItem value="院校">院校用户</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>用户名称</Label>
                <Input placeholder="姓名或机构名称" />
              </div>
              <div>
                <Label>邮箱地址</Label>
                <Input type="email" placeholder="user@example.com" />
              </div>
            </div>

            <div>
              <Label>订阅方案</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="选择订阅方案" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="个人版">个人版（免费）</SelectItem>
                  <SelectItem value="企业版">企业版（¥2,999/月）</SelectItem>
                  <SelectItem value="教育版">教育版（¥9,999/年）</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>账号状态</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">正常</SelectItem>
                  <SelectItem value="trial">试用中（14天）</SelectItem>
                  <SelectItem value="suspended">暂停</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>注册日期</Label>
                <Input type="date" />
              </div>
              <div>
                <Label>到期日期（可选）</Label>
                <Input type="date" />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-900 mb-2">权限说明</div>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• 个人版：1,000个COU访问，5个场景</li>
                <li>• 企业版：无限COU，无限场景，API访问</li>
                <li>• 教育版：企业版全部功能 + 100个学生账号</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              取消
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-600 to-cyan-600"
              onClick={handleAddUser}
            >
              创建用户
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
