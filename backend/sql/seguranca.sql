-- SmartSync — segurança do banco (rode no SQL Editor do Supabase)

-- 1) Tabela de usuários do sistema (senha sempre em hash)
create table if not exists usuarios (
  id         bigint generated always as identity primary key,
  nome       text unique not null,
  senha_hash text not null,
  papel      text not null default 'vendedor',   -- 'admin' | 'vendedor'
  criado_em  timestamptz not null default now()
);

-- 2) Row-Level Security: bloqueia acesso via chave anônima.
--    O backend usa a SERVICE KEY (ignora RLS), então continua funcionando.
--    Isto é defesa em profundidade: se a anon key vazar, as tabelas ficam trancadas.
alter table usuarios  enable row level security;
alter table aparelhos enable row level security;
alter table clientes  enable row level security;
alter table historico enable row level security;

-- (propositalmente sem policies públicas: nenhuma leitura/escrita anônima é permitida)

-- Depois de rodar este SQL, popule os usuários com:  npm run seed  (na pasta backend)
