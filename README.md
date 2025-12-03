# 🥋 Senshi Habits

Sistema completo de rastreamento de hábitos, treinos, nutrição e desenvolvimento pessoal.

## 📋 Sobre o Projeto

Senshi Habits é uma aplicação full-stack para gerenciamento de:
- **Hábitos Diários**: Acompanhamento e check-in de rotinas
- **Treinos**: Registro de exercícios, PRs (recordes pessoais) e progresso
- **Nutrição com IA**: Análise de refeições usando Gemini Vision AI
- **Medidas Corporais**: Fotos e métricas de evolução física
- **Roda da Vida**: Avaliação de diferentes áreas da vida
- **Diário**: Registro de pensamentos e humor

## 🛠️ Stack Tecnológica

### Backend
- **Django 5.2.8** - Framework web
- **Django REST Framework** - API REST
- **PostgreSQL** - Banco de dados principal
- **SQLite** - Banco de dados de desenvolvimento (fallback)
- **MinIO** - Object storage (S3-compatible)
- **JWT** - Autenticação via Simple JWT
- **Google Gemini AI** - Análise de imagens

### Frontend
- **React 19** - UI Library
- **Vite** - Build tool
- **React Router DOM** - Navegação
- **Chart.js / Recharts** - Visualização de dados
- **Axios** - HTTP client
- **Lucide React** - Ícones

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- Python 3.10+
- Node.js 18+
- PostgreSQL (ou usar SQLite para desenvolvimento)
- MinIO (opcional, para storage de imagens)

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd senshi-habits
```

### 2. Configure o Backend

```bash
# Entre na pasta do backend
cd backend

# Crie e ative o ambiente virtual
python -m venv env
source env/bin/activate  # Linux/Mac
# ou
env\Scripts\activate  # Windows

# Instale as dependências
pip install -r requirements.txt

#### Configuração do .env
Edite o arquivo `.env` na raiz do projeto com suas credenciais:

```env
# API do Gemini
GEMINI_API_KEY=sua_chave_aqui

# Django
SECRET_KEY=sua_secret_key_segura
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Banco de dados (deixe vazio para usar SQLite)
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_HOST=127.0.0.1
DB_PORT=5432

# MinIO (S3)
AWS_ACCESS_KEY_ID=seu_access_key
AWS_SECRET_ACCESS_KEY=seu_secret_key
AWS_STORAGE_BUCKET_NAME=senshi-habits
MINIO_STORAGE_ENDPOINT=s3.seudominio.com
AWS_S3_REGION_NAME=us-east-1

SUPERUSER_KEY=chave_para_criar_admin
```

#### Execute as migrações e rode o servidor

```bash
# Execute as migrações
python manage.py migrate

# Crie um superusuário
python manage.py createsuperuser

# Rode o servidor
python manage.py runserver
```

O backend estará rodando em: `http://127.0.0.1:8000`

### 3. Configure o Frontend

```bash
# Entre na pasta do frontend
cd ../frontend

# Instale as dependências
npm install

# Rode o servidor de desenvolvimento
npm run dev
```

O frontend estará rodando em: `http://localhost:5173`

## 📁 Estrutura do Projeto

```
senshi-habits/
├── backend/
│   ├── core/              # Configurações do Django
│   ├── tracker/           # App de hábitos e treinos
│   ├── users/             # Autenticação JWT
│   ├── vision_ai/         # Análise de imagens com Gemini
│   └── whatsapp_bot/      # Bot WhatsApp (futuro)
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── hooks/         # Custom hooks
│   │   └── App.jsx        # App principal
│   └── package.json
│
├── .env.example           # Template de variáveis de ambiente
└── README.md
```

## 🔑 Endpoints da API

### Autenticação
- `POST /api/auth/login/` - Login (retorna JWT)
- `POST /api/auth/refresh/` - Refresh token

### Tracker (Hábitos e Treinos)
- `GET/POST /api/tracker/habits/` - CRUD de hábitos
- `GET/POST /api/tracker/habit-logs/` - Logs diários de hábitos
- `GET/POST /api/tracker/workouts/` - CRUD de treinos
- `GET/POST /api/tracker/prs/` - Recordes pessoais
- `GET/POST /api/tracker/body-measurements/` - Medidas corporais
- `GET/POST /api/tracker/life-assessments/` - Roda da Vida
- `GET/POST /api/tracker/journal/` - Diário
- `GET /api/tracker/workout-stats/weekly/` - Estatísticas semanais

### Vision AI
- `GET /api/vision/health/` - Health check
- `POST /api/vision/analyze/` - Análise de imagem de comida

## 🧪 Executando Testes

```bash
# Backend
cd backend
python manage.py test

# Frontend
cd frontend
npm run test
```

## 📦 Build para Produção

### Backend
```bash
# Configure DEBUG=False no .env
# Configure ALLOWED_HOSTS com seu domínio
# Configure SECRET_KEY segura

# Coleta arquivos estáticos
python manage.py collectstatic
```

### Frontend
```bash
cd frontend
npm run build
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 👤 Autor

Desenvolvido por Guilherme Nakama

---

**Nota**: Não esqueça de nunca commitar o arquivo `.env` com credenciais reais!
