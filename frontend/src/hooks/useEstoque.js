import { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'https://smartsync-api-1.onrender.com/api';

export function useEstoque() {
  const [meuEstoque, setMeuEstoque] = useState([]);
  const [loading, setLoading] = useState(false);

  const sincronizar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/sincronizar`);
      if (!res.ok) throw new Error(`Erro ${res.status}: ${res.statusText}`);
      const dados = await res.json();
      setMeuEstoque(dados.minhaLoja || []);
    } catch (err) {
      console.error('Erro ao sincronizar:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const salvarAparelho = async (novoAparelho, foto) => {
    try {
      const res = await fetch(`${API_URL}/salvar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...novoAparelho, foto }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const mensagem = data.mensagem || data.message || data.error || `Erro ${res.status}`;
        throw new Error(mensagem);
      }
      await sincronizar();
      return { ok: true };
    } catch (err) {
      console.error('Erro ao salvar:', err);
      return { ok: false, mensagem: err.message || 'Erro desconhecido' };
    }
  };

  const alterarStatus = async (id, statusAtual) => {
    try {
      const res = await fetch(`${API_URL}/estoque/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusAtual === 'Vendido' ? 'Em estoque' : 'Vendido' }),
      });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      await sincronizar();
    } catch (err) {
      console.error('Erro ao alterar status:', err);
    }
  };

  const venderAparelho = async (id, clienteVenda) => {
    try {
      const res = await fetch(`${API_URL}/estoque/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Vendido',
          clienteVenda,
          dataVenda: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      await sincronizar();
      return { ok: true };
    } catch (err) {
      console.error('Erro ao vender:', err);
      return { ok: false };
    }
  };

  const excluirAparelho = async (id) => {
    try {
      const res = await fetch(`${API_URL}/estoque/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      await sincronizar();
    } catch (err) {
      console.error('Erro ao excluir:', err);
    }
  };

  const buscarHistorico = async (aparelhoId) => {
    try {
      const res = await fetch(`${API_URL}/historico/${aparelhoId}`);
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
      return [];
    }
  };

  const buscarPorCpf = async (cpf) => {
    try {
      const res = await fetch(`${API_URL}/clientes/cpf/${cpf}`);
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('Erro ao buscar por CPF:', err);
      return null;
    }
  };

  // ── NOVO: buscar todos os aparelhos de um cliente pelo clienteId ──
  const buscarAparelhosDoCliente = async (clienteId) => {
    try {
      const res = await fetch(`${API_URL}/clientes/${clienteId}/aparelhos`);
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('Erro ao buscar aparelhos do cliente:', err);
      return [];
    }
  };

  useEffect(() => { sincronizar(); }, [sincronizar]);

  return {
    meuEstoque, loading, sincronizar,
    salvarAparelho, alterarStatus, venderAparelho,
    excluirAparelho, buscarHistorico, buscarPorCpf,
    buscarAparelhosDoCliente,
  };
}
