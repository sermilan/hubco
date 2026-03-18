import { useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Settings,
  Save,
  Plus,
  Edit,
  Trash2,
  Tag,
  TrendingUp,
  Database,
  Bell,
  Shield,
  Key,
} from "lucide-react";
import { APIConfigManager } from "./APIConfigManager";
import { toast } from "sonner";
import { PolicyLevel, POLICY_LEVEL_WEIGHTS, TagCategory } from "../../types";

interface TagItem {
  id: string;
  name: string;
  category: TagCategory;
  color: string;
  weight: number;
}

export function SystemSettings() {
  const [tags, setTags] = useState<TagItem[]>([
    { id: "1", name: "数据安全", category: "法律", color: "red", weight: 10 },
    { id: "2", name: "个人信息", category: "法律", color: "orange", weight: 10 },
    { id: "3", name: "加密技术", category: "技术", color: "blue", weight: 7 },
    { id: "4", name: "访问控制", category: "技术", color: "cyan", weight: 8 },
    { id: "5", name: "组织架构", category: "管理", color: "purple", weight: 6 },
  ]);

  const [systemConfig, setSystemConfig] = useState({
    siteName: "DataSec Hub",
    allowRegistration: true,
    requireEmailVerification: true,
    trialDays: 14,
    maxFreeCOUs: 1000,
    maxFreeScenarios: 5,
    enableAIFeatures: true,
    enableAPIAccess: true,
  });

  const handleSaveConfig = () => {
    toast.success("系统设置已保存");
  };

  const handleDeleteTag = (id: string) => {
    setTags(tags.filter((t) => t.id !== id));
    toast.success("标签已删除");
  };

  const getCategoryColor = (category: TagCategory) => {
    const colors: Record<TagCategory, string> = {
      法律: "bg-red-100 text-red-700 border-red-200",
      技术: "bg-blue-100 text-blue-700 border-blue-200",
      管理: "bg-purple-100 text-purple-700 border-purple-200",
      行业: "bg-green-100 text-green-700 border-green-200",
      场景: "bg-orange-100 text-orange-700 border-orange-200",
    };
    return colors[category];
  };

  return (
    <Tabs defaultValue="weights" className="space-y-6">
      <TabsList>
        <TabsTrigger value="weights">
          <TrendingUp className="size-4 mr-2" />
          权重配置
        </TabsTrigger>
        <TabsTrigger value="tags">
          <Tag className="size-4 mr-2" />
          标签字典
        </TabsTrigger>
        <TabsTrigger value="api">
          <Key className="size-4 mr-2" />
          API配置
        </TabsTrigger>
        <TabsTrigger value="general">
          <Settings className="size-4 mr-2" />
          通用设置
        </TabsTrigger>
        <TabsTrigger value="notifications">
          <Bell className="size-4 mr-2" />
          通知设置
        </TabsTrigger>
      </TabsList>

      {/* 权重配置 */}
      <TabsContent value="weights" className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="mb-1">政策级别权重配置</h3>
              <p className="text-sm text-gray-600">
                配置不同政策级别的基础权重值（1-10）
              </p>
            </div>
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-cyan-600"
              onClick={handleSaveConfig}
            >
              <Save className="size-4 mr-2" />
              保存配置
            </Button>
          </div>

          <div className="space-y-4">
            {Object.entries(POLICY_LEVEL_WEIGHTS).map(([level, weight]) => (
              <div
                key={level}
                className="flex items-center justify-between p-4 border rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="size-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-xl">
                    {weight}
                  </div>
                  <div>
                    <div className="mb-1">{level}</div>
                    <div className="text-sm text-gray-600">
                      {level === "法律" && "国家最高立法机关制定"}
                      {level === "行政法规" && "国务院制定"}
                      {level === "部门规章" && "部委规章制度"}
                      {level === "国家标准" && "国家标准化管理委员会发布"}
                      {level === "行业标准" && "行业主管部门发布"}
                      {level === "地方性法规" && "地方人大制定"}
                      {level === "指南指引" && "行业指导性文件"}
                    </div>
                  </div>
                </div>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  defaultValue={weight}
                  className="w-20"
                />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4">场景权重计算规则</h3>
          <div className="space-y-4">
            <div>
              <Label>标签匹配度权重</Label>
              <div className="flex items-center gap-4 mt-2">
                <Input type="number" defaultValue="0.5" step="0.1" className="w-32" />
                <span className="text-sm text-gray-600">
                  每个匹配标签增加的权重值
                </span>
              </div>
            </div>

            <div>
              <Label>行业匹配权重</Label>
              <div className="flex items-center gap-4 mt-2">
                <Input type="number" defaultValue="1.0" step="0.1" className="w-32" />
                <span className="text-sm text-gray-600">
                  行业完全匹配时增加的权重
                </span>
              </div>
            </div>

            <div>
              <Label>区域匹配权重</Label>
              <div className="flex items-center gap-4 mt-2">
                <Input type="number" defaultValue="0.8" step="0.1" className="w-32" />
                <span className="text-sm text-gray-600">
                  区域完全匹配时增加的权重
                </span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-900 mb-2">计算公式</div>
              <code className="text-xs text-blue-700">
                最终权重 = 基础权重 + (标签匹配数 × 标签权重) + 行业匹配权重 + 区域匹配权重
              </code>
            </div>
          </div>
        </Card>
      </TabsContent>

      {/* 标签字典 */}
      <TabsContent value="tags" className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="mb-1">标签字典管理</h3>
              <p className="text-sm text-gray-600">
                管理系统标签库，用于COU分类和场景匹配
              </p>
            </div>
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              <Plus className="size-4 mr-2" />
              新增标签
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>标签名称</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>颜色</TableHead>
                <TableHead>权重</TableHead>
                <TableHead>使用次数</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell>
                    <Badge
                      style={{
                        backgroundColor: `var(--${tag.color}-100)`,
                        color: `var(--${tag.color}-700)`,
                        borderColor: `var(--${tag.color}-200)`,
                      }}
                    >
                      {tag.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(tag.category)}>
                      {tag.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="size-6 rounded"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-sm text-gray-600">{tag.color}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="size-4 text-blue-600" />
                      <span>{tag.weight}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {Math.floor(Math.random() * 500)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="icon">
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTag(tag.id)}
                      >
                        <Trash2 className="size-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {["法律", "技术", "管理", "行业", "场景"].map((category) => (
            <Card key={category} className="p-4">
              <div className="text-sm text-gray-600 mb-1">{category}标签</div>
              <div className="text-2xl">
                {tags.filter((t) => t.category === category).length}
              </div>
            </Card>
          ))}
        </div>
      </TabsContent>

      {/* 通用设置 */}
      <TabsContent value="general" className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3>系统基本设置</h3>
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-cyan-600"
              onClick={handleSaveConfig}
            >
              <Save className="size-4 mr-2" />
              保存设置
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <Label>站点名称</Label>
              <Input
                value={systemConfig.siteName}
                onChange={(e) =>
                  setSystemConfig({ ...systemConfig, siteName: e.target.value })
                }
                className="max-w-md"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="mb-1">允许用户注册</div>
                  <div className="text-sm text-gray-600">
                    开启后用户可以自行注册账号
                  </div>
                </div>
                <Switch
                  checked={systemConfig.allowRegistration}
                  onCheckedChange={(checked) =>
                    setSystemConfig({ ...systemConfig, allowRegistration: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="mb-1">邮箱验证</div>
                  <div className="text-sm text-gray-600">
                    要求用户验证邮箱后才能使用
                  </div>
                </div>
                <Switch
                  checked={systemConfig.requireEmailVerification}
                  onCheckedChange={(checked) =>
                    setSystemConfig({
                      ...systemConfig,
                      requireEmailVerification: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="mb-1">AI 功能</div>
                  <div className="text-sm text-gray-600">
                    启用 AI 智能分析和提取功能
                  </div>
                </div>
                <Switch
                  checked={systemConfig.enableAIFeatures}
                  onCheckedChange={(checked) =>
                    setSystemConfig({ ...systemConfig, enableAIFeatures: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="mb-1">API 访问</div>
                  <div className="text-sm text-gray-600">
                    允许企业用户通过 API 访问数据
                  </div>
                </div>
                <Switch
                  checked={systemConfig.enableAPIAccess}
                  onCheckedChange={(checked) =>
                    setSystemConfig({ ...systemConfig, enableAPIAccess: checked })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>免费试用天数</Label>
                <Input
                  type="number"
                  value={systemConfig.trialDays}
                  onChange={(e) =>
                    setSystemConfig({
                      ...systemConfig,
                      trialDays: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label>个人版 COU 访问上限</Label>
                <Input
                  type="number"
                  value={systemConfig.maxFreeCOUs}
                  onChange={(e) =>
                    setSystemConfig({
                      ...systemConfig,
                      maxFreeCOUs: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label>个人版场景数量上限</Label>
              <Input
                type="number"
                value={systemConfig.maxFreeScenarios}
                onChange={(e) =>
                  setSystemConfig({
                    ...systemConfig,
                    maxFreeScenarios: parseInt(e.target.value),
                  })
                }
                className="max-w-md"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4">数据管理</h3>
          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <Database className="size-4 mr-2" />
              数据库备份
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Database className="size-4 mr-2" />
              数据导入/导出
            </Button>
            <Button variant="outline" className="w-full justify-start text-red-600">
              <Trash2 className="size-4 mr-2" />
              清除缓存
            </Button>
          </div>
        </Card>
      </TabsContent>

      {/* 通知设置 */}
      <TabsContent value="notifications" className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3>通知与提醒设置</h3>
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-cyan-600"
              onClick={handleSaveConfig}
            >
              <Save className="size-4 mr-2" />
              保存设置
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="mb-1">政策更新通知</div>
                <div className="text-sm text-gray-600">
                  当有新政策发布或更新时通知用户
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="mb-1">订阅到期提醒</div>
                <div className="text-sm text-gray-600">
                  在订阅到期前 7 天提醒用户续费
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="mb-1">系统维护通知</div>
                <div className="text-sm text-gray-600">
                  系统维护前通知所有用户
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="mb-1">邮件通知</div>
                <div className="text-sm text-gray-600">
                  通过邮件发送重要通知
                </div>
              </div>
              <Switch />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4">邮件服务器配置</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>SMTP 服务器</Label>
                <Input placeholder="smtp.example.com" />
              </div>
              <div>
                <Label>端口</Label>
                <Input placeholder="587" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>用户名</Label>
                <Input placeholder="noreply@datasechub.com" />
              </div>
              <div>
                <Label>密码</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
            </div>

            <div>
              <Label>发件人名称</Label>
              <Input placeholder="DataSec Hub" />
            </div>

            <Button variant="outline">测试邮件配置</Button>
          </div>
        </Card>
      </TabsContent>

      {/* API配置 */}
      <TabsContent value="api" className="space-y-6">
        <APIConfigManager />
      </TabsContent>
    </Tabs>
  );
}
