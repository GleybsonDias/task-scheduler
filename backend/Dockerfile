FROM node:22-alpine

WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala todas as dependências (incluindo devDependencies para o build)
RUN npm install

# Copia a pasta prisma e gera o client
COPY prisma ./prisma
RUN npx prisma generate

# Copia o restante do código-fonte
COPY . .

# Compila o projeto (tsc)
RUN npm run build

# Expõe a porta que a API vai rodar
EXPOSE 3000

# Comando padrão para produção
CMD ["npm", "start"]