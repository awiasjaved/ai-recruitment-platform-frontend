import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerUser } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords match nahi kar rahe!');
            return;
        }

        if (!formData.role) {
            toast.error('Role select karo');
            return;
        }

        setLoading(true);
        try {
            const res = await registerUser({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role
            });

            login(res.data.token, res.data.user);
            toast.success('Registration successful!');

            if (formData.role === 'job_seeker') navigate('/seeker/dashboard');
            else navigate('/provider/dashboard');

        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-2xl">AI</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Create your Account here</h1>
                    <p className="text-gray-500 text-sm mt-1">AI Recruitment Platform registeration </p>
                </div>

                {/* Role Selection */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: 'job_seeker' })}
                        className={`p-4 rounded-xl border-2 text-center transition ${
                            formData.role === 'job_seeker'
                                ? 'border-blue-700 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-blue-300'
                        }`}
                    >
                        <div className="text-2xl mb-1">👤</div>
                        <div className="font-semibold text-sm">Job Seeker</div>
                        <div className="text-xs text-gray-500">You want Job</div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: 'job_provider' })}
                        className={`p-4 rounded-xl border-2 text-center transition ${
                            formData.role === 'job_provider'
                                ? 'border-blue-700 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-blue-300'
                        }`}
                    >
                        <div className="text-2xl mb-1">🏢</div>
                        <div className="font-semibold text-sm">Job Provider</div>
                        <div className="text-xs text-gray-500">You want to hire</div>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Ali Ahmed"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="apni@email.com"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="••••••••"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="••••••••"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                </svg>
                                Registering...
                            </span>
                        ) : 'Register'}
                    </button>
                </form>

                {/* Login Link */}
                <p className="text-center text-gray-600 text-sm mt-6">
                    Already have a account?{' '}
                    <Link to="/login" className="text-blue-700 font-semibold hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;