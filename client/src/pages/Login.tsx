import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginRequest, ApiError } from '../api/client.js';
import { useAuthStore } from '../store/authStore.js';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const { token, user } = await loginRequest(username, password);
      setSession(token, user);
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível entrar');
    }
  }

  return (
    <div className="auth-page">
      <h1>Entrar no Realchat</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Usuário
          <input value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>
        <label>
          Senha
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit">Entrar</button>
      </form>
      <p>
        Não tem conta? <Link to="/register">Cadastre-se</Link>
      </p>
    </div>
  );
}
