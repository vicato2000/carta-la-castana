import { useState } from 'react';
import { useMenu } from '../../shared/components/MenuContext';
import type { MenuItem } from '../../shared/types';

export function ItemsPage() {
  const { data, addItem, updateItem, deleteItem, moveItem, saveData, saving, hasUnsavedChanges } = useMenu();
  const [filterSection, setFilterSection] = useState('all');
  const [editingItem, setEditingItem] = useState<{ sectionId: string; item: MenuItem } | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newSectionId, setNewSectionId] = useState('');
  const [hasDualNew, setHasDualNew] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', priceHalf: '', priceFull: '', allergens: '' });

  if (!data) return null;

  const handleAdd = () => {
    if (!newItem.name.trim() || !newSectionId) return;
    const id = newItem.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
    const item: MenuItem = {
      id,
      name: newItem.name.trim(),
      description: newItem.description || undefined,
      available: true,
      allergens: newItem.allergens ? newItem.allergens.split(',').map(Number).filter(Boolean) : undefined,
      ...(hasDualNew
        ? {
            priceHalf: newItem.priceHalf ? parseFloat(newItem.priceHalf) : undefined,
            priceFull: newItem.priceFull ? parseFloat(newItem.priceFull) : undefined,
          }
        : { price: newItem.price ? parseFloat(newItem.price) : 0 }),
    };
    addItem(newSectionId, item);
    setNewItem({ name: '', description: '', price: '', priceHalf: '', priceFull: '', allergens: '' });
    setHasDualNew(false);
    setShowNew(false);
  };

  const handleSave = async () => { try { await saveData(data); } catch {} };

  const startEdit = (sectionId: string, item: MenuItem) => {
    setEditingItem({ sectionId, item: { ...item } });
  };

  const handleEditDualToggle = (checked: boolean) => {
    if (!editingItem) return;
    const item = { ...editingItem.item };
    if (checked) {
      item.priceHalf = undefined;
      item.priceFull = item.price ?? 0;
      item.price = undefined;
    } else {
      item.price = item.priceFull ?? 0;
      item.priceHalf = undefined;
      item.priceFull = undefined;
    }
    setEditingItem({ ...editingItem, item });
  };

  const isEditDual = editingItem ? (editingItem.item.priceFull != null) : false;

  const sections = [...data.sections].sort((a, b) => a.order - b.order);
  const filtered = filterSection === 'all' ? sections : sections.filter((s) => s.id === filterSection);

  return (
    <div className="items-page">
      <div className="page-header">
        <h1 className="page-title">Elementos</h1>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || !hasUnsavedChanges}>
            {saving ? 'Guardando...' : '💾 Guardar'}
          </button>
          <button className="btn btn-accent" onClick={() => { setShowNew(true); setNewSectionId(sections[0]?.id || ''); }}>+ Nuevo</button>
        </div>
      </div>

      <div className="filter-bar">
        <label className="form-label">Sección:</label>
        <select className="form-select" value={filterSection} onChange={(e) => setFilterSection(e.target.value)}>
          <option value="all">Todas</option>
          {sections.map((s) => (<option key={s.id} value={s.id}>{s.icon} {s.name}</option>))}
        </select>
      </div>

      {showNew && (
        <div className="item-form-card">
          <h3>Nuevo elemento</h3>
          <div className="item-form-grid">
            <select className="form-select" value={newSectionId} onChange={(e) => setNewSectionId(e.target.value)}>
              {sections.map((s) => (<option key={s.id} value={s.id}>{s.icon} {s.name}</option>))}
            </select>
            <input className="form-input" placeholder="Nombre" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
            <input className="form-input" placeholder="Descripción (opcional)" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
            <label className="toggle-label" style={{ gridColumn: '1 / -1' }}>
              <input type="checkbox" checked={hasDualNew} onChange={(e) => setHasDualNew(e.target.checked)} />
              ¿Tiene media ración?
            </label>
            {hasDualNew ? (
              <>
                <input className="form-input" placeholder="Precio media ración" type="number" step="0.1" value={newItem.priceHalf} onChange={(e) => setNewItem({ ...newItem, priceHalf: e.target.value })} />
                <input className="form-input" placeholder="Precio ración entera" type="number" step="0.1" value={newItem.priceFull} onChange={(e) => setNewItem({ ...newItem, priceFull: e.target.value })} />
              </>
            ) : (
              <input className="form-input" placeholder="Precio" type="number" step="0.1" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} />
            )}
            <input className="form-input" placeholder="Alérgenos (ej: 1,3,7)" value={newItem.allergens} onChange={(e) => setNewItem({ ...newItem, allergens: e.target.value })} />
          </div>
          <div className="item-form-actions">
            <button className="btn btn-primary" onClick={handleAdd}>Añadir</button>
            <button className="btn btn-ghost" onClick={() => setShowNew(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {filtered.map((section) => (
        <div key={section.id} className="items-section">
          <h2 className="section-title">{section.icon} {section.name}</h2>
          <div className="items-table">
            {section.items.map((item, index) => (
              <div key={item.id} className={`item-row ${!item.available ? 'item-unavailable' : ''}`}>
                {editingItem?.item.id === item.id ? (
                  <div className="item-edit-form">
                    <input className="form-input" value={editingItem.item.name} onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, name: e.target.value } })} />
                    <input className="form-input" value={editingItem.item.description || ''} placeholder="Descripción" onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, description: e.target.value } })} />
                    <label className="toggle-label">
                      <input type="checkbox" checked={isEditDual} onChange={(e) => handleEditDualToggle(e.target.checked)} />
                      ¿Media ración?
                    </label>
                    {isEditDual ? (
                      <>
                        <input className="form-input" type="number" step="0.1" placeholder="Media" value={editingItem.item.priceHalf ?? ''} onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, priceHalf: e.target.value ? parseFloat(e.target.value) : undefined } })} />
                        <input className="form-input" type="number" step="0.1" placeholder="Entera" value={editingItem.item.priceFull ?? ''} onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, priceFull: parseFloat(e.target.value) } })} />
                      </>
                    ) : (
                      <input className="form-input" type="number" step="0.1" placeholder="Precio" value={editingItem.item.price ?? ''} onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, price: parseFloat(e.target.value) } })} />
                    )}
                    <input className="form-input" placeholder="Alérgenos" value={(editingItem.item.allergens || []).join(',')} onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, allergens: e.target.value ? e.target.value.split(',').map(Number).filter(Boolean) : [] } })} />
                    <div className="item-form-actions">
                      <button className="btn btn-primary btn-sm" onClick={() => { updateItem(section.id, item.id, editingItem.item); setEditingItem(null); }}>Guardar</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditingItem(null)}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="item-row-order">
                      <button className="btn-icon" onClick={() => moveItem(section.id, index, -1)} disabled={index === 0} title="Subir">▲</button>
                      <button className="btn-icon" onClick={() => moveItem(section.id, index, 1)} disabled={index === section.items.length - 1} title="Bajar">▼</button>
                    </div>
                    <div className="item-row-info">
                      <span className="item-row-name">{item.name}</span>
                      {item.description && <span className="item-row-desc">{item.description}</span>}
                      {item.allergens && item.allergens.length > 0 && <span className="item-row-allergens">Alérg: {item.allergens.join(', ')}</span>}
                    </div>
                    <div className="item-row-prices">
                      {item.price != null && <span>{item.price.toFixed(2)} €</span>}
                      {item.priceHalf != null && <span>½ {item.priceHalf.toFixed(2)} €</span>}
                      {item.priceFull != null && <span>1 {item.priceFull.toFixed(2)} €</span>}
                    </div>
                    <div className="item-row-actions">
                      <label className="toggle"><input type="checkbox" checked={item.available} onChange={(e) => updateItem(section.id, item.id, { available: e.target.checked })} /><span className="toggle-slider" /></label>
                      <button className="btn-icon" onClick={() => startEdit(section.id, item)}>✏️</button>
                      <button className="btn-icon btn-danger" onClick={() => { if (confirm(`¿Eliminar "${item.name}"?`)) deleteItem(section.id, item.id); }}>🗑️</button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {section.items.length === 0 && <p className="empty-message">No hay elementos en esta sección</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
