import React, { useState } from 'react';
import { login } from '../api';

export function LoginForm({ onLogin }) {
  const [nome, setNome]     = useState('');
  const [senha, setSenha]   = useState('');
  const [erro, setErro]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      const usuario = await login(nome.trim(), senha);
      onLogin(usuario);
    } catch (err) {
      setErro(err.message || 'Usuário ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit} autoComplete="off">

        <div className="login-logo">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="10" fill="#1a1a1a" stroke="#2a2a2a"/>
            <rect x="10" y="6" width="10" height="16" rx="2" stroke="#c0c0c0" strokeWidth="1.5"/>
            <rect x="16" y="14" width="10" height="16" rx="2" fill="#1a1a1a" stroke="#888" strokeWidth="1.5"/>
            <line x1="13" y1="11" x2="17" y2="11" stroke="#c0c0c0" strokeWidth="1.2" strokeLinecap="round"/>
            <line x1="13" y1="14" x2="17" y2="14" stroke="#c0c0c0" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <div className="login-logo-text">
            <span style={{ color: '#f0f0f0' }}>Center</span>
            <span style={{ color: '#888' }}>Cel</span>
          </div>
          <p className="login-subtitulo">Sistema de gestão</p>
        </div>

        <div className="login-field">
          <label className="login-label">Usuário</label>
          <input
            type="text"
            placeholder="Digite seu usuário"
            value={nome}
            onChange={e => setNome(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="login-field">
          <label className="login-label">Senha</label>
          <input
            type="password"
            placeholder="Digite sua senha"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            required
          />
        </div>

        {erro && <p className="login-erro">{erro}</p>}

        <button type="submit" disabled={loading}>
          {loading ? <span className="btn-spinner" /> : 'Entrar'}
        </button>

        <div className="login-perfis">
          <div className="perfil-info">
            <span className="perfil-badge perfil-admin">Admin</span>
            <span className="perfil-desc">Cadastrar, pesquisar, editar, excluir e ver histórico</span>
          </div>
          <div className="perfil-info">
            <span className="perfil-badge perfil-vendedor">Vendedor</span>
            <span className="perfil-desc">Apenas cadastrar e pesquisar aparelhos</span>
          </div>
        </div>

      </form>
    </div>
  );
}