import { Link, useLocation, Outlet } from 'react-router-dom';
import './BackofficeLayout.css';

const BackofficeLayout = () => {
    const location = useLocation();

    return (
        <div className="backoffice-layout">
            <aside className="backoffice-sidebar">
                <h2>Admin</h2>
                <nav>
                    <Link to="/backoffice" className={location.pathname === '/backoffice' ? 'active' : ''}>
                        Dashboard
                    </Link>
                    <Link to="/backoffice/usuarios" className={location.pathname === '/backoffice/usuarios' ? 'active' : ''}>
                        Usuarios
                    </Link>
                    <Link to="/backoffice/personajes" className={location.pathname === '/backoffice/personajes' ? 'active' : ''}>
                        Personajes
                    </Link>
                    <Link to="/backoffice/planetas" className={location.pathname === '/backoffice/planetas' ? 'active' : ''}>
                        Planetas
                    </Link>
                </nav>
            </aside>
            <main className="backoffice-main">
                <Outlet />
            </main>
        </div>
    );
};

export default BackofficeLayout;

