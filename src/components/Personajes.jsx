import { useState, useEffect } from 'react';
import { personajesService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Personajes.css';

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

const Personajes = () => {
    const { isAdmin } = useAuth();
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
            const data = await personajesService.getAll();
            setPersonajes(data || []);
        } catch (err) {
            setError('Error al cargar personajes');
            console.error(err);
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

            const datos = {
                ...formData,
                kiBase: formData.kiBase ? Number(formData.kiBase) : undefined
            };

            if (editingId) {
                await personajesService.update(editingId, datos);
                setSuccessMessage('Actualizado');
            } else {
                await personajesService.create(datos);
                setSuccessMessage('Creado');
            }

            resetForm();
            loadData();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.message || 'Error');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            await personajesService.delete(id);
            setDeleteConfirmId(null);
            setSuccessMessage('Eliminado');
            loadData();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.message || 'Error');
            console.error(err);
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

    const renderCard = (personaje) => {
        if (editingId === personaje._id) {
            return renderForm();
        }

        return (
            <>
                {personaje.image && (
                    <img src={personaje.image} alt={personaje.name || 'Personaje'} />
                )}
                <h3>{personaje.name || 'Sin nombre'}</h3>
                {personaje.description && (
                    <p className="description">{personaje.description}</p>
                )}
                <div className="personaje-info">
                    {personaje.kiBase !== undefined && (
                        <p><strong>Ki Base:</strong> {personaje.kiBase}</p>
                    )}
                    {personaje.FavoriteFood && (
                        <p><strong>Comida Favorita:</strong> {personaje.FavoriteFood}</p>
                    )}
                </div>
                {isAdmin && (
                    <div className="card-buttons">
                        <button onClick={() => handleEdit(personaje)} className="btn-edit">
                            Editar
                        </button>
                        <button 
                            onClick={() => setDeleteConfirmId(personaje._id)} 
                            className="btn-delete"
                        >
                            Borrar
                        </button>
                    </div>
                )}
            </>
        );
    };

    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <div className="personajes-container">
            <div className="header-actions">
                <h1>Personajes de Dragon Ball</h1>
                {isAdmin && (
                    <button 
                        onClick={() => {
                            resetForm();
                            setShowCreateForm(true);
                        }} 
                        className="btn-new"
                    >
                        + Nuevo Personaje
                    </button>
                )}
            </div>

            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
            
            {showCreateForm && (
                <div className="personaje-card new-card">
                    {renderForm('Crear Nuevo Personaje')}
                </div>
            )}
            
            {personajes.length === 0 && !showCreateForm ? (
                <p className="no-data">No hay personajes disponibles</p>
            ) : (
                <div className="personajes-grid">
                    {personajes.map(personaje => (
                        <div key={personaje._id} className="personaje-card">
                            {renderCard(personaje)}
                        </div>
                    ))}
                </div>
            )}

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

export default Personajes;
