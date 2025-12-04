#!/bin/bash

echo "🚀 Iniciando deploy do Senshi Habits..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}1. Fazendo pull das mudanças...${NC}"
git pull

echo -e "${YELLOW}2. Executando migrations no backend...${NC}"
docker exec -it $(docker ps -q -f name=senshi-habits_backend) python manage.py migrate

echo -e "${YELLOW}3. Rebuilding backend (sem cache)...${NC}"
docker build --no-cache -t senshi-habits-backend:latest -f backend/Dockerfile.prod backend/

echo -e "${YELLOW}4. Atualizando serviço backend...${NC}"
docker service update --force --image senshi-habits-backend:latest senshi-habits_backend

echo -e "${YELLOW}5. Rebuilding frontend (nginx)...${NC}"
docker build -t senshi-habits-frontend:latest -f nginx/Dockerfile .

echo -e "${YELLOW}6. Atualizando serviço frontend...${NC}"
docker service update --force --image senshi-habits-frontend:latest senshi-habits_nginx

echo -e "${YELLOW}7. Verificando status dos serviços...${NC}"
docker service ps senshi-habits_backend --no-trunc
docker service ps senshi-habits_nginx --no-trunc

echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo ""
echo "Aguarde alguns segundos para os containers iniciarem completamente."
echo "Depois limpe o cache do Cloudflare se necessário."
