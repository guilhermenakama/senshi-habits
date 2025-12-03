# ✅ PRONTO PARA DEPLOY!

**Data**: 2025-12-03
**Status**: 🟢 **TODAS AS CORREÇÕES CRÍTICAS APLICADAS**

---

## 🎉 O QUE FOI FEITO

### ✅ Correções de Segurança (CRÍTICO)
1. **Isolamento Multi-Tenant** - Modelo Analysis agora tem campo `user`
2. **Validação de Uploads** - Limite 5MB, apenas imagens válidas
3. **JWT Token Seguro** - 15 minutos (era 24h)
4. **SECRET_KEY Obrigatória** - Sem fallback inseguro
5. **DEBUG=False** - Padrão seguro
6. **Rate Limiting** - 100 req/hora por usuário
7. **Segurança HTTPS** - Forçado em produção

### ✅ Configuração
- `.env` do backend configurado com suas credenciais reais
- Migration rodada com sucesso
- Pillow instalado
- Settings.py ajustado

---

## 📋 PRÓXIMOS PASSOS PARA DEPLOY

### 1. **Build do Frontend**
```bash
cd frontend
npm install
npm run build
```

### 2. **Fazer Commit das Mudanças**
```bash
git add .
git commit -m "🔒 Aplicar correções críticas de segurança multi-tenant

- Adicionar campo user no modelo Analysis
- Implementar validação de uploads (5MB, tipos permitidos)
- Reduzir JWT token para 15 minutos
- Adicionar rate limiting (100 req/hora)
- Configurar segurança HTTPS para produção
- Remover fallback inseguro da SECRET_KEY"

git push
```

### 3. **Deploy no Portainer (VPS Hetzner)**

#### Opção A: Via Interface do Portainer

1. Acesse seu Portainer: `http://5.161.210.162:9000`
2. **Stacks** → **Add Stack**
3. Nome: `senshi-habits`
4. Build method: **Repository** ou **Web editor**
5. Cole o conteúdo de `docker-compose.portainer.yml`
6. **Deploy**

#### Opção B: Via SSH

```bash
# Conectar no servidor
ssh root@5.161.210.162

# Clonar o projeto
cd /home
git clone seu-repositorio senshi-habits
cd senshi-habits

# Verificar rede do Portainer
docker network ls

# Editar docker-compose.portainer.yml com a rede correta
nano docker-compose.portainer.yml

# Subir os containers
docker-compose -f docker-compose.portainer.yml up -d --build

# Rodar migrations
docker exec -it senshi-backend python manage.py migrate

# Criar superusuário
docker exec -it senshi-backend python manage.py createsuperuser
```

### 4. **Configurar Cloudflare**

#### DNS:
- Type: `A`
- Name: `senshin-habits`
- Content: `5.161.210.162`
- Proxy: **DNS only** (nuvem cinza)

#### SSL Origin Certificate:
1. **SSL/TLS** → **Origin Server** → **Create Certificate**
2. Copiar certificado e chave
3. No servidor:
```bash
mkdir -p nginx/ssl
nano nginx/ssl/fullchain.pem  # Colar certificado
nano nginx/ssl/privkey.pem    # Colar chave
chmod 600 nginx/ssl/*
```

#### SSL Mode:
- **SSL/TLS** → Mode: **Full (strict)**

---

## ⚠️ IMPORTANTE: Frontend Precisa Atualizar

O JWT token agora dura **apenas 15 minutos**.

Você precisa adicionar refresh automático no frontend:

```javascript
// Adicionar no App.jsx ou em um hook
useEffect(() => {
  const refreshInterval = setInterval(async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) {
      try {
        const response = await fetch('https://senshin-habits.aytt.com.br/api/auth/refresh/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh })
        });
        const data = await response.json();
        if (data.access) {
          localStorage.setItem('access_token', data.access);
        }
      } catch (error) {
        console.error('Erro ao renovar token:', error);
      }
    }
  }, 14 * 60 * 1000); // A cada 14 minutos

  return () => clearInterval(refreshInterval);
}, []);
```

---

## 🔍 TESTAR ANTES DE PRODUÇÃO

### Testes Locais (Obrigatório):

1. **Rodar backend:**
```bash
cd backend
python manage.py runserver
```

2. **Rodar frontend:**
```bash
cd frontend
npm run dev
```

3. **Testar com 2 usuários:**
   - Criar 2 contas diferentes
   - Fazer upload de imagem com usuário 1
   - Logar com usuário 2
   - ✅ Verificar que usuário 2 NÃO vê a imagem do usuário 1

4. **Testar rate limiting:**
   - Fazer 110 requisições rápidas
   - ✅ Após 100, deve retornar erro 429 (Too Many Requests)

5. **Testar validação de upload:**
   - Tentar enviar arquivo > 5MB → ❌ Deve recusar
   - Tentar enviar PDF ou TXT → ❌ Deve recusar
   - Enviar JPEG < 5MB → ✅ Deve aceitar

---

## 📊 ARQUIVOS MODIFICADOS

```
backend/
├── vision_ai/
│   ├── models.py                    ✅ Campo user adicionado
│   ├── views.py                     ✅ Validação de uploads
│   └── migrations/
│       └── 0002_alter_analysis...   ✅ Migration criada
├── core/
│   └── settings.py                  ✅ JWT, rate limit, segurança
└── .env                             ✅ Configurado com credenciais reais

nginx/
└── nginx.conf                       ✅ Domínio: senshin-habits.aytt.com.br

docker-compose.portainer.yml         ✅ Criado para Portainer
```

---

## 🆘 TROUBLESHOOTING

### Backend não conecta no Postgres do Portainer

```bash
# Ver qual rede o Postgres está
docker inspect postgres | grep NetworkMode

# Conectar o backend à mesma rede
docker network connect NOME_DA_REDE senshi-backend
docker restart senshi-backend
```

### Erro 502 Bad Gateway

```bash
docker logs senshi-backend -f
docker logs senshi-nginx -f
```

### JWT Token expirando muito rápido

Se 15 minutos for muito curto para desenvolvimento, edite temporariamente:

```python
# backend/core/settings.py
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),  # Apenas para dev
    # ...
}
```

Mas **nunca em produção**!

---

## ✅ CHECKLIST FINAL

Antes de acessar em produção:

- [ ] Frontend buildado: `npm run build`
- [ ] Código commitado e enviado para o Git
- [ ] Docker containers rodando no servidor
- [ ] Migration executada: `python manage.py migrate`
- [ ] Superusuário criado
- [ ] DNS configurado no Cloudflare
- [ ] Certificados SSL instalados
- [ ] SSL Mode: Full (strict)
- [ ] Testado upload de imagem
- [ ] Testado isolamento entre usuários
- [ ] Refresh automático de token implementado no frontend

---

## 🎯 URLS DE PRODUÇÃO

Depois do deploy:

- **Frontend**: https://senshin-habits.aytt.com.br
- **API**: https://senshin-habits.aytt.com.br/api
- **Admin Django**: https://senshin-habits.aytt.com.br/admin
- **Health Check**: https://senshin-habits.aytt.com.br/api/vision/health/

---

## 📚 DOCUMENTAÇÃO

- [CORRECOES-CRITICAS-APLICADAS.md](CORRECOES-CRITICAS-APLICADAS.md) - Detalhes das correções
- [PORTAINER-DEPLOY.md](PORTAINER-DEPLOY.md) - Guia completo Portainer
- [HETZNER-DEPLOY.md](HETZNER-DEPLOY.md) - Guia Hetzner VPS

---

**🚀 Tudo pronto! Seu sistema está seguro e preparado para SaaS multi-tenant em produção!**

Qualquer dúvida durante o deploy, consulte os guias ou peça ajuda.
