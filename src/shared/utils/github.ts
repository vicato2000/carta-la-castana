import type { MenuData } from '../types';

const DATA_PATH = 'public/data/menu.json';

export async function fetchMenuData(): Promise<MenuData> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/menu.json?t=${Date.now()}`);
  if (!response.ok) throw new Error('Error al cargar los datos del menú');
  return response.json();
}

export function isGitHubConfigured(): boolean {
  return !!(import.meta.env.VITE_GITHUB_TOKEN && import.meta.env.VITE_GITHUB_REPO);
}

/** Save to local filesystem via Vite dev server plugin */
export async function saveMenuLocally(data: MenuData): Promise<void> {
  const response = await fetch('/api/save-menu', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data, null, 2),
  });
  if (!response.ok) throw new Error('Error al guardar localmente');
}

/** Save to GitHub repo via API (for production) */
export async function saveMenuToGitHub(data: MenuData): Promise<void> {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  const repo = import.meta.env.VITE_GITHUB_REPO;

  if (!token || !repo) {
    throw new Error(
      'Configuración de GitHub no encontrada. Añade VITE_GITHUB_TOKEN y VITE_GITHUB_REPO en .env'
    );
  }

  const getResponse = await fetch(
    `https://api.github.com/repos/${repo}/contents/${DATA_PATH}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );

  if (!getResponse.ok) {
    throw new Error('No se pudo obtener la información del fichero en GitHub');
  }

  const fileInfo = await getResponse.json();
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));

  const putResponse = await fetch(
    `https://api.github.com/repos/${repo}/contents/${DATA_PATH}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        message: `Actualizar carta - ${new Date().toLocaleString('es-ES')}`,
        content,
        sha: fileInfo.sha,
      }),
    }
  );

  if (!putResponse.ok) {
    const errorData = await putResponse.json().catch(() => ({}));
    throw new Error(`Error al guardar en GitHub: ${errorData.message || putResponse.statusText}`);
  }
}
