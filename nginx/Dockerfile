FROM nginx:alpine

# Remover configuração padrão
RUN rm /etc/nginx/conf.d/default.conf

# Copiar configuração customizada
COPY nginx.conf /etc/nginx/conf.d/

# Copiar arquivos do frontend
COPY ../frontend/dist /usr/share/nginx/html

# Expor portas
EXPOSE 80 443
