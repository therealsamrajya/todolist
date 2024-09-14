import axios from 'axios';

const API_URL = 'http://localhost:4000/api'; // Adjust based on your backend URL

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // To include cookies in requests
});

// Define types for user and task
export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Task {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
}

// User Authentication
export const registerUser = (userData: { name: string; email: string; password: string }) => api.post('/register', userData);
export const loginUser = (userData: { email: string; password: string }) => api.post('/login', userData);
export const logoutUser = () => api.post('/logout');

// Task Management
export const getAllTasks = () => api.get<Task[]>('/tasks');
export const createTask = (taskData: { title: string; description?: string }) => api.post('/tasks', taskData);
export const updateTask = (id: string, taskData: { title?: string; description?: string; completed?: boolean }) => api.put(`/tasks/${id}`, taskData);
export const deleteTask = (id: string) => api.delete(`/tasks/${id}`);

export default api;