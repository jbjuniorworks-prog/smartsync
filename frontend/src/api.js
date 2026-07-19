// Cliente HTTP central: injeta o token JWT, trata 401 e centraliza a URL da API.
const API_URL = process.env.REACT_APP_API_URL || 'https://smartsync-api-1.onrender.com/api';

const TOKEN_KEY = 'smartsync_token';
const USER_KEY = 'usuario_logado';

export const getToken = () => sessionStorage.getItem(TOKEN_KEY);

export const getUsuario = () => {
  try { return JSON.parse(sessionStorage.getItem(USER_KEY)); }
  catch { return null; }
};

export const setSessao = (token, usuario) => {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(usuario));
};

export const limparSessao = () => {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
};

// fetch autenticado. Em 401, limpa a sessão e avisa o app para deslogar.
export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };
  if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    limparSessao();
    window.dispatchEvent(new Event('smartsync:naoautenticado'));
    throw new Error('Sessão expirada. Faça login novamente.');
  }
  return res;
}

// login: valida no backend e guarda o token da sessão.
export async function login(nome, senha) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, senha }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.mensagem || 'Falha no login');
  setSessao(data.token, data.usuario);
  return data.usuario;
}
