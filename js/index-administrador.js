// Datos simulados para el panel de administrador
const mockData = {
    users: [
        {
            id: 1,
            nombre: 'Juan Pérez',
            email: 'juan@email.com',
            tipo: 'agricultor',
            estado: 'activo',
            registro: '2024-01-15',
            region: 'bogota'
        },
        {
            id: 2,
            nombre: 'María González',
            email: 'maria@email.com',
            tipo: 'trabajador',
            estado: 'activo',
            registro: '2024-02-10',
            region: 'antioquia'
        },
        {
            id: 3,
            nombre: 'Carlos Rodríguez',
            email: 'carlos@email.com',
            tipo: 'agricultor',
            estado: 'suspendido',
            registro: '2024-01-20',
            region: 'valle'
        },
        {
            id: 4,
            nombre: 'Ana Martínez',
            email: 'ana@email.com',
            tipo: 'trabajador',
            estado: 'activo',
            registro: '2024-03-05',
            region: 'bogota'
        },
        {
            id: 5,
            nombre: 'Luis Hernández',
            email: 'luis@email.com',
            tipo: 'trabajador',
            estado: 'bloqueado',
            registro: '2024-02-28',
            region: 'antioquia'
        }
    ],
    activities: [
        {
            type: 'new-user',
            icon: 'fas fa-user-plus',
            message: '<strong>Nuevo usuario registrado:</strong> Juan Pérez',
            time: 'Hace 2 horas'
        },
        {
            type: 'new-job',
            icon: 'fas fa-plus-circle',
            message: '<strong>Nueva oferta publicada:</strong> Recolección de Manzanas',
            time: 'Hace 3 horas'
        },
        {
            type: 'report',
            icon: 'fas fa-exclamation-triangle',
            message: '<strong>Reporte recibido:</strong> Contenido inapropiado',
            time: 'Hace 1 día'
        },
        {
            type: 'new-user',
            icon: 'fas fa-user-plus',
            message: '<strong>Nuevo usuario registrado:</strong> María González',
            time: 'Hace 1 día'
        },
        {
            type: 'new-job',
            icon: 'fas fa-plus-circle',
            message: '<strong>Nueva oferta publicada:</strong> Cosecha de Café',
            time: 'Hace 2 días'
        }
    ],
    systemStatus: [
        {
            name: 'Servidor Principal',
            status: 'online',
            label: 'Online'
        },
        {
            name: 'Base de Datos',
            status: 'online',
            label: 'Operativo'
        },
        {
            name: 'Sistema de Pagos',
            status: 'warning',
            label: 'Mantenimiento'
        },
        {
            name: 'Notificaciones',
            status: 'online',
            label: 'Activo'
        }
    ]
};

// Variables globales
let currentSection = 'dashboard';
let selectedUsers = [];
let filteredUsers = [...mockData.users];
let auditLog = [];

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    setupMobileMenu();
    loadDashboard();
    loadUsers();
    setupEventListeners();
    
    // Simular actualización de datos en tiempo real
    setInterval(updateRealTimeData, 30000); // Cada 30 segundos
}

// Configuración de navegación
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

// Configuración del menú móvil
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

// Mostrar sección específica
function showSection(sectionName) {
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
            case 'usuarios':
                loadUsers();
                break;
            case 'estadisticas':
                loadStatistics();
                break;
            case 'reportes':
                loadReports();
                break;
            case 'historial':
                loadAuditHistory();
                break;
        }
    }
}

// Cargar dashboard principal
function loadDashboard() {
    loadRecentActivity();
    loadSystemStatus();
    updateStatistics();
}

// Cargar actividad reciente
function loadRecentActivity() {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    activityList.innerHTML = '';
    
    mockData.activities.forEach(activity => {
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
}

// Cargar estado del sistema
function loadSystemStatus() {
    const systemStatus = document.getElementById('systemStatus');
    if (!systemStatus) return;
    
    systemStatus.innerHTML = '';
    
    mockData.systemStatus.forEach(item => {
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

// Actualizar estadísticas
function updateStatistics() {
    const stats = {
        totalUsers: mockData.users.length,
        activeUsers: mockData.users.filter(u => u.estado === 'activo').length,
        activeJobs: 324,
        totalApplications: 2156,
        successfulHires: 892
    };
    
    // Actualizar elementos del DOM con animación
    updateCounterWithAnimation('totalUsers', stats.activeUsers);
    updateCounterWithAnimation('activeJobs', stats.activeJobs);
    updateCounterWithAnimation('totalApplications', stats.totalApplications);
    updateCounterWithAnimation('successfulHires', stats.successfulHires);
}

// Animación para contadores
function updateCounterWithAnimation(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const currentValue = parseInt(element.textContent.replace(/,/g, '')) || 0;
    const difference = targetValue - currentValue;
    const steps = 30;
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

// Cargar usuarios
function loadUsers() {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    filteredUsers.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <input type="checkbox" value="${user.id}" onchange="toggleUserSelection(${user.id})">
            </td>
            <td>${user.id}</td>
            <td>${user.nombre}</td>
            <td>${user.email}</td>
            <td><span class="user-type ${user.tipo}">${user.tipo}</span></td>
            <td><span class="user-status ${user.estado}">${user.estado}</span></td>
            <td>${formatDate(user.registro)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-info" onclick="viewUser(${user.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-warning" onclick="editUser(${user.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deleteUser(${user.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Filtros de usuarios
function applyUserFilters() {
    const typeFilter = document.getElementById('userTypeFilter').value;
    const statusFilter = document.getElementById('userStatusFilter').value;
    const regionFilter = document.getElementById('regionFilter').value;
    
    filteredUsers = mockData.users.filter(user => {
        return (!typeFilter || user.tipo === typeFilter) &&
               (!statusFilter || user.estado === statusFilter) &&
               (!regionFilter || user.region === regionFilter);
    });
    
    loadUsers();
    logAuditAction('Filtros aplicados', `Tipo: ${typeFilter || 'Todos'}, Estado: ${statusFilter || 'Todos'}, Región: ${regionFilter || 'Todas'}`);
}

function clearUserFilters() {
    document.getElementById('userTypeFilter').value = '';
    document.getElementById('userStatusFilter').value = '';
    document.getElementById('regionFilter').value = '';
    
    filteredUsers = [...mockData.users];
    loadUsers();
    logAuditAction('Filtros limpiados', 'Se removieron todos los filtros de usuario');
}

// Selección de usuarios
function toggleUserSelection(userId) {
    const index = selectedUsers.indexOf(userId);
    if (index > -1) {
        selectedUsers.splice(index, 1);
    } else {
        selectedUsers.push(userId);
    }
    
    updateSelectAllCheckbox();
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

// Acciones de usuario
function viewUser(userId) {
    const user = mockData.users.find(u => u.id === userId);
    if (!user) return;
    
    showModal('Detalles del Usuario', `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
                <strong>ID:</strong> ${user.id}<br>
                <strong>Nombre:</strong> ${user.nombre}<br>
                <strong>Email:</strong> ${user.email}<br>
                <strong>Tipo:</strong> ${user.tipo}
            </div>
            <div>
                <strong>Estado:</strong> <span class="user-status ${user.estado}">${user.estado}</span><br>
                <strong>Región:</strong> ${user.region}<br>
                <strong>Registro:</strong> ${formatDate(user.registro)}
            </div>
        </div>
        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #eee;">
            <h4>Historial de Actividad</h4>
            <p>• Usuario registrado el ${formatDate(user.registro)}</p>
            <p>• Última actividad: Hace 2 días</p>
            <p>• Total de postulaciones: 15</p>
            <p>• Calificación promedio: 4.8/5</p>
        </div>
    `);
    
    logAuditAction('Usuario visualizado', `Se consultaron los detalles del usuario ${user.nombre} (ID: ${user.id})`);
}

function editUser(userId) {
    const user = mockData.users.find(u => u.id === userId);
    if (!user) return;
    
    showModal('Editar Usuario', `
        <form id="editUserForm">
            <div style="display: grid; gap: 1rem;">
                <div>
                    <label><strong>Nombre:</strong></label>
                    <input type="text" value="${user.nombre}" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 5px; margin-top: 0.25rem;">
                </div>
                <div>
                    <label><strong>Email:</strong></label>
                    <input type="email" value="${user.email}" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 5px; margin-top: 0.25rem;">
                </div>
                <div>
                    <label><strong>Estado:</strong></label>
                    <select style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 5px; margin-top: 0.25rem;">
                        <option value="activo" ${user.estado === 'activo' ? 'selected' : ''}>Activo</option>
                        <option value="suspendido" ${user.estado === 'suspendido' ? 'selected' : ''}>Suspendido</option>
                        <option value="bloqueado" ${user.estado === 'bloqueado' ? 'selected' : ''}>Bloqueado</option>
                    </select>
                </div>
                <div style="margin-top: 1rem;">
                    <button type="button" class="btn btn-primary" onclick="saveUserChanges(${userId})">Guardar Cambios</button>
                    <button type="button" class="btn" onclick="closeModal()" style="background: #f8f9fa; color: #333; margin-left: 0.5rem;">Cancelar</button>
                </div>
            </div>
        </form>
    `);
    
    logAuditAction('Usuario editado', `Se abrió el formulario de edición para el usuario ${user.nombre} (ID: ${user.id})`);
}

function deleteUser(userId) {
    const user = mockData.users.find(u => u.id === userId);
    if (!user) return;
    
    if (confirm(`¿Está seguro de eliminar el usuario ${user.nombre}? Esta acción no se puede deshacer.`)) {
        const index = mockData.users.findIndex(u => u.id === userId);
        if (index > -1) {
            mockData.users.splice(index, 1);
            filteredUsers = filteredUsers.filter(u => u.id !== userId);
            loadUsers();
            updateStatistics();
            
            logAuditAction('Usuario eliminado', `Se eliminó el usuario ${user.nombre} (ID: ${user.id})`);
            showNotification('Usuario eliminado correctamente', 'success');
        }
    }
}

function saveUserChanges(userId) {
    // Aquí implementarías la lógica para guardar los cambios
    closeModal();
    showNotification('Usuario actualizado correctamente', 'success');
    logAuditAction('Usuario actualizado', `Se guardaron los cambios del usuario ID: ${userId}`);
}

// Acciones masivas
function bulkSuspendUsers() {
    if (selectedUsers.length === 0) {
        showNotification('Seleccione al menos un usuario', 'warning');
        return;
    }
    
    if (confirm(`¿Suspender ${selectedUsers.length} usuario(s) seleccionado(s)?`)) {
        selectedUsers.forEach(userId => {
            const user = mockData.users.find(u => u.id === userId);
            if (user) {
                user.estado = 'suspendido';
            }
        });
        
        loadUsers();
        selectedUsers = [];
        updateSelectAllCheckbox();
        
        logAuditAction('Usuarios suspendidos masivamente', `Se suspendieron ${selectedUsers.length} usuarios`);
        showNotification('Usuarios suspendidos correctamente', 'success');
    }
}

function bulkDeleteUsers() {
    if (selectedUsers.length === 0) {
        showNotification('Seleccione al menos un usuario', 'warning');
        return;
    }
    
    if (confirm(`¿Eliminar ${selectedUsers.length} usuario(s) seleccionado(s)? Esta acción no se puede deshacer.`)) {
        selectedUsers.forEach(userId => {
            const index = mockData.users.findIndex(u => u.id === userId);
            if (index > -1) {
                mockData.users.splice(index, 1);
            }
        });
        
        filteredUsers = filteredUsers.filter(u => !selectedUsers.includes(u.id));
        selectedUsers = [];
        loadUsers();
        updateSelectAllCheckbox();
        updateStatistics();
        
        logAuditAction('Usuarios eliminados masivamente', `Se eliminaron ${selectedUsers.length} usuarios`);
        showNotification('Usuarios eliminados correctamente', 'success');
    }
}

// Sistema de modales
function showModal(title, content) {
    const modal = document.getElementById('userModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    if (modal && modalTitle && modalBody) {
        modalTitle.textContent = title;
        modalBody.innerHTML = content;
        modal.style.display = 'block';
        
        // Agregar evento para cerrar con ESC
        document.addEventListener('keydown', handleModalKeydown);
    }
}

function closeModal() {
    const modal = document.getElementById('userModal');
    if (modal) {
        modal.style.display = 'none';
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

// Sistema de notificaciones
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 3000;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 300px;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animación de entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto-remover después de 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function getNotificationColor(type) {
    switch(type) {
        case 'success': return '#28a745';
        case 'warning': return '#ffc107';
        case 'error': return '#dc3545';
        default: return '#4a90e2';
    }
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'warning': return 'exclamation-triangle';
        case 'error': return 'times-circle';
        default: return 'info-circle';
    }
}

// Registro de auditoría
function logAuditAction(action, details) {
    const timestamp = new Date().toISOString();
    const auditEntry = {
        timestamp,
        action,
        details,
        admin: 'Admin Principal',
        ip: '192.168.1.100' // Simulado
    };
    
    auditLog.push(auditEntry);
    
    // Mantener solo los últimos 100 registros
    if (auditLog.length > 100) {
        auditLog.shift();
    }
}

function loadAuditHistory() {
    // Esta función se ejecutaría cuando se seleccione la sección de historial
    console.log('Cargando historial de auditoría...', auditLog);
}

// Configurar event listeners adicionales
function setupEventListeners() {
    // Búsqueda en tiempo real
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            
            if (currentSection === 'usuarios') {
                filteredUsers = mockData.users.filter(user => 
                    user.nombre.toLowerCase().includes(searchTerm) ||
                    user.email.toLowerCase().includes(searchTerm)
                );
                loadUsers();
            }
        });
    }
}

// Funciones de notificaciones
function toggleNotifications() {
    showNotification('3 nuevas notificaciones', 'info');
    
    // Simulación de notificaciones
    const notifications = [
        'Nuevo usuario registrado: Pedro López',
        'Oferta reportada: Contenido inapropiado',
        'Sistema actualizado correctamente'
    ];
    
    setTimeout(() => {
        notifications.forEach((notif, index) => {
            setTimeout(() => {
                showNotification(notif, 'info');
            }, index * 1000);
        });
    }, 1000);
}

// Funciones adicionales del dashboard
function showPendingReports() {
    showModal('Reportes Pendientes', `
        <div class="pending-reports">
            <div class="report-item" style="padding: 1rem; border-left: 4px solid #ffc107; margin-bottom: 1rem; background: rgba(255, 193, 7, 0.1);">
                <h4>Contenido inapropiado</h4>
                <p><strong>Reportado por:</strong> Usuario123</p>
                <p><strong>Oferta:</strong> Recolección de Frutas</p>
                <p><strong>Fecha:</strong> Hace 2 horas</p>
                <div style="margin-top: 0.5rem;">
                    <button class="btn btn-primary" style="margin-right: 0.5rem;">Revisar</button>
                    <button class="btn btn-warning">Descartar</button>
                </div>
            </div>
            
            <div class="report-item" style="padding: 1rem; border-left: 4px solid #dc3545; margin-bottom: 1rem; background: rgba(220, 53, 69, 0.1);">
                <h4>Usuario fraudulento</h4>
                <p><strong>Reportado por:</strong> FarmerX</p>
                <p><strong>Usuario:</strong> Carlos Fake</p>
                <p><strong>Fecha:</strong> Hace 1 día</p>
                <div style="margin-top: 0.5rem;">
                    <button class="btn btn-primary" style="margin-right: 0.5rem;">Investigar</button>
                    <button class="btn btn-danger">Bloquear Usuario</button>
                </div>
            </div>
        </div>
    `);
}

function showAddUserModal() {
    showModal('Agregar Nuevo Usuario', `
        <form id="addUserForm">
            <div style="display: grid; gap: 1rem;">
                <div>
                    <label><strong>Nombre completo:</strong></label>
                    <input type="text" id="newUserName" required style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 5px; margin-top: 0.25rem;">
                </div>
                <div>
                    <label><strong>Email:</strong></label>
                    <input type="email" id="newUserEmail" required style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 5px; margin-top: 0.25rem;">
                </div>
                <div>
                    <label><strong>Tipo de usuario:</strong></label>
                    <select id="newUserType" required style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 5px; margin-top: 0.25rem;">
                        <option value="">Seleccionar...</option>
                        <option value="agricultor">Agricultor</option>
                        <option value="trabajador">Trabajador</option>
                    </select>
                </div>
                <div>
                    <label><strong>Región:</strong></label>
                    <select id="newUserRegion" required style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 5px; margin-top: 0.25rem;">
                        <option value="">Seleccionar...</option>
                        <option value="bogota">Bogotá</option>
                        <option value="antioquia">Antioquia</option>
                        <option value="valle">Valle del Cauca</option>
                    </select>
                </div>
                <div style="margin-top: 1rem;">
                    <button type="button" class="btn btn-primary" onclick="createNewUser()">Crear Usuario</button>
                    <button type="button" class="btn" onclick="closeModal()" style="background: #f8f9fa; color: #333; margin-left: 0.5rem;">Cancelar</button>
                </div>
            </div>
        </form>
    `);
}

function createNewUser() {
    const name = document.getElementById('newUserName').value;
    const email = document.getElementById('newUserEmail').value;
    const type = document.getElementById('newUserType').value;
    const region = document.getElementById('newUserRegion').value;
    
    if (!name || !email || !type || !region) {
        showNotification('Complete todos los campos', 'warning');
        return;
    }
    
    const newUser = {
        id: mockData.users.length + 1,
        nombre: name,
        email: email,
        tipo: type,
        estado: 'activo',
        registro: new Date().toISOString().split('T')[0],
        region: region
    };
    
    mockData.users.push(newUser);
    filteredUsers = [...mockData.users];
    
    loadUsers();
    updateStatistics();
    closeModal();
    
    logAuditAction('Usuario creado', `Se creó un nuevo usuario: ${name} (${email})`);
    showNotification('Usuario creado exitosamente', 'success');
}

// Funciones de estadísticas y reportes
function loadStatistics() {
    console.log('Cargando estadísticas detalladas...');
}

function loadReports() {
    console.log('Cargando sistema de reportes...');
}

// Actualización de datos en tiempo real
function updateRealTimeData() {
    // Simular cambios en los datos
    const randomChange = Math.floor(Math.random() * 10) - 5; // -5 a +5
    
    // Actualizar estadísticas con pequeños cambios aleatorios
    const currentUsers = parseInt(document.getElementById('totalUsers')?.textContent?.replace(/,/g, '') || '0');
    const currentJobs = parseInt(document.getElementById('activeJobs')?.textContent?.replace(/,/g, '') || '0');
    
    updateCounterWithAnimation('totalUsers', Math.max(0, currentUsers + randomChange));
    updateCounterWithAnimation('activeJobs', Math.max(0, currentJobs + Math.floor(Math.random() * 5)));
    
    // Agregar nueva actividad aleatoriamente
    if (Math.random() > 0.7) {
        const newActivities = [
            {
                type: 'new-user',
                icon: 'fas fa-user-plus',
                message: '<strong>Nuevo usuario registrado:</strong> Usuario' + Math.floor(Math.random() * 1000),
                time: 'Hace unos segundos'
            },
            {
                type: 'new-job',
                icon: 'fas fa-plus-circle',
                message: '<strong>Nueva oferta publicada:</strong> Trabajo Agrícola #' + Math.floor(Math.random() * 100),
                time: 'Hace 1 minuto'
            }
        ];
        
        const randomActivity = newActivities[Math.floor(Math.random() * newActivities.length)];
        mockData.activities.unshift(randomActivity);
        
        // Mantener solo las últimas 10 actividades
        if (mockData.activities.length > 10) {
            mockData.activities.pop();
        }
        
        if (currentSection === 'dashboard') {
            loadRecentActivity();
        }
    }
}

// Función de logout
function logout() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
        logAuditAction('Cierre de sesión', 'El administrador cerró sesión');
        
        // Simular redirección a login
        showNotification('Sesión cerrada correctamente', 'success');
        
        setTimeout(() => {
            // Aquí redirigirías a la página de login
            console.log('Redirigiendo a página de login...');
        }, 2000);
    }
}

// Funciones de exportación (simuladas)
function exportToExcel() {
    logAuditAction('Exportación Excel', 'Se generó reporte de usuarios en formato Excel');
    showNotification('Exportando a Excel...', 'info');
    
    setTimeout(() => {
        showNotification('Reporte Excel generado correctamente', 'success');
    }, 2000);
}

function exportToPDF() {
    logAuditAction('Exportación PDF', 'Se generó reporte de usuarios en formato PDF');
    showNotification('Generando PDF...', 'info');
    
    setTimeout(() => {
        showNotification('Reporte PDF generado correctamente', 'success');
    }, 2000);
}

// Validaciones de seguridad
function validateAdminPermissions() {
    // Simular validación de permisos
    return true;
}

function encryptSensitiveData(data) {
    // Simular encriptación de datos sensibles
    return data;
}

// Funciones de mantenimiento
function clearCache() {
    logAuditAction('Cache limpiado', 'Se limpió el cache del sistema');
    showNotification('Cache del sistema limpiado', 'success');
}

function backupData() {
    logAuditAction('Backup creado', 'Se creó copia de seguridad de los datos');
    showNotification('Creando copia de seguridad...', 'info');
    
    setTimeout(() => {
        showNotification('Copia de seguridad creada correctamente', 'success');
    }, 3000);
}

// Log inicial
logAuditAction('Inicio de sesión', 'El administrador principal inició sesión en el panel');