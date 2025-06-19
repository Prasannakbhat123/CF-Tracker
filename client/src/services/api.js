// src/services/api.js

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper to handle fetch and errors
async function apiFetch(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || `API error: ${res.status}`);
    }
    return res.json();
  } catch (err) {
    if (err.message === 'Failed to fetch') {
      throw new Error('Unable to connect to the server. Please check if the server is running.');
    }
    throw err;
  }
}

// Students
export const getStudents = () => apiFetch('/students');
export const getStudent = (id) => apiFetch(`/students/${id}`);
export const createStudent = (data) =>
  apiFetch('/students', { method: 'POST', body: JSON.stringify(data) });
export const updateStudent = (id, data) =>
  apiFetch(`/students/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteStudent = (id) =>
  apiFetch(`/students/${id}`, { method: 'DELETE' });

// Contest history and problem solving
export const getContestHistory = (id) => apiFetch(`/students/${id}/contests`);
export const getProblemSolving = (id) => apiFetch(`/students/${id}/problems`);

// Validation helpers
export const checkHandleExists = (handle) => apiFetch(`/check-handle/${handle}`);
