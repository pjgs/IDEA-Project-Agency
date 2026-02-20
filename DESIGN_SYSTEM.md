# IDEA Projet Agency - Design System

## 🎨 Paleta de Colores

### Brand Colors
| Name | Variable | Hex | Usage |
|------|----------|-----|-------|
| Digital Purple | `--brand-digital` | `#a855f7` | Servicios digitales, acentos secundarios. |
| Print Blue | `--brand-print` | `#3b82f6` | Publicidad convencional, acentos primarios. |

### Semantic Colors
| Usage | Light Variable | Dark Variable |
|-------|----------------|---------------|
| Background | `--bg-light` (`#f3f4f6`) | `--bg-dark` (`#0a0a0a`) |
| Surface | `--surface-light` (`#ffffff`) | `--surface-dark` (`#171717`) |
| Text Primary | `--text-primary-light` (`#111827`) | `--text-primary-dark` (`#ffffff`) |
| Text Secondary | `--text-secondary-light` (`#4b5563`) | `--text-secondary-dark` (`#9ca3af`) |

---

## Typography 📖

- **Display/Headings**: `Plus Jakarta Sans`, sans-serif.
  - Weights: 700 (Bold), 800 (Black).
  - Usage: Titles, buttons, navigation.
- **Body**: `Noto Sans`, sans-serif.
  - Weights: 400 (Normal), 500 (Medium).
  - Usage: Paragraphs, descriptions, forms.

---

## Spacing & Layout 📏

Basado en escala de rem (4px base):
- `var(--space-4)`: 16px (Base padding/gap).
- `var(--space-8)`: 32px (Section margins).
- `var(--radius-lg)`: 12px (Standard card borders).

---

## Component Patterns 🧩

1. **Cards**: Usa `var(--radius-lg)` y `var(--shadow-md)`. Efectos hover deben usar `var(--transition-base)`.
2. **Icons**: Acentos de color según la categoría (Digital vs Print).
3. **Buttons**: Bordes redondeados `var(--radius-full)`, transiciones suaves.
