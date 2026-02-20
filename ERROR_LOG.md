# Registro de Errores - IDEA Projet Agency

## [2026-02-09] Error: Bug en Menú Móvil
- **Causa**: Conflicto entre selectores de clase tras la migración a arquitectura BEM.
- **Solución**: Refactorización del script `mobile-menu.js` para usar selectores específicos de BEM.
- **Prevención**: Verificar selectores JS cada vez que se modifique la estructura HTML/CSS de componentes globales.

## [2026-02-09] Error: Hover desincronizado en Publicidad Convencional
- **Causa**: Los event listeners estaban vinculados solo a los íconos y no al contenedor de la card.
- **Solución**: Cambiar el target del event listener al contenedor `.card`.
- **Prevención**: Usar delegación de eventos o aplicar efectos hover vía CSS siempre que sea posible.
