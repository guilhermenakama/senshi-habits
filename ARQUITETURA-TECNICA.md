# 🏗️ ARQUITETURA TÉCNICA - SENSHI HABITS

**Versão**: 1.0
**Data**: 2025-12-03
**Tipo**: SaaS Multi-Tenant
**Domínio**: https://senshin-habits.aytt.com.br

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Stack Tecnológica](#stack-tecnológica)
3. [Arquitetura do Sistema](#arquitetura-do-sistema)
4. [Backend - Django](#backend---django)
5. [Frontend - React](#frontend---react)
6. [Infraestrutura](#infraestrutura)
7. [Segurança](#segurança)
8. [Integrações](#integrações)
9. [Fluxo de Dados](#fluxo-de-dados)
10. [Deployment](#deployment)

---

## 1. VISÃO GERAL

### O que é o Senshi Habits?

Sistema SaaS de acompanhamento de hábitos, treinos e nutrição com:
- Rastreamento diário de hábitos personalizados
- Gerenciamento de treinos e Personal Records (PRs)
- Análise de fotos de refeições usando IA (Google Gemini Vision)
- Dashboard com métricas e progresso
- Perfil comportamental (MBTI, Enneagram, DISC)

### Modelo de Negócio

**Multi-Tenant**: Cada usuário tem seus próprios dados isolados no mesmo banco.

---

## 2. STACK TECNOLÓGICA

### Backend
- **Framework**: Django 5.2.8
- **API**: Django REST Framework 3.16.1
- **Autenticação**: JWT (djangorestframework-simplejwt 5.5.1)
- **Banco de Dados**: PostgreSQL 15
- **Storage**: MinIO (S3-compatible) via django-minio-storage
- **IA**: Google Gemini API (google-generativeai 0.8.5)
- **Servidor Web**: Gunicorn + Nginx (produção)

### Frontend
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Roteamento**: React Router DOM 7.9.6
- **Estilização**: Tailwind CSS 3.4.17
- **HTTP Client**: Axios 1.13.2
- **Gráficos**: Chart.js 4.5.1 + react-chartjs-2 + Recharts 3.5.1
- **Ícones**: lucide-react 0.555.0

### Infraestrutura
- **VPS**: Hetzner (5.161.210.162)
- **Containers**: Docker + Docker Compose
- **Orquestração**: Portainer
- **Proxy Reverso**: Nginx
- **CDN/DNS**: Cloudflare
- **SSL**: Cloudflare Origin Certificates

---

## 3. ARQUITETURA DO SISTEMA

```
┌─────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE (CDN + WAF)                   │
│  DNS: senshin-habits.aytt.com.br → 5.161.210.162          │
│  SSL/TLS: Full (strict) + Origin Certificate                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              VPS HETZNER (5.161.210.162)                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              NGINX (Reverse Proxy)                   │  │
│  │  - Port 80 → Redirect to HTTPS                      │  │
│  │  - Port 443 → SSL Termination                       │  │
│  │  - /api/* → Backend (Django)                        │  │
│  │  - /* → Frontend (React SPA)                        │  │
│  └─────────────────────────────────────────────────────┘  │
│                              ↓                              │
│  ┌──────────────────────┐  ┌──────────────────────┐       │
│  │   BACKEND CONTAINER  │  │  FRONTEND (Static)   │       │
│  │                      │  │                      │       │
│  │  Django + Gunicorn   │  │  HTML + JS + CSS     │       │
│  │  Port: 8000          │  │  Servido pelo Nginx  │       │
│  │                      │  │                      │       │
│  │  - REST API          │  └──────────────────────┘       │
│  │  - JWT Auth          │                                  │
│  │  - Rate Limiting     │                                  │
│  │  - Multi-Tenant      │                                  │
│  └──────────────────────┘                                  │
│           ↓           ↓                                     │
│  ┌────────────┐  ┌────────────────┐                       │
│  │ PostgreSQL │  │  Google Gemini │                       │
│  │            │  │  Vision API     │                       │
│  │ Port: 5432 │  │  (External)     │                       │
│  └────────────┘  └────────────────┘                       │
│           ↓                                                 │
│  ┌─────────────────────────────────────┐                  │
│  │  MinIO (S3-Compatible Storage)      │                  │
│  │  s3.aytt.com.br                     │                  │
│  │  - Imagens de análises              │                  │
│  │  - Vídeos de PRs                    │                  │
│  │  - Fotos de progresso corporal      │                  │
│  └─────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. BACKEND - DJANGO

### 4.1 Estrutura de Apps

```
backend/
├── core/                 # Configurações Django
│   ├── settings.py      # Configurações centrais
│   ├── urls.py          # Rotas principais
│   └── wsgi.py          # WSGI entry point
│
├── users/               # 👤 Gestão de Usuários
│   ├── models.py        # User, UserProfile
│   ├── views.py         # Login, Registro, Profile
│   ├── serializers.py   # Serialização de dados
│   └── services.py      # Geração de insights com IA
│
├── tracker/             # 📊 Rastreamento de Hábitos e Treinos
│   ├── models.py        # Habit, HabitLog, Workout, Exercise, etc
│   ├── views.py         # CRUD de hábitos, treinos, PRs
│   ├── serializers.py
│   └── urls.py
│
├── vision_ai/           # 📸 Análise de Imagens com IA
│   ├── models.py        # Analysis (fotos de refeições)
│   ├── views.py         # Upload + análise com Gemini
│   ├── services.py      # GeminiVisionService
│   └── urls.py
│
└── whatsapp_bot/        # 📱 Bot WhatsApp (planejado)
    └── views.py
```

### 4.2 Modelos Principais

#### **users.UserProfile**
```python
class UserProfile(models.Model):
    user = OneToOneField(User)
    height_cm = DecimalField()
    mbti_type = CharField()          # Personalidade MBTI
    enneagram_type = CharField()     # Eneagrama
    disc_profile = CharField()        # Perfil DISC
    created_at = DateTimeField()
```

#### **tracker.Habit**
```python
class Habit(models.Model):
    user = ForeignKey(User)          # 🔐 ISOLAMENTO MULTI-TENANT
    name = CharField()
    category = CharField()
    target_frequency = CharField()   # Diário, Semanal, etc
    created_at = DateTimeField()
```

#### **tracker.HabitLog**
```python
class HabitLog(models.Model):
    habit = ForeignKey(Habit)
    user = ForeignKey(User)          # 🔐 ISOLAMENTO MULTI-TENANT
    date = DateField()
    completed = BooleanField()
    notes = TextField()

    class Meta:
        unique_together = ('habit', 'date', 'user')
```

#### **tracker.Workout**
```python
class Workout(models.Model):
    user = ForeignKey(User)          # 🔐 ISOLAMENTO MULTI-TENANT
    date_time = DateTimeField()
    notes = TextField()
    duration_minutes = IntegerField()
```

#### **tracker.Exercise**
```python
class Exercise(models.Model):
    workout = ForeignKey(Workout)
    exercise_name = CharField()
    sets = IntegerField()
    reps = IntegerField()
    weight_kg = DecimalField()
    rest_seconds = IntegerField()
```

#### **tracker.PersonalRecord**
```python
class PersonalRecord(models.Model):
    user = ForeignKey(User)          # 🔐 ISOLAMENTO MULTI-TENANT
    exercise_name = CharField()
    weight_kg = DecimalField()
    reps = IntegerField()
    date = DateField()
    video = FileField()              # Upload para MinIO
```

#### **vision_ai.Analysis**
```python
class Analysis(models.Model):
    user = ForeignKey(User)          # 🔐 ISOLAMENTO MULTI-TENANT
    image = ImageField()             # Upload para MinIO
    result = TextField()             # Resposta do Gemini
    created_at = DateTimeField()

    class Meta:
        indexes = [
            Index(fields=['user', '-created_at'])  # Performance
        ]
```

### 4.3 Autenticação e Autorização

#### JWT Configuration
```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),  # Token curto
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}
```

#### Endpoints de Auth
- `POST /api/auth/login/` - Login (retorna access + refresh token)
- `POST /api/auth/refresh/` - Renovar access token
- `POST /api/auth/register/` - Criar nova conta

#### Proteção de Rotas
Todas as views usam `permission_classes = [IsAuthenticated]`:
```python
class HabitViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Habit.objects.filter(user=self.request.user)  # 🔐
```

### 4.4 Rate Limiting

Configuração global:
```python
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '10/hour',     # IPs não autenticados
        'user': '100/hour',    # Usuários autenticados
    }
}
```

### 4.5 Storage - MinIO

Configuração:
```python
STORAGES = {
    "default": {
        "BACKEND": "minio_storage.storage.MinioMediaStorage",
    }
}

MINIO_STORAGE_ENDPOINT = 's3.aytt.com.br'
MINIO_STORAGE_USE_HTTPS = True
MINIO_STORAGE_AUTO_CREATE_MEDIA_BUCKET = True
```

Uploads vão automaticamente para o MinIO quando usamos:
```python
image = models.ImageField(upload_to='analysis_images/')
video = models.FileField(upload_to='pr_videos/')
```

### 4.6 Integrações de IA

#### Gemini Vision API
```python
# vision_ai/services.py
class GeminiVisionService:
    def analyze_image(self, image_file):
        model = genai.GenerativeModel("gemini-1.5-pro")

        prompt = """
        Analise esta refeição e forneça:
        - Estimativa de calorias
        - Macronutrientes (proteínas, carboidratos, gorduras)
        - Qualidade nutricional
        """

        response = model.generate_content([prompt, image])
        return response.text
```

#### Geração de Insights
```python
# users/services.py
def generate_ai_insights(user_profile, habit_logs, workouts):
    prompt = f"""
    Perfil: {user_profile.mbti_type}, Enneagram {user_profile.enneagram_type}
    Dados: {habit_logs}, {workouts}

    Gere insights personalizados sobre progresso e sugestões.
    """
    # Usa Gemini para gerar insights
```

---

## 5. FRONTEND - REACT

### 5.1 Estrutura de Componentes

```
frontend/src/
├── main.jsx              # Entry point
├── App.jsx               # Rotas + Auth
├── index.css             # Tailwind base
│
├── components/           # Componentes reutilizáveis
│   ├── SidebarLayout.jsx         # Layout principal com menu
│   ├── HabitTrackerWheel.jsx     # Roda de hábitos
│   ├── WeeklyHabits.jsx          # Vista semanal
│   ├── DailyLogComponent.jsx     # Log diário
│   ├── LifeWheel.jsx             # Roda da vida
│   ├── AIInsightsDashboard.jsx   # Insights de IA
│   └── tests/                    # Testes de personalidade
│       ├── MBTITest.jsx
│       ├── EnneagramTest.jsx
│       └── DISCTest.jsx
│
├── pages/                # Páginas principais
│   ├── Dashboard.jsx             # Visão geral
│   ├── DailyLog.jsx              # Log diário completo
│   ├── HabitGoals.jsx            # Gerenciar hábitos
│   ├── Training.jsx              # Treinos e PRs
│   ├── NutritionAI.jsx           # Análise de fotos
│   ├── Journal.jsx               # Diário
│   ├── AICoach.jsx               # Coach IA
│   └── BehavioralProfile.jsx    # Testes de personalidade
│
└── hooks/                # Custom hooks
    ├── useHabits.js              # CRUD de hábitos
    ├── useDailyHabits.js         # Logs diários
    ├── useHabitStats.js          # Estatísticas
    ├── useWorkoutStats.js        # Estatísticas de treino
    ├── useBodyMetrics.js         # Métricas corporais
    └── useProgressComparison.js  # Comparação de progresso
```

### 5.2 Autenticação no Frontend

```javascript
// App.jsx
function App() {
  const [token, setToken] = useState(localStorage.getItem('access_token'));

  const handleLogin = async (username, password) => {
    const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      setToken(data.access);
    }
  };

  // ... tela de login ou dashboard
}
```

### 5.3 Custom Hooks (Exemplo)

```javascript
// hooks/useHabits.js
const useHabits = (token) => {
  const [habits, setHabits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHabits = useCallback(async () => {
    const response = await axios.get(
      `${API_URL}/habits/`,
      { headers: { 'Authorization': `Bearer ${token}` }}
    );
    setHabits(response.data.sort((a, b) => a.id - b.id));
  }, [token]);

  const createHabit = async (name, category, frequency) => {
    const response = await axios.post(
      `${API_URL}/habits/`,
      { name, category, target_frequency: frequency },
      { headers: { 'Authorization': `Bearer ${token}` }}
    );
    setHabits([...habits, response.data]);
  };

  return { habits, isLoading, fetchHabits, createHabit };
};
```

### 5.4 Roteamento

```javascript
// App.jsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<SidebarLayout onLogout={handleLogout} />}>
      <Route index element={<DailyLog token={token} />} />
      <Route path="dashboard" element={<Dashboard token={token} />} />
      <Route path="nutrition" element={<NutritionAI token={token} />} />
      <Route path="training" element={<Training token={token} />} />
      <Route path="journal" element={<Journal token={token} />} />
      <Route path="/habits" element={<HabitGoals token={token} />} />
      <Route path="ai-coach" element={<AICoach token={token} />} />
      <Route path="profile/behavioral" element={<BehavioralProfile token={token} />} />
    </Route>
  </Routes>
</BrowserRouter>
```

### 5.5 Estilização com Tailwind

```jsx
// Exemplo de componente estilizado
<div className="bg-white rounded-lg shadow-md p-6">
  <h2 className="text-2xl font-bold text-gray-800 mb-4">
    Daily Habits
  </h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {habits.map(habit => (
      <div key={habit.id} className="border rounded p-4 hover:bg-gray-50">
        {habit.name}
      </div>
    ))}
  </div>
</div>
```

---

## 6. INFRAESTRUTURA

### 6.1 Ambiente de Desenvolvimento

```yaml
# docker-compose.yml (local)
version: '3.8'
services:
  db:
    image: postgres:15-alpine
    ports: ["5432:5432"]

  backend:
    build: ./backend
    command: python manage.py runserver 0.0.0.0:8000
    ports: ["8000:8000"]
    depends_on: [db]
```

```bash
# Frontend (local)
cd frontend
npm run dev  # Vite dev server na porta 5173
```

### 6.2 Ambiente de Produção (Portainer)

```yaml
# docker-compose.portainer.yml
version: '3.8'
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    command: gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers 3
    expose: [8000]
    env_file: ./backend/.env
    networks:
      - senshi-network
      - portainer-network  # Conecta ao Postgres/MinIO existentes

  nginx:
    build: ./nginx
    ports: ["80:80", "443:443"]
    volumes:
      - ./frontend/dist:/usr/share/nginx/html
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on: [backend]

networks:
  senshi-network:
  portainer-network:
    external: true  # Rede do Portainer
```

### 6.3 Nginx Configuration

```nginx
# nginx/nginx.conf
upstream backend {
    server backend:8000;
}

server {
    listen 80;
    server_name senshin-habits.aytt.com.br;
    return 301 https://$host$request_uri;  # Força HTTPS
}

server {
    listen 443 ssl http2;
    server_name senshin-habits.aytt.com.br;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    # Frontend (React SPA)
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Django Admin
    location /admin/ {
        proxy_pass http://backend;
    }

    client_max_body_size 10M;  # Limite de upload
}
```

### 6.4 Dockerfile (Backend)

```dockerfile
# backend/Dockerfile.prod
FROM python:3.11-slim

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copiar código
COPY . .

# Coletar arquivos estáticos
RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "core.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4"]
```

---

## 7. SEGURANÇA

### 7.1 Isolamento Multi-Tenant

**CRÍTICO**: Todos os modelos têm campo `user`:
```python
class Model(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # 🔐
```

**Todas as queries filtram por usuário**:
```python
def get_queryset(self):
    return Model.objects.filter(user=self.request.user)  # 🔐
```

### 7.2 Validação de Uploads

```python
# vision_ai/views.py
MAX_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

if image_file.size > MAX_SIZE:
    return Response({"error": "Imagem muito grande"}, status=400)

if image_file.content_type not in ALLOWED_TYPES:
    return Response({"error": "Tipo não permitido"}, status=400)

# Validar integridade
img = Image.open(image_file)
img.verify()
```

### 7.3 HTTPS e Headers de Segurança

```python
# settings.py (produção)
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    SECURE_HSTS_SECONDS = 31536000  # 1 ano
```

### 7.4 CORS

```python
CORS_ALLOWED_ORIGINS = [
    "https://senshin-habits.aytt.com.br",
    "http://localhost:5173",  # Dev
]
```

### 7.5 Secrets Management

Todas as credenciais no `.env`:
```bash
SECRET_KEY=...
GEMINI_API_KEY=...
AWS_SECRET_ACCESS_KEY=...
DB_PASSWORD=...
```

**`.env` está no `.gitignore`** ✅

---

## 8. INTEGRAÇÕES

### 8.1 Google Gemini Vision API

**Uso**: Análise de fotos de refeições

```python
import google.generativeai as genai

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-pro")

response = model.generate_content([
    "Analise esta refeição...",
    image_file
])
```

**Custo**: ~$0.0025 por imagem (modelo gemini-1.5-pro)

### 8.2 MinIO (S3-Compatible)

**Uso**: Armazenamento de arquivos

- Fotos de análises nutricionais (`analysis_images/`)
- Vídeos de Personal Records (`pr_videos/`)
- Fotos de progresso corporal (`body_progress/`)

**Endpoint**: `s3.aytt.com.br`

### 8.3 PostgreSQL

**Banco principal**: Todos os dados estruturados

**Conexão**:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'postgres',
        'USER': 'postgres',
        'HOST': '5.161.210.162',
        'PORT': '5432',
    }
}
```

---

## 9. FLUXO DE DADOS

### 9.1 Fluxo de Upload de Imagem (Análise Nutricional)

```
1. Usuário seleciona foto no frontend
   ↓
2. Frontend valida tamanho/tipo (client-side)
   ↓
3. POST /api/vision/analyze/
   Headers: Authorization: Bearer <JWT>
   Body: multipart/form-data (image)
   ↓
4. Backend valida:
   - JWT válido?
   - Tamanho < 5MB?
   - Tipo permitido (JPEG/PNG/WebP)?
   - Integridade da imagem (PIL)?
   ↓
5. Salva no banco:
   Analysis.objects.create(
     user=request.user,  # 🔐 Isolamento
     image=image_file    # Upload automático para MinIO
   )
   ↓
6. Envia para Gemini Vision API
   ↓
7. Atualiza registro com resultado:
   analysis_obj.result = gemini_response
   analysis_obj.save()
   ↓
8. Retorna JSON:
   {
     "id": 123,
     "image_url": "https://s3.aytt.com.br/senshi-habits/analysis_images/...",
     "description": "Esta refeição contém aprox. 650 calorias...",
     "created_at": "2025-12-03T10:30:00Z"
   }
```

### 9.2 Fluxo de Autenticação

```
1. POST /api/auth/login/
   Body: { "username": "user", "password": "pass" }
   ↓
2. Django valida credenciais
   ↓
3. Retorna JWT tokens:
   {
     "access": "eyJ...",    # Expira em 15min
     "refresh": "eyJ..."    # Expira em 7 dias
   }
   ↓
4. Frontend armazena:
   localStorage.setItem('access_token', data.access)
   localStorage.setItem('refresh_token', data.refresh)
   ↓
5. Requisições subsequentes:
   Authorization: Bearer <access_token>
   ↓
6. Quando access expira (15min):
   POST /api/auth/refresh/
   Body: { "refresh": "eyJ..." }
   ↓
7. Backend retorna novo access token
```

### 9.3 Fluxo de Criação de Hábito

```
1. POST /api/tracker/habits/
   Headers: Authorization: Bearer <JWT>
   Body: {
     "name": "Meditar",
     "category": "Bem-estar",
     "target_frequency": "Diário"
   }
   ↓
2. Backend cria registro:
   Habit.objects.create(
     user=request.user,  # 🔐 Associa ao usuário
     name="Meditar",
     category="Bem-estar",
     target_frequency="Diário"
   )
   ↓
3. Retorna:
   {
     "id": 5,
     "name": "Meditar",
     "category": "Bem-estar",
     "target_frequency": "Diário",
     "created_at": "2025-12-03T10:00:00Z"
   }
```

---

## 10. DEPLOYMENT

### 10.1 Pipeline de Deploy

```bash
# 1. Build do Frontend
cd frontend
npm run build  # Gera /frontend/dist

# 2. Commit e Push
git add .
git commit -m "Deploy v1.0"
git push origin main

# 3. Deploy no Servidor
ssh root@5.161.210.162
cd /home/senshi-habits
git pull

# 4. Rebuild dos containers
docker-compose -f docker-compose.portainer.yml up -d --build

# 5. Rodar migrations (se houver)
docker exec -it senshi-backend python manage.py migrate

# 6. Verificar logs
docker logs senshi-backend -f
docker logs senshi-nginx -f
```

### 10.2 Variáveis de Ambiente (Produção)

```bash
# backend/.env
DEBUG=False
SECRET_KEY=<chave-aleatoria-50-chars>
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=<senha-forte>
DB_HOST=5.161.210.162
GEMINI_API_KEY=<api-key>
AWS_ACCESS_KEY_ID=<minio-key>
AWS_SECRET_ACCESS_KEY=<minio-secret>
```

### 10.3 SSL/TLS (Cloudflare)

1. **Cloudflare Dashboard** → SSL/TLS → Origin Server
2. Criar certificado (15 anos)
3. Copiar certificado e chave privada
4. Salvar no servidor:
```bash
mkdir -p nginx/ssl
nano nginx/ssl/fullchain.pem   # Colar certificado
nano nginx/ssl/privkey.pem     # Colar chave
chmod 600 nginx/ssl/*
```

### 10.4 DNS (Cloudflare)

```
Type: A
Name: senshin-habits
Content: 5.161.210.162
Proxy: DNS only (ou ativado para CDN)
```

### 10.5 Monitoramento

```bash
# Ver status dos containers
docker ps

# Logs em tempo real
docker logs senshi-backend -f

# Uso de recursos
docker stats

# Espaço em disco
df -h

# Processos
top
```

---

## 11. MANUTENÇÃO

### 11.1 Backup do Banco

```bash
# Backup manual
docker exec senshi-db pg_dump -U postgres postgres > backup-$(date +%Y%m%d).sql

# Restore
cat backup-20251203.sql | docker exec -i senshi-db psql -U postgres postgres
```

### 11.2 Limpeza de Containers Antigos

```bash
# Remover containers parados
docker container prune

# Remover imagens não usadas
docker image prune -a

# Liberar espaço
docker system prune -a --volumes
```

### 11.3 Atualização de Dependências

```bash
# Backend
cd backend
pip install --upgrade -r requirements.txt
pip freeze > requirements.txt

# Frontend
cd frontend
npm update
npm audit fix
```

---

## 12. TROUBLESHOOTING

### Erro: Backend não conecta no Postgres

```bash
# Verificar se estão na mesma rede Docker
docker network inspect portainer_default

# Conectar manualmente
docker network connect portainer_default senshi-backend
docker restart senshi-backend
```

### Erro: 502 Bad Gateway

```bash
# Verificar logs
docker logs senshi-backend -f
docker logs senshi-nginx -f

# Reiniciar containers
docker restart senshi-backend senshi-nginx
```

### Erro: JWT Token expirado

No frontend, implementar refresh automático:
```javascript
setInterval(async () => {
  const refresh = localStorage.getItem('refresh_token');
  const response = await fetch('/api/auth/refresh/', {
    method: 'POST',
    body: JSON.stringify({ refresh })
  });
  const data = await response.json();
  localStorage.setItem('access_token', data.access);
}, 14 * 60 * 1000); // A cada 14 minutos
```

---

## 13. CHECKLIST DE ONBOARDING (NOVO DEV)

Para um novo desenvolvedor começar:

- [ ] Clonar repositório: `git clone ...`
- [ ] Instalar Docker e Docker Compose
- [ ] Copiar `.env.example` para `.env` e configurar
- [ ] Rodar `docker-compose up` (backend + banco local)
- [ ] Rodar migrations: `python manage.py migrate`
- [ ] Criar superuser: `python manage.py createsuperuser`
- [ ] Instalar dependências do frontend: `npm install`
- [ ] Rodar frontend: `npm run dev`
- [ ] Ler esta documentação completa 📚
- [ ] Ler [CORRECOES-CRITICAS-APLICADAS.md](CORRECOES-CRITICAS-APLICADAS.md)

---

## 14. CONTATOS E RECURSOS

- **Repositório**: [Link do Git]
- **Servidor Produção**: `ssh root@5.161.210.162`
- **Portainer**: `http://5.161.210.162:9000`
- **Domínio**: https://senshin-habits.aytt.com.br
- **Documentação Django**: https://docs.djangoproject.com
- **Documentação React**: https://react.dev
- **Gemini API Docs**: https://ai.google.dev/docs

---

**✅ Documentação completa da arquitetura técnica do Senshi Habits**

Atualizado em: 2025-12-03
