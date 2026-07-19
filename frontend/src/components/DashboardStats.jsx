import { formatarMoeda } from '../utils/formatters';

const IconTotal = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="5" y="2" width="14" height="20" rx="3"/>
    <line x1="9" y1="7" x2="15" y2="7"/>
    <line x1="9" y1="11" x2="15" y2="11"/>
    <line x1="9" y1="15" x2="12" y2="15"/>
  </svg>
);

const IconAtivo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);

const IconServicos = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);

export function DashboardStats({ stats, onFiltro }) {
  const totalAparelhos = (stats.estoqueItem || 0) + (stats.vendidos || 0);

  return (
    <div className="dashboard-stats">
      <div className="stat-card" onClick={() => onFiltro('Todos')}>
        <div className="stat-header">
          <span>TOTAL CADASTRADO</span>
          <div className="stat-icon stat-icon-total"><IconTotal /></div>
        </div>
        <h3>{totalAparelhos}</h3>
        <p>{totalAparelhos === 1 ? 'aparelho registrado' : 'aparelhos registrados'}</p>
      </div>

      <div className="stat-card" onClick={() => onFiltro('Em estoque')}>
        <div className="stat-header">
          <span>EM ATENDIMENTO</span>
          <div className="stat-icon stat-icon-estoque"><IconAtivo /></div>
        </div>
        <h3>{stats.estoqueItem || 0}</h3>
        <p>{stats.estoqueItem === 1 ? 'aparelho ativo' : 'aparelhos ativos'}</p>
      </div>

      <div className="stat-card" onClick={() => onFiltro('Vendido')}>
        <div className="stat-header">
          <span>CONCLUÍDOS</span>
          <div className="stat-icon stat-icon-vendas"><IconServicos /></div>
        </div>
        <h3>{stats.vendidos || 0}</h3>
        <p>{stats.vendidos === 1 ? 'serviço concluído' : 'serviços concluídos'}</p>
      </div>
    </div>
  );
}