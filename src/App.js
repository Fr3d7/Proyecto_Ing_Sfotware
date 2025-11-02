import React, { useState, useEffect, useRef } from 'react';
import GanttChartExample from './components/GanttChartExample';
import './App.css';

// URL base de la API
const API_BASE_URL = 'http://localhost:5000/api';

const LoginRegister = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Verificar si hay una sesión guardada al cargar la aplicación
    const savedAuth = localStorage.getItem('isAuthenticated');
    return savedAuth === 'true';
  });
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    contrasena: '',
    confirmarcontrasena: ''
  });



  



  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [loginError, setLoginError] = useState('');
  const [projects, setProjects] = useState([]);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectStartDate, setNewProjectStartDate] = useState('');
  const [newProjectEndDate, setNewProjectEndDate] = useState('');
  const [newProjectCreator, setNewProjectCreator] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeSection, setActiveSection] = useState('resumen');
  const [epics, setEpics] = useState([]);
  const [userStories, setUserStories] = useState([]);
  const [showNewEpicModal, setShowNewEpicModal] = useState(false);
  const [showNewStoryModal, setShowNewStoryModal] = useState(false);
  const [selectedEpic, setSelectedEpic] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [newItemData, setNewItemData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    epicId: null,
    responsable: '',
    status: 'Por hacer',
    storyPoints: ''
  });
  const [timeScale, setTimeScale] = useState('months');
  const [ganttStartDate, setGanttStartDate] = useState(null);
  const [ganttEndDate, setGanttEndDate] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDependencies, setTaskDependencies] = useState([]);
  const [expandedEpics, setExpandedEpics] = useState({});
  const [sprints, setSprints] = useState([]);
  const [showNewSprintModal, setShowNewSprintModal] = useState(false);
  const [newSprintName, setNewSprintName] = useState('');
  const [newSprintStartDate, setNewSprintStartDate] = useState('');
  const [newSprintEndDate, setNewSprintEndDate] = useState('');
  const [editingSprint, setEditingSprint] = useState(null);
  // Prevent initial overwrite when loading saved sprints
  const isFirstSprintRender = useRef(true);
  // Sprint selection for Kanban board
  const [selectedSprintId, setSelectedSprintId] = useState('');
  const [currentUser, setCurrentUser] = useState(() => localStorage.getItem('currentUser') || null);

  // Render functions for each section
  const renderLoginForm = () => {
    return (
      <div className="auth-container">
        <h2>{isLogin ? 'Login' : 'Registro'}</h2>
        {loginError && <div className="alert alert-danger">{loginError}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}
        <form onSubmit={isLogin ? handleLogin : handleRegister}>
          {/* Registro requiere nombre */}
          {!isLogin && <input required type="text" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} />}
          {errors.nombre && <div className="alert alert-danger">{errors.nombre}</div>}
          <input required type="email" name="correo" placeholder="Correo" value={formData.correo} onChange={handleChange} />
          {errors.correo && <div className="alert alert-danger">{errors.correo}</div>}
          <input required type="password" name="contrasena" placeholder="contrasena" value={formData.contrasena} onChange={handleChange} />
          {errors.contrasena && <div className="alert alert-danger">{errors.contrasena}</div>}
          {!isLogin && <input required type="password" name="confirmarcontrasena" placeholder="Confirmar contrasena" value={formData.confirmarcontrasena} onChange={handleChange} />}
          {errors.confirmarcontrasena && <div className="alert alert-danger">{errors.confirmarcontrasena}</div>}
          <button className="btn btn-primary" type="submit">{isLogin ? 'Entrar' : 'Registrar'}</button>
        </form>
        <p onClick={toggleForm} style={{ cursor: 'pointer', marginTop: '1rem', color: '#007bff' }}>
          {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </p>
      </div>
    );
  };
  
  const renderProjectList = () => {
    return (
      <div className="project-list">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Proyectos</h2>
          <div>
            <button className="btn btn-primary" onClick={() => setShowNewProjectModal(true)}>Nuevo Proyecto</button>
            <button className="btn btn-secondary" style={{ marginLeft: '0.5rem' }} onClick={handleLogout}>Cerrar Sesión</button>
          </div>
        </div>
        <ul>
          {projects.filter(p => p.creator === currentUser).map(p => (
            <li key={p.id} className="project-card">
              <div onClick={() => setSelectedProject(p)} style={{ cursor: 'pointer' }}>
                <h3>{p.name}</h3>
                <p>{p.description}</p>
                <p>Creado: {new Date(p.createdAt).toLocaleDateString()}</p>
                <p>Inicio: {p.startDate} | Fin: {p.endDate}</p>
                <p>Creador: {p.creator}</p>
              </div>
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-primary" onClick={() => setSelectedProject(p)}>Ver Detalles</button>
                <button className="btn btn-secondary" onClick={() => handleEditProject(p)}>Editar</button>
                <button className="btn btn-danger" onClick={() => handleDeleteProject(p.id)}>Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  const renderNewProjectModal = () => {
    if (!showNewProjectModal) return null;
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Nuevo Proyecto</h2>
          <form>
            <div className="form-group">
              <label>Nombre</label>
              <input value={newProjectName} onChange={e => setNewProjectName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea value={newProjectDescription} onChange={e => setNewProjectDescription(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Fecha Inicio</label>
              <input type="date" value={newProjectStartDate} onChange={e => setNewProjectStartDate(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Fecha Fin</label>
              <input type="date" value={newProjectEndDate} onChange={e => setNewProjectEndDate(e.target.value)} required />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={handleCreateProject}>Guardar</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowNewProjectModal(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  const renderEditProjectModal = () => {
    if (!showEditProjectModal) return null;
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Editar Proyecto</h2>
          <form>
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea
                value={newProjectDescription}
                onChange={e => setNewProjectDescription(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Fecha Inicio</label>
              <input
                type="date"
                value={newProjectStartDate}
                onChange={e => setNewProjectStartDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Fecha Fin</label>
              <input
                type="date"
                value={newProjectEndDate}
                onChange={e => setNewProjectEndDate(e.target.value)}
                required
              />
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleUpdateProject}
              >
                Actualizar
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowEditProjectModal(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Modal para crear/editar épica
  const renderNewEpicModal = () => {
    if (!showNewEpicModal) return null;
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>{editingItem?.type === 'epic' ? 'Editar Épica' : 'Nueva Épica'}</h2>
          <form onSubmit={handleSubmitEpic}>
            <div className="form-group">
              <label>Nombre</label>
              <input type="text" className="form-control" value={newItemData.title} onChange={e => setNewItemData(prev => ({ ...prev, title: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Detalles</label>
              <textarea className="form-control" value={newItemData.description} onChange={e => setNewItemData(prev => ({ ...prev, description: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Estado</label>
              <select className="form-control" value={newItemData.status} onChange={e => setNewItemData(prev => ({ ...prev, status: e.target.value }))} required>
                <option value="Por hacer">Por hacer</option>
                <option value="En curso">En curso</option>
                <option value="Finalizada">Finalizada</option>
              </select>
            </div>
            <div className="form-group">
              <label>Fecha Inicio</label>
              <input type="date" className="form-control" value={newItemData.startDate} onChange={e => setNewItemData(prev => ({ ...prev, startDate: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Fecha Fin</label>
              <input type="date" className="form-control" value={newItemData.endDate} onChange={e => setNewItemData(prev => ({ ...prev, endDate: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>A cargo de</label>
              <input type="text" className="form-control" value={newItemData.responsable} onChange={e => setNewItemData(prev => ({ ...prev, responsable: e.target.value }))} required />
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn btn-primary">{editingItem ? 'Actualizar' : 'Crear'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowNewEpicModal(false); setEditingItem(null); setNewItemData({ title: '', description: '', startDate: '', endDate: '', epicId: null, responsable: '', status: 'Por hacer', storyPoints: '' }); }}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  // Modal para crear/editar historia de usuario
  const renderNewStoryModal = () => {
    if (!showNewStoryModal) return null;
    const projectEpics = epics.filter(e => e.projectId === selectedProject?.id);
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>{editingItem?.type === 'story' ? 'Editar Historia' : 'Nueva Historia'}</h2>
          <form onSubmit={handleSubmitStory}>
            <div className="form-group">
              <label>Nombre</label>
              <input type="text" className="form-control" value={newItemData.title} onChange={e => setNewItemData(prev => ({ ...prev, title: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Detalles</label>
              <textarea className="form-control" value={newItemData.description} onChange={e => setNewItemData(prev => ({ ...prev, description: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Fecha Inicio</label>
              <input type="date" className="form-control" value={newItemData.startDate} onChange={e => setNewItemData(prev => ({ ...prev, startDate: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Fecha Fin</label>
              <input type="date" className="form-control" value={newItemData.endDate} onChange={e => setNewItemData(prev => ({ ...prev, endDate: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>A cargo de</label>
              <input type="text" className="form-control" value={newItemData.responsable} onChange={e => setNewItemData(prev => ({ ...prev, responsable: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Épica</label>
              <select className="form-control" value={newItemData.epicId || ''} onChange={e => setNewItemData(prev => ({ ...prev, epicId: e.target.value }))} required>
                <option value="">Seleccione Epic</option>
                {projectEpics.map(epic => <option key={epic.id} value={epic.id}>{epic.title}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Estado</label>
              <select className="form-control" value={newItemData.status} onChange={e => setNewItemData(prev => ({ ...prev, status: e.target.value }))} required>
                <option value="Por hacer">Por hacer</option>
                <option value="En curso">En curso</option>
                <option value="Finalizada">Finalizada</option>
              </select>
            </div>
            <div className="form-group">
              <label>Puntos de Historia</label>
              <input type="number" className="form-control" value={newItemData.storyPoints} onChange={e => setNewItemData(prev => ({ ...prev, storyPoints: e.target.value }))} min="0" />
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn btn-primary">{editingItem ? 'Actualizar' : 'Crear'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowNewStoryModal(false); setEditingItem(null); setNewItemData({ title: '', description: '', startDate: '', endDate: '', epicId: null, responsable: '', status: 'Por hacer', storyPoints: '' }); }}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderProjectDetailView = () => {
    // Filtrar datos por proyecto
    const projectEpics = epics.filter(e => e.projectId === selectedProject?.id);
    const projectStories = userStories.filter(s => projectEpics.some(e => e.id === s.epicId));
    const projectSprints = sprints.filter(sp => sp.projectId === selectedProject?.id);
    const stats = getProjectStats(projectEpics, projectStories);
    return (
      <div className="project-detail">
        <div className="detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>{selectedProject.name}</h2>
          <button className="btn btn-secondary" onClick={() => setSelectedProject(null)}>Volver a Proyectos</button>
        </div>
        <div className="detail-nav">
          <button className={`tab-button ${activeSection==='resumen'?'active':''}`} onClick={() => setActiveSection('resumen')}>Resumen</button>
          <button className={`tab-button ${activeSection==='cronograma'?'active':''}`} onClick={() => { setActiveSection('cronograma'); setSelectedSprintId(''); }}>Cronograma</button>
          <button className={`tab-button ${activeSection==='backlog'?'active':''}`} onClick={() => setActiveSection('backlog')}>Backlog</button>
          <button className={`tab-button ${activeSection==='tablero'?'active':''}`} onClick={() => setActiveSection('tablero')}>Tablero</button>
        </div>
        {activeSection === 'resumen' && (
          <div className="section-card">
            <h2>Resumen</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div style={cardStyle}>
                <h3 style={cardHeaderStyle}>Épicas</h3>
                <p style={cardValueStyle}>{projectEpics.length}</p>
              </div>
              <div style={cardStyle}>
                <h3 style={cardHeaderStyle}>Historias</h3>
                <p style={cardValueStyle}>{projectStories.length}</p>
              </div>
              <div style={cardStyle}>
                <h3 style={cardHeaderStyle}>Sprints</h3>
                <p style={cardValueStyle}>{projectSprints.length}</p>
              </div>
              <div style={cardStyle}>
                <h3 style={cardHeaderStyle}>Completadas</h3>
                <p style={cardValueStyle}>{stats.completed}</p>
              </div>
              <div style={cardStyle}>
                <h3 style={cardHeaderStyle}>En curso</h3>
                <p style={cardValueStyle}>{stats.updated}</p>
              </div>
              <div style={cardStyle}>
                <h3 style={cardHeaderStyle}>Creadas</h3>
                <p style={cardValueStyle}>{stats.created}</p>
              </div>
              <div style={cardStyle}>
                <h3 style={cardHeaderStyle}>Por vencer</h3>
                <p style={cardValueStyle}>{stats.dueNext}</p>
              </div>
            </div>
          </div>
        )}
        {activeSection === 'cronograma' && (
          <div className="section-card">
            <h2>Cronograma</h2>
            {/* Controles de escala de tiempo */}
            <div style={{ marginBottom: '1rem', display: 'inline-flex', justifyContent: 'center', gap: '0.5rem' }}>
              <button type="button" className={`btn btn-outline-primary btn-sm ${timeScale === 'days' ? 'active' : ''}`} onClick={() => handleTimeScaleChange('days')}>Días</button>
              <button type="button" className={`btn btn-outline-primary btn-sm ${timeScale === 'weeks' ? 'active' : ''}`} onClick={() => handleTimeScaleChange('weeks')}>Semanas</button>
              <button type="button" className={`btn btn-outline-primary btn-sm ${timeScale === 'months' ? 'active' : ''}`} onClick={() => handleTimeScaleChange('months')}>Meses</button>
              <button type="button" className={`btn btn-outline-primary btn-sm ${timeScale === 'quarters' ? 'active' : ''}`} onClick={() => handleTimeScaleChange('quarters')}>Trimestres</button>
            </div>
            {/* Botones de creación */}
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => { setEditingItem(null); setNewItemData({ title:'', description:'', startDate:'', endDate:'', epicId:null, responsable:'', status:'Por hacer', storyPoints:'' }); setShowNewEpicModal(true); }}>Nueva Épica</button>
              <button className="btn btn-primary" onClick={() => { setEditingItem(null); setNewItemData({ title:'', description:'', startDate:'', endDate:'', epicId:null, responsable:'', status:'Por hacer', storyPoints:'' }); setShowNewStoryModal(true); }}>Nueva Historia</button>
            </div>
            {renderGanttChart(projectEpics, projectStories)}
          </div>
        )}
        {activeSection === 'backlog' && (
          <div className="section-card">
            <h2>Backlog</h2>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button className="btn btn-primary" onClick={() => setShowNewSprintModal(true)}>Nuevo Sprint</button>
            </div>
            <ul className="backlog-list">
              {projectStories.filter(s => !s.sprintId).map(s => (
                <li
                    key={s.id}
                    className="story-card backlog-item"
                    draggable
                    onDragStart={(e) => handleDragStart(e, s.id)}>
                  <div>
                    <strong>{s.title}</strong>
                  </div>
                  <div>
                    Responsable: <em>{s.responsable}</em> | Estado: <em>{s.status}</em> | Puntos: <span className="story-points">{s.storyPoints}</span>
                  </div>
                </li>
              ))}
            </ul>
            <h3>Sprints</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {projectSprints.map(sp => (
                <div key={sp.id}
                     className="sprint-card"
                     style={{ minWidth: '200px' }}
                     onDragOver={handleDragOver}
                     onDragEnter={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
                     onDragLeave={(e) => { e.currentTarget.classList.remove('drag-over'); }}
                     onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); handleDrop(e, sp.id); }}>
                  <h4>{sp.name}</h4>
                  <p>{sp.startDate} - {sp.endDate}</p>
                  <button className="btn btn-danger" onClick={() => handleDeleteSprint(sp.id)}>Eliminar Sprint</button>
                  <ul>
                    {projectStories.filter(s => s.sprintId === sp.id).map(s => (
                      <li key={s.id} className="sprint-story-item">
                        <div className="sprint-story-header">
                          <strong>{s.title}</strong>
                        </div>
                        <div className="sprint-story-details">
                          <p><em>{s.description}</em></p>
                          <p>Responsable: {s.responsable} | Estado: {s.status} | Puntos: {s.storyPoints}</p>
                          <p>Inicio: {s.startDate} | Fin: {s.endDate}</p>
                        </div>
                        <div className="sprint-story-footer">
                          <button className="btn btn-link btn-sm text-danger" onClick={() => handleRemoveFromSprint(s.id)}>Eliminar</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeSection === 'tablero' && (
          <div className="section-card">
            <h2>Tablero</h2>
            {/* Selección de Sprint para Kanban */}
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label htmlFor="sprintBoardFilter" style={{ margin: 0, fontWeight: 500 }}>Sprint:</label>
              <select id="sprintBoardFilter" className="form-select form-select-sm" style={{ width: '200px' }}
                      value={selectedSprintId} onChange={e => setSelectedSprintId(e.target.value)}>
                <option value="">Todos los Sprints</option>
                {projectSprints.map(sp => (
                  <option key={sp.id} value={sp.id}>{sp.name}</option>
                ))}
              </select>
            </div>
            {/* Tablero Kanban filtrado por sprint */}
            {(() => {
              const boardStories = selectedSprintId
                ? projectStories.filter(s => s.sprintId === selectedSprintId)
                : projectStories;
              return (
                <div className="kanban-board">
                  {['Por hacer','En curso','Finalizada'].map(status => (
                    <div key={status} className={`kanban-column ${status.toLowerCase().replace(' ','-')}`}>
                      <h3 className="kanban-column-header">{status}</h3>
                      {boardStories.filter(s => s.status === status).map(s => (
                        <div key={s.id} className="kanban-card">{s.title}</div>
                      ))}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    );
  };
  const toggleEpic = id => {
    setExpandedEpics(prev => ({ ...prev, [id]: !prev[id] }));
  };
  // Editar épica: cargo datos al formulario y abro modal
  const handleEditEpic = epic => {
    setEditingItem(epic);
    setNewItemData({
      title: epic.title,
      description: epic.description,
      startDate: epic.startDate,
      endDate: epic.endDate,
      epicId: epic.id,
      responsable: epic.responsable || '',
      status: epic.status || 'Por hacer',
      storyPoints: epic.storyPoints || ''
    });
    setShowNewEpicModal(true);
  };
  // Editar historia: cargo datos al formulario y abro modal
  const handleEditStory = story => {
    setEditingItem(story);
    setNewItemData({
      title: story.title,
      description: story.description,
      startDate: story.startDate,
      endDate: story.endDate,
      epicId: story.epicId,
      responsable: story.responsable,
      status: story.status,
      storyPoints: story.storyPoints
    });
    setShowNewStoryModal(true);
  };

  // {{ edit_1 }}: estilos de "card" reutilizables
  const cardStyle = {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  };
  const cardHeaderStyle = {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
    color: '#2d3748'
  };
  const cardValueStyle = {
    margin: '0.5rem 0',
    fontSize: '2rem',
    fontWeight: 700,
    color: '#4a90e2'
  };

  const resetProjectForm = () => {
    setNewProjectName('');
    setNewProjectDescription('');
    setNewProjectStartDate('');
    setNewProjectEndDate('');
    setNewProjectCreator('');
  };

  useEffect(() => {
    // Cargar proyectos del localStorage al iniciar
    const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    setProjects(savedProjects);
  }, []);

  useEffect(() => {
    // Cargar épicas y historias guardadas
    const savedEpics = JSON.parse(localStorage.getItem('epics') || '[]');
    const savedStories = JSON.parse(localStorage.getItem('userStories') || '[]');
    setEpics(savedEpics);
    setUserStories(savedStories);
  }, []);

  useEffect(() => {
    // Load saved project and section on mount when projects are loaded
    const savedProjectId = localStorage.getItem('selectedProjectId');
    if (savedProjectId && projects.length) {
      const proj = projects.find(p => p.id.toString() === savedProjectId);
      if (proj) setSelectedProject(proj);
    }
    const savedSection = localStorage.getItem('activeSection');
    if (savedSection) setActiveSection(savedSection);
  }, [projects]);

  // Persist selected project ID
  useEffect(() => {
    if (selectedProject) {
      localStorage.setItem('selectedProjectId', selectedProject.id);
    } else {
      localStorage.removeItem('selectedProjectId');
    }
  }, [selectedProject]);

  // Persist active tab section
  useEffect(() => {
    localStorage.setItem('activeSection', activeSection);
  }, [activeSection]);

  useEffect(() => {
    // Load saved sprints from localStorage
    const savedSprints = JSON.parse(localStorage.getItem('sprints') || '[]');
    setSprints(savedSprints);
  }, []);

  // Persist sprints to localStorage whenever they change (skip initial mount)
  useEffect(() => {
    if (isFirstSprintRender.current) {
      isFirstSprintRender.current = false;
      return;
    }
    localStorage.setItem('sprints', JSON.stringify(sprints));
  }, [sprints]);

  const calculateGanttDates = () => {
    if (!epics.length) return;
    
    const allDates = [
      ...epics.map(epic => new Date(epic.startDate)),
      ...epics.map(epic => new Date(epic.endDate)),
      ...userStories.map(story => new Date(story.startDate)),
      ...userStories.map(story => new Date(story.endDate))
    ];
    
    const minDate = new Date(Math.min(...allDates));
    const maxDate = new Date(Math.max(...allDates));
    
    // Ajustar las fechas según la escala de tiempo
    if (timeScale === 'days') {
      minDate.setDate(minDate.getDate() - 7);
      maxDate.setDate(maxDate.getDate() + 7);
    } else if (timeScale === 'weeks') {
      minDate.setDate(minDate.getDate() - 14);
      maxDate.setDate(maxDate.getDate() + 14);
    } else if (timeScale === 'months') {
      minDate.setMonth(minDate.getMonth() - 1);
      maxDate.setMonth(maxDate.getMonth() + 1);
    } else if (timeScale === 'quarters') {
      minDate.setMonth(minDate.getMonth() - 3);
      maxDate.setMonth(maxDate.getMonth() + 3);
    }
    
    setGanttStartDate(minDate);
    setGanttEndDate(maxDate);
  };

  useEffect(() => {
    calculateGanttDates();
  }, [epics, userStories, timeScale]);

  const getTimeUnits = () => {
    if (!ganttStartDate || !ganttEndDate) return [];
    
    const units = [];
    const currentDate = new Date(ganttStartDate);
    
    while (currentDate <= ganttEndDate) {
      units.push(new Date(currentDate));
      
      if (timeScale === 'days') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (timeScale === 'weeks') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (timeScale === 'months') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else if (timeScale === 'quarters') {
        currentDate.setMonth(currentDate.getMonth() + 3);
      }
    }
    
    return units;
  };

  const handleTimeScaleChange = (scale) => {
    setTimeScale(scale);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleItemClick = (item) => {
    setSelectedTask(item);
    if (item.type === 'epic') {
      setSelectedEpic(item.id);
    }
  };

  const handleAddDependency = (fromTask, toTask) => {
    const newDependency = {
      id: Date.now(),
      from: fromTask.id,
      to: toTask.id,
      type: fromTask.type
    };
    
    setTaskDependencies([...taskDependencies, newDependency]);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!isLogin) {
      if (!formData.nombre.trim()) {
        newErrors.nombre = 'El nombre es requerido';
      }
    }
    
    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      newErrors.correo = 'El correo no es válido';
    }
    
    if (!formData.contrasena) {
      newErrors.contrasena = 'La contrasena es requerida';
    } else if (!isLogin && formData.contrasena.length < 8) {
      newErrors.contrasena = 'La contrasena debe tener al menos 8 caracteres';
    }

    if (!isLogin) {
      if (!formData.confirmarcontrasena) {
        newErrors.confirmarcontrasena = 'Debes confirmar tu contrasena';
      } else if (formData.contrasena !== formData.confirmarcontrasena) {
        newErrors.confirmarcontrasena = 'Las contrasenas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar errores cuando el usuario escribe
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    setLoginError('');
  };

  
const handleLogin = async (e) => {
  e.preventDefault();
  setLoginError('');
  setSuccessMessage('');

  if (validateForm()) {
    try {
      const response = await fetch(`${API_BASE_URL}/Usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: formData.correo.trim().toLowerCase(),
          contrasena: formData.contrasena.trim()
        })
      });

      // Mejor manejo de errores HTTP
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || 
                           (response.status === 404 ? 'Endpoint no encontrado. Verifica que el servidor tenga el endpoint /api/Usuarios/login' : 
                            response.status === 401 ? 'Correo o contraseña incorrectos' : 
                            `Error del servidor: ${response.status} ${response.statusText}`);
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Validar que la respuesta tenga la estructura esperada
      if (!data || !data.usuario || !data.usuario.correo) {
        throw new Error('Respuesta del servidor inválida');
      }

      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
      setCurrentUser(data.usuario.correo);
      localStorage.setItem('currentUser', data.usuario.correo);
      setSuccessMessage('Inicio de sesión exitoso!');
      setFormData({ nombre: '', correo: '', contrasena: '', confirmarcontrasena: '' });
    } catch (error) {
      console.error("❌ Error de red o servidor:", error);
      console.error("Detalles del error:", {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      // Mostrar mensaje de error más específico
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        setLoginError("No se pudo conectar con el servidor. Verifica que el servidor esté corriendo en http://localhost:5000");
      } else if (error.message.includes('Endpoint no encontrado')) {
        setLoginError(error.message);
      } else {
        setLoginError(error.message || "No se pudo conectar con el servidor. Intenta más tarde.");
      }
    }
  }
};


  
  const handleRegister = async (e) => {
  e.preventDefault();
  setSuccessMessage('');
  setLoginError('');

  if (validateForm()) {
    try {
      const response = await fetch(`${API_BASE_URL}/Usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          correo: formData.correo.trim().toLowerCase(),
          contrasena: formData.contrasena.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || 'Error al registrar usuario';
        throw new Error(errorMessage);
      }

      setSuccessMessage('Usuario registrado exitosamente!');
      setFormData({ nombre: '', correo: '', contrasena: '', confirmarcontrasena: '' });
      setIsLogin(true);
    } catch (error) {
      console.error("❌ Error de red o servidor:", error);
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        setLoginError("No se pudo conectar con el servidor. Verifica que el servidor esté corriendo en http://localhost:5000");
      } else {
        setLoginError(error.message || "No se pudo conectar con el servidor. Intenta más tarde.");
      }
    }
  }
};


  const handleLogout = () => {
    setIsAuthenticated(false);
    // Eliminar el estado de autenticación al cerrar sesión
    localStorage.removeItem('isAuthenticated');
    // Eliminar usuario actual
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setFormData({ nombre: '', correo: '', contrasena: '', confirmarcontrasena: '' });
  };

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      const newProject = {
        id: Date.now(),
        name: newProjectName,
        description: newProjectDescription,
        startDate: newProjectStartDate,
        endDate: newProjectEndDate,
        creator: currentUser,
        createdAt: new Date().toISOString()
      };
      
      const updatedProjects = [...projects, newProject];
      setProjects(updatedProjects);
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
      setNewProjectName('');
      setNewProjectDescription('');
      setNewProjectStartDate('');
      setNewProjectEndDate('');
      setShowNewProjectModal(false);
    }
  };

  const handleDeleteProject = (projectId) => {
    const updatedProjects = projects.filter(project => project.id !== projectId);
    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setNewProjectName(project.name);
    setNewProjectDescription(project.description);
    setNewProjectStartDate(project.startDate);
    setNewProjectEndDate(project.endDate);
    setNewProjectCreator(project.creator);
    setShowEditProjectModal(true);
  };

  const handleUpdateProject = () => {
    if (editingProject) {
      const updatedProjects = projects.map(project => {
        if (project.id === editingProject.id) {
          return {
            ...project,
            name: newProjectName,
            description: newProjectDescription,
            startDate: newProjectStartDate,
            endDate: newProjectEndDate,
            creator: currentUser
          };
        }
        return project;
      });
      setProjects(updatedProjects);
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
      setShowEditProjectModal(false);
      setEditingProject(null);
      resetProjectForm();
    }
  };

  const getProjectStatus = (project) => {
    const today = new Date();
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);

    if (today < startDate) return 'No iniciado';
    if (today > endDate) return 'Finalizado';
    return 'En proceso';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'No iniciado': return '#6c757d';
      case 'En proceso': return '#4a90e2';
      case 'Finalizado': return '#28a745';
      default: return '#6c757d';
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({ nombre: '', correo: '', contrasena: '', confirmarcontrasena: '' });
    setErrors({});
    setSuccessMessage('');
    setLoginError('');
  };

  const handleCreateEpic = (epicData) => {
    const newEpic = {
      ...epicData,
      projectId: selectedProject?.id,
      id: Date.now().toString(),
      type: 'epic',
      createdAt: new Date().toISOString()
    };
    
    const updatedEpics = [...epics, newEpic];
    setEpics(updatedEpics);
    localStorage.setItem('epics', JSON.stringify(updatedEpics));
  };

  const handleCreateUserStory = (storyData) => {
    const newStory = {
      ...storyData,
      id: Date.now().toString(),
      epicId: storyData.epicId,
      type: 'story',
      storyPoints: storyData.storyPoints,
      createdAt: new Date().toISOString(),
      sprintId: null
    };
    
    const updatedStories = [...userStories, newStory];
    setUserStories(updatedStories);
    localStorage.setItem('userStories', JSON.stringify(updatedStories));
  };

  const handleUpdateItem = (itemData) => {
    if (editingItem.type === 'epic') {
      const updatedEpics = epics.map(epic => 
        epic.id === editingItem.id ? { ...epic, ...itemData } : epic
      );
      setEpics(updatedEpics);
      localStorage.setItem('epics', JSON.stringify(updatedEpics));
    } else {
      const updatedStories = userStories.map(story =>
        story.id === editingItem.id ? { ...story, ...itemData } : story
      );
      setUserStories(updatedStories);
      localStorage.setItem('userStories', JSON.stringify(updatedStories));
    }
  };

  const handleDeleteItem = (item) => {
    if (item.type === 'epic') {
      const updatedEpics = epics.filter(epic => epic.id !== item.id);
      const updatedStories = userStories.filter(story => story.epicId !== item.id);
      setEpics(updatedEpics);
      setUserStories(updatedStories);
      localStorage.setItem('epics', JSON.stringify(updatedEpics));
      localStorage.setItem('userStories', JSON.stringify(updatedStories));
    } else {
      const updatedStories = userStories.filter(story => story.id !== item.id);
      setUserStories(updatedStories);
      localStorage.setItem('userStories', JSON.stringify(updatedStories));
    }
  };

  // Funciones auxiliares para el diagrama de Gantt
  const getMonthsBetweenDates = () => {
    if (epics.length === 0) return [];
    
    let minDate = new Date(Math.min(...epics.map(epic => new Date(epic.startDate))));
    let maxDate = new Date(Math.max(...epics.map(epic => new Date(epic.endDate))));
    
    const months = [];
    const currentDate = new Date(minDate);
    
    while (currentDate <= maxDate) {
      months.push(new Date(currentDate));
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return months;
  };

  const calculatePosition = (date, startDate, totalDays) => {
    const days = Math.ceil(Math.abs(new Date(date) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    return (days / totalDays) * 100;
  };

  const calculateWidth = (startDate, endDate, totalDays) => {
    const duration = Math.ceil(Math.abs(new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    return (duration / totalDays) * 100;
  };

  const getMonthsArray = () => {
    const months = getMonthsBetweenDates();
    return months;
  };

  const styles = {
    ganttChart: {
      position: 'relative',
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '2rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      height: 'calc(100vh - 300px)',
      overflow: 'auto'
    },
    ganttHeader: {
      display: 'flex',
      borderBottom: '1px solid #e2e8f0',
      position: 'sticky',
      top: 0,
      backgroundColor: 'white',
      zIndex: 10
    },
    monthHeader: {
      flex: '1 0 120px',
      padding: '1rem',
      textAlign: 'center',
      color: '#4a5568',
      fontWeight: 500,
      fontSize: '0.875rem',
      borderRight: '1px solid #e2e8f0'
    },
    ganttBody: {
      position: 'relative',
      minWidth: '800px'
    },
    ganttRow: {
      position: 'relative',
      marginBottom: '1.5rem'
    },
    ganttBar: {
      position: 'absolute',
      height: '30px',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      paddingLeft: '8px',
      color: 'white',
      fontSize: '0.875rem',
      fontWeight: 500,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    epicBar: {
      backgroundColor: '#4a90e2',
      zIndex: 3
    },
    storyBar: {
      backgroundColor: '#63b3ed',
      height: '24px',
      marginTop: '8px',
      marginLeft: '16px',
      zIndex: 2
    }
  };

  const renderGanttChart = (epicsList, storiesList) => {
    // Calcular rango de fechas basado en épicas e historias del proyecto
    const allDates = [
      ...epicsList.flatMap(e => [new Date(e.startDate), new Date(e.endDate)]),
      ...storiesList.flatMap(s => [new Date(s.startDate), new Date(s.endDate)])
    ];
    if (allDates.length === 0) return null;
    let minDate = new Date(Math.min(...allDates));
    let maxDate = new Date(Math.max(...allDates));
    // Ajustar márgenes según escala de tiempo
    if (timeScale === 'days') {
      minDate.setDate(minDate.getDate() - 7);
      maxDate.setDate(maxDate.getDate() + 7);
    } else if (timeScale === 'weeks') {
      minDate.setDate(minDate.getDate() - 14);
      maxDate.setDate(maxDate.getDate() + 14);
    } else if (timeScale === 'months') {
      minDate.setMonth(minDate.getMonth() - 1);
      maxDate.setMonth(maxDate.getMonth() + 1);
    } else if (timeScale === 'quarters') {
      minDate.setMonth(minDate.getMonth() - 3);
      maxDate.setMonth(maxDate.getMonth() + 3);
    }
    // Generar unidades de tiempo
    const units = [];
    const curr = new Date(minDate);
    while (curr <= maxDate) {
      units.push(new Date(curr));
      if (timeScale === 'days') curr.setDate(curr.getDate() + 1);
      else if (timeScale === 'weeks') curr.setDate(curr.getDate() + 7);
      else if (timeScale === 'months') curr.setMonth(curr.getMonth() + 1);
      else if (timeScale === 'quarters') curr.setMonth(curr.getMonth() + 3);
    }
    const startDate = units[0];
    const endDate = units[units.length - 1];
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    return (
      <div style={styles.ganttChart}>
        {/* Header row: Descripción and time units */}
        <div style={styles.ganttHeader}>
          <div style={{ width: '180px', flexShrink: 0, padding: '1rem 0.5rem', textAlign: 'left', borderRight: '1px solid #e2e8f0', fontWeight: 600, color: '#4a5568' }}>
            Descripción
          </div>
          {units.map((u,i) => (
            <div key={i} style={styles.monthHeader}>
              {timeScale === 'months'
                ? `${u.toLocaleString('default',{ month: 'short' })} ${u.getFullYear()}`
                : u.toLocaleDateString()
              }
            </div>
          ))}
        </div>
        <div style={styles.ganttBody}>
          {/* Static red divider, no moving line */}
          {/* épicas y sus historias filtradas */}
          {epicsList.map(epic => {
            const storyRows = storiesList.filter(st => st.epicId === epic.id);
            return (
              <React.Fragment key={epic.id}>
                {/* Epic Row */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', paddingTop: '0.75rem' }}>
                  <div style={{ width: '180px', flexShrink: 0, padding: '0 0.5rem 0 0', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '4px', borderRight: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 500 }}>
                    <button onClick={() => toggleEpic(epic.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a5568' }}>
                      {expandedEpics[epic.id] ? '▼' : '▶'}
                    </button>
                    <span>{epic.title}</span>
                    <span style={{ display: 'inline-flex', gap: '4px' }}>
                      <button onClick={() => handleEditEpic(epic)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a5568' }}>✎</button>
                      <button onClick={() => handleDeleteItem(epic)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a5568' }}>🗑️</button>
                    </span>
                  </div>
                  <div style={{ flex: 1, position: 'relative' }}>
                <div
                  style={{
                        ...styles.ganttBar,
                        ...styles.epicBar,
                        position: 'absolute',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        left: `${calculatePosition(epic.startDate, startDate, totalDays)}%`,
                        width: `${calculateWidth(epic.startDate, epic.endDate, totalDays)}%`
                      }}
                      onClick={() => { setEditingItem(epic); setShowNewEpicModal(true); }}
                    />
              </div>
                </div>
                {/* Story Rows (indented) */}
                {expandedEpics[epic.id] && storyRows.map(story => (
                  <div key={story.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ width: '180px', flexShrink: 0, paddingLeft: '1rem', display: 'flex', alignItems: 'center', gap: '8px', borderRight: '1px solid #e2e8f0', color: '#4a5568' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: story.status === 'Por hacer' ? '#6c757d' : story.status === 'En curso' ? '#4a90e2' : '#28a745' }}></span>
                      <span>{story.title}</span>
                      <span style={{ display: 'inline-flex', gap: '4px' }}>
                        <button onClick={() => handleEditStory(story)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a5568' }}>✎</button>
                        <button onClick={() => handleDeleteItem(story)} style={{ background: 'none', border: 'none', color: '#4a5568', cursor: 'pointer' }}>🗑️</button>
                      </span>
                    </div>
                    <div style={{ flex: 1, position: 'relative' }}>
                    <div
                      style={{
                          ...styles.ganttBar,
                          ...styles.storyBar,
                          marginTop: 0,
                          position: 'absolute',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          left: `${calculatePosition(story.startDate, startDate, totalDays)}%`,
                          width: `${calculateWidth(story.startDate, story.endDate, totalDays)}%`
                        }}
                        onClick={() => { setEditingItem(story); setShowNewStoryModal(true); }}
                      />
                  </div>
            </div>
          ))}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  // {{ edit_4 }}: redefinir getProjectStats para recibir listas filtradas
  const getProjectStats = (epicsList, storiesList) => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    const nextSevenDays = new Date(today);
    nextSevenDays.setDate(today.getDate() + 7);

    const allItems = [
      ...epicsList.map(e => ({ ...e, type: 'epic' })),
      ...storiesList.map(s => ({ ...s, type: 'story' }))
    ];

    return {
      completed: allItems.filter(item => {
        const ed = new Date(item.endDate);
        return ed >= sevenDaysAgo && ed <= today && item.status === 'FINALIZADO';
      }).length,

      updated: allItems.filter(item => item.status === 'EN CURSO').length,

      created: allItems.filter(item => {
        // asumimos que el id de la épica/story es timestamp
        const cd = new Date(parseInt(item.id, 10));
        return cd >= sevenDaysAgo && cd <= today;
      }).length,

      dueNext: allItems.filter(item => {
        const ed = new Date(item.endDate);
        return ed >= today && ed <= nextSevenDays;
      }).length
    };
  };

  const renderNewSprintModal = () => {
    if (!showNewSprintModal) return null;
    const isEditing = Boolean(editingSprint);
    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{ maxWidth: '500px', width: '100%' }}>
          <h2>{isEditing ? 'Editar Sprint' : 'Nuevo Sprint'}</h2>
          <form onSubmit={e => { e.preventDefault(); handleCreateSprint(); }} className="p-3 sprint-form">
            <div className="form-group sprint-name">
              <label htmlFor="sprintName">Nombre de Sprint</label>
              <input id="sprintName" type="text" className="form-control" autoComplete="off" value={newSprintName} onChange={e => setNewSprintName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="sprintStart" className="form-label">Fecha Inicio</label>
              <input id="sprintStart" type="date" className="form-control" value={newSprintStartDate} onChange={e => setNewSprintStartDate(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="sprintEnd" className="form-label">Fecha Fin</label>
              <input id="sprintEnd" type="date" className="form-control" value={newSprintEndDate} onChange={e => setNewSprintEndDate(e.target.value)} required />
            </div>
            <div className="modal-footer sprint-footer">
              <button type="submit" className="btn btn-success me-2">{isEditing ? 'Actualizar' : 'Crear'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowNewSprintModal(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Create and delete sprints
  const handleCreateSprint = () => {
    if (!newSprintName.trim() || !newSprintStartDate || !newSprintEndDate) return;
    const newSprint = {
      id: Date.now().toString(),
      projectId: selectedProject?.id,
      name: newSprintName,
      startDate: newSprintStartDate,
      endDate: newSprintEndDate
    };
    const updated = [...sprints, newSprint];
    setSprints(updated);
    localStorage.setItem('sprints', JSON.stringify(updated));
    setNewSprintName('');
    setNewSprintStartDate('');
    setNewSprintEndDate('');
    setShowNewSprintModal(false);
  };
  const handleDeleteSprint = (sprintId) => {
    const updated = sprints.filter(s => s.id !== sprintId);
    setSprints(updated);
    localStorage.setItem('sprints', JSON.stringify(updated));
  };

  // Drag and drop handlers for assigning stories to sprints
  const handleDragStart = (e, storyId) => {
    e.dataTransfer.setData('storyId', storyId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, sprintId) => {
    e.preventDefault();
    const storyId = e.dataTransfer.getData('storyId');
    const updatedStories = userStories.map(s =>
      s.id === storyId ? { ...s, sprintId } : s
    );
    setUserStories(updatedStories);
    localStorage.setItem('userStories', JSON.stringify(updatedStories));
  };

  // Handler to unassign a story from its sprint
  const handleRemoveFromSprint = (storyId) => {
    const updatedStories = userStories.map(s =>
      s.id === storyId ? { ...s, sprintId: null } : s
    );
    setUserStories(updatedStories);
    localStorage.setItem('userStories', JSON.stringify(updatedStories));
  };

  // Handlers para crear/editar épica e historia de usuario
  const handleSubmitEpic = (e) => {
    e.preventDefault();
    if (editingItem && editingItem.type === 'epic') {
      handleUpdateItem(newItemData);
    } else {
      handleCreateEpic(newItemData);
    }
    setShowNewEpicModal(false);
    setEditingItem(null);
    setNewItemData({ title: '', description: '', startDate: '', endDate: '', epicId: null, responsable: '', status: 'Por hacer', storyPoints: '' });
  };

  const handleSubmitStory = (e) => {
    e.preventDefault();
    if (editingItem && editingItem.type === 'story') {
      handleUpdateItem(newItemData);
    } else {
      handleCreateUserStory(newItemData);
    }
    setShowNewStoryModal(false);
    setEditingItem(null);
    setNewItemData({ title: '', description: '', startDate: '', endDate: '', epicId: null, responsable: '', status: 'Por hacer', storyPoints: '' });
  };

  // 1) Si no estás autenticado → login
  if (!isAuthenticated) {
    return renderLoginForm();
  }

  // 2) Si hay proyecto seleccionado → detalle + modales
  if (selectedProject) {
    return (
      <>
        {renderProjectDetailView()}
        {renderNewSprintModal()}
        {renderNewEpicModal()}
        {renderNewStoryModal()}
      </>
    );
  }

  // 3) Si no, listado de proyectos + modales
  return (
    <>
      {renderProjectList()}
      {renderNewProjectModal()}
      {renderEditProjectModal()}
    </>
  );
};

export default LoginRegister;
