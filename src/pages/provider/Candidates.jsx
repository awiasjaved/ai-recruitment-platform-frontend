import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../../components/common/Navbar';
import { getJobCandidates, getJobById, viewInterview } from '../../utils/api';

const Candidates = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [interviewData, setInterviewData] = useState(null);
    const [loadingInterview, setLoadingInterview] = useState(false);

    useEffect(() => {
        loadData();
    }, [jobId]);

    const loadData = async () => {
        try {
            const [jobRes, candidatesRes] = await Promise.all([
                getJobById(jobId),
                getJobCandidates(jobId)
            ]);
            setJob(jobRes.data.job);
            setCandidates(candidatesRes.data.candidates);
        } catch (error) {
            toast.error('Data load nahi hua');
        } finally {
            setLoading(false);
        }
    };

    const handleViewInterview = async (candidate) => {
        setSelectedCandidate(candidate);
        setLoadingInterview(true);
        try {
            const res = await viewInterview(candidate.id);
            setInterviewData(res.data);
        } catch (error) {
            toast.error('interview data can\'t be loaded');
        } finally {
            setLoadingInterview(false);
        }
    };

    const getScoreColor = (score) => {
        if (!score) return 'bg-gray-100 text-gray-600';
        if (score >= 80) return 'bg-green-100 text-green-700';
        if (score >= 60) return 'bg-blue-100 text-blue-700';
        if (score >= 40) return 'bg-yellow-100 text-yellow-700';
        return 'bg-red-100 text-red-700';
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

                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 rounded-2xl p-6 text-white mb-6">
                    <button onClick={() => navigate('/provider/dashboard')} className="text-indigo-200 hover:text-white mb-2 text-sm">
                        ← Back to Dashboard
                    </button>
                    <h1 className="text-2xl font-bold">{job?.title}</h1>
                    <p className="text-indigo-100 mt-1">
                        {candidates.length} candidate applied
                    </p>
                </div>

                {candidates.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                        <div className="text-5xl mb-3">👥</div>
                        <p className="text-gray-400">No candidates have applied for this job yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Candidates List */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                                <div className="p-4 border-b border-gray-100">
                                    <h2 className="font-bold text-gray-800">Candidates ({candidates.length})</h2>
                                </div>
                                <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                                    {candidates.map((candidate, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleViewInterview(candidate)}
                                            className={`w-full text-left p-4 hover:bg-gray-50 transition ${
                                                selectedCandidate?.id === candidate.id ? 'bg-indigo-50' : ''
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700">
                                                    {candidate.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-800 truncate">{candidate.name}</p>
                                                    <p className="text-gray-500 text-xs truncate">{candidate.email}</p>
                                                </div>
                                                {candidate.assessment_score && (
                                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getScoreColor(candidate.assessment_score)}`}>
                                                        {candidate.assessment_score}%
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Candidate Detail */}
                        <div className="lg:col-span-2">
                            {!selectedCandidate ? (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center h-full flex items-center justify-center">
                                    <div>
                                        <div className="text-5xl mb-3">👈</div>
                                        <p className="text-gray-400">Select a candidate to view details</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                                    {/* Candidate Header */}
                                    <div className="p-6 border-b border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-2xl font-bold text-indigo-700">
                                                {selectedCandidate.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-800">{selectedCandidate.name}</h2>
                                                <p className="text-gray-500">{selectedCandidate.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-5">
                                        {/* Basic Info */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <p className="text-gray-500 text-xs mb-1">Education</p>
                                                <p className="font-medium text-gray-800 text-sm">{selectedCandidate.education || 'N/A'}</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <p className="text-gray-500 text-xs mb-1">Experience</p>
                                                <p className="font-medium text-gray-800 text-sm">{selectedCandidate.experience || 'N/A'}</p>
                                            </div>
                                        </div>

                                        {/* Skills */}
                                        {selectedCandidate.skills && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 mb-2">Skills</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedCandidate.skills.split(',').map((skill, i) => (
                                                        <span key={i} className="bg-indigo-50 text-indigo-700 text-xs px-3 py-1 rounded-full">
                                                            {skill.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Assessment Score */}
                                        {selectedCandidate.assessment_score && (
                                            <div className={`p-4 rounded-xl border ${getScoreColor(selectedCandidate.assessment_score)} border-current border-opacity-30`}>
                                                <p className="text-xs font-medium mb-1">Assessment Score — {selectedCandidate.skill_domain}</p>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-2xl font-bold">{selectedCandidate.assessment_score}%</div>
                                                    <div className="flex-1 bg-white bg-opacity-60 rounded-full h-2">
                                                        <div
                                                            className="h-2 rounded-full bg-current opacity-70"
                                                            style={{ width: `${selectedCandidate.assessment_score}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* CV Link */}
                                        {selectedCandidate.cv_path && (
                                            <a
                                                href={`http://localhost:3334${selectedCandidate.cv_path}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-2 bg-green-50 text-green-700 p-4 rounded-xl hover:bg-green-100 transition"
                                            >
                                                <span className="text-xl">📄</span>
                                                <span className="font-medium text-sm">View CV / Download</span>
                                            </a>
                                        )}

                                        {/* Interview */}
                                        {loadingInterview ? (
                                            <div className="text-center py-4">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                                            </div>
                                        ) : interviewData?.interview?.video_path ? (
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 mb-2">Interview Recording</p>
                                                <video
                                                    controls
                                                    className="w-full rounded-xl"
                                                    src={`http://localhost:3334${interviewData.interview.video_path}`}
                                                />
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 rounded-xl p-4 text-center">
                                                <p className="text-gray-400 text-sm">No interview recording available.</p>
                                            </div>
                                        )}

                                        {/* Behavior Summary */}
                                        {interviewData?.behavior_summary?.length > 0 && (
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                                <p className="font-medium text-yellow-800 text-sm mb-2">⚠️ Behavior Report</p>
                                                {interviewData.behavior_summary.map((b, i) => (
                                                    <div key={i} className="flex justify-between text-sm text-yellow-700">
                                                        <span className="capitalize">{b.behavior_type.replace('_', ' ')}</span>
                                                        <span className="font-bold">{b.count} times</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Candidates;