from django.contrib import admin
from .models import UserProfile, AIInsight, Conversation, Message


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'mbti_type', 'disc_type', 'ai_coaching_enabled', 'created_at']
    list_filter = ['mbti_type', 'disc_type', 'ai_coaching_enabled']
    search_fields = ['user__username', 'user__email']


@admin.register(AIInsight)
class AIInsightAdmin(admin.ModelAdmin):
    list_display = ['user', 'insight_type', 'title', 'priority', 'is_read', 'created_at']
    list_filter = ['insight_type', 'priority', 'is_read', 'is_dismissed']
    search_fields = ['user__username', 'title', 'content']
    date_hierarchy = 'created_at'


class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    fields = ['role', 'content', 'created_at']
    readonly_fields = ['created_at']


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['user', 'ai_type', 'title', 'created_at', 'updated_at']
    list_filter = ['ai_type', 'created_at']
    search_fields = ['user__username', 'title']
    date_hierarchy = 'created_at'
    inlines = [MessageInline]


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['conversation', 'role', 'content_preview', 'created_at']
    list_filter = ['role', 'created_at']
    search_fields = ['content', 'conversation__title']
    date_hierarchy = 'created_at'

    def content_preview(self, obj):
        return obj.content[:100] + "..." if len(obj.content) > 100 else obj.content
    content_preview.short_description = 'Conteúdo'
