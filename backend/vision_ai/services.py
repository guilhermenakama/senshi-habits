import google.generativeai as genai
from decouple import config
from PIL import Image

class GeminiVisionService:
    def __init__(self):
        # 1. Configura a chave pegando do arquivo .env (Segurança!)
        api_key = config('GEMINI_API_KEY')
        genai.configure(api_key=api_key)
        
        # 2. Escolhe o modelo. O 'flash' é mais rápido e barato para testes.
        self.model = genai.GenerativeModel('gemini-2.5-flash')

    def analyze_image(self, image_file):
        """
        Recebe um arquivo de imagem (em memória), envia pro Gemini
        e retorna a descrição.
        """
        try:
            # Abre a imagem usando PIL (Python Imaging Library)
            img = Image.open(image_file)
            
            # O Prompt que enviamos para a IA
            prompt = """
                Atue como um Nutricionista Esportivo de alta precisão.
                Analise a imagem enviada (prato de comida).
                Identifique cada alimento visível.
                Estime a quantidade (gramas ou unidades) visualmente.
                Calcule as calorias aproximadas e os macronutrientes (Proteína, Carbo, Gordura).
                No final, some tudo e dê o total da refeição.
                Formate a resposta de forma limpa e legível.
                Se a imagem não for comida, diga "Isso não parece ser comida".
                """
            
            # Envia para o Gemini
            response = self.model.generate_content([prompt, img])
            
            return response.text
        except Exception as e:
            print(f"Erro no Gemini: {e}")
            return "Desculpe, não consegui identificar a imagem no momento."