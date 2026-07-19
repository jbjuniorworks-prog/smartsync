import React, { useState } from 'react';
import { DetalhesModal } from './DetalhesModal';
import { VendaModal } from './VendaModal';

const formatarCpf = (cpf) => {
  if (!cpf) return null;
  const c = cpf.replace(/\D/g, '');
  if (c.length !== 11) return cpf;
  return c.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

const mascaraImei = (imei, isAdmin) => {
  if (!imei) return '—';
  if (isAdmin) return imei;
  return `••••••••••• ${imei.slice(-4)}`;
};

export function StockCard({ item, onAlterarStatus, onVender, onExcluir, onImprimir, onAtualizar, isAdmin, buscarHistorico }) {
  const [detalheAberto, setDetalheAberto] = useState(false);
  const [vendaAberta, setVendaAberta] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const concluido = item.status === 'Vendido';

  const handleStatusClick = (e) => {
    e.stopPropagation();
    if (concluido) handleReativar();
    else setVendaAberta(true);
  };

  const handleReativar = async () => {
    setLoadingStatus(true);
    await onAlterarStatus(item.id, item.status);
    setLoadingStatus(false);
  };

  const handleConfirmarVenda = async (clienteVenda) => {
    setLoadingStatus(true);
    setVendaAberta(false);
    await onVender(item.id, clienteVenda);
    setLoadingStatus(false);
  };

  return (
    <>
      <div
        className={`card ${concluido ? 'vendido' : ''}`}
        onClick={() => setDetalheAberto(true)}
        title="Clique para ver histórico completo"
      >
        <div className="card-header">
          {item.foto
            ? <img src={item.foto} alt={item.aparelho} className="card-img" />
            : (
              <div className="no-img">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.3">
                  <rect x="5" y="2" width="14" height="20" rx="3"/>
                  <line x1="9" y1="7" x2="15" y2="7"/>
                  <line x1="9" y1="11" x2="15" y2="11"/>
                </svg>
              </div>
            )
          }
          <span className={`badge ${concluido ? 'bg-red' : 'bg-green'}`}>
            {concluido ? '✅ Concluído' : '🔧 Em serviço'}
          </span>
        </div>

        <div className="card-body">
          <h3>{item.aparelho}</h3>

          {item.cliente && (
            <div className="card-cliente-bloco">
              <div className="card-cliente-nome">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <strong>{item.cliente}</strong>
              </div>
              {item.cpf && <span className="card-cpf">CPF: {formatarCpf(item.cpf)}</span>}
              {item.telefone && <span className="card-telefone">📞 {item.telefone}</span>}
            </div>
          )}

          <p className="card-imei">
            <span className="card-label">IMEI</span>
            <span className="card-imei-valor">{mascaraImei(item.imei, isAdmin)}</span>
          </p>

          {item.defeito && (
            <p className="card-defeito">
              <span className="card-label">Defeito</span> {item.defeito}
            </p>
          )}
          {item.tecnico && (
            <p><span className="card-label">Técnico</span> {item.tecnico}</p>
          )}
          {item.dataCadastro && (
            <p className="card-data">
              <span className="card-label">Entrada</span>{' '}
              {new Date(item.dataCadastro).toLocaleDateString('pt-BR')}
            </p>
          )}
          {concluido && item.dataVenda && (
            <p className="card-data card-data-concluido">
              <span className="card-label">Concluído</span>{' '}
              {new Date(item.dataVenda).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>

        {isAdmin && (
          <div className="card-actions" onClick={e => e.stopPropagation()}>
            <button className="btn-status" onClick={handleStatusClick} disabled={loadingStatus}>
              {loadingStatus ? <span className="btn-spinner" /> : concluido ? '↩ Reabrir' : '✓ Concluir'}
            </button>
            <button className="btn-recibo" onClick={(e) => { e.stopPropagation(); onImprimir(item); }}>🖨 Recibo</button>
            <button className="btn-del" onClick={(e) => { e.stopPropagation(); onExcluir(item.id); }}>🗑</button>
          </div>
        )}

        <div className="card-historico-hint">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          Ver histórico de serviços
        </div>
      </div>

      {detalheAberto && (
        <DetalhesModal
          item={item}
          onClose={() => setDetalheAberto(false)}
          onAtualizar={onAtualizar}
          isAdmin={isAdmin}
          buscarHistorico={buscarHistorico}
        />
      )}

      {vendaAberta && (
        <VendaModal
          item={item}
          onConfirmar={handleConfirmarVenda}
          onCancelar={() => setVendaAberta(false)}
        />
      )}
    </>
  );
}