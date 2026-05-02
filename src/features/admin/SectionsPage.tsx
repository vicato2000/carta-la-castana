import { useState } from 'react';
import { useMenu } from '../../shared/components/MenuContext';
import type { Section } from '../../shared/types';

export function SectionsPage() {
  const { data, addSection, updateSection, deleteSection, reorderSections, saveData, saving, hasUnsavedChanges } = useMenu();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('🍽️');

  if (!data) return null;
  const sorted = [...data.sections].sort((a, b) => a.order - b.order);

  const handleAdd = () => {
    if (!newName.trim()) return;
    const id = newName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const section: Section = { id, name: newName.trim(), icon: newIcon, order: data.sections.length, visible: true, items: [] };
    addSection(section);
    setNewName('');
    setNewIcon('🍽️');
    setShowNew(false);
  };

  const handleMove = (index: number, dir: -1 | 1) => {
    const ids = sorted.map((s) => s.id);
    const j = index + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[index], ids[j]] = [ids[j], ids[index]];
    reorderSections(ids);
  };

  const handleSave = async () => { try { await saveData(data); } catch {} };

  return (
    <div className="sections-page">
      <div className="page-header">
        <h1 className="page-title">Secciones</h1>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || !hasUnsavedChanges}>
            {saving ? 'Guardando...' : '💾 Guardar'}
          </button>
          <button className="btn btn-accent" onClick={() => setShowNew(true)}>+ Nueva sección</button>
        </div>
      </div>

      {showNew && (
        <div className="inline-form">
          <input className="form-input" placeholder="Nombre" value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus />
          <input className="form-input" placeholder="Icono" value={newIcon} onChange={(e) => setNewIcon(e.target.value)} style={{ width: '60px', textAlign: 'center' }} />
          <button className="btn btn-primary" onClick={handleAdd}>Añadir</button>
          <button className="btn btn-ghost" onClick={() => setShowNew(false)}>Cancelar</button>
        </div>
      )}

      <div className="sections-list">
        {sorted.map((section, index) => (
          <div key={section.id} className="section-row">
            <div className="section-row-order">
              <button className="btn-icon" onClick={() => handleMove(index, -1)} disabled={index === 0}>▲</button>
              <button className="btn-icon" onClick={() => handleMove(index, 1)} disabled={index === sorted.length - 1}>▼</button>
            </div>
            <span className="section-row-icon">{section.icon}</span>
            {editingId === section.id ? (
              <div className="section-row-edit">
                <input className="form-input" value={section.name} onChange={(e) => updateSection(section.id, { name: e.target.value })} />
                <input className="form-input" value={section.icon} onChange={(e) => updateSection(section.id, { icon: e.target.value })} style={{ width: '60px', textAlign: 'center' }} />
                <label className="toggle-label"><input type="checkbox" checked={section.hasDualPricing || false} onChange={(e) => updateSection(section.id, { hasDualPricing: e.target.checked, priceLabelSmall: e.target.checked ? 'Media Ración' : undefined, priceLabelFull: e.target.checked ? 'Ración Entera' : undefined })} /> Doble precio</label>
                <button className="btn btn-ghost" onClick={() => setEditingId(null)}>✓ Hecho</button>
              </div>
            ) : (
              <div className="section-row-info">
                <span className="section-row-name">{section.name}</span>
                <span className="section-row-count">{section.items.length} items</span>
              </div>
            )}
            <div className="section-row-actions">
              <label className="toggle"><input type="checkbox" checked={section.visible} onChange={(e) => updateSection(section.id, { visible: e.target.checked })} /><span className="toggle-slider" /></label>
              <button className="btn-icon" onClick={() => setEditingId(editingId === section.id ? null : section.id)}>✏️</button>
              <button className="btn-icon btn-danger" onClick={() => { if (confirm(`¿Eliminar "${section.name}"?`)) deleteSection(section.id); }}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
