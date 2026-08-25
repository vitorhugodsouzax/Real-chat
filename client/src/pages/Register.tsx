import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerRequest, ApiError } from '../api/client.js';
import { useAuthStore } from '../store/authStore.js';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const { token, user } = await registerRequest(username, password);
      setSession(token, user);
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível criar a conta');
    }
  }

  return (
    <div className="auth-page">
      <h1>Criar conta no Realchat</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Usuário
          <input value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} />
        </label>
        <label>
          Senha
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit">Cadastrar</button>
      </form>
      <p>
        Já tem conta? <Link to="/login">Entrar</Link>
      </p>
    </div>
  );
}
