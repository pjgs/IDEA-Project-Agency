/**
 * 📦 IDEA Projet - Component Loader (SiteGround Edition)
 * Carga automáticamente header y footer desde /components/
 * Usa rutas absolutas desde la raíz del dominio para máxima fiabilidad.
 *
 * ✅ Compatible con: SiteGround / Apache / cPanel
 * ❌ GitHub Pages no soporta fetch entre archivos estáticos locales.
 */

(function () {
    'use strict';

    /**
     * Detecta si estamos en un servidor real (HTTP/HTTPS) o en archivo local.
     * Los servidores reales usan rutas absolutas; local usa relativas como fallback.
     */
    function isServerContext() {
        return window.location.protocol === 'http:' || window.location.protocol === 'https:';
    }

    /**
     * Calcula la ruta base al directorio raíz del proyecto.
     * En producción usa '/' (ruta absoluta, siempre correcta).
     * En local usa rutas relativas calculando la profundidad de la ruta.
     */
    function getBasePath() {
        // En servidor real: siempre usar ruta absoluta desde la raíz
        if (isServerContext()) {
            return '/';
        }

        // Fallback para desarrollo local (file://)
        const path = window.location.pathname;
        const normalizedPath = path.replace(/\/index\.html$/, '/').replace(/\/[^/]*\.html$/, '/');
        const segments = normalizedPath.split('/').filter(function(s) {
            return s && !s.endsWith('.html');
        });

        // Eliminar segmentos de rutas locales típicas (Windows file://)
        const filtered = segments.filter(function(s) {
            return !s.match(/^[A-Z]:$/i) &&
                   s !== 'Users' &&
                   s !== 'Webs' &&
                   !s.startsWith('IDEA-Projet-Agency') &&
                   s !== 'Web_IDEA';
        });

        const depth = filtered.length;
        return depth === 0 ? '' : '../'.repeat(depth);
    }

    /**
     * Ajusta rutas relativas dentro de un componente HTML cargado.
     * Solo aplica a rutas que NO sean absolutas ni externas.
     */
    function adjustPaths(element, basePath) {
        // No ajustar si ya usamos rutas absolutas (/ al inicio)
        if (basePath === '/') return;

        element.querySelectorAll('[href]').forEach(function(link) {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('#') && !href.startsWith('http') && !href.startsWith('/') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                link.setAttribute('href', basePath + href);
            }
        });

        element.querySelectorAll('[src]').forEach(function(source) {
            const src = source.getAttribute('src');
            if (src && !src.startsWith('http') && !src.startsWith('/') && !src.startsWith('data:')) {
                source.setAttribute('src', basePath + src);
            }
        });
    }

    /**
     * Carga un componente HTML e inyecta su contenido en un placeholder.
     */
    function loadComponent(componentName, placeholderId) {
        const basePath = getBasePath();
        const componentPath = basePath + 'components/' + componentName + '.html';

        return fetch(componentPath)
            .then(function(response) {
                if (!response.ok) throw new Error('HTTP ' + response.status);
                return response.text();
            })
            .then(function(html) {
                const placeholder = document.getElementById(placeholderId);
                if (!placeholder) {
                    console.warn('⚠️ Placeholder #' + placeholderId + ' no encontrado');
                    return;
                }
                placeholder.innerHTML = html;
                adjustPaths(placeholder, basePath);
                console.log('✅ ' + componentName + ' cargado desde ' + componentPath);
            })
            .catch(function(error) {
                console.error('❌ Error cargando ' + componentName + ':', error);
            });
    }

    /**
     * Inicializa el menú móvil tras cargar el header.
     */
    function initMobileMenu() {
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');

        if (!mobileMenuButton || !mobileMenu) {
            console.warn('⚠️ Elementos del menú móvil no encontrados');
            return;
        }

        mobileMenuButton.addEventListener('click', function(e) {
            e.preventDefault();
            const hidden = mobileMenu.classList.toggle('hidden');
            const icon = this.querySelector('.material-symbols-outlined');
            if (icon) icon.textContent = hidden ? 'menu' : 'close';
        });

        document.querySelectorAll('.mobile-dropdown').forEach(function(dropdown) {
            const btn     = dropdown.querySelector('.mobile-dropdown-btn');
            const content = dropdown.querySelector('.mobile-dropdown-content');
            if (btn && content) {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    content.classList.toggle('hidden');
                    const icon = this.querySelector('.material-symbols-outlined');
                    if (icon) icon.style.transform = content.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
                });
            }
        });

        console.log('✅ Menú móvil inicializado');
    }

    /**
     * Inicialización principal.
     */
    function init() {
        const basePath = getBasePath();
        const protocol = window.location.protocol;
        console.log('📍 Protocol:', protocol, '| BasePath:', basePath || '(raíz relativa)');

        // Cargar header primero (crítico), luego inicializar menú
        loadComponent('header', 'header-placeholder').then(function() {
            initMobileMenu();
        });

        // Footer: diferido, no bloquea el render
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(function() {
                loadComponent('footer', 'footer-placeholder');
            });
        } else {
            setTimeout(function() {
                loadComponent('footer', 'footer-placeholder');
            }, 150);
        }
    }

    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
