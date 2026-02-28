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
     * Funciona correctamente tanto en producción (dominio raíz), como en
     * desarrollo local con servidor en subcarpeta (ej: localhost:8000/mi-proyecto/).
     * Detecta la raíz buscando el segmento del proyecto en la ruta.
     */
    function getBasePath() {
        const path = window.location.pathname;

        // Normalizar: quitar nombre de archivo si existe, dejar solo el directorio
        const dir = path.endsWith('/') ? path : path.substring(0, path.lastIndexOf('/') + 1);

        // Dividir la ruta en segmentos
        const segments = dir.split('/').filter(function (s) { return s.length > 0; });

        // Detectar si el proyecto está en la raíz del servidor o en una subcarpeta.
        // Buscamos el segmento que corresponde a la carpeta raíz del proyecto.
        const projectRootIndex = segments.findIndex(function (s) {
            // Coincide con la carpeta del proyecto o con nombres como 'IDEA-Projet-Agency'
            return s.toLowerCase().indexOf('idea') !== -1 ||
                s.toLowerCase().indexOf('agency') !== -1;
        });

        var depth;
        if (projectRootIndex !== -1) {
            // El proyecto está en una subcarpeta: profundidad = segmentos después de la raíz del proyecto
            depth = segments.length - projectRootIndex - 1;
        } else {
            // El proyecto está en la raíz del servidor (producción)
            depth = segments.length;
        }

        // Devuelve '' si estamos en la raíz, o '../' repetido según la profundidad
        return depth === 0 ? '' : '../'.repeat(depth);
    }

    /**
     * Ajusta rutas relativas dentro de un componente HTML cargado.
     * Prepone basePath a rutas que no son absolutas ni externas.
     * Si basePath es '' (estamos en la raíz), la concatenación no altera nada.
     */
    function adjustPaths(element, basePath) {
        // Si no hay basePath que ajustar, salir
        if (!basePath) return;

        element.querySelectorAll('[href]').forEach(function (link) {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('#') && !href.startsWith('http') && !href.startsWith('/') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                link.setAttribute('href', basePath + href);
            }
        });

        element.querySelectorAll('[src]').forEach(function (source) {
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
            .then(function (response) {
                if (!response.ok) throw new Error('HTTP ' + response.status);
                return response.text();
            })
            .then(function (html) {
                const placeholder = document.getElementById(placeholderId);
                if (!placeholder) {
                    console.warn('⚠️ Placeholder #' + placeholderId + ' no encontrado');
                    return;
                }
                placeholder.innerHTML = html;
                adjustPaths(placeholder, basePath);
                console.log('✅ ' + componentName + ' cargado desde ' + componentPath);
            })
            .catch(function (error) {
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

        mobileMenuButton.addEventListener('click', function (e) {
            e.preventDefault();
            const hidden = mobileMenu.classList.toggle('hidden');
            const icon = this.querySelector('.material-symbols-outlined');
            if (icon) icon.textContent = hidden ? 'menu' : 'close';
        });

        document.querySelectorAll('.mobile-dropdown').forEach(function (dropdown) {
            const btn = dropdown.querySelector('.mobile-dropdown-btn');
            const content = dropdown.querySelector('.mobile-dropdown-content');
            if (btn && content) {
                btn.addEventListener('click', function (e) {
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
        loadComponent('header', 'header-placeholder').then(function () {
            initMobileMenu();
        });

        // Footer: diferido, no bloquea el render
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(function () {
                loadComponent('footer', 'footer-placeholder');
            });
        } else {
            setTimeout(function () {
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
