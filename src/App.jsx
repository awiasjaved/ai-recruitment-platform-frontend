import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Seeker Pages
import SeekerDashboard from './pages/seeker/Dashboard';
import SeekerProfile from './pages/seeker/Profile';
import Assessment from './pages/seeker/Assessment';
import Interview from './pages/seeker/Interview';

// Provider Pages
import ProviderDashboard from './pages/provider/Dashboard';
import PostJob from './pages/provider/PostJob';
import Candidates from './pages/provider/Candidates';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';

// ============================================
// PRIVATE ROUTE - Login zaroori hai
// ============================================
const PrivateRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" />;

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" />;
    }

    return children;
};

// ============================================
// HOME REDIRECT - Role ke hisaab se
// ============================================
const HomeRedirect = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" />;
    if (user.role === 'job_seeker') return <Navigate to="/seeker/dashboard" />;
    if (user.role === 'job_provider') return <Navigate to="/provider/dashboard" />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" />;
    return <Navigate to="/login" />;
};

// ============================================
// MAIN APP
// ============================================
function AppRoutes() {
    return (
        <Router>
            <Routes>
                {/* Home */}
                <Route path="/" element={<HomeRedirect />} />

                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Seeker Routes */}
                <Route path="/seeker/dashboard" element={
                    <PrivateRoute allowedRoles={['job_seeker']}>
                        <SeekerDashboard />
                    </PrivateRoute>
                } />
                <Route path="/seeker/profile" element={
                    <PrivateRoute allowedRoles={['job_seeker']}>
                        <SeekerProfile />
                    </PrivateRoute>
                } />
                <Route path="/seeker/assessment" element={
                    <PrivateRoute allowedRoles={['job_seeker']}>
                        <Assessment />
                    </PrivateRoute>
                } />
                <Route path="/seeker/interview" element={
                    <PrivateRoute allowedRoles={['job_seeker']}>
                        <Interview />
                    </PrivateRoute>
                } />

                {/* Provider Routes */}
                <Route path="/provider/dashboard" element={
                    <PrivateRoute allowedRoles={['job_provider']}>
                        <ProviderDashboard />
                    </PrivateRoute>
                } />
                <Route path="/provider/post-job" element={
                    <PrivateRoute allowedRoles={['job_provider']}>
                        <PostJob />
                    </PrivateRoute>
                } />
                <Route path="/provider/candidates/:jobId" element={
                    <PrivateRoute allowedRoles={['job_provider']}>
                        <Candidates />
                    </PrivateRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={
                    <PrivateRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                    </PrivateRoute>
                } />

                {/* 404 */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppRoutes />
            <ToastContainer position="top-right" autoClose={3000} />
        </AuthProvider>
    );
}

export default App;