import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RequireAuth from '../RequireAuth';

jest.mock('../storage', () => ({
    getToken: jest.fn(),
}));

import * as storage from '../storage';

describe('RequireAuth', () => {
    test('redirects to /login when no token', () => {
        storage.getToken.mockReturnValue(null);

        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route path="/login" element={<div>Login Page</div>} />
                    <Route
                        path="/protected"
                        element={
                            <RequireAuth>
                                <div>Protected Content</div>
                            </RequireAuth>
                        }
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Login Page')).toBeInTheDocument();
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    test('renders children when token exists', () => {
        storage.getToken.mockReturnValue('valid-token');

        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route path="/login" element={<div>Login Page</div>} />
                    <Route
                        path="/protected"
                        element={
                            <RequireAuth>
                                <div>Protected Content</div>
                            </RequireAuth>
                        }
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Protected Content')).toBeInTheDocument();
        expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });

    test('passes location state so /login can redirect back on success', () => {
        storage.getToken.mockReturnValue(null);
        let capturedState;

        function FakeLogin() {
            const { state } = require('react-router-dom').useLocation();
            capturedState = state;
            return null;
        }

        render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <Routes>
                    <Route path="/login" element={<FakeLogin />} />
                    <Route
                        path="/dashboard"
                        element={
                            <RequireAuth>
                                <div>Dashboard</div>
                            </RequireAuth>
                        }
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(capturedState?.from?.pathname).toBe('/dashboard');
    });
});
