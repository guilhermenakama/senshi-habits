#!/bin/bash

echo "🔍 DIAGNÓSTICO - Senshi Habits"
echo "=============================="
echo ""

# Cores
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${YELLOW}1. Commit atual do Git:${NC}"
git log -1 --oneline
echo ""

echo -e "${YELLOW}2. Status do Git:${NC}"
git status --short
echo ""

echo -e "${YELLOW}3. Conteúdo do BehavioralProfile.jsx (primeiras 15 linhas):${NC}"
head -15 frontend/src/pages/BehavioralProfile.jsx
echo ""

echo -e "${YELLOW}4. Arquivos no frontend/dist/assets (se existir):${NC}"
if [ -d "frontend/dist/assets" ]; then
    ls -lh frontend/dist/assets/ | head -10
    echo ""
    echo -e "${YELLOW}5. Verificando se há 'localhost' no JavaScript principal:${NC}"
    # Pegar o arquivo .js mais recente
    JS_FILE=$(ls -t frontend/dist/assets/index-*.js 2>/dev/null | head -1)
    if [ -n "$JS_FILE" ]; then
        echo "Arquivo: $JS_FILE"
        if grep -q "127.0.0.1:8000" "$JS_FILE" 2>/dev/null; then
            echo -e "${GREEN}⚠️  PROBLEMA: O arquivo AINDA contém '127.0.0.1:8000'${NC}"
        else
            echo -e "${GREEN}✓ OK: Não encontrado '127.0.0.1:8000' hardcoded${NC}"
        fi
    else
        echo "Nenhum arquivo index-*.js encontrado"
    fi
else
    echo "Diretório frontend/dist não existe - precisa fazer npm run build"
fi
echo ""

echo -e "${YELLOW}6. Imagens Docker disponíveis:${NC}"
docker images | grep senshi-habits
echo ""

echo -e "${YELLOW}7. Serviços Docker rodando:${NC}"
docker service ls | grep senshi-habits
echo ""

echo -e "${YELLOW}8. Status detalhado do serviço nginx:${NC}"
docker service ps senshi-habits_nginx --no-trunc --format "table {{.Name}}\t{{.Image}}\t{{.CurrentState}}\t{{.Error}}" | head -5
echo ""

echo -e "${YELLOW}9. Última atualização da imagem senshi-habits-frontend:${NC}"
docker images senshi-habits-frontend:latest --format "{{.CreatedAt}}"
echo ""

echo -e "${YELLOW}10. Containers nginx atualmente rodando:${NC}"
docker ps --filter "name=senshi-habits_nginx" --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
echo ""

echo "=============================="
echo "Diagnóstico completo!"
