import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getNotifications, markAllAsRead } from '../../utils/api';
import { useEffect } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotif, setShowNotif] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const res = await getNotifications();
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.unread_count);
        } catch (error) {
            console.error('Notifications load nahi huyi');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead();
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error('Error');
        }
    };

    const getDashboardLink = () => {
        if (user?.role === 'job_seeker') return '/seeker/dashboard';
        if (user?.role === 'job_provider') return '/provider/dashboard';
        if (user?.role === 'admin') return '/admin/dashboard';
        return '/';
    };

    return (
        <nav className="bg-blue-700 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link to={getDashboardLink()} className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                            <span className="text-blue-700 font-bold text-sm">AI</span>
                        </div>
                        <span className="font-bold text-lg hidden sm:block">AI Recruitment</span>
                    </Link>

                    {/* Nav Links */}
                    <div className="hidden md:flex items-center gap-6">
                        {user?.role === 'job_seeker' && (
                            <>
                                <Link to="/seeker/dashboard" className="hover:text-blue-200 transition">Dashboard</Link>
                                <Link to="/seeker/profile" className="hover:text-blue-200 transition">Profile</Link>
                                <Link to="/seeker/assessment" className="hover:text-blue-200 transition">Assessment</Link>
                                <Link to="/seeker/interview" className="hover:text-blue-200 transition">Interview</Link>
                            </>
                        )}
                        {user?.role === 'job_provider' && (
                            <>
                                <Link to="/provider/dashboard" className="hover:text-blue-200 transition">Dashboard</Link>
                                <Link to="/provider/post-job" className="hover:text-blue-200 transition">Post Job</Link>
                            </>
                        )}
                        {user?.role === 'admin' && (
                            <Link to="/admin/dashboard" className="hover:text-blue-200 transition">Dashboard</Link>
                        )}
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-4">

                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => { setShowNotif(!showNotif); setShowMenu(false); }}
                                className="relative p-2 hover:bg-blue-600 rounded-full transition"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotif && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 text-gray-800">
                                    <div className="flex items-center justify-between p-3 border-b">
                                        <h3 className="font-semibold">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <button onClick={handleMarkAllRead} className="text-xs text-blue-600 hover:underline">
                                                Mark all as read
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <p className="text-center text-gray-500 py-4 text-sm">No notifications</p>
                                        ) : (
                                            notifications.slice(0, 5).map(notif => (
                                                <div key={notif.id} className={`p-3 border-b hover:bg-gray-50 ${!notif.is_read ? 'bg-blue-50' : ''}`}>
                                                    <p className="text-sm">{notif.message}</p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {new Date(notif.sent_at).toLocaleDateString('ur-PK')}
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => { setShowMenu(!showMenu); setShowNotif(false); }}
                                className="flex items-center gap-2 hover:bg-blue-600 px-3 py-2 rounded-lg transition"
                            >
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="hidden sm:block text-sm">{user?.name}</span>
                            </button>

                            {showMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 text-gray-800">
                                    <div className="p-3 border-b">
                                        <p className="font-semibold text-sm">{user?.name}</p>
                                        <p className="text-xs text-gray-500">{user?.role?.replace('_', ' ')}</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;