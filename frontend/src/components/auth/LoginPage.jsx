// components/auth/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import Button from '../common/Button';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await login(formData);

            if (response.success) {
                toast.success('Login successful!');
                navigate('/dashboard');
            } else {
                toast.error(response.error || 'Login failed');
            }
        } catch (error) {
            toast.error(error.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0D0D0D] via-[#1A1A1A] to-[#121212] px-4">
            <div className="max-w-md w-full space-y-8 p-8 bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] shadow-2xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-[#E0E0E0]">
                        Institute Login
                    </h2>
                    <p className="mt-2 text-center text-sm text-[#A0A0A0]">
                        Sign in to your blockchain document verification account
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-[#E0E0E0]">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="mt-1 block w-full px-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-[#E0E0E0] placeholder-[#7A7A7A] focus:outline-none focus:ring-2 focus:ring-[#296CFF] focus:border-transparent transition-all"
                                placeholder="your@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-[#E0E0E0]">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="mt-1 block w-full px-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-[#E0E0E0] placeholder-[#7A7A7A] focus:outline-none focus:ring-2 focus:ring-[#296CFF] focus:border-transparent transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <Link to="/forgot-password" className="font-medium text-[#296CFF] hover:text-[#5D9CFF] transition-colors">
                                Forgot your password?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4"
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign in'
                            )}
                        </Button>
                    </div>
                </form>

                <div className="text-center text-sm text-[#A0A0A0]">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-medium text-[#296CFF] hover:text-[#5D9CFF] transition-colors">
                        Register now
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;