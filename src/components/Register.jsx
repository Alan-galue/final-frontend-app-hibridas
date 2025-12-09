import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import backgroundLogin from '../assets/images/background-login.jpg';
import './Login.css';

const Register = () => {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const { register, login } = useAuth();
    const navigate = useNavigate();

    const validateForm = () => {
        if (!nombre || !email || !password || !confirmPassword) {
            setError('Todos los campos son requeridos');
            return false;
        }

        if (!email.includes('@')) {
            setError('Email inválido');
            return false;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return false;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        const registerResult = await register(nombre, email, password);
        if (registerResult.success) {
            const loginResult = await login(email, password);
            if (loginResult.success) {
                navigate('/personajes');
            } else {
                setError('Registro exitoso, pero error al iniciar sesión. Por favor, inicia sesión manualmente.');
            }
        } else {
            setError(registerResult.error || 'Error al registrar usuario');
        }
    };

    return (
        <div className="login-container" style={{ backgroundImage: `url(${backgroundLogin})` }}>
            <div className="login-card">
                <h2>Registrarse</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nombre:</label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Tu nombre"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@email.com"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Contraseña:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirmar Contraseña:</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <button type="submit" className="btn-primary">
                        Registrarse
                    </button>
                </form>
                <p className="register-link">
                    ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
