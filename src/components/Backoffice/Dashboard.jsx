import { useState, useEffect } from 'react';
import { backofficeService } from '../../services/api';
import './Backoffice.css';

const Dashboard = () => {
    const [stats, setStats] = useState({ usuarios: 0, personajes: 0, planetas: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const usuarios = await backofficeService.usuarios.getAll();
            const personajes = await backofficeService.personajes.getAll();
            const planetas = await backofficeService.planetas.getAll();
            
            setStats({
                usuarios: usuarios.length || 0,
                personajes: personajes.length || 0,
                planetas: planetas.length || 0
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Cargando...</div>;

    return (
        <div className="backoffice-container">
            <h1>Dashboard</h1>
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Usuarios</h3>
                    <p>{stats.usuarios}</p>
                </div>
                <div className="stat-card">
                    <h3>Personajes</h3>
                    <p>{stats.personajes}</p>
                </div>
                <div className="stat-card">
                    <h3>Planetas</h3>
                    <p>{stats.planetas}</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

