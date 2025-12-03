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

        # CRÍTICO: Validação de tamanho e tipo
        MAX_SIZE = 5 * 1024 * 1024  # 5MB
        ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

        if image_file.size > MAX_SIZE:
            return Response({
                "error": f"Imagem muito grande. Máximo: 5MB"
            }, status=400)

        if image_file.content_type not in ALLOWED_TYPES:
            return Response({
                "error": "Tipo de arquivo não permitido. Use: JPEG, PNG ou WebP"
            }, status=400)

        try:
            # Validar integridade da imagem
            from PIL import Image
            try:
                img = Image.open(image_file)
                img.verify()
                image_file.seek(0)
            except Exception:
                return Response({
                    "error": "Arquivo corrompido ou não é uma imagem válida"
                }, status=400)

            # 2. CRÍTICO: SALVA NO BANCO ASSOCIADO AO USUÁRIO
            analysis_obj = Analysis.objects.create(
                user=request.user,  # CORREÇÃO: Associar ao usuário logado
                image=image_file
            )

            # 3. Chama a IA usando a imagem que acabamos de salvar
            service = GeminiVisionService()
            result_text = service.analyze_image(analysis_obj.image)

            # 4. Atualiza o resultado no banco
            analysis_obj.result = result_text
            analysis_obj.save()

            # 5. RETORNA TUDO PARA O FRONT (ID, Link e Texto)
            return Response({
                "id": analysis_obj.id,
                "image_url": analysis_obj.image.url,
                "description": result_text,
                "created_at": analysis_obj.created_at
            })

        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Erro ao processar imagem", exc_info=True)
            return Response({"error": "Erro interno ao processar imagem"}, status=500)