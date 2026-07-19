import { useState, useEffect } from 'react';
import { formatarMoeda, formatarData } from '../utils/formatters';
import { apiFetch } from '../api';

const LABELS_CAMPO = {
  cadastro:          'Cadastro no sistema',
  status:            'Status',
  preco:             'Valor do serviço',
  nome_aparelho:     'Aparelho / Modelo',
  imei:              'IMEI',
  cor:               'Cor',
  gb:                'Armazenamento',
  defeito:           'Defeito relatado',
  tecnico:           'Técnico responsável',
  servico_executado: 'Reparos realizados',
  observacoes:       'Observações',
  data_venda:        'Data de conclusão',
  cliente_venda:     'Concluído por',
};

const IconeHistorico = ({ campo }) => {
  if (campo === 'cadastro') return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  );
  if (campo === 'status') return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  );
};

const formatarCpf = (cpf) => {
  if (!cpf) return '—';
  const c = cpf.replace(/\D/g, '');
  if (c.length !== 11) return cpf;
  return c.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export function DetalhesModal({ item, onClose, onAtualizar, isAdmin, buscarHistorico, buscarAparelhosDoCliente }) {
  const [editando, setEditando] = useState(null);
  const [dados, setDados] = useState({
    aparelho:    item.aparelho    || '',
    imei:        item.imei        || '',
    cor:         item.cor         || '',
    gb:          item.gb          || '',
    preco:       item.preco       || '',
    reparos:     item.reparos     || '',
    observacoes: item.observacoes || '',
    defeito:     item.defeito     || '',
    tecnico:     item.tecnico     || '',
  });
  const [salvando, setSalvando] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [aparelhosCliente, setAparelhosCliente] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState('detalhes');
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [loadingCliente, setLoadingCliente] = useState(false);

  const concluido = item.status === 'Vendido';

  // Carrega histórico do aparelho
  useEffect(() => {
    if (abaAtiva === 'historico' && buscarHistorico) {
      setLoadingHistorico(true);
      buscarHistorico(item.id)
        .then(setHistorico)
        .finally(() => setLoadingHistorico(false));
    }
  }, [abaAtiva, item.id, buscarHistorico]);

  // Carrega todos os aparelhos do cliente ao abrir aba cliente
  useEffect(() => {
    if (abaAtiva === 'cliente' && item.clienteId && buscarAparelhosDoCliente) {
      setLoadingCliente(true);
      buscarAparelhosDoCliente(item.clienteId)
        .then(setAparelhosCliente)
        .finally(() => setLoadingCliente(false));
    }
  }, [abaAtiva, item.clienteId, buscarAparelhosDoCliente]);

  const salvarCampo = async (campo) => {
    setSalvando(true);
    try {
      const res = await apiFetch(`/estoque/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ [campo]: dados[campo] }),
      });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      await onAtualizar();
      setEditando(null);
    } catch (err) {
      console.error('Erro ao salvar campo:', err);
    } finally {
      setSalvando(false);
    }
  };

  const renderCampo = (label, campo, tipo = 'text') => (
    <div className="detalhe-campo" key={campo}>
      <strong>{label}</strong>
      {editando === campo ? (
        <div className="detalhe-edit">
          {tipo === 'textarea' ? (
            <textarea
              value={dados[campo]}
              rows={4}
              autoFocus
              onChange={e => setDados(prev => ({ ...prev, [campo]: e.target.value }))}
            />
          ) : (
            <input
              type={tipo}
              value={dados[campo]}
              autoFocus
              onChange={e => setDados(prev => ({ ...prev, [campo]: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && salvarCampo(campo)}
            />
          )}
          <div className="detalhe-edit-btns">
            <button onClick={() => salvarCampo(campo)} disabled={salvando} className="btn-confirmar">
              {salvando ? 'Salvando...' : 'Confirmar'}
            </button>
            <button onClick={() => setEditando(null)} className="btn-cancelar">Cancelar</button>
          </div>
        </div>
      ) : (
        <div className="detalhe-valor">
          <span>{dados[campo] || '—'}</span>
          {isAdmin && (
            <button onClick={() => setEditando(campo)} className="btn-alterar">Alterar</button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>

        <div className="modal-header">
          <h2>Detalhes do Aparelho</h2>
          <span className={concluido ? 'badge bg-red' : 'badge bg-green'}>
            {concluido ? '✅ Concluído' : '🔧 Em serviço'}
          </span>
        </div>

        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-abas">
          <button className={`modal-aba ${abaAtiva === 'detalhes'  ? 'ativa' : ''}`} onClick={() => setAbaAtiva('detalhes')}>🔧 Serviço</button>
          <button className={`modal-aba ${abaAtiva === 'cliente'   ? 'ativa' : ''}`} onClick={() => setAbaAtiva('cliente')}>👤 Cliente</button>
          <button className={`modal-aba ${abaAtiva === 'historico' ? 'ativa' : ''}`} onClick={() => setAbaAtiva('historico')}>🕐 Histórico</button>
        </div>

        {/* ── ABA SERVIÇO ── */}
        {abaAtiva === 'detalhes' && (
          <div className="modal-body">
            {item.foto && <img src={item.foto} alt="foto" className="modal-foto" />}
            {renderCampo('Aparelho / Modelo', 'aparelho')}
            {renderCampo('IMEI', 'imei')}
            {renderCampo('Cor', 'cor')}
            {renderCampo('Armazenamento (GB)', 'gb')}
            {renderCampo('Defeito relatado', 'defeito', 'textarea')}
            {renderCampo('Técnico responsável', 'tecnico')}

            <div className="detalhe-campo">
              <strong>Valor do serviço</strong>
              <div className="detalhe-valor">
                <span>{formatarMoeda(item.preco)}</span>
                {isAdmin && (
                  <button onClick={() => setEditando('preco')} className="btn-alterar">Alterar</button>
                )}
              </div>
              {editando === 'preco' && (
                <div className="detalhe-edit">
                  <input
                    type="number"
                    value={dados.preco}
                    autoFocus
                    onChange={e => setDados(prev => ({ ...prev, preco: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && salvarCampo('preco')}
                  />
                  <div className="detalhe-edit-btns">
                    <button onClick={() => salvarCampo('preco')} disabled={salvando} className="btn-confirmar">
                      {salvando ? 'Salvando...' : 'Confirmar'}
                    </button>
                    <button onClick={() => setEditando(null)} className="btn-cancelar">Cancelar</button>
                  </div>
                </div>
              )}
            </div>

            {renderCampo('Reparos realizados', 'reparos', 'textarea')}
            {renderCampo('Observações', 'observacoes', 'textarea')}

            <div className="detalhe-campo">
              <strong>Entrada na loja</strong>
              <div className="detalhe-valor">
                <span className="detalhe-data">{formatarData(item.dataCadastro)}</span>
              </div>
            </div>

            {concluido && (
              <div className="detalhe-campo detalhe-campo-concluido">
                <strong>Serviço concluído</strong>
                <div className="detalhe-valor">
                  <span>{item.clienteVenda || item.cliente || '—'}</span>
                  <span className="detalhe-data">{formatarData(item.dataVenda)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ABA CLIENTE ── */}
        {abaAtiva === 'cliente' && (
          <div className="modal-body">
            <div className="cliente-destaque">
              <div className="cliente-avatar">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div>
                <div className="cliente-nome-principal">{item.cliente || 'Cliente não informado'}</div>
                <div className="cpf-formatado">{formatarCpf(item.cpf)}</div>
              </div>
            </div>

            <div className="detalhe-campo">
              <strong>CPF</strong>
              <div className="detalhe-valor">
                <span className="cpf-formatado">{formatarCpf(item.cpf)}</span>
              </div>
            </div>
            <div className="detalhe-campo">
              <strong>Telefone</strong>
              <div className="detalhe-valor">
                {item.telefone
                  ? <a href={`tel:${item.telefone}`} className="link-telefone">📞 {item.telefone}</a>
                  : <span>—</span>
                }
              </div>
            </div>

            {concluido && (
              <div className="detalhe-campo detalhe-campo-concluido">
                <strong>Data de conclusão</strong>
                <div className="detalhe-valor">
                  <span className="detalhe-data">{formatarData(item.dataVenda)}</span>
                </div>
              </div>
            )}

            {/* ── HISTÓRICO DO CLIENTE NA LOJA ── */}
            <div style={{ marginTop: 20, marginBottom: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 10 }}>
                Todos os atendimentos na loja
              </p>

              {loadingCliente && (
                <div className="historico-loading">
                  <div className="loading-spinner" />
                  <span style={{ fontSize: 13 }}>Buscando atendimentos...</span>
                </div>
              )}

              {!loadingCliente && !item.clienteId && (
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Cliente sem vínculo registrado.
                </p>
              )}

              {!loadingCliente && item.clienteId && aparelhosCliente.length === 0 && (
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Nenhum atendimento encontrado.
                </p>
              )}

              {!loadingCliente && aparelhosCliente.map((ap) => (
                <div key={ap.id} style={{
                  background: 'var(--surface-2)',
                  border: `1px solid ${ap.id === item.id ? 'rgba(96,165,250,0.4)' : 'var(--border)'}`,
                  borderRadius: 10, padding: '12px 14px', marginBottom: 8,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>
                        {ap.nome_aparelho}
                        {ap.id === item.id && (
                          <span style={{
                            marginLeft: 8, fontSize: 10,
                            background: 'rgba(96,165,250,0.15)', color: '#60a5fa',
                            padding: '2px 7px', borderRadius: 99,
                          }}>atual</span>
                        )}
                      </span>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                        IMEI: <span style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>{ap.imei}</span>
                      </div>
                      {ap.defeito && (
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                          {ap.defeito}
                        </div>
                      )}
                    </div>
                    <span
                      className={`badge ${ap.status === 'Vendido' ? 'bg-red' : 'bg-green'}`}
                      style={{ position: 'static', fontSize: 11, whiteSpace: 'nowrap' }}
                    >
                      {ap.status === 'Vendido' ? '✅ Concluído' : '🔧 Em serviço'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <span>Entrada: {new Date(ap.criado_em).toLocaleDateString('pt-BR')}</span>
                    {ap.data_venda && (
                      <span style={{ color: '#4ade80' }}>
                        Concluído: {new Date(ap.data_venda).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                    <span>R$ {Number(ap.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ABA HISTÓRICO ── */}
        {abaAtiva === 'historico' && (
          <div className="modal-body">
            {loadingHistorico && (
              <div className="historico-loading">
                <div className="loading-spinner" />
                <p>Carregando histórico...</p>
              </div>
            )}

            {!loadingHistorico && historico.length === 0 && (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <div className="empty-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/>
                  </svg>
                </div>
                <h3>Sem histórico</h3>
                <p>Nenhuma alteração registrada ainda.</p>
              </div>
            )}

            {!loadingHistorico && historico.length > 0 && (
              <div className="timeline">
                {historico.map((h, i) => (
                  <div
                    key={i}
                    className={`timeline-item ${i === historico.length - 1 ? 'timeline-primeiro' : ''} ${i === 0 ? 'timeline-ultimo' : ''}`}
                  >
                    <div className="timeline-linha" />
                    <div className={`timeline-icone ${h.campo_alterado === 'cadastro' ? 'icone-cadastro' : h.campo_alterado === 'status' ? 'icone-status' : 'icone-edicao'}`}>
                      <IconeHistorico campo={h.campo_alterado} />
                    </div>
                    <div className="timeline-conteudo">
                      <div className="timeline-topo">
                        <span className="timeline-campo">{LABELS_CAMPO[h.campo_alterado] || h.campo_alterado}</span>
                        <span className="timeline-data">{formatarData(h.criado_em)}</span>
                      </div>
                      {h.observacao && <p className="timeline-obs">{h.observacao}</p>}
                      {h.valor_anterior && h.valor_novo && (
                        <div className="timeline-diff">
                          <span className="diff-de">{h.valor_anterior}</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                          <span className="diff-para">{h.valor_novo}</span>
                        </div>
                      )}
                      {!h.valor_anterior && h.valor_novo && h.campo_alterado !== 'cadastro' && (
                        <div className="timeline-diff">
                          <span className="diff-para">{h.valor_novo}</span>
                        </div>
                      )}
                      <span className="timeline-usuario">por {h.usuario || 'Sistema'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
