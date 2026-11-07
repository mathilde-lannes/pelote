import type { TokenType } from '@/lib/auth/utils';

import { create } from 'zustand';
import {
  getDemoFlag,
  getToken,
  removeToken,
  setDemoFlag,
  setToken,
} from '@/lib/auth/utils';
import { createSelectors } from '@/lib/utils';

export type RavelryUser = {
  id: number;
  username: string;
  smallPhotoUrl?: string | null;
  photoUrl?: string | null;
  firstName?: string | null;
};

type AuthState = {
  token: TokenType | null;
  user: RavelryUser | null;
  isDemo: boolean;
  status: 'idle' | 'signOut' | 'signIn';
  signIn: (data: TokenType, options?: { demo?: boolean }) => Promise<void>;
  setUser: (user: RavelryUser | null) => void;
  signOut: () => Promise<void>;
  hydrate: () => Promise<void>;
};

const _useAuthStore = create<AuthState>((set, get) => ({
  status: 'idle',
  token: null,
  user: null,
  isDemo: false,
  signIn: async (token, options) => {
    const demo = options?.demo ?? false;
    await setToken(token);
    await setDemoFlag(demo);
    set({ status: 'signIn', token, isDemo: demo });
  },
  setUser: (user) => {
    set({ user });
  },
  signOut: async () => {
    await removeToken();
    await setDemoFlag(false);
    set({ status: 'signOut', token: null, user: null, isDemo: false });
  },
  hydrate: async () => {
    try {
      const userToken = await getToken();
      const demo = await getDemoFlag();
      if (userToken !== null) {
        set({ status: 'signIn', token: userToken, isDemo: demo });
      }
      else {
        await get().signOut();
      }
    }
    catch (e) {
      console.error(e);
      await get().signOut();
    }
  },
}));

export const useAuthStore = createSelectors(_useAuthStore);

export const signOut = () => _useAuthStore.getState().signOut();
export const signIn = (
  token: TokenType,
  options?: { demo?: boolean },
) => _useAuthStore.getState().signIn(token, options);
export const setAuthUser = (user: RavelryUser | null) =>
  _useAuthStore.getState().setUser(user);
export const hydrateAuth = () => _useAuthStore.getState().hydrate();
