from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Certifique-se de que todas as ViewSets estão disponíveis no arquivo views.py
router = DefaultRouter()

# --- 1. ROTAS BASEADAS EM VIEWS (CRUD PADRÃO) ---
# Essas rotas são criadas pelo DefaultRouter (e devem ser executadas ANTES de urlpatterns)

router.register(r'habits', views.HabitViewSet, basename='habit')
router.register(r'daily-habits', views.DailyHabitLogViewSet, basename='daily-habit')
router.register(r'habit-logs', views.DailyHabitLogViewSet, basename='habit-log-all')
router.register(r'workouts', views.WorkoutViewSet, basename='workout')
router.register(r'prs', views.PRViewSet, basename='pr')              
router.register(r'body-measurements', views.BodyMeasurementViewSet, basename='measurement')
router.register(r'life-assessments', views.LifeAssessmentViewSet, basename='assessment')  
router.register(r'journal', views.JournalViewSet, basename='journal')
router.register(r'templates', views.WorkoutTemplateViewSet, basename='template') # Rota de Templates
router.register(r'exercises', views.ExerciseViewSet, basename='exercise') # Rota de Biblioteca de Exercícios

# --- 2. URLS DO PROJETO ---
urlpatterns = [
    # Rotas personalizadas (que não são CRUD, como estatísticas semanais)
    path('workout-stats/weekly/', views.WeeklyWorkoutStats.as_view(), name='weekly-workout-stats'),
    path('habit-stats/', views.HabitStatsView.as_view(), name='habit-stats'),
    path('progress-comparison/', views.ProgressComparisonView.as_view(), name='progress-comparison'),
    path('body-metrics/', views.BodyMetricsView.as_view(), name='body-metrics'),
    path('pr-history/', views.PRHistoryView.as_view(), name='pr-history'),

    # Rota principal: Inclui todas as URLs registradas no DefaultRouter acima
    path('', include(router.urls)),
]