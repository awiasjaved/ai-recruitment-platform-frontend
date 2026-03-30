import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../../components/common/Navbar';
import { createJob } from '../../utils/api';

const PostJob = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        required_skills: '',
        experience_level: 'entry',
        job_type: 'full_time'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.description || !formData.required_skills) {
            toast.error('Sab fields bharo');
            return;
        }
        setLoading(true);
        try {
            await createJob(formData);
            toast.success('Job post ho gayi!');
            navigate('/provider/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Job post nahi hui');
        } finally {
            setLoading(false);
        }
    };

    const skillSuggestions = ['Web Development', 'Python', 'React', 'Node.js', 'Data Science', 'Graphic Design', 'Mobile Development', 'Machine Learning'];

    const addSkill = (skill) => {
        const current = formData.required_skills;
        if (!current.includes(skill)) {
            setFormData({
                ...formData,
                required_skills: current ? `${current}, ${skill}` : skill
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 py-8">

                <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 rounded-2xl p-6 text-white mb-6">
                    <h1 className="text-2xl font-bold">Post a new job. 💼</h1>
                    <p className="text-indigo-100 mt-1">Fill in your job requirements and find candidates.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Senior React Developer"
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows={5}
                                placeholder="Write the job details, responsibilities, and requirements…"
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills *</label>
                            <input
                                type="text"
                                name="required_skills"
                                value={formData.required_skills}
                                onChange={handleChange}
                                required
                                placeholder="e.g. React, Node.js, MySQL"
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            />
                            <div className="flex flex-wrap gap-2 mt-2">
                                {skillSuggestions.map(skill => (
                                    <button
                                        key={skill}
                                        type="button"
                                        onClick={() => addSkill(skill)}
                                        className="text-xs px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100 transition"
                                    >
                                        + {skill}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                                <select
                                    name="experience_level"
                                    value={formData.experience_level}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                >
                                    <option value="entry">Entry Level</option>
                                    <option value="mid">Mid Level</option>
                                    <option value="senior">Senior Level</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                                <select
                                    name="job_type"
                                    value={formData.job_type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                >
                                    <option value="full_time">Full Time</option>
                                    <option value="part_time">Part Time</option>
                                    <option value="freelance">Freelance</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => navigate('/provider/dashboard')}
                                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-indigo-700 text-white py-3 rounded-lg font-semibold hover:bg-indigo-800 transition disabled:opacity-50"
                            >
                                {loading ? 'Post ho raha hai...' : 'post a job. 🚀'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PostJob;