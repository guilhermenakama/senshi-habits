from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import UserProfile, AIInsight
from .serializers import UserProfileSerializer, AIInsightSerializer, UserRegistrationSerializer, EmailOrUsernameTokenObtainPairSerializer


class UserRegistrationView(generics.CreateAPIView):
    """
    Endpoint público para registro de novos usuários
    """
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response({
            "message": "Usuário criado com sucesso!",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name
            }
        }, status=status.HTTP_201_CREATED)


class EmailOrUsernameTokenObtainPairView(TokenObtainPairView):
    """
    View customizada para login com email ou username
    """
    serializer_class = EmailOrUsernameTokenObtainPairSerializer


class UserProfileViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)

    def get_object(self):
        # Retorna ou cria o perfil do usuário logado
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile

    def list(self, request, *args, **kwargs):
        # Retorna apenas o perfil do usuário logado
        profile = self.get_object()
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        # Não permite criar novo perfil, apenas atualizar
        profile = self.get_object()
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        profile = self.get_object()
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def generate_insights(self, request):
        """
        Endpoint para gerar insights da IA baseado no perfil atual
        """
        from .services import AICoachService

        profile = self.get_object()

        if not profile.ai_coaching_enabled:
            return Response(
                {"detail": "AI Coaching está desativado para este usuário"},
                status=status.HTTP_400_BAD_REQUEST
            )

        coach = AICoachService(user=request.user)
        insights = coach.generate_daily_insights()

        return Response({
            "message": f"{len(insights)} insights gerados com sucesso",
            "insights": AIInsightSerializer(insights, many=True).data
        })


class AIInsightViewSet(viewsets.ModelViewSet):
    serializer_class = AIInsightSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = AIInsight.objects.filter(user=self.request.user)

        # Filtros
        is_read = self.request.query_params.get('is_read')
        is_dismissed = self.request.query_params.get('is_dismissed')
        insight_type = self.request.query_params.get('type')

        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')

        if is_dismissed is not None:
            queryset = queryset.filter(is_dismissed=is_dismissed.lower() == 'true')

        if insight_type:
            queryset = queryset.filter(insight_type=insight_type)

        return queryset

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        insight = self.get_object()
        insight.is_read = True
        insight.save()
        return Response({"detail": "Insight marcado como lido"})

    @action(detail=True, methods=['post'])
    def dismiss(self, request, pk=None):
        insight = self.get_object()
        insight.is_dismissed = True
        insight.save()
        return Response({"detail": "Insight dispensado"})

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = AIInsight.objects.filter(
            user=request.user,
            is_read=False,
            is_dismissed=False
        ).count()
        return Response({"count": count})
