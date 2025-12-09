import { useState, useEffect } from 'react';
import { backofficeService } from '../../services/api';
import './Backoffice.css';

const campos = [
    { key: 'name', type: 'text', placeholder: 'Nombre *' },
    { key: 'image', type: 'text', placeholder: 'URL de imagen' },
    { key: 'description', type: 'textarea', placeholder: 'Descripción' },
    { key: 'kiBase', type: 'number', placeholder: 'Ki Base' },
    { key: 'FavoriteFood', type: 'text', placeholder: 'Comida Favorita' }
];

const formInicial = {
    name: '',
    image: '',
    description: '',
    kiBase: '',
    FavoriteFood: ''
};

const GestionPersonajes = () => {
    const [personajes, setPersonajes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState(formInicial);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await backofficeService.personajes.getAll();
            setPersonajes(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Error al cargar los personajes');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData(formInicial);
        setEditingId(null);
        setShowCreateForm(false);
    };

    const handleFormChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleEdit = (personaje) => {
        setEditingId(personaje._id);
        setShowCreateForm(false);
        setFormData({
            name: personaje.name || '',
            image: personaje.image || '',
            description: personaje.description || '',
            kiBase: personaje.kiBase || '',
            FavoriteFood: personaje.FavoriteFood || ''
        });
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            setError('El nombre es requerido');
            return;
        }

        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            setError('');
            setSuccessMessage('');

            const datos = {
                ...formData,
                kiBase: formData.kiBase ? Number(formData.kiBase) : undefined
            };

            if (editingId) {
                await backofficeService.personajes.update(editingId, datos);
                setSuccessMessage('Personaje actualizado');
            } else {
                await backofficeService.personajes.create(datos);
                setSuccessMessage('Personaje creado');
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
            
            await backofficeService.personajes.delete(id);
            setDeleteConfirmId(null);
            setSuccessMessage('Personaje eliminado');
            loadData();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.message || 'Error al eliminar el personaje');
            console.error('Error:', err);
        } finally {
            setIsSubmitting(false);
            setDeleteConfirmId(null);
        }
    };

    const renderForm = (title) => (
        <div className="edit-form">
            {title && <h3>{title}</h3>}
            {campos.map(field => {
                if (field.type === 'textarea') {
                    return (
                        <textarea
                            key={field.key}
                            placeholder={field.placeholder}
                            value={formData[field.key]}
                            onChange={(e) => handleFormChange(field.key, e.target.value)}
                            className="form-textarea"
                        />
                    );
                }
                return (
                    <input
                        key={field.key}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={formData[field.key]}
                        onChange={(e) => handleFormChange(field.key, e.target.value)}
                        className="form-input"
                    />
                );
            })}
            <div className="form-buttons">
                <button 
                    onClick={handleSave} 
                    className="btn-save"
                    disabled={isSubmitting || !formData.name.trim()}
                >
                    {isSubmitting ? 'Guardando...' : (editingId ? 'Guardar' : 'Crear')}
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
    );

    if (loading) {
        return <div className="loading">Cargando personajes...</div>;
    }

    return (
        <div className="backoffice-container">
            <div className="header-actions">
                <h1>Gestión de Personajes</h1>
                <button 
                    onClick={() => {
                        resetForm();
                        setShowCreateForm(true);
                    }} 
                    className="btn-new"
                >
                    + Nuevo Personaje
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
            
            {showCreateForm && (
                <div className="edit-form-container">
                    {renderForm('Crear Nuevo Personaje')}
                </div>
            )}

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Imagen</th>
                            <th>Nombre</th>
                            <th>Ki Base</th>
                            <th>Comida Favorita</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {personajes.map(personaje => (
                            <tr key={personaje._id}>
                                {editingId === personaje._id ? (
                                    <td colSpan="5">
                                        {renderForm()}
                                    </td>
                                ) : (
                                    <>
                                        <td>
                                            {personaje.image ? (
                                                <img src={personaje.image} alt={personaje.name} className="table-image" />
                                            ) : (
                                                <span className="no-image">Sin imagen</span>
                                            )}
                                        </td>
                                        <td>{personaje.name || 'Sin nombre'}</td>
                                        <td>{personaje.kiBase || 0}</td>
                                        <td>{personaje.FavoriteFood || '-'}</td>
                                        <td>
                                            <button 
                                                onClick={() => handleEdit(personaje)} 
                                                className="btn-edit"
                                            >
                                                Editar
                                            </button>
                                            <button 
                                                onClick={() => setDeleteConfirmId(personaje._id)} 
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

export default GestionPersonajes;

