import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../../components/common/Navbar';
import { getSkills, startAssessment, submitAssessment, getMyAssessments } from '../../utils/api';

const Assessment = () => {
    const [step, setStep] = useState('list'); // list, select, test, result
    const [skills, setSkills] = useState([]);
    const [myAssessments, setMyAssessments] = useState([]);
    const [selectedSkill, setSelectedSkill] = useState('');
    const [currentAssessment, setCurrentAssessment] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes

    useEffect(() => {
        loadData();
    }, []);

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

    const loadData = async () => {
        try {
            const [skillsRes, assessRes] = await Promise.all([
                getSkills(),
                getMyAssessments()
            ]);
            setSkills(skillsRes.data.skills);
            setMyAssessments(assessRes.data.assessments);
        } catch (error) {
            toast.error('Data load nahi hua');
        } finally {
            setLoading(false);
        }
    };

    const handleStartAssessment = async () => {
        if (!selectedSkill) {
            toast.error('Skill select karo pehle');
            return;
        }
        setLoading(true);
        try {
            const res = await startAssessment({ skill_domain: selectedSkill });
            setCurrentAssessment(res.data);
            setAnswers(new Array(res.data.questions.length).fill(''));
            setTimeLeft(1800);
            setStep('test');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Assessment shuru nahi hui');
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
        try {
            const res = await submitAssessment(currentAssessment.assessment_id, { answers });
            setResult(res.data.result);
            setStep('result');
            loadData();
        } catch (error) {
            toast.error('Submit nahi hua');
        } finally {
            setSubmitting(false);
        }
    }, [currentAssessment, answers]);

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
            <div className="max-w-4xl mx-auto px-4 py-8">

                {/* ===== STEP 1: LIST ===== */}
                {step === 'list' && (
                    <>
                        {/* Header */}
                        <div className="bg-gradient-to-r from-green-600 to-green-400 rounded-2xl p-6 text-white mb-6">
                            <h1 className="text-2xl font-bold">Skill Assessment 📝</h1>
                            <p className="text-green-100 mt-1">Apni skills test karo aur score hasil karo</p>
                        </div>

                        {/* Start New Test Button */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Naya Test Shuru Karo</h2>
                            <p className="text-gray-500 text-sm mb-4">
                                Har test mein 7 questions hote hain — MCQ aur Subjective dono.
                                30 minute ka time hota hai.
                            </p>
                            <button
                                onClick={() => setStep('select')}
                                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                            >
                                + Naya Test Shuru Karo
                            </button>
                        </div>

                        {/* Past Assessments */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Purane Tests</h2>

                            {myAssessments.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-5xl mb-3">📝</div>
                                    <p className="text-gray-400">Abhi koi test nahi diya</p>
                                    <button
                                        onClick={() => setStep('select')}
                                        className="mt-3 text-green-600 font-semibold hover:underline"
                                    >
                                        Pehla test do
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {myAssessments.map(a => (
                                        <div key={a.id} className={`p-4 rounded-xl border ${getScoreBg(a.score)}`}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-gray-800 capitalize">{a.skill_domain}</h3>
                                                    <p className="text-gray-500 text-sm">{new Date(a.taken_at).toLocaleDateString('ur-PK')}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-2xl font-bold ${getScoreColor(a.score)}`}>
                                                        {a.status === 'completed' ? `${a.score}%` : 'Pending'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {a.score >= 80 ? '🌟 Excellent' :
                                                         a.score >= 60 ? '👍 Good' :
                                                         a.score >= 40 ? '📚 Average' : '💪 Keep Going'}
                                                    </div>
                                                </div>
                                            </div>
                                            {a.status === 'completed' && (
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
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* ===== STEP 2: SELECT SKILL ===== */}
                {step === 'select' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <button
                            onClick={() => setStep('list')}
                            className="text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1"
                        >
                            ← Wapas jao
                        </button>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Skill Select Karo</h2>
                        <p className="text-gray-500 text-sm mb-6">Jis skill ka test dena hai woh select karo</p>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                            {skills.map(skill => (
                                <button
                                    key={skill}
                                    onClick={() => setSelectedSkill(skill)}
                                    className={`p-4 rounded-xl border-2 text-left transition capitalize ${
                                        selectedSkill === skill
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200 hover:border-green-300'
                                    }`}
                                >
                                    <div className="text-2xl mb-1">
                                        {skill === 'web development' ? '🌐' :
                                         skill === 'python' ? '🐍' :
                                         skill === 'data science' ? '📊' :
                                         skill === 'graphic design' ? '🎨' :
                                         skill === 'mobile development' ? '📱' : '💡'}
                                    </div>
                                    <div className="font-medium text-gray-700">{skill}</div>
                                </button>
                            ))}
                        </div>

                        {selectedSkill && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                                <h3 className="font-semibold text-green-800">Test ke baare mein:</h3>
                                <ul className="text-green-700 text-sm mt-2 space-y-1">
                                    <li>✅ 7 questions honge</li>
                                    <li>✅ MCQ aur Subjective dono</li>
                                    <li>✅ 30 minute ka time</li>
                                    <li>✅ Har baar naye questions</li>
                                </ul>
                            </div>
                        )}

                        <button
                            onClick={handleStartAssessment}
                            disabled={!selectedSkill || loading}
                            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                        >
                            {loading ? 'Shuru ho raha hai...' : 'Test Shuru Karo 🚀'}
                        </button>
                    </div>
                )}

                {/* ===== STEP 3: TEST ===== */}
                {step === 'test' && currentAssessment && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

                        {/* Timer + Progress */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500 text-sm">
                                    Question {currentQ + 1} / {currentAssessment.questions.length}
                                </span>
                            </div>
                            <div className={`font-bold text-lg px-4 py-1 rounded-full ${
                                timeLeft < 300 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                            }`}>
                                ⏱️ {formatTime(timeLeft)}
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
                            <div
                                className="bg-green-500 h-2 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        {/* Question */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                Q{currentQ + 1}. {currentAssessment.questions[currentQ].question}
                            </h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                                currentAssessment.questions[currentQ].type === 'mcq'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-purple-100 text-purple-700'
                            }`}>
                                {currentAssessment.questions[currentQ].type === 'mcq' ? 'MCQ' : 'Subjective'}
                                {' — '}
                                {currentAssessment.questions[currentQ].marks} marks
                            </span>
                        </div>

                        {/* MCQ Options */}
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
                                        <span className="font-medium mr-2">
                                            {['A', 'B', 'C', 'D'][i]}.
                                        </span>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Subjective Answer */}
                        {currentAssessment.questions[currentQ].type === 'subjective' && (
                            <div className="mb-6">
                                <textarea
                                    value={answers[currentQ] || ''}
                                    onChange={(e) => handleAnswer(e.target.value)}
                                    rows={5}
                                    placeholder="Apna jawab yahan likho..."
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                                />
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => setCurrentQ(q => q - 1)}
                                disabled={currentQ === 0}
                                className="px-5 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition disabled:opacity-40"
                            >
                                ← Pehla
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
                                    Agla →
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="px-5 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition disabled:opacity-50"
                                >
                                    {submitting ? 'Submit...' : 'Submit ✓'}
                                </button>
                            )}
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

                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Test Complete!</h2>
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

                        <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-8">
                            <div className="bg-gray-50 rounded-xl p-3">
                                <div className="font-bold text-gray-800">{result.obtained_marks}</div>
                                <div className="text-gray-500 text-xs">Marks Mile</div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3">
                                <div className="font-bold text-gray-800">{result.total_marks}</div>
                                <div className="text-gray-500 text-xs">Total Marks</div>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setStep('list');
                                setCurrentAssessment(null);
                                setAnswers([]);
                                setCurrentQ(0);
                                setResult(null);
                                setSelectedSkill('');
                            }}
                            className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                        >
                            Dobara Test Do
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Assessment;