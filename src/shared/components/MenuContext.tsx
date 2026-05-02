import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { MenuData, Section, MenuItem } from '../types';
import { fetchMenuData, saveMenuToGitHub, saveMenuLocally, isGitHubConfigured } from '../utils/github';

interface MenuContextType {
  data: MenuData | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
  saveError: string | null;
  refreshData: () => Promise<void>;
  saveData: (newData: MenuData) => Promise<void>;
  updateConfig: (updates: Partial<MenuData['config']>) => void;
  addSection: (section: Section) => void;
  updateSection: (id: string, updates: Partial<Section>) => void;
  deleteSection: (id: string) => void;
  reorderSections: (orderedIds: string[]) => void;
  addItem: (sectionId: string, item: MenuItem) => void;
  updateItem: (sectionId: string, itemId: string, updates: Partial<MenuItem>) => void;
  deleteItem: (sectionId: string, itemId: string) => void;
  moveItem: (sectionId: string, itemIndex: number, direction: -1 | 1) => void;
  hasUnsavedChanges: boolean;
}

const MenuContext = createContext<MenuContextType | null>(null);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const menuData = await fetchMenuData();
      setData(menuData);
      setHasUnsavedChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshData(); }, [refreshData]);

  const saveData = useCallback(async (newData: MenuData) => {
    setSaving(true);
    setSaveError(null);
    try {
      // In dev mode, save to local JSON file via Vite plugin
      if (import.meta.env.DEV) {
        await saveMenuLocally(newData);
      }
      // In production (or if GitHub is configured), also save to GitHub
      if (!import.meta.env.DEV && isGitHubConfigured()) {
        await saveMenuToGitHub(newData);
      }
      setData(newData);
      setHasUnsavedChanges(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateLocal = useCallback((updater: (prev: MenuData) => MenuData) => {
    setData((prev) => {
      if (!prev) return prev;
      setHasUnsavedChanges(true);
      return updater(prev);
    });
  }, []);

  const updateConfig = useCallback(
    (updates: Partial<MenuData['config']>) => {
      updateLocal((prev) => ({ ...prev, config: { ...prev.config, ...updates } }));
    }, [updateLocal]
  );

  const addSection = useCallback(
    (section: Section) => {
      updateLocal((prev) => ({ ...prev, sections: [...prev.sections, section] }));
    }, [updateLocal]
  );

  const updateSection = useCallback(
    (id: string, updates: Partial<Section>) => {
      updateLocal((prev) => ({
        ...prev,
        sections: prev.sections.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      }));
    }, [updateLocal]
  );

  const deleteSection = useCallback(
    (id: string) => {
      updateLocal((prev) => ({ ...prev, sections: prev.sections.filter((s) => s.id !== id) }));
    }, [updateLocal]
  );

  const reorderSections = useCallback(
    (orderedIds: string[]) => {
      updateLocal((prev) => {
        const sectionMap = new Map(prev.sections.map((s) => [s.id, s]));
        const reordered = orderedIds
          .map((id, index) => {
            const section = sectionMap.get(id);
            return section ? { ...section, order: index } : null;
          })
          .filter((s): s is Section => s !== null);
        return { ...prev, sections: reordered };
      });
    }, [updateLocal]
  );

  const addItem = useCallback(
    (sectionId: string, item: MenuItem) => {
      updateLocal((prev) => ({
        ...prev,
        sections: prev.sections.map((s) =>
          s.id === sectionId ? { ...s, items: [...s.items, item] } : s
        ),
      }));
    }, [updateLocal]
  );

  const updateItem = useCallback(
    (sectionId: string, itemId: string, updates: Partial<MenuItem>) => {
      updateLocal((prev) => ({
        ...prev,
        sections: prev.sections.map((s) =>
          s.id === sectionId
            ? { ...s, items: s.items.map((i) => (i.id === itemId ? { ...i, ...updates } : i)) }
            : s
        ),
      }));
    }, [updateLocal]
  );

  const deleteItem = useCallback(
    (sectionId: string, itemId: string) => {
      updateLocal((prev) => ({
        ...prev,
        sections: prev.sections.map((s) =>
          s.id === sectionId ? { ...s, items: s.items.filter((i) => i.id !== itemId) } : s
        ),
      }));
    }, [updateLocal]
  );

  const moveItem = useCallback(
    (sectionId: string, itemIndex: number, direction: -1 | 1) => {
      updateLocal((prev) => ({
        ...prev,
        sections: prev.sections.map((s) => {
          if (s.id !== sectionId) return s;
          const items = [...s.items];
          const newIndex = itemIndex + direction;
          if (newIndex < 0 || newIndex >= items.length) return s;
          [items[itemIndex], items[newIndex]] = [items[newIndex], items[itemIndex]];
          return { ...s, items };
        }),
      }));
    }, [updateLocal]
  );

  return (
    <MenuContext.Provider
      value={{
        data, loading, error, saving, saveError, refreshData, saveData,
        updateConfig, addSection, updateSection, deleteSection, reorderSections,
        addItem, updateItem, deleteItem, moveItem, hasUnsavedChanges,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) throw new Error('useMenu must be used within a MenuProvider');
  return context;
}
