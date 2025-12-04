from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import UserProfile, AIInsight
from django.contrib.auth.models import User
from django.contrib.auth import authenticate


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name']
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este email já está cadastrado.")
        return value

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "As senhas não coincidem."})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', '')
        )
        # Criar perfil automaticamente
        UserProfile.objects.create(user=user)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            'id', 'username', 'mbti_type', 'disc_type', 'enneagram_type',
            'enneagram_wing', 'goals', 'challenges', 'motivation_style',
            'triggers', 'preferred_communication', 'ai_coaching_enabled',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AIInsightSerializer(serializers.ModelSerializer):
    insight_type_display = serializers.CharField(source='get_insight_type_display', read_only=True)

    class Meta:
        model = AIInsight
        fields = [
            'id', 'insight_type', 'insight_type_display', 'title', 'content',
            'priority', 'context_data', 'is_read', 'is_dismissed', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Permite login com email ou username
    """
    username_field = 'username'  # Mantém o nome do campo como 'username'

    def validate(self, attrs):
        # Pega o valor do campo username (que pode ser email ou username)
        username_or_email = attrs.get('username')
        password = attrs.get('password')

        # Usa o backend customizado para autenticar
        user = authenticate(
            request=self.context.get('request'),
            username=username_or_email,
            password=password
        )

        if user is None:
            raise serializers.ValidationError('Credenciais inválidas')

        # Continua com a validação normal do JWT
        refresh = self.get_token(user)

        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

        return data
