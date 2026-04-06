# ChatApp

Aplicação de chat em tempo real com sistema de contatos, troca de mensagens e notificações via WebSocket.

---

## Features

Aplicação permite que usuários se cadastrem, adicionem contatos e troquem mensagens em tempo real.

- Registro e autenticação de usuários com JWT
- Envio e aceitação de solicitações de contato
- Mensagens em tempo real entre contatos via SignalR
- Marcação de mensagens como lidas com confirmação visual
- Notificações em tempo real de novas solicitações e mensagens

---

## Melhorias

- Token retornado do backend salvo em localstorage que fica suscetível script malicioso. Utilizar axios ou retornar cookies do backend e consumir nativamente com next.js
- Exibir badge de mensagens não lidas

---

### Arquitetura do Backend

O projeto segue uma arquitetura em camadas no backend, nos princípios de **Ports & Adapters (Hexagonal Architecture)**.

| Camada | Responsabilidade |
|--------|-----------------|
| `ChatApp.API` | Recebe requisições HTTP e eventos SignalR. Delega para a camada de aplicação. |
| `ChatApp.Application` | Implementa os casos de uso (envio de mensagem, aceita  solicitação de contato, etc.) usando interfaces dos ports. |
| `ChatApp.Domain` | Define as entidades (`User`, `Message`, `Contact`) e as interfaces dos repositórios e serviços. |
| `ChatApp.Infrastructure` | Implementa os repositórios com Entity Framework Core e o serviço de autenticação JWT com BCrypt. |

---

## Tecnologias

### Backend

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| .NET | 9.0 | Plataforma principal |
| ASP.NET Core | 9.0 | API REST |
| SignalR | — | WebSocket para tempo real |
| Entity Framework Core | 9.0 | ORM para SQL Server |
| SQL Server | — | Banco de dados relacional |
| BCrypt.Net-Next | 4.0 | Hash de senhas |
| JWT Bearer | 9.0 | Autenticação stateless |
| Scalar | — | Documentação da API (substituto do Swagger) |

### Frontend

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| Next.js | 16.1 | Framework React com App Router |
| TypeScript | 5 | Tipagem estática |
| Tailwind CSS | 4 | Estilização utilitária |
| shadcn/ui + radix-ui | — | Componentes acessíveis |
| @microsoft/signalr | 10 | Cliente WebSocket |
| React Hook Form + Zod | — | Formulários e validação |
| Sonner | — | Notificações toast |
| Lucide React | — | Ícones |

---

## Pré-requisitos

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)
- [SQL Server](https://www.microsoft.com/sql-server) (local ou Docker)

### SQL Server via Docker (opcional)

```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=Senha@123" \
  -p 1433:1433 --name sqlserver \
  -d mcr.microsoft.com/mssql/server:2022-latest
```

---

## Como Rodar

### 1. Backend

```bash
cd backend

# Restaurar dependências
dotnet restore

# Aplicar as migrations e criar o banco
dotnet ef database update --project ChatApp.Infrastructure --startup-project ChatApp.API

# Rodar a API
dotnet run --project ChatApp.API
```

A API estará disponível em:
- HTTP: `http://localhost:5086`
- HTTPS: `https://localhost:7037`
- Documentação (Scalar): `https://localhost:7037/scalar/v1`

> **Configuração do banco:** As credenciais padrão estão em `backend/ChatApp.API/appsettings.json`. Ajuste a connection string `Connection` conforme seu ambiente.

### 2. Frontend

```bash
cd chatapp-web

# Instalar dependências
npm install

# Rodar em modo de desenvolvimento
npm run dev
```

O frontend estará disponível em `http://localhost:3000`.

> Por padrão, o frontend aponta para `https://localhost:7037`. Para alterar, crie um arquivo `.env.local` na pasta `chatapp-web`:
> ```env
> NEXT_PUBLIC_API_BASE_URL=https://localhost:7037
> ```

---

## Endpoints Principais

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/users/register` | Cadastro de usuário |
| `POST` | `/api/users/login` | Login, retorna JWT |
| `GET` | `/api/users?email=` | Busca usuário por e-mail |
| `GET` | `/api/contacts` | Lista contatos aceitos |
| `POST` | `/api/contacts/request` | Envia solicitação de contato |
| `PATCH` | `/api/contacts/{id}/accept` | Aceita solicitação |
| `PATCH` | `/api/contacts/{id}/reject` | Recusa solicitação |
| `GET` | `/api/contacts/pending` | Solicitações pendentes |
| `POST` | `/api/messages` | Envia mensagem |
| `GET` | `/api/messages/conversation/{otherId}` | Histórico de conversa |
| `PATCH` | `/api/messages/{id}/read` | Marca mensagem como lida |

### SignalR Hub

Endereço: `wss://localhost:7037/hubs/chat`

**Eventos emitidos pelo servidor:**

| Evento | Descrição |
|--------|-----------|
| `ReceiveMessage` | Nova mensagem recebida |
| `MessageRead` | Mensagem foi lida pelo destinatário |
| `ReceiveContactRequest` | Nova solicitação de contato recebida |
| `ContactRequestAccepted` | Solicitação de contato aceita |

---

## Banco de Dados

O schema é gerenciado via migrations do EF Core. As principais tabelas são:

- **Users** — dados de cadastro e hash de senha
- **Messages** — histórico de mensagens entre usuários
- **Contacts** — relação de contato com status `Pending`, `Accepted` ou `Rejected`

---

## Variáveis de Configuração

### Backend (`appsettings.json`)

```json
{
  "ConnectionStrings": {
    "Connection": "Server=localhost;Database=ChatApp;User Id=sa;Password=Senha@123;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Key": "<chave-secreta-base64>",
    "Issuer": "ChatManagement",
    "Audience": "ChatManagementClient"
  }
}
```

> ⚠️ Em produção, nunca armazene a chave JWT em `appsettings.json`. Use variáveis de ambiente ou um serviço de secrets.

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_BASE_URL=https://localhost:7037
```
