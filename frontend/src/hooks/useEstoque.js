import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../api';

export function useEstoque() {
  const [meuEstoque, setMeuEstoque] = useState([]);
  const [loading, setLoading] = useState(false);

  const sincronizar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/sincronizar');
      if (!res.ok) throw new Error(`Erro ${res.status}`);
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
      const res = await apiFetch('/salvar', {
        method: 'POST',
        body: JSON.stringify({ ...novoAparelho, foto }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.mensagem || data.message || `Erro ${res.status}`);
      await sincronizar();
      return { ok: true };
    } catch (err) {
      console.error('Erro ao salvar:', err);
      return { ok: false, mensagem: err.message || 'Erro desconhecido' };
    }
  };

  const alterarStatus = async (id, statusAtual) => {
    try {
      const res = await apiFetch(`/estoque/${id}`, {
        method: 'PUT',
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
      const res = await apiFetch(`/estoque/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Vendido', clienteVenda, dataVenda: new Date().toISOString() }),
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
      const res = await apiFetch(`/estoque/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      await sincronizar();
    } catch (err) {
      console.error('Erro ao excluir:', err);
    }
  };

  const buscarHistorico = async (aparelhoId) => {
    try {
      const res = await apiFetch(`/historico/${aparelhoId}`);
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
      return [];
    }
  };

  const buscarPorCpf = async (cpf) => {
    try {
      const res = await apiFetch(`/clientes/cpf/${cpf}`);
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('Erro ao buscar por CPF:', err);
      return null;
    }
  };

  const buscarAparelhosDoCliente = async (clienteId) => {
    try {
      const res = await apiFetch(`/clientes/${clienteId}/aparelhos`);
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
