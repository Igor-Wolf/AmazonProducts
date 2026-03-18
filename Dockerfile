# 1. Imagem base (LTS do Node.js em versão leve/alpine)
FROM node:20-alpine

# 2. Define o diretório de trabalho dentro do container
WORKDIR /app

# 3. Copia primeiro os arquivos de dependências
# Isso aproveita o cache do Docker; se você não mudar as dependências, 
# ele não rodará o 'npm install' novamente no próximo build.
COPY package*.json ./

# 4. Instala as dependências (omitindo pacotes de desenvolvimento se preferir)
RUN npm install --production

# 5. Copia o restante da aplicação
COPY . .

# 6. Expor a porta que o seu servidor Node/Express/Nest escuta
# (Geralmente 3000 ou 8080)
EXPOSE 3555

# 7. Comando para iniciar o servidor
# Certifique-se de que o script 'start' está definido no seu package.json
CMD ["npm", "start"]