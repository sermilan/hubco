# 贡献指南 Contributing Guidelines

感谢您对 DataSec Hub 的关注！我们欢迎各种形式的贡献。

## 如何贡献

### 报告问题

1. 在提交 Issue 前，请先搜索是否已有类似问题
2. 使用 Issue 模板提供详细信息：
   - 问题描述
   - 复现步骤
   - 预期行为 vs 实际行为
   - 环境信息（浏览器、操作系统等）
   - 截图（如适用）

### 提交代码

1. **Fork 仓库** - 点击 GitHub 上的 Fork 按钮
2. **克隆您的 Fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/datasec-hub.git
   cd datasec-hub
   ```
3. **创建分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/issue-description
   ```
4. **安装依赖**
   ```bash
   npm install
   cd backend && npm install
   ```
5. **开发并测试**
   ```bash
   npm run dev      # 前端
   npm run build    # 确保构建成功
   ```
6. **提交更改**
   ```bash
   git add .
   git commit -m "feat: 添加新功能描述"
   ```
   遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：
   - `feat:` 新功能
   - `fix:` 修复问题
   - `docs:` 文档更新
   - `style:` 代码格式（不影响功能）
   - `refactor:` 重构
   - `test:` 测试相关
   - `chore:` 构建/工具相关

7. **推送到您的 Fork**
   ```bash
   git push origin feature/your-feature-name
   ```
8. **创建 Pull Request** - 在 GitHub 上提交 PR

### 代码规范

- **TypeScript**: 启用严格模式，避免使用 `any`
- **React**: 使用函数组件和 Hooks
- **样式**: 优先使用 Tailwind CSS 工具类
- **组件**: 遵循 shadcn/ui 设计模式
- **命名**: 使用 PascalCase 组件名，camelCase 变量/函数名

### 提交前检查清单

- [ ] 代码可以成功构建 (`npm run build`)
- [ ] 没有 TypeScript 错误
- [ ] 新功能有适当的类型定义
- [ ] 遵循项目的代码风格

## 开发环境设置

详见 [QUICK_START.md](./QUICK_START.md)

## 问题反馈

- GitHub Issues: [提交 Issue](https://github.com/YOUR_USERNAME/datasec-hub/issues)
- 邮件: contact@datasec-hub.com

## 行为准则

- 尊重所有参与者
- 接受建设性批评
- 关注什么对社区最有利
- 对其他社区成员表示同理心

---

感谢您的贡献！
