# SmartSync

Sistema de gestão para assistência técnica — cadastro e acompanhamento de reparos de aparelhos, com **validação de IMEI** (algoritmo de Luhn) e dados do cliente.

Monorepo com o app web (`frontend/`) e a API (`backend/`).

🔗 **Demo ao vivo:** https://smartsync-two.vercel.app

## Estrutura

```
smartsync/
├── frontend/   App web em React — a interface usada na loja
└── backend/    API REST em Express + Supabase (PostgreSQL)
```

## Frontend — `frontend/`

React 18 (Create React App). Consome a API pela variável `REACT_APP_API_URL`.

```bash
cd frontend
npm install
cp .env.example .env      # ajuste a URL da API
npm start                 # http://localhost:3000
```

Principais libs: `lucide-react` (ícones), `sonner` (toasts), `browser-image-compression` (otimização de fotos no upload).

## Backend — `backend/`

Node.js + Express 5 + Supabase. Faz o cadastro e a sincronização de aparelhos e clientes; valida o IMEI na entrada.

```bash
cd backend
npm install
cp .env.example .env      # preencha as credenciais do Supabase
node server.js
```

| Variável | Descrição |
|---|---|
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_SERVICE_KEY` | service key (**segredo** — nunca versionar) |
| `PORT` | porta do servidor (opcional) |

## Evolução

O backend começou guardando os dados num arquivo local (JSON) e evoluiu para o **Supabase** (PostgreSQL), ganhando persistência real e acesso multiusuário. O frontend é publicado no Vercel.

## Stack

React · Express · Supabase · Node.js · Vercel

---

<sub>© 2026 · José Batista</sub>
