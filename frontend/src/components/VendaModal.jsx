import React, { useState, useEffect } from 'react';

export function VendaModal({ item, onConfirmar, onCancelar }) {
  const [cliente, setCliente] = useState('');

  // fecha com Esc
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancelar(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancelar]);

  const handleConfirmar = () => {
    if (!cliente.trim()) return;
    onConfirmar(cliente.trim());
  };

  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="confirm-box" onClick={e => e.stopPropagation()}>
        <div className="confirm-icon" style={{ background: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.25)', color: 'var(--success)' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>

        <h3>Concluir serviço</h3>
        <p style={{ marginBottom: '4px' }}>
          <strong style={{ color: 'var(--text)' }}>{item.aparelho}</strong>
        </p>
        <p>Confirme o nome de quem está retirando o aparelho.</p>

        <input
          className="venda-input"
          placeholder="Nome de quem retirou..."
          value={cliente}
          onChange={e => setCliente(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleConfirmar()}
          autoFocus
        />

        <div className="confirm-btns">
          <button className="btn-cancelar" onClick={onCancelar}>Cancelar</button>
          <button
            className="btn-del-confirm"
            onClick={handleConfirmar}
            disabled={!cliente.trim()}
            style={{
              background: 'rgba(34,197,94,0.15)',
              color: 'var(--success)',
              borderColor: 'rgba(34,197,94,0.25)',
              opacity: cliente.trim() ? 1 : 0.5
            }}
          >
            Concluir serviço
          </button>
        </div>
      </div>
    </div>
  );
}
