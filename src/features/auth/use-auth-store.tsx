import type { TokenType } from '@/lib/auth/utils';

import { create } from 'zustand';
import {
  getToken,
  removeToken,
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
  status: 'idle' | 'signOut' | 'signIn';
  signIn: (data: TokenType) => Promise<void>;
  setUser: (user: RavelryUser | null) => void;
  signOut: () => Promise<void>;
  hydrate: () => Promise<void>;
};

const _useAuthStore = create<AuthState>((set, get) => ({
  status: 'idle',
  token: null,
  user: null,
  signIn: async (token) => {
    await setToken(token);
    set({ status: 'signIn', token });
  },
  setUser: (user) => {
    set({ user });
  },
  signOut: async () => {
    await removeToken();
    set({ status: 'signOut', token: null, user: null });
  },
  hydrate: async () => {
    try {
      const userToken = await getToken();
      if (userToken !== null) {
        set({ status: 'signIn', token: userToken });
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
export const signIn = (token: TokenType) =>
  _useAuthStore.getState().signIn(token);
export const setAuthUser = (user: RavelryUser | null) =>
  _useAuthStore.getState().setUser(user);
export const hydrateAuth = () => _useAuthStore.getState().hydrate();
