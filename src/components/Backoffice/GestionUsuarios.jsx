import { useState, useEffect } from 'react';
import { backofficeService } from '../../services/api';
import './Backoffice.css';

const GestionUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        role: 'user'
    });
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await backofficeService.usuarios.getAll();
            setUsuarios(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Error al cargar usuarios');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            nombre: '',
            email: '',
            password: '',
            role: 'user'
        });
        setEditingId(null);
        setShowCreateForm(false);
    };

    const handleFormChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleEdit = (usuario) => {
        setEditingId(usuario._id);
        setShowCreateForm(false);
        setFormData({
            nombre: usuario.nombre || '',
            email: usuario.email || '',
            password: '',
            role: usuario.role || 'user'
        });
    };

    const handleSave = async () => {
        if (!formData.nombre.trim() || !formData.email.trim()) {
            setError('Nombre y email son requeridos');
            return;
        }

        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            setError('');
            setSuccessMessage('');

            if (editingId) {
                const updateData = { ...formData };
                if (!updateData.password) {
                    delete updateData.password;
                }
                await backofficeService.usuarios.update(editingId, updateData);
                setSuccessMessage('Usuario actualizado');
            } else {
                if (!formData.password) {
                    setError('La contraseña es requerida para nuevos usuarios');
                    setIsSubmitting(false);
                    return;
                }
                await backofficeService.usuarios.createAdmin({
                    nombre: formData.nombre,
                    email: formData.email,
                    password: formData.password
                });
                setSuccessMessage('Usuario creado');
            }

            resetForm();
            loadData();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.message || 'Error al guardar');
            console.error('Error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            setError('');
            setSuccessMessage('');
            
            await backofficeService.usuarios.delete(id);
            setDeleteConfirmId(null);
            setSuccessMessage('Usuario eliminado');
            loadData();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.message || 'Error al eliminar el usuario');
            console.error('Error:', err);
        } finally {
            setIsSubmitting(false);
            setDeleteConfirmId(null);
        }
    };

    if (loading) {
        return <div className="loading">Cargando usuarios...</div>;
    }

    return (
        <div className="backoffice-container">
            <div className="header-actions">
                <h1>Gestión de Usuarios</h1>
                <button 
                    onClick={() => {
                        resetForm();
                        setShowCreateForm(true);
                    }} 
                    className="btn-new"
                >
                    + Nuevo Usuario
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
            
            {showCreateForm && (
                <div className="edit-form-container">
                    <h3>Crear Nuevo Usuario</h3>
                    <div className="edit-form">
                        <input
                            type="text"
                            placeholder="Nombre *"
                            value={formData.nombre}
                            onChange={(e) => handleFormChange('nombre', e.target.value)}
                            className="form-input"
                        />
                        <input
                            type="email"
                            placeholder="Email *"
                            value={formData.email}
                            onChange={(e) => handleFormChange('email', e.target.value)}
                            className="form-input"
                        />
                        <input
                            type="password"
                            placeholder="Contraseña *"
                            value={formData.password}
                            onChange={(e) => handleFormChange('password', e.target.value)}
                            className="form-input"
                        />
                        <select
                            value={formData.role}
                            onChange={(e) => handleFormChange('role', e.target.value)}
                            className="form-input"
                        >
                            <option value="user">Usuario</option>
                            <option value="admin">Administrador</option>
                        </select>
                        <div className="form-buttons">
                            <button 
                                onClick={handleSave} 
                                className="btn-save"
                                disabled={isSubmitting || !formData.nombre.trim() || !formData.email.trim()}
                            >
                                {isSubmitting ? 'Guardando...' : 'Crear'}
                            </button>
                            <button 
                                onClick={resetForm} 
                                className="btn-cancel"
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map(usuario => (
                            <tr key={usuario._id}>
                                {editingId === usuario._id ? (
                                    <td colSpan="4">
                                        <div className="edit-form">
                                            <input
                                                type="text"
                                                placeholder="Nombre *"
                                                value={formData.nombre}
                                                onChange={(e) => handleFormChange('nombre', e.target.value)}
                                                className="form-input"
                                            />
                                            <input
                                                type="email"
                                                placeholder="Email *"
                                                value={formData.email}
                                                onChange={(e) => handleFormChange('email', e.target.value)}
                                                className="form-input"
                                            />
                                            <input
                                                type="password"
                                                placeholder="Nueva contraseña (dejar vacío para mantener)"
                                                value={formData.password}
                                                onChange={(e) => handleFormChange('password', e.target.value)}
                                                className="form-input"
                                            />
                                            <select
                                                value={formData.role}
                                                onChange={(e) => handleFormChange('role', e.target.value)}
                                                className="form-input"
                                            >
                                                <option value="user">Usuario</option>
                                                <option value="admin">Administrador</option>
                                            </select>
                                            <div className="form-buttons">
                                                <button 
                                                    onClick={handleSave} 
                                                    className="btn-save"
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ? 'Guardando...' : 'Guardar'}
                                                </button>
                                                <button 
                                                    onClick={resetForm} 
                                                    className="btn-cancel"
                                                    disabled={isSubmitting}
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                ) : (
                                    <>
                                        <td>{usuario.nombre}</td>
                                        <td>{usuario.email}</td>
                                        <td>
                                            <span className={`role-badge ${usuario.role || 'user'}`}>
                                                {usuario.role === 'admin' ? 'Administrador' : 'Usuario'}
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                onClick={() => handleEdit(usuario)} 
                                                className="btn-edit"
                                            >
                                                Editar
                                            </button>
                                            <button 
                                                onClick={() => setDeleteConfirmId(usuario._id)} 
                                                className="btn-delete"
                                            >
                                                Borrar
                                            </button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {deleteConfirmId && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>¿Estás seguro?</h3>
                        <p>Esta acción no se puede deshacer.</p>
                        <div className="modal-buttons">
                            <button 
                                onClick={() => handleDelete(deleteConfirmId)} 
                                className="btn-delete-confirm"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Eliminando...' : 'Sí, borrar'}
                            </button>
                            <button 
                                onClick={() => setDeleteConfirmId(null)} 
                                className="btn-cancel"
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionUsuarios;

