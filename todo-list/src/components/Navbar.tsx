import { NavLink } from 'react-router-dom';
import { ModeToggle } from './mode-toggle';
import { useStore } from '@/store/store';

const Navbar = () => {
    const { isLoggedIn, logout } = useStore();

    return (
        <nav className="font-sans">
            <div className="flex justify-between items-center">
                <h1 className="text-lg font-bold">ToDo List</h1>
                <div className="space-x-4">
                    <ModeToggle />
                    <NavLink to="/">Home</NavLink>
                    {isLoggedIn && <NavLink to="/tasks">Tasks</NavLink>}
                    {isLoggedIn ? (
                        <button onClick={logout} className="text-red-500 hover:text-red-700">Logout</button>
                    ) : (
                        <>
                            <NavLink to="/login">Login</NavLink>
                            <NavLink to="/register">Register</NavLink>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;