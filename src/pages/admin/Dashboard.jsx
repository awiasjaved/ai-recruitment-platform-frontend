import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../../components/common/Navbar';
import API from '../../utils/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalSeekers: 0,
        totalProviders: 0,
        totalJobs: 0,
        totalAssessments: 0,
        totalInterviews: 0
    });
    const [users, setUsers] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchUser, setSearchUser] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [usersRes, jobsRes] = await Promise.all([
                API.get('/admin/users'),
                API.get('/admin/jobs')
            ]);
            const allUsers = usersRes.data.users;
            const allJobs = jobsRes.data.jobs;

            setUsers(allUsers);
            setJobs(allJobs);
            setStats({
                totalUsers: allUsers.length,
                totalSeekers: allUsers.filter(u => u.role === 'job_seeker').length,
                totalProviders: allUsers.filter(u => u.role === 'job_provider').length,
                totalJobs: allJobs.length,
                totalAssessments: allUsers.reduce((a, u) => a + (u.assessment_count || 0), 0),
                totalInterviews: allUsers.reduce((a, u) => a + (u.interview_count || 0), 0)
            });
        } catch (error) {
            toast.error('Data load nahi hua — Admin routes add karo');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleUser = async (userId, isActive) => {
        try {
            await API.put(`/admin/users/${userId}/toggle`);
            toast.success(isActive ? 'The user has been deactivated.' : 'The user has been activated.');
            setUsers(users.map(u =>
                u.id === userId ? { ...u, is_active: !u.is_active } : u
            ));
        } catch (error) {
            toast.error('Action fail ho gaya');
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm('Are you sure you want to delete this job?')) return;
        try {
            await API.delete(`/admin/jobs/${jobId}`);
            toast.success('Job deleted successfully');
            setJobs(jobs.filter(j => j.id !== jobId));
        } catch (error) {
            toast.error('Job delete nahi hui');
        }
    };

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchUser.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="bg-gradient-to-r from-gray-800 to-gray-600 rounded-2xl p-6 text-white mb-6">
                    <h1 className="text-2xl font-bold">Admin Dashboard ⚙️</h1>
                    <p className="text-gray-300 mt-1">Manage all aspects of the platform</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                    {[
                        { label: 'Total Users', value: stats.totalUsers, color: 'text-blue-700', bg: 'bg-blue-50' },
                        { label: 'Job Seekers', value: stats.totalSeekers, color: 'text-green-700', bg: 'bg-green-50' },
                        { label: 'Providers', value: stats.totalProviders, color: 'text-purple-700', bg: 'bg-purple-50' },
                        { label: 'Total Jobs', value: stats.totalJobs, color: 'text-indigo-700', bg: 'bg-indigo-50' },
                        { label: 'Assessments', value: stats.totalAssessments, color: 'text-orange-700', bg: 'bg-orange-50' },
                        { label: 'Interviews', value: stats.totalInterviews, color: 'text-red-700', bg: 'bg-red-50' }
                    ].map(stat => (
                        <div key={stat.label} className={`${stat.bg} rounded-xl p-4 shadow-sm`}>
                            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                            <div className="text-gray-500 text-xs mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {['overview', 'users', 'jobs'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-lg font-medium text-sm transition capitalize ${
                                activeTab === tab
                                    ? 'bg-gray-800 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {tab === 'overview' ? '📊 Overview' :
                             tab === 'users' ? '👥 Users' : '💼 Jobs'}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Recent Users */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            <h2 className="font-bold text-gray-800 mb-4">Recent Users</h2>
                            <div className="space-y-3">
                                {users.slice(0, 5).map(u => (
                                    <div key={u.id} className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600 text-sm">
                                            {u.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-800">{u.name}</p>
                                            <p className="text-xs text-gray-400">{u.email}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            u.role === 'job_seeker' ? 'bg-green-100 text-green-700' :
                                            u.role === 'job_provider' ? 'bg-purple-100 text-purple-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {u.role?.replace('_', ' ')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Jobs */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            <h2 className="font-bold text-gray-800 mb-4">Recent Jobs</h2>
                            <div className="space-y-3">
                                {jobs.slice(0, 5).map(j => (
                                    <div key={j.id} className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-lg">
                                            💼
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-800">{j.title}</p>
                                            <p className="text-xs text-gray-400">{j.company_name}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            j.status === 'active'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {j.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Role Distribution */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            <h2 className="font-bold text-gray-800 mb-4">User Distribution</h2>
                            <div className="space-y-3">
                                {[
                                    { label: 'Job Seekers', count: stats.totalSeekers, total: stats.totalUsers, color: 'bg-green-500' },
                                    { label: 'Job Providers', count: stats.totalProviders, total: stats.totalUsers, color: 'bg-purple-500' }
                                ].map(item => (
                                    <div key={item.label}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600">{item.label}</span>
                                            <span className="font-medium">{item.count}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className={`${item.color} h-2 rounded-full`}
                                                style={{ width: item.total ? `${(item.count / item.total) * 100}%` : '0%' }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* System Info */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            <h2 className="font-bold text-gray-800 mb-4">System Info</h2>
                            <div className="space-y-3">
                                {[
                                    { label: 'Platform', value: 'AI Recruitment v1.0' },
                                    { label: 'Backend', value: 'Node.js + Express' },
                                    { label: 'Database', value: 'MySQL' },
                                    { label: 'Frontend', value: 'React + Tailwind' },
                                    { label: 'University', value: 'NUML Faisalabad' }
                                ].map(item => (
                                    <div key={item.label} className="flex justify-between py-2 border-b border-gray-50">
                                        <span className="text-gray-500 text-sm">{item.label}</span>
                                        <span className="text-gray-800 text-sm font-medium">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="p-5 border-b border-gray-100">
                            <h2 className="font-bold text-gray-800 mb-3">All Users</h2>
                            <input
                                type="text"
                                placeholder="User search karo..."
                                value={searchUser}
                                onChange={e => setSearchUser(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                            />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left p-4 text-xs font-medium text-gray-500">User</th>
                                        <th className="text-left p-4 text-xs font-medium text-gray-500">Role</th>
                                        <th className="text-left p-4 text-xs font-medium text-gray-500">Status</th>
                                        <th className="text-left p-4 text-xs font-medium text-gray-500">Joined</th>
                                        <th className="text-left p-4 text-xs font-medium text-gray-500">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredUsers.map(u => (
                                        <tr key={u.id} className="hover:bg-gray-50 transition">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600 text-sm">
                                                        {u.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800">{u.name}</p>
                                                        <p className="text-xs text-gray-400">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                    u.role === 'job_seeker' ? 'bg-green-100 text-green-700' :
                                                    u.role === 'job_provider' ? 'bg-purple-100 text-purple-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                    {u.role?.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                    u.is_active
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {u.is_active ? 'Active' : 'Banned'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-gray-500">
                                                {new Date(u.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                {u.role !== 'admin' && (
                                                    <button
                                                        onClick={() => handleToggleUser(u.id, u.is_active)}
                                                        className={`text-xs px-3 py-1 rounded-lg font-medium transition ${
                                                            u.is_active
                                                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                        }`}
                                                    >
                                                        {u.is_active ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Jobs Tab */}
                {activeTab === 'jobs' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="p-5 border-b border-gray-100">
                            <h2 className="font-bold text-gray-800">All Jobs</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left p-4 text-xs font-medium text-gray-500">Job</th>
                                        <th className="text-left p-4 text-xs font-medium text-gray-500">Company</th>
                                        <th className="text-left p-4 text-xs font-medium text-gray-500">Status</th>
                                        <th className="text-left p-4 text-xs font-medium text-gray-500">Posted</th>
                                        <th className="text-left p-4 text-xs font-medium text-gray-500">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {jobs.map(j => (
                                        <tr key={j.id} className="hover:bg-gray-50 transition">
                                            <td className="p-4">
                                                <p className="text-sm font-medium text-gray-800">{j.title}</p>
                                                <p className="text-xs text-gray-400">{j.experience_level} • {j.job_type?.replace('_', ' ')}</p>
                                            </td>
                                            <td className="p-4 text-sm text-gray-600">{j.company_name}</td>
                                            <td className="p-4">
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                    j.status === 'active'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {j.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-gray-500">
                                                {new Date(j.posted_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => handleDeleteJob(j.id)}
                                                    className="text-xs px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;