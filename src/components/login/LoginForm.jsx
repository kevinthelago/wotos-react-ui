import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { setToken } from '../../auth/storage';
import api from '../../lib/api';
import './login.css';

export default function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        try {
            const { data } = await api.post('/api/users/login', { username, password });
            setToken(data.token);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        }
    }

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2 className="login-title">Sign In</h2>
                {error && <p className="login-error" role="alert">{error}</p>}
                <label className="login-label">
                    Username
                    <input
                        className="login-input"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoComplete="username"
                    />
                </label>
                <label className="login-label">
                    Password
                    <input
                        className="login-input"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                    />
                </label>
                <button className="login-button" type="submit">Sign In</button>
            </form>
        </div>
    );
}
