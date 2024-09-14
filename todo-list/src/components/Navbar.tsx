import { NavLink } from 'react-router-dom';
import { ModeToggle } from './mode-toggle';

const Navbar = () => {
    return (
        <nav className="font-sans">
            <div className="flex justify-between items-center">
                <h1 className="text-lg font-bold">ToDo List</h1>
                <div className="space-x-4">
                    <ModeToggle />
                    <NavLink to="/">Home</NavLink>
                    <NavLink to="/tasks">Tasks</NavLink>
                    <NavLink to="/login">Login</NavLink>
                    <NavLink to="/register">Register</NavLink>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
