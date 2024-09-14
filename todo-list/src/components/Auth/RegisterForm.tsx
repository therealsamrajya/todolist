import React, { useState } from 'react';
import axios from 'axios';
import Notification from '../Notification';

const RegisterForm: React.FC<{ onRegisterSuccess: () => void }> = ({ onRegisterSuccess }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:4000/api/users/register', formData);
            console.log(response.data);
            setNotification({ message: response.data.message || 'Registration successful!', type: 'success' });
            setTimeout(() => {
                onRegisterSuccess();
            }, 2000);
        } catch (error) {
            console.error('Error:', error instanceof Error ? error.message : error);
            setNotification({ 
                message: error instanceof Error ? error.message : 'Registration failed!', 
                type: 'error' 
            });
        }
    };

    return (
        <div className="min-h-screen  flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h1 className="mx-auto max-sm:text-[2rem] text-[3rem]">TODO LIST</h1> 
                <h2 className="mt-6 text-center text-3xl font-extrabold max-sm:text-[1.5rem] text-gray-900 dark:text-white">Create your account</h2>
            </div>

            <div className="mt-8 max-sm:mt-4 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {notification && (
                        <Notification 
                            message={notification.message} 
                            type={notification.type} 
                            onClose={() => setNotification(null)} 
                        />
                    )}
                    <form className="space-y-6 flex flex-col " onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Full Name
                            </label>
                            <div className="">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder='Samrajya'
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 dark:text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder='Eg:samrajyachand@gmail.com'
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none dark:text-black focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder='Enter your password'
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none dark:text-black focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Register
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;