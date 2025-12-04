from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    """
    Perfil completo do usuário incluindo perfis comportamentais
    para análise personalizada com IA
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')

    # --- PERFIS COMPORTAMENTAIS ---
    # MBTI - Myers-Briggs Type Indicator (16 personalidades)
    MBTI_CHOICES = [
        ('INTJ', 'INTJ - Arquiteto'),
        ('INTP', 'INTP - Lógico'),
        ('ENTJ', 'ENTJ - Comandante'),
        ('ENTP', 'ENTP - Inovador'),
        ('INFJ', 'INFJ - Conselheiro'),
        ('INFP', 'INFP - Mediador'),
        ('ENFJ', 'ENFJ - Protagonista'),
        ('ENFP', 'ENFP - Ativista'),
        ('ISTJ', 'ISTJ - Logístico'),
        ('ISFJ', 'ISFJ - Defensor'),
        ('ESTJ', 'ESTJ - Executivo'),
        ('ESFJ', 'ESFJ - Cônsul'),
        ('ISTP', 'ISTP - Virtuoso'),
        ('ISFP', 'ISFP - Aventureiro'),
        ('ESTP', 'ESTP - Empreendedor'),
        ('ESFP', 'ESFP - Animador'),
    ]
    mbti_type = models.CharField(max_length=4, choices=MBTI_CHOICES, blank=True, null=True)

    # DISC - Dominância, Influência, Estabilidade, Conformidade
    DISC_CHOICES = [
        ('D', 'Dominância - Direto, Resultados, Firmeza'),
        ('I', 'Influência - Entusiasmo, Ação, Encorajamento'),
        ('S', 'Estabilidade - Paciência, Lealdade, Calma'),
        ('C', 'Conformidade - Precisão, Exatidão, Expertise'),
        ('DI', 'Dominância + Influência'),
        ('DS', 'Dominância + Estabilidade'),
        ('DC', 'Dominância + Conformidade'),
        ('IS', 'Influência + Estabilidade'),
        ('IC', 'Influência + Conformidade'),
        ('SC', 'Estabilidade + Conformidade'),
    ]
    disc_type = models.CharField(max_length=2, choices=DISC_CHOICES, blank=True, null=True)

    # ENEAGRAMA - 9 tipos de personalidade
    ENNEAGRAM_CHOICES = [
        ('1', 'Tipo 1 - O Perfeccionista'),
        ('2', 'Tipo 2 - O Ajudador'),
        ('3', 'Tipo 3 - O Realizador'),
        ('4', 'Tipo 4 - O Individualista'),
        ('5', 'Tipo 5 - O Investigador'),
        ('6', 'Tipo 6 - O Leal'),
        ('7', 'Tipo 7 - O Entusiasta'),
        ('8', 'Tipo 8 - O Desafiador'),
        ('9', 'Tipo 9 - O Pacificador'),
    ]
    enneagram_type = models.CharField(max_length=1, choices=ENNEAGRAM_CHOICES, blank=True, null=True)
    enneagram_wing = models.CharField(max_length=10, blank=True, help_text="Ex: 3w2, 7w6")

    # --- INFORMAÇÕES ADICIONAIS PARA IA ---
    goals = models.TextField(blank=True, help_text="Objetivos principais do usuário")
    challenges = models.TextField(blank=True, help_text="Principais desafios e dificuldades")
    motivation_style = models.TextField(blank=True, help_text="O que te motiva? Como você gosta de ser motivado?")
    triggers = models.TextField(blank=True, help_text="Gatilhos que levam a recaídas ou comportamentos negativos")

    # --- PREFERÊNCIAS ---
    preferred_communication = models.CharField(
        max_length=50,
        choices=[
            ('direct', 'Direto ao ponto'),
            ('supportive', 'Encorajador e positivo'),
            ('analytical', 'Detalhado e analítico'),
            ('motivational', 'Motivacional e inspirador'),
        ],
        default='supportive'
    )

    ai_coaching_enabled = models.BooleanField(default=True, help_text="Ativar coaching com IA")

    # Metadados
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Perfil de {self.user.username}"

    class Meta:
        verbose_name = "Perfil de Usuário"
        verbose_name_plural = "Perfis de Usuários"


class AIInsight(models.Model):
    """
    Insights e conselhos gerados pela IA baseados no perfil e progresso do usuário
    """
    TYPE_CHOICES = [
        ('motivation', 'Motivação'),
        ('warning', 'Alerta/Cuidado'),
        ('advice', 'Conselho'),
        ('celebration', 'Celebração'),
        ('nutrition', 'Nutrição'),
        ('training', 'Treino'),
        ('habit', 'Hábito'),
        ('mental', 'Saúde Mental'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_insights')
    insight_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    content = models.TextField()
    priority = models.IntegerField(default=1, help_text="1=Baixa, 2=Média, 3=Alta")

    # Contexto que gerou o insight
    context_data = models.JSONField(blank=True, null=True, help_text="Dados que levaram a este insight")

    is_read = models.BooleanField(default=False)
    is_dismissed = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at', '-priority']
        verbose_name = "Insight da IA"
        verbose_name_plural = "Insights da IA"

    def __str__(self):
        return f"{self.get_insight_type_display()} - {self.title}"


class Conversation(models.Model):
    """
    Conversa com uma IA especializada (Nutricionista, Personal Trainer, Mentora)
    """
    AI_TYPE_CHOICES = [
        ('nutritionist', 'Nutricionista IA'),
        ('personal_trainer', 'Personal Trainer IA'),
        ('mentor', 'Mentora IA'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversations')
    ai_type = models.CharField(max_length=20, choices=AI_TYPE_CHOICES)
    title = models.CharField(max_length=200, help_text="Título automático baseado na primeira mensagem")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        verbose_name = "Conversa com IA"
        verbose_name_plural = "Conversas com IA"

    def __str__(self):
        return f"{self.get_ai_type_display()} - {self.title} ({self.user.username})"


class Message(models.Model):
    """
    Mensagem individual dentro de uma conversa
    """
    ROLE_CHOICES = [
        ('user', 'Usuário'),
        ('assistant', 'Assistente IA'),
    ]

    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()

    # Metadados da resposta da IA
    context_used = models.JSONField(blank=True, null=True, help_text="Dados do usuário usados para gerar a resposta")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        verbose_name = "Mensagem"
        verbose_name_plural = "Mensagens"

    def __str__(self):
        preview = self.content[:50] + "..." if len(self.content) > 50 else self.content
        return f"{self.get_role_display()}: {preview}"
