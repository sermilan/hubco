# ==================== 构建阶段 ====================
FROM node:20-alpine AS builder

# 安装 pnpm
RUN npm install -g pnpm@9

WORKDIR /app

# 优先复制依赖文件，利用 Docker 层缓存
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# 复制源码并构建
COPY . .

RUN pnpm run build

# ==================== 运行阶段 ====================
FROM node:20-alpine AS runner

RUN npm install -g pnpm@9

WORKDIR /app

# 只安装生产依赖
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# 复制构建产物
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]
