import { useMenu } from '../../shared/components/MenuContext';
import { isGitHubConfigured } from '../../shared/utils/github';

export function DashboardPage() {
  const { data, saveData, saving, saveError, hasUnsavedChanges } = useMenu();

  if (!data) return null;

  const totalItems = data.sections.reduce(
    (sum, s) => sum + s.items.length,
    0
  );
  const availableItems = data.sections.reduce(
    (sum, s) => sum + s.items.filter((i) => i.available).length,
    0
  );

  const handleSave = async () => {
    try {
      await saveData(data);
    } catch {
      // Error handled by context
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carta-la-castana-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const imported = JSON.parse(text);
        if (imported.config && imported.sections) {
          await saveData(imported);
        } else {
          alert('Formato de fichero incorrecto');
        }
      } catch {
        alert('Error al importar el fichero');
      }
    };
    input.click();
  };

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">📋</span>
          <div className="stat-info">
            <span className="stat-value">{data.sections.length}</span>
            <span className="stat-label">Secciones</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🍽️</span>
          <div className="stat-info">
            <span className="stat-value">{totalItems}</span>
            <span className="stat-label">Elementos</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">✅</span>
          <div className="stat-info">
            <span className="stat-value">{availableItems}</span>
            <span className="stat-label">Disponibles</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🔗</span>
          <div className="stat-info">
            <span className="stat-value">
              {isGitHubConfigured() ? 'Sí' : 'No'}
            </span>
            <span className="stat-label">GitHub</span>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <h2 className="section-title">Acciones</h2>
        <div className="action-buttons">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges}
          >
            {saving ? '💾 Guardando...' : '💾 Guardar cambios en GitHub'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExport}
          >
            📤 Exportar JSON
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleImport}
          >
            📥 Importar JSON
          </button>
        </div>
        {saveError && <p className="form-error">{saveError}</p>}
      </div>

      {!isGitHubConfigured() && (
        <div className="alert alert-warning">
          <strong>⚠️ GitHub no configurado</strong>
          <p>
            Para guardar cambios permanentemente, configura las variables de
            entorno <code>VITE_GITHUB_TOKEN</code> y{' '}
            <code>VITE_GITHUB_REPO</code> en el fichero <code>.env</code>.
          </p>
        </div>
      )}
    </div>
  );
}
