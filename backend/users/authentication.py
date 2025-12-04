from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()


class EmailOrUsernameBackend(ModelBackend):
    """
    Permite autenticação com email ou username
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            return None

        try:
            # Tenta encontrar usuário por email primeiro
            if '@' in username:
                user = User.objects.get(email=username)
            else:
                # Senão, busca por username
                user = User.objects.get(username=username)
        except User.DoesNotExist:
            return None

        # Verifica a senha
        if user.check_password(password):
            return user

        return None
