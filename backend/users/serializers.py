from rest_framework import serializers
from .models import UserProfile, AIInsight
from django.contrib.auth.models import User


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
