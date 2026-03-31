import axios from 'axios';

const API = axios.create({
    baseURL: `${process.env.REACT_APP_BASE_URL}/api`
});

// Har request mein token automatically add karo
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response error handle karo
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Job APIs
export const getAllJobs = (params) => API.get('/jobs', { params });
export const getJobById = (id) => API.get(`/jobs/${id}`);
export const createJob = (data) => API.post('/jobs/create', data);
export const getMyJobs = () => API.get('/jobs/provider/my-jobs');
export const updateJob = (id, data) => API.put(`/jobs/${id}`, data);
export const deleteJob = (id) => API.delete(`/jobs/${id}`);
export const getJobCandidates = (id) => API.get(`/jobs/${id}/candidates`);

// Profile APIs
export const getSeekerProfile = () => API.get('/profile/seeker');
export const updateSeekerProfile = (data) => API.put('/profile/seeker', data);
export const uploadCV = (data) => API.post('/profile/seeker/upload-cv', data);
export const getProviderProfile = () => API.get('/profile/provider');
export const updateProviderProfile = (data) => API.put('/profile/provider', data);

// Assessment APIs
export const getSkills = () => API.get('/assessment/skills');
export const startAssessment = (data) => API.post('/assessment/start', data);
export const submitAssessment = (id, data) => API.post(`/assessment/submit/${id}`, data);
export const getMyAssessments = () => API.get('/assessment/my');
export const getAssessmentResult = (id) => API.get(`/assessment/${id}`);

// Interview APIs
export const startInterview = (data) => API.post('/interview/start', data);
export const saveResponse = (id, data) => API.post(`/interview/save-response/${id}`, data);
export const completeInterview = (id, data = {}) => API.put(
    `/interview/complete/${id}`,
    data,
    data instanceof FormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : {}
);
export const saveBehaviorLog = (id, data) => API.post(`/interview/behavior/${id}`, data);
export const getMyInterviews = () => API.get('/interview/my');
export const viewInterview = (id) => API.get(`/interview/view/${id}`);

// Notification APIs
export const getNotifications = () => API.get('/notifications');
export const markAsRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllAsRead = () => API.put('/notifications/read-all');
export const deleteNotification = (id) => API.delete(`/notifications/${id}`);

export default API;