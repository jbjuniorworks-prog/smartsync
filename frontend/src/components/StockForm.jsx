import { useState, useRef } from 'react';
import { comprimirImagem, validarImei } from '../utils/formatters';

export function StockForm({ onSalvar }) {
  const [form, setForm] = useState({
    cliente: '', cpf: '', telefone: '',
    aparelho: '', imei: '', preco: '',
    defeito: '', tecnico: ''
  });
  const [foto, setFoto] = useState('');
  const [nomeArquivo, setNomeArquivo] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erroImei, setErroImei] = useState('');
  const fileInputRef = useRef(null);

  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const imeiValido = validarImei(form.imei);
  const camposValidos = form.cliente && form.aparelho && form.imei && form.preco && imeiValido;

  const handleImei = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 15);
    setForm({ ...form, imei: val });
    if (val.length === 0)      setErroImei('');
    else if (val.length < 15)  setErroImei(`${val.length}/15 dígitos`);
    else                       setErroImei(validarImei(val) ? '' : 'IMEI inválido');
  };

  const handleCpf = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 11);
    const fmt = val
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    setForm({ ...form, cpf: fmt });
  };

  const handleTelefone = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 11);
    const fmt = val
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
    setForm({ ...form, telefone: fmt });
  };

  const handleFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNomeArquivo(file.name);
    const comprimida = await comprimirImagem(file);
    setFoto(comprimida);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!camposValidos) return;
    setSalvando(true);
    const ok = await onSalvar(form, foto);
    if (ok) {
      setForm({ cliente: '', cpf: '', telefone: '', aparelho: '', imei: '', preco: '', defeito: '', tecnico: '' });
      setFoto('');
      setNomeArquivo('');
      setErroImei('');
    }
    setSalvando(false);
  };

  return (
    <div className="form-card">
      <div className="form-head">
        <h2>Cadastrar aparelho</h2>
        <p className="form-sub">
          Registre a entrada do aparelho. Campos com <strong>*</strong> são obrigatórios ·
          preencha o <strong>CPF</strong> para localizar o cliente depois pela busca.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="grid-form">

        {/* Linha 1 — dados do cliente */}
        <input value={form.cliente} onChange={set('cliente')} placeholder="Cliente *" />
        <input value={form.cpf} onChange={handleCpf} placeholder="CPF (recomendado)" />
        <input value={form.telefone} onChange={handleTelefone} placeholder="Telefone (opcional)" />

        {/* Linha 2 — dados do aparelho */}
        <input value={form.aparelho} onChange={set('aparelho')} placeholder="Aparelho *" />

        <div className="input-wrapper">
          <input
            value={form.imei}
            onChange={handleImei}
            placeholder="IMEI (15 dígitos) *"
            maxLength={15}
            className={erroImei ? 'input-erro' : ''}
          />
          {erroImei && <span className="input-hint">{erroImei}</span>}
        </div>

        <input
          type="number"
          value={form.preco}
          onChange={set('preco')}
          placeholder="R$ *"
        />

        {/* Linha 3 — serviço */}
        <input value={form.defeito} onChange={set('defeito')} placeholder="Defeito relatado" />
        <input value={form.tecnico} onChange={set('tecnico')} placeholder="Técnico responsável" />

        {/* Foto + Salvar */}
        <input
          type="file" accept="image/*" capture="environment"
          ref={fileInputRef} onChange={handleFoto}
          style={{ display: 'none' }}
        />
        <button type="button" className="btn-upload" onClick={() => fileInputRef.current.click()}>
          {foto ? (
            <span className="btn-upload-preview">
              <img src={foto} alt="preview" className="upload-thumb" />
              <span>{nomeArquivo.length > 16 ? nomeArquivo.slice(0, 16) + '…' : nomeArquivo}</span>
            </span>
          ) : (
            <span className="btn-upload-placeholder">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Foto
            </span>
          )}
        </button>

        <button
          type="submit" className="btn-save"
          disabled={!camposValidos || salvando}
          style={{ opacity: (!camposValidos || salvando) ? 0.5 : 1 }}
        >
          {salvando ? 'SALVANDO...' : 'SALVAR'}
        </button>
      </form>
    </div>
  );
}