import { Task } from '@/services/api';
import { create } from 'zustand';

interface Store {
    isLoggedIn: boolean;
    token: string | null;
    setLoggedIn: (status: boolean, token: string | null) => void;
    tasks: Task[];
    fetchTasks: () => Promise<void>;
}

export const useStore = create<Store>((set) => ({
    isLoggedIn: false,
    token: null,
    setLoggedIn: (status, token) => set({ isLoggedIn: status, token }),
    tasks: [],
    fetchTasks: async () => {
        const { token } = useStore.getState();
        if (!token) {
            console.error('No token available');
            return;
        }
        try {
            const response = await fetch('http://localhost:4000/api/tasks', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }
            const data = await response.json();
            set({ tasks: data });
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    },
}));