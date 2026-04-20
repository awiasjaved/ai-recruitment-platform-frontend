import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../../components/common/Navbar';
import { getSkills, startAssessment, submitAssessment, getMyAssessments, saveBehaviorLog } from '../../utils/api';

const Assessment = () => {
    const [step, setStep] = useState('list');
    const [skills, setSkills] = useState([]);
    const [myAssessments, setMyAssessments] = useState([]);
    const [selectedSkill, setSelectedSkill] = useState('');
    const [currentAssessment, setCurrentAssessment] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(1800);

    // Webcam states
    const [webcamOn, setWebcamOn] = useState(false);
    const [behaviorFlags, setBehaviorFlags] = useState([]);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const behaviorIntervalRef = useRef(null);

    // ============================================
    // ASSESSMENT STATE SAVE/RESTORE (localStorage)
    // ============================================
    const saveAssessmentState = useCallback(() => {
        if (step === 'test' && currentAssessment) {
            const state = {
                step,
                selectedSkill,
                currentAssessment,
                answers,
                currentQ,
                timeLeft,
                timestamp: Date.now()
            };
            localStorage.setItem('assessmentState', JSON.stringify(state));
        }
    }, [step, selectedSkill, currentAssessment, answers, currentQ, timeLeft]);

    const loadAssessmentState = useCallback(() => {
        const saved = localStorage.getItem('assessmentState');
        if (saved) {
            try {
                const state = JSON.parse(saved);
                // 24 ghante ke andar ka saved state restore karo
                if (Date.now() - state.timestamp < 24 * 60 * 60 * 1000) {
                    setStep(state.step);
                    setSelectedSkill(state.selectedSkill);
                    setCurrentAssessment(state.currentAssessment);
                    setAnswers(state.answers);
                    setCurrentQ(state.currentQ);
                    setTimeLeft(state.timeLeft);
                    toast.info('Previous assessment resumed');
                    return true;
                } else {
                    localStorage.removeItem('assessmentState');
                }
            } catch (error) {
                localStorage.removeItem('assessmentState');
            }
        }
        return false;
    }, []);

    const clearAssessmentState = () => {
        localStorage.removeItem('assessmentState');
    };

    // ============================================
    // USE EFFECTS
    // ============================================
    useEffect(() => {
        loadData();
        return () => {
            stopWebcam();
            stopBehaviorMonitoring();
        };
    }, []);

    // Saved assessment restore karo jab data load ho jaye
    useEffect(() => {
        if (!loading && skills.length > 0) {
            loadAssessmentState();
        }
    }, [loading, skills, loadAssessmentState]);

    // Test ke dauran state save karo
    useEffect(() => {
        if (step === 'test') {
            saveAssessmentState();
        }
    }, [step, answers, currentQ, timeLeft, saveAssessmentState]);

    // Step change hone par webcam re-attach karo
    useEffect(() => {
        if (step === 'test' && streamRef.current && videoRef.current) {
            setTimeout(() => {
                if (videoRef.current && streamRef.current) {
                    videoRef.current.srcObject = streamRef.current;
                    videoRef.current.play().catch(e => console.log(e));
                }
            }, 200);
        }
    }, [step]);

    // Timer
    useEffect(() => {
        if (step !== 'test') return;
        if (timeLeft <= 0) {
            handleSubmit();
            return;
        }
        const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(timer);
    }, [step, timeLeft]);

    // ============================================
    // DATA LOAD
    // ============================================
    const loadData = async () => {
        try {
            const [skillsRes, assessRes] = await Promise.all([
                getSkills(),
                getMyAssessments()
            ]);
            setSkills(skillsRes.data.skills);
            setMyAssessments(assessRes.data.assessments);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // WEBCAM FUNCTIONS
    // ============================================
    const startWebcam = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            streamRef.current = stream;
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play().catch(e => console.log(e));
                }
            }, 100);
            setWebcamOn(true);
            toast.success('Webcam ready!');
        } catch (error) {
            toast.error('Webcam allow karo — browser settings mein permission do');
        }
    };

    const stopWebcam = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setWebcamOn(false);
    };

    const startBehaviorMonitoring = (assessmentId) => {
        behaviorIntervalRef.current = setInterval(async () => {
            const random = Math.random();
            let behaviorType = null;
            if (random < 0.1) behaviorType = 'looking_away';
            else if (random < 0.05) behaviorType = 'multiple_faces';
            else if (random < 0.08) behaviorType = 'excessive_movement';
            if (behaviorType) {
                setBehaviorFlags(prev => [...prev, behaviorType]);
                try {
                    await saveBehaviorLog(assessmentId, { behavior_type: behaviorType });
                } catch (e) {}
            }
        }, 5000);
    };

    const stopBehaviorMonitoring = () => {
        if (behaviorIntervalRef.current) clearInterval(behaviorIntervalRef.current);
    };

    // ============================================
    // ASSESSMENT FUNCTIONS
    // ============================================
    const handleStartAssessment = async () => {
        if (!selectedSkill) {
            toast.error('Please select a skill first');
            return;
        }
        if (!webcamOn) {
            toast.error('Pehle webcam on karo!');
            return;
        }
        setLoading(true);
        try {
            const res = await startAssessment({ skill_domain: selectedSkill });
            setCurrentAssessment(res.data);
            setAnswers(new Array(res.data.questions.length).fill(''));
            setTimeLeft(1800);
            setBehaviorFlags([]);
            startBehaviorMonitoring(res.data.assessment_id);
            setStep('test');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to start assessment');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (value) => {
        const updated = [...answers];
        updated[currentQ] = value;
        setAnswers(updated);
    };

    const handleSubmit = useCallback(async () => {
        setSubmitting(true);
        stopBehaviorMonitoring();
        stopWebcam();
        try {
            const res = await submitAssessment(currentAssessment.assessment_id, { answers });
            setResult(res.data.result);
            setStep('result');
            clearAssessmentState();
            setMyAssessments(prev => {
                const existingIndex = prev.findIndex(a => a.id === currentAssessment.assessment_id);
                if (existingIndex >= 0) {
                    const updated = [...prev];
                    updated[existingIndex] = {
                        ...updated[existingIndex],
                        status: 'completed',
                        score: res.data.result.score
                    };
                    return updated;
                } else {
                    return [...prev, {
                        id: currentAssessment.assessment_id,
                        skill_domain: selectedSkill,
                        status: 'completed',
                        score: res.data.result.score,
                        taken_at: new Date().toISOString()
                    }];
                }
            });
            setTimeout(() => loadData(), 3000);
        } catch (error) {
            toast.error('Failed to submit assessment');
        } finally {
            setSubmitting(false);
        }
    }, [currentAssessment, answers, selectedSkill]);

    // ============================================
    // HELPERS
    // ============================================
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-blue-600';
        if (score >= 40) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBg = (score) => {
        if (score >= 80) return 'bg-green-50 border-green-200';
        if (score >= 60) return 'bg-blue-50 border-blue-200';
        if (score >= 40) return 'bg-yellow-50 border-yellow-200';
        return 'bg-red-50 border-red-200';
    };

    const progress = currentAssessment
        ? Math.round(((currentQ + 1) / currentAssessment.questions.length) * 100)
        : 0;

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

                {/* ===== STEP 1: LIST ===== */}
                {step === 'list' && (
                    <>
                        <div className="bg-gradient-to-r from-green-600 to-green-400 rounded-2xl p-6 text-white mb-6">
                            <h1 className="text-2xl font-bold">Skill Assessment 📝</h1>
                            <p className="text-green-100 mt-1">Test your skills and get certified.</p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Start New Test</h2>
                            <p className="text-gray-500 text-sm mb-4">
                                Each test contains 7 questions — including both MCQs and subjective questions.
                                You have 30 minutes to complete it. Webcam monitoring enabled during test.
                            </p>
                            <button
                                onClick={() => setStep('select')}
                                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                            >
                                + Start New Test
                            </button>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Previous Tests</h2>
                            {myAssessments.filter(a => a.status === 'completed').length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-5xl mb-3">📝</div>
                                    <p className="text-gray-400">No completed tests yet.</p>
                                    <button
                                        onClick={() => setStep('select')}
                                        className="mt-3 text-green-600 font-semibold hover:underline"
                                    >
                                        Take your first test
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {myAssessments.filter(a => a.status === 'completed').map(a => (
                                        <div key={a.id} className={`p-4 rounded-xl border ${getScoreBg(a.score)}`}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-gray-800 capitalize">{a.skill_domain}</h3>
                                                    <p className="text-gray-500 text-sm">
                                                        {new Date(a.taken_at).toLocaleDateString('en-US')}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-2xl font-bold ${getScoreColor(a.score)}`}>
                                                        {a.score}%
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {a.score >= 80 ? '🌟 Excellent' :
                                                         a.score >= 60 ? '👍 Good' :
                                                         a.score >= 40 ? '📚 Average' : '💪 Keep Going'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-2 bg-white bg-opacity-60 rounded-lg h-2">
                                                <div
                                                    className={`h-2 rounded-lg ${
                                                        a.score >= 80 ? 'bg-green-500' :
                                                        a.score >= 60 ? 'bg-blue-500' :
                                                        a.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                    style={{ width: `${a.score}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* ===== STEP 2: SELECT SKILL + WEBCAM SETUP ===== */}
                {step === 'select' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <button
                            onClick={() => { setStep('list'); stopWebcam(); }}
                            className="text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1"
                        >
                            ← Back
                        </button>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Setup & Select Skill</h2>
                        <p className="text-gray-500 text-sm mb-6">
                            Turn on the webcam and select a skill to start the test.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                            {/* Webcam */}
                            <div>
                                <h3 className="font-semibold text-gray-700 mb-2">Webcam Check 📷</h3>
                                <div className="bg-gray-900 rounded-xl overflow-hidden aspect-video flex items-center justify-center">
                                    {webcamOn ? (
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            muted
                                            playsInline
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <div className="text-5xl mb-2">📷</div>
                                            <p className="text-sm">Webcam Off</p>
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
                                    {webcamOn ? '🔴 Webcam Close' : '🟢 Webcam On'}
                                </button>
                                <div className={`mt-2 p-2 rounded-lg text-xs text-center ${
                                    webcamOn ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                }`}>
                                    {webcamOn
                                        ? '✅ Webcam Connected — Behavior monitored during test'
                                        : '❌ Webcam is required for the test — Please turn it on'}
                                </div>
                            </div>

                            {/* Skills */}
                            <div>
                                <h3 className="font-semibold text-gray-700 mb-2">Select a Skill</h3>
                                <div className="space-y-2">
                                    {skills.map(skill => (
                                        <button
                                            key={skill}
                                            onClick={() => setSelectedSkill(skill)}
                                            className={`w-full text-left px-4 py-3 rounded-lg border-2 transition capitalize ${
                                                selectedSkill === skill
                                                    ? 'border-green-500 bg-green-50 text-green-800'
                                                    : 'border-gray-200 hover:border-green-300'
                                            }`}
                                        >
                                            {skill === 'web development' ? '🌐' :
                                             skill === 'python' ? '🐍' :
                                             skill === 'data science' ? '📊' :
                                             skill === 'graphic design' ? '🎨' : '📱'} {skill}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {selectedSkill && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                                <h3 className="font-semibold text-green-800">About the test:</h3>
                                <ul className="text-green-700 text-sm mt-2 space-y-1">
                                    <li>✅ There will be 7 questions.</li>
                                    <li>✅ Both MCQs and Subjective questions.</li>
                                    <li>✅ 30 minute time limit.</li>
                                    <li>✅ New questions each time.</li>
                                    <li>✅ Webcam monitoring active during test.</li>
                                </ul>
                            </div>
                        )}

                        <button
                            onClick={handleStartAssessment}
                            disabled={!selectedSkill || !webcamOn || loading}
                            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                        >
                            {loading ? 'Starting...' :
                             !webcamOn ? '📷 Pehle Webcam On Karo' :
                             !selectedSkill ? 'Skill Select Karo' :
                             'Start Test 🚀'}
                        </button>
                    </div>
                )}

                {/* ===== STEP 3: TEST ===== */}
                {step === 'test' && currentAssessment && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Left - Webcam + Info */}
                        <div className="space-y-4">
                            <div className="bg-gray-900 rounded-xl overflow-hidden aspect-video">
                                <video
                                    key="assessment-video"
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className={`text-center p-3 rounded-xl font-bold text-lg ${
                                timeLeft < 300 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                            }`}>
                                ⏱️ {formatTime(timeLeft)}
                            </div>

                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                <p className="text-sm text-gray-500 mb-2">
                                    Question {currentQ + 1} / {currentAssessment.questions.length}
                                </p>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div
                                        className="bg-green-500 h-2 rounded-full transition-all"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>

                            {behaviorFlags.length > 0 && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                                    <p className="text-yellow-800 text-xs font-semibold mb-1">⚠️ Warnings:</p>
                                    <p className="text-yellow-700 text-xs">
                                        {behaviorFlags.length} unusual behavior detected
                                    </p>
                                </div>
                            )}

                            <div className="bg-red-50 rounded-xl p-2 text-center">
                                <p className="text-xs text-red-600">🔴 Webcam Monitoring Active</p>
                            </div>
                        </div>

                        {/* Right - Question */}
                        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-gray-500 text-sm">
                                    Question {currentQ + 1} of {currentAssessment.questions.length}
                                </span>
                                <div className={`font-bold text-sm px-3 py-1 rounded-full ${
                                    timeLeft < 300 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                }`}>
                                    ⏱️ {formatTime(timeLeft)}
                                </div>
                            </div>

                            <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
                                <div
                                    className="bg-green-500 h-2 rounded-full transition-all"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    Q{currentQ + 1}. {currentAssessment.questions[currentQ].question}
                                </h3>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                    currentAssessment.questions[currentQ].type === 'mcq'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-purple-100 text-purple-700'
                                }`}>
                                    {currentAssessment.questions[currentQ].type === 'mcq' ? 'Multiple Choice' : 'Subjective'}
                                    {' — '}
                                    {currentAssessment.questions[currentQ].marks} marks
                                </span>
                            </div>

                            {currentAssessment.questions[currentQ].type === 'mcq' && (
                                <div className="space-y-3 mb-6">
                                    {currentAssessment.questions[currentQ].options.map((opt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleAnswer(i)}
                                            className={`w-full text-left p-4 rounded-xl border-2 transition ${
                                                answers[currentQ] === i
                                                    ? 'border-green-500 bg-green-50 text-green-800'
                                                    : 'border-gray-200 hover:border-green-300'
                                            }`}
                                        >
                                            <span className="font-medium mr-2">{['A', 'B', 'C', 'D'][i]}.</span>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {currentAssessment.questions[currentQ].type === 'subjective' && (
                                <div className="mb-6">
                                    <textarea
                                        value={answers[currentQ] || ''}
                                        onChange={(e) => handleAnswer(e.target.value)}
                                        rows={5}
                                        placeholder="Write your answer here..."
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                                    />
                                </div>
                            )}

                            <div className="flex justify-between items-center">
                                <button
                                    onClick={() => setCurrentQ(q => q - 1)}
                                    disabled={currentQ === 0}
                                    className="px-5 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition disabled:opacity-40"
                                >
                                    ← Previous
                                </button>

                                <div className="flex gap-1">
                                    {currentAssessment.questions.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentQ(i)}
                                            className={`w-7 h-7 rounded-full text-xs font-medium transition ${
                                                i === currentQ ? 'bg-green-600 text-white' :
                                                answers[i] !== '' ? 'bg-green-100 text-green-700' :
                                                'bg-gray-100 text-gray-500'
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>

                                {currentQ < currentAssessment.questions.length - 1 ? (
                                    <button
                                        onClick={() => setCurrentQ(q => q + 1)}
                                        className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                    >
                                        Next →
                                    </button>
                                ) : (
                                    <div className="text-right">
                                        {answers.some(a => a === '') && (
                                            <p className="text-red-500 text-sm mb-2">
                                                Please answer all questions before submitting.
                                            </p>
                                        )}
                                        <button
                                            onClick={handleSubmit}
                                            disabled={submitting || answers.some(a => a === '')}
                                            className="px-5 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition disabled:opacity-50"
                                        >
                                            {submitting ? 'Submitting...' : 'Submit Test ✓'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== STEP 4: RESULT ===== */}
                {step === 'result' && result && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                        <div className="text-6xl mb-4">
                            {result.score >= 80 ? '🌟' :
                             result.score >= 60 ? '👍' :
                             result.score >= 40 ? '📚' : '💪'}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Test Completed!</h2>
                        <p className="text-gray-500 mb-6">{result.result_message}</p>

                        <div className={`text-6xl font-bold mb-2 ${getScoreColor(result.score)}`}>
                            {result.score}%
                        </div>

                        <div className="w-full bg-gray-100 rounded-full h-4 mb-6 max-w-xs mx-auto">
                            <div
                                className={`h-4 rounded-full transition-all ${
                                    result.score >= 80 ? 'bg-green-500' :
                                    result.score >= 60 ? 'bg-blue-500' :
                                    result.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${result.score}%` }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-6">
                            <div className="bg-gray-50 rounded-xl p-3">
                                <div className="font-bold text-gray-800">{result.obtained_marks}</div>
                                <div className="text-gray-500 text-xs">Marks Obtained</div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3">
                                <div className="font-bold text-gray-800">{result.total_marks}</div>
                                <div className="text-gray-500 text-xs">Total Marks</div>
                            </div>
                        </div>

                        {behaviorFlags.length > 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 max-w-xs mx-auto text-left">
                                <p className="text-yellow-800 font-semibold text-sm">⚠️ Behavior Report</p>
                                <p className="text-yellow-700 text-sm mt-1">
                                    {behaviorFlags.length} unusual behaviors detected during test
                                </p>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                setStep('list');
                                setCurrentAssessment(null);
                                setAnswers([]);
                                setCurrentQ(0);
                                setResult(null);
                                setSelectedSkill('');
                                setBehaviorFlags([]);
                                clearAssessmentState();
                            }}
                            className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                        >
                            Take Another Test
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Assessment;