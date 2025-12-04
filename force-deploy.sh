#!/bin/bash

echo "🚀 FORCE DEPLOY - Senshi Habits"
echo "================================"

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

set -e  # Para em caso de erro

echo -e "${YELLOW}1. Git pull...${NC}"
git pull
echo -e "${GREEN}✓ Git atualizado${NC}"
echo ""

echo -e "${YELLOW}2. Limpando build anterior do frontend...${NC}"
rm -rf frontend/dist
rm -rf frontend/node_modules/.vite
echo -e "${GREEN}✓ Cache limpo${NC}"
echo ""

echo -e "${YELLOW}3. Instalando dependências do frontend...${NC}"
cd frontend
npm install
echo -e "${GREEN}✓ Dependências instaladas${NC}"
echo ""

echo -e "${YELLOW}4. Building frontend React (produção)...${NC}"
npm run build
echo -e "${GREEN}✓ Frontend buildado${NC}"
echo ""

# Verificar se o build foi criado
if [ ! -d "dist" ]; then
    echo -e "${RED}ERRO: Diretório dist/ não foi criado!${NC}"
    exit 1
fi

echo -e "${YELLOW}5. Verificando arquivos do build...${NC}"
ls -lh dist/assets/ | head -5
echo ""

cd ..

echo -e "${YELLOW}6. Removendo imagem nginx antiga...${NC}"
docker rmi senshi-habits-frontend:latest || true
echo -e "${GREEN}✓ Imagem antiga removida${NC}"
echo ""

echo -e "${YELLOW}7. Building nova imagem nginx (SEM CACHE)...${NC}"
docker build --no-cache -t senshi-habits-frontend:latest -f nginx/Dockerfile .
echo -e "${GREEN}✓ Nova imagem criada${NC}"
echo ""

echo -e "${YELLOW}8. Atualizando serviço nginx...${NC}"
docker service update --force --image senshi-habits-frontend:latest senshi-habits_nginx
echo -e "${GREEN}✓ Serviço atualizado${NC}"
echo ""

echo -e "${YELLOW}9. Aguardando serviço reiniciar (30s)...${NC}"
sleep 30
echo ""

echo -e "${YELLOW}10. Status do serviço:${NC}"
docker service ps senshi-habits_nginx --no-trunc --format "table {{.Name}}\t{{.Image}}\t{{.CurrentState}}" | head -5
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ FORCE DEPLOY CONCLUÍDO!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}PRÓXIMOS PASSOS:${NC}"
echo "1. Acesse o Cloudflare Dashboard"
echo "2. Vá em Caching → Configuration"
echo "3. Clique em 'Purge Everything'"
echo "4. Confirme a purga"
echo "5. Aguarde 1-2 minutos"
echo "6. Acesse seu site com Ctrl+Shift+R (hard refresh)"
echo ""
echo -e "${YELLOW}Se ainda mostrar localhost, abra DevTools → Application → Clear storage → Clear site data${NC}"
