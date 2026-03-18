# 1. Mudamos de alpine para slim (Debian), que é compatível com os navegadores
FROM node:20-slim

WORKDIR /app

# Instala dependências do sistema necessárias para o Playwright no Linux
# Isso evita erros de "missing shared libraries"
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

# 2. Instala as dependências do projeto
RUN npm install

# 3. Instala o binário do Chromium E as dependências de sistema dele
# O comando --with-deps é o segredo aqui
RUN npx playwright install --with-deps chromium

COPY . .

# 4. Gera o build do projeto
RUN npm run dist

# 5. Remove dependências de dev (Opcional, mas cuidado se o Playwright sumir)
# Se o seu 'npm run dist' já gerou tudo, isso ajuda no espaço.
RUN npm prune --production

EXPOSE 3333

# O Docker passará as variáveis de ambiente do seu arquivo .env automaticamente 
# se você rodar com --env-file no comando do docker run
CMD ["node", "dist/server.js"]