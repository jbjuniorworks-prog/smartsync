-- SmartSync — garante a coluna valor_anterior no histórico (rode no SQL Editor do Supabase)
-- Idempotente: não faz nada se a coluna já existir.
-- Passa a alimentar o "de → para" da timeline no DetalhesModal.

alter table historico add column if not exists valor_anterior text;
