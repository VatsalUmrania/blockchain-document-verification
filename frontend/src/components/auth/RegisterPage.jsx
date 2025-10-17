// components/auth/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import Button from '../common/Button';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        walletAddress: '',
        institutionName: ''
    });
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                walletAddress: formData.walletAddress,
                institutionName: formData.institutionName
            });

            if (response.success) {
                toast.success('Registration successful!');
                navigate('/dashboard');
            } else {
                toast.error(response.error || 'Registration failed');
            }
        } catch (error) {
            toast.error(error.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0D0D0D] via-[#1A1A1A] to-[#121212] px-4">
            <div className="max-w-md w-full space-y-8 p-8 bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] shadow-2xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-[#E0E0E0]">
                        Institute Registration
                    </h2>
                    <p className="mt-2 text-center text-sm text-[#A0A0A0]">
                        Register your institution for blockchain document verification
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-[#E0E0E0]">
                                Full Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="mt-1 block w-full px-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-[#E0E0E0] placeholder-[#7A7A7A] focus:outline-none focus:ring-2 focus:ring-[#296CFF] focus:border-transparent transition-all"
                                placeholder="John Doe"
                            />
                        </div>

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
                                placeholder="your@institution.edu"
                            />
                        </div>

                        <div>
                            <label htmlFor="institutionName" className="block text-sm font-medium text-[#E0E0E0]">
                                Institution Name
                            </label>
                            <input
                                id="institutionName"
                                name="institutionName"
                                type="text"
                                required
                                value={formData.institutionName}
                                onChange={handleChange}
                                className="mt-1 block w-full px-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-[#E0E0E0] placeholder-[#7A7A7A] focus:outline-none focus:ring-2 focus:ring-[#296CFF] focus:border-transparent transition-all"
                                placeholder="Your University or College"
                            />
                        </div>

                        <div>
                            <label htmlFor="walletAddress" className="block text-sm font-medium text-[#E0E0E0]">
                                Wallet Address
                            </label>
                            <input
                                id="walletAddress"
                                name="walletAddress"
                                type="text"
                                required
                                value={formData.walletAddress}
                                onChange={handleChange}
                                className="mt-1 block w-full px-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-[#E0E0E0] placeholder-[#7A7A7A] focus:outline-none focus:ring-2 focus:ring-[#296CFF] focus:border-transparent transition-all"
                                placeholder="0x..."
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
                                minLength="6"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#E0E0E0]">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="mt-1 block w-full px-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-[#E0E0E0] placeholder-[#7A7A7A] focus:outline-none focus:ring-2 focus:ring-[#296CFF] focus:border-transparent transition-all"
                                placeholder="••••••••"
                            />
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
                                    Registering...
                                </span>
                            ) : (
                                'Register Institution'
                            )}
                        </Button>
                    </div>
                </form>

                <div className="text-center text-sm text-[#A0A0A0]">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-[#296CFF] hover:text-[#5D9CFF] transition-colors">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;