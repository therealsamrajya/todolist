import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '@/store/store'; 
import { Button } from './ui/button';

interface Task {
    _id: string;
    title: string;
    description: string;
    completed: boolean;
}

interface ApiResponse {
    statusCode: number;
    data: Task[];
    message: string;
    success: boolean;
}

const TaskManager: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
    const [task, setTask] = useState<Task>({ _id: '', title: '', description: '', completed: false });
    const { token, isLoggedIn } = useStore();

    useEffect(() => {
        if (isLoggedIn) {
            fetchTasks();
        }
    }, [isLoggedIn]);

    const fetchTasks = async () => {
        try {
            const response = await axios.get<ApiResponse>('http://localhost:4000/api/tasks', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Fetched tasks:', response.data);
            if (response.data.success && Array.isArray(response.data.data)) {
                const allTasks = response.data.data;
                setTasks(allTasks.filter(t => !t.completed));
                setCompletedTasks(allTasks.filter(t => t.completed));
            } else {
                console.error('Unexpected response structure:', response.data);
                setTasks([]);
                setCompletedTasks([]);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setTasks([]);
            setCompletedTasks([]);
        }
    };

    const handleCreateOrUpdate = async () => {
        try {
            if (task._id) {
                await axios.put<ApiResponse>(`http://localhost:4000/api/tasks/${task._id}`, task, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post<ApiResponse>('http://localhost:4000/api/tasks/create', task, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            fetchTasks();
            setTask({ _id: '', title: '', description: '', completed: false });
        } catch (error) {
            console.error('Error creating/updating task:', error);
        }
    };

    const handleDelete = async (_id: string) => {
        try {
            await axios.delete<ApiResponse>(`http://localhost:4000/api/tasks/${_id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTasks();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleToggleComplete = async (taskToToggle: Task) => {
        try {
            const updatedTask = { ...taskToToggle, completed: !taskToToggle.completed };
            await axios.put<ApiResponse>(`http://localhost:4000/api/tasks/${taskToToggle._id}`, updatedTask, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTasks();
        } catch (error) {
            console.error('Error toggling task completion:', error);
        }
    };

    if (!isLoggedIn) {
        return <div>Please log in to manage tasks.</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Task Manager</h1>
            <div className="mb-8 bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 dark:text-black">Create New Task</h2>
                <input 
                    type="text" 
                    value={task.title} 
                    onChange={(e) => setTask({ ...task, title: e.target.value })} 
                    placeholder="Task Title" 
                    className="w-fit dark:text-black p-2 border rounded mb-4"
                />
                <textarea 
                    value={task.description} 
                    onChange={(e) => setTask({ ...task, description: e.target.value })} 
                    placeholder="Task Description" 
                    className="w-full dark:text-black p-2 border rounded mb-4"
                    rows={3}
                />
                <Button 
                    onClick={handleCreateOrUpdate}
                   
                >
                    {task._id ? 'Update Task' : 'Create Task'}
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-2xl font-bold mb-4">Active Tasks</h2>
                    {tasks.length > 0 ? (
                        <ul className="grid gap-4">
                            {tasks.map((t) => (
                                <li key={t._id} className="bg-white shadow-md rounded-lg p-4">
                                    <h3 className=" dark:text-black font-bold text-lg mb-2">{t.title}</h3>
                                    <p className="text-gray-600 mb-4">{t.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        <Button 
                                            onClick={() => setTask(t)}
                                            variant="secondary"
                                            size="sm"
                                        >
                                            Edit
                                        </Button>
                                        <Button 
                                            onClick={() => handleDelete(t._id)}
                                            variant="destructive"
                                            size="sm"
                                        >
                                            Delete
                                        </Button>
                                        <Button 
                                            onClick={() => handleToggleComplete(t)}
                                            variant="outline"
                                            size="sm"
                                        >
                                            Complete
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">No active tasks available.</p>
                    )}
                </div>
                <div>
                    <h2 className="text-2xl font-bold mb-4">Completed Tasks</h2>
                    {completedTasks.length > 0 ? (
                        <ul className="grid gap-4">
                            {completedTasks.map((t) => (
                                <li key={t._id} className="bg-gray-100 shadow-md rounded-lg p-4">
                                    <h3 className="font-bold dark:text-black text-lg mb-2 line-through">{t.title}</h3>
                                    <p className=" mb-4 dark:text-black line-through">{t.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        <Button 
                                            onClick={() => handleToggleComplete(t)}
                                            variant="outline"
                                            size="sm"
                                        >
                                            Redo
                                        </Button>
                                        <Button 
                                            onClick={() => handleDelete(t._id)}
                                            variant="destructive"
                                            size="sm"
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">No completed tasks.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskManager;