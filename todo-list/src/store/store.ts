import { Task } from '@/services/api';
import { create } from 'zustand';
import axios from 'axios';

interface Store {
    isLoggedIn: boolean;
    token: string | null;
    setLoggedIn: (status: boolean, token: string | null) => void;
    logout: () => Promise<void>;
    tasks: Task[];
    fetchTasks: () => Promise<void>;
    addTask: (task: Task) => Promise<void>;
    updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
}

export const useStore = create<Store>((set, get) => ({
    isLoggedIn: !!localStorage.getItem('token'),
    token: localStorage.getItem('token'),
    setLoggedIn: (status, token) => {
        if (status && token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
        set({ isLoggedIn: status, token });
    },
    logout: async () => {
        const { token } = get();
        try {
            await axios.post('https://todoback-iwsz.onrender.com/api/users/logout', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            // Always clear local storage and reset state, even if the API call fails
            localStorage.removeItem('token');
            set({ isLoggedIn: false, token: null, tasks: [] });
        }
    },
    tasks: [],
    fetchTasks: async () => {
        const { token } = get();
        if (!token) {
            console.error('No token available');
            return;
        }
        try {
            const response = await axios.get('https://todoback-iwsz.onrender.com/api/tasks', {
                headers: { Authorization: `Bearer ${token}` }
            });
            set({ tasks: response.data });
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    },
    addTask: async (task: Task) => {
        const { token, tasks } = get();
        try {
            const response = await axios.post('https://todoback-iwsz.onrender.com/api/tasks', task, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set({ tasks: [...tasks, response.data] });
        } catch (error) {
            console.error('Error adding task:', error);
        }
    },
    updateTask: async (taskId: string, updates: Partial<Task>) => {
        const { token, tasks } = get();
        try {
            const response = await axios.put(`https://todoback-iwsz.onrender.com/api/tasks/${taskId}`, updates, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set({ tasks: tasks.map(task => task._id === taskId ? response.data : task) });
        } catch (error) {
            console.error('Error updating task:', error);
        }
    },
    deleteTask: async (taskId: string) => {
        const { token, tasks } = get();
        try {
            await axios.delete(`https://todoback-iwsz.onrender.com/api/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set({ tasks: tasks.filter(task => task._id !== taskId) });
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    },
}));