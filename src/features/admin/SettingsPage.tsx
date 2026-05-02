import { useState } from 'react';
import { useMenu } from '../../shared/components/MenuContext';
import { hashPassword } from '../../shared/utils/auth';

export function SettingsPage() {
  const { data, updateConfig, saveData, saving, hasUnsavedChanges } = useMenu();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  if (!data) return null;

  const handleSave = async () => { try { await saveData(data); } catch {} };

  const handlePasswordChange = async () => {
    if (!newPassword || newPassword.length < 4) { setPasswordMsg('Mínimo 4 caracteres'); return; }
    if (newPassword !== confirmPassword) { setPasswordMsg('Las contraseñas no coinciden'); return; }
    const hash = await hashPassword(newPassword);
    updateConfig({ adminPasswordHash: hash });
    setNewPassword('');
    setConfirmPassword('');
    setPasswordMsg('✅ Contraseña actualizada (recuerda guardar)');
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1 className="page-title">Ajustes</h1>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving || !hasUnsavedChanges}>
          {saving ? 'Guardando...' : '💾 Guardar'}
        </button>
      </div>

      <div className="settings-section">
        <h2 className="section-title">Información del bar</h2>
        <div className="settings-form">
          <div className="form-group">
            <label className="form-label">Nombre del bar</label>
            <input className="form-input" value={data.config.barName} onChange={(e) => updateConfig({ barName: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Subtítulo</label>
            <input className="form-input" value={data.config.subtitle} onChange={(e) => updateConfig({ subtitle: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Nota al pie</label>
            <input className="form-input" value={data.config.footerNote || ''} onChange={(e) => updateConfig({ footerNote: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Nota de alérgenos</label>
            <textarea className="form-input form-textarea" value={data.config.allergenNote || ''} onChange={(e) => updateConfig({ allergenNote: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2 className="section-title">Cambiar contraseña</h2>
        <div className="settings-form">
          <div className="form-group">
            <label className="form-label">Nueva contraseña</label>
            <input className="form-input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Confirmar contraseña</label>
            <input className="form-input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          {passwordMsg && <p className={passwordMsg.startsWith('✅') ? 'form-success' : 'form-error'}>{passwordMsg}</p>}
          <button className="btn btn-secondary" onClick={handlePasswordChange}>Cambiar contraseña</button>
        </div>
      </div>

      <div className="settings-section">
        <h2 className="section-title">GitHub</h2>
        <div className="settings-info">
          <p><strong>Repositorio:</strong> <code>{import.meta.env.VITE_GITHUB_REPO || 'No configurado'}</code></p>
          <p><strong>Token:</strong> <code>{import.meta.env.VITE_GITHUB_TOKEN ? '••••••' + import.meta.env.VITE_GITHUB_TOKEN.slice(-4) : 'No configurado'}</code></p>
          <p className="settings-hint">Para cambiar estos valores, edita el fichero <code>.env</code> en la raíz del proyecto.</p>
        </div>
      </div>
    </div>
  );
}
