import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import BackgroundWrapper from './components/BackgroundWrapper';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Personajes from './components/Personajes';
import Planetas from './components/Planetas';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import BackofficeLayout from './components/Backoffice/BackofficeLayout';
import Dashboard from './components/Backoffice/Dashboard';
import GestionUsuarios from './components/Backoffice/GestionUsuarios';
import GestionPersonajes from './components/Backoffice/GestionPersonajes';
import GestionPlanetas from './components/Backoffice/GestionPlanetas';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BackgroundWrapper>
        <Router>
          <div className="App">
            <Navbar />
            <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Rutas protegidas (Front Office) */}
            <Route 
              path="/personajes" 
              element={
                <ProtectedRoute>
                  <Personajes />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/planetas" 
              element={
                <ProtectedRoute>
                  <Planetas />
                </ProtectedRoute>
              } 
            />
            
            {/* Rutas de Backoffice (solo admin) */}
            <Route 
              path="/backoffice" 
              element={
                <AdminRoute>
                  <BackofficeLayout />
                </AdminRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="usuarios" element={<GestionUsuarios />} />
              <Route path="personajes" element={<GestionPersonajes />} />
              <Route path="planetas" element={<GestionPlanetas />} />
            </Route>
            
            <Route path="/" element={<Navigate to="/personajes" replace />} />
            </Routes>
          </div>
        </Router>
      </BackgroundWrapper>
    </AuthProvider>
  );
}

export default App;
