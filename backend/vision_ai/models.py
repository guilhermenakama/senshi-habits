from django.db import models
from django.contrib.auth.models import User

class Analysis(models.Model):
    # CRÍTICO: Associar análise ao usuário para isolamento multi-tenant
    # null=True temporariamente para permitir migração de dados antigos
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='analyses', null=True)

    # O upload_to define a pasta dentro do Bucket S3
    image = models.ImageField(upload_to='analysis_images/')

    # O texto que o Gemini devolve
    result = models.TextField(blank=True, null=True)

    # Data da criação
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return f"Análise de {self.user.username} - {self.created_at}"