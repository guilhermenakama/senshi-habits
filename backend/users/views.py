from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import UserProfile, AIInsight, Conversation, Message
from .serializers import (
    UserProfileSerializer, AIInsightSerializer, UserRegistrationSerializer,
    EmailOrUsernameTokenObtainPairSerializer, ConversationSerializer,
    ConversationListSerializer, MessageSerializer
)


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


class ConversationViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar conversas com IAs especializadas
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'list':
            return ConversationListSerializer
        return ConversationSerializer

    def create(self, request, *args, **kwargs):
        """
        Cria nova conversa com uma IA especializada
        """
        ai_type = request.data.get('ai_type')

        if ai_type not in ['nutritionist', 'personal_trainer', 'mentor']:
            return Response(
                {"error": "Tipo de IA inválido. Use: nutritionist, personal_trainer ou mentor"},
                status=status.HTTP_400_BAD_REQUEST
            )

        conversation = Conversation.objects.create(
            user=request.user,
            ai_type=ai_type,
            title="Nova Conversa"  # Será atualizado com a primeira mensagem
        )

        serializer = ConversationSerializer(conversation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        """
        Envia mensagem e recebe resposta da IA
        """
        from .services import AIChatService

        conversation = self.get_object()
        user_message_content = request.data.get('message', '').strip()

        if not user_message_content:
            return Response(
                {"error": "Mensagem não pode estar vazia"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Criar mensagem do usuário
        user_message = Message.objects.create(
            conversation=conversation,
            role='user',
            content=user_message_content
        )

        # Gerar resposta da IA
        ai_service = AIChatService(user=request.user, ai_type=conversation.ai_type)
        ai_response_content, context_used = ai_service.generate_chat_response(
            conversation=conversation,
            user_message=user_message_content
        )

        # Criar mensagem da IA
        ai_message = Message.objects.create(
            conversation=conversation,
            role='assistant',
            content=ai_response_content,
            context_used=context_used
        )

        # Se for a primeira mensagem, gerar título da conversa
        if conversation.messages.count() == 2:  # User + Assistant
            title = ai_service.generate_conversation_title(user_message_content)
            conversation.title = title
            conversation.save()

        # Retornar conversa atualizada
        serializer = ConversationSerializer(conversation)
        return Response(serializer.data)

    @action(detail=True, methods=['delete'])
    def clear_history(self, request, pk=None):
        """
        Limpa o histórico de mensagens da conversa
        """
        conversation = self.get_object()
        conversation.messages.all().delete()
        conversation.title = "Nova Conversa"
        conversation.save()

        return Response({"message": "Histórico limpo com sucesso"})

    @action(detail=False, methods=['get'])
    def by_ai_type(self, request):
        """
        Lista conversas filtradas por tipo de IA
        """
        ai_type = request.query_params.get('type')

        if not ai_type:
            return Response(
                {"error": "Parâmetro 'type' é obrigatório"},
                status=status.HTTP_400_BAD_REQUEST
            )

        conversations = self.get_queryset().filter(ai_type=ai_type)
        serializer = ConversationListSerializer(conversations, many=True)
        return Response(serializer.data)
