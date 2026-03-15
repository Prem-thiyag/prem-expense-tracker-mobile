import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import axios from "axios";

import { authService } from "../services/authService";
import { setUnauthorizedHandler } from "../services/api/client";
import { authStorage } from "../storage/authStorage";
import type { RegisterPayload, User } from "../types/api";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

const isRecoverableBootstrapError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return !error.response || error.code === "ECONNABORTED";
  }

  return error instanceof Error && /timeout|network|aborted/i.test(error.message);
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const clearSession = async () => {
    await authStorage.clearSession();
    setUser(null);
    setToken(null);
  };

  const refreshProfile = async () => {
    const profile = await authService.getMyProfile();
    setUser(profile);
    await authStorage.setUser(profile);
  };

  const login = async (identifier: string, password: string) => {
    const loginResponse = await authService.login(identifier, password);

    await authStorage.setAccessToken(loginResponse.access_token);
    setToken(loginResponse.access_token);

    try {
      const profile = await authService.getMyProfile();
      await authStorage.setUser(profile);
      setUser(profile);
    } catch (error) {
      await clearSession();
      throw error;
    }
  };

  const register = async (payload: RegisterPayload) => {
    await authService.register(payload);
  };

  const logout = async () => {
    await clearSession();
  };

  useEffect(() => {
    setUnauthorizedHandler(clearSession);

    const bootstrap = async () => {
      try {
        const storedToken = await authStorage.getAccessToken();

        if (!storedToken) {
          return;
        }

        setToken(storedToken);

        const storedUser = await authStorage.getUser();
        if (storedUser) {
          setUser(storedUser);
        }

        try {
          const profile = await authService.getMyProfile();
          setUser(profile);
          await authStorage.setUser(profile);
        } catch (error) {
          if (storedUser && isRecoverableBootstrapError(error)) {
            return;
          }

          throw error;
        }
      } catch {
        await clearSession();
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrap();

    return () => {
      setUnauthorizedHandler(null);
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isBootstrapping,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [isBootstrapping, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

