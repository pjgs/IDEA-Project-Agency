/**
 * Script optimizado para cargar componentes HTML dinámicamente
 * Incluye cache en sessionStorage, rutas dinámicas y detección de página activa
 */

// Cache en sessionStorage para evitar múltiples fetch
const CACHE_KEY_PREFIX = 'component_cache_';
const CACHE_VERSION = 'v1'; // Incrementa esto cuando cambies los componentes

// Calcular BASE_PATH dinámicamente según el nivel del directorio
function getBasePath() {
    const path = window.location.pathname;

    // Normalizar la ruta (eliminar index.html si existe)
    const normalizedPath = path.replace(/\/index\.html$/, '/');

    // Contar niveles de profundidad (excluir el archivo actual)
    const segments = normalizedPath.split('/').filter(segment => segment && segment !== 'index.html');

    // Determinar profundidad
    let depth = 0;

    // Si estamos en root o index.html directamente
    if (segments.length === 0 || (segments.length === 1 && segments[0].endsWith('.html'))) {
        depth = 0;
    }
    // Si estamos en pages/subdirectorio/
    else if (segments.includes('pages')) {
        const pagesIndex = segments.indexOf('pages');
        depth = segments.length - pagesIndex;
    }

    // Generar el path relativo
    return depth === 0 ? '' : '../'.repeat(depth);
}

// Detectar qué página está activa
function detectActivePage() {
    const path = window.location.pathname.toLowerCase();

    if (path.includes('servicios-digitales')) {
        return 'servicios-digitales';
    } else if (path.includes('publicidad-convencional')) {
        return 'publicidad-convencional';
    } else if (path.includes('#contact') || path.endsWith('#contact')) {
        return 'contact';
    } else if (path.endsWith('/') || path.endsWith('index.html') || path.split('/').length <= 2) {
        return 'home';
    }

    return null;
}

// Resaltar página activa en el menú
function highlightActivePage() {
    const activePage = detectActivePage();

    if (!activePage) return;

    // Buscar todos los links con data-page
    const links = document.querySelectorAll('[data-page]');

    links.forEach(link => {
        const linkPage = link.getAttribute('data-page');

        if (linkPage === activePage) {
            // Añadir clases para resaltar
            link.classList.add('font-extrabold');
            link.style.textDecoration = 'underline';
            link.style.textUnderlineOffset = '4px';
            link.style.textDecorationThickness = '2px';
        }
    });
}

// Función optimizada para cargar componentes
function loadComponent(placeholderId, componentPath) {
    const placeholder = document.getElementById(placeholderId);
    if (!placeholder) return;

    const cacheKey = `${CACHE_KEY_PREFIX}${CACHE_VERSION}_${componentPath}`;
    const basePath = getBasePath();

    // Intentar cargar desde cache primero
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
        // Reemplazar placeholders con BASE_PATH
        const processedHTML = cached.replace(/\{\{BASE_PATH\}\}/g, basePath);
        placeholder.innerHTML = processedHTML;

        // Resaltar página activa después de cargar
        setTimeout(highlightActivePage, 0);
        return Promise.resolve();
    }

    // Si no hay cache, hacer fetch
    return fetch(componentPath)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.text();
        })
        .then(html => {
            // Guardar en cache SIN reemplazar placeholders (para reutilización)
            sessionStorage.setItem(cacheKey, html);

            // Reemplazar placeholders para esta instancia
            const processedHTML = html.replace(/\{\{BASE_PATH\}\}/g, basePath);
            placeholder.innerHTML = processedHTML;

            // Resaltar página activa después de cargar
            setTimeout(highlightActivePage, 0);
        })
        .catch(error => {
            console.error(`Error loading ${componentPath}:`, error);
            placeholder.innerHTML = `<!-- Failed to load ${componentPath} -->`;
        });
}

// Función para cargar el header (crítico)
function loadHeader() {
    const basePath = getBasePath();
    return loadComponent('header-placeholder', `${basePath}components/header.html`);
}

// Función para cargar el footer (no crítico)
function loadFooter() {
    const basePath = getBasePath();
    const footerPath = `${basePath}components/footer.html`;

    // Usar requestIdleCallback para carga no crítica (footer)
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => loadComponent('footer-placeholder', footerPath));
    } else {
        // Fallback para navegadores que no soportan requestIdleCallback
        setTimeout(() => loadComponent('footer-placeholder', footerPath), 100);
    }
}

// Cargar componentes de manera optimizada
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHeader);
} else {
    // DOM ya cargado, ejecutar inmediatamente
    loadHeader();
}

// Footer se carga después (no crítico)
loadFooter();
