import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../../components/common/Navbar';
import { useAuth } from '../../context/AuthContext';
import { getAllJobs, getMyAssessments, getMyInterviews, getSeekerProfile } from '../../utils/api';

const SeekerDashboard = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [assessments, setAssessments] = useState([]);
    const [interviews, setInterviews] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [jobsRes, assessRes, interviewRes, profileRes] = await Promise.all([
                getAllJobs(),
                getMyAssessments(),
                getMyInterviews(),
                getSeekerProfile()
            ]);
            setJobs(jobsRes.data.jobs);
            setAssessments(assessRes.data.assessments);
            setInterviews(interviewRes.data.interviews);
            setProfile(profileRes.data.profile);
        } catch (error) {
            toast.error('Data load nahi hua');
        } finally {
            setLoading(false);
        }
    };

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.required_skills.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const completedAssessments = assessments.filter(a => a.status === 'completed');
    const completedInterviews = interviews.filter(i => i.status === 'completed');

    const inferSkillDomain = (job) => {
        const text = `${job.title || ''} ${job.required_skills || ''}`.toLowerCase();

        if (text.includes('python')) return 'python';
        if (text.includes('data')) return 'data science';
        if (text.includes('design')) return 'graphic design';
        if (text.includes('mobile') || text.includes('android') || text.includes('ios')) return 'mobile development';
        return 'web development';
    };

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

                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl p-6 text-white mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Hello, {user?.name}! 👋</h1>
                            <p className="text-blue-100 mt-1">Find your dream job today</p>
                        </div>
                        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-3xl font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                    </div>

                    {/* Profile completion check */}
                    {!profile?.skills && (
                        <div className="mt-4 bg-yellow-400 bg-opacity-20 border border-yellow-300 rounded-lg p-3">
                            <p className="text-yellow-100 text-sm">
                                ⚠️ Your profile is incomplete!{' '}
                                <Link to="/seeker/profile" className="underline font-semibold">
                                    Complete it now.
                                </Link>
                            </p>
                        </div>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                        <div className="text-3xl font-bold text-blue-700">{jobs.length}</div>
                        <div className="text-gray-500 text-sm mt-1">Available Jobs</div>
                    </div>
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                        <div className="text-3xl font-bold text-green-600">{completedAssessments.length}</div>
                        <div className="text-gray-500 text-sm mt-1">Assessments Done</div>
                    </div>
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                        <div className="text-3xl font-bold text-purple-600">{completedInterviews.length}</div>
                        <div className="text-gray-500 text-sm mt-1">Interviews Done</div>
                    </div>
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                        <div className="text-3xl font-bold text-orange-500">
                            {completedAssessments.length > 0
                                ? Math.round(completedAssessments.reduce((a, b) => a + b.score, 0) / completedAssessments.length)
                                : 0}%
                        </div>
                        <div className="text-gray-500 text-sm mt-1">Avg Score</div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Link to="/seeker/profile" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition text-center">
                        <div className="text-3xl mb-2">👤</div>
                        <div className="font-semibold text-gray-700 text-sm">Profile Update</div>
                    </Link>
                    <Link to="/seeker/assessment" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-md transition text-center">
                        <div className="text-3xl mb-2">📝</div>
                        <div className="font-semibold text-gray-700 text-sm">Skill Test</div>
                    </Link>
                    {/* <Link to="/seeker/interview" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-purple-300 hover:shadow-md transition text-center">
                        <div className="text-3xl mb-2">🎥</div>
                        <div className="font-semibold text-gray-700 text-sm">Interview</div>
                    </Link> */}
                    <Link to="/seeker/profile" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-orange-300 hover:shadow-md transition text-center">
                        <div className="text-3xl mb-2">📄</div>
                        <div className="font-semibold text-gray-700 text-sm">CV Upload</div>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Jobs List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="p-5 border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-800">Available Jobs</h2>
                                {/* Search */}
                                <div className="mt-3 relative">
                                    <input
                                        type="text"
                                        placeholder="Search for a job or a skill…"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>

                            <div className="divide-y divide-gray-50">
                                {filteredJobs.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400">
                                        <div className="text-4xl mb-2">🔍</div>
                                        <p>No jobs found.</p>
                                    </div>
                                ) : (
                                    filteredJobs.slice(0, 6).map(job => (
                                        <div key={job.id} className="p-5 hover:bg-gray-50 transition">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-800">{job.title}</h3>
                                                    <p className="text-blue-600 text-sm mt-0.5">{job.company_name}</p>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                                                            {job.experience_level}
                                                        </span>
                                                        <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">
                                                            {job.job_type?.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-500 text-xs mt-2">
                                                        Skills: {job.required_skills}
                                                    </p>
                                                </div>
                                                <Link
                                                    to="/seeker/interview"
                                                    state={{
                                                        jobId: job.id,
                                                        jobTitle: job.title,
                                                        skillDomain: inferSkillDomain(job)
                                                    }}
                                                    className="ml-4 bg-blue-700 text-white text-xs px-3 py-2 rounded-lg hover:bg-blue-800 transition whitespace-nowrap"
                                                >
                                                    Apply
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">

                        {/* Recent Assessments */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-gray-800">Recent Tests</h2>
                                <Link to="/seeker/assessment" className="text-blue-600 text-xs hover:underline">
                                    Take a new test.
                                </Link>
                            </div>

                            {assessments.length === 0 ? (
                                <div className="text-center py-4">
                                    <div className="text-3xl mb-2">📝</div>
                                    <p className="text-gray-400 text-sm">No tests taken yet.</p>
                                    <Link to="/seeker/assessment" className="text-blue-600 text-sm hover:underline mt-1 block">
                                        Take your first test.
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {assessments.slice(0, 3).map(a => (
                                        <div key={a.id} className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 capitalize">{a.skill_domain}</p>
                                                <p className="text-xs text-gray-400">{new Date(a.taken_at).toLocaleDateString()}</p>
                                            </div>
                                            <div className={`text-sm font-bold px-3 py-1 rounded-full ${
                                                a.score >= 80 ? 'bg-green-100 text-green-700' :
                                                a.score >= 60 ? 'bg-blue-100 text-blue-700' :
                                                a.score >= 40 ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {a.score}%
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recent Interviews */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-gray-800">Interviews</h2>
                                {/* <Link to="/seeker/interview" className="text-blue-600 text-xs hover:underline">
                                    Give a new interview
                                </Link> */}
                            </div>

                            {interviews.length === 0 ? (
                                <div className="text-center py-4">
                                    <div className="text-3xl mb-2">🎥</div>
                                    <p className="text-gray-400 text-sm">You haven't taken any interviews yet.</p>
                                    <Link to="/seeker/interview" className="text-blue-600 text-sm hover:underline mt-1 block">
                                        Give your first interview.
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {interviews.slice(0, 3).map(i => (
                                        <div key={i.id} className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">
                                                    {i.job_title || 'General Interview'}
                                                </p>
                                                <p className="text-xs text-gray-400">{new Date(i.conducted_at).toLocaleDateString()}</p>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                i.status === 'completed'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {i.status === 'completed' ? 'Done' : 'Pending'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Profile Skills */}
                        {profile?.skills && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                                <h2 className="font-bold text-gray-800 mb-3">your Skills</h2>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.split(',').map((skill, i) => (
                                        <span key={i} className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full">
                                            {skill.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeekerDashboard;