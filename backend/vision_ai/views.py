# backend/vision_ai/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .services import GeminiVisionService
from .models import Analysis
from rest_framework.permissions import IsAuthenticated

class HealthCheckView(APIView):
    def get(self, request):
        return Response({"status": "online", "message": "Vision AI Backend está rodando perfeitamente!"})

class AnalyzeImageView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        # 1. Valida se veio imagem
        if 'image' not in request.FILES:
            return Response({"error": "Nenhuma imagem enviada"}, status=400)

        image_file = request.FILES['image']
        
        try:
            # 2. SALVA NO BANCO (Isso aciona o MinIO automaticamente)
            analysis_obj = Analysis.objects.create(image=image_file)
            
            # 3. Chama a IA usando a imagem que acabamos de salvar
            # (Passamos o arquivo do objeto para garantir que lemos o mesmo que foi salvo)
            service = GeminiVisionService()
            result_text = service.analyze_image(analysis_obj.image)

            # 4. Atualiza o resultado no banco
            analysis_obj.result = result_text
            analysis_obj.save()

            # 5. RETORNA TUDO PARA O FRONT (ID, Link e Texto)
            return Response({
                "id": analysis_obj.id,
                "image_url": analysis_obj.image.url,  # <--- O Front precisa disso
                "description": result_text,
                "created_at": analysis_obj.created_at
            })

        except Exception as e:
            print(f"Erro no processamento: {e}")
            return Response({"error": "Erro interno ao processar imagem"}, status=500)