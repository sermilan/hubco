import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { ScrollArea } from "../ui/scroll-area";
import { Code, BookOpen, TestTube } from "lucide-react";
import {
  Key,
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Globe,
  Shield,
  Clock,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

// 对外API类型
interface ExternalAPI {
  id: string;
  name: string;
  key: string;
  secret: string;
  status: "active" | "suspended" | "revoked";
  permissions: DataPermission[];
  rateLimit: number;
  createdAt: string;
  lastUsedAt?: string;
  usageCount: number;
  allowedIps?: string[];
  expiresAt?: string;
}

// API端点参数
interface ApiParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example?: unknown;
}

// API端点定义
interface ApiEndpointDef {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  category: string;
  description: string;
  permissions: DataPermission[];
  parameters: ApiParameter[];
  requestBody?: Record<string, unknown>;
  responseBody: Record<string, unknown>;
  example: {
    request: {
      url?: string;
      body?: Record<string, unknown>;
    };
    response: Record<string, unknown>;
  };
}

type DataPermission = "policy:read" | "clause:read" | "cou:read" | "search" | "export";

interface APIUsageStats {
  totalCalls: number;
  todayCalls: number;
  averageResponseTime: number;
  errorRate: number;
}

interface APIEndpoint {
  method: "GET" | "POST";
  path: string;
  description: string;
  permissions: DataPermission[];
  example?: string;
}

const PERMISSION_LABELS: Record<DataPermission, { label: string; desc: string }> = {
  "policy:read": { label: "政策读取", desc: "获取政策列表和详情" },
  "clause:read": { label: "条款读取", desc: "获取条款内容和权重" },
  "cou:read": { label: "COU读取", desc: "获取合规义务单元数据" },
  "search": { label: "全文搜索", desc: "使用搜索接口查询数据" },
  "export": { label: "数据导出", desc: "批量导出政策/COU数据" },
};

const API_ENDPOINTS: APIEndpoint[] = [
  {
    method: "GET",
    path: "/api/v1/policies",
    description: "获取政策列表（支持分页、筛选）",
    permissions: ["policy:read"],
    example: `curl -H "X-API-Key: your_key" \\\n  -H "X-API-Secret: your_secret" \\\n  "https://api.datasechub.com/v1/policies?keyword=数据安全&page=1&limit=20"`,
  },
  {
    method: "GET",
    path: "/api/v1/policies/:id",
    description: "获取政策详情",
    permissions: ["policy:read"],
    example: `curl -H "X-API-Key: your_key" \\\n  "https://api.datasechub.com/v1/policies/123"`,
  },
  {
    method: "GET",
    path: "/api/v1/policies/:id/clauses",
    description: "获取政策下的所有条款",
    permissions: ["clause:read"],
    example: `curl -H "X-API-Key: your_key" \\\n  "https://api.datasechub.com/v1/policies/123/clauses"`,
  },
  {
    method: "GET",
    path: "/api/v1/clauses/:id",
    description: "获取条款详情",
    permissions: ["clause:read"],
  },
  {
    method: "GET",
    path: "/api/v1/cous",
    description: "获取COU列表（支持权重筛选）",
    permissions: ["cou:read"],
    example: `curl -H "X-API-Key: your_key" \\\n  "https://api.datasechub.com/v1/cous?weightMin=8&industry=金融"`,
  },
  {
    method: "GET",
    path: "/api/v1/cous/:id",
    description: "获取COU详情",
    permissions: ["cou:read"],
  },
  {
    method: "GET",
    path: "/api/v1/search",
    description: "全文搜索（跨政策、条款、COU）",
    permissions: ["search"],
    example: `curl -H "X-API-Key: your_key" \\\n  "https://api.datasechub.com/v1/search?q=个人信息保护&type=policy,cou"`,
  },
  {
    method: "POST",
    path: "/api/v1/export/policies",
    description: "批量导出政策数据",
    permissions: ["export"],
  },
  {
    method: "POST",
    path: "/api/v1/export/cous",
    description: "批量导出COU数据",
    permissions: ["export"],
  },
];

// 完整的API端点定义数据（融合自前台ApiDocumentation）
const FULL_API_ENDPOINTS: ApiEndpointDef[] = [
  {
    method: "GET",
    path: "/api/v1/policies",
    category: "政策管理",
    description: "获取政策列表，支持分页、筛选、关键词搜索",
    permissions: ["policy:read"],
    parameters: [
      { name: "page", type: "integer", required: false, description: "页码，默认1", example: 1 },
      { name: "limit", type: "integer", required: false, description: "每页数量，默认20", example: 20 },
      { name: "keyword", type: "string", required: false, description: "关键词搜索", example: "数据安全" },
      { name: "level", type: "string", required: false, description: "政策级别筛选", example: "法律" },
      { name: "industry", type: "string", required: false, description: "行业筛选", example: "金融" },
    ],
    responseBody: { success: true, data: { items: [], total: 523, page: 1, limit: 20 } },
    example: {
      request: { url: "/api/v1/policies?keyword=数据安全&page=1&limit=20" },
      response: { success: true, data: { items: [{ id: "policy-001", title: "数据安全法" }], total: 523, page: 1, limit: 20 } },
    },
  },
  {
    method: "GET",
    path: "/api/v1/policies/:id",
    category: "政策管理",
    description: "获取单个政策详情",
    permissions: ["policy:read"],
    parameters: [{ name: "id", type: "string", required: true, description: "政策ID" }],
    responseBody: { success: true, data: { id: "policy-001", title: "数据安全法" } },
    example: {
      request: { url: "/api/v1/policies/policy-001" },
      response: { success: true, data: { id: "policy-001", title: "数据安全法", level: "法律" } },
    },
  },
  {
    method: "GET",
    path: "/api/v1/policies/:id/clauses",
    category: "政策管理",
    description: "获取政策下的所有条款",
    permissions: ["clause:read"],
    parameters: [{ name: "id", type: "string", required: true, description: "政策ID" }],
    responseBody: { success: true, data: { items: [], total: 55 } },
    example: {
      request: { url: "/api/v1/policies/policy-001/clauses" },
      response: { success: true, data: { items: [{ id: "clause-001", content: "..." }], total: 55 } },
    },
  },
  {
    method: "GET",
    path: "/api/v1/clauses/:id",
    category: "条款管理",
    description: "获取单个条款详情",
    permissions: ["clause:read"],
    parameters: [{ name: "id", type: "string", required: true, description: "条款ID" }],
    responseBody: { success: true, data: { id: "clause-001", content: "" } },
    example: { request: { url: "/api/v1/clauses/clause-001" }, response: { success: true, data: { id: "clause-001" } } },
  },
  {
    method: "GET",
    path: "/api/v1/cous",
    category: "COU管理",
    description: "获取COU列表，支持权重范围筛选",
    permissions: ["cou:read"],
    parameters: [
      { name: "page", type: "integer", required: false, description: "页码", example: 1 },
      { name: "limit", type: "integer", required: false, description: "每页数量", example: 20 },
      { name: "weightMin", type: "number", required: false, description: "最小权重", example: 8 },
      { name: "weightMax", type: "number", required: false, description: "最大权重", example: 10 },
    ],
    responseBody: { success: true, data: { items: [], total: 10247 } },
    example: { request: { url: "/api/v1/cous?weightMin=8" }, response: { success: true, data: { items: [], total: 10247 } } },
  },
  {
    method: "GET",
    path: "/api/v1/cous/:id",
    category: "COU管理",
    description: "获取单个COU详情",
    permissions: ["cou:read"],
    parameters: [{ name: "id", type: "string", required: true, description: "COU ID" }],
    responseBody: { success: true, data: { id: "cou-001", title: "" } },
    example: { request: { url: "/api/v1/cous/cou-001" }, response: { success: true, data: { id: "cou-001" } } },
  },
  {
    method: "GET",
    path: "/api/v1/cous/:id/related",
    category: "COU管理",
    description: "获取相关COU",
    permissions: ["cou:read"],
    parameters: [
      { name: "id", type: "string", required: true, description: "COU ID" },
      { name: "limit", type: "integer", required: false, description: "返回数量", example: 5 },
    ],
    responseBody: { success: true, data: [] },
    example: { request: { url: "/api/v1/cous/cou-001/related?limit=5" }, response: { success: true, data: [] } },
  },
  {
    method: "GET",
    path: "/api/v1/search",
    category: "搜索服务",
    description: "全文搜索",
    permissions: ["search"],
    parameters: [
      { name: "q", type: "string", required: true, description: "搜索关键词" },
      { name: "type", type: "string", required: false, description: "搜索类型" },
    ],
    responseBody: { success: true, data: { items: [], total: 0 } },
    example: { request: { url: "/api/v1/search?q=关键词" }, response: { success: true, data: { items: [] } } },
  },
  {
    method: "GET",
    path: "/api/v1/search/suggest",
    category: "搜索服务",
    description: "搜索建议",
    permissions: ["search"],
    parameters: [
      { name: "q", type: "string", required: true, description: "关键词" },
      { name: "size", type: "integer", required: false, description: "返回数量", example: 10 },
    ],
    responseBody: { success: true, data: [] },
    example: { request: { url: "/api/v1/search/suggest?q=数据" }, response: { success: true, data: ["数据安全"] } },
  },
  {
    method: "POST",
    path: "/api/v1/export/policies",
    category: "数据导出",
    description: "批量导出政策数据",
    permissions: ["export"],
    parameters: [],
    requestBody: { ids: [], format: "excel" },
    responseBody: { success: true, data: { downloadUrl: "" } },
    example: { request: { url: "/api/v1/export/policies", body: { ids: [], format: "excel" } }, response: { success: true, data: { downloadUrl: "" } } },
  },
  {
    method: "POST",
    path: "/api/v1/export/cous",
    category: "数据导出",
    description: "批量导出COU数据",
    permissions: ["export"],
    parameters: [],
    requestBody: { ids: [], format: "excel" },
    responseBody: { success: true, data: { downloadUrl: "" } },
    example: { request: { url: "/api/v1/export/cous", body: { ids: [], format: "excel" } }, response: { success: true, data: { downloadUrl: "" } } },
  },
];

// Mock数据
const MOCK_APIS: ExternalAPI[] = [
  {
    id: "api-1",
    name: "企业客户A - 生产环境",
    key: "pk_live_51HYsAMPLE123456789",
    secret: "sk_live_secret_a1b2c3d4e5f6",
    status: "active",
    permissions: ["policy:read", "clause:read", "cou:read", "search"],
    rateLimit: 1000,
    createdAt: "2024-01-15T08:30:00Z",
    lastUsedAt: "2024-03-18T10:23:00Z",
    usageCount: 12580,
    allowedIps: ["192.168.1.0/24"],
  },
  {
    id: "api-2",
    name: "企业客户B - 测试环境",
    key: "pk_test_51HYsAMPLE987654321",
    secret: "sk_test_secret_z9y8x7w6v5",
    status: "active",
    permissions: ["policy:read", "cou:read", "search"],
    rateLimit: 100,
    createdAt: "2024-02-20T14:15:00Z",
    lastUsedAt: "2024-03-17T16:45:00Z",
    usageCount: 345,
  },
  {
    id: "api-3",
    name: "合作伙伴C",
    key: "pk_live_51HYsAMPLE555666777",
    secret: "sk_live_secret_p9o8i7u6y5",
    status: "suspended",
    permissions: ["policy:read"],
    rateLimit: 500,
    createdAt: "2024-01-10T09:00:00Z",
    usageCount: 892,
  },
];

export function APIConfigManager() {
  const [apis, setApis] = useState<ExternalAPI[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [newlyCreatedApi, setNewlyCreatedApi] = useState<ExternalAPI | null>(null);
  const [showSecret, setShowSecret] = useState(false);

  // 创建表单状态
  const [newApiName, setNewApiName] = useState("");
  const [newApiPermissions, setNewApiPermissions] = useState<DataPermission[]>(["policy:read"]);
  const [newApiRateLimit, setNewApiRateLimit] = useState("1000");
  const [newApiAllowedIps, setNewApiAllowedIps] = useState("");
  const [creating, setCreating] = useState(false);

  // API文档Tab状态
  const [activeTab, setActiveTab] = useState<"keys" | "docs">("keys");
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpointDef | null>(null);
  const [docViewTab, setDocViewTab] = useState<"params" | "example" | "response">("params");

  // 获取分类列表
  const categories = Array.from(new Set(FULL_API_ENDPOINTS.map((e) => e.category)));

  // 统计
  const [stats, setStats] = useState<APIUsageStats>({
    totalCalls: 13817,
    todayCalls: 456,
    averageResponseTime: 45,
    errorRate: 0.2,
  });

  // 加载API列表
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setApis(MOCK_APIS);
      setLoading(false);
    }, 500);
  }, []);

  // 创建API密钥
  const handleCreateApi = async () => {
    if (!newApiName.trim()) {
      toast.error("请输入API名称");
      return;
    }
    setCreating(true);
    setTimeout(() => {
      const newApi: ExternalAPI = {
        id: `api-${Date.now()}`,
        name: newApiName,
        key: `pk_live_${Math.random().toString(36).substring(2, 15)}`,
        secret: `sk_live_${Math.random().toString(36).substring(2, 20)}`,
        status: "active",
        permissions: newApiPermissions,
        rateLimit: parseInt(newApiRateLimit) || 1000,
        createdAt: new Date().toISOString(),
        usageCount: 0,
        allowedIps: newApiAllowedIps ? newApiAllowedIps.split(",").map(ip => ip.trim()) : undefined,
      };
      setApis([newApi, ...apis]);
      setNewlyCreatedApi(newApi);
      setCreating(false);
      setShowCreateDialog(false);
      setShowKeyDialog(true);
      // 重置表单
      setNewApiName("");
      setNewApiPermissions(["policy:read"]);
      setNewApiRateLimit("1000");
      setNewApiAllowedIps("");
      toast.success("API密钥创建成功");
    }, 800);
  };

  // 删除API
  const handleDeleteApi = (id: string) => {
    if (!confirm("确定要删除此API密钥吗？此操作不可恢复。")) return;
    setApis(apis.filter(api => api.id !== id));
    toast.success("API密钥已删除");
  };

  // 切换API状态
  const handleToggleStatus = (id: string) => {
    setApis(apis.map(api => {
      if (api.id === id) {
        return {
          ...api,
          status: api.status === "active" ? "suspended" : "active",
        };
      }
      return api;
    }));
    toast.success("状态已更新");
  };

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("已复制到剪贴板");
  };

  // 格式化日期
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "从未使用";
    return new Date(dateStr).toLocaleString("zh-CN");
  };

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Globe className="size-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{apis.length}</div>
              <div className="text-sm text-gray-600">API密钥总数</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-green-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="size-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.todayCalls.toLocaleString()}</div>
              <div className="text-sm text-gray-600">今日调用</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="size-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.averageResponseTime}ms</div>
              <div className="text-sm text-gray-600">平均响应时间</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Shield className="size-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.errorRate}%</div>
              <div className="text-sm text-gray-600">错误率</div>
            </div>
          </div>
        </Card>
      </div>

      {/* API密钥列表 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">API密钥管理</h3>
            <p className="text-sm text-gray-600">
              管理对外数据访问API密钥，控制政策、条款、COU数据的访问权限
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600">
                <Plus className="size-4 mr-2" />
                创建API密钥
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>创建对外数据API密钥</DialogTitle>
                <DialogDescription>
                  为外部客户或合作伙伴创建API访问密钥，配置数据访问权限和限流策略
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="api-name">API名称</Label>
                  <Input
                    id="api-name"
                    placeholder="例如：企业客户A - 生产环境"
                    value={newApiName}
                    onChange={(e) => setNewApiName(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label className="mb-2 block">数据访问权限</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {(Object.keys(PERMISSION_LABELS) as DataPermission[]).map((perm) => (
                      <label
                        key={perm}
                        className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          checked={newApiPermissions.includes(perm)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewApiPermissions([...newApiPermissions, perm]);
                            } else {
                              setNewApiPermissions(newApiPermissions.filter(p => p !== perm));
                            }
                          }}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{PERMISSION_LABELS[perm].label}</div>
                          <div className="text-sm text-gray-500">{PERMISSION_LABELS[perm].desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="rate-limit">限流配置（次/小时）</Label>
                  <Select value={newApiRateLimit} onValueChange={setNewApiRateLimit}>
                    <SelectTrigger id="rate-limit" className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100次/小时（测试环境）</SelectItem>
                      <SelectItem value="1000">1000次/小时（标准）</SelectItem>
                      <SelectItem value="5000">5000次/小时（高级）</SelectItem>
                      <SelectItem value="10000">10000次/小时（企业）</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="allowed-ips">IP白名单（可选）</Label>
                  <Input
                    id="allowed-ips"
                    placeholder="例如：192.168.1.0/24, 10.0.0.1（多个IP用逗号分隔）"
                    value={newApiAllowedIps}
                    onChange={(e) => setNewApiAllowedIps(e.target.value)}
                    className="mt-1.5"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    留空表示允许所有IP访问
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  取消
                </Button>
                <Button
                  onClick={handleCreateApi}
                  disabled={creating || !newApiName.trim()}
                  className="bg-blue-600"
                >
                  {creating && <Loader2 className="size-4 mr-2 animate-spin" />}
                  创建密钥
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {apis.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>权限</TableHead>
                  <TableHead>限流</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>调用次数</TableHead>
                  <TableHead>最后使用</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apis.map((api) => (
                  <TableRow key={api.id}>
                    <TableCell>
                      <div className="font-medium">{api.name}</div>
                      <div className="text-xs text-gray-500 font-mono">
                        {api.key.substring(0, 20)}...
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {api.permissions.map((perm) => (
                          <Badge key={perm} variant="secondary" className="text-xs">
                            {PERMISSION_LABELS[perm].label}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{api.rateLimit}/小时</TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleToggleStatus(api.id)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          api.status === "active"
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : api.status === "suspended"
                            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        {api.status === "active" ? "活跃" : api.status === "suspended" ? "已暂停" : "已撤销"}
                      </button>
                    </TableCell>
                    <TableCell>{api.usageCount.toLocaleString()}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(api.lastUsedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setNewlyCreatedApi(api);
                            setShowKeyDialog(true);
                          }}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteApi(api.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg bg-slate-50">
            <Key className="size-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">暂无API密钥</p>
            <p className="text-sm text-gray-400 mt-1">点击"创建API密钥"开始配置对外数据访问</p>
          </div>
        )}
      </Card>

      {/* API文档 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">API接口文档</h3>
        <Accordion type="single" collapsible className="w-full">
          {API_ENDPOINTS.map((endpoint, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`}>
              <AccordionTrigger>
                <div className="flex items-center gap-3 text-left">
                  <Badge
                    variant={endpoint.method === "GET" ? "default" : "secondary"}
                    className={endpoint.method === "GET" ? "bg-blue-600" : "bg-orange-600"}
                  >
                    {endpoint.method}
                  </Badge>
                  <code className="text-sm">{endpoint.path}</code>
                  <span className="text-sm text-gray-600 font-normal">{endpoint.description}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-4 border-l-2 border-gray-200 space-y-3">
                  <div>
                    <div className="text-sm font-medium mb-1">所需权限</div>
                    <div className="flex gap-2">
                      {endpoint.permissions.map((perm) => (
                        <Badge key={perm} variant="outline" className="text-xs">
                          {PERMISSION_LABELS[perm].label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {endpoint.example && (
                    <div>
                      <div className="text-sm font-medium mb-1">请求示例</div>
                      <pre className="bg-slate-900 text-slate-50 p-3 rounded-lg text-xs overflow-x-auto">
                        <code>{endpoint.example}</code>
                      </pre>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>

      {/* 显示密钥对话框 */}
      <Dialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="size-5 text-blue-600" />
              API密钥信息
            </DialogTitle>
            <DialogDescription>
              请妥善保管以下信息，Secret仅在创建时显示一次
            </DialogDescription>
          </DialogHeader>
          {newlyCreatedApi && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-900">{newlyCreatedApi.name}</div>
                <div className="text-xs text-blue-700 mt-1">
                  创建于 {formatDate(newlyCreatedApi.createdAt)}
                </div>
              </div>
              <div>
                <Label>API Key</Label>
                <div className="flex gap-2 mt-1.5">
                  <code className="flex-1 p-3 bg-slate-100 rounded-lg text-sm font-mono break-all">
                    {newlyCreatedApi.key}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(newlyCreatedApi.key)}
                  >
                    <Copy className="size-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label>API Secret</Label>
                <div className="flex gap-2 mt-1.5">
                  <code className="flex-1 p-3 bg-slate-100 rounded-lg text-sm font-mono break-all">
                    {showSecret ? newlyCreatedApi.secret : "••••••••••••••••••••••••"}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowSecret(!showSecret)}
                  >
                    {showSecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(newlyCreatedApi.secret)}
                  >
                    <Copy className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="size-4 text-amber-600 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <div className="font-medium">安全提示</div>
                    <div className="mt-1">
                      请勿在客户端暴露Secret，建议在服务端调用API。如密钥泄露，请立即撤销并重新创建。
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowKeyDialog(false)} className="bg-blue-600">
              <CheckCircle className="size-4 mr-2" />
              我已保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
