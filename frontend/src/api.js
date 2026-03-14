import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors – show clear message when backend is unreachable
function handleError(err) {
  if (err.response?.data?.message) {
    throw new Error(err.response.data.message);
  }
  if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
    throw new Error('Cannot connect to server. Start the backend: cd backend && npm run dev');
  }
  throw new Error(err.message || 'Request failed');
}

// Auth APIs
export const requestOTP = async (data) => {
  try {
    const res = await api.post('/auth/request-otp', data);
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const verifyOTP = async (data) => {
  try {
    const res = await api.post('/auth/verify-otp', data);
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

// Semester APIs
export const fetchSemesters = async () => {
  try {
    const res = await api.get('/semesters');
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const fetchSemester = async (id) => {
  try {
    const res = await api.get(`/semesters/${id}`);
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

// Subject APIs
export const fetchSubjects = async (semesterId) => {
  try {
    const res = await api.get(`/subjects/semester/${semesterId}`);
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const fetchSubject = async (id) => {
  try {
    const res = await api.get(`/subjects/${id}`);
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

// Module APIs
export const fetchModules = async (subjectId) => {
  try {
    const res = await api.get(`/modules/subject/${subjectId}`);
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const fetchModule = async (id) => {
  try {
    const res = await api.get(`/modules/${id}`);
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

// Material APIs
export const fetchMaterials = async (moduleId) => {
  try {
    const res = await api.get(`/materials/module/${moduleId}`);
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const downloadMaterial = async (id) => {
  try {
    const res = await api.get(`/materials/${id}/download`, {
      responseType: 'blob',
    });
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

// Question Paper APIs
export const fetchQuestionPapers = async (subjectId) => {
  try {
    const res = await api.get(`/question-papers/subject/${subjectId}`);
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const downloadQuestionPaper = async (id) => {
  try {
    const res = await api.get(`/question-papers/${id}/download`, {
      responseType: 'blob',
    });
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

// AI APIs
export const fetchAIContent = async (moduleId, topic) => {
  try {
    const res = await api.get(`/ai/content/${moduleId}`, {
      params: { topic },
    });
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const generateExtraNotes = async (moduleId, data) => {
  try {
    const res = await api.post(`/ai/notes/${moduleId}`, data);
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const generateNumericals = async (moduleId, data) => {
  try {
    const res = await api.post(`/ai/numericals/${moduleId}`, data);
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const generateExamPoints = async (moduleId, data) => {
  try {
    const res = await api.post(`/ai/exam-points/${moduleId}`, data);
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const generateYouTubeLinks = async (moduleId, data) => {
  try {
    const res = await api.post(`/ai/youtube/${moduleId}`, data);
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const fetchPredictedQuestions = async (subjectId, params = {}) => {
  try {
    const res = await api.get(`/ai/questions/${subjectId}`, { params });
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const generatePredictedQuestions = async (data) => {
  try {
    const res = await api.post('/ai/questions/generate', data);
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const chatWithAI = async (moduleId, data) => {
  try {
    const res = await api.post(`/ai/chat/${moduleId}`, data);
    return res.data;
  } catch (err) {
    handleError(err);
  }
};
