/**
 * AgroMatch Dashboard - JavaScript para Agricultor CORREGIDO
 */

// ================================================================
// VARIABLES GLOBALES
// ================================================================

let currentUser = {
    firstName: 'Carlos',
    lastName: 'González',
    role: 'Agricultor',
    email: 'carlos@finca.com',
    isLoggedIn: false
};

let map = null;
let ofertasData = []; // Array para almacenar las ofertas

// ================================================================
// INICIALIZACIÓN PRINCIPAL
// ================================================================

/**
 * Inicializar dashboard cuando se carga la página
 */
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🌱 Iniciando Dashboard Agricultor...');
    
    // Configurar event listeners
    setupEventListeners();
    
    // Obtener datos de sesión del usuario
    await fetchUserSession();
    
    // Cargar las ofertas del agricultor
    await cargarOfertasDelAgricultor();
    
    // Inicializar mapa con delay
    setTimeout(initMap, 500);
    
    console.log('✅ Dashboard Agricultor inicializado correctamente');
    showStatusMessage('¡Bienvenido al dashboard!', 'success');
});

// ================================================================
// GESTIÓN DE SESIÓN Y USUARIO
// ================================================================

/**
 * Obtener datos de sesión del backend
 */
async function fetchUserSession() {
    try {
        console.log('🔄 Obteniendo datos de sesión...');
        
        const response = await fetch('/get_user_session', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            const data = await response.json();
            
            if (data.success && data.user) {
                currentUser = {
                    firstName: data.user.first_name,
                    lastName: data.user.last_name,
                    role: data.user.role,
                    email: data.user.email,
                    username: data.user.username,
                    userId: data.user.user_id,
                    telefono: data.user.telefono || '',
                    isLoggedIn: true
                };

                console.log('✅ Usuario logueado:', currentUser.firstName);
                updateUIWithUserData();
                return true;
            } else {
                console.log('❌ No hay sesión activa');
                handleNoSession();
                return false;
            }
        } else {
            console.log('❌ Error al obtener sesión:', response.status);
            // En desarrollo, usar datos por defecto
            currentUser.isLoggedIn = true;
            updateUIWithUserData();
            return true;
        }
    } catch (error) {
        console.error('❌ Error conectando con servidor:', error);
        // En desarrollo, usar datos por defecto
        currentUser.isLoggedIn = true;
        updateUIWithUserData();
        return true;
    }
}

/**
 * Actualizar UI con datos del usuario
 */
function updateUIWithUserData() {
    // Agregar bienvenida en el header si no existe
    const header = document.querySelector('.header .logo');
    if (header && !document.querySelector('.user-welcome')) {
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'user-welcome';
        welcomeDiv.innerHTML = `
            <span style="margin-left: 20px; color: #4a7c59; font-weight: 600;">
                🌾 Bienvenido, ${currentUser.firstName}
            </span>
        `;
        header.parentNode.insertBefore(welcomeDiv, header.nextSibling);
    }
    
    console.log('✅ UI actualizada para:', currentUser.firstName);
}

/**
 * Manejar cuando no hay sesión válida
 */
function handleNoSession() {
    showStatusMessage('Sesión expirada. Redirigiendo...', 'warning');
    setTimeout(() => {
        window.location.href = '/vista/login-trabajador.html';
    }, 2000);
}

// ================================================================
// MENÚ DESPLEGABLE DE USUARIO - CORREGIDO
// ================================================================

/**
 * Toggle del menú de perfil - FUNCIÓN PRINCIPAL
 */
function toggleProfileMenu() {
    console.log('🔄 Abriendo menú de perfil...');
    
    // Remover dropdown existente si ya existe
    const existingDropdown = document.getElementById('profileDropdown');
    if (existingDropdown) {
        existingDropdown.remove();
    }

    // Crear dropdown dinámico
    const dropdown = document.createElement('div');
    dropdown.id = 'profileDropdown';
    dropdown.className = 'profile-dropdown-dynamic';
    
    dropdown.innerHTML = `
        <div class="profile-dropdown-header">
            <div class="profile-dropdown-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="profile-dropdown-name">${currentUser.firstName} ${currentUser.lastName}</div>
            <div class="profile-dropdown-role">
                <i class="fas fa-seedling"></i>
                <span>${currentUser.role}</span>
            </div>
        </div>
        
        <div class="profile-dropdown-menu">
            <div class="profile-dropdown-item" onclick="viewProfile(); closeProfileMenu()">
                <div class="icon"><i class="fas fa-user-circle"></i></div>
                <span>Mi Perfil</span>
            </div>
            <div class="profile-dropdown-item" onclick="viewSettings(); closeProfileMenu()">
                <div class="icon"><i class="fas fa-cog"></i></div>
                <span>Configuración</span>
            </div>
            <div class="profile-dropdown-item" onclick="viewStatistics(); closeProfileMenu()">
                <div class="icon"><i class="fas fa-chart-bar"></i></div>
                <span>Estadísticas</span>
            </div>
            <div class="profile-dropdown-item" onclick="viewHistory(); closeProfileMenu()">
                <div class="icon"><i class="fas fa-history"></i></div>
                <span>Historial</span>
            </div>
            <div class="profile-dropdown-item" onclick="viewSupport(); closeProfileMenu()">
                <div class="icon"><i class="fas fa-question-circle"></i></div>
                <span>Ayuda y Soporte</span>
            </div>
            <div class="profile-dropdown-item logout" onclick="confirmLogout(); closeProfileMenu()">
                <div class="icon"><i class="fas fa-sign-out-alt"></i></div>
                <span>Cerrar Sesión</span>
            </div>
        </div>
    `;

    // Estilos inline para el dropdown
    dropdown.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 9999;
        background: white;
        border-radius: 15px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(74, 124, 89, 0.2);
        min-width: 280px;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.3s ease;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;

    // Agregar al body
    document.body.appendChild(dropdown);

    // Mostrar con animación
    setTimeout(() => {
        dropdown.style.opacity = '1';
        dropdown.style.visibility = 'visible';
        dropdown.style.transform = 'translateY(0)';
    }, 10);

    // Agregar estilos para los elementos internos
    addDropdownStyles();

    // Mostrar overlay
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.classList.add('show');
        overlay.onclick = closeProfileMenu;
    }

    console.log('✅ Menú de perfil abierto');
}

/**
 * Agregar estilos para el dropdown
 */
function addDropdownStyles() {
    if (document.getElementById('dropdown-styles')) return;

    const style = document.createElement('style');
    style.id = 'dropdown-styles';
    style.textContent = `
        .profile-dropdown-header {
            padding: 20px;
            text-align: center;
            background: linear-gradient(135deg, rgba(74, 124, 89, 0.1), rgba(144, 238, 144, 0.1));
            border-bottom: 1px solid rgba(74, 124, 89, 0.2);
        }
        .profile-dropdown-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, #4a7c59, #1e3a2e);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 10px;
            font-size: 20px;
        }
        .profile-dropdown-name {
            font-size: 16px;
            font-weight: 700;
            color: #1e3a2e;
            margin-bottom: 5px;
        }
        .profile-dropdown-role {
            font-size: 14px;
            color: #4a7c59;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
        }
        .profile-dropdown-menu {
            padding: 10px 0;
        }
        .profile-dropdown-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 20px;
            color: #1e3a2e;
            cursor: pointer;
            transition: all 0.2s ease;
            border-bottom: 1px solid rgba(74, 124, 89, 0.1);
        }
        .profile-dropdown-item:hover {
            background: rgba(74, 124, 89, 0.1);
            padding-left: 25px;
        }
        .profile-dropdown-item.logout {
            color: #dc2626;
            border-top: 1px solid rgba(220, 38, 38, 0.2);
            margin-top: 5px;
        }
        .profile-dropdown-item.logout:hover {
            background: rgba(220, 38, 38, 0.1);
        }
        .profile-dropdown-item .icon {
            width: 20px;
            text-align: center;
        }
        .overlay.show {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.3);
            z-index: 9998;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Cerrar menú de perfil
 */
function closeProfileMenu() {
    const dropdown = document.getElementById('profileDropdown');
    const overlay = document.getElementById('overlay');
    
    if (dropdown) {
        dropdown.style.opacity = '0';
        dropdown.style.visibility = 'hidden';
        dropdown.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            if (dropdown.parentNode) {
                dropdown.parentNode.removeChild(dropdown);
            }
        }, 300);
    }
    
    if (overlay) {
        overlay.classList.remove('show');
        overlay.onclick = null;
    }
    
    console.log('✅ Menú de perfil cerrado');
}

// ================================================================
// FUNCIONES DEL MENÚ DE PERFIL
// ================================================================

function viewProfile() {
    showStatusMessage('Abriendo perfil...', 'info');
    setTimeout(() => {
        alert(`👤 PERFIL DE ${currentUser.firstName.toUpperCase()}

Nombre: ${currentUser.firstName} ${currentUser.lastName}
Email: ${currentUser.email}
Rol: ${currentUser.role}
Estado: Activo ✅

📊 ESTADÍSTICAS:
• Ofertas publicadas: 15
• Trabajadores contratados: 47
• Calificación promedio: 4.8/5 ⭐`);
    }, 500);
}

function viewSettings() {
    showStatusMessage('Cargando configuración...', 'info');
    setTimeout(() => {
        alert(`⚙️ CONFIGURACIÓN

• Notificaciones: Activadas 🔔
• Idioma: Español 🇪🇸
• Zona horaria: Colombia (UTC-5)
• Privacidad: Público 👥

Para cambiar estos ajustes, contacta soporte.`);
    }, 500);
}

function viewStatistics() {
    showStatusMessage('Cargando estadísticas...', 'info');
    setTimeout(() => {
        alert(`📊 ESTADÍSTICAS DE ${currentUser.firstName}

📈 RENDIMIENTO:
• Ofertas activas: ${document.getElementById('ofertasActivas').textContent}
• Trabajadores contratados: ${document.getElementById('trabajadoresContratados').textContent}
• Calificación promedio: 4.8/5 ⭐

💰 FINANCIERO:
• Total invertido: $2,450,000 COP
• Promedio por contrato: $163,333 COP`);
    }, 500);
}

function viewHistory() {
    showStatusMessage('Cargando historial...', 'info');
    setTimeout(() => {
        alert(`📅 HISTORIAL DE TRABAJOS

RECIENTES:
• Cosecha de Café - Completado ✅
• Siembra de Maíz - En progreso 🔄
• Fumigación - Completado ✅
• Recolección - Completado ✅

Total de trabajos: 15
Calificación promedio: 4.8/5 ⭐`);
    }, 500);
}

function viewSupport() {
    showStatusMessage('Contactando soporte...', 'info');
    setTimeout(() => {
        alert(`🆘 SOPORTE AGROMATCH

📞 CONTACTO:
• Teléfono: +57 300 123 4567
• WhatsApp: +57 300 123 4567
• Email: soporte@agromatch.com

💬 Horario: 24/7
⏰ Respuesta: < 15 minutos`);
    }, 500);
}

function confirmLogout() {
    if (confirm(`¿Seguro que deseas cerrar sesión, ${currentUser.firstName}?`)) {
        executeLogout();
    }
}

async function executeLogout() {
    showStatusMessage('Cerrando sesión...', 'info');
    
    try {
        const response = await fetch('/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            showStatusMessage('¡Hasta pronto!', 'success');
            setTimeout(() => {
                window.location.href = '/vista/login-trabajador.html';
            }, 1500);
        } else {
            throw new Error('Error en logout');
        }
    } catch (error) {
        console.error('Error en logout:', error);
        showStatusMessage('Sesión cerrada localmente', 'warning');
        setTimeout(() => {
            window.location.href = '/vista/login-trabajador.html';
        }, 1500);
    }
}

// ================================================================
// GESTIÓN DE OFERTAS - FUNCIONALIDAD PRINCIPAL
// ================================================================

async function cargarOfertasDelAgricultor() {
    try {
        console.log('🔄 Cargando ofertas del agricultor...');
        
        // DEBUGGING: Verificar datos de sesión
        const sessionResponse = await fetch('/get_user_session', {
            method: 'GET',
            credentials: 'include'
        });
        
        if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();
            console.log('👤 Datos de sesión:', sessionData);
            
            if (sessionData.success) {
                console.log('🔍 User ID:', sessionData.user.user_id);
                console.log('🔍 Role:', sessionData.user.role);
                console.log('🔍 Nombre:', sessionData.user.nombre);
            }
        }
        
        const response = await fetch('/api/get_farmer_jobs', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Response no OK:', errorText);
            throw new Error(`Error del servidor: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📦 Datos recibidos:', data);
        
        if (data.success) {
            ofertasData = data.ofertas || [];
            mostrarOfertasEnDashboard(ofertasData);
            actualizarEstadisticas(data.estadisticas);
            console.log(`✅ ${ofertasData.length} ofertas cargadas`);
        } else {
            throw new Error(data.message || 'Error al cargar ofertas');
        }
        
    } catch (error) {
        console.error('❌ Error cargando ofertas:', error);
        showStatusMessage('Error al cargar ofertas: ' + error.message, 'error');
        mostrarOfertasEnDashboard([]);
    }
}

/**
 * Mostrar ofertas en el dashboard
 */
function mostrarOfertasEnDashboard(ofertas) {
    const container = document.getElementById('ofertasContainer');
    
    if (!container) {
        console.error('❌ No se encontró el contenedor de ofertas');
        return;
    }
    
    // Limpiar contenedor
    container.innerHTML = '';
    
    if (ofertas.length === 0) {
        container.innerHTML = `
            <div class="section-title" style="margin: 30px 0 20px 0;">
                <i class="fas fa-clipboard-list"></i>
                Mis Ofertas Publicadas
            </div>
            <div class="no-ofertas">
                <div style="text-align: center; padding: 40px; color: #64748b;">
                    <div style="font-size: 48px; margin-bottom: 15px; color: #4a7c59;">
                        <i class="fas fa-seedling"></i>
                    </div>
                    <h3 style="color: #1e3a2e; margin-bottom: 10px;">No tienes ofertas publicadas</h3>
                    <p>Crea tu primera oferta para encontrar trabajadores.</p>
                    <button class="btn btn-primary" onclick="createNewOffer()" style="margin-top: 15px;">
                        <i class="fas fa-plus"></i> Crear Primera Oferta
                    </button>
                </div>
            </div>
        `;
        return;
    }
    
    // Agregar título de sección
    container.innerHTML = `
        <div class="section-title" style="margin: 30px 0 20px 0;">
            <i class="fas fa-clipboard-list"></i>
            Mis Ofertas Publicadas (${ofertas.length})
        </div>
    `;
    
    // Crear tarjetas para cada oferta
    ofertas.forEach(oferta => {
        const ofertaCard = crearTarjetaOferta(oferta);
        container.appendChild(ofertaCard);
    });
}

/**
 * Crear tarjeta HTML para una oferta
 */
function crearTarjetaOferta(oferta) {
    const div = document.createElement('div');
    div.className = 'offer-card';
    
    // Calcular días desde publicación
    const fechaPublicacion = new Date(oferta.fecha_publicacion);
    const ahora = new Date();
    const diasPublicada = Math.floor((ahora - fechaPublicacion) / (1000 * 60 * 60 * 24));
    
    // Obtener estado visual
    const estadoInfo = obtenerEstadoOferta(oferta.estado);
    
    div.innerHTML = `
        <div class="offer-header">
            <div class="offer-title">${oferta.titulo}</div>
            <div class="offer-actions">
                <button class="btn-icon" onclick="editarOferta(${oferta.id_oferta})" title="Editar oferta">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-icon-delete" onclick="eliminarOferta(${oferta.id_oferta}, '${oferta.titulo}')" title="Eliminar oferta">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        
        <div class="offer-details">
            <p class="offer-description">${oferta.descripcion}</p>
            
            <div class="offer-meta">
                <div class="offer-meta-item">
                    <i class="fas fa-dollar-sign"></i>
                    <span><strong>${Number(oferta.pago_ofrecido).toLocaleString()} COP</strong></span>
                </div>
                
                <div class="offer-meta-item">
                    <i class="fas fa-calendar"></i>
                    <span>Hace ${diasPublicada === 0 ? 'hoy' : diasPublicada + ' día' + (diasPublicada > 1 ? 's' : '')}</span>
                </div>
                
                <div class="offer-meta-item">
                    <i class="fas fa-users"></i>
                    <span>${oferta.num_postulaciones || 0} postulaciones</span>
                </div>
                
                ${oferta.ubicacion ? `
                <div class="offer-meta-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${oferta.ubicacion}</span>
                </div>` : ''}
            </div>
        </div>
        
        <div class="offer-footer">
            <div class="offer-status">
                <span class="status-badge ${estadoInfo.clase}">${estadoInfo.texto}</span>
            </div>
            
            <div class="offer-actions">
                <button class="btn btn-secondary" onclick="verPostulaciones(${oferta.id_oferta}, ${oferta.num_postulaciones || 0})">
                    <i class="fas fa-eye"></i> 
                    Ver Postulaciones (${oferta.num_postulaciones || 0})
                </button>
                
                ${oferta.estado === 'Abierta' ? 
                    `<button class="btn btn-outline" onclick="cerrarOferta(${oferta.id_oferta}, '${oferta.titulo}')">
                        <i class="fas fa-times-circle"></i> Cerrar Oferta
                    </button>` : 
                    ''
                }
            </div>
        </div>
    `;
    
    return div;
}

/**
 * Obtener información visual del estado
 */
function obtenerEstadoOferta(estado) {
    switch(estado) {
        case 'Abierta':
            return { clase: 'status-active', texto: 'Activa' };
        case 'En Proceso':
            return { clase: 'status-progress', texto: 'En Proceso' };
        case 'Cerrada':
            return { clase: 'status-closed', texto: 'Cerrada' };
        default:
            return { clase: 'status-inactive', texto: estado };
    }
}

/**
 * Actualizar estadísticas del dashboard
 */
function actualizarEstadisticas(estadisticas) {
    if (!estadisticas) return;
    
    const ofertasActivasEl = document.getElementById('ofertasActivas');
    const trabajadoresContratadosEl = document.getElementById('trabajadoresContratados');
    
    if (ofertasActivasEl) {
        ofertasActivasEl.textContent = estadisticas.ofertas_activas || ofertasData.length;
    }
    
    if (trabajadoresContratadosEl) {
        trabajadoresContratadosEl.textContent = estadisticas.trabajadores_contratados || 0;
    }
    
    console.log('✅ Estadísticas actualizadas');
}

// ================================================================
// CREAR NUEVA OFERTA
// ================================================================

/**
 * Abrir modal para crear nueva oferta
 */
function createNewOffer() {
    console.log('🔄 Abriendo modal crear oferta...');
    abrirModalOferta();
}

/**
 * Abrir modal de crear oferta
 */
function abrirModalOferta() {
    const modal = document.getElementById('modalCrearOferta');
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Enfocar primer campo
        setTimeout(() => {
            const tituloInput = document.getElementById('tituloOferta');
            if (tituloInput) tituloInput.focus();
        }, 300);
        
        console.log('✅ Modal crear oferta abierto');
    }
}

/**
 * Cerrar modal de crear oferta
 */
function cerrarModalOferta() {
    const modal = document.getElementById('modalCrearOferta');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // Limpiar formulario
            const form = document.getElementById('formCrearOferta');
            if (form) form.reset();
            
            // Resetear botón
            const btnCrear = document.getElementById('btnCrearOferta');
            if (btnCrear) {
                btnCrear.disabled = false;
                btnCrear.innerHTML = '<i class="fas fa-check"></i> Crear Oferta';
            }
        }, 300);
        
        console.log('✅ Modal crear oferta cerrado');
    }
}

/**
 * Crear nueva oferta
 */
async function crearOferta(event) {
    event.preventDefault();
    console.log('🔄 Creando nueva oferta...');
    
    const btnCrear = document.getElementById('btnCrearOferta');
    const form = event.target;
    const formData = new FormData(form);
    
    // Obtener datos del formulario
    const ofertaData = {
        titulo: formData.get('titulo').trim(),
        descripcion: formData.get('descripcion').trim(),
        pago: parseInt(formData.get('pago')),
        ubicacion: formData.get('ubicacion').trim()
    };
    
    // Validaciones
    if (!ofertaData.titulo || ofertaData.titulo.length < 10) {
        showStatusMessage('El título debe tener al menos 10 caracteres', 'error');
        return;
    }
    
    if (!ofertaData.descripcion || ofertaData.descripcion.length < 20) {
        showStatusMessage('La descripción debe tener al menos 20 caracteres', 'error');
        return;
    }
    
    if (!ofertaData.pago || ofertaData.pago < 10000) {
        showStatusMessage('El pago mínimo debe ser $10,000 COP', 'error');
        return;
    }
    
    // Cambiar estado del botón
    btnCrear.disabled = true;
    btnCrear.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando...';
    
    try {
        const response = await fetch('/api/crear_oferta', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(ofertaData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Éxito
            btnCrear.innerHTML = '<i class="fas fa-check"></i> ¡Creada!';
            showStatusMessage(`Oferta "${ofertaData.titulo}" creada exitosamente!`, 'success');
            
            // Cerrar modal y recargar ofertas
            setTimeout(() => {
                cerrarModalOferta();
                cargarOfertasDelAgricultor(); // Recargar ofertas
            }, 1500);
            
        } else {
            throw new Error(result.message || 'Error al crear la oferta');
        }
        
    } catch (error) {
        console.error('❌ Error creando oferta:', error);
        
        // Restaurar botón
        btnCrear.disabled = false;
        btnCrear.innerHTML = '<i class="fas fa-check"></i> Crear Oferta';
        
        showStatusMessage('Error: ' + error.message, 'error');
    }
}

// ================================================================
// EDITAR OFERTA
// ================================================================

/**
 * Abrir modal para editar oferta
 */
async function editarOferta(ofertaId) {
    console.log(`✏️ Editando oferta ${ofertaId}`);
    
    // Buscar la oferta en los datos locales
    const oferta = ofertasData.find(o => o.id_oferta === ofertaId);
    
    if (!oferta) {
        showStatusMessage('Oferta no encontrada', 'error');
        return;
    }
    
    // Llenar el formulario de edición
    document.getElementById('editOfertaId').value = oferta.id_oferta;
    document.getElementById('editTituloOferta').value = oferta.titulo;
    document.getElementById('editDescripcionOferta').value = oferta.descripcion;
    document.getElementById('editPagoOferta').value = oferta.pago_ofrecido;
    document.getElementById('editUbicacionOferta').value = oferta.ubicacion || '';
    
    // Mostrar modal
    const modal = document.getElementById('modalEditarOferta');
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        console.log('✅ Modal editar oferta abierto');
    }
}

/**
 * Cerrar modal de editar oferta
 */
function cerrarModalEditar() {
    const modal = document.getElementById('modalEditarOferta');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // Limpiar formulario
            const form = document.getElementById('formEditarOferta');
            if (form) form.reset();
        }, 300);
        
        console.log('✅ Modal editar oferta cerrado');
    }
}

/**
 * Guardar edición de oferta
 */
async function guardarEdicion(event) {
    event.preventDefault();
    console.log('💾 Guardando edición de oferta...');
    
    const btnGuardar = document.getElementById('btnGuardarEdicion');
    const form = event.target;
    const formData = new FormData(form);
    
    const ofertaData = {
        ofertaId: parseInt(formData.get('ofertaId')),
        titulo: formData.get('titulo').trim(),
        descripcion: formData.get('descripcion').trim(),
        pago: parseInt(formData.get('pago')),
        ubicacion: formData.get('ubicacion').trim()
    };
    
    // Validaciones
    if (!ofertaData.titulo || ofertaData.titulo.length < 10) {
        showStatusMessage('El título debe tener al menos 10 caracteres', 'error');
        return;
    }
    
    if (!ofertaData.descripcion || ofertaData.descripcion.length < 20) {
        showStatusMessage('La descripción debe tener al menos 20 caracteres', 'error');
        return;
    }
    
    if (!ofertaData.pago || ofertaData.pago < 10000) {
        showStatusMessage('El pago mínimo debe ser $10,000 COP', 'error');
        return;
    }
    
    // Cambiar estado del botón
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    
    try {
        const response = await fetch(`/api/edit_job/${ofertaData.ofertaId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(ofertaData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            btnGuardar.innerHTML = '<i class="fas fa-check"></i> ¡Guardado!';
            showStatusMessage('Oferta actualizada exitosamente!', 'success');
            
            // Cerrar modal y recargar ofertas
            setTimeout(() => {
                cerrarModalEditar();
                cargarOfertasDelAgricultor();
            }, 1500);
            
        } else {
            throw new Error(result.message || 'Error al actualizar la oferta');
        }
        
    } catch (error) {
        console.error('❌ Error actualizando oferta:', error);
        
        // Restaurar botón
        btnGuardar.disabled = false;
        btnGuardar.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
        
        showStatusMessage('Error: ' + error.message, 'error');
    }
}

// ================================================================
// ELIMINAR Y CERRAR OFERTAS
// ================================================================

/**
 * Eliminar oferta
 */
async function eliminarOferta(ofertaId, titulo) {
    const confirmar = confirm(`¿Estás seguro de que deseas eliminar la oferta "${titulo}"?\n\nEsta acción no se puede deshacer.`);
    
    if (!confirmar) return;
    
    try {
        console.log(`🗑️ Eliminando oferta ${ofertaId}`);
        
        const response = await fetch(`/api/delete_job/${ofertaId}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showStatusMessage('Oferta eliminada exitosamente', 'success');
            // Recargar ofertas
            cargarOfertasDelAgricultor();
        } else {
            throw new Error(data.message || 'Error al eliminar la oferta');
        }
        
    } catch (error) {
        console.error('❌ Error eliminando oferta:', error);
        showStatusMessage('Error al eliminar la oferta', 'error');
    }
}

/**
 * Cerrar oferta
 */
async function cerrarOferta(ofertaId, titulo) {
    const confirmar = confirm(`¿Deseas cerrar la oferta "${titulo}"?\n\nNo recibirás más postulaciones.`);
    
    if (!confirmar) return;
    
    try {
        console.log(`🔒 Cerrando oferta ${ofertaId}`);
        
        const response = await fetch(`/api/close_job/${ofertaId}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showStatusMessage('Oferta cerrada exitosamente', 'success');
            // Recargar ofertas
            cargarOfertasDelAgricultor();
        } else {
            throw new Error(data.message || 'Error al cerrar la oferta');
        }
        
    } catch (error) {
        console.error('❌ Error cerrando oferta:', error);
        showStatusMessage('Error al cerrar la oferta', 'error');
    }
}

/**
 * Ver postulaciones de una oferta
 */
function verPostulaciones(ofertaId, numPostulaciones) {
    console.log(`👥 Viendo postulaciones para oferta ${ofertaId}`);
    
    if (numPostulaciones === 0) {
        showStatusMessage('Esta oferta no tiene postulaciones aún', 'info');
        return;
    }
    
    // Simular carga de postulaciones
    showStatusMessage(`Cargando ${numPostulaciones} postulaciones...`, 'info');
    
    setTimeout(() => {
        alert(`📋 POSTULACIONES (${numPostulaciones})

👤 Juan Pérez - 4.9/5 ⭐
   📱 +57 300 123 4567
   💼 5 años experiencia

👤 María García - 4.7/5 ⭐  
   📱 +57 301 234 5678
   💼 3 años experiencia

👤 Carlos López - 4.8/5 ⭐
   📱 +57 302 345 6789
   💼 4 años experiencia

Para contactar directamente, usa los números de teléfono.`);
    }, 1000);
}

// ================================================================
// MAPA CON LEAFLET
// ================================================================

/**
 * Inicializar mapa con Leaflet
 */
function initMap() {
    console.log('🗺️ Inicializando mapa...');
    
    const mapElement = document.getElementById("map");
    if (!mapElement) {
        console.error('❌ Elemento del mapa no encontrado');
        return;
    }
    
    try {
        // Coordenadas de Colombia (Chinchiná, Caldas)
        const fincaLocation = [5.0056, -75.6063];
        
        // Crear el mapa
        map = L.map('map').setView(fincaLocation, 13);
        
        // Agregar tiles de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetMap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
        }).addTo(map);
        
        // Marcador de la finca
        const fincaIcon = L.divIcon({
            className: 'custom-marker',
            html: '<div style="background: #4a7c59; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"><i class="fas fa-home" style="color: white; font-size: 14px;"></i></div>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        
        L.marker(fincaLocation, { icon: fincaIcon }).addTo(map)
            .bindPopup(`
                <div style="text-align: center; padding: 10px;">
                    <h4 style="margin: 0 0 5px 0; color: #4a7c59;">Tu Finca</h4>
                    <p style="margin: 0; color: #666;">Chinchiná, Caldas</p>
                </div>
            `);
        
        // Trabajadores disponibles
        const trabajadores = [
            { lat: 5.0156, lng: -75.6163, name: "Juan Pérez", rating: 4.9 },
            { lat: 4.9956, lng: -75.5963, name: "María García", rating: 4.8 },
            { lat: 5.0256, lng: -75.5863, name: "Carlos López", rating: 4.7 },
            { lat: 4.9856, lng: -75.6263, name: "Ana Rodríguez", rating: 4.6 }
        ];
        
        const workerIcon = L.divIcon({
            className: 'custom-marker',
            html: '<div style="background: #dc2626; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"><i class="fas fa-user" style="color: white; font-size: 10px;"></i></div>',
            iconSize: [25, 25],
            iconAnchor: [12, 12]
        });
        
        trabajadores.forEach(trabajador => {
            L.marker([trabajador.lat, trabajador.lng], { icon: workerIcon }).addTo(map)
                .bindPopup(`
                    <div style="text-align: center; padding: 10px;">
                        <h4 style="margin: 0 0 5px 0; color: #1e3a2e;">${trabajador.name}</h4>
                        <p style="margin: 0 0 5px 0; color: #f59e0b;">⭐ ${trabajador.rating}/5</p>
                        <button onclick="contactWorker('${trabajador.name}')" style="
                            background: #4a7c59; 
                            color: white; 
                            border: none; 
                            padding: 5px 10px; 
                            border-radius: 5px; 
                            cursor: pointer;
                            font-size: 12px;
                        ">Contactar</button>
                    </div>
                `);
        });
        
        console.log('✅ Mapa inicializado correctamente');
        
    } catch (error) {
        console.error('❌ Error inicializando mapa:', error);
        // Mostrar mensaje de error en el mapa
        mapElement.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
                background: #f8f9fa;
                border-radius: 15px;
                color: #6c757d;
                text-align: center;
            ">
                <div>
                    <i class="fas fa-map-marked-alt" style="font-size: 48px; margin-bottom: 10px; color: #4a7c59;"></i>
                    <div><strong>Mapa no disponible</strong></div>
                    <small>4 trabajadores en el área</small>
                </div>
            </div>
        `;
    }
}

/**
 * Contactar trabajador desde el mapa
 */
function contactWorker(workerName) {
    showStatusMessage(`Contactando a ${workerName}...`, 'info');
    setTimeout(() => {
        alert(`📞 CONTACTANDO A ${workerName}

✅ Mensaje enviado
📱 El trabajador recibirá tu solicitud
⏰ Respuesta estimada: 2-4 horas

Tu mensaje:
"Hola ${workerName}, tengo trabajo disponible en mi finca. ¿Te interesa?"`);
    }, 1000);
}

// ================================================================
// NOTIFICACIONES
// ================================================================

/**
 * Mostrar notificaciones
 */
function showNotifications() {
    showStatusMessage('Cargando notificaciones...', 'info');
    setTimeout(() => {
        alert(`🔔 NOTIFICACIONES RECIENTES

📝 NUEVAS POSTULACIONES:
• 2 trabajadores aplicaron a "Cosecha de Café"
• 1 trabajador aplicó a "Siembra de Maíz"

⏰ RECORDATORIOS:
• Revisar progreso de trabajos activos
• Calificar trabajadores completados

⭐ CALIFICACIONES:
• Juan Pérez completó trabajo (5⭐)
• Tienes 1 calificación pendiente

💰 PAGOS:
• Pago pendiente: $150,000 COP`);
    }, 500);
}

/**
 * Manejar click en notificación
 */
function handleNotification(element) {
    element.style.opacity = '0.7';
    element.style.transform = 'translateX(5px)';
    
    setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateX(0)';
        showStatusMessage('Notificación marcada como leída', 'success');
    }, 200);
}

// ================================================================
// UTILIDADES
// ================================================================

/**
 * Mostrar mensaje de estado
 */
function showStatusMessage(message, type = 'info') {
    const messageElement = document.createElement('div');
    messageElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        z-index: 99999;
        max-width: 350px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        animation: slideInRight 0.3s ease;
    `;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-triangle', 
        warning: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle'
    };
    
    const colors = {
        success: 'linear-gradient(135deg, #22c55e, #16a34a)',
        error: 'linear-gradient(135deg, #dc2626, #991b1b)',
        warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
        info: 'linear-gradient(135deg, #3b82f6, #2563eb)'
    };
    
    messageElement.style.background = colors[type] || colors.info;
    messageElement.innerHTML = `<i class="${icons[type] || icons.info}" style="margin-right: 8px;"></i>${message}`;
    
    document.body.appendChild(messageElement);
    
    // Remover después de 4 segundos
    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            }, 300);
        }
    }, 4000);
}

/**
 * Configurar event listeners
 */
function setupEventListeners() {
    // Cerrar dropdowns al hacer click fuera
    document.addEventListener('click', function(event) {
        // Cerrar menú de perfil si se hace click fuera
        if (!event.target.closest('#profileMenuBtn') && !event.target.closest('#profileDropdown')) {
            closeProfileMenu();
        }
    });

    // Cerrar modales con ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            cerrarModalOferta();
            cerrarModalEditar();
            closeProfileMenu();
        }
    });

    // Cerrar modales al hacer click en el overlay
    document.getElementById('modalCrearOferta')?.addEventListener('click', function(event) {
        if (event.target === this) {
            cerrarModalOferta();
        }
    });

    document.getElementById('modalEditarOferta')?.addEventListener('click', function(event) {
        if (event.target === this) {
            cerrarModalEditar();
        }
    });

    console.log('✅ Event listeners configurados');
}

// ================================================================
// ESTILOS CSS DINÁMICOS
// ================================================================

/**
 * Agregar estilos CSS dinámicos necesarios
 */
function addDynamicStyles() {
    if (document.getElementById('dynamic-styles')) return;

    const style = document.createElement('style');
    style.id = 'dynamic-styles';
    style.textContent = `
        /* Estilos para modales */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            transition: all 0.3s ease;
        }
        
        .modal-overlay.show {
            opacity: 1;
        }
        
        .modal-crear-oferta {
            background: white;
            border-radius: 20px;
            max-width: 600px;
            width: 95%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            transform: scale(0.9);
            transition: transform 0.3s ease;
        }
        
        .modal-overlay.show .modal-crear-oferta {
            transform: scale(1);
        }
        
        .modal-header {
            background: linear-gradient(135deg, #4a7c59, #1e3a2e);
            color: white;
            padding: 20px;
            border-radius: 20px 20px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-title {
            margin: 0;
            font-size: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .modal-close {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 5px;
            border-radius: 50%;
            transition: background 0.3s ease;
        }
        
        .modal-close:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        .modal-body {
            padding: 30px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-label {
            display: block;
            color: #1e3a2e;
            font-weight: 600;
            margin-bottom: 8px;
            font-size: 14px;
        }
        
        .form-label i {
            margin-right: 8px;
            color: #4a7c59;
        }
        
        .form-input, .form-textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid #e1e5e9;
            border-radius: 10px;
            font-size: 14px;
            transition: border-color 0.3s ease;
            box-sizing: border-box;
        }
        
        .form-input:focus, .form-textarea:focus {
            outline: none;
            border-color: #4a7c59;
            box-shadow: 0 0 0 3px rgba(74, 124, 89, 0.1);
        }
        
        .form-textarea {
            min-height: 80px;
            resize: vertical;
        }
        
        .modal-actions {
            padding: 20px 30px 30px;
            display: flex;
            gap: 15px;
            justify-content: flex-end;
        }
        
        .btn-modal {
            padding: 12px 24px;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .btn-cancelar {
            background: #6c757d;
            color: white;
        }
        
        .btn-cancelar:hover {
            background: #5a6268;
        }
        
        .btn-crear {
            background: linear-gradient(135deg, #4a7c59, #1e3a2e);
            color: white;
        }
        
        .btn-crear:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(74, 124, 89, 0.3);
        }
        
        .btn-crear:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
        }

        /* Estilos para ofertas */
        .ofertas-container {
            margin-top: 20px;
        }
        
        .offer-card {
            background: white;
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 20px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
            border: 2px solid transparent;
            transition: all 0.3s ease;
        }
        
        .offer-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
            border-color: #4a7c59;
        }
        
        .offer-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
        }
        
        .offer-title {
            font-size: 20px;
            font-weight: 700;
            color: #1e3a2e;
            flex: 1;
            margin-right: 15px;
        }
        
        .offer-actions {
            display: flex;
            gap: 8px;
        }
        
        .btn-icon {
            background: #f8f9fa;
            border: none;
            width: 35px;
            height: 35px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            color: #64748b;
        }
        
        .btn-icon:hover {
            background: #4a7c59;
            color: white;
            transform: translateY(-1px);
        }
        
        .btn-icon-delete:hover {
            background: #dc2626;
        }
        
        .offer-description {
            color: #64748b;
            line-height: 1.6;
            margin-bottom: 15px;
        }
        
        .offer-meta {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
            margin-bottom: 20px;
        }
        
        .offer-meta-item {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #64748b;
            font-size: 14px;
        }
        
        .offer-meta-item i {
            color: #4a7c59;
            width: 16px;
        }
        
        .offer-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 15px;
            flex-wrap: wrap;
        }
        
        .offer-status {
            flex-shrink: 0;
        }
        
        .status-badge {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .status-active {
            background: rgba(34, 197, 94, 0.1);
            color: #16a34a;
            border: 1px solid rgba(34, 197, 94, 0.2);
        }
        
        .status-progress {
            background: rgba(59, 130, 246, 0.1);
            color: #2563eb;
            border: 1px solid rgba(59, 130, 246, 0.2);
        }
        
        .status-closed {
            background: rgba(107, 114, 128, 0.1);
            color: #6b7280;
            border: 1px solid rgba(107, 114, 128, 0.2);
        }
        
        .no-ofertas {
            background: white;
            border-radius: 15px;
            margin: 20px 0;
            border: 2px dashed #e5e7eb;
        }
        
        .btn-outline {
            background: transparent;
            border: 2px solid #e5e7eb;
            color: #6b7280;
        }
        
        .btn-outline:hover {
            border-color: #dc2626;
            color: #dc2626;
            background: rgba(220, 38, 38, 0.05);
        }

        /* Animaciones */
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .modal-crear-oferta {
                width: 98%;
                margin: 10px;
            }
            
            .modal-body {
                padding: 20px;
            }
            
            .modal-actions {
                flex-direction: column;
                padding: 15px 20px 20px;
            }
            
            .offer-header {
                flex-direction: column;
                gap: 10px;
            }
            
            .offer-title {
                margin-right: 0;
            }
            
            .offer-footer {
                flex-direction: column;
                align-items: stretch;
            }
            
            .offer-actions {
                justify-content: stretch;
                gap: 10px;
            }
            
            .offer-actions .btn {
                flex: 1;
            }
        }
    `;
    
    document.head.appendChild(style);
    console.log('✅ Estilos dinámicos agregados');
}

// ================================================================
// INICIALIZACIÓN FINAL
// ================================================================

// Agregar estilos dinámicos al cargar
addDynamicStyles();

// Asegurar que las funciones estén disponibles globalmente
window.toggleProfileMenu = toggleProfileMenu;
window.closeProfileMenu = closeProfileMenu;
window.createNewOffer = createNewOffer;
window.abrirModalOferta = abrirModalOferta;
window.cerrarModalOferta = cerrarModalOferta;
window.crearOferta = crearOferta;
window.editarOferta = editarOferta;
window.cerrarModalEditar = cerrarModalEditar;
window.guardarEdicion = guardarEdicion;
window.eliminarOferta = eliminarOferta;
window.cerrarOferta = cerrarOferta;
window.verPostulaciones = verPostulaciones;
window.contactWorker = contactWorker;
window.showNotifications = showNotifications;
window.handleNotification = handleNotification;

console.log('🚀 AgroMatch Dashboard Agricultor - Sistema completo cargado');
console.log('✅ Todas las funcionalidades integradas:');
console.log('   - Gestión de sesión y autenticación');
console.log('   - Menú desplegable de usuario (CORREGIDO)');
console.log('   - Crear, editar, eliminar ofertas');
console.log('   - Mapa interactivo con Leaflet');
console.log('   - Sistema de notificaciones');
console.log('   - Responsive design');