import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  verifyPassword,
  isAuthenticated as checkAuth,
  setAuthenticated,
} from '../utils/auth';
import { useMenu } from './MenuContext';

interface AuthContextType {
  isAuthenticated: boolean;
  loginError: string | null;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuth, setIsAuth] = useState(checkAuth());
  const [loginError, setLoginError] = useState<string | null>(null);
  const { data } = useMenu();

  const login = useCallback(
    async (password: string): Promise<boolean> => {
      setLoginError(null);
      if (!data) {
        setLoginError('Error: datos del menú no cargados');
        return false;
      }
      const valid = await verifyPassword(password, data.config.adminPasswordHash);
      if (valid) {
        setAuthenticated(true);
        setIsAuth(true);
        return true;
      }
      setLoginError('Contraseña incorrecta');
      return false;
    },
    [data]
  );

  const logout = useCallback(() => {
    setAuthenticated(false);
    setIsAuth(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: isAuth, loginError, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
