import google.generativeai as genai
from decouple import config
from datetime import datetime, timedelta
from django.utils import timezone
from .models import UserProfile, AIInsight
from tracker.models import Habit, HabitLog, Workout, PersonalRecord, BodyMeasurement, LifeAssessment


class AICoachService:
    """
    Serviço de IA Coach que analisa o perfil comportamental e progresso do usuário
    para gerar insights personalizados
    """

    def __init__(self, user):
        self.user = user
        self.profile = UserProfile.objects.get_or_create(user=user)[0]

        # Configurar Gemini
        api_key = config('GEMINI_API_KEY')
        genai.configure(api_key=api_key)

        # Gemini 1.5 Pro: Melhor para insights personalizados e análise profunda
        # Custo: ~$0.01 por insight gerado
        self.model = genai.GenerativeModel('gemini-2.5-flash')

    def get_user_context(self):
        """
        Coleta todos os dados relevantes do usuário para análise
        """
        # Dados dos últimos 7 dias
        week_ago = timezone.now() - timedelta(days=7)

        # Hábitos
        habits = Habit.objects.filter(user=self.user)
        habit_logs = HabitLog.objects.filter(
            user=self.user,
            date__gte=week_ago.date()
        )

        # Treinos
        workouts = Workout.objects.filter(
            user=self.user,
            date_time__gte=week_ago
        ).count()

        # Última avaliação da Roda da Vida
        latest_assessment = LifeAssessment.objects.filter(
            user=self.user
        ).first()

        # Medidas corporais
        latest_measurement = BodyMeasurement.objects.filter(
            user=self.user
        ).first()

        # Calcular taxa de conclusão de hábitos
        total_habit_days = habits.count() * 7
        completed_habit_days = habit_logs.filter(completed=True).count()
        completion_rate = (completed_habit_days / total_habit_days * 100) if total_habit_days > 0 else 0

        context = {
            'perfil_comportamental': {
                'mbti': self.profile.mbti_type or 'Não informado',
                'disc': self.profile.disc_type or 'Não informado',
                'eneagrama': self.profile.enneagram_type or 'Não informado',
                'wing': self.profile.enneagram_wing or '',
            },
            'objetivos': self.profile.goals or 'Não informados',
            'desafios': self.profile.challenges or 'Não informados',
            'estilo_motivacao': self.profile.motivation_style or 'Não informado',
            'gatilhos': self.profile.triggers or 'Não informados',
            'preferencia_comunicacao': self.profile.preferred_communication,
            'progresso_7_dias': {
                'habitos_total': habits.count(),
                'taxa_conclusao': round(completion_rate, 1),
                'treinos_realizados': workouts,
                'dias_analisados': 7,
            },
            'roda_da_vida': self._format_life_wheel(latest_assessment) if latest_assessment else None,
            'medidas_corporais': self._format_body_measurements(latest_measurement) if latest_measurement else None,
        }

        return context

    def _format_life_wheel(self, assessment):
        return {
            'saude': assessment.health_score,
            'carreira': assessment.career_score,
            'financeiro': assessment.financial_score,
            'social': assessment.social_score,
            'familia': assessment.family_score,
            'amor': assessment.love_score,
            'espiritual': assessment.spiritual_score,
            'intelectual': assessment.intellectual_score,
            'media': round(sum([
                assessment.health_score, assessment.career_score,
                assessment.financial_score, assessment.social_score,
                assessment.family_score, assessment.love_score,
                assessment.spiritual_score, assessment.intellectual_score
            ]) / 8, 1)
        }

    def _format_body_measurements(self, measurement):
        return {
            'peso': measurement.weight_kg,
            'massa_magra': measurement.muscle_mass_kg,
            'gordura_percentual': measurement.fat_mass_percentage,
        }

    def generate_daily_insights(self):
        """
        Gera insights diários personalizados baseados no perfil e progresso
        """
        context = self.get_user_context()

        prompt = f"""
Você é um AI Coach especializado em desenvolvimento pessoal, motivação e mudança de comportamento.

**PERFIL DO USUÁRIO:**
- MBTI: {context['perfil_comportamental']['mbti']}
- DISC: {context['perfil_comportamental']['disc']}
- Eneagrama: Tipo {context['perfil_comportamental']['eneagrama']} {context['perfil_comportamental']['wing']}

**OBJETIVOS:**
{context['objetivos']}

**DESAFIOS:**
{context['desafios']}

**ESTILO DE MOTIVAÇÃO:**
{context['estilo_motivacao']}

**GATILHOS DE RECAÍDA:**
{context['gatilhos']}

**PREFERÊNCIA DE COMUNICAÇÃO:**
{context['preferencia_comunicacao']}

**PROGRESSO DOS ÚLTIMOS 7 DIAS:**
- Hábitos rastreados: {context['progresso_7_dias']['habitos_total']}
- Taxa de conclusão: {context['progresso_7_dias']['taxa_conclusao']}%
- Treinos realizados: {context['progresso_7_dias']['treinos_realizados']}

{'**RODA DA VIDA (última avaliação):**' + chr(10) + str(context['roda_da_vida']) if context['roda_da_vida'] else ""}

{'**MEDIDAS CORPORAIS:**' + chr(10) + str(context['medidas_corporais']) if context['medidas_corporais'] else ""}

---

**SUA TAREFA:**
Com base no perfil comportamental do usuário e seu progresso, gere entre 3 e 5 insights/conselhos personalizados.

Para cada insight, retorne no formato EXATO:

TIPO: [motivation/warning/advice/celebration/habit/training/nutrition/mental]
TÍTULO: [Título curto e direto]
PRIORIDADE: [1, 2 ou 3]
CONTEÚDO: [Conselho detalhado, personalizado para o perfil comportamental]
---

**DIRETRIZES:**
1. Use o conhecimento do MBTI/DISC/Eneagrama para personalizar a linguagem e abordagem
2. Se a taxa de conclusão estiver baixa (<60%), dê um aviso gentil mas direto
3. Se estiver alta (>80%), celebre e encoraje
4. Sugira estratégias específicas para o tipo de personalidade
5. Antecipe possíveis recaídas baseado nos gatilhos mencionados
6. Seja {context['preferencia_comunicacao']} na comunicação
7. Foque em ações concretas, não apenas teoria

GERE OS INSIGHTS:
"""

        try:
            response = self.model.generate_content(prompt)
            insights_text = response.text

            # Parsear a resposta e criar os insights
            insights = self._parse_insights_from_response(insights_text)

            return insights

        except Exception as e:
            print(f"Erro ao gerar insights: {e}")
            return []

    def _parse_insights_from_response(self, response_text):
        """
        Parseia a resposta da IA e cria objetos AIInsight
        """
        insights = []
        blocks = response_text.split('---')

        for block in blocks:
            if not block.strip():
                continue

            try:
                lines = [line.strip() for line in block.strip().split('\n') if line.strip()]

                insight_data = {}
                current_key = None

                for line in lines:
                    if line.startswith('TIPO:'):
                        insight_type = line.replace('TIPO:', '').strip().lower()
                        # Mapear tipos válidos
                        valid_types = ['motivation', 'warning', 'advice', 'celebration', 'habit', 'training', 'nutrition', 'mental']
                        insight_data['insight_type'] = insight_type if insight_type in valid_types else 'advice'

                    elif line.startswith('TÍTULO:') or line.startswith('TITULO:'):
                        insight_data['title'] = line.replace('TÍTULO:', '').replace('TITULO:', '').strip()

                    elif line.startswith('PRIORIDADE:'):
                        try:
                            priority = int(line.replace('PRIORIDADE:', '').strip())
                            insight_data['priority'] = min(max(priority, 1), 3)
                        except:
                            insight_data['priority'] = 2

                    elif line.startswith('CONTEÚDO:') or line.startswith('CONTEUDO:'):
                        current_key = 'content'
                        insight_data['content'] = line.replace('CONTEÚDO:', '').replace('CONTEUDO:', '').strip()

                    elif current_key == 'content':
                        insight_data['content'] += '\n' + line

                # Validar e criar insight
                if all(k in insight_data for k in ['insight_type', 'title', 'content']):
                    insight = AIInsight.objects.create(
                        user=self.user,
                        insight_type=insight_data['insight_type'],
                        title=insight_data['title'],
                        content=insight_data['content'].strip(),
                        priority=insight_data.get('priority', 2),
                        context_data=self.get_user_context()
                    )
                    insights.append(insight)

            except Exception as e:
                print(f"Erro ao parsear bloco: {e}")
                continue

        return insights


class NutritionalAIService(AICoachService):
    """
    IA especializada em nutrição personalizada
    """

    def analyze_meal_with_profile(self, meal_image_path):
        """
        Analisa uma refeição considerando o perfil e objetivos do usuário
        """
        context = self.get_user_context()

        prompt = f"""
Você é um Nutricionista Esportivo especializado.

**PERFIL DO CLIENTE:**
- Objetivos: {context['objetivos']}
- Tipo de personalidade: {context['perfil_comportamental']['mbti']}

{'**MEDIDAS ATUAIS:**' + chr(10) + str(context['medidas_corporais']) if context['medidas_corporais'] else ""}

Analise a refeição na imagem e forneça:
1. Macronutrientes estimados
2. Se está alinhado com os objetivos
3. Sugestões de melhoria PERSONALIZADAS para o perfil comportamental
4. Alerta se houver algo preocupante

Seja {context['preferencia_comunicacao']} na comunicação.
"""

        # Implementação similar ao GeminiVisionService
        pass


class TrainingAIService(AICoachService):
    """
    IA especializada em treino personalizado
    """

    def suggest_workout_based_on_profile(self):
        """
        Sugere treino baseado no perfil comportamental e histórico
        """
        context = self.get_user_context()

        prompt = f"""
Você é um Personal Trainer AI especializado.

**PERFIL DO ALUNO:**
- DISC: {context['perfil_comportamental']['disc']}
- Eneagrama: {context['perfil_comportamental']['eneagrama']}
- Treinos na última semana: {context['progresso_7_dias']['treinos_realizados']}
- Objetivos: {context['objetivos']}

Sugira um treino personalizado para HOJE, considerando:
1. O perfil comportamental (ex: DISC D gosta de desafios intensos)
2. A frequência recente de treinos
3. Evitar burnout ou desmotivação

Seja {context['preferencia_comunicacao']}.
"""

        # Implementação completa
        pass
