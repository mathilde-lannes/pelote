const TOKEN_KEY = 'pelote.ravelry.tokens';
const DEMO_KEY = 'pelote.demo.mode';

export type TokenType = {
  access: string;
  refresh: string;
  expiresAt?: number;
};

export async function getToken(): Promise<TokenType | null> {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw)
      return null;
    return JSON.parse(raw) as TokenType;
  }
  catch {
    return null;
  }
}

export async function setToken(value: TokenType): Promise<void> {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(value));
}

export async function removeToken(): Promise<void> {
  localStorage.removeItem(TOKEN_KEY);
}

export async function getDemoFlag(): Promise<boolean> {
  const raw = localStorage.getItem(DEMO_KEY);
  return raw === '1';
}

export async function setDemoFlag(enabled: boolean): Promise<void> {
  if (enabled) {
    localStorage.setItem(DEMO_KEY, '1');
  }
  else {
    localStorage.removeItem(DEMO_KEY);
  }
}
