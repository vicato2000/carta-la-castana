import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/components/AuthContext';
import { useMenu } from '../../shared/components/MenuContext';
import './Admin.css';

export function AdminLayout() {
  const { logout } = useAuth();
  const { saving, hasUnsavedChanges } = useMenu();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin', { replace: true });
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <span className="admin-brand">La Castana</span>
        </div>
        <nav className="admin-nav">
          <NavLink to="/admin/dashboard" className="admin-nav-link">
            <span className="admin-nav-icon">📊</span>
            Dashboard
          </NavLink>
          <NavLink to="/admin/sections" className="admin-nav-link">
            <span className="admin-nav-icon">📋</span>
            Secciones
          </NavLink>
          <NavLink to="/admin/items" className="admin-nav-link">
            <span className="admin-nav-icon">🍽️</span>
            Elementos
          </NavLink>
          <NavLink to="/admin/settings" className="admin-nav-link">
            <span className="admin-nav-icon">⚙️</span>
            Ajustes
          </NavLink>
        </nav>
        <div className="admin-sidebar-footer">
          <a href="#/" className="admin-nav-link admin-nav-link-secondary">
            <span className="admin-nav-icon">👁️</span>
            Ver carta
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="admin-nav-link admin-logout-btn"
          >
            <span className="admin-nav-icon">🚪</span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-status">
            {saving && (
              <span className="status-saving">
                <span className="status-dot saving" />
                Guardando en GitHub...
              </span>
            )}
            {hasUnsavedChanges && !saving && (
              <span className="status-unsaved">
                <span className="status-dot unsaved" />
                Cambios sin guardar
              </span>
            )}
            {!hasUnsavedChanges && !saving && (
              <span className="status-saved">
                <span className="status-dot saved" />
                Sincronizado
              </span>
            )}
          </div>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
