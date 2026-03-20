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

# 构建生产版本（使用真实后端API）
ARG VITE_API_BASE_URL=/api
ARG VITE_USE_MOCK_API=false
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_USE_MOCK_API=$VITE_USE_MOCK_API

RUN pnpm run build

# ==================== 运行阶段 ====================
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
