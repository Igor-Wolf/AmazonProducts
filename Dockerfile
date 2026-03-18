FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# 1. Instala TUDO para poder buildar
RUN npm install

COPY . .

# 2. Gera a pasta /dist
RUN npm run dist

# 3. Remove dependências de desenvolvimento para economizar espaço
RUN npm prune --production

# Ajuste a porta para a que o seu Node realmente usa (vimos que no seu env era 3333)
EXPOSE 3333

# 4. CORREÇÃO: Removemos a flag --env-file do Node. 
# O Docker injetará as variáveis automaticamente.
CMD ["node", "dist/server.js"]