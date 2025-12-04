const TOKEN_KEY = 'mini-insta-token';

export const persistToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const readToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

