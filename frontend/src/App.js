import React, { useState, useMemo, useEffect } from 'react';
import './App.css';
import { getUsuario, limparSessao } from './api';
import { Toaster, toast } from 'sonner';
import { useEstoque } from './hooks/useEstoque';
import { formatarMoeda } from './utils/formatters';
import { imprimirRecibo } from './utils/recibo';
import { LoginForm } from './components/LoginForm';
import { FilterBar } from './components/FilterBar';
import { StockForm } from './components/StockForm';
import { StockCard } from './components/StockCard';
import { Logo } from './components/Logo';
import { ConfirmModal } from './components/ConfirmModal';

function App() {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [ordenacao, setOrdenacao] = useState('recente');
  const [confirmando, setConfirmando] = useState(null);

  const {
    meuEstoque,
    loading,
    sincronizar,
    salvarAparelho,
    alterarStatus,
    venderAparelho,
    excluirAparelho,
    buscarHistorico,
    buscarAparelhosDoCliente,
  } = useEstoque();

  const [user, setUser] = useState(() => getUsuario());

  const handleLogin = (usuario) => setUser(usuario);

  const handleLogout = () => {
    limparSessao();
    setUser(null);
  };

  // desloga automaticamente se o token expirar (evento disparado pelo api.js no 401)
  useEffect(() => {
    const aoExpirar = () => setUser(null);
    window.addEventListener('smartsync:naoautenticado', aoExpirar);
    return () => window.removeEventListener('smartsync:naoautenticado', aoExpirar);
  }, []);

  // sincroniza o estoque sempre que há um usuário autenticado (boot com sessão ou após login)
  useEffect(() => {
    if (user) sincronizar();
  }, [user, sincronizar]);

  // avisa se a sincronização estiver demorando (cold start do servidor free)
  const [syncLento, setSyncLento] = useState(false);
  useEffect(() => {
    if (!loading) { setSyncLento(false); return; }
    const t = setTimeout(() => setSyncLento(true), 5000);
    return () => clearTimeout(t);
  }, [loading]);

  const isAdmin = user?.papel === 'admin';

  const handleSalvar = async (novoAparelho, foto) => {
    const resultado = await salvarAparelho(novoAparelho, foto);
    if (resultado.ok) toast.success('Aparelho cadastrado!');
    else toast.error(`Erro: ${resultado.mensagem}`);
    return resultado.ok;
  };

  const handleAlterarStatus = async (id, statusAtual) => {
    const resultado = await alterarStatus(id, statusAtual);
    if (resultado.ok) toast.success('Status atualizado!');
    else toast.error(`Erro: ${resultado.mensagem}`);
  };

  const handleVender = async (id, clienteVenda) => {
    const resultado = await venderAparelho(id, clienteVenda);
    if (resultado.ok) toast.success(`Serviço concluído — entregue a ${clienteVenda}!`);
    else toast.error(`Erro: ${resultado.mensagem}`);
  };

  const handleExcluir = (id) => setConfirmando(id);

  const confirmarExclusao = async () => {
    const resultado = await excluirAparelho(confirmando);
    if (resultado.ok) toast.success('Aparelho excluído!');
    else toast.error(`Erro: ${resultado.mensagem}`);
    setConfirmando(null);
  };

  const tipoBusca = useMemo(() => {
    const limpo = busca.replace(/\D/g, '');
    if (limpo.length === 11) return 'cpf';
    if (limpo.length === 15) return 'imei';
    return 'texto';
  }, [busca]);

  const badgeBusca = useMemo(() => {
    if (!busca.trim()) return null;
    if (tipoBusca === 'cpf')  return { label: 'CPF',  cor: 'badge-cpf'  };
    if (tipoBusca === 'imei') return { label: 'IMEI', cor: 'badge-imei' };
    return { label: 'Texto', cor: 'badge-texto' };
  }, [busca, tipoBusca]);

  const estoqueFiltrado = useMemo(() => {
    const filtrado = meuEstoque
      .filter(i => filtroStatus === 'Todos' || i.status === filtroStatus)
      .filter(i => {
        if (!busca.trim()) return true;
        const q = busca.toLowerCase().trim();
        const cpfLimpo = busca.replace(/\D/g, '');
        return (
          i.aparelho?.toLowerCase().includes(q) ||
          i.imei?.includes(q) ||
          i.cliente?.toLowerCase().includes(q) ||
          (cpfLimpo.length >= 6 && i.cpf?.replace(/\D/g, '').includes(cpfLimpo))
        );
      });

    return [...filtrado].sort((a, b) => {
      if (ordenacao === 'recente') return new Date(b.dataCadastro) - new Date(a.dataCadastro);
      if (ordenacao === 'antigo')  return new Date(a.dataCadastro) - new Date(b.dataCadastro);
      if (ordenacao === 'nome')    return a.aparelho.localeCompare(b.aparelho);
      if (ordenacao === 'cliente') return (a.cliente || '').localeCompare(b.cliente || '');
      return 0;
    });
  }, [meuEstoque, filtroStatus, busca, ordenacao]);

  const stats = useMemo(() => {
    return meuEstoque.reduce((acc, item) => {
      if (item.status === 'Vendido') acc.vendidos += 1;
      else acc.estoqueItem += 1;
      return acc;
    }, { vendidos: 0, estoqueItem: 0 });
  }, [meuEstoque]);

  if (!user) return <LoginForm onLogin={handleLogin} />;

  return (
    <div className="container">
      <Toaster position="top-right" richColors />

      {confirmando && (
        <ConfirmModal
          mensagem="Tem certeza que deseja excluir este aparelho? Esta ação não pode ser desfeita."
          onConfirmar={confirmarExclusao}
          onCancelar={() => setConfirmando(null)}
        />
      )}

      <header className="header-app">
        <div className="user-info">
          <div className="header-logo">
            <Logo size={32} />
            <span className="logo-center">Center</span><span className="logo-cel">Cel</span>
          </div>
          <div className="header-user">
            <div className="header-user-info">
              <span className="header-username"><strong>{user.nome}</strong></span>
              <span className={`header-papel ${isAdmin ? 'papel-admin' : 'papel-vendedor'}`}>
                {isAdmin ? 'Administrador' : 'Vendedor'}
              </span>
            </div>
            <button onClick={handleLogout} className="btn-logout">Sair</button>
          </div>
        </div>

        <div className="header-stats-simples">
          <span className="stat-simples">
            <strong>{meuEstoque.length}</strong> cadastrados
          </span>
          <span className="stat-simples stat-servico">
            <strong>{stats.estoqueItem}</strong> em serviço
          </span>
          <span className="stat-simples stat-concluido">
            <strong>{stats.vendidos}</strong> concluídos
          </span>
        </div>
      </header>

      <StockForm onSalvar={handleSalvar} isAdmin={isAdmin} />

      <div className="search-section">
        <div className="search-row">
          <div className="search-input-wrap">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className="main-search"
              placeholder="Buscar por aparelho, IMEI, CPF ou nome do cliente..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              autoComplete="off"
            />
            {badgeBusca && (
              <span className={`search-type-badge ${badgeBusca.cor}`}>
                {badgeBusca.label}
              </span>
            )}
            {busca && (
              <button className="btn-clear-search" onClick={() => setBusca('')}>✕</button>
            )}
          </div>
          <select
            className="select-ordem"
            value={ordenacao}
            onChange={e => setOrdenacao(e.target.value)}
          >
            <option value="recente">Mais recente</option>
            <option value="antigo">Mais antigo</option>
            <option value="nome">Aparelho A-Z</option>
            <option value="cliente">Cliente A-Z</option>
          </select>
        </div>
        <p className="search-hint">
          Busque por <strong>aparelho</strong>, <strong>IMEI</strong> (15 dígitos), <strong>CPF</strong> (11 dígitos) ou <strong>nome do cliente</strong>
        </p>
      </div>

      <FilterBar filtroAtivo={filtroStatus} onFiltro={setFiltroStatus} />

      <div className="resultado-count">
        {!loading && (
          <span>
            {estoqueFiltrado.length === 0
              ? 'Nenhum resultado'
              : `${estoqueFiltrado.length} ${estoqueFiltrado.length === 1 ? 'aparelho encontrado' : 'aparelhos encontrados'}`
            }
            {busca && estoqueFiltrado.length > 0 && (
              <span className="resultado-query"> para <em>"{busca}"</em></span>
            )}
          </span>
        )}
      </div>

      {!loading && tipoBusca === 'cpf' && estoqueFiltrado.length > 0 && (
        <div className="cpf-cliente-banner">
          <div className="cpf-cliente-avatar">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div className="cpf-cliente-info">
            <strong>{estoqueFiltrado[0].cliente || 'Cliente sem nome cadastrado'}</strong>
            <span>
              CPF {estoqueFiltrado[0].cpf || busca} · {estoqueFiltrado.length}{' '}
              {estoqueFiltrado.length === 1 ? 'aparelho' : 'aparelhos'} deste cliente
            </span>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-wrap">
          <div className="loading-spinner" />
          <p className="loading-text">
            {syncLento
              ? 'Conectando ao servidor… a primeira conexão do dia pode demorar um pouco.'
              : 'Carregando aparelhos...'}
          </p>
        </div>
      )}

      {!loading && estoqueFiltrado.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <h3>Nenhum aparelho encontrado</h3>
          <p>
            {busca
              ? `Nenhum resultado para "${busca}"`
              : filtroStatus !== 'Todos'
              ? `Nenhum aparelho com status "${filtroStatus}"`
              : 'Cadastre o primeiro aparelho acima'
            }
          </p>
          {busca && (
            <button className="btn-limpar" onClick={() => setBusca('')}>
              Limpar busca
            </button>
          )}
        </div>
      )}

      <div className="grid-estoque">
        {estoqueFiltrado.map(item => (
          <StockCard
            key={item.id}
            item={item}
            onAlterarStatus={handleAlterarStatus}
            onVender={handleVender}
            onExcluir={handleExcluir}
            onImprimir={(i) => imprimirRecibo(i, formatarMoeda)}
            onAtualizar={sincronizar}
            isAdmin={isAdmin}
            buscarHistorico={buscarHistorico}
            buscarAparelhosDoCliente={buscarAparelhosDoCliente}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
