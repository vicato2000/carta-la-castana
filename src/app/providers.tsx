import type { ReactNode } from 'react';
import { HashRouter } from 'react-router-dom';
import { MenuProvider } from '../shared/components/MenuContext';
import { AuthProvider } from '../shared/components/AuthContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <HashRouter>
      <MenuProvider>
        <AuthProvider>{children}</AuthProvider>
      </MenuProvider>
    </HashRouter>
  );
}
