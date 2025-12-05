from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
import json
from django.conf import settings

# --- 1. HÁBITOS (Rotina Diária) ---
class Habit(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='habits')
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=50, blank=True) # Ex: Saúde, Estudos
    target_frequency = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.user.username})"

class HabitLog(models.Model):
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name='logs')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    date = models.DateField()
    completed = models.BooleanField(default=False)
    value = models.FloatField(null=True, blank=True) # Ex: bebeu 2.5 (litros)
    
    class Meta:
        unique_together = ('habit', 'date', 'user')

# --- 2. FÍSICO (Medidas e Fotos) ---
class BodyMeasurement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='measurements')
    date = models.DateField()
    weight_kg = models.FloatField(help_text="Peso total em KG")
    muscle_mass_kg = models.FloatField(null=True, blank=True, help_text="Massa Magra em KG")
    fat_mass_percentage = models.FloatField(null=True, blank=True, help_text="% de Gordura")

    # Foto do shape (Integração com MinIO!)
    photo_front = models.ImageField(upload_to='body_progress/', null=True, blank=True)
    photo_back = models.ImageField(upload_to='body_progress/', null=True, blank=True)

    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-date'] # Mostra sempre o mais recente primeiro

    def calculate_bmi(self):
        """Calcula IMC (Índice de Massa Corporal) usando altura do perfil"""
        try:
            profile = self.user.profile
            if profile.height_cm and profile.height_cm > 0:
                height_m = profile.height_cm / 100
                return round(self.weight_kg / (height_m ** 2), 1)
        except:
            pass
        return None

    def calculate_bmr(self):
        """Calcula TMB (Taxa Metabólica Basal) usando fórmula de Harris-Benedict"""
        try:
            from datetime import date as date_cls
            profile = self.user.profile

            if not profile.height_cm or not profile.birth_date or not profile.gender:
                return None

            # Calcular idade
            today = date_cls.today()
            age = today.year - profile.birth_date.year
            if (today.month, today.day) < (profile.birth_date.month, profile.birth_date.day):
                age -= 1

            # Fórmula de Harris-Benedict
            if profile.gender == 'M':
                # Homens: TMB = 88.362 + (13.397 × peso) + (4.799 × altura) - (5.677 × idade)
                bmr = 88.362 + (13.397 * self.weight_kg) + (4.799 * profile.height_cm) - (5.677 * age)
            else:  # Feminino
                # Mulheres: TMB = 447.593 + (9.247 × peso) + (3.098 × altura) - (4.330 × idade)
                bmr = 447.593 + (9.247 * self.weight_kg) + (3.098 * profile.height_cm) - (4.330 * age)

            return round(bmr, 0)
        except:
            pass
        return None

# --- 3. PERFORMANCE (Treinos e PRs) ---
class Exercise(models.Model):
    TYPE_CHOICES = [
        ('strength', 'Musculação (Carga/Reps)'),
        ('cardio', 'Cardio (Tempo/Distância)'),
        ('calisthenics', 'Calistenia (Apenas Reps/Tempo)'),
    ]
    
    # O user=null permite criarmos exercícios "globais" (ex: Supino) que todos veem,
    # mas o usuário também pode criar os dele.
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True) 
    name = models.CharField(max_length=200)
    exercise_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='strength')
    muscle_group = models.CharField(max_length=50, blank=True, help_text="Ex: Peito, Costas, Pernas")

    def __str__(self):
        return self.name
    
    class Meta:
        unique_together = ('user', 'name') # Evita duplicar nome para o mesmo usuário

class Workout(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workouts')
    title = models.CharField(max_length=200, default="Treino do Dia")
    date_time = models.DateTimeField()
    
    # MUDANÇA: Usaremos JSONField (se seu Postgres for antigo, usamos TextField e convertemos)
    # Vamos usar TextField para garantir compatibilidade, mas salvaremos JSON nele.
    exercises_data = models.TextField(default="[]", help_text="JSON com lista de exercicios, series, reps e carga")
    
    feeling = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)], default=3)
    comments = models.TextField(blank=True)

    def set_exercises(self, data):
        self.exercises_data = json.dumps(data)

    def get_exercises(self):
        return json.loads(self.exercises_data)

class PersonalRecord(models.Model):
    """
    A tabela de troféus. Registra os recordes pessoais.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='prs')
    exercise_name = models.CharField(max_length=200) # Ex: "Supino Reto"
    weight_kg = models.FloatField()
    reps = models.IntegerField(default=1, help_text="Foi 1RM? 3RM? 5RM?")
    date = models.DateField()
    video = models.FileField(upload_to='pr_videos/', null=True, blank=True) # Opcional: vídeo do feito

    def __str__(self):
        return f"PR: {self.exercise_name} - {self.weight_kg}kg"

# --- 4. MENTAL (Roda da Vida e Diário) ---
class LifeAssessment(models.Model):
    """
    A base para gerar o gráfico da 'Roda da Vida'.
    Notas de 1 a 10.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='life_assessments')
    date = models.DateField(auto_now_add=True)
    
    # As Fatias da Roda (pode personalizar)
    health_score = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    career_score = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    financial_score = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    social_score = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    family_score = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    love_score = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    spiritual_score = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    intellectual_score = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    
    notes = models.TextField(blank=True, help_text="Resumo da semana/mês")

class JournalEntry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='journal_entries')
    date = models.DateTimeField(auto_now_add=True)
    content = models.TextField()
    mood_rating = models.IntegerField(choices=[
        (1, '😭'), (2, '😕'), (3, '😐'), (4, '🙂'), (5, '🤩')
    ])

class WorkoutTemplate(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workout_templates')
    name = models.CharField(max_length=100, help_text="Ex: Treino A - Peito")
    # Guardamos a estrutura exata da tabela (Exercício, Sets, Reps, Carga, Tempo)
    exercises_data = models.TextField(default="[]") 
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.user.username})"