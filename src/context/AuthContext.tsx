import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { useNavigate } from 'react-router-dom';
import type { LoginPayload, SignupPayload, User } from '../types/api';
import { AuthApi } from '../services/api';
import { clearToken, persistToken, readToken } from '../utils/storage';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isHydrating: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(() => readToken());
  const [user, setUser] = useState<User | null>(null);
  const [isHydrating, setIsHydrating] = useState<boolean>(true);

  const refreshProfile = useCallback(async () => {
    const storedToken = readToken();
    if (!storedToken) {
      setToken(null);
      setUser(null);
      setIsHydrating(false);
      return;
    }

    setIsHydrating(true);
    try {
      const profile = await AuthApi.currentUser();
      setToken(storedToken);
      setUser(profile);
    } catch {
      clearToken();
      setToken(null);
      setUser(null);
    } finally {
      setIsHydrating(false);
    }
  }, []);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      setIsHydrating(true);
      try {
        const response = await AuthApi.login(payload);
        persistToken(response.token);
        setToken(response.token);
        const profile = await AuthApi.currentUser();
        setUser(profile);
        navigate('/', { replace: true });
      } catch (error) {
        clearToken();
        setToken(null);
        setUser(null);
        throw error;
      } finally {
        setIsHydrating(false);
      }
    },
    [navigate]
  );

  const signup = useCallback(
    async (payload: SignupPayload) => {
      await AuthApi.signup(payload);
      await login({ username: payload.username, password: payload.password });
    },
    [login]
  );

  const logout = useCallback(() => {
    clearToken();
    setToken(null);
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isHydrating,
      login,
      signup,
      logout,
      refreshProfile
    }),
    [isHydrating, login, logout, refreshProfile, signup, token, user]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

