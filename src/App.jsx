import { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

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

const PageLoader = ({ message = 'Loading...' }) => (
    <div className="page-loader-overlay">
        <div className="page-loader-box">
            <div className="page-loader-spinner"></div>
            <p>{message}</p>
        </div>
    </div>
);

// ============================================
// PRIVATE ROUTE - Login zaroori hai
// ============================================
const PrivateRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <PageLoader message="Please wait..." />;
    }

    if (!user) return <Navigate to="/login" replace />;

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

// ============================================
// HOME REDIRECT - Role ke hisaab se
// ============================================
const HomeRedirect = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <PageLoader message="Please wait..." />;
    }

    if (!user) return <Navigate to="/login" replace />;
    if (user.role === 'job_seeker') return <Navigate to="/seeker/dashboard" replace />;
    if (user.role === 'job_provider') return <Navigate to="/provider/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/login" replace />;
};

function AppContent() {
    const location = useLocation();
    const { loading } = useAuth();
    const [routeLoading, setRouteLoading] = useState(true);
    const firstLoadRef = useRef(true);

    useEffect(() => {
        setRouteLoading(true);

        const timer = setTimeout(() => {
            setRouteLoading(false);
            firstLoadRef.current = false;
        }, firstLoadRef.current ? 800 : 400);

        return () => clearTimeout(timer);
    }, [location.pathname]);

    return (
        <>
            {(loading || routeLoading) && <PageLoader message="" />}

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
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
}

// ============================================
// MAIN APP
// ============================================
function AppRoutes() {
    return (
        <Router>
            <AppContent />
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