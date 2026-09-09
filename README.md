# Realchat

Aplicação de chat em tempo real, feita para praticar e demonstrar desenvolvimento
backend com Node.js. Usuários se cadastram, criam ou entram em canais públicos,
conversam em tempo real via WebSockets, trocam mensagens diretas e compartilham
imagens, vídeos e emojis.

## Stack

**Backend:** Node.js, TypeScript, Fastify, Socket.IO, PostgreSQL (via Drizzle ORM),
JWT para autenticação, Zod para validação.

**Frontend:** React, Vite, TypeScript, Zustand, Socket.IO Client.

## Funcionalidades

- Cadastro e login (usuário e senha)
- Canais públicos: criar, listar e entrar
- Mensagens em tempo real dentro de um canal
- Mensagens diretas (privadas) entre usuários
- Indicador de "digitando..." e de usuários online
- Envio de imagens e vídeos como anexo
- Seletor de emojis
- Histórico de mensagens persistido no banco, com paginação

## Rodando localmente

Pré-requisitos: Node.js 20+, Docker.

```bash
# suba o banco de dados
docker compose up -d postgres

# instale as dependências
npm install --workspace=server
npm install --workspace=client

# configure as variáveis de ambiente
cp server/.env.example server/.env
cp client/.env.example client/.env

# rode as migrações
npm run db:migrate --workspace=server

# em dois terminais separados
npm run dev --workspace=server
npm run dev --workspace=client
```

A aplicação fica disponível em `http://localhost:5173`.

## Rodando com Docker Compose (stack completa)

```bash
docker compose up --build
```

O frontend fica em `http://localhost:4173` e a API em `http://localhost:3000`.

## Testes

```bash
npm run test --workspace=server
```

## Decisões e simplificações

- Uploads são salvos em disco local (`server/uploads`) - em produção o ideal
  seria um serviço de armazenamento de objetos (S3 ou equivalente).
- Não há verificação de e-mail nem recuperação de senha - o cadastro é só
  usuário e senha, focado em demonstrar o fluxo de autenticação.
- Uma única instância do Socket.IO - sem adaptador Redis para múltiplas
  instâncias, o que seria necessário em um cenário de produção com mais tráfego.
