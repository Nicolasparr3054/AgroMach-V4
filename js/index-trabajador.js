// Variables globales
let appliedJobs = [];
let favoriteJobs = []; // Nueva variable para favoritos
let userData = null;
let currentUser = null;
let map = null;


// Función para cargar datos del usuario al inicializar la página
async function loadUserData() {
    try {
        console.log('Cargando datos del usuario...');
        
        const response = await fetch('/get_user_session');
        
        if (!response.ok) {
            if (response.status === 401) {
                console.log('No hay sesión activa, redirigiendo al login');
                window.location.href = '/vista/login-trabajador.html';
                return;
            }
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        if (data.success && data.user) {
            userData = data.user;
            currentUser = data.user;
            updateUIWithUserData(userData);
            loadFavorites(); // Cargar favoritos del usuario
        } else {
            throw new Error(data.error || 'No se pudieron cargar los datos del usuario');
        }
        
    } catch (error) {
        console.error('Error cargando datos del usuario:', error);
        showErrorMessage('Error al cargar los datos del usuario. Intenta recargar la página.');
        
        setTimeout(() => {
            showDefaultUserData();
        }, 2000);
    }
}

// Función para cargar favoritos del usuario
async function loadFavorites() {
    try {
        const response = await fetch('/api/favoritos');
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                favoriteJobs = data.favoritos.map(f => f.job_id);
                updateFavoriteButtons();
            }
        }
    } catch (error) {
        console.error('Error cargando favoritos:', error);
    }
}

// Función para actualizar botones de favoritos
function updateFavoriteButtons() {
    const jobCards = document.querySelectorAll('.job-card');
    jobCards.forEach((card, index) => {
        const jobId = index + 1; // Simular ID basado en posición
        const isFavorite = favoriteJobs.includes(jobId);
        const favoriteBtn = card.querySelector('.favorite-btn');
        
        if (favoriteBtn) {
            favoriteBtn.classList.toggle('active', isFavorite);
            favoriteBtn.innerHTML = isFavorite ? 
                '<i class="fas fa-heart"></i>' : 
                '<i class="far fa-heart"></i>';
        }
    });
}

// Función para alternar favorito
async function toggleFavorite(button, jobId) {
    const jobCard = button.closest('.job-card');
    const jobTitle = jobCard.querySelector('.job-title').textContent;
    
    const isFavorite = favoriteJobs.includes(jobId);
    
    try {
        const response = await fetch('/api/favoritos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                job_id: jobId,
                job_title: jobTitle,
                action: isFavorite ? 'remove' : 'add'
            })
        });

        const data = await response.json();
        
        if (data.success) {
            if (isFavorite) {
                // Remover de favoritos
                favoriteJobs = favoriteJobs.filter(id => id !== jobId);
                button.classList.remove('active');
                button.innerHTML = '<i class="far fa-heart"></i>';
                showToast('info', 'Removido de favoritos', jobTitle);
            } else {
                // Agregar a favoritos
                favoriteJobs.push(jobId);
                button.classList.add('active');
                button.innerHTML = '<i class="fas fa-heart"></i>';
                showToast('success', 'Agregado a favoritos', jobTitle);
            }
            
            // Animación del botón
            button.style.transform = 'scale(1.2)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 200);
            
        } else {
            throw new Error(data.error || 'Error al actualizar favorito');
        }
        
    } catch (error) {
        console.error('Error actualizando favorito:', error);
        showToast('error', 'Error', 'No se pudo actualizar el favorito');
    }
}

// Sistema de notificaciones Toast
function showToast(type, title, message) {
    // Crear contenedor si no existe
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const iconMap = {
        success: 'fa-check-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle',
        error: 'fa-times-circle'
    };

    toast.innerHTML = `
        <div class="toast-header">
            <i class="fas ${iconMap[type]} toast-icon"></i>
            <span class="toast-title">${title}</span>
        </div>
        <div class="toast-message">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Función para actualizar la UI con los datos del usuario
function updateUIWithUserData(user) {
    console.log('Actualizando UI con datos del usuario:', user);
    
    const profileNameEl = document.getElementById('profileName');
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    const displayName = fullName || user.username || 'Usuario';
    
    profileNameEl.textContent = displayName;
    profileNameEl.classList.remove('skeleton', 'skeleton-text');
    
    const profileAvatarEl = document.getElementById('profileAvatar');
    const initials = getInitials(user.first_name, user.last_name);
    profileAvatarEl.innerHTML = `<span style="font-size: 24px; font-weight: bold;">${initials}</span>`;
    profileAvatarEl.classList.remove('skeleton', 'skeleton-circle');
    
    updateDropdownData(user, displayName, initials);
    
    if (user.email) {
        console.log('Email del usuario:', user.email);
    }
    
    if (user.role) {
        console.log('Rol del usuario:', user.role);
        if (user.role !== 'Trabajador') {
            console.warn('Usuario no es trabajador:', user.role);
        }
    }
    
    profileNameEl.style.opacity = '0';
    profileAvatarEl.style.opacity = '0';
    
    setTimeout(() => {
        profileNameEl.style.transition = 'opacity 0.5s ease';
        profileAvatarEl.style.transition = 'opacity 0.5s ease';
        profileNameEl.style.opacity = '1';
        profileAvatarEl.style.opacity = '1';
    }, 100);
}

// Función para actualizar datos del dropdown
function updateDropdownData(user, displayName, initials) {
    const dropdownName = document.getElementById('dropdownName');
    const dropdownAvatar = document.getElementById('dropdownAvatar');
    
    if (dropdownName) {
        dropdownName.textContent = displayName;
    }
    
    if (dropdownAvatar) {
        dropdownAvatar.innerHTML = `<span style="font-size: 24px; font-weight: bold;">${initials}</span>`;
    }
}

// Función para obtener iniciales del nombre
function getInitials(firstName, lastName) {
    let initials = '';
    
    if (firstName && firstName.trim()) {
        initials += firstName.trim().charAt(0).toUpperCase();
    }
    
    if (lastName && lastName.trim()) {
        initials += lastName.trim().charAt(0).toUpperCase();
    }
    
    if (!initials) {
        return 'U';
    }
    
    return initials;
}

// Función para mostrar datos por defecto en caso de error
function showDefaultUserData() {
    const profileNameEl = document.getElementById('profileName');
    const profileAvatarEl = document.getElementById('profileAvatar');
    const dropdownName = document.getElementById('dropdownName');
    const dropdownAvatar = document.getElementById('dropdownAvatar');
    
    profileNameEl.textContent = 'Usuario';
    profileNameEl.classList.remove('skeleton', 'skeleton-text');
    
    profileAvatarEl.innerHTML = '<i class="fas fa-user"></i>';
    profileAvatarEl.classList.remove('skeleton', 'skeleton-circle');
    
    if (dropdownName) dropdownName.textContent = 'Usuario';
    if (dropdownAvatar) dropdownAvatar.innerHTML = '<i class="fas fa-user"></i>';
}

// Función para mostrar mensaje de error
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const container = document.querySelector('.container');
    container.insertBefore(errorDiv, container.firstChild);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// FUNCIÓN PRINCIPAL DEL MENÚ - MANTENIDA INTACTA
function toggleProfileMenu() {
    console.log('Click en menú detectado');
    
    const dropdown = document.getElementById('dynamicProfileDropdown');
    
    if (!dropdown) {
        console.error('No se encontró dynamicProfileDropdown');
        return;
    }
    
    const isVisible = dropdown.style.display === 'block';
    
    if (isVisible) {
        dropdown.style.display = 'none';
        dropdown.style.opacity = '0';
        dropdown.style.transform = 'translateY(-10px)';
        dropdown.style.pointerEvents = 'none';
    } else {
        dropdown.style.display = 'block';
        dropdown.style.opacity = '1';
        dropdown.style.transform = 'translateY(0)';
        dropdown.style.pointerEvents = 'all';
        dropdown.style.transition = 'all 0.3s ease';
    }
}

// Cerrar menú de perfil al hacer click fuera
document.addEventListener('click', function(event) {
    const profileMenu = document.querySelector('.profile-menu');
    const dropdown = document.getElementById('dynamicProfileDropdown');
    
    if (!profileMenu || !dropdown) return;
    
    if (!profileMenu.contains(event.target) && 
        !dropdown.contains(event.target) && 
        dropdown.style.display === 'block') {
        dropdown.style.display = 'none';
        dropdown.style.opacity = '0';
        dropdown.style.transform = 'translateY(-10px)';
        dropdown.style.pointerEvents = 'none';
    }
});

// Función mejorada para cerrar sesión
async function logout() {
    try {
        console.log('Cerrando sesión...');
        
        const response = await fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('Sesión cerrada correctamente');
            userData = null;
            currentUser = null;
            window.location.href = '/vista/login-trabajador.html';
        } else {
            throw new Error(data.error || 'Error cerrando sesión');
        }
        
    } catch (error) {
        console.error('Error cerrando sesión:', error);
        alert('Error al cerrar sesión. Recargando la página...');
        window.location.reload();
    }
}

// Funciones del menú de perfil
function showProfile() {
    const dropdown = document.getElementById('dynamicProfileDropdown');
    if (dropdown) {
        dropdown.style.display = 'none';
        dropdown.style.opacity = '0';
        dropdown.style.transform = 'translateY(-10px)';
        dropdown.style.pointerEvents = 'none';
    }
    
    if (userData) {
        window.location.href = `perfil-trabajador.html?userId=${userData.user_id}&self=true`;
    } else {
        window.location.href = 'perfil-trabajador.html';
    }
}

function showStats() {
    const dropdown = document.getElementById('dynamicProfileDropdown');
    if (dropdown) {
        dropdown.style.display = 'none';
        dropdown.style.opacity = '0';
        dropdown.style.transform = 'translateY(-10px)';
        dropdown.style.pointerEvents = 'none';
    }
    
    window.location.href = 'estadisticas-trabajador.html';
}

function showSettings() {
    const dropdown = document.getElementById('dynamicProfileDropdown');
    if (dropdown) {
        dropdown.style.display = 'none';
        dropdown.style.opacity = '0';
        dropdown.style.transform = 'translateY(-10px)';
        dropdown.style.pointerEvents = 'none';
    }
    
    window.location.href = 'configuracion-trabajador.html';
}

// Nuevas funciones para el menú
function showHistorialEmpleos() {
    window.location.href = 'historial-empleos.html';
}

function showPostulaciones() {
    window.location.href = 'postulaciones.html';
}

// Función para aplicar a un trabajo - ACTUALIZADA CON FAVORITOS
function applyToJob(button) {
    const jobCard = button.closest('.job-card');
    const jobTitle = jobCard.querySelector('.job-title').textContent;
    
    button.innerHTML = '<div class="loading"></div> Aplicando...';
    button.disabled = true;
    
    setTimeout(() => {
        button.innerHTML = '<i class="fas fa-check"></i> Postulado ✓';
        button.classList.add('success-check');
        appliedJobs.push(jobTitle);
        
        const postulacionesCounter = document.querySelector('.quick-stat-number');
        postulacionesCounter.textContent = parseInt(postulacionesCounter.textContent) + 1;
        
        setTimeout(() => {
            const userName = userData ? (userData.first_name || 'Usuario') : 'Usuario';
            showToast('success', 'Postulación enviada', `¡Aplicaste exitosamente a "${jobTitle}"!`);
        }, 500);
        
    }, 2000);
}

// Función para buscar trabajos
function searchJobs() {
    const searchInput = document.querySelector('.search-bar');
    searchInput.focus();
    alert('Sistema de búsqueda avanzada:\n• Por ubicación\n• Por tipo de cultivo\n• Por rango de pago\n• Por disponibilidad');
}

// Función para filtrar por tipo
function filterByType(button, type) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    const jobCards = document.querySelectorAll('.job-card[data-type]');
    jobCards.forEach(card => {
        if (type === 'todos' || card.dataset.type === type) {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.5s ease';
        } else {
            card.style.display = 'none';
        }
    });
}

// Función para filtrar trabajos por búsqueda
function filterJobs(searchTerm) {
    const jobCards = document.querySelectorAll('.job-card[data-type]');
    const searchLower = searchTerm.toLowerCase();
    
    jobCards.forEach(card => {
        const title = card.querySelector('.job-title').textContent.toLowerCase();
        const details = card.querySelector('.job-details').textContent.toLowerCase();
        const tags = Array.from(card.querySelectorAll('.job-tag'))
            .map(tag => tag.textContent.toLowerCase()).join(' ');
        
        if (title.includes(searchLower) || details.includes(searchLower) || tags.includes(searchLower)) {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.5s ease';
        } else {
            card.style.display = 'none';
        }
    });
}

// Función para ver progreso del trabajo actual
function viewProgress() {
    const userName = userData ? (userData.first_name || 'Usuario') : 'Usuario';
    alert(`Progreso del Trabajo - ${userName}:\n\n• Día 2 de 3 completado\n• 75% de avance\n• 500kg recolectados de 650kg objetivo\n• Calificación actual: 5 estrellas`);
}

// Función para mostrar notificaciones
function showNotifications() {
    alert('Centro de Notificaciones:\n\n• 1 nuevo trabajo disponible\n• 1 recordatorio de trabajo\n• 0 mensajes de agricultores');
}

// Función para manejar notificaciones
function handleNotification(element) {
    element.style.opacity = '0.7';
    element.style.transform = 'translateX(10px)';
    
    setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateX(0)';
        
        const title = element.querySelector('.notification-title').textContent;
        if (title.includes('Nuevo trabajo')) {
            alert('¡Nuevo trabajo encontrado!\n\nSe ha agregado un trabajo de cosecha de aguacate cerca de ti. ¿Deseas ver los detalles?');
        } else {
            alert('Recordatorio guardado\n\nTe enviaremos una notificación 1 hora antes del inicio del trabajo.');
        }
    }, 200);
}

// **NUEVA FUNCIÓN PARA INICIALIZAR LEAFLET MAP (REEMPLAZA GOOGLE MAPS)**
function initMap() {
    console.log('Inicializando mapa con Leaflet...');
    
    const mapElement = document.getElementById("map");
    if (!mapElement) {
        console.error('Elemento del mapa no encontrado');
        return;
    }
    
    try {
        const bogota = [4.7110, -74.0721];
        
        map = L.map('map').setView(bogota, 11);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
        }).addTo(map);
        
        const jobs = [
            { lat: 4.7310, lng: -74.0521, title: "Cosecha de Café Premium", salary: "$50,000/día", type: "Café" },
            { lat: 4.6910, lng: -74.0921, title: "Siembra de Maíz Tecnificado", salary: "$45,000/día", type: "Maíz" },
            { lat: 4.7510, lng: -74.0321, title: "Recolección de Cítricos", salary: "$40,000/día", type: "Cítricos" },
            { lat: 4.6710, lng: -74.1121, title: "Mantenimiento Invernaderos", salary: "$42,000/día", type: "Invernadero" },
            { lat: 4.7710, lng: -74.0121, title: "Cosecha Aguacate Hass", salary: "$55,000/día", type: "Aguacate" }
        ];
        
        const jobIcon = L.divIcon({
            className: 'custom-job-marker',
            html: '<div style="background-color: #4a7c59; width: 25px; height: 25px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><i class="fas fa-seedling" style="color: white; font-size: 12px;"></i></div>',
            iconSize: [25, 25],
            iconAnchor: [12, 12]
        });
        
        jobs.forEach((job, index) => {
            const marker = L.marker([job.lat, job.lng], { icon: jobIcon }).addTo(map);
            
            const popupContent = `
                <div style="padding: 10px; font-family: 'Segoe UI', sans-serif; min-width: 180px;">
                    <h4 style="margin: 0 0 8px 0; color: #1e3a2e; font-size: 14px;">${job.title}</h4>
                    <p style="margin: 0 0 6px 0; color: #4a7c59; font-weight: bold; font-size: 13px;">${job.salary}</p>
                    <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px;">Tipo: ${job.type}</p>
                    <button onclick="applyFromMap('${job.title}')" style="
                        background: linear-gradient(135deg, #4a7c59, #1e3a2e);
                        color: white;
                        border: none;
                        padding: 6px 12px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 12px;
                        font-weight: 600;
                        width: 100%;
                    ">Postularme</button>
                </div>
            `;
            
            marker.bindPopup(popupContent);
        });
        
        const userIcon = L.divIcon({
            className: 'custom-user-marker',
            html: '<div style="background-color: #dc2626; width: 20px; height: 20px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><i class="fas fa-user" style="color: white; font-size: 10px;"></i></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
        
        L.marker(bogota, { icon: userIcon }).addTo(map)
            .bindPopup('<div style="text-align: center; padding: 5px;"><strong>Tu ubicación</strong></div>');
        
        console.log('Mapa inicializado correctamente con Leaflet');
        
    } catch (error) {
        console.error('Error inicializando el mapa:', error);
        handleMapError();
    }
}

// Función para postularse desde el mapa
function applyFromMap(jobTitle) {
    const userName = userData ? (userData.first_name || 'Usuario') : 'Usuario';
    showToast('success', 'Postulación enviada', `¡Aplicaste exitosamente a "${jobTitle}" desde el mapa!`);
    
    const postulacionesCounter = document.querySelector('.quick-stat-number');
    if (postulacionesCounter) {
        postulacionesCounter.textContent = parseInt(postulacionesCounter.textContent) + 1;
    }
}

// Función para manejar errores del mapa
function handleMapError() {
    console.error('Error cargando el mapa');
    const mapElement = document.getElementById("map");
    if (mapElement) {
        mapElement.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
                background: linear-gradient(135deg, rgba(144, 238, 144, 0.2), rgba(74, 124, 89, 0.1));
                border-radius: 15px;
                color: #1e3a2e;
                text-align: center;
                padding: 20px;
            ">
                <div>
                    <div style="font-size: 48px; margin-bottom: 15px; color: #4a7c59;">
                        <i class="fas fa-map-marked-alt"></i>
                    </div>
                    <strong style="font-size: 16px; color: #1e3a2e;">Mapa no disponible</strong><br>
                    <small style="color: #4a7c59; font-size: 14px; display: block; margin-top: 5px;">
                        📍 8 trabajos en 10km de radio
                    </small>
                </div>
            </div>
        `;
    }
}

// Función para obtener y mostrar la foto de perfil del usuario
function loadUserProfilePhoto() {
    console.log('Cargando foto de perfil...');
    fetch('/get_user_session')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.user) {
                const photoUrl = data.user.url_foto;
                console.log('URL de foto recibida:', photoUrl);
                
                const profilePhotoElements = document.querySelectorAll('.profile-photo, #profilePhoto, .user-avatar, .profile-image, #profileAvatar, #dropdownAvatar, #profileMenuBtn');
                
                profilePhotoElements.forEach(element => {
                    if (photoUrl && photoUrl !== '' && photoUrl !== null) {
                        element.style.backgroundImage = `url('${photoUrl}')`;
                        element.style.backgroundSize = 'cover';
                        element.style.backgroundPosition = 'center';
                        element.style.borderRadius = '50%';
                        element.innerHTML = '';
                        console.log('Foto aplicada a elemento:', element.id || element.className);
                    } else {
                        element.innerHTML = '<i class="fas fa-user"></i>';
                        element.style.backgroundImage = 'none';
                        console.log('No hay foto, usando icono por defecto');
                    }
                });
            }
        })
        .catch(error => {
            console.error('Error cargando foto de perfil:', error);
        });
}

// Asegurarse de que las funciones estén disponibles globalmente
window.initMap = initMap;
window.handleMapError = handleMapError;
window.applyFromMap = applyFromMap;
window.toggleFavorite = toggleFavorite;

// Inicializar la página cuando se carga
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando dashboard de trabajador...');
    
    loadUserData();
    
    setTimeout(initMap, 500);
    
    // Agregar botones de favoritos a las tarjetas existentes
    addFavoriteButtonsToJobCards();
    
    // Animaciones para las tarjetas de trabajo
    const jobCards = document.querySelectorAll('.job-card');
    jobCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 150);
    });

    // Animación para estadísticas rápidas
    const quickStats = document.querySelectorAll('.quick-stat');
    quickStats.forEach((stat, index) => {
        const number = stat.querySelector('.quick-stat-number');
        const finalNumber = parseInt(number.textContent);
        
        let currentNumber = 0;
        const increment = finalNumber / 30;
        const counter = setInterval(() => {
            currentNumber += increment;
            if (currentNumber >= finalNumber) {
                number.textContent = finalNumber;
                clearInterval(counter);
            } else {
                number.textContent = Math.floor(currentNumber);
            }
        }, 50);
    });

    // Verificación de sesión cada 5 minutos
    setInterval(async () => {
        try {
            const response = await fetch('/check_session');
            const data = await response.json();
            
            if (!data.authenticated) {
                console.log('Sesión expirada, redirigiendo al login');
                window.location.href = '/vista/login-trabajador.html';
            }
        } catch (error) {
            console.error('Error verificando sesión:', error);
        }
    }, 5 * 60 * 1000);
});

// Función para agregar botones de favoritos a las tarjetas existentes
function addFavoriteButtonsToJobCards() {
    const jobCards = document.querySelectorAll('.job-card');
    jobCards.forEach((card, index) => {
        const jobFooter = card.querySelector('.job-footer');
        const applyBtn = card.querySelector('.apply-btn');
        const jobId = index + 1; // Simular ID basado en posición
        
        if (jobFooter && applyBtn) {
            // Crear botón de favoritos
            const favoriteBtn = document.createElement('button');
            favoriteBtn.className = 'favorite-btn';
            favoriteBtn.onclick = () => toggleFavorite(favoriteBtn, jobId);
            favoriteBtn.innerHTML = '<i class="far fa-heart"></i>';
            
            // Insertar antes del botón de aplicar
            jobFooter.insertBefore(favoriteBtn, applyBtn);
        }
    });
    
    // Después de agregar los botones, actualizar su estado
    setTimeout(updateFavoriteButtons, 500);
}

// Actualización en tiempo real de notificaciones
setInterval(() => {
    const badge = document.querySelector('.notification-badge');
    if (badge && Math.random() > 0.98) {
        const currentCount = parseInt(badge.textContent);
        badge.textContent = currentCount + 1;
        
        badge.style.animation = 'none';
        badge.offsetHeight;
        badge.style.animation = 'pulse 2s infinite';
    }
}, 1000);

// Función para actualizar trabajos disponibles
setInterval(() => {
    const trabajosCercaCount = document.querySelector('.quick-stat-number');
    if (trabajosCercaCount && Math.random() > 0.95) {
        const current = parseInt(trabajosCercaCount.textContent);
        const change = Math.random() > 0.5 ? 1 : -1;
        const newCount = Math.max(0, current + change);
        
        trabajosCercaCount.style.color = change > 0 ? '#4a7c59' : '#e74c3c';
        trabajosCercaCount.textContent = newCount;
        
        setTimeout(() => {
            trabajosCercaCount.style.color = '#4a7c59';
        }, 1000);
    }
}, 5000);

// Atajos de teclado
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'f':
                e.preventDefault();
                const searchBar = document.querySelector('.search-bar');
                if (searchBar) searchBar.focus();
                break;
            case 'n':
                e.preventDefault();
                showNotifications();
                break;
            case 'm':
                e.preventDefault();
                const mapElement = document.getElementById('map');
                if (mapElement) mapElement.scrollIntoView({ behavior: 'smooth' });
                break;
            case 'h':
                e.preventDefault();
                showHistorialEmpleos();
                break;
            case 'p':
                e.preventDefault();
                showPostulaciones();
                break;
        }
    }
});

function showFavoritos() {
    const dropdown = document.getElementById('dynamicProfileDropdown');
    if (dropdown) {
        dropdown.style.display = 'none';
        dropdown.style.opacity = '0';
        dropdown.style.transform = 'translateY(-10px)';
        dropdown.style.pointerEvents = 'none';
    }
    
    window.location.href = 'favoritos.html';
}

// Funciones para navegación a nuevas páginas
function showFavoritos() {
    const dropdown = document.getElementById('dynamicProfileDropdown');
    if (dropdown) {
        dropdown.style.display = 'none';
        dropdown.style.opacity = '0';
        dropdown.style.transform = 'translateY(-10px)';
        dropdown.style.pointerEvents = 'none';
    }
    window.location.href = 'favoritos.html';
}

function showHistorialEmpleos() {
    const dropdown = document.getElementById('dynamicProfileDropdown');
    if (dropdown) {
        dropdown.style.display = 'none';
        dropdown.style.opacity = '0';
        dropdown.style.transform = 'translateY(-10px)';
        dropdown.style.pointerEvents = 'none';
    }
    window.location.href = 'historial-empleos.html';
}

function showPostulaciones() {
    const dropdown = document.getElementById('dynamicProfileDropdown');
    if (dropdown) {
        dropdown.style.display = 'none';
        dropdown.style.opacity = '0';
        dropdown.style.transform = 'translateY(-10px)';
        dropdown.style.pointerEvents = 'none';
    }
    window.location.href = 'postulaciones.html';
}

// Función para alternar favoritos
async function toggleFavorite(button, jobId) {
    const jobCard = button.closest('.job-card');
    const jobTitle = jobCard.querySelector('.job-title').textContent;
    const isFavorite = button.classList.contains('active');
    
    try {
        const response = await fetch('/api/favoritos', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                job_id: jobId,
                job_title: jobTitle,
                action: isFavorite ? 'remove' : 'add'
            })
        });

        const data = await response.json();
        if (data.success) {
            button.classList.toggle('active');
            button.innerHTML = button.classList.contains('active') ? 
                '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
            
            // Animación
            button.style.transform = 'scale(1.2)';
            setTimeout(() => button.style.transform = 'scale(1)', 200);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// ===================================================================
// JAVASCRIPT TRABAJADOR - FUNCIONES ACTUALIZADAS PARA OFERTAS
// ===================================================================

// Agregar estas funciones al final del archivo index-trabajador.js existente

// Variables globales para ofertas
let ofertasDisponibles = [];
let favoritos = [];

// ===================================================================
// FUNCIONES ACTUALIZADAS PARA CARGAR OFERTAS
// ===================================================================

/**
 * Cargar trabajos disponibles - FUNCIÓN ACTUALIZADA
 */
function loadAvailableJobs() {
    fetch('/api/get_jobs')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            ofertasDisponibles = data.jobs;
            displayJobs(data.jobs);
            updateJobsCount(data.jobs.length);
            console.log('Ofertas cargadas:', data.jobs.length);
        } else {
            showNoJobsMessage();
        }
    })
    .catch(error => {
        console.error('Error al cargar trabajos:', error);
        showNoJobsMessage();
    });
}

/**
 * Mostrar trabajos en la interfaz - FUNCIÓN ACTUALIZADA
 */
function displayJobs(jobs) {
    const jobsList = document.getElementById('jobsList');
    const noJobsMessage = document.getElementById('noJobsMessage');
    
    if (jobs.length === 0) {
        showNoJobsMessage();
        return;
    }
    
    jobsList.innerHTML = '';
    if (noJobsMessage) noJobsMessage.style.display = 'none';
    
    jobs.forEach(job => {
        const jobCard = createJobCard(job);
        jobsList.appendChild(jobCard);
    });
    
    // Cargar favoritos después de mostrar trabajos
    loadFavorites();
}

/**
 * Crear tarjeta de trabajo - FUNCIÓN ACTUALIZADA
 */
function createJobCard(job) {
    const div = document.createElement('div');
    div.className = 'job-card';
    
    // Calcular días desde publicación
    const fechaPublicacion = new Date(job.fecha_publicacion);
    const ahora = new Date();
    const diasPublicada = Math.floor((ahora - fechaPublicacion) / (1000 * 60 * 60 * 24));
    
    // Formatear descripción (tomar solo las primeras 200 caracteres)
    let descripcionCorta = job.descripcion;
    if (descripcionCorta.length > 200) {
        descripcionCorta = descripcionCorta.substring(0, 200) + '...';
    }
    
    div.innerHTML = `
        <div class="job-header">
            <div class="job-title">${job.titulo}</div>
            <div class="job-salary">${Number(job.pago_ofrecido).toLocaleString()}/día</div>
        </div>
        <div class="job-details">
            ${descripcionCorta}
        </div>
        <div class="job-meta">
            <div class="job-meta-item">
                <i class="fas fa-user"></i>
                <span>${job.nombre_agricultor}</span>
            </div>
            <div class="job-meta-item">
                <i class="fas fa-calendar"></i>
                <span>Hace ${diasPublicada === 0 ? 'hoy' : diasPublicada + ' día' + (diasPublicada > 1 ? 's' : '')}</span>
            </div>
            <div class="job-meta-item">
                <i class="fas fa-users"></i>
                <span>${job.num_postulaciones || 0} postulaciones</span>
            </div>
        </div>
        <div class="job-footer">
            <div class="job-tags">
                <span class="job-tag">${job.estado}</span>
            </div>
            <div class="job-actions">
                <button class="favorite-btn" onclick="toggleFavorite(this, ${job.id_oferta})" data-job-id="${job.id_oferta}">
                    <i class="far fa-heart"></i>
                </button>
                <button class="apply-btn" onclick="showApplyModal(${job.id_oferta}, '${job.titulo.replace(/'/g, "\\'")}')">
                    <i class="fas fa-paper-plane"></i> Postularme
                </button>
            </div>
        </div>
    `;
    
    return div;
}

/**
 * Cargar favoritos del usuario
 */
async function loadFavorites() {
    try {
        const response = await fetch('/api/favoritos');
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                favoritos = data.favoritos.map(f => f.job_id);
                updateFavoriteButtons();
            }
        }
    } catch (error) {
        console.error('Error cargando favoritos:', error);
    }
}

/**
 * Actualizar botones de favoritos
 */
function updateFavoriteButtons() {
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    favoriteButtons.forEach(button => {
        const jobId = parseInt(button.getAttribute('data-job-id'));
        const isFavorite = favoritos.includes(jobId);
        
        button.classList.toggle('active', isFavorite);
        const icon = button.querySelector('i');
        
        if (isFavorite) {
            icon.classList.remove('far');
            icon.classList.add('fas');
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
        }
    });
}

/**
 * Alternar favorito - FUNCIÓN ACTUALIZADA
 */
async function toggleFavorite(button, jobId) {
    const jobCard = button.closest('.job-card');
    const jobTitle = jobCard.querySelector('.job-title').textContent;
    
    const isFavorite = favoritos.includes(jobId);
    
    try {
        const response = await fetch('/api/favoritos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                job_id: jobId,
                job_title: jobTitle,
                action: isFavorite ? 'remove' : 'add'
            })
        });

        const data = await response.json();
        
        if (data.success) {
            if (isFavorite) {
                // Remover de favoritos
                favoritos = favoritos.filter(id => id !== jobId);
                button.classList.remove('active');
                button.innerHTML = '<i class="far fa-heart"></i>';
                showToast('info', 'Removido de favoritos', jobTitle);
            } else {
                // Agregar a favoritos
                favoritos.push(jobId);
                button.classList.add('active');
                button.innerHTML = '<i class="fas fa-heart"></i>';
                showToast('success', 'Agregado a favoritos', jobTitle);
            }
            
            // Animación del botón
            button.style.transform = 'scale(1.2)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 200);
            
        } else {
            throw new Error(data.message || 'Error al actualizar favorito');
        }
        
    } catch (error) {
        console.error('Error actualizando favorito:', error);
        showToast('error', 'Error', 'No se pudo actualizar el favorito');
    }
}

/**
 * Mostrar modal de postulación - FUNCIÓN ACTUALIZADA
 */
function showApplyModal(jobId, jobTitle) {
    selectedJobId = jobId;
    document.getElementById('jobDetailsForApplication').innerHTML = `
        <strong>Trabajo:</strong> ${jobTitle}
    `;
    document.getElementById('applyJobModal').style.display = 'flex';
    document.getElementById('overlay').style.display = 'block';
}

/**
 * Confirmar postulación - FUNCIÓN ACTUALIZADA
 */
function confirmApplication() {
    if (!selectedJobId) return;
    
    const btnConfirm = document.getElementById('confirmApplyBtn');
    const originalText = btnConfirm.innerHTML;
    
    btnConfirm.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    btnConfirm.disabled = true;
    
    fetch('/api/apply_job', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            job_id: selectedJobId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            btnConfirm.innerHTML = '<i class="fas fa-check"></i> ¡Enviado!';
            btnConfirm.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
            
            showToast('success', 'Postulación enviada', 'Tu postulación ha sido enviada exitosamente');
            
            setTimeout(() => {
                closeApplyModal();
                loadAvailableJobs(); // Recargar trabajos
                loadStats(); // Actualizar estadísticas
            }, 1500);
            
        } else {
            throw new Error(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('error', 'Error', error.message || 'Error de conexión. Intenta de nuevo.');
        
        btnConfirm.innerHTML = originalText;
        btnConfirm.disabled = false;
        btnConfirm.style.background = '';
    });
}

/**
 * Cargar mis trabajos - FUNCIÓN ACTUALIZADA
 */
function loadMyJobs() {
    fetch('/api/get_my_jobs')
    .then(response => response.json())
    .then(data => {
        if (data.success && data.jobs.length > 0) {
            displayMyJobs(data.jobs);
        } else {
            const noMyJobsMessage = document.getElementById('noMyJobsMessage');
            if (noMyJobsMessage) {
                noMyJobsMessage.style.display = 'block';
            }
        }
    })
    .catch(error => {
        console.error('Error al cargar mis trabajos:', error);
    });
}

/**
 * Mostrar mis trabajos - FUNCIÓN ACTUALIZADA
 */
function displayMyJobs(jobs) {
    const myJobsList = document.getElementById('myJobsList');
    const noMyJobsMessage = document.getElementById('noMyJobsMessage');
    
    if (!myJobsList) return;
    
    myJobsList.innerHTML = '';
    if (noMyJobsMessage) noMyJobsMessage.style.display = 'none';
    
    jobs.forEach(job => {
        const jobCard = createMyJobCard(job);
        myJobsList.appendChild(jobCard);
    });
}

/**
 * Crear tarjeta de mi trabajo - FUNCIÓN ACTUALIZADA
 */
function createMyJobCard(job) {
    const div = document.createElement('div');
    div.className = 'job-card my-job-card';
    
    let statusClass = '';
    let statusText = '';
    
    switch(job.estado) {
        case 'Pendiente':
            statusClass = 'status-pending';
            statusText = 'Pendiente';
            break;
        case 'Aceptada':
            statusClass = 'status-confirmed';
            statusText = 'Confirmado';
            break;
        case 'Rechazada':
            statusClass = 'status-rejected';
            statusText = 'Rechazado';
            break;
        case 'Favorito':
            statusClass = 'status-favorite';
            statusText = 'Favorito';
            break;
    }
    
    // Formatear descripción
    let descripcionCorta = job.descripcion;
    if (descripcionCorta.length > 150) {
        descripcionCorta = descripcionCorta.substring(0, 150) + '...';
    }
    
    div.innerHTML = `
        <div class="job-header">
            <div class="job-title">${job.titulo}</div>
            <div class="job-status ${statusClass}">${statusText}</div>
        </div>
        <div class="job-details">
            ${descripcionCorta}
        </div>
        <div class="job-meta">
            <div class="job-meta-item">
                <i class="fas fa-user"></i>
                <span>${job.nombre_agricultor}</span>
            </div>
            <div class="job-meta-item">
                <i class="fas fa-calendar"></i>
                <span>Postulado: ${formatDate(job.fecha_postulacion)}</span>
            </div>
            <div class="job-meta-item">
                <i class="fas fa-dollar-sign"></i>
                <span>${Number(job.pago_ofrecido).toLocaleString()}</span>
            </div>
        </div>
    `;
    
    return div;
}

/**
 * Cargar estadísticas - FUNCIÓN ACTUALIZADA
 */
function loadStats() {
    fetch('/api/get_worker_stats')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const applicationsCount = document.getElementById('applicationsCount');
            const activeJobsCount = document.getElementById('activeJobsCount');
            const totalJobs = document.getElementById('totalJobs');
            const totalHours = document.getElementById('totalHours');
            
            if (applicationsCount) applicationsCount.textContent = data.applications || 0;
            if (activeJobsCount) activeJobsCount.textContent = data.active_jobs || 0;
            if (totalJobs) totalJobs.textContent = data.total_jobs || 0;
            if (totalHours) totalHours.textContent = (data.total_hours || 0) + 'h';
        }
    })
    .catch(error => {
        console.error('Error al cargar estadísticas:', error);
    });
}

/**
 * Filtrar trabajos - FUNCIÓN MEJORADA
 */
function filterJobs(searchTerm) {
    const jobCards = document.querySelectorAll('#jobsList .job-card');
    const searchLower = searchTerm.toLowerCase();
    
    jobCards.forEach(card => {
        const title = card.querySelector('.job-title').textContent.toLowerCase();
        const details = card.querySelector('.job-details').textContent.toLowerCase();
        const agricultor = card.querySelector('.job-meta .fa-user').nextElementSibling.textContent.toLowerCase();
        
        if (title.includes(searchLower) || details.includes(searchLower) || agricultor.includes(searchLower)) {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.5s ease';
        } else {
            card.style.display = 'none';
        }
    });
}

/**
 * Filtrar por tipo - FUNCIÓN MEJORADA
 */
function filterByType(button, type) {
    // Remover clase active de todos los botones
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Agregar clase active al botón seleccionado
    button.classList.add('active');
    
    const jobCards = document.querySelectorAll('#jobsList .job-card');
    
    jobCards.forEach(card => {
        if (type === 'todos') {
            card.style.display = 'block';
        } else {
            const title = card.querySelector('.job-title').textContent.toLowerCase();
            const description = card.querySelector('.job-details').textContent.toLowerCase();
            
            // Buscar el tipo en el título o descripción
            if (title.includes(type) || description.includes(type)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        }
    });
}

/**
 * Mostrar notificaciones Toast
 */
function showToast(tipo, titulo, mensaje) {
    // Remover toast anterior si existe
    const toastAnterior = document.querySelector('.toast');
    if (toastAnterior) {
        toastAnterior.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    
    const iconos = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-triangle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-circle'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${iconos[tipo]}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${titulo}</div>
            <div class="toast-message">${mensaje}</div>
        </div>
    `;
    
    // Estilos del toast
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        padding: 20px 24px;
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 10001;
        transform: translateX(400px);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        border-left: 5px solid ${tipo === 'success' ? '#22c55e' : tipo === 'error' ? '#ef4444' : '#4a7c59'};
        max-width: 400px;
    `;
    
    // Estilos del icono
    const icon = toast.querySelector('.toast-icon');
    icon.style.cssText = `
        font-size: 18px;
        color: ${tipo === 'success' ? '#22c55e' : tipo === 'error' ? '#ef4444' : '#4a7c59'};
    `;
    
    // Estilos del contenido
    const content = toast.querySelector('.toast-content');
    content.style.cssText = 'flex: 1;';
    
    const title = toast.querySelector('.toast-title');
    title.style.cssText = `
        font-weight: 600;
        color: #1e3a2e;
        margin-bottom: 2px;
    `;
    
    const message = toast.querySelector('.toast-message');
    message.style.cssText = `
        color: #6b7280;
        font-size: 14px;
    `;
    
    document.body.appendChild(toast);
    
    // Mostrar con animación
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover después de 4 segundos
    setTimeout(() => {
        toast.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 400);
    }, 4000);
}

/**
 * Funciones auxiliares
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
}

function showNoJobsMessage() {
    const jobsList = document.getElementById('jobsList');
    const noJobsMessage = document.getElementById('noJobsMessage');
    
    if (jobsList) jobsList.innerHTML = '';
    if (noJobsMessage) noJobsMessage.style.display = 'block';
}

function updateJobsCount(count) {
    const jobsNearCount = document.getElementById('jobsNearCount');
    if (jobsNearCount) jobsNearCount.textContent = count;
}

function closeApplyModal() {
    const modal = document.getElementById('applyJobModal');
    const overlay = document.getElementById('overlay');
    
    if (modal) modal.style.display = 'none';
    if (overlay) overlay.style.display = 'none';
    
    selectedJobId = null;
    
    // Restaurar botón
    const btnConfirm = document.getElementById('confirmApplyBtn');
    if (btnConfirm) {
        btnConfirm.innerHTML = '<i class="fas fa-paper-plane"></i> Confirmar Postulación';
        btnConfirm.disabled = false;
        btnConfirm.style.background = '';
    }
}

// ===================================================================
// INICIALIZACIÓN ACTUALIZADA
// ===================================================================

// En la función de inicialización del trabajador, asegúrate de tener:
document.addEventListener('DOMContentLoaded', function() {
    loadUserProfile();
    loadAvailableJobs();  // Esta línea debe estar aquí
    loadMyJobs();
    loadStats();
    setTimeout(loadUserProfilePhoto, 1000);
});