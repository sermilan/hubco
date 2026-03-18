import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import {
  Shield,
  Search,
  Zap,
  Database,
  TrendingUp,
  Users,
  Award,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Lock,
  Globe,
  Sparkles,
  BookOpen,
  Target,
} from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const features = [
    {
      icon: Database,
      title: "全量政策库",
      description: "覆盖所有层级的数据安全法规、政策、标准及指南",
      stats: "500+ 政策文件",
    },
    {
      icon: Search,
      title: "智能检索",
      description: "AI驱动的语义搜索，精准定位合规义务",
      stats: "毫秒级响应",
    },
    {
      icon: Target,
      title: "COU合规单元",
      description: "结构化合规义务单元，清晰明确每项要求",
      stats: "10,000+ COU",
    },
    {
      icon: Sparkles,
      title: "场景构建",
      description: "基于标签和权重的智能场景组合推荐",
      stats: "50+ 预设场景",
    },
    {
      icon: BarChart3,
      title: "权重分析",
      description: "科学的权重体系，助力合规优先级排序",
      stats: "动态权重计算",
    },
    {
      icon: Globe,
      title: "国际合规",
      description: "支持国内及GDPR、CCPA等国际法规",
      stats: "多区域覆盖",
    },
  ];

  const useCases = [
    {
      title: "游戏出海合规",
      description: "一站式解决游戏企业出海欧盟的数据合规要求",
      tags: ["GDPR", "数据出境", "个人信息保护"],
      industry: "游戏",
    },
    {
      title: "金融数据安全",
      description: "金融机构全方位数据安全合规指引",
      tags: ["等级保护", "数据分级", "关基保护"],
      industry: "金融",
    },
    {
      title: "医疗健康合规",
      description: "医疗数据处理的完整合规解决方案",
      tags: ["敏感信息", "数据安全", "隐私保护"],
      industry: "医疗",
    },
  ];

  const pricingPlans = [
    {
      name: "个人版",
      price: "免费",
      description: "适合个人学习和研究",
      features: [
        "全量政策库访问（500+ 政策）",
        "智能语义检索",
        "COU合规单元浏览（10,000+）",
        "6个预设场景模板",
        "基础权重分析",
        "个人场景收藏",
      ],
      cta: "立即使用",
      popular: false,
    },
    {
      name: "企业版",
      price: "免费",
      description: "适合中小企业合规团队",
      features: [
        "个人版全部功能",
        "多用户协作管理",
        "场景构建器（无限场景）",
        "条款权重编辑与追踪",
        "批量COU管理",
        "合规报告导出",
      ],
      cta: "开始使用",
      popular: true,
    },
    {
      name: "教育版",
      price: "免费",
      description: "适合高职院校教学实训",
      features: [
        "企业版全部功能",
        "多班级账号管理",
        "教学场景案例库",
        "实训任务配置",
        "学生学习进度追踪",
        "教学资料分享",
      ],
      cta: "申请开通",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900">
      {/* 顶部导航 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-blue-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Shield className="size-6 text-white" />
              </div>
              <div>
                <div className="text-white text-lg">DataSec Hub</div>
                <div className="text-xs text-blue-300">数据安全合规知识库</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                className="text-white hover:text-blue-300"
                onClick={onLogin}
              >
                登录
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                onClick={onGetStarted}
              >
                免费开始
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-blue-500/30">
            🚀 AI驱动的合规知识服务平台
          </Badge>

          <h1 className="text-5xl md:text-7xl mb-6 bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
            让数据安全合规
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text">
              更简单、更智能
            </span>
          </h1>

          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            全量政策库 · COU合规单元 · 智能场景构建 · 权重分析系统
            <br />
            为企业、个人、院校提供专业的数据安全合规解决方案
          </p>

          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-lg h-12 px-8"
              onClick={onGetStarted}
            >
              免费开始
              <ArrowRight className="ml-2 size-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-blue-400 text-blue-300 hover:bg-blue-500/10 text-lg h-12 px-8"
            >
              观看演示
            </Button>
          </div>

          {/* 数据统计 */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { label: "政策文件", value: "500+", icon: BookOpen },
              { label: "合规单元", value: "10,000+", icon: Target },
              { label: "企业用户", value: "1,000+", icon: Users },
              { label: "场景模板", value: "50+", icon: Sparkles },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-slate-800/50 backdrop-blur border border-blue-500/20 rounded-xl p-6"
              >
                <stat.icon className="size-8 text-blue-400 mx-auto mb-3" />
                <div className="text-3xl text-white mb-1">{stat.value}</div>
                <div className="text-sm text-blue-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 核心功能 */}
      <section className="py-20 px-6 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-500/30">
              核心功能
            </Badge>
            <h2 className="text-4xl text-white mb-4">
              全方位的合规知识服务
            </h2>
            <p className="text-blue-200 text-lg">
              从政策检索到场景构建，为您提供完整的合规解决方案
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <Card
                key={idx}
                className="bg-slate-800/50 backdrop-blur border-blue-500/20 p-6 hover:border-blue-400/40 transition-all"
              >
                <div className="size-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="size-6 text-blue-400" />
                </div>
                <h3 className="text-xl text-white mb-2">{feature.title}</h3>
                <p className="text-blue-200 mb-4">{feature.description}</p>
                <Badge variant="outline" className="border-blue-500/30 text-blue-300">
                  {feature.stats}
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 应用场景 */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-500/30">
              应用场景
            </Badge>
            <h2 className="text-4xl text-white mb-4">
              覆盖多行业合规需求
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {useCases.map((useCase, idx) => (
              <Card
                key={idx}
                className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 backdrop-blur border-blue-500/20 p-6 hover:border-blue-400/40 transition-all group cursor-pointer"
              >
                <Badge className="mb-4 bg-blue-500/20 text-blue-300">
                  {useCase.industry}
                </Badge>
                <h3 className="text-xl text-white mb-3 group-hover:text-blue-300 transition-colors">
                  {useCase.title}
                </h3>
                <p className="text-blue-200 mb-4">{useCase.description}</p>
                <div className="flex flex-wrap gap-2">
                  {useCase.tags.map((tag, tagIdx) => (
                    <Badge
                      key={tagIdx}
                      variant="outline"
                      className="border-blue-500/30 text-blue-300 text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 订阅方案 */}
      <section className="py-20 px-6 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-500/30">
              完全免费
            </Badge>
            <h2 className="text-4xl text-white mb-4">
              选择适合您的版本
            </h2>
            <p className="text-blue-200 text-lg">
              个人学习、企业合规、教学实训 - 全部免费开放
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {pricingPlans.map((plan, idx) => (
              <Card
                key={idx}
                className={`p-8 ${
                  plan.popular
                    ? "bg-gradient-to-br from-blue-600/30 to-cyan-600/30 border-blue-400/50 scale-105"
                    : "bg-slate-800/50 border-blue-500/20"
                } backdrop-blur transition-all hover:scale-105`}
              >
                {plan.popular && (
                  <Badge className="mb-4 bg-blue-500 text-white">最受欢迎</Badge>
                )}
                <h3 className="text-2xl text-white mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl text-white">{plan.price}</span>
                </div>
                <p className="text-blue-200 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIdx) => (
                    <li
                      key={featureIdx}
                      className="flex items-start gap-2 text-blue-100"
                    >
                      <CheckCircle2 className="size-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                      : "bg-slate-700 hover:bg-slate-600"
                  }`}
                  onClick={onGetStarted}
                >
                  {plan.cta}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur border border-blue-500/30 rounded-2xl p-12">
            <h2 className="text-4xl text-white mb-4">
              开始您的合规之旅
            </h2>
            <p className="text-blue-200 text-lg mb-8">
              加入1000+企业，让数据安全合规更简单
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-lg h-12 px-8"
              onClick={onGetStarted}
            >
              免费开始使用
              <ArrowRight className="ml-2 size-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-blue-500/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="size-6 text-blue-400" />
                <span className="text-white">DataSec Hub</span>
              </div>
              <p className="text-blue-300 text-sm">
                专业的数据安全合规知识服务平台
              </p>
            </div>

            <div>
              <h4 className="text-white mb-4">产品</h4>
              <ul className="space-y-2 text-blue-300 text-sm">
                <li>政策检索</li>
                <li>COU合规单元</li>
                <li>场景构建</li>
                <li>API服务</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white mb-4">解决方案</h4>
              <ul className="space-y-2 text-blue-300 text-sm">
                <li>企业合规</li>
                <li>出海合规</li>
                <li>教学实训</li>
                <li>咨询服务</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white mb-4">联系我们</h4>
              <ul className="space-y-2 text-blue-300 text-sm">
                <li>邮箱：contact@datasec-hub.com</li>
                <li>电话：400-123-4567</li>
                <li>地址：安徽 · 芜湖</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-blue-500/20 text-center text-blue-400 text-sm">
            © 2024 DataSec Hub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
