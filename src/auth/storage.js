const JWT_KEY = 'wotos_jwt';

export const getToken = () => sessionStorage.getItem(JWT_KEY);
export const setToken = (token) => sessionStorage.setItem(JWT_KEY, token);
export const removeToken = () => sessionStorage.removeItem(JWT_KEY);
