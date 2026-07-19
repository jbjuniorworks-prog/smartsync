import React, { useState } from 'react';

export function VendaModal({ item, onConfirmar, onCancelar }) {
  const [cliente, setCliente] = useState('');

  const handleConfirmar = () => {
    if (!cliente.trim()) return;
    onConfirmar(cliente.trim());
  };

  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="confirm-box" onClick={e => e.stopPropagation()}>
        <div className="confirm-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 12V22H4V12"/>
            <path d="M22 7H2v5h20V7z"/>
            <path d="M12 22V7"/>
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
          </svg>
        </div>

        <h3>Registrar Venda</h3>
        <p style={{ marginBottom: '4px' }}>
          <strong style={{ color: 'var(--text)' }}>{item.aparelho}</strong>
        </p>
        <p>Informe o nome do cliente para confirmar a venda.</p>

        <input
          className="venda-input"
          placeholder="Nome do cliente..."
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
            Confirmar Venda
          </button>
        </div>
      </div>
    </div>
  );
}