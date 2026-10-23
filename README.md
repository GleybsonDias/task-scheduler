# 📱 Taskly - Smart Task Scheduler

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Ionic](https://img.shields.io/badge/Ionic-3880FF?style=for-the-badge&logo=ionic&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

Taskly é uma aplicação *full-stack mobile-first* de gestão e agendamento de tarefas. Construída para oferecer uma experiência fluida nativa através do Ionic/Capacitor, a aplicação conta com um backend robusto em Node.js contentorizado via Docker e um banco de dados PostgreSQL serverless na nuvem (Neon).

## ✨ Funcionalidades Principais

- **Autenticação Segura:** Sistema de Login e Registo utilizando JWT (JSON Web Tokens).
- **Gestão de Tarefas (CRUD):** Criação, leitura, atualização e exclusão de tarefas diárias.
- **Experiência Nativa:** Interface responsiva e otimizada para dispositivos móveis (Android/iOS) utilizando Ionic e Angular Standalone Components.
- **Backend Contentorizado:** API isolada com Docker e Docker Compose, garantindo um ambiente de desenvolvimento padronizado.
- **Deploy Mobile Local:** Configuração de túnel reverso (Ngrok) para comunicação em tempo real entre o dispositivo físico e o backend local.

## 🛠️ Tecnologias e Arquitetura

### Frontend (Mobile & Web)
- **Framework:** Angular (Standalone Components) + Ionic Framework
- **Integração Nativa:** Capacitor
- **Gestão de Estado/Formulários:** Reactive Forms
- **Comunicação:** HTTP Client com Interceptors configurados para bypass de avisos de túnel e injeção de tokens JWT.

### Backend (API RESTful)
- **Plataforma:** Node.js com Express e TypeScript
- **ORM:** Prisma
- **Base de Dados:** PostgreSQL (Hospedado via Neon Cloud)
- **Segurança:** Bcrypt (Hash de senhas) e JWT.

### Infraestrutura & DevOps
- **Contentorização:** Docker & Docker Compose
- **Túnel de Rede:** Ngrok (Exposição da API local para testes mobile)
- **Versionamento:** Git & GitHub

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
Certifique-se de ter instalado em sua máquina:
- [Node.js](https://nodejs.org/) (v22+)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Ionic CLI](https://ionicframework.com/docs/cli) (`npm install -g @ionic/cli`)
- Conta gratuita no [Ngrok](https://ngrok.com/)

### 1. Clonar o Repositório
```bash
git clone https://github.com/[SEU_USUARIO]/taskly.git
cd taskly
```

### 2. Configurar Base de Dados (Neon) e Prisma
Crie um ficheiro `.env` na pasta `backend/` com as suas credenciais do **Neon Cloud**:
```env
DATABASE_URL="postgresql://usuario:senha@host.neon.tech/neondb?sslmode=require"
JWT_SECRET="sua_chave_secreta_aqui"
```

Instale as dependências locais do backend e envie o esquema do Prisma para o banco de dados remoto:
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
```

### 3. Iniciar o Backend (Docker)
Com o banco configurado, inicie o contentor:
```bash
docker-compose up --build
```
> A API estará a rodar na porta 3000.

### 4. Expor a API com o Ngrok
Num novo terminal, inicie o túnel para permitir que o dispositivo móvel comunique com o seu backend local:
```bash
ngrok http --domain=seu-dominio-aqui.ngrok-free.app 3000
```

### 5. Configurar o Frontend e Variáveis de Ambiente
Num novo terminal, instale as dependências do frontend:
```bash
cd frontend
npm install
```

Atualize a propriedade `apiUrl` com o seu domínio do Ngrok nos **dois** ficheiros de ambiente. Esta etapa é essencial para compilar o app mobile em modo de produção:

**`src/environments/environment.ts`**:
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://seu-dominio-aqui.ngrok-free.app'
};
```

**`src/environments/environment.prod.ts`**:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://seu-dominio-aqui.ngrok-free.app'
};
```

Para rodar no navegador (modo de desenvolvimento):
```bash
npx ionic serve
```

### 6. Compilar e Executar no Dispositivo Físico (Android)
Com o seu telemóvel Android conectado via cabo (com a Depuração USB ativada):
```bash
npm run build
npx cap sync
npx cap run android
```

## 👨‍💻 Autor

**[Seu Nome / Gleybson Dias]**
- LinkedIn: [linkedin.com/in/gleybson-dias](https://www.linkedin.com/in/gleybson-dias/)
- GitHub: [@seu-usuario](https://github.com/GleybsonDias)
- E-mail: gleybsondias.dev@gmail.com