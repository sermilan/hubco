import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Checkbox } from "../components/ui/checkbox";
import {
  Shield,
  Mail,
  Lock,
  User,
  Building2,
  Phone,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface AuthPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function AuthPage({ onBack, onSuccess }: AuthPageProps) {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [orgType, setOrgType] = useState<"individual" | "enterprise" | "education">(
    "individual"
  );

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("登录成功");
    onSuccess();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("注册成功，开始14天免费试用");
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 size-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 size-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左侧信息 */}
        <div className="hidden lg:flex flex-col justify-center text-white">
          <Button
            variant="ghost"
            className="self-start mb-8 text-blue-300 hover:text-blue-200"
            onClick={onBack}
          >
            <ArrowLeft className="mr-2 size-4" />
            返回首页
          </Button>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Shield className="size-8 text-white" />
              </div>
              <div>
                <div className="text-2xl">DataSec Hub</div>
                <div className="text-blue-300">数据安全合规知识库</div>
              </div>
            </div>

            <h1 className="text-4xl mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              专业的合规知识服务
            </h1>
            <p className="text-blue-200 text-lg mb-8">
              为企业、个人、院校提供全方位的数据安全合规解决方案
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                icon: CheckCircle2,
                title: "500+ 政策文件",
                description: "全量覆盖法律、法规、标准及指南",
              },
              {
                icon: CheckCircle2,
                title: "10,000+ 合规单元",
                description: "结构化COU，精准定位每项义务",
              },
              {
                icon: CheckCircle2,
                title: "智能场景构建",
                description: "基于标签和权重的自动化推荐",
              },
              {
                icon: CheckCircle2,
                title: "14天免费试用",
                description: "注册即可体验全部功能",
              },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <item.icon className="size-6 text-blue-400 flex-shrink-0" />
                <div>
                  <div className="text-white mb-1">{item.title}</div>
                  <div className="text-sm text-blue-300">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧表单 */}
        <Card className="bg-slate-800/80 backdrop-blur-xl border-blue-500/30 p-8">
          <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as any)}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">登录</TabsTrigger>
              <TabsTrigger value="register">注册</TabsTrigger>
            </TabsList>

            {/* 登录表单 */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <Label htmlFor="login-email" className="text-white mb-2">
                    邮箱地址
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-blue-400" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      className="pl-10 bg-slate-900/50 border-blue-500/30 text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="login-password" className="text-white mb-2">
                    密码
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-blue-400" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 bg-slate-900/50 border-blue-500/30 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox id="remember" />
                    <label
                      htmlFor="remember"
                      className="text-sm text-blue-300 cursor-pointer"
                    >
                      记住我
                    </label>
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    忘记密码？
                  </Button>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  登录
                </Button>

                <div className="text-center text-sm text-blue-300">
                  还没有账号？
                  <Button
                    type="button"
                    variant="link"
                    className="text-blue-400 hover:text-blue-300 p-1"
                    onClick={() => setAuthMode("register")}
                  >
                    立即注册
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* 注册表单 */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-6">
                {/* 账号类型选择 */}
                <div>
                  <Label className="text-white mb-3">账号类型</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "individual", label: "个人", icon: User },
                      { value: "enterprise", label: "企业", icon: Building2 },
                      { value: "education", label: "院校", icon: Shield },
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setOrgType(type.value as any)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          orgType === type.value
                            ? "border-blue-500 bg-blue-500/20"
                            : "border-blue-500/30 bg-slate-900/50 hover:border-blue-500/50"
                        }`}
                      >
                        <type.icon
                          className={`size-6 mx-auto mb-2 ${
                            orgType === type.value ? "text-blue-400" : "text-blue-500"
                          }`}
                        />
                        <div
                          className={`text-sm ${
                            orgType === type.value ? "text-white" : "text-blue-300"
                          }`}
                        >
                          {type.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 基础信息 */}
                <div>
                  <Label htmlFor="register-email" className="text-white mb-2">
                    邮箱地址
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-blue-400" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="your@email.com"
                      className="pl-10 bg-slate-900/50 border-blue-500/30 text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="register-name" className="text-white mb-2">
                    {orgType === "individual" ? "姓名" : "机构名称"}
                  </Label>
                  <div className="relative">
                    {orgType === "individual" ? (
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-blue-400" />
                    ) : (
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-blue-400" />
                    )}
                    <Input
                      id="register-name"
                      type="text"
                      placeholder={
                        orgType === "individual" ? "张三" : "某某科技有限公司"
                      }
                      className="pl-10 bg-slate-900/50 border-blue-500/30 text-white"
                      required
                    />
                  </div>
                </div>

                {orgType !== "individual" && (
                  <div>
                    <Label htmlFor="register-phone" className="text-white mb-2">
                      联系电话
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-blue-400" />
                      <Input
                        id="register-phone"
                        type="tel"
                        placeholder="138-0000-0000"
                        className="pl-10 bg-slate-900/50 border-blue-500/30 text-white"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="register-password" className="text-white mb-2">
                    设置密码
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-blue-400" />
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="至少8位，包含字母和数字"
                      className="pl-10 bg-slate-900/50 border-blue-500/30 text-white"
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox id="terms" required />
                  <label htmlFor="terms" className="text-sm text-blue-300">
                    我已阅读并同意
                    <Button
                      type="button"
                      variant="link"
                      className="text-blue-400 hover:text-blue-300 h-auto p-0 ml-1"
                    >
                      服务条款
                    </Button>
                    和
                    <Button
                      type="button"
                      variant="link"
                      className="text-blue-400 hover:text-blue-300 h-auto p-0 ml-1"
                    >
                      隐私政策
                    </Button>
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  注册并开始14天免费试用
                </Button>

                <div className="text-center text-sm text-blue-300">
                  已有账号？
                  <Button
                    type="button"
                    variant="link"
                    className="text-blue-400 hover:text-blue-300 p-1"
                    onClick={() => setAuthMode("login")}
                  >
                    立即登录
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>

          {/* 提示信息 */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-300 text-center">
              🎉 注册即享14天免费试用，无需信用卡
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
