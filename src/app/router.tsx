import { Routes, Route } from 'react-router-dom';
import { MenuPage } from '../features/menu/MenuPage';
import { LoginPage } from '../features/admin/LoginPage';
import { AdminLayout } from '../features/admin/AdminLayout';
import { DashboardPage } from '../features/admin/DashboardPage';
import { SectionsPage } from '../features/admin/SectionsPage';
import { ItemsPage } from '../features/admin/ItemsPage';
import { SettingsPage } from '../features/admin/SettingsPage';
import { ProtectedRoute } from '../shared/components/ProtectedRoute';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<MenuPage />} />
      <Route path="/admin" element={<LoginPage />} />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="sections" element={<SectionsPage />} />
        <Route path="items" element={<ItemsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
