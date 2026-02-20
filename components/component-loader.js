/**
 * 📦 IDEA Projet - Component Loader
 * Carga automáticamente header y footer desde carpeta components/
 * Auto-ajusta rutas relativas según nivel de profundidad de la página
 */

(function () {
    'use strict';

    /**
     * Calcula la profundidad de la ruta actual (cuántos niveles de carpetas estamos)
     * @returns {number} Número de niveles desde la raíz
     */
    function getPathDepth() {
        const path = window.location.pathname;
        // Eliminar el nombre del archivo y contar las carpetas
        const pathWithoutFile = path.substring(0, path.lastIndexOf('/'));
        const segments = pathWithoutFile.split('/').filter(s => s.length > 0);

        // Filtrar segmentos que no son carpetas reales del proyecto
        const projectSegments = segments.filter(s =>
            !s.match(/^[A-Z]:$/i) && // Letra de disco en Windows (C:, D:, etc.)
            s !== 'IDEA_Project' &&
            s !== 'Web_IDEA' &&
            !s.startsWith('IDEA-Projet-Agency') // Incluye "IDEA-Projet-Agency - copia"
        );

        return projectSegments.length;
    }

    /**
     * Genera el prefijo de ruta relativa según la profundidad
     * @returns {string} Prefijo de ruta (ej: '', '../', '../../')
     */
    function getRelativePathPrefix() {
        const depth = getPathDepth();
        if (depth === 0) return ''; // Estamos en la raíz
        return '../'.repeat(depth);
    }

    /**
      * Ajusta todas las rutas dentro de un elemento HTML según la profundidad actual
      * @param {HTMLElement} element - Elemento que contiene rutas a ajustar
      */
    function adjustPaths(element) {
        const prefix = getRelativePathPrefix();

        // Ajustar todos los href
        const links = element.querySelectorAll('[href]');
        links.forEach(link => {
            const href = link.getAttribute('href');

            // No ajustar anclas (#), enlaces externos (http), o rutas ya absolutas
            if (href && !href.startsWith('#') && !href.startsWith('http') && !href.startsWith('/')) {
                link.setAttribute('href', prefix + href);
            }
        });

        // Ajustar todos los src (imágenes, scripts, etc.)
        const sources = element.querySelectorAll('[src]');
        sources.forEach(source => {
            const src = source.getAttribute('src');

            // No ajustar CDN o rutas absolutas
            if (src && !src.startsWith('http') && !src.startsWith('/') && !src.startsWith('data:')) {
                source.setAttribute('src', prefix + src);
            }
        });
    }

    /**
     * Carga un componente HTML desde la carpeta components/
     * @param {string} componentName - Nombre del componente (header, footer)
     * @param {string} placeholderId - ID del placeholder donde insertar el componente
     * @returns {Promise} Promesa que se resuelve cuando el componente está cargado
     */
    async function loadComponent(componentName, placeholderId) {
        const prefix = getRelativePathPrefix();
        const componentPath = `${prefix}components/${componentName}.html`;

        try {
            const response = await fetch(componentPath);

            if (!response.ok) {
                throw new Error(`No se pudo cargar ${componentName}: ${response.status}`);
            }

            const html = await response.text();
            const placeholder = document.getElementById(placeholderId);

            if (placeholder) {
                placeholder.innerHTML = html;

                // Ajustar rutas después de insertar el HTML
                adjustPaths(placeholder);

                console.log(`✅ ${componentName} cargado correctamente desde ${componentPath}`);
                return Promise.resolve();
            } else {
                console.warn(`⚠️ Placeholder #${placeholderId} no encontrado`);
                return Promise.reject(new Error(`Placeholder no encontrado: ${placeholderId}`));
            }
        } catch (error) {
            console.error(`❌ Error cargando ${componentName}:`, error);
            return Promise.reject(error);
        }
    }

    /**
     * Inicializa el menú móvil después de cargar el header
     */
    function initMobileMenu() {
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileDropdowns = document.querySelectorAll('.mobile-dropdown');

        if (!mobileMenuButton || !mobileMenu) {
            console.warn('⚠️ No se encontraron elementos del menú');
            return;
        }

        // Toggle principal
        mobileMenuButton.onclick = function (e) {
            e.preventDefault();
            const hide = mobileMenu.classList.toggle('hidden');
            const icon = this.querySelector('.material-symbols-outlined');
            if (icon) icon.textContent = hide ? 'menu' : 'close';
            console.log('📱 Menú toggle:', hide ? 'oculto' : 'visible');
        };

        // Dropdowns internos
        mobileDropdowns.forEach(dropdown => {
            const btn = dropdown.querySelector('.mobile-dropdown-btn');
            const content = dropdown.querySelector('.mobile-dropdown-content');
            if (btn && content) {
                btn.onclick = function (e) {
                    e.preventDefault();
                    content.classList.toggle('hidden');
                    const icon = this.querySelector('.material-symbols-outlined');
                    if (icon) icon.style.transform = content.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
                };
            }
        });
        console.log('✅ Menú móvil configurado');
    }

    /**
     * Inicializa la carga de componentes cuando el DOM esté listo
     */
    function init() {
        console.log(`📍 Profundidad de ruta: ${getPathDepth()} niveles`);
        console.log(`🔗 Prefijo relativo: "${getRelativePathPrefix() || '(raíz)'}"`);

        // Cargar header y footer
        loadComponent('header', 'header-placeholder').then(() => {
            // Inicializar menú móvil después de cargar el header
            initMobileMenu();
        });
        loadComponent('footer', 'footer-placeholder');
    }

    // Ejecutar cuando el DOM esté completamente cargado
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
