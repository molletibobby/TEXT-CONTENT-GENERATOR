import axios from 'axios';

const API_BASE_URL = '/api/v1/media';

/**
 * Upload Media File to Express Backend
 */
export const uploadMedia = async (file, targetLanguage = 'english', mode = 'summary', onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('targetLanguage', targetLanguage);
  formData.append('mode', mode);

  const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });

  return response.data;
};

/**
 * Generate AI Summary / Translation in English, Telugu, or Tinglish
 */
export const generateAI = async (contextText, prompt, language = 'english') => {
  const response = await axios.post(`${API_BASE_URL}/generate`, {
    contextText,
    prompt,
    language,
  });

  return response.data;
};

/**
 * Fetch Upload History
 */
export const fetchHistory = async () => {
  const response = await axios.get(`${API_BASE_URL}/history`);
  return response.data;
};

/**
 * Delete History Item
 */
export const deleteHistoryItem = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/history/${id}`);
  return response.data;
};
