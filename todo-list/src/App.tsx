import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css'
// import { ModeToggle } from './components/mode-toggle'
import Login from './components/Auth/LoginForm'
import Register from './components/Auth/RegisterForm'
import Navbar from './components/Navbar';
import TaskManager from './components/TaskManager';
import Home  from './pages/Home';

function App() {
  

  return (
    <Router>
    <div className="app">
      <Navbar/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/tasks' element={<TaskManager/>} />
        <Route path="/login" element={<Login onLoginSuccess={function (): void {
            throw new Error('Function not implemented.');
          } } />} />
        <Route path="/register" element={<Register onRegisterSuccess={function (): void {
            throw new Error('Function not implemented.');
          } } />} />
       
        {/* Add more routes as needed */}
      </Routes>
    </div>
  </Router>
  )
}

export default App
