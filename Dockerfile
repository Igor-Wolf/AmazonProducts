# 1. Usamos a imagem oficial do Playwright (já vem com Node, Browsers e Libs)
FROM mcr.microsoft.com/playwright:v1.42.1-jammy

# Define o diretório de trabalho
WORKDIR /app

# 2. Copia os arquivos de dependências
COPY package*.json ./

# 3. Instala as dependências do seu projeto
# Nota: Não precisamos rodar 'npx playwright install' aqui porque 
# os browsers já estão na imagem base!
RUN npm install

# 4. Copia o restante do seu código
COPY . .

# 5. Gera o build (pasta /dist)
RUN npm run dist

# 6. Limpeza (Opcional)
RUN npm prune --production

# Expõe a porta da sua API
EXPOSE 3333

# Comando para iniciar
CMD ["node", "dist/server.js"]