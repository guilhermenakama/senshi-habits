#!/bin/bash

# Script de deploy para Docker Swarm
set -e

echo "🚀 Iniciando deploy do Senshi Habits..."

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Build das imagens
echo -e "${BLUE}📦 Fazendo build das imagens...${NC}"
docker build -t senshi-habits-backend:latest -f backend/Dockerfile.prod backend/
docker build -t senshi-habits-nginx:latest nginx/

# 2. Parar containers standalone se existirem
echo -e "${BLUE}🛑 Parando containers standalone...${NC}"
docker stop senshi-backend senshi-nginx 2>/dev/null || true
docker rm senshi-backend senshi-nginx 2>/dev/null || true

# 3. Carregar variáveis de ambiente
echo -e "${BLUE}🔐 Carregando variáveis de ambiente...${NC}"
export $(grep -v '^#' backend/.env | xargs)

# 4. Deploy da stack
echo -e "${BLUE}🚢 Fazendo deploy da stack...${NC}"
docker stack deploy -c docker-compose.stack.yml senshi-habits

# 5. Aguardar serviços ficarem prontos
echo -e "${BLUE}⏳ Aguardando serviços ficarem prontos...${NC}"
sleep 10

# 6. Verificar status
echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo ""
echo "Status dos serviços:"
docker stack services senshi-habits

echo ""
echo "Para verificar logs:"
echo "  docker service logs senshi-habits_backend -f"
echo "  docker service logs senshi-habits_nginx -f"
