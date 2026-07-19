// Cria/atualiza os usuários do sistema com senha em hash (bcrypt).
// Rode uma vez: `npm run seed` (na pasta backend, com o .env preenchido).
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Faltam SUPABASE_URL / SUPABASE_SERVICE_KEY no .env');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// senhas via env (recomendado) ou fallback de demonstração
const usuarios = [
  { nome: 'Admin',    senha: process.env.SEED_ADMIN_PASS    || 'admin123', papel: 'admin' },
  { nome: 'Vendedor', senha: process.env.SEED_VENDEDOR_PASS || 'vend123',  papel: 'vendedor' },
];

(async () => {
  for (const u of usuarios) {
    const senha_hash = await bcrypt.hash(u.senha, 10);
    const { error } = await supabase
      .from('usuarios')
      .upsert({ nome: u.nome, senha_hash, papel: u.papel }, { onConflict: 'nome' });
    console.log(error ? `✗ ${u.nome}: ${error.message}` : `✓ ${u.nome} (${u.papel})`);
  }
  console.log('\nSeed concluído. Troque as senhas padrão em produção (SEED_ADMIN_PASS / SEED_VENDEDOR_PASS).');
  process.exit(0);
})();
