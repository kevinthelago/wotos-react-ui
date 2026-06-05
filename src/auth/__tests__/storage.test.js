import { getToken, setToken, removeToken } from '../storage';

describe('auth storage', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    test('setToken stores jwt under wotos_jwt key', () => {
        setToken('abc123');
        expect(sessionStorage.getItem('wotos_jwt')).toBe('abc123');
    });

    test('getToken returns stored token', () => {
        sessionStorage.setItem('wotos_jwt', 'abc123');
        expect(getToken()).toBe('abc123');
    });

    test('getToken returns null when nothing stored', () => {
        expect(getToken()).toBeNull();
    });

    test('removeToken clears the token', () => {
        setToken('abc123');
        removeToken();
        expect(getToken()).toBeNull();
    });
});
