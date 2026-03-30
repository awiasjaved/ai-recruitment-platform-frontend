import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../../components/common/Navbar';
import { useAuth } from '../../context/AuthContext';
import { getMyJobs, deleteJob, getProviderProfile, updateProviderProfile } from '../../utils/api';

const ProviderDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('jobs');
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        company_name: '',
        industry: '',
        website: '',
        description: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [jobsRes, profileRes] = await Promise.all([
                getMyJobs(),
                getProviderProfile()
            ]);
            setJobs(jobsRes.data.jobs);
            setProfile(profileRes.data.profile);
            setFormData({
                name: user?.name || '',
                company_name: profileRes.data.profile?.company_name || '',
                industry: profileRes.data.profile?.industry || '',
                website: profileRes.data.profile?.website || '',
                description: profileRes.data.profile?.description || ''
            });
        } catch (error) {
            toast.error('Data load nahi hua');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm('Yeh job delete karna chahte ho?')) return;
        try {
            await deleteJob(jobId);
            toast.success('Job delete ho gayi!');
            setJobs(jobs.filter(j => j.id !== jobId));
        } catch (error) {
            toast.error('Job delete nahi hui');
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateProviderProfile(formData);
            toast.success('Profile update ho gayi!');
            setEditMode(false);
            loadData();
        } catch (error) {
            toast.error('Profile save nahi hui');
        } finally {
            setSaving(false);
        }
    };

    const activeJobs = jobs.filter(j => j.status === 'active');
    const closedJobs = jobs.filter(j => j.status === 'closed');
    const totalCandidates = jobs.reduce((a, b) => a + (b.total_applicants || 0), 0);

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
                <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 rounded-2xl p-6 text-white mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-3xl font-bold">
                                🏢
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">{profile?.company_name || 'Company Name'}</h1>
                                <p className="text-indigo-100">{profile?.industry || 'Add industry.'}</p>
                                <p className="text-indigo-200 text-sm">{user?.name}</p>
                            </div>
                        </div>
                        <Link
                            to="/provider/post-job"
                            className="bg-white text-indigo-700 px-5 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition"
                        >
                            + Post a job.
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                        <div className="text-3xl font-bold text-indigo-700">{jobs.length}</div>
                        <div className="text-gray-500 text-sm mt-1">Total Jobs</div>
                    </div>
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                        <div className="text-3xl font-bold text-green-600">{activeJobs.length}</div>
                        <div className="text-gray-500 text-sm mt-1">Active Jobs</div>
                    </div>
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                        <div className="text-3xl font-bold text-red-500">{closedJobs.length}</div>
                        <div className="text-gray-500 text-sm mt-1">Closed Jobs</div>
                    </div>
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                        <div className="text-3xl font-bold text-purple-600">{totalCandidates}</div>
                        <div className="text-gray-500 text-sm mt-1">Total Candidates</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {['jobs', 'profile'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-lg font-medium text-sm transition capitalize ${
                                activeTab === tab
                                    ? 'bg-indigo-700 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {tab === 'jobs' ? '💼 My Jobs' : '🏢 Company Profile'}
                        </button>
                    ))}
                </div>

                {/* Jobs Tab */}
                {activeTab === 'jobs' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-800">Posted Jobs</h2>
                            <Link
                                to="/provider/post-job"
                                className="bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-800 transition"
                            >
                                + New Job
                            </Link>
                        </div>

                        {jobs.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="text-5xl mb-3">💼</div>
                                <p className="text-gray-400 mb-3">No job has been posted yet.</p>
                                <Link
                                    to="/provider/post-job"
                                    className="bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-800 transition"
                                >
                                    Post Your First Job
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {jobs.map(job => (
                                    <div key={job.id} className="p-5 hover:bg-gray-50 transition">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-semibold text-gray-800">{job.title}</h3>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                        job.status === 'active'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {job.status === 'active' ? 'Active' : 'Closed'}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2 mt-2 flex-wrap">
                                                    <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-full">
                                                        {job.experience_level}
                                                    </span>
                                                    <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                                                        {job.job_type?.replace('_', ' ')}
                                                    </span>
                                                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                                        👥 {job.total_applicants || 0} candidates
                                                    </span>
                                                </div>
                                                <p className="text-gray-500 text-xs mt-2">
                                                    Skills: {job.required_skills}
                                                </p>
                                                <p className="text-gray-400 text-xs mt-1">
                                                    Posted: {new Date(job.posted_at).toLocaleDateString()}
                                                </p>
                                            </div>

                                            <div className="flex gap-2 ml-4">
                                                <Link
                                                    to={`/provider/candidates/${job.id}`}
                                                    className="bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg text-xs font-medium hover:bg-indigo-100 transition"
                                                >
                                                    👥 Candidates
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteJob(job.id)}
                                                    className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-xs font-medium hover:bg-red-100 transition"
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-800">Company Profile</h2>
                            <button
                                onClick={() => setEditMode(!editMode)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                    editMode
                                        ? 'bg-gray-100 text-gray-600'
                                        : 'bg-indigo-700 text-white hover:bg-indigo-800'
                                }`}
                            >
                                {editMode ? 'Cancel' : '✏️ Edit'}
                            </button>
                        </div>

                        {editMode ? (
                            <form onSubmit={handleSaveProfile} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Aapka Naam</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Naam</label>
                                    <input
                                        type="text"
                                        value={formData.company_name}
                                        onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="ABC Technologies"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                                    <input
                                        type="text"
                                        value={formData.industry}
                                        onChange={e => setFormData({ ...formData, industry: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Information Technology"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                    <input
                                        type="text"
                                        value={formData.website}
                                        onChange={e => setFormData({ ...formData, website: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="https://company.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                        placeholder="Company ke baare mein likho..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full bg-indigo-700 text-white py-3 rounded-lg font-semibold hover:bg-indigo-800 transition disabled:opacity-50"
                                >
                                    {saving ? 'Save ho raha hai...' : 'Profile Save Karo'}
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                {[
                                    { label: 'Company Naam', value: profile?.company_name },
                                    { label: 'Industry', value: profile?.industry },
                                    { label: 'Website', value: profile?.website },
                                    { label: 'Description', value: profile?.description }
                                ].map(item => (
                                    <div key={item.label} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                                        <div className="text-gray-500 text-sm w-32 shrink-0">{item.label}</div>
                                        <div className="text-gray-800 text-sm font-medium">
                                            {item.value || <span className="text-gray-400 italic">Add nahi kiya</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProviderDashboard;