#!/bin/bash
set -e

# =============================================
# DataSec Hub 一键部署脚本
# 使用方法: bash deploy.sh
# =============================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[INFO]${NC}  $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "=================================================="
echo "   DataSec Hub - 数据安全合规知识服务平台"
echo "   一键部署脚本 v1.0"
echo "=================================================="
echo ""

# -------- 1. 检查 Docker --------
log_info "检查 Docker 环境..."
if ! command -v docker &>/dev/null; then
    log_error "未检测到 Docker，请先安装 Docker："
    echo "  curl -fsSL https://get.docker.com | bash"
    exit 1
fi
if ! docker compose version &>/dev/null && ! docker-compose version &>/dev/null; then
    log_error "未检测到 Docker Compose，请先安装。"
    exit 1
fi
log_info "Docker 环境正常 ($(docker --version))"

# -------- 2. 生成后端 .env --------
BACKEND_ENV="./backend/.env"
if [ ! -f "$BACKEND_ENV" ]; then
    log_info "生成后端环境变量配置..."
    cp ./backend/.env.example "$BACKEND_ENV"

    # 自动生成随机 JWT 密钥
    JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || cat /proc/sys/kernel/random/uuid | tr -d '-')
    JWT_REFRESH_SECRET=$(openssl rand -hex 32 2>/dev/null || cat /proc/sys/kernel/random/uuid | tr -d '-')
    sed -i "s/your-secret-key-change-in-production/$JWT_SECRET/" "$BACKEND_ENV"
    sed -i "s/your-refresh-secret-change-in-production/$JWT_REFRESH_SECRET/" "$BACKEND_ENV"

    log_info "已生成 $BACKEND_ENV（JWT密钥已随机生成）"
    log_warn "如需配置AI功能，请编辑 $BACKEND_ENV 填入对应API Key"
else
    log_info "后端 .env 已存在，跳过生成"
fi

# -------- 3. 选择部署模式 --------
echo ""
echo "请选择部署模式："
echo "  1) 完整模式 - 前端 + 后端 + 基础设施（推荐用于生产）"
echo "  2) 仅基础设施 - 仅启动 PostgreSQL + Redis + Elasticsearch（用于本地开发）"
echo ""
read -rp "请输入选项 [1/2，默认1]: " MODE
MODE=${MODE:-1}

# -------- 4. 启动服务 --------
COMPOSE_CMD="docker compose"
command -v "docker compose" &>/dev/null || COMPOSE_CMD="docker-compose"

case $MODE in
    2)
        log_info "启动基础设施服务..."
        $COMPOSE_CMD -f backend/docker-compose.yml up -d
        echo ""
        log_info "基础设施已启动："
        echo "  PostgreSQL:     localhost:5432"
        echo "  Redis:          localhost:6379"
        echo "  Elasticsearch:  localhost:9200"
        echo ""
        log_info "接下来本地启动后端："
        echo "  cd backend && pnpm install && pnpm start:dev"
        log_info "接下来本地启动前端："
        echo "  pnpm install && pnpm dev"
        ;;
    *)
        log_info "构建并启动所有服务（首次构建约需 5-10 分钟）..."
        $COMPOSE_CMD up -d --build

        echo ""
        log_info "等待服务就绪..."
        sleep 10

        # 检查服务状态
        echo ""
        log_info "服务状态："
        $COMPOSE_CMD ps

        # 获取本机 IP
        HOST_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "YOUR_SERVER_IP")

        echo ""
        echo "=================================================="
        echo -e "${GREEN}  部署完成！${NC}"
        echo "=================================================="
        echo ""
        echo "  前端地址:   http://$HOST_IP"
        echo "  后端API:    http://$HOST_IP/api"
        echo "  API文档:    http://localhost:3000/api/docs"
        echo ""
        echo "  管理命令："
        echo "    查看日志:   docker compose logs -f"
        echo "    停止服务:   docker compose down"
        echo "    重启服务:   docker compose restart"
        echo ""
        ;;
esac
