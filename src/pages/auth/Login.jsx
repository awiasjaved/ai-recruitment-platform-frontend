import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginUser } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { jwtDecode } from "jwt-decode";

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const res = await loginUser(formData);
        // const { token, user } = res.data;
        // console.log("Login Response:", res.data);
        // login(token, user);

       const { token } = res.data;

const decoded = jwtDecode(token);
console.log(decoded); // { id: 5, role: 'job_seeker', ... }

login(token, decoded);

        toast.success('Login Successfully!');

        setTimeout(() => {
            if (decoded.role === 'job_seeker') navigate('/seeker/dashboard');
            else if (decoded.role === 'job_provider') navigate('/provider/dashboard');
            else if (decoded.role === 'admin') navigate('/admin/dashboard');
        }, 500);

    } catch (error) {
        toast.error(error.response?.data?.message || 'Login failed');
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
                    <h1 className="text-2xl font-bold text-gray-800">AI Recruitment</h1>
                    <p className="text-gray-500 text-sm mt-1">Please login to your account</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="apni@email.com"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                </svg>
                                Login...
                            </span>
                        ) : 'Login'}
                    </button>
                </form>

                {/* Register Link */}
                <p className="text-center text-gray-600 text-sm mt-6">
                    Account does not exist?{' '}
                    <Link to="/register" className="text-blue-700 font-semibold hover:underline">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;