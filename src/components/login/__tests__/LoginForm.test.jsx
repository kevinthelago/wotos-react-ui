import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../../../lib/api', () => ({
    __esModule: true,
    default: {
        post: jest.fn(),
    },
}));

jest.mock('../../../auth/storage', () => ({
    setToken: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

import api from '../../../lib/api';
import { setToken } from '../../../auth/storage';
import LoginForm from '../LoginForm';

describe('LoginForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders username, password fields and submit button', () => {
        render(
            <MemoryRouter>
                <LoginForm />
            </MemoryRouter>
        );

        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    test('POSTs credentials to /api/users/login and stores jwt on success', async () => {
        api.post.mockResolvedValue({ data: { token: 'jwt-token-123' } });

        render(
            <MemoryRouter>
                <LoginForm />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/api/users/login', {
                username: 'testuser',
                password: 'password123',
            });
            expect(setToken).toHaveBeenCalledWith('jwt-token-123');
        });
    });

    test('redirects to / by default after successful login', async () => {
        api.post.mockResolvedValue({ data: { token: 'jwt-token-123' } });

        render(
            <MemoryRouter>
                <LoginForm />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'user' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass' } });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
        });
    });

    test('redirects to the attempted route after successful login', async () => {
        api.post.mockResolvedValue({ data: { token: 'jwt-token-123' } });

        render(
            <MemoryRouter
                initialEntries={[{ pathname: '/login', state: { from: { pathname: '/player' } } }]}
            >
                <LoginForm />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'user' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass' } });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/player', { replace: true });
        });
    });

    test('displays server error message on login failure', async () => {
        api.post.mockRejectedValue({ response: { data: { message: 'Invalid credentials' } } });

        render(
            <MemoryRouter>
                <LoginForm />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'user' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong' } });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
        });
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    test('displays generic error message when no server message', async () => {
        api.post.mockRejectedValue({ response: { status: 500 } });

        render(
            <MemoryRouter>
                <LoginForm />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'user' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass' } });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent('Login failed. Please try again.');
        });
    });
});
