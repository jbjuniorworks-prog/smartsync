export function FilterBar({ filtroAtivo, onFiltro }) {
  const filtros = [
    { valor: 'Todos',      label: 'Todos',      emoji: '📋' },
    { valor: 'Em estoque', label: 'Em serviço', emoji: '🔧' },
    { valor: 'Vendido',    label: 'Concluído',  emoji: '✅' },
  ];

  return (
    <div className="filter-bar">
      {filtros.map(f => (
        <button
          key={f.valor}
          onClick={() => onFiltro(f.valor)}
          className={filtroAtivo === f.valor ? 'active' : ''}
        >
          <span className="filter-emoji">{f.emoji}</span>
          {f.label}
        </button>
      ))}
    </div>
  );
}