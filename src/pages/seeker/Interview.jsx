import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../../components/common/Navbar';
import {
    startInterview,
    saveResponse,
    completeInterview,
    saveBehaviorLog,
    getMyInterviews
} from '../../utils/api';

const Interview = () => {
    const [step, setStep] = useState('list'); // list, setup, interview, complete
    const [myInterviews, setMyInterviews] = useState([]);
    const [currentInterview, setCurrentInterview] = useState(null);
    const [currentQ, setCurrentQ] = useState(0);
    const [answer, setAnswer] = useState('');
    const [savedAnswers, setSavedAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [webcamOn, setWebcamOn] = useState(false);
    const [behaviorFlags, setBehaviorFlags] = useState([]);
    const [skillDomain, setSkillDomain] = useState('');
    const [timeLeft, setTimeLeft] = useState(120); // 2 min per question

    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const behaviorIntervalRef = useRef(null);

    useEffect(() => {
        loadInterviews();
        return () => stopWebcam();
    }, []);

    // Timer per question
    useEffect(() => {
        if (step !== 'interview') return;
        setTimeLeft(120);
        const timer = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    clearInterval(timer);
                    handleNextQuestion();
                    return 120;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [currentQ, step]);

    const loadInterviews = async () => {
        try {
            const res = await getMyInterviews();
            setMyInterviews(res.data.interviews);
        } catch (error) {
            toast.error('Interviews load nahi huyi');
        } finally {
            setLoading(false);
        }
    };

    // Webcam start
    const startWebcam = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setWebcamOn(true);
            toast.success('Webcam ready hai!');
        } catch (error) {
            toast.error('Webcam allow karo — settings mein jao aur permission do');
        }
    };

    // Webcam stop
    const stopWebcam = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setWebcamOn(false);
    };

    // Behavior monitoring (simulated)
    const startBehaviorMonitoring = (interviewId) => {
        behaviorIntervalRef.current = setInterval(async () => {
            // Random behavior simulation for demo
            const random = Math.random();
            let behaviorType = null;

            if (random < 0.1) behaviorType = 'looking_away';
            else if (random < 0.05) behaviorType = 'multiple_faces';
            else if (random < 0.08) behaviorType = 'excessive_movement';

            if (behaviorType) {
                setBehaviorFlags(prev => [...prev, behaviorType]);
                try {
                    await saveBehaviorLog(interviewId, { behavior_type: behaviorType });
                } catch (e) {}
            }
        }, 5000);
    };

    const stopBehaviorMonitoring = () => {
        if (behaviorIntervalRef.current) {
            clearInterval(behaviorIntervalRef.current);
        }
    };

    // Start Interview
    const handleStartInterview = async () => {
        if (!webcamOn) {
            toast.error('Pehle webcam on karo');
            return;
        }
        setLoading(true);
        try {
            const res = await startInterview({ skill_domain: skillDomain });
            setCurrentInterview(res.data);
            setCurrentQ(0);
            setAnswer('');
            setSavedAnswers([]);
            startBehaviorMonitoring(res.data.interview_id);
            setStep('interview');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Interview shuru nahi hui');
        } finally {
            setLoading(false);
        }
    };

    // Save answer and go to next
    const handleNextQuestion = useCallback(async () => {
        if (!answer.trim() && currentQ < currentInterview.questions.length) {
            toast.warning('Jawab likho pehle!');
            return;
        }

        setSaving(true);
        try {
            await saveResponse(currentInterview.interview_id, {
                question_index: currentQ,
                answer: answer
            });

            setSavedAnswers(prev => [...prev, {
                question: currentInterview.questions[currentQ],
                answer
            }]);

            if (currentQ < currentInterview.questions.length - 1) {
                setCurrentQ(q => q + 1);
                setAnswer('');
            } else {
                // Last question — complete interview
                await handleComplete();
            }
        } catch (error) {
            toast.error('Jawab save nahi hua');
        } finally {
            setSaving(false);
        }
    }, [answer, currentQ, currentInterview]);

    // Complete interview
    const handleComplete = async () => {
        stopBehaviorMonitoring();
        stopWebcam();
        try {
            await completeInterview(currentInterview.interview_id);
            setStep('complete');
            loadInterviews();
            toast.success('Interview complete ho gayi!');
        } catch (error) {
            toast.error('Interview complete nahi hui');
        }
    };

    const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    const skills = ['web development', 'python', 'data science', 'graphic design', 'mobile development'];

    if (loading && step === 'list') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-5xl mx-auto px-4 py-8">

                {/* ===== LIST ===== */}
                {step === 'list' && (
                    <>
                        <div className="bg-gradient-to-r from-purple-700 to-purple-500 rounded-2xl p-6 text-white mb-6">
                            <h1 className="text-2xl font-bold">AI Interview 🎥</h1>
                            <p className="text-purple-100 mt-1">Webcam interview do aur apni skills sabit karo</p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-3">Nai Interview Shuru Karo</h2>
                            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
                                <h3 className="font-semibold text-purple-800 mb-2">Tayari karo:</h3>
                                <ul className="text-purple-700 text-sm space-y-1">
                                    <li>✅ Shant jagah par baitho</li>
                                    <li>✅ Webcam aur microphone ready rakho</li>
                                    <li>✅ Saaf light mein baitho</li>
                                    <li>✅ Har sawaal ka jawab 2 minute mein do</li>
                                    <li>✅ Seedha camera ki taraf dekho</li>
                                </ul>
                            </div>
                            <button
                                onClick={() => setStep('setup')}
                                className="bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-800 transition"
                            >
                                + Nai Interview Shuru Karo
                            </button>
                        </div>

                        {/* Past Interviews */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Purani Interviews</h2>
                            {myInterviews.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-5xl mb-3">🎥</div>
                                    <p className="text-gray-400">Abhi koi interview nahi di</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {myInterviews.map(i => (
                                        <div key={i.id} className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold text-gray-800">
                                                    {i.job_title || 'General Interview'}
                                                </h3>
                                                <p className="text-gray-500 text-sm">
                                                    {i.company_name || 'AI Recruitment Platform'}
                                                </p>
                                                <p className="text-gray-400 text-xs mt-1">
                                                    {new Date(i.conducted_at).toLocaleDateString('ur-PK')}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                i.status === 'completed'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {i.status === 'completed' ? '✅ Complete' : '⏳ Pending'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* ===== SETUP ===== */}
                {step === 'setup' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <button onClick={() => { setStep('list'); stopWebcam(); }} className="text-gray-500 hover:text-gray-700 mb-4">
                            ← Wapas jao
                        </button>
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Interview Setup</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Webcam Preview */}
                            <div>
                                <h3 className="font-semibold text-gray-700 mb-2">Webcam Check</h3>
                                <div className="bg-gray-900 rounded-xl overflow-hidden aspect-video flex items-center justify-center">
                                    {webcamOn ? (
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            muted
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <div className="text-5xl mb-2">📷</div>
                                            <p className="text-sm">Webcam off hai</p>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={webcamOn ? stopWebcam : startWebcam}
                                    className={`w-full mt-3 py-2 rounded-lg font-medium transition ${
                                        webcamOn
                                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                                    }`}
                                >
                                    {webcamOn ? '🔴 Webcam Band Karo' : '🟢 Webcam On Karo'}
                                </button>
                            </div>

                            {/* Settings */}
                            <div>
                                <h3 className="font-semibold text-gray-700 mb-2">Interview Field</h3>
                                <div className="space-y-2 mb-4">
                                    {skills.map(skill => (
                                        <button
                                            key={skill}
                                            onClick={() => setSkillDomain(skill)}
                                            className={`w-full text-left px-4 py-3 rounded-lg border-2 transition capitalize ${
                                                skillDomain === skill
                                                    ? 'border-purple-500 bg-purple-50 text-purple-800'
                                                    : 'border-gray-200 hover:border-purple-300'
                                            }`}
                                        >
                                            {skill === 'web development' ? '🌐' :
                                             skill === 'python' ? '🐍' :
                                             skill === 'data science' ? '📊' :
                                             skill === 'graphic design' ? '🎨' : '📱'} {skill}
                                        </button>
                                    ))}
                                </div>

                                <div className={`p-3 rounded-lg text-sm mb-4 ${
                                    webcamOn ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                }`}>
                                    {webcamOn ? '✅ Webcam ready hai' : '❌ Webcam on karo pehle'}
                                </div>

                                <button
                                    onClick={handleStartInterview}
                                    disabled={!webcamOn || loading}
                                    className="w-full bg-purple-700 text-white py-3 rounded-lg font-semibold hover:bg-purple-800 transition disabled:opacity-50"
                                >
                                    {loading ? 'Shuru ho raha hai...' : '🎬 Interview Shuru Karo'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== INTERVIEW ===== */}
                {step === 'interview' && currentInterview && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Webcam + Info */}
                        <div className="space-y-4">
                            <div className="bg-gray-900 rounded-xl overflow-hidden aspect-video">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Timer */}
                            <div className={`text-center p-3 rounded-xl font-bold text-lg ${
                                timeLeft < 30 ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-700'
                            }`}>
                                ⏱️ {formatTime(timeLeft)}
                            </div>

                            {/* Progress */}
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                <p className="text-sm text-gray-500 mb-2">
                                    Question {currentQ + 1} / {currentInterview.questions.length}
                                </p>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div
                                        className="bg-purple-600 h-2 rounded-full transition-all"
                                        style={{ width: `${((currentQ + 1) / currentInterview.questions.length) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Behavior Flags */}
                            {behaviorFlags.length > 0 && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                                    <p className="text-yellow-800 text-xs font-semibold mb-1">⚠️ Warnings:</p>
                                    <p className="text-yellow-700 text-xs">{behaviorFlags.length} unusual behavior detected</p>
                                </div>
                            )}
                        </div>

                        {/* Question + Answer */}
                        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="mb-4">
                                <span className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-medium">
                                    AI Interviewer
                                </span>
                            </div>

                            <div className="bg-purple-50 rounded-xl p-5 mb-6">
                                <p className="text-gray-800 text-lg font-medium leading-relaxed">
                                    🎤 {currentInterview.questions[currentQ]}
                                </p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tumhara Jawab:
                                </label>
                                <textarea
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    rows={6}
                                    placeholder="Apna jawab yahan type karo..."
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                />
                                <p className="text-gray-400 text-xs mt-1 text-right">
                                    {answer.length} characters
                                </p>
                            </div>

                            <div className="flex justify-between items-center">
                                <p className="text-gray-400 text-sm">
                                    Saaf awaaz mein aur seedha camera dekho
                                </p>
                                <button
                                    onClick={handleNextQuestion}
                                    disabled={saving || !answer.trim()}
                                    className="bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-800 transition disabled:opacity-50"
                                >
                                    {saving ? 'Save...' :
                                     currentQ < currentInterview.questions.length - 1
                                        ? 'Agla Sawaal →'
                                        : 'Interview Complete ✓'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== COMPLETE ===== */}
                {step === 'complete' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Interview Complete!</h2>
                        <p className="text-gray-500 mb-2">
                            Bohat acha kiya! Tumhari interview record ho gayi.
                        </p>
                        <p className="text-gray-400 text-sm mb-8">
                            HR jald hi review karega aur tumhe notify karega.
                        </p>

                        {behaviorFlags.length > 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-left max-w-sm mx-auto">
                                <p className="text-yellow-800 font-semibold text-sm">⚠️ Behavior Report</p>
                                <p className="text-yellow-700 text-sm mt-1">
                                    {behaviorFlags.length} unusual behaviors detected during interview
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => {
                                    setStep('list');
                                    setBehaviorFlags([]);
                                    setCurrentInterview(null);
                                }}
                                className="bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-800 transition"
                            >
                                Dashboard pe Jao
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Interview;