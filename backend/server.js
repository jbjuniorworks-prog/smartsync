const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const validarImeiReal = (imei) => {
  const n = imei.trim();
  if (n.length !== 15 || !/^\d+$/.test(n)) return false;
  let soma = 0;
  for (let i = 0; i < 15; i++) {
    let d = parseInt(n.charAt(i));
    if (i % 2 !== 0) { d *= 2; if (d > 9) d -= 9; }
    soma += d;
  }
  return soma % 10 === 0;
};

app.get('/', (req, res) => res.send('🚀 SmartSync API Online'));

app.get('/api/sincronizar', async (req, res) => {
  const { data, error } = await supabase.from('aparelhos').select('*, clientes (nome, cpf, telefone)').order('criado_em', { ascending: false });
  if (error) return res.status(500).json({ mensagem: error.message });
  const minhaLoja = data.map(a => ({ id: a.id, cliente: a.clientes?.nome || '', cpf: a.clientes?.cpf || '', telefone: a.clientes?.telefone || '', aparelho: a.nome_aparelho, imei: a.imei, cor: a.cor || '', gb: a.gb || '', defeito: a.defeito || '', tecnico: a.tecnico || '', reparos: a.servico_executado || '', observacoes: a.observacoes || '', foto: a.foto_url || null, preco: a.preco, status: a.status, dataCadastro: a.criado_em, dataVenda: a.data_venda || null, clienteVenda: a.cliente_venda || null }));
  res.json({ minhaLoja });
});

app.post('/api/salvar', async (req, res) => {
  const { cliente, cpf, telefone, aparelho, imei, preco, defeito, tecnico, foto } = req.body;
  if (!aparelho || !imei || !preco) return res.status(400).json({ mensagem: 'Campos obrigatórios: aparelho, imei, preco' });
  if (!validarImeiReal(imei)) return res.status(400).json({ mensagem: 'IMEI inválido' });
  let clienteId = null;
  if (cliente) {
    if (cpf) {
      const { data: cd, error: ce } = await supabase.from('clientes').upsert({ nome: cliente, cpf, telefone: telefone || null }, { onConflict: 'cpf' }).select().single();
      if (!ce) clienteId = cd?.id;
    } else {
      const { data: novo } = await supabase.from('clientes').insert({ nome: cliente, telefone: telefone || null }).select().single();
      clienteId = novo?.id;
    }
  }
  const { data: existente } = await supabase.from('aparelhos').select('id').eq('imei', imei.trim()).maybeSingle();
  if (existente) return res.status(400).json({ mensagem: 'IMEI já cadastrado!' });
  const { data: novoAparelho, error } = await supabase.from('aparelhos').insert({ cliente_id: clienteId, imei: imei.trim(), nome_aparelho: aparelho.trim(), defeito: defeito || null, tecnico: tecnico || null, foto_url: foto || null, preco: Number(preco), status: 'Em estoque' }).select().single();
  if (error) return res.status(500).json({ mensagem: error.message });
  await supabase.from('historico').insert({ aparelho_id: novoAparelho.id, usuario: 'Admin', campo_alterado: 'cadastro', valor_novo: aparelho.trim(), observacao: 'Aparelho cadastrado no sistema' });
  res.json(novoAparelho);
});

app.put('/api/estoque/:id', async (req, res) => {
  const { id } = req.params;
  const dados = req.body;
  const atualizacao = {};
  if (dados.status)                     atualizacao.status             = dados.status;
  if (dados.preco)                      atualizacao.preco              = Number(dados.preco);
  if (dados.aparelho)                   atualizacao.nome_aparelho      = dados.aparelho;
  if (dados.imei)                       atualizacao.imei               = dados.imei;
  if (dados.cor          !== undefined) atualizacao.cor                = dados.cor;
  if (dados.gb           !== undefined) atualizacao.gb                 = dados.gb;
  if (dados.defeito      !== undefined) atualizacao.defeito            = dados.defeito;
  if (dados.tecnico      !== undefined) atualizacao.tecnico            = dados.tecnico;
  if (dados.reparos      !== undefined) atualizacao.servico_executado  = dados.reparos;
  if (dados.observacoes  !== undefined) atualizacao.observacoes        = dados.observacoes;
  if (dados.status === 'Vendido') { atualizacao.data_venda = dados.dataVenda || new Date().toISOString(); atualizacao.cliente_venda = dados.clienteVenda || null; }
  if (dados.status === 'Em estoque') { atualizacao.data_venda = null; atualizacao.cliente_venda = null; }
  const { data, error } = await supabase.from('aparelhos').update(atualizacao).eq('id', id).select().single();
  if (error) return res.status(500).json({ mensagem: error.message });
  for (const [campo, valor] of Object.entries(atualizacao)) { await supabase.from('historico').insert({ aparelho_id: id, usuario: 'Admin', campo_alterado: campo, valor_novo: String(valor) }); }
  res.json(data);
});

app.delete('/api/estoque/:id', async (req, res) => {
  const { id } = req.params;
  await supabase.from('historico').delete().eq('aparelho_id', id);
  const { error } = await supabase.from('aparelhos').delete().eq('id', id);
  if (error) return res.status(500).json({ mensagem: error.message });
  res.json({ mensagem: 'Excluído!' });
});

app.get('/api/historico/:id', async (req, res) => {
  const { data, error } = await supabase.from('historico').select('*').eq('aparelho_id', req.params.id).order('criado_em', { ascending: false });
  if (error) return res.status(500).json({ mensagem: error.message });
  res.json(data);
});

app.get('/api/clientes/cpf/:cpf', async (req, res) => {
  const { data, error } = await supabase.from('clientes').select('*, aparelhos(*)').eq('cpf', req.params.cpf).single();
  if (error) return res.status(404).json({ mensagem: 'Cliente não encontrado' });
  res.json(data);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));
