# ⚔️ SENSHI HABITS

Sistema SaaS de acompanhamento de hábitos, treinos e nutrição com análise de IA.

**Domínio**: https://senshin-habits.aytt.com.br

---

## 🚀 Quick Start (Desenvolvimento Local)

### 1. Backend (Django)
```bash
cd backend
python -m venv env
source env/bin/activate
pip install -r requirements.txt
cp ../.env .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend: http://127.0.0.1:8000

### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

---

## 📚 Documentação

- **[ARQUITETURA-TECNICA.md](ARQUITETURA-TECNICA.md)** - Stack, modelos, fluxos
- **[PRONTO-PARA-DEPLOY.md](PRONTO-PARA-DEPLOY.md)** - Guia de deploy
- **[LIMPEZA-DO-PROJETO.md](LIMPEZA-DO-PROJETO.md)** - Manutenção

---

## 🛠️ Stack

**Backend**: Django 5.2.8, PostgreSQL, JWT, Gemini API, MinIO  
**Frontend**: React 19.2.0, Vite, Tailwind CSS  
**Infra**: Docker, Nginx, Hetzner VPS, Cloudflare

---

## 🔐 Segurança

- ✅ Multi-tenant (isolamento por usuário)
- ✅ JWT 15min
- ✅ Rate limiting 100 req/hora
- ✅ Upload validation 5MB
- ✅ HTTPS forçado

---

## 📱 Funcionalidades

- Rastreamento de hábitos diários
- Gerenciamento de treinos e PRs
- Análise nutricional com IA (Gemini Vision)
- Dashboard com gráficos
- Testes de personalidade (MBTI, Enneagram, DISC)

---

**Desenvolvido com ⚔️ por Senshi Team**
