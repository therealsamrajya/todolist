import React, { useState } from 'react';
import LoginForm from './Auth/LoginForm';
import RegisterForm from './Auth/RegisterForm';
// Removed the import for RegisterForm due to the error

interface AuthFormProps {
    isLogin: boolean; // Add this line
    onLogout: () => void; // Add this line
}

const AuthForm: React.FC<AuthFormProps> = ({ isLogin }) => {
    const [isLoginState, setIsLoginState] = useState(isLogin);

    const toggleForm = () => {
        setIsLoginState((prev) => !prev);
    };

    return (
        <div>
            {isLoginState ? (
                <LoginForm onLoginSuccess={toggleForm} />
            ) : (
                <RegisterForm onRegisterSuccess={toggleForm} />
            )}
            <button type="button" onClick={toggleForm}>
                {isLoginState ? 'Switch to Register' : 'Switch to Login'}
            </button>
        </div>
    );
};

export default AuthForm;