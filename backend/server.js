const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

// ── validação das variáveis de ambiente (falha claro no boot) ──
const { SUPABASE_URL, SUPABASE_SERVICE_KEY, JWT_SECRET } = process.env;
for (const [chave, valor] of Object.entries({ SUPABASE_URL, SUPABASE_SERVICE_KEY, JWT_SECRET })) {
  if (!valor) {
    console.error(`[SmartSync] Variável de ambiente obrigatória ausente: ${chave}`);
    process.exit(1);
  }
}

const app = express();

// ── CORS restrito às origens permitidas ──
const origensPermitidas = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin(origin, cb) {
    // permite ferramentas locais (sem Origin, ex.: curl) e as origens da lista
    if (!origin || origensPermitidas.includes(origin)) return cb(null, true);
    return cb(new Error('Origem não permitida pelo CORS'));
  },
}));

app.use(express.json({ limit: '10mb' }));

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── helpers ──
const validarImeiReal = (imei) => {
  const n = String(imei).trim();
  if (n.length !== 15 || !/^\d+$/.test(n)) return false;
  let soma = 0;
  for (let i = 0; i < 15; i++) {
    let d = parseInt(n.charAt(i));
    if (i % 2 !== 0) { d *= 2; if (d > 9) d -= 9; }
    soma += d;
  }
  return soma % 10 === 0;
};

// envolve handlers async: qualquer throw vira 500 tratado (sem request travada)
const rota = (fn) => (req, res) => Promise.resolve(fn(req, res)).catch((err) => {
  console.error('[SmartSync] erro na rota:', err);
  if (!res.headersSent) res.status(500).json({ mensagem: 'Erro interno no servidor' });
});

// ── autenticação (JWT) ──
function autenticar(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ mensagem: 'Não autenticado' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ mensagem: 'Sessão inválida ou expirada' });
  }
}

function apenasAdmin(req, res, next) {
  if (req.user?.papel !== 'admin') {
    return res.status(403).json({ mensagem: 'Ação restrita ao administrador' });
  }
  next();
}

// ── rotas públicas ──
app.get('/', (req, res) => res.send('SmartSync API online'));

app.post('/api/login', rota(async (req, res) => {
  const { nome, senha } = req.body || {};
  if (!nome || !senha) return res.status(400).json({ mensagem: 'Informe usuário e senha' });

  const { data: u } = await supabase
    .from('usuarios').select('*').ilike('nome', String(nome).trim()).maybeSingle();

  if (!u || !(await bcrypt.compare(String(senha), u.senha_hash))) {
    return res.status(401).json({ mensagem: 'Usuário ou senha incorretos' });
  }

  const usuario = { id: u.id, nome: u.nome, papel: u.papel };
  const token = jwt.sign(usuario, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, usuario });
}));

// ── rotas protegidas (exigem token; escrita/edição só admin) ──
app.get('/api/sincronizar', autenticar, rota(async (req, res) => {
  const { data, error } = await supabase
    .from('aparelhos')
    .select('*, clientes (id, nome, cpf, telefone)')
    .order('criado_em', { ascending: false });
  if (error) return res.status(500).json({ mensagem: error.message });
  const minhaLoja = data.map(a => ({
    id: a.id, clienteId: a.clientes?.id || a.cliente_id || null,
    cliente: a.clientes?.nome || '', cpf: a.clientes?.cpf || '', telefone: a.clientes?.telefone || '',
    aparelho: a.nome_aparelho, imei: a.imei, cor: a.cor || '', gb: a.gb || '',
    defeito: a.defeito || '', tecnico: a.tecnico || '', reparos: a.servico_executado || '',
    observacoes: a.observacoes || '', foto: a.foto_url || null, preco: a.preco, status: a.status,
    dataCadastro: a.criado_em, dataVenda: a.data_venda || null, clienteVenda: a.cliente_venda || null,
  }));
  res.json({ minhaLoja });
}));

app.post('/api/salvar', autenticar, rota(async (req, res) => {
  const { cliente, cpf, telefone, aparelho, imei, preco, defeito, tecnico, foto } = req.body || {};
  if (!aparelho || !imei || !preco) return res.status(400).json({ mensagem: 'Campos obrigatórios: aparelho, imei, preco' });
  if (!validarImeiReal(imei)) return res.status(400).json({ mensagem: 'IMEI inválido' });

  let clienteId = null;
  if (cliente) {
    if (cpf) {
      const { data: cd, error: ce } = await supabase.from('clientes')
        .upsert({ nome: cliente, cpf, telefone: telefone || null }, { onConflict: 'cpf' })
        .select().single();
      if (!ce) clienteId = cd?.id;
    } else {
      const { data: novo } = await supabase.from('clientes')
        .insert({ nome: cliente, telefone: telefone || null }).select().single();
      clienteId = novo?.id;
    }
  }

  const { data: existente } = await supabase.from('aparelhos').select('id').eq('imei', String(imei).trim()).maybeSingle();
  if (existente) return res.status(400).json({ mensagem: 'IMEI já cadastrado!' });

  const { data: novoAparelho, error } = await supabase.from('aparelhos').insert({
    cliente_id: clienteId, imei: String(imei).trim(), nome_aparelho: aparelho.trim(),
    defeito: defeito || null, tecnico: tecnico || null, foto_url: foto || null,
    preco: Number(preco), status: 'Em estoque',
  }).select().single();
  if (error) return res.status(500).json({ mensagem: error.message });

  await supabase.from('historico').insert({
    aparelho_id: novoAparelho.id, usuario: req.user.nome, campo_alterado: 'cadastro',
    valor_novo: aparelho.trim(), observacao: 'Aparelho cadastrado no sistema',
  });
  res.json(novoAparelho);
}));

app.put('/api/estoque/:id', autenticar, apenasAdmin, rota(async (req, res) => {
  const { id } = req.params;
  const dados = req.body || {};
  const atualizacao = {};
  if (dados.status)                    atualizacao.status            = dados.status;
  if (dados.preco)                     atualizacao.preco             = Number(dados.preco);
  if (dados.aparelho)                  atualizacao.nome_aparelho     = dados.aparelho;
  if (dados.imei)                      atualizacao.imei              = dados.imei;
  if (dados.cor         !== undefined) atualizacao.cor               = dados.cor;
  if (dados.gb          !== undefined) atualizacao.gb                = dados.gb;
  if (dados.defeito     !== undefined) atualizacao.defeito           = dados.defeito;
  if (dados.tecnico     !== undefined) atualizacao.tecnico           = dados.tecnico;
  if (dados.reparos     !== undefined) atualizacao.servico_executado = dados.reparos;
  if (dados.observacoes !== undefined) atualizacao.observacoes       = dados.observacoes;
  if (dados.status === 'Vendido')     { atualizacao.data_venda = dados.dataVenda || new Date().toISOString(); atualizacao.cliente_venda = dados.clienteVenda || null; }
  if (dados.status === 'Em estoque')  { atualizacao.data_venda = null; atualizacao.cliente_venda = null; }

  const { data, error } = await supabase.from('aparelhos').update(atualizacao).eq('id', id).select().single();
  if (error) return res.status(500).json({ mensagem: error.message });

  for (const [campo, valor] of Object.entries(atualizacao)) {
    await supabase.from('historico').insert({ aparelho_id: id, usuario: req.user.nome, campo_alterado: campo, valor_novo: String(valor) });
  }
  res.json(data);
}));

app.delete('/api/estoque/:id', autenticar, apenasAdmin, rota(async (req, res) => {
  const { id } = req.params;
  await supabase.from('historico').delete().eq('aparelho_id', id);
  const { error } = await supabase.from('aparelhos').delete().eq('id', id);
  if (error) return res.status(500).json({ mensagem: error.message });
  res.json({ mensagem: 'Excluído!' });
}));

app.get('/api/historico/:id', autenticar, rota(async (req, res) => {
  const { data, error } = await supabase.from('historico').select('*').eq('aparelho_id', req.params.id).order('criado_em', { ascending: false });
  if (error) return res.status(500).json({ mensagem: error.message });
  res.json(data);
}));

app.get('/api/clientes/cpf/:cpf', autenticar, rota(async (req, res) => {
  const { data, error } = await supabase.from('clientes').select('*, aparelhos(*)').eq('cpf', req.params.cpf).single();
  if (error) return res.status(404).json({ mensagem: 'Cliente não encontrado' });
  res.json(data);
}));

// antes fazia 404 no front (rota não existia) — agora implementada
app.get('/api/clientes/:id/aparelhos', autenticar, rota(async (req, res) => {
  const { data, error } = await supabase.from('aparelhos').select('*').eq('cliente_id', req.params.id).order('criado_em', { ascending: false });
  if (error) return res.status(500).json({ mensagem: error.message });
  res.json(data);
}));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`SmartSync API rodando na porta ${PORT}`));
