from rest_framework import viewsets, permissions
from django.db.models import Q, Max
from datetime import timedelta
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Habit, HabitLog, Workout, PersonalRecord, BodyMeasurement, LifeAssessment, JournalEntry, WorkoutTemplate, Exercise
from .serializers import (
    HabitSerializer, HabitLogSerializer, WorkoutSerializer, 
    PersonalRecordSerializer, BodyMeasurementSerializer, ExerciseSerializer,
    LifeAssessmentSerializer, JournalEntrySerializer, WorkoutTemplateSerializer
)

class BaseUserViewSet(viewsets.ModelViewSet):
    """Classe base para filtrar dados apenas do usuário logado"""
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filtra pela FK (user) que está nos modelos
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user) # Associa o dado ao usuário logado


# 1. Habit ViewSet (Lista Mestra)
class HabitViewSet(BaseUserViewSet):
    queryset = Habit.objects.all()
    serializer_class = HabitSerializer
    
    # Aqui permitimos criar o hábito, mas não implementamos o filtro de usuário, 
    # pois a lista mestra de hábitos deve ser a mesma para todos (ou global).
    # Vamos manter o filtro padrão do BaseUserViewSet para ver apenas os próprios.

# 2. HabitLog ViewSet (Check-in Diário)
class DailyHabitLogViewSet(viewsets.ModelViewSet):
    serializer_class = HabitLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filtra logs pelo usuário logado E pela data de hoje
        today = timezone.localdate()
        return HabitLog.objects.filter(user=self.request.user, date=today)

    def perform_create(self, serializer):
        # Garante que o log é salvo com o usuário logado e a data de hoje
        serializer.save(user=self.request.user, date=timezone.localdate())

class HabitLogViewSet(BaseUserViewSet): # Adicionei este para podermos marcar o hábito
    queryset = HabitLog.objects.all()
    serializer_class = HabitLogSerializer

class WorkoutViewSet(BaseUserViewSet):
    queryset = Workout.objects.all()
    serializer_class = WorkoutSerializer

class PRViewSet(BaseUserViewSet):
    queryset = PersonalRecord.objects.all()
    serializer_class = PersonalRecordSerializer

class BodyMeasurementViewSet(BaseUserViewSet):
    queryset = BodyMeasurement.objects.all()
    serializer_class = BodyMeasurementSerializer

class LifeAssessmentViewSet(BaseUserViewSet):
    queryset = LifeAssessment.objects.all()
    serializer_class = LifeAssessmentSerializer

class JournalViewSet(BaseUserViewSet):
    queryset = JournalEntry.objects.all()
    serializer_class = JournalEntrySerializer

class WorkoutTemplateViewSet(BaseUserViewSet):
    queryset = WorkoutTemplate.objects.all()
    serializer_class = WorkoutTemplateSerializer

class ExerciseViewSet(viewsets.ModelViewSet):
    serializer_class = ExerciseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Retorna exercícios criados pelo usuário OU exercícios públicos (user=None)
        return Exercise.objects.filter(Q(user=self.request.user) | Q(user__isnull=True))

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class WeeklyWorkoutStats(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # 1. Define o período da semana (Segunda a Domingo)
        today = timezone.localdate()
        weekday = today.weekday() # 0 = Segunda, 6 = Domingo
        
        # Início da semana (data da última Segunda-feira)
        start_of_week = today - timedelta(days=weekday) 
        # Fim da semana (data do próximo Domingo)
        end_of_week = start_of_week + timedelta(days=6) 
        
        # 2. CONTAGEM
        workout_count = Workout.objects.filter(
            user=request.user,
            date_time__date__gte=start_of_week, # Maior ou igual ao início da semana
            date_time__date__lte=end_of_week,   # Menor ou igual ao final da semana
        ).count()
        
        # 3. TARGET (Para teste, 5. Ver seção 3 para personalização)
        weekly_target = 5 
        
        return Response({
            'count': workout_count,
            'target': weekly_target,
        })

class PRHistoryView(APIView):
    """
    Retorna o melhor PR (peso máximo) para cada exercício feito pelo usuário.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        # 1. Filtra os PRs do usuário e agrupa pelo nome do exercício.
        # 2. Encontra o peso máximo (Max('weight_kg')) para cada grupo.
        # 3. Anota esse peso máximo como 'best_weight'.
        pr_history = PersonalRecord.objects.filter(user=user).values(
            'exercise_name'
        ).annotate(
            best_weight=Max('weight_kg'),
            # Pega o ID do registro mais recente para ter acesso à data/reps
            # (Essa parte é mais complexa em SQL puro, mas simplificamos aqui)
            latest_record_id=Max('id')
        ).order_by('exercise_name')

        # Agora, para pegar os detalhes da data e reps do recorde:
        # Puxamos os objetos PersonalRecord completos baseados nos IDs
        detailed_history = []
        for pr_summary in pr_history:
            # Encontra o objeto completo que tem o ID do recorde mais recente
            latest_record = PersonalRecord.objects.get(id=pr_summary['latest_record_id'])

            detailed_history.append({
                'exercise_name': pr_summary['exercise_name'],
                'best_weight_kg': pr_summary['best_weight'],
                'latest_reps': latest_record.reps,
                'latest_date': latest_record.date.strftime('%Y-%m-%d'),
            })

        return Response(detailed_history)

class HabitStatsView(APIView):
    """
    Retorna estatísticas reais de hábitos: completados hoje, semana, streak atual, score geral
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from datetime import date, datetime
        from django.db.models import Count, Q

        user = request.user
        today = timezone.localdate()

        # 1. Total de hábitos ativos do usuário
        total_habits = Habit.objects.filter(user=user).count()

        # 2. Hábitos completados HOJE
        completed_today = HabitLog.objects.filter(
            user=user,
            date=today,
            completed=True
        ).count()

        # 3. Ações da semana (últimos 7 dias)
        week_start = today - timedelta(days=6)
        completed_week = HabitLog.objects.filter(
            user=user,
            date__gte=week_start,
            date__lte=today,
            completed=True
        ).count()

        # 4. Calcular streak (dias consecutivos)
        streak = 0
        check_date = today
        while True:
            # Verifica se teve pelo menos 1 hábito completado nesse dia
            day_completed = HabitLog.objects.filter(
                user=user,
                date=check_date,
                completed=True
            ).exists()

            if day_completed:
                streak += 1
                check_date -= timedelta(days=1)
            else:
                break

            # Limite de segurança (não verificar mais de 365 dias)
            if streak > 365:
                break

        # 5. Score geral (0-100) baseado em múltiplos fatores
        # Fatores: taxa de conclusão de hábitos, streak, consistência semanal
        completion_rate = (completed_today / total_habits * 100) if total_habits > 0 else 0
        streak_bonus = min(streak * 2, 30)  # Max 30 pontos de streak
        week_consistency = min(completed_week / 7 * 20, 20)  # Max 20 pontos

        score = min(int(completion_rate * 0.5 + streak_bonus + week_consistency), 100)

        # 6. Treinos da semana
        workout_count = Workout.objects.filter(
            user=user,
            date_time__date__gte=week_start,
            date_time__date__lte=today
        ).count()

        return Response({
            'total_habits': total_habits,
            'completed_today': completed_today,
            'completed_week': completed_week,
            'streak': streak,
            'score': score,
            'workout_count': workout_count,
            'completion_rate_today': round(completion_rate, 1)
        })

class ProgressComparisonView(APIView):
    """
    Compara progresso entre períodos: mês passado, últimos 3/6/12 meses, ou período customizado
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from datetime import date
        from dateutil.relativedelta import relativedelta

        user = request.user
        today = timezone.localdate()

        # Parâmetros: period = 'month' | '3months' | '6months' | 'year' | 'custom'
        # Se custom: start_date e end_date
        period = request.GET.get('period', 'month')

        if period == 'custom':
            try:
                custom_days = int(request.GET.get('days', 30))
                current_start = today - timedelta(days=custom_days)
                current_end = today
                previous_start = current_start - timedelta(days=custom_days)
                previous_end = current_start - timedelta(days=1)
            except:
                return Response({'error': 'Invalid custom period'}, status=400)
        else:
            period_map = {
                'month': 1,
                '3months': 3,
                '6months': 6,
                'year': 12
            }
            months = period_map.get(period, 1)

            current_start = today - relativedelta(months=months)
            current_end = today
            previous_start = current_start - relativedelta(months=months)
            previous_end = current_start - timedelta(days=1)

        # Calcular métricas para período atual
        current_habits = HabitLog.objects.filter(
            user=user,
            date__gte=current_start,
            date__lte=current_end,
            completed=True
        ).count()

        current_workouts = Workout.objects.filter(
            user=user,
            date_time__date__gte=current_start,
            date_time__date__lte=current_end
        ).count()

        # Calcular métricas para período anterior
        previous_habits = HabitLog.objects.filter(
            user=user,
            date__gte=previous_start,
            date__lte=previous_end,
            completed=True
        ).count()

        previous_workouts = Workout.objects.filter(
            user=user,
            date_time__date__gte=previous_start,
            date_time__date__lte=previous_end
        ).count()

        # Calcular variações percentuais
        habits_change = ((current_habits - previous_habits) / previous_habits * 100) if previous_habits > 0 else 0
        workouts_change = ((current_workouts - previous_workouts) / previous_workouts * 100) if previous_workouts > 0 else 0

        return Response({
            'period': period,
            'current_period': {
                'start': current_start.isoformat(),
                'end': current_end.isoformat(),
                'habits_completed': current_habits,
                'workouts_completed': current_workouts
            },
            'previous_period': {
                'start': previous_start.isoformat(),
                'end': previous_end.isoformat(),
                'habits_completed': previous_habits,
                'workouts_completed': previous_workouts
            },
            'comparison': {
                'habits_change_percent': round(habits_change, 1),
                'workouts_change_percent': round(workouts_change, 1),
                'habits_trend': 'up' if habits_change > 0 else 'down' if habits_change < 0 else 'stable',
                'workouts_trend': 'up' if workouts_change > 0 else 'down' if workouts_change < 0 else 'stable'
            }
        })

class BodyMetricsView(APIView):
    """
    GET: Retorna evolução de métricas corporais ao longo do tempo
    POST: Cria nova medição corporal
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        # Parâmetro opcional: limit (quantas medições retornar, padrão 12)
        limit = int(request.GET.get('limit', 12))

        measurements = BodyMeasurement.objects.filter(
            user=user
        ).order_by('-date')[:limit]

        # Inverter para ordem cronológica
        measurements = reversed(list(measurements))

        data = []
        for m in measurements:
            muscle_mass_percentage = None
            if m.muscle_mass_kg and m.weight_kg:
                muscle_mass_percentage = round((m.muscle_mass_kg / m.weight_kg) * 100, 1)

            data.append({
                'date': m.date.isoformat(),
                'weight_kg': m.weight_kg,
                'fat_percentage': m.fat_mass_percentage,
                'muscle_mass_kg': m.muscle_mass_kg,
                'muscle_mass_percentage': muscle_mass_percentage,
                'bmi': m.calculate_bmi(),
                'bmr': m.calculate_bmr(),
                'notes': m.notes,
                'has_photos': bool(m.photo_front or m.photo_back)
            })

        # Calcular tendências
        if len(data) >= 2:
            weight_trend = data[-1]['weight_kg'] - data[0]['weight_kg']
            fat_trend = (data[-1]['fat_percentage'] - data[0]['fat_percentage']) if data[-1]['fat_percentage'] and data[0]['fat_percentage'] else None
        else:
            weight_trend = 0
            fat_trend = None

        return Response({
            'measurements': data,
            'trends': {
                'weight_change_kg': round(weight_trend, 1),
                'fat_change_percent': round(fat_trend, 1) if fat_trend else None
            },
            'latest': data[-1] if data else None
        })

    def post(self, request):
        """
        Cria uma nova medição corporal
        """
        user = request.user

        # Validar campos obrigatórios
        weight_kg = request.data.get('weight_kg')
        if not weight_kg:
            return Response({'error': 'Peso é obrigatório'}, status=400)

        try:
            weight_kg = float(weight_kg)
        except ValueError:
            return Response({'error': 'Peso inválido'}, status=400)

        # Campos opcionais
        muscle_mass_kg = request.data.get('muscle_mass_kg')
        fat_mass_percentage = request.data.get('fat_mass_percentage')
        date = request.data.get('date')
        notes = request.data.get('notes', '')

        # Converter campos opcionais
        if muscle_mass_kg:
            try:
                muscle_mass_kg = float(muscle_mass_kg)
            except ValueError:
                return Response({'error': 'Massa magra inválida'}, status=400)

        if fat_mass_percentage:
            try:
                fat_mass_percentage = float(fat_mass_percentage)
            except ValueError:
                return Response({'error': 'Percentual de gordura inválido'}, status=400)

        # Usar data de hoje se não fornecida
        if not date:
            from datetime import date as date_cls
            date = date_cls.today()

        # Criar medição
        measurement = BodyMeasurement.objects.create(
            user=user,
            date=date,
            weight_kg=weight_kg,
            muscle_mass_kg=muscle_mass_kg,
            fat_mass_percentage=fat_mass_percentage,
            notes=notes
        )

        # Calcular porcentagem de massa magra
        muscle_mass_percentage = None
        if measurement.muscle_mass_kg and measurement.weight_kg:
            muscle_mass_percentage = round((measurement.muscle_mass_kg / measurement.weight_kg) * 100, 1)

        return Response({
            'id': measurement.id,
            'date': measurement.date.isoformat(),
            'weight_kg': measurement.weight_kg,
            'muscle_mass_kg': measurement.muscle_mass_kg,
            'fat_percentage': measurement.fat_mass_percentage,
            'muscle_mass_percentage': muscle_mass_percentage,
            'bmi': measurement.calculate_bmi(),
            'bmr': measurement.calculate_bmr(),
            'notes': measurement.notes,
            'message': 'Medição cadastrada com sucesso!'
        }, status=201)