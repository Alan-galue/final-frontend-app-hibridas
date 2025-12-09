import { useState, useEffect } from 'react';
import { planetasService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Personajes.css';

const campos = [
    { key: 'name', type: 'text', placeholder: 'Nombre *' },
    { key: 'image', type: 'text', placeholder: 'URL de imagen' },
    { key: 'description', type: 'textarea', placeholder: 'Descripción' },
    { key: 'poblation', type: 'number', placeholder: 'Población' },
    { key: 'color', type: 'text', placeholder: 'Color' }
];

const formInicial = {
    name: '',
    image: '',
    description: '',
    poblation: '',
    color: ''
};

const Planetas = () => {
    const { isAdmin } = useAuth();
    const [planetas, setPlanetas] = useState([]);
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
            const data = await planetasService.getAll();
            setPlanetas(data || []);
        } catch (err) {
            setError('Error al cargar planetas');
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

    const handleEdit = (planeta) => {
        setEditingId(planeta._id);
        setShowCreateForm(false);
        setFormData({
            name: planeta.name || '',
            image: planeta.image || '',
            description: planeta.description || '',
            poblation: planeta.poblation || planeta.Poblation || '',
            color: planeta.color || ''
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
                Poblation: formData.poblation ? Number(formData.poblation) : undefined
            };
            delete datos.poblation;

            if (editingId) {
                await planetasService.update(editingId, datos);
                setSuccessMessage('Actualizado');
            } else {
                await planetasService.create(datos);
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
            await planetasService.delete(id);
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

    const renderCard = (planeta) => {
        if (editingId === planeta._id) {
            return renderForm();
        }

        return (
            <>
                {planeta.image && (
                    <img src={planeta.image} alt={planeta.name || 'Planeta'} />
                )}
                <h3>{planeta.name || 'Sin nombre'}</h3>
                {planeta.description && (
                    <p className="description">{planeta.description}</p>
                )}
                <div className="personaje-info">
                    {(planeta.Poblation !== undefined && planeta.Poblation !== null) || 
                     (planeta.poblation !== undefined && planeta.poblation !== null) ? (
                        <p><strong>Población:</strong> {(planeta.Poblation ?? planeta.poblation ?? 0).toLocaleString()}</p>
                    ) : null}
                    {planeta.color && (
                        <p><strong>Color:</strong>
                            <span style={{ color: planeta.color, marginLeft: '5px', fontWeight: 'bold' }}>
                                {planeta.color}
                            </span>
                        </p>
                    )}
                </div>
                {isAdmin && (
                    <div className="card-buttons">
                        <button onClick={() => handleEdit(planeta)} className="btn-edit">
                            Editar
                        </button>
                        <button 
                            onClick={() => setDeleteConfirmId(planeta._id)} 
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
                <h1>Planetas de Dragon Ball</h1>
                {isAdmin && (
                    <button 
                        onClick={() => {
                            resetForm();
                            setShowCreateForm(true);
                        }} 
                        className="btn-new"
                    >
                        + Nuevo Planeta
                    </button>
                )}
            </div>

            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
            
            {showCreateForm && (
                <div className="personaje-card new-card">
                    {renderForm('Crear Nuevo Planeta')}
                </div>
            )}
            
            {planetas.length === 0 && !showCreateForm ? (
                <p className="no-data">No hay planetas disponibles</p>
            ) : (
                <div className="personajes-grid">
                    {planetas.map(planeta => (
                        <div key={planeta._id} className="personaje-card">
                            {renderCard(planeta)}
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

export default Planetas;
