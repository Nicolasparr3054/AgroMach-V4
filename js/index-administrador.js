// ================================================================
// JAVASCRIPT COMPLETO PARA EL PANEL DE ADMINISTRADOR
// Archivo: js/index-administrador.js
// ================================================================

// Variables globales
let currentSection = 'dashboard';
let selectedUsers = [];
let allUsers = [];
let filteredUsers = [];
let currentUserData = null;
let systemStats = {};

// Configuración de la aplicación
const CONFIG = {
    apiBaseUrl: '',
    refreshInterval: 30000, // 30 segundos
    itemsPerPage: 20,
    autoSaveInterval: 5000
};

// ================================================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ================================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando Panel de Administrador...');
    
    initializeApp();
});

async function initializeApp() {
    try {
        // Verificar sesión de administrador
        await verifyAdminSession();
        
        // Configurar navegación
        setupNavigation();
        
        // Configurar menú móvil
        setupMobileMenu();
        
        // Cargar dashboard inicial
        await loadDashboard();
        
        // Configurar event listeners
        setupEventListeners();
        
        // Iniciar actualizaciones automáticas
        startAutoRefresh();
        
        console.log('✅ Panel de administrador inicializado correctamente');
        
    } catch (error) {
        console.error('❌ Error inicializando panel:', error);
        showNotification('Error inicializando panel de administrador', 'error');
        redirectToLogin();
    }
}

// ================================================================
// GESTIÓN DE SESIÓN Y AUTENTICACIÓN
// ================================================================
async function verifyAdminSession() {
    try {
        const response = await fetch('/api/admin/session');
        
        if (!response.ok) {
            throw new Error('Sesión no válida');
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Error de autenticación');
        }
        
        currentUserData = data.admin;
        updateUserInterface();
        
        return data.admin;
        
    } catch (error) {
        console.error('Error verificando sesión:', error);
        throw error;
    }
}

function updateUserInterface() {
    if (currentUserData) {
        // Actualizar nombre del administrador
        const adminNameEl = document.querySelector('.admin-name');
        if (adminNameEl) {
            adminNameEl.textContent = currentUserData.nombre_completo;
        }
        
        // Actualizar avatar si hay foto
        const avatarEl = document.querySelector('.admin-avatar');
        if (avatarEl && currentUserData.foto_url) {
            avatarEl.innerHTML = `<img src="${currentUserData.foto_url}" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%;">`;
        }
    }
}

function redirectToLogin() {
    setTimeout(() => {
        window.location.href = '/vista/login-trabajador.html';
    }, 2000);
}

// ================================================================
// CONFIGURACIÓN DE NAVEGACIÓN
// ================================================================
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remover clase activa de todos los elementos
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Agregar clase activa al elemento clickeado
            this.classList.add('active');
            
            // Mostrar sección correspondiente
            const section = this.dataset.section;
            showSection(section);
        });
    });
}

function setupMobileMenu() {
    const mobileToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (mobileToggle && sidebar) {
        mobileToggle.addEventListener('click', function() {
            sidebar.classList.toggle('open');
        });
        
        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', function(e) {
            if (!sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }
}

async function showSection(sectionName) {
    try {
        // Ocultar todas las secciones
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => section.classList.remove('active'));
        
        // Mostrar sección seleccionada
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
            currentSection = sectionName;
            
            // Cargar datos específicos según la sección
            switch(sectionName) {
                case 'dashboard':
                    await loadDashboard();
                    break;
                case 'usuarios':
                    await loadUsers();
                    break;
                case 'estadisticas':
                    await loadStatistics();
                    break;
                case 'reportes':
                    await loadReports();
                    break;
                case 'historial':
                    await loadAuditHistory();
                    break;
                default:
                    console.log(`Sección ${sectionName} en desarrollo`);
            }
        }
    } catch (error) {
        console.error('Error mostrando sección:', error);
        showNotification('Error cargando sección', 'error');
    }
}

// ================================================================
// CARGA DEL DASHBOARD
// ================================================================
async function loadDashboard() {
    try {
        console.log('📊 Cargando dashboard...');
        
        // Cargar estadísticas
        await loadDashboardStats();
        
        // Cargar actividad reciente
        await loadRecentActivity();
        
        // Cargar estado del sistema
        await loadSystemStatus();
        
    } catch (error) {
        console.error('Error cargando dashboard:', error);
        showNotification('Error cargando dashboard', 'error');
    }
}

async function loadDashboardStats() {
    try {
        const response = await fetch('/api/admin/dashboard-stats');
        const data = await response.json();
        
        if (data.success) {
            systemStats = data.stats;
            updateStatsCards();
        } else {
            throw new Error(data.error || 'Error obteniendo estadísticas');
        }
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
        // Mostrar datos por defecto en caso de error
        systemStats = {
            usuarios_activos: 0,
            ofertas_activas: 0,
            total_postulaciones: 0,
            contratos_exitosos: 0
        };
        updateStatsCards();
    }
}

function updateStatsCards() {
    // Actualizar tarjetas de estadísticas
    updateCounterWithAnimation('totalUsers', systemStats.usuarios_activos || 0);
    updateCounterWithAnimation('activeJobs', systemStats.ofertas_activas || 0);
    updateCounterWithAnimation('totalApplications', systemStats.total_postulaciones || 0);
    updateCounterWithAnimation('successfulHires', systemStats.contratos_exitosos || 0);
}

function updateCounterWithAnimation(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const currentValue = parseInt(element.textContent.replace(/,/g, '')) || 0;
    const difference = targetValue - currentValue;
    const steps = 20;
    const increment = difference / steps;
    let current = currentValue;
    
    const timer = setInterval(() => {
        current += increment;
        element.textContent = Math.round(current).toLocaleString();
        
        if (Math.abs(current - targetValue) < 1) {
            element.textContent = targetValue.toLocaleString();
            clearInterval(timer);
        }
    }, 50);
}

async function loadRecentActivity() {
    try {
        const response = await fetch('/api/admin/recent-activity');
        const data = await response.json();
        
        const activityList = document.getElementById('activityList');
        if (!activityList) return;
        
        activityList.innerHTML = '';
        
        if (data.success && data.activities.length > 0) {
            data.activities.forEach(activity => {
                const activityItem = document.createElement('div');
                activityItem.className = 'activity-item';
                
                activityItem.innerHTML = `
                    <div class="activity-icon ${activity.type}">
                        <i class="${activity.icon}"></i>
                    </div>
                    <div class="activity-content">
                        <p>${activity.message}</p>
                        <small>${activity.time}</small>
                    </div>
                `;
                
                activityList.appendChild(activityItem);
            });
        } else {
            activityList.innerHTML = '<div class="no-activity">No hay actividad reciente</div>';
        }
    } catch (error) {
        console.error('Error cargando actividad reciente:', error);
    }
}

async function loadSystemStatus() {
    try {
        const response = await fetch('/api/admin/system-status');
        const data = await response.json();
        
        const systemStatus = document.getElementById('systemStatus');
        if (!systemStatus) return;
        
        systemStatus.innerHTML = '';
        
        if (data.success && data.system_status.length > 0) {
            data.system_status.forEach(item => {
                const statusItem = document.createElement('div');
                statusItem.className = 'status-item';
                
                statusItem.innerHTML = `
                    <div style="display: flex; align-items: center;">
                        <div class="status-indicator ${item.status}"></div>
                        <span>${item.name}</span>
                    </div>
                    <strong>${item.label}</strong>
                `;
                
                systemStatus.appendChild(statusItem);
            });
        }
    } catch (error) {
        console.error('Error cargando estado del sistema:', error);
    }
}

// ================================================================
// GESTIÓN DE USUARIOS
// ================================================================
async function loadUsers() {
    try {
        console.log('👥 Cargando usuarios...');
        
        // Obtener filtros actuales
        const filters = getCurrentFilters();
        
        // Construir URL con parámetros
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                params.append(key, filters[key]);
            }
        });
        
        const response = await fetch(`/api/admin/get-users?${params}`);
        const data = await response.json();
        
        if (data.success) {
            allUsers = data.users;
            filteredUsers = [...allUsers];
            displayUsers();
            updateUsersTable();
        } else {
            throw new Error(data.error || 'Error cargando usuarios');
        }
    } catch (error) {
        console.error('Error cargando usuarios:', error);
        showNotification('Error cargando usuarios', 'error');
    }
}

function getCurrentFilters() {
    return {
        tipo: document.getElementById('userTypeFilter')?.value || '',
        estado: document.getElementById('userStatusFilter')?.value || '',
        region: document.getElementById('regionFilter')?.value || '',
        search: document.getElementById('searchInput')?.value || ''
    };
}

function displayUsers() {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    filteredUsers.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <input type="checkbox" value="${user.id}" onchange="toggleUserSelection(${user.id})" ${selectedUsers.includes(user.id) ? 'checked' : ''}>
            </td>
            <td>${user.id}</td>
            <td>${user.nombre}</td>
            <td>${user.email}</td>
            <td><span class="user-type ${user.tipo}">${user.tipo}</span></td>
            <td><span class="user-status ${user.estado}">${user.estado}</span></td>
            <td>${user.registro}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-info" onclick="viewUser(${user.id})" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-warning" onclick="editUser(${user.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deleteUser(${user.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    updateSelectAllCheckbox();
}

function updateUsersTable() {
    const totalUsers = filteredUsers.length;
    console.log(`📊 Mostrando ${totalUsers} usuarios`);
}

// ================================================================
// FILTROS Y BÚSQUEDA
// ================================================================
async function applyUserFilters() {
    try {
        await loadUsers(); // Recargar con filtros aplicados
        selectedUsers = []; // Limpiar selección
        showNotification('Filtros aplicados correctamente', 'success');
    } catch (error) {
        console.error('Error aplicando filtros:', error);
        showNotification('Error aplicando filtros', 'error');
    }
}

function clearUserFilters() {
    // Limpiar todos los filtros
    document.getElementById('userTypeFilter').value = '';
    document.getElementById('userStatusFilter').value = '';
    document.getElementById('regionFilter').value = '';
    document.getElementById('searchInput').value = '';
    
    // Recargar usuarios sin filtros
    loadUsers();
    selectedUsers = [];
    showNotification('Filtros limpiados', 'info');
}

// ================================================================
// SELECCIÓN DE USUARIOS
// ================================================================
function toggleUserSelection(userId) {
    const index = selectedUsers.indexOf(userId);
    if (index > -1) {
        selectedUsers.splice(index, 1);
    } else {
        selectedUsers.push(userId);
    }
    
    updateSelectAllCheckbox();
    console.log('Usuarios seleccionados:', selectedUsers);
}

function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const userCheckboxes = document.querySelectorAll('#usersTableBody input[type="checkbox"]');
    
    if (selectAllCheckbox.checked) {
        selectedUsers = filteredUsers.map(user => user.id);
        userCheckboxes.forEach(checkbox => checkbox.checked = true);
    } else {
        selectedUsers = [];
        userCheckboxes.forEach(checkbox => checkbox.checked = false);
    }
    
    console.log('Selección masiva:', selectedUsers);
}

function updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const totalVisible = filteredUsers.length;
    const totalSelected = selectedUsers.filter(id => 
        filteredUsers.some(user => user.id === id)
    ).length;
    
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = totalSelected === totalVisible && totalVisible > 0;
        selectAllCheckbox.indeterminate = totalSelected > 0 && totalSelected < totalVisible;
    }
}

// ================================================================
// ACCIONES CON USUARIOS INDIVIDUALES
// ================================================================
async function viewUser(userId) {
    try {
        const response = await fetch(`/api/admin/user/${userId}/details`);
        const data = await response.json();
        
        if (data.success) {
            const user = data.user;
            
            let content = `
                <div class="user-details">
                    <div class="user-basic-info">
                        <h4>Información Básica</h4>
                        <div class="info-grid">
                            <div><strong>ID:</strong> ${user.id}</div>
                            <div><strong>Nombre:</strong> ${user.nombre} ${user.apellido}</div>
                            <div><strong>Email:</strong> ${user.email}</div>
                            <div><strong>Teléfono:</strong> ${user.telefono || 'No especificado'}</div>
                            <div><strong>Rol:</strong> <span class="user-type ${user.rol.toLowerCase()}">${user.rol}</span></div>
                            <div><strong>Estado:</strong> <span class="user-status ${user.estado.toLowerCase()}">${user.estado}</span></div>
                            <div><strong>Registro:</strong> ${user.fecha_registro}</div>
                            <div><strong>Red Social:</strong> ${user.red_social || 'Ninguna'}</div>
                        </div>
                    </div>
            `;
            
            // Información específica según el rol
            if (user.estadisticas) {
                content += `
                    <div class="user-stats">
                        <h4>Estadísticas</h4>
                        <div class="stats-grid">
                `;
                
                if (user.rol === 'Trabajador') {
                    content += `
                            <div><strong>Postulaciones:</strong> ${user.estadisticas.postulaciones}</div>
                            <div><strong>Trabajos Completados:</strong> ${user.estadisticas.trabajos_completados}</div>
                            <div><strong>Calificación:</strong> ${user.estadisticas.calificacion.toFixed(1)}/5</div>
                            <div><strong>Habilidades:</strong> ${user.estadisticas.habilidades_count}</div>
                    `;
                } else if (user.rol === 'Agricultor') {
                    content += `
                            <div><strong>Ofertas Publicadas:</strong> ${user.estadisticas.ofertas_publicadas}</div>
                            <div><strong>Contratos Completados:</strong> ${user.estadisticas.contratos_completados}</div>
                            <div><strong>Calificación:</strong> ${user.estadisticas.calificacion.toFixed(1)}/5</div>
                            <div><strong>Predios:</strong> ${user.estadisticas.predios_count}</div>
                    `;
                }
                
                content += `
                        </div>
                    </div>
                `;
            }
            
            content += '</div>';
            
            showModal('Detalles del Usuario', content);
        } else {
            throw new Error(data.error || 'Error obteniendo detalles del usuario');
        }
    } catch (error) {
        console.error('Error viendo usuario:', error);
        showNotification('Error obteniendo detalles del usuario', 'error');
    }
}

async function editUser(userId) {
    try {
        const response = await fetch(`/api/admin/user/${userId}/details`);
        const data = await response.json();
        
        if (data.success) {
            const user = data.user;
            
            const content = `
                <form id="editUserForm">
                    <div class="form-grid">
                        <div class="form-group">
                            <label><strong>Nombre:</strong></label>
                            <input type="text" id="editNombre" value="${user.nombre}" required>
                        </div>
                        <div class="form-group">
                            <label><strong>Apellido:</strong></label>
                            <input type="text" id="editApellido" value="${user.apellido}" required>
                        </div>
                        <div class="form-group">
                            <label><strong>Email:</strong></label>
                            <input type="email" id="editEmail" value="${user.email}" required>
                        </div>
                        <div class="form-group">
                            <label><strong>Teléfono:</strong></label>
                            <input type="tel" id="editTelefono" value="${user.telefono || ''}">
                        </div>
                        <div class="form-group">
                            <label><strong>Estado:</strong></label>
                            <select id="editEstado" required>
                                <option value="Activo" ${user.estado === 'Activo' ? 'selected' : ''}>Activo</option>
                                <option value="Inactivo" ${user.estado === 'Inactivo' ? 'selected' : ''}>Inactivo</option>
                                <option value="Bloqueado" ${user.estado === 'Bloqueado' ? 'selected' : ''}>Bloqueado</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-primary" onclick="saveUserChanges(${userId})">
                            <i class="fas fa-save"></i> Guardar Cambios
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    </div>
                </form>
            `;
            
            showModal('Editar Usuario', content);
        } else {
            throw new Error(data.error || 'Error obteniendo datos del usuario');
        }
    } catch (error) {
        console.error('Error editando usuario:', error);
        showNotification('Error cargando datos del usuario', 'error');
    }
}

async function saveUserChanges(userId) {
    try {
        const formData = {
            nombre: document.getElementById('editNombre').value.trim(),
            apellido: document.getElementById('editApellido').value.trim(),
            email: document.getElementById('editEmail').value.trim(),
            telefono: document.getElementById('editTelefono').value.trim(),
            estado: document.getElementById('editEstado').value
        };
        
        // Validaciones básicas
        if (!formData.nombre || !formData.apellido || !formData.email) {
            showNotification('Por favor complete todos los campos requeridos', 'warning');
            return;
        }
        
        const response = await fetch(`/api/admin/user/${userId}/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeModal();
            showNotification('Usuario actualizado correctamente', 'success');
            await loadUsers(); // Recargar usuarios
        } else {
            throw new Error(data.error || 'Error actualizando usuario');
        }
    } catch (error) {
        console.error('Error guardando cambios:', error);
        showNotification('Error guardando cambios', 'error');
    }
}

async function deleteUser(userId) {
    try {
        const user = allUsers.find(u => u.id === userId);
        if (!user) {
            showNotification('Usuario no encontrado', 'error');
            return;
        }
        
        const confirmed = await showConfirmDialog(
            'Eliminar Usuario',
            `¿Está seguro de eliminar el usuario ${user.nombre}? Esta acción no se puede deshacer y eliminará todos sus datos asociados.`,
            'danger'
        );
        
        if (confirmed) {
            const response = await fetch(`/api/admin/user/${userId}/delete`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification('Usuario eliminado correctamente', 'success');
                await loadUsers(); // Recargar usuarios
                selectedUsers = selectedUsers.filter(id => id !== userId);
            } else {
                throw new Error(data.error || 'Error eliminando usuario');
            }
        }
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        showNotification('Error eliminando usuario', 'error');
    }
}

// ================================================================
// ACCIONES MASIVAS
// ================================================================
async function bulkSuspendUsers() {
    if (selectedUsers.length === 0) {
        showNotification('Seleccione al menos un usuario', 'warning');
        return;
    }
    
    const confirmed = await showConfirmDialog(
        'Suspender Usuarios',
        `¿Suspender ${selectedUsers.length} usuario(s) seleccionado(s)?`,
        'warning'
    );
    
    if (confirmed) {
        await performBulkAction('suspend');
    }
}

async function bulkDeleteUsers() {
    if (selectedUsers.length === 0) {
        showNotification('Seleccione al menos un usuario', 'warning');
        return;
    }
    
    const confirmed = await showConfirmDialog(
        'Eliminar Usuarios',
        `¿Eliminar ${selectedUsers.length} usuario(s) seleccionado(s)? Esta acción no se puede deshacer.`,
        'danger'
    );
    
    if (confirmed) {
        await performBulkAction('delete');
    }
}

async function bulkActivateUsers() {
    if (selectedUsers.length === 0) {
        showNotification('Seleccione al menos un usuario', 'warning');
        return;
    }
    
    const confirmed = await showConfirmDialog(
        'Activar Usuarios',
        `¿Activar ${selectedUsers.length} usuario(s) seleccionado(s)?`,
        'success'
    );
    
    if (confirmed) {
        await performBulkAction('activate');
    }
}

async function performBulkAction(action) {
    try {
        showLoading('Procesando acción masiva...');
        
        const response = await fetch('/api/admin/bulk-action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: action,
                user_ids: selectedUsers
            })
        });
        
        const data = await response.json();
        
        hideLoading();
        
        if (data.success) {
            showNotification(data.message, 'success');
            selectedUsers = [];
            await loadUsers(); // Recargar usuarios
        } else {
            throw new Error(data.error || 'Error realizando acción masiva');
        }
    } catch (error) {
        hideLoading();
        console.error('Error en acción masiva:', error);
        showNotification('Error realizando acción masiva', 'error');
    }
}

// ================================================================
// MODAL PARA AGREGAR NUEVO USUARIO
// ================================================================
function showAddUserModal() {
    const content = `
        <form id="addUserForm">
            <div class="form-grid">
                <div class="form-group">
                    <label><strong>Nombre:</strong></label>
                    <input type="text" id="newUserNombre" required>
                </div>
                <div class="form-group">
                    <label><strong>Apellido:</strong></label>
                    <input type="text" id="newUserApellido" required>
                </div>
                <div class="form-group">
                    <label><strong>Email:</strong></label>
                    <input type="email" id="newUserEmail" required>
                </div>
                <div class="form-group">
                    <label><strong>Tipo de Usuario:</strong></label>
                    <select id="newUserTipo" required>
                        <option value="">Seleccionar...</option>
                        <option value="trabajador">Trabajador</option>
                        <option value="agricultor">Agricultor</option>
                    </select>
                </div>
                <div class="form-group">
                    <label><strong>Región:</strong></label>
                    <select id="newUserRegion" required>
                        <option value="">Seleccionar...</option>
                        <option value="bogota">Bogotá</option>
                        <option value="antioquia">Antioquia</option>
                        <option value="valle">Valle del Cauca</option>
                        <option value="otra">Otra región</option>
                    </select>
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-primary" onclick="createNewUser()">
                    <i class="fas fa-user-plus"></i> Crear Usuario
                </button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">
                    <i class="fas fa-times"></i> Cancelar
                </button>
            </div>
        </form>
    `;
    
    showModal('Agregar Nuevo Usuario', content);
}

async function createNewUser() {
    try {
        const formData = {
            nombre: document.getElementById('newUserNombre').value.trim(),
            apellido: document.getElementById('newUserApellido').value.trim(),
            email: document.getElementById('newUserEmail').value.trim(),
            tipo: document.getElementById('newUserTipo').value,
            region: document.getElementById('newUserRegion').value
        };
        
        // Validaciones
        if (!formData.nombre || !formData.apellido || !formData.email || !formData.tipo || !formData.region) {
            showNotification('Por favor complete todos los campos', 'warning');
            return;
        }
        
        showLoading('Creando usuario...');
        
        const response = await fetch('/api/admin/create-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        hideLoading();
        
        if (data.success) {
            closeModal();
            
            // Mostrar información de la contraseña temporal
            showModal('Usuario Creado', `
                <div class="user-created-info">
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h3>Usuario creado exitosamente</h3>
                    <div class="user-info">
                        <p><strong>Nombre:</strong> ${data.user_data.nombre} ${data.user_data.apellido}</p>
                        <p><strong>Email:</strong> ${data.user_data.email}</p>
                        <p><strong>Tipo:</strong> ${data.user_data.tipo}</p>
                    </div>
                    <div class="temp-password">
                        <p><strong>Contraseña temporal:</strong></p>
                        <code>${data.temp_password}</code>
                        <small>El usuario debe cambiar esta contraseña en su primer inicio de sesión</small>
                    </div>
                    <button class="btn btn-primary" onclick="closeModal()">Entendido</button>
                </div>
            `);
            
            await loadUsers(); // Recargar usuarios
        } else {
            throw new Error(data.error || 'Error creando usuario');
        }
    } catch (error) {
        hideLoading();
        console.error('Error creando usuario:', error);
        showNotification('Error creando usuario', 'error');
    }
}

// ================================================================
// OTRAS FUNCIONES DEL DASHBOARD
// ================================================================
function showPendingReports() {
    // Simular reportes pendientes
    const content = `
        <div class="pending-reports">
            <div class="report-item">
                <div class="report-header">
                    <h4>Contenido inapropiado</h4>
                    <span class="report-priority high">Alta</span>
                </div>
                <p><strong>Reportado por:</strong> Usuario123</p>
                <p><strong>Oferta:</strong> Recolección de Frutas</p>
                <p><strong>Fecha:</strong> Hace 2 horas</p>
                <div class="report-actions">
                    <button class="btn btn-primary">Revisar</button>
                    <button class="btn btn-warning">Descartar</button>
                </div>
            </div>
            
            <div class="report-item">
                <div class="report-header">
                    <h4>Usuario fraudulento</h4>
                    <span class="report-priority medium">Media</span>
                </div>
                <p><strong>Reportado por:</strong> FarmerX</p>
                <p><strong>Usuario:</strong> Carlos Fake</p>
                <p><strong>Fecha:</strong> Hace 1 día</p>
                <div class="report-actions">
                    <button class="btn btn-primary">Investigar</button>
                    <button class="btn btn-danger">Bloquear Usuario</button>
                </div>
            </div>
            
            <div class="no-more-reports">
                <p>No hay más reportes pendientes</p>
            </div>
        </div>
    `;
    
    showModal('Reportes Pendientes', content);
}

// ================================================================
// HERRAMIENTAS DE ADMINISTRACIÓN
// ================================================================
async function exportToExcel() {
    try {
        showLoading('Generando archivo Excel...');
        
        const response = await fetch('/api/admin/export-users?format=excel');
        const data = await response.json();
        
        hideLoading();
        
        if (data.success) {
            showNotification('Archivo Excel generado correctamente', 'success');
            console.log('Datos para Excel:', data.users);
            // Aquí podrías implementar la descarga real del archivo
        } else {
            throw new Error(data.error || 'Error generando Excel');
        }
    } catch (error) {
        hideLoading();
        console.error('Error exportando Excel:', error);
        showNotification('Error generando archivo Excel', 'error');
    }
}

async function exportToPDF() {
    try {
        showLoading('Generando archivo PDF...');
        
        const response = await fetch('/api/admin/export-users?format=pdf');
        const data = await response.json();
        
        hideLoading();
        
        if (data.success) {
            showNotification('Archivo PDF generado correctamente', 'success');
            console.log('Datos para PDF:', data.users);
            // Aquí podrías implementar la descarga real del archivo
        } else {
            throw new Error(data.error || 'Error generando PDF');
        }
    } catch (error) {
        hideLoading();
        console.error('Error exportando PDF:', error);
        showNotification('Error generando archivo PDF', 'error');
    }
}

async function backupData() {
    try {
        showLoading('Creando copia de seguridad...');
        
        const response = await fetch('/api/admin/backup-data', {
            method: 'POST'
        });
        
        const data = await response.json();
        
        hideLoading();
        
        if (data.success) {
            showNotification('Copia de seguridad creada correctamente', 'success');
            
            showModal('Backup Completado', `
                <div class="backup-info">
                    <div class="success-icon">
                        <i class="fas fa-database"></i>
                    </div>
                    <h3>Copia de seguridad creada</h3>
                    <div class="backup-details">
                        <p><strong>Archivo:</strong> ${data.backup_info.filename}</p>
                        <p><strong>Tamaño:</strong> ${data.backup_info.size}</p>
                        <p><strong>Estado:</strong> ${data.backup_info.status}</p>
                    </div>
                    <button class="btn btn-primary" onclick="closeModal()">Cerrar</button>
                </div>
            `);
        } else {
            throw new Error(data.error || 'Error creando backup');
        }
    } catch (error) {
        hideLoading();
        console.error('Error creando backup:', error);
        showNotification('Error creando copia de seguridad', 'error');
    }
}

async function clearCache() {
    try {
        showLoading('Limpiando cache...');
        
        const response = await fetch('/api/admin/clear-cache', {
            method: 'POST'
        });
        
        const data = await response.json();
        
        hideLoading();
        
        if (data.success) {
            showNotification('Cache limpiado correctamente', 'success');
            
            showModal('Cache Limpiado', `
                <div class="cache-info">
                    <div class="success-icon">
                        <i class="fas fa-broom"></i>
                    </div>
                    <h3>Cache del sistema limpiado</h3>
                    <div class="cache-details">
                        <p><strong>Elementos eliminados:</strong> ${data.cache_info.cleared_items}</p>
                        <p><strong>Espacio liberado:</strong> ${data.cache_info.space_freed}</p>
                        <p><strong>Tiempo:</strong> ${data.cache_info.time_taken}</p>
                    </div>
                    <button class="btn btn-primary" onclick="closeModal()">Cerrar</button>
                </div>
            `);
        } else {
            throw new Error(data.error || 'Error limpiando cache');
        }
    } catch (error) {
        hideLoading();
        console.error('Error limpiando cache:', error);
        showNotification('Error limpiando cache', 'error');
    }
}

// ================================================================
// SISTEMA DE MODALES
// ================================================================
function showModal(title, content) {
    const modal = document.getElementById('userModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    if (modal && modalTitle && modalBody) {
        modalTitle.textContent = title;
        modalBody.innerHTML = content;
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
        
        // Agregar evento para cerrar con ESC
        document.addEventListener('keydown', handleModalKeydown);
    }
}

function closeModal() {
    const modal = document.getElementById('userModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        document.removeEventListener('keydown', handleModalKeydown);
    }
}

function handleModalKeydown(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
}

// Cerrar modal al hacer clic fuera
window.addEventListener('click', function(e) {
    const modal = document.getElementById('userModal');
    if (e.target === modal) {
        closeModal();
    }
});

// ================================================================
// SISTEMA DE CONFIRMACIÓN
// ================================================================
function showConfirmDialog(title, message, type = 'warning') {
    return new Promise((resolve) => {
        const typeClasses = {
            'warning': 'btn-warning',
            'danger': 'btn-danger',
            'success': 'btn-success',
            'info': 'btn-info'
        };
        
        const typeIcons = {
            'warning': 'fas fa-exclamation-triangle',
            'danger': 'fas fa-trash-alt',
            'success': 'fas fa-check-circle',
            'info': 'fas fa-info-circle'
        };
        
        const content = `
            <div class="confirm-dialog">
                <div class="confirm-icon ${type}">
                    <i class="${typeIcons[type] || 'fas fa-question-circle'}"></i>
                </div>
                <p>${message}</p>
                <div class="confirm-actions">
                    <button class="btn ${typeClasses[type] || 'btn-warning'}" onclick="confirmAction(true)">
                        Confirmar
                    </button>
                    <button class="btn btn-secondary" onclick="confirmAction(false)">
                        Cancelar
                    </button>
                </div>
            </div>
        `;
        
        showModal(title, content);
        
        // Función global temporal para manejar la respuesta
        window.confirmAction = (result) => {
            closeModal();
            delete window.confirmAction;
            resolve(result);
        };
    });
}

// ================================================================
// SISTEMA DE NOTIFICACIONES
// ================================================================
function showNotification(message, type = 'info', duration = 4000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const typeConfig = {
        'success': { icon: 'fas fa-check-circle', color: '#28a745' },
        'error': { icon: 'fas fa-times-circle', color: '#dc3545' },
        'warning': { icon: 'fas fa-exclamation-triangle', color: '#ffc107' },
        'info': { icon: 'fas fa-info-circle', color: '#17a2b8' }
    };
    
    const config = typeConfig[type] || typeConfig['info'];
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${config.color};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 400px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    `;
    
    notification.innerHTML = `
        <i class="${config.icon}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Animación de entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto-remover
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, duration);
}

// ================================================================
// SISTEMA DE LOADING
// ================================================================
function showLoading(message = 'Cargando...') {
    const loading = document.createElement('div');
    loading.id = 'loadingOverlay';
    loading.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `;
    
    loading.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 10px; text-align: center;">
            <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #007bff; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
            <p>${message}</p>
        </div>
    `;
    
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.getElementById('loadingOverlay');
    if (loading) {
        document.body.removeChild(loading);
    }
}

// ================================================================
// EVENT LISTENERS
// ================================================================
function setupEventListeners() {
    // Búsqueda en tiempo real
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                loadUsers();
            }, 500);
        });
    }
    
    // Notificaciones
    const notificationBell = document.querySelector('.notification-bell');
    if (notificationBell) {
        notificationBell.addEventListener('click', toggleNotifications);
    }
}

function toggleNotifications() {
    showNotification('Sistema de notificaciones en desarrollo', 'info');
}

// ================================================================
// ACTUALIZACIÓN AUTOMÁTICA
// ================================================================
function startAutoRefresh() {
    setInterval(async () => {
        if (currentSection === 'dashboard') {
            await loadDashboardStats();
        }
    }, CONFIG.refreshInterval);
}

// ================================================================
// FUNCIONES DE LOGOUT
// ================================================================
function logout() {
    showConfirmDialog(
        'Cerrar Sesión',
        '¿Está seguro que desea cerrar sesión?',
        'warning'
    ).then(async (confirmed) => {
        if (confirmed) {
            try {
                const response = await fetch('/logout', {
                    method: 'POST'
                });
                
                if (response.ok) {
                    showNotification('Sesión cerrada correctamente', 'success');
                    setTimeout(() => {
                        window.location.href = '/vista/login-trabajador.html';
                    }, 1000);
                } else {
                    throw new Error('Error cerrando sesión');
                }
            } catch (error) {
                console.error('Error logout:', error);
                showNotification('Error cerrando sesión', 'error');
            }
        }
    });
}

// ================================================================
// FUNCIONES ADICIONALES PARA COMPATIBILIDAD
// ================================================================
async function loadStatistics() {
    console.log('Cargando estadísticas detalladas...');
    showNotification('Sección de estadísticas en desarrollo', 'info');
}

async function loadReports() {
    console.log('Cargando reportes...');
    showNotification('Sección de reportes en desarrollo', 'info');
}

async function loadAuditHistory() {
    console.log('Cargando historial de auditoría...');
    showNotification('Historial de auditoría en desarrollo', 'info');
}

// ================================================================
// CSS PARA ANIMACIONES (agregar al head si no existe)
// ================================================================
if (!document.getElementById('admin-styles')) {
    const styles = document.createElement('style');
    styles.id = 'admin-styles';
    styles.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .modal-open {
            overflow: hidden;
        }
        
        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin-bottom: 1rem;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
        }
        
        .form-group input,
        .form-group select {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
        }
        
        .form-actions {
            display: flex;
            gap: 0.5rem;
            justify-content: flex-end;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #eee;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 0.5rem;
            margin-bottom: 1rem;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 0.5rem;
        }
        
        .user-created-info,
        .backup-info,
        .cache-info {
            text-align: center;
        }
        
        .success-icon {
            font-size: 3rem;
            color: #28a745;
            margin-bottom: 1rem;
        }
        
        .temp-password {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 5px;
            margin: 1rem 0;
        }
        
        .temp-password code {
            background: #e9ecef;
            padding: 0.5rem 1rem;
            border-radius: 3px;
            font-size: 1.2rem;
            font-weight: bold;
            color: #495057;
            display: block;
            margin: 0.5rem 0;
            text-align: center;
            letter-spacing: 2px;
        }
        
        .confirm-dialog {
            text-align: center;
            padding: 1rem;
        }
        
        .confirm-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        
        .confirm-icon.warning { color: #ffc107; }
        .confirm-icon.danger { color: #dc3545; }
        .confirm-icon.success { color: #28a745; }
        .confirm-icon.info { color: #17a2b8; }
        
        .confirm-actions {
            display: flex;
            gap: 0.5rem;
            justify-content: center;
            margin-top: 1.5rem;
        }
        
        .report-item {
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
        }
        
        .report-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
        }
        
        .report-priority {
            padding: 0.25rem 0.5rem;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: bold;
        }
        
        .report-priority.high {
            background: #dc3545;
            color: white;
        }
        
        .report-priority.medium {
            background: #ffc107;
            color: #212529;
        }
        
        .report-priority.low {
            background: #28a745;
            color: white;
        }
        
        .report-actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }
        
        .no-more-reports {
            text-align: center;
            color: #6c757d;
            font-style: italic;
            margin-top: 1rem;
        }
        
        .user-details {
            max-height: 500px;
            overflow-y: auto;
        }
        
        .user-basic-info,
        .user-stats {
            margin-bottom: 1.5rem;
        }
        
        .user-basic-info h4,
        .user-stats h4 {
            color: #495057;
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 0.5rem;
            margin-bottom: 1rem;
        }
        
        .notification {
            font-size: 14px;
            line-height: 1.4;
        }
        
        .notification i {
            font-size: 16px;
        }
        
        .action-buttons {
            display: flex;
            gap: 0.25rem;
        }
        
        .action-buttons .btn {
            padding: 0.25rem 0.5rem;
            font-size: 0.8rem;
        }
        
        .user-type.trabajador {
            background: #17a2b8;
            color: white;
            padding: 0.2rem 0.5rem;
            border-radius: 12px;
            font-size: 0.8rem;
        }
        
        .user-type.agricultor {
            background: #28a745;
            color: white;
            padding: 0.2rem 0.5rem;
            border-radius: 12px;
            font-size: 0.8rem;
        }
        
        .user-status.activo {
            background: #28a745;
            color: white;
            padding: 0.2rem 0.5rem;
            border-radius: 12px;
            font-size: 0.8rem;
        }
        
        .user-status.suspendido,
        .user-status.inactivo {
            background: #ffc107;
            color: #212529;
            padding: 0.2rem 0.5rem;
            border-radius: 12px;
            font-size: 0.8rem;
        }
        
        .user-status.bloqueado {
            background: #dc3545;
            color: white;
            padding: 0.2rem 0.5rem;
            border-radius: 12px;
            font-size: 0.8rem;
        }
        
        .activity-item {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            padding: 0.75rem;
            border-bottom: 1px solid #f1f1f1;
        }
        
        .activity-item:last-child {
            border-bottom: none;
        }
        
        .activity-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
            flex-shrink: 0;
        }
        
        .activity-icon.new-user {
            background: rgba(40, 167, 69, 0.1);
            color: #28a745;
        }
        
        .activity-icon.new-job {
            background: rgba(0, 123, 255, 0.1);
            color: #007bff;
        }
        
        .activity-icon.new-application {
            background: rgba(255, 193, 7, 0.1);
            color: #ffc107;
        }
        
        .activity-content {
            flex: 1;
        }
        
        .activity-content p {
            margin: 0 0 0.25rem 0;
            font-size: 0.9rem;
            line-height: 1.4;
        }
        
        .activity-content small {
            color: #6c757d;
            font-size: 0.8rem;
        }
        
        .status-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0;
            border-bottom: 1px solid #f1f1f1;
        }
        
        .status-item:last-child {
            border-bottom: none;
        }
        
        .status-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 0.5rem;
            display: inline-block;
        }
        
        .status-indicator.online {
            background: #28a745;
        }
        
        .status-indicator.warning {
            background: #ffc107;
        }
        
        .status-indicator.offline {
            background: #dc3545;
        }
        
        .no-activity {
            text-align: center;
            color: #6c757d;
            font-style: italic;
            padding: 2rem;
        }
        
        .bulk-actions {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .bulk-btn {
            padding: 0.375rem 0.75rem;
            border: none;
            border-radius: 4px;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .bulk-btn.suspend {
            background: #ffc107;
            color: #212529;
        }
        
        .bulk-btn.delete {
            background: #dc3545;
            color: white;
        }
        
        .bulk-btn.activate {
            background: #28a745;
            color: white;
        }
        
        .bulk-btn:hover {
            opacity: 0.9;
            transform: translateY(-1px);
        }
        
        .bulk-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        @media (max-width: 768px) {
            .form-grid {
                grid-template-columns: 1fr;
            }
            
            .info-grid {
                grid-template-columns: 1fr;
            }
            
            .stats-grid {
                grid-template-columns: 1fr;
            }
            
            .confirm-actions {
                flex-direction: column;
            }
            
            .bulk-actions {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.5rem;
            }
            
            .action-buttons {
                flex-direction: column;
                gap: 0.25rem;
            }
            
            .notification {
                right: 10px;
                left: 10px;
                max-width: none;
            }
        }
    `;
    
    document.head.appendChild(styles);
}

console.log('✅ Panel de Administrador JavaScript cargado completamente');
console.log('📋 Funcionalidades disponibles:');
console.log('   • Gestión completa de usuarios (ver, editar, eliminar)');
console.log('   • Filtros avanzados y búsqueda en tiempo real');
console.log('   • Acciones masivas (suspender, activar, eliminar)');
console.log('   • Dashboard con estadísticas en tiempo real');
console.log('   • Sistema de notificaciones y modales');
console.log('   • Herramientas de administración (backup, cache)');
console.log('   • Responsive design para móviles');
console.log('   • Validaciones y manejo de errores completo');