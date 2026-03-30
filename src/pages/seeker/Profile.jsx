import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../../components/common/Navbar';
import { getSeekerProfile, updateSeekerProfile, uploadCV } from '../../utils/api';

const SeekerProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        skills: '',
        education: '',
        experience: '',
        bio: ''
    });
    const [cvFile, setCvFile] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const res = await getSeekerProfile();
            const data = res.data;
            setProfile(data.profile);
            setFormData({
                name: data.user?.name || '',
                skills: data.profile?.skills || '',
                education: data.profile?.education || '',
                experience: data.profile?.experience || '',
                bio: data.profile?.bio || ''
            });
        } catch (error) {
            toast.error('Profile load nahi hui');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateSeekerProfile(formData);
            toast.success('Profile update ho gayi!');
            loadProfile();
        } catch (error) {
            toast.error('Profile save nahi hui');
        } finally {
            setSaving(false);
        }
    };

    const handleCVUpload = async () => {
        if (!cvFile) {
            toast.error('Pehle CV select karo');
            return;
        }
        setUploading(true);
        try {
            const data = new FormData();
            data.append('cv', cvFile);
            await uploadCV(data);
            toast.success('CV upload ho gayi!');
            loadProfile();
            setCvFile(null);
        } catch (error) {
            toast.error('CV upload nahi hui');
        } finally {
            setUploading(false);
        }
    };

    const skillsList = formData.skills
        ? formData.skills.split(',').map(s => s.trim()).filter(s => s)
        : [];

    const removeSkill = (skillToRemove) => {
        const updated = skillsList.filter(s => s !== skillToRemove).join(', ');
        setFormData({ ...formData, skills: updated });
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

            <div className="max-w-4xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl p-6 text-white mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-4xl font-bold">
                            {formData.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{formData.name}</h1>
                            <p className="text-blue-100">{formData.experience || 'Add experience.'}</p>
                            <p className="text-blue-200 text-sm mt-1">
                                {skillsList.length > 0 ? `${skillsList.length} skills` : 'Add skills.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {['profile', 'cv', 'skills'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-lg font-medium text-sm transition capitalize ${
                                activeTab === tab
                                    ? 'bg-blue-700 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {tab === 'profile' ? '👤 Profile' :
                             tab === 'cv' ? '📄 CV Upload' : '🛠️ Skills'}
                        </button>
                    ))}
                </div>

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-6">Personal Information</h2>
                        <form onSubmit={handleSave} className="space-y-5">

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Naam
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    placeholder="Your full name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Education
                                </label>
                                <input
                                    type="text"
                                    name="education"
                                    value={formData.education}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    placeholder="e.g. B.Tech in Computer Science from ABC University"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Experience
                                </label>
                                <input
                                    type="text"
                                    name="experience"
                                    value={formData.experience}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    placeholder="e.g. 2 years as a Frontend Developer at XYZ Company"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bio 
                                </label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition disabled:opacity-50"
                            >
                                {saving ? 'Save ho raha hai...' : 'Save Profile'}
                            </button>
                        </form>
                    </div>
                )}

                {/* CV Tab */}
                {activeTab === 'cv' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-6">CV Upload</h2>

                        {/* Current CV */}
                        {profile?.cv_path && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                                <div className="text-3xl">📄</div>
                                <div className="flex-1">
                                    <p className="font-medium text-green-800">CV uploaded hai</p>
                                    <p className="text-green-600 text-sm">{profile.cv_path}</p>
                                </div>
                                <a
                                    href={`http://localhost:3334${profile.cv_path}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition"
                                >
                                    Dekho
                                </a>
                            </div>
                        )}

                        {/* Upload Area */}
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition"
                            onClick={() => document.getElementById('cv-input').click()}
                        >
                            <div className="text-5xl mb-3">📁</div>
                            <p className="text-gray-600 font-medium">
                                {cvFile ? cvFile.name : 'Click here to upload your CV.'}
                            </p>
                            <p className="text-gray-400 text-sm mt-1">PDF or Word file (max 5MB)</p>
                            <input
                                id="cv-input"
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => setCvFile(e.target.files[0])}
                                className="hidden"
                            />
                        </div>

                        {cvFile && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center gap-2">
                                <span className="text-blue-700 text-sm font-medium">Selected: {cvFile.name}</span>
                                <button onClick={() => setCvFile(null)} className="ml-auto text-red-500 text-sm">✕ Remove</button>
                            </div>
                        )}

                        <button
                            onClick={handleCVUpload}
                            disabled={uploading || !cvFile}
                            className="w-full mt-4 bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition disabled:opacity-50"
                        >
                            {uploading ? 'Uploading...' : 'Upload CV'}
                        </button>
                    </div>
                )}

                {/* Skills Tab */}
                {activeTab === 'skills' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-2">Skills</h2>
                        <p className="text-gray-500 text-sm mb-6">
                            “Separate skills with commas — e.g. ‘Web Development, Python, React.’”
                        </p>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Skills
                            </label>
                            <textarea
                                name="skills"
                                value={formData.skills}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                                placeholder="Web Development, Python, Data Science, Graphic Design..."
                            />
                        </div>

                        {/* Skills Preview */}
                        {skillsList.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">Skills Preview:</p>
                                <div className="flex flex-wrap gap-2">
                                    {skillsList.map((skill, i) => (
                                        <span
                                            key={i}
                                            className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                                        >
                                            {skill}
                                            <button
                                                onClick={() => removeSkill(skill)}
                                                className="text-blue-400 hover:text-red-500 ml-1"
                                            >
                                                ✕
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Suggested Skills */}
                        <div className="mt-6">
                            <p className="text-sm font-medium text-gray-700 mb-2">Popular Skills:</p>
                            <div className="flex flex-wrap gap-2">
                                {['Web Development', 'Python', 'Data Science', 'Graphic Design', 'Mobile Development', 'React', 'Node.js', 'Machine Learning'].map(skill => (
                                    <button
                                        key={skill}
                                        onClick={() => {
                                            if (!skillsList.includes(skill)) {
                                                const updated = formData.skills
                                                    ? `${formData.skills}, ${skill}`
                                                    : skill;
                                                setFormData({ ...formData, skills: updated });
                                            }
                                        }}
                                        className={`px-3 py-1 rounded-full text-sm border transition ${
                                            skillsList.includes(skill)
                                                ? 'bg-blue-700 text-white border-blue-700'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
                                        }`}
                                    >
                                        + {skill}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full mt-6 bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Skills'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SeekerProfile;