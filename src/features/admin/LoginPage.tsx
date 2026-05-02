import { useState, type FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../shared/components/AuthContext';
import './Admin.css';

export function LoginPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(password);
    setLoading(false);
    if (success) {
      navigate('/admin/dashboard', { replace: true });
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Administración</h1>
          <p className="login-subtitle">Bar La Castana</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Introduce la contraseña"
              autoFocus
              required
            />
          </div>
          {loginError && <p className="form-error">{loginError}</p>}
          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading || !password}
          >
            {loading ? 'Verificando...' : 'Acceder'}
          </button>
        </form>
      </div>
    </div>
  );
}
