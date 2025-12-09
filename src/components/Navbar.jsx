import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/images/logo.jpg';
import './Navbar.css';

const Navbar = () => {
    const { isAuthenticated, user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-content">
                <Link to="/" className="navbar-brand">
                    <img src={logo} alt="Dragon Ball API" className="navbar-logo" />
                </Link>
                <div className="navbar-links">
                    {isAuthenticated ? (
                        <>
                            <Link to="/personajes">Personajes</Link>
                            <Link to="/planetas">Planetas</Link>
                            {isAdmin && (
                                <Link to="/backoffice" className="admin-link">
                                    Backoffice
                                </Link>
                            )}
                            {user && <span className="user-name">Hola, {user.nombre}</span>}
                            <button onClick={handleLogout} className="btn-logout">
                                Cerrar Sesión
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Iniciar Sesión</Link>
                            <Link to="/register">Registrarse</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
