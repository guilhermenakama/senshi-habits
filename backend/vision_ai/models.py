from django.db import models

class Analysis(models.Model):
    # O upload_to define a pasta dentro do Bucket S3
    image = models.ImageField(upload_to='analysis_images/')
    
    # O texto que o Gemini devolve
    result = models.TextField(blank=True, null=True)
    
    # Data da criação
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Análise de {self.created_at}"