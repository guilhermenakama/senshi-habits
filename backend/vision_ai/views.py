# backend/vision_ai/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .services import GeminiVisionService
from .models import Analysis
from rest_framework.permissions import IsAuthenticated
import google.generativeai as genai
import os
import tempfile

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


class TranscribeAudioView(APIView):
    """
    Endpoint para transcrever áudio usando Google Gemini
    """
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        # Validar se veio áudio
        if 'audio' not in request.FILES:
            return Response({"error": "Nenhum áudio enviado"}, status=400)

        audio_file = request.FILES['audio']

        # Validação de tamanho
        MAX_SIZE = 10 * 1024 * 1024  # 10MB
        if audio_file.size > MAX_SIZE:
            return Response({
                "error": "Áudio muito grande. Máximo: 10MB"
            }, status=400)

        try:
            # Configurar Gemini com Service Account
            from google.oauth2 import service_account
            import pathlib

            credentials_path = pathlib.Path(__file__).parent.parent / 'google_credentials.json'

            if credentials_path.exists():
                credentials = service_account.Credentials.from_service_account_file(
                    str(credentials_path),
                    scopes=['https://www.googleapis.com/auth/generative-language']
                )
                genai.configure(credentials=credentials)
            else:
                # Fallback para API key se não houver service account
                genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))

            # Salvar temporariamente o áudio
            with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as temp_audio:
                for chunk in audio_file.chunks():
                    temp_audio.write(chunk)
                temp_path = temp_audio.name

            try:
                # Upload do arquivo para o Gemini
                uploaded_file = genai.upload_file(temp_path)

                # Usar o modelo Gemini Pro para transcrição de áudio
                # (Flash não suporta áudio, mas Pro sim)
                model = genai.GenerativeModel('gemini-1.5-pro')

                # Prompt para transcrição
                prompt = """
                Por favor, transcreva o áudio em português brasileiro.
                Retorne apenas a transcrição, sem comentários ou formatação extra.
                """

                response = model.generate_content([uploaded_file, prompt])
                transcription = response.text.strip()

                # Limpar arquivo temporário
                os.unlink(temp_path)

                return Response({
                    "transcription": transcription,
                    "success": True
                })

            except Exception as e:
                # Limpar arquivo temporário em caso de erro
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
                raise e

        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Erro ao transcrever áudio: {str(e)}", exc_info=True)
            return Response({
                "error": "Erro ao transcrever áudio. Tente novamente."
            }, status=500)