jest.mock('../../auth/storage', () => ({
    getToken: jest.fn(),
    removeToken: jest.fn(),
}));

import api from '../api';
import * as storage from '../../auth/storage';

describe('api request interceptor', () => {
    const requestFulfilled = api.interceptors.request.handlers[0].fulfilled;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('adds Authorization header for /api/ URLs when token exists', () => {
        storage.getToken.mockReturnValue('my-token');
        const config = { url: '/api/stats/players', headers: {} };
        const result = requestFulfilled(config);
        expect(result.headers['Authorization']).toBe('Bearer my-token');
    });

    test('does not add Authorization header when no token', () => {
        storage.getToken.mockReturnValue(null);
        const config = { url: '/api/stats/players', headers: {} };
        const result = requestFulfilled(config);
        expect(result.headers['Authorization']).toBeUndefined();
    });

    test('does not add Authorization header for non-/api/ URLs', () => {
        storage.getToken.mockReturnValue('my-token');
        const config = { url: '/health', headers: {} };
        const result = requestFulfilled(config);
        expect(result.headers['Authorization']).toBeUndefined();
    });
});

describe('api response interceptor', () => {
    const responseRejected = api.interceptors.response.handlers[0].rejected;

    beforeEach(() => {
        jest.clearAllMocks();
        delete window.location;
        window.location = { href: '' };
    });

    test('removes token and redirects to /login on 401 for non-login URLs', async () => {
        const error = {
            response: { status: 401 },
            config: { url: '/api/stats/players' },
        };
        await responseRejected(error).catch(() => {});
        expect(storage.removeToken).toHaveBeenCalled();
        expect(window.location.href).toBe('/login');
    });

    test('does not redirect on 401 for the login endpoint itself', async () => {
        const error = {
            response: { status: 401 },
            config: { url: '/api/users/login' },
        };
        await responseRejected(error).catch(() => {});
        expect(storage.removeToken).not.toHaveBeenCalled();
        expect(window.location.href).not.toBe('/login');
    });

    test('does not redirect for non-401 errors', async () => {
        const error = {
            response: { status: 500 },
            config: { url: '/api/stats/players' },
        };
        await responseRejected(error).catch(() => {});
        expect(storage.removeToken).not.toHaveBeenCalled();
        expect(window.location.href).not.toBe('/login');
    });

    test('rejects the promise so callers can handle the error', async () => {
        const error = {
            response: { status: 404 },
            config: { url: '/api/missing' },
        };
        await expect(responseRejected(error)).rejects.toBe(error);
    });
});
