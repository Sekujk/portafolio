import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaUser, FaGraduationCap, FaBriefcase, FaTools, FaProjectDiagram,
  FaCertificate, FaSignOutAlt, FaKey, FaSave, FaTrash, FaPlus, FaEye, FaExclamationTriangle
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { usePortfolio } from '../../context/PortfolioContext';
import './Dashboard.css';

const Dashboard = () => {
  const { logout, changePassword } = useAuth();
  const { portfolioData, connectionError, updateSection, addItem, updateItem, deleteItem, resetToDefaults } = usePortfolio();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  // Si hay error de conexión, mostrar pantalla de error
  if (connectionError || !portfolioData) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: 'white',
            borderRadius: '20px',
            padding: '3rem',
            maxWidth: '600px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}
        >
          <FaExclamationTriangle style={{ fontSize: '4rem', color: '#f5576c', marginBottom: '1.5rem' }} />
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#333' }}>
            No se puede acceder al Dashboard
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '1.5rem' }}>
            {connectionError || 'Error de conexión con Supabase'}
          </p>
          <div style={{
            background: '#f8f9fa',
            padding: '1.5rem',
            borderRadius: '12px',
            textAlign: 'left',
            fontSize: '0.95rem',
            color: '#444',
            marginBottom: '1.5rem'
          }}>
            <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#f5576c' }}>
              ⚠️ Requisitos:
            </strong>
            <ol style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>Archivo <code>.env</code> con credenciales correctas</li>
              <li>Script <code>supabase-setup.sql</code> ejecutado en Supabase</li>
              <li>Proyecto de Supabase activo</li>
            </ol>
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '12px',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginRight: '1rem'
            }}
          >
            🔄 Reintentar
          </button>
          <button
            onClick={() => navigate('/admin')}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '12px',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ← Volver al Login
          </button>
        </motion.div>
      </div>
    );
  }

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setErrorMessage('');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const showError = (message) => {
    setErrorMessage(message);
    setSuccessMessage('');
    setTimeout(() => setErrorMessage(''), 5000);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const handleViewPortfolio = () => {
    window.open('/', '_blank');
  };

  const tabs = [
    { id: 'personal', name: 'Personal', icon: <FaUser /> },
    { id: 'education', name: 'Educación', icon: <FaGraduationCap /> },
    { id: 'experience', name: 'Experiencia', icon: <FaBriefcase /> },
    { id: 'skills', name: 'Habilidades', icon: <FaTools /> },
    { id: 'projects', name: 'Proyectos', icon: <FaProjectDiagram /> },
    { id: 'certifications', name: 'Certificaciones', icon: <FaCertificate /> },
    { id: 'security', name: 'Seguridad', icon: <FaKey /> },
  ];

  // Componente para editar información personal
  const PersonalInfoEditor = () => {
    const [formData, setFormData] = useState(portfolioData?.personalInfo || {});
    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        showError('Solo se permiten archivos de imagen');
        return;
      }

      // Validar tamaño (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        showError('La imagen no debe superar 2MB');
        return;
      }

      setUploading(true);
      try {
        const { supabase } = await import('../../config/supabase');
        
        // Crear nombre único para el archivo
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        // Subir archivo
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('portfolio-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Obtener URL pública
        const { data: urlData } = supabase.storage
          .from('portfolio-images')
          .getPublicUrl(filePath);

        setFormData({ ...formData, avatar: urlData.publicUrl });
        showSuccess('Imagen subida correctamente');
      } catch (error) {
        console.error('Error al subir imagen:', error);
        showError('Error al subir la imagen: ' + error.message);
      } finally {
        setUploading(false);
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await updateSection('personalInfo', formData);
        showSuccess('Información personal actualizada');
      } catch (error) {
        showError('Error al guardar: ' + error.message);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="editor-form">
        <h3>Información Personal</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Nombre Completo</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Título Profesional</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Ubicación</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div className="form-group full-width">
            <label>Biografía</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows="4"
            />
          </div>
          <div className="form-group">
            <label>GitHub</label>
            <input
              type="url"
              value={formData.github}
              onChange={(e) => setFormData({ ...formData, github: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>LinkedIn</label>
            <input
              type="url"
              value={formData.linkedin}
              onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
            />
          </div>
          <div className="form-group full-width">
            <label>Avatar / Foto de Perfil</label>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                style={{ marginBottom: '10px' }}
              />
              {uploading && <span style={{ marginLeft: '10px', color: '#667eea' }}>Subiendo...</span>}
            </div>
            <input
              type="url"
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              placeholder="O ingresa una URL de imagen"
            />
            {formData.avatar && (
              <div style={{ marginTop: '10px' }}>
                <img 
                  src={formData.avatar} 
                  alt="Preview" 
                  style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }}
                />
              </div>
            )}
          </div>
        </div>
        <button type="submit" className="btn btn-primary">
          <FaSave /> Guardar Cambios
        </button>
      </form>
    );
  };

  // Componente genérico para editar listas (educación, experiencia, etc.)
  const ListEditor = ({ section, title, fields }) => {
    const [items, setItems] = useState(portfolioData[section] || []);
    const [isAdding, setIsAdding] = useState(false);
    const [editForm, setEditForm] = useState(null);

    const handleAdd = () => {
      const newItem = {};
      fields.forEach(field => {
        newItem[field.key] = field.type === 'array' ? [] : '';
      });
      setEditForm(newItem);
      setIsAdding(true);
    };

    const handleSave = () => {
      if (isAdding) {
        addItem(section, editForm);
        showSuccess(`${title} agregado`);
      } else {
        updateItem(section, editForm.id, editForm);
        showSuccess(`${title} actualizado`);
      }
      setEditForm(null);
      setIsAdding(false);
      setItems(portfolioData[section] || []);
    };

    const handleDelete = (id) => {
      if (window.confirm('¿Estás seguro de eliminar este elemento?')) {
        deleteItem(section, id);
        showSuccess(`${title} eliminado`);
        setItems(portfolioData[section] || []);
      }
    };

    return (
      <div className="list-editor">
        <div className="list-header">
          <h3>{title}</h3>
          <button onClick={handleAdd} className="btn btn-primary btn-sm">
            <FaPlus /> Agregar
          </button>
        </div>

        {editForm && (
          <div className="edit-form-overlay">
            <div className="edit-form-modal">
              <h4>{isAdding ? `Agregar ${title}` : `Editar ${title}`}</h4>
              {fields.map(field => (
                <div key={field.key} className="form-group">
                  <label>{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={editForm[field.key] || ''}
                      onChange={(e) => setEditForm({ ...editForm, [field.key]: e.target.value })}
                      rows="3"
                    />
                  ) : field.type === 'array' ? (
                    <input
                      type="text"
                      value={(editForm[field.key] || []).join(', ')}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        [field.key]: e.target.value.split(',').map(s => s.trim())
                      })}
                      placeholder="Separado por comas"
                    />
                  ) : (
                    <input
                      type={field.type || 'text'}
                      value={editForm[field.key] || ''}
                      onChange={(e) => setEditForm({ ...editForm, [field.key]: e.target.value })}
                    />
                  )}
                </div>
              ))}
              <div className="modal-actions">
                <button onClick={handleSave} className="btn btn-primary">
                  <FaSave /> Guardar
                </button>
                <button onClick={() => { setEditForm(null); setIsAdding(false); }} className="btn btn-secondary">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="items-list">
          {items.length === 0 ? (
            <p className="empty-message">No hay elementos. Haz clic en "Agregar" para crear uno.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="item-card">
                <div className="item-content">
                  <h4>{item.title || item.position || item.degree || item.name}</h4>
                  <p className="item-subtitle">
                    {item.company || item.institution || item.issuer || ''}
                  </p>
                  {item.period && <p className="item-period">{item.period}</p>}
                </div>
                <div className="item-actions">
                  <button onClick={() => { setEditForm(item); setIsAdding(false); }} className="btn-icon">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="btn-icon btn-danger">
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const SkillsEditor = () => {
    const [skills, setSkills] = useState(portfolioData.skills || {});

    const handleSubmit = (e) => {
      e.preventDefault();
      updateSection('skills', skills);
      showSuccess('Habilidades actualizadas');
    };

    const handleAddCategory = () => {
      const categoryName = prompt('Nombre de la nueva categoría:');
      if (categoryName) {
        setSkills({ ...skills, [categoryName.toLowerCase()]: [] });
      }
    };

    const handleUpdateSkills = (category, value) => {
      const skillsArray = value.split(',').map(s => s.trim()).filter(s => s);
      setSkills({ ...skills, [category]: skillsArray });
    };

    return (
      <form onSubmit={handleSubmit} className="editor-form">
        <div className="list-header">
          <h3>Habilidades por Categoría</h3>
          <button type="button" onClick={handleAddCategory} className="btn btn-primary btn-sm">
            <FaPlus /> Nueva Categoría
          </button>
        </div>
        
        {Object.entries(skills).map(([category, skillList]) => (
          <div key={category} className="form-group">
            <label>{category.charAt(0).toUpperCase() + category.slice(1)}</label>
            <input
              type="text"
              value={skillList.join(', ')}
              onChange={(e) => handleUpdateSkills(category, e.target.value)}
              placeholder="Separadas por comas"
            />
          </div>
        ))}
        
        <button type="submit" className="btn btn-primary">
          <FaSave /> Guardar Cambios
        </button>
      </form>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'personal':
        return <PersonalInfoEditor />;
      case 'education':
        return <ListEditor
          section="education"
          title="Educación"
          fields={[
            { key: 'institution', label: 'Institución', type: 'text' },
            { key: 'degree', label: 'Título', type: 'text' },
            { key: 'period', label: 'Período', type: 'text' },
            { key: 'description', label: 'Descripción', type: 'textarea' }
          ]}
        />;
      case 'experience':
        return <ListEditor
          section="experience"
          title="Experiencia"
          fields={[
            { key: 'company', label: 'Empresa', type: 'text' },
            { key: 'position', label: 'Cargo', type: 'text' },
            { key: 'period', label: 'Período', type: 'text' },
            { key: 'description', label: 'Descripción', type: 'textarea' },
            { key: 'achievements', label: 'Logros', type: 'array' }
          ]}
        />;
      case 'skills':
        return <SkillsEditor />;
      case 'projects':
        return <ListEditor
          section="projects"
          title="Proyecto"
          fields={[
            { key: 'title', label: 'Título', type: 'text' },
            { key: 'description', label: 'Descripción', type: 'textarea' },
            { key: 'technologies', label: 'Tecnologías', type: 'array' },
            { key: 'image', label: 'URL de Imagen', type: 'url' },
            { key: 'github', label: 'GitHub', type: 'url' },
            { key: 'demo', label: 'Demo', type: 'url' },
            { key: 'featured', label: 'Destacado', type: 'checkbox' }
          ]}
        />;
      case 'certifications':
        return <ListEditor
          section="certifications"
          title="Certificación"
          fields={[
            { key: 'name', label: 'Nombre', type: 'text' },
            { key: 'issuer', label: 'Emisor', type: 'text' },
            { key: 'date', label: 'Fecha', type: 'text' },
            { key: 'credential', label: 'URL de Credencial', type: 'url' }
          ]}
        />;
      case 'security':
        return <SecurityEditor />;
      default:
        return null;
    }
  };

  // Componente para cambiar contraseña
  const SecurityEditor = () => {
    const [passwords, setPasswords] = useState({
      current: '',
      new: '',
      confirm: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChangePassword = async (e) => {
      e.preventDefault();
      
      if (passwords.new !== passwords.confirm) {
        showError('Las contraseñas nuevas no coinciden');
        return;
      }

      if (passwords.new.length < 6) {
        showError('La nueva contraseña debe tener al menos 6 caracteres');
        return;
      }

      setIsLoading(true);
      const result = await changePassword(passwords.current, passwords.new);
      setIsLoading(false);

      if (result.success) {
        showSuccess('Contraseña actualizada correctamente');
        setPasswords({ current: '', new: '', confirm: '' });
      } else {
        showError(result.error || 'Error al cambiar la contraseña');
      }
    };

    return (
      <div className="security-editor">
        <h3>Cambiar Contraseña</h3>
        <p className="section-description">
          Actualiza tu contraseña de administrador para mantener tu portafolio seguro
        </p>

        <form onSubmit={handleChangePassword} className="editor-form">
          <div className="form-group">
            <label>Contraseña Actual</label>
            <input
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              placeholder="Ingresa tu contraseña actual"
              required
            />
          </div>

          <div className="form-group">
            <label>Nueva Contraseña</label>
            <input
              type="password"
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label>Confirmar Nueva Contraseña</label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              placeholder="Repite la nueva contraseña"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            <FaKey /> {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
          </button>
        </form>

        <div className="security-info">
          <h4>💡 Consejos de Seguridad</h4>
          <ul>
            <li>Usa al menos 8 caracteres</li>
            <li>Combina letras mayúsculas y minúsculas</li>
            <li>Incluye números y símbolos especiales</li>
            <li>No uses información personal obvia</li>
            <li>Cambia tu contraseña regularmente</li>
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Panel de Administración</h1>
        <div className="header-actions">
          <button onClick={handleViewPortfolio} className="btn btn-secondary">
            <FaEye /> Ver Portafolio
          </button>
          <button onClick={handleLogout} className="btn btn-danger">
            <FaSignOutAlt /> Cerrar Sesión
          </button>
        </div>
      </div>

      {successMessage && (
        <motion.div
          className="success-banner"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          ✅ {successMessage}
        </motion.div>
      )}

      {errorMessage && (
        <motion.div
          className="error-banner"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          ❌ {errorMessage}
        </motion.div>
      )}

      <div className="dashboard-content">
        <div className="sidebar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        <div className="main-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
