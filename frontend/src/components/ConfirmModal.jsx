export function ConfirmModal({ mensagem, onConfirmar, onCancelar }) {
  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="confirm-box" onClick={e => e.stopPropagation()}>
        <div className="confirm-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
          </svg>
        </div>
        <h3>Confirmar exclusão</h3>
        <p>{mensagem}</p>
        <div className="confirm-btns">
          <button className="btn-cancelar" onClick={onCancelar}>Cancelar</button>
          <button className="btn-del-confirm" onClick={onConfirmar}>Excluir</button>
        </div>
      </div>
    </div>
  );
}