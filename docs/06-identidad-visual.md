# Identidad visual y experiencia — Legaria

**Estado:** Propuesta para validación  
**Objetivo:** una experiencia elegante, humana, serena y accesible.

---

## 1. Principios

1. **Respeto:** nada de estética lúgubre, morbosa o excesivamente oscura.
2. **Cercanía:** lenguaje claro, cálido y sin tecnicismos innecesarios.
3. **Humanidad:** las personas y los recuerdos son el centro, no la interfaz.
4. **Confianza:** transparencia sobre privacidad, permisos y publicación.
5. **Tranquilidad:** jerarquía clara, espacios amplios y ritmo pausado.
6. **Permanencia:** el memorial debe sentirse cuidado y duradero.

---

## 2. Paleta

| Token | Color | Uso |
|---|---|---|
| `ivory` | `#F7F4EF` | Fondo principal. |
| `sage` | `#87958A` | Acentos suaves, estados secundarios. |
| `forest` | `#34463D` | Texto principal, botones primarios. |
| `sand` | `#D8C5AA` | Detalles, separadores, fondos cálidos. |
| `charcoal` | `#343434` | Texto secundario y elementos funcionales. |
| `white` | `#FFFFFF` | Superficies elevadas. |
| `danger` | `#9B3B3B` | Errores y acciones destructivas. |
| `warning` | `#8A6A2F` | Avisos. |
| `success` | `#4F6B57` | Confirmaciones. |

### Reglas

- El verde profundo se usa con moderación; no convertir la interfaz en una página oscura.
- El marfil es el fondo dominante.
- La arena se usa para separar sin ruido visual.
- Los estados de error no dependen solo del color.
- Comprobar contraste WCAG 2.2 AA en todas las combinaciones.

---

## 3. Tipografía

| Uso | Fuente | Alternativa |
|---|---|---|
| Títulos y textos editoriales | **Lora** | Georgia, serif |
| Interfaz y contenido funcional | **Inter** | system-ui, sans-serif |

### Reglas

- Lora para `h1`, `h2`, citas y fragmentos biográficos.
- Inter para navegación, formularios, tablas y botones.
- Tamaños base: 16 px en móvil, 17–18 px en lectura de memoriales.
- Interlineado generoso en textos largos (1.6–1.75).
- Longitud de línea recomendada: 60–75 caracteres.
- Fuentes autoalojadas con `@fontsource` para evitar peticiones a terceros y mejorar privacidad.
- No usar más de dos familias.

---

## 4. Tokens de diseño

```css
:root {
  --color-bg: #F7F4EF;
  --color-surface: #FFFFFF;
  --color-text: #343434;
  --color-text-muted: #5F625F;
  --color-primary: #34463D;
  --color-primary-contrast: #FFFFFF;
  --color-accent: #87958A;
  --color-sand: #D8C5AA;
  --color-border: #DDD6C9;
  --color-danger: #9B3B3B;
  --color-warning: #8A6A2F;
  --color-success: #4F6B57;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;

  --shadow-soft: 0 1px 2px rgba(52, 70, 61, 0.06);
  --shadow-card: 0 8px 24px rgba(52, 70, 61, 0.08);
}
```

---

## 5. Componentes

### Base

- Botones primario, secundario, fantasma y destructivo.
- Campos de formulario con etiqueta, ayuda y error.
- Selects accesibles.
- Checkbox y radio con área táctil suficiente.
- Modales con foco atrapado.
- Menús y popovers con teclado.
- Tablas con encabezados y estados vacíos.
- Badges de estado.
- Alertas y avisos.
- Paginación.
- Skeletons y estados de carga.
- Mensajes de error recuperables.

### Específicos

- Tarjeta de expediente.
- Timeline de servicio.
- Tarjeta de memorial.
- Galería de fotografías.
- Libro de condolencias.
- Editor de biografía.
- Selector de visibilidad.
- Panel de revisión de publicación.
- Indicador de contenido generado por IA.

### Reglas

- Un solo botón primario por vista.
- Acciones destructivas con confirmación explícita.
- Nunca usar solo iconos sin etiqueta accesible.
- Los formularios muestran errores junto al campo y un resumen al inicio.
- Los estados vacíos explican el siguiente paso.

---

## 6. Estética por área

### Panel profesional

- Más funcional y corporativo.
- Densidad media.
- Tablas, filtros y acciones rápidas.
- Fondo marfil con superficies blancas.
- Acentos en verde profundo y salvia.

### Portal familiar

- Más cálido y espacioso.
- Menos densidad.
- Lenguaje cercano.
- Tarjetas grandes y navegación simple.
- Prioridad a la información del servicio y al memorial.

### Memorial público

- Muy editorial.
- Fotografía principal protagonista.
- Tipografía Lora en títulos y biografía.
- Fondo marfil, imágenes sin bordes duros.
- Navegación discreta.
- Sin publicidad.
- Sin elementos que compitan con el recuerdo.

### Administración

- Clara y sobria.
- Métricas y auditoría.
- Sin exposición innecesaria de datos personales.

---

## 7. Accesibilidad

- Objetivo WCAG 2.2 AA.
- HTML semántico.
- Foco visible siempre.
- Navegación completa por teclado.
- Contraste mínimo 4.5:1 en texto normal y 3:1 en texto grande.
- No depender solo del color.
- Etiquetas asociadas a campos.
- Mensajes de error anunciados.
- `prefers-reduced-motion` respetado.
- Textos alternativos obligatorios en imágenes publicadas.
- Subtítulos en vídeos cuando sea posible.
- Zoom hasta 200 % sin pérdida de funcionalidad.
- Sin trampas de foco.
- Enlaces con texto descriptivo.

---

## 8. Microcopy

### Tono

- Sereno.
- Claro.
- Respetuoso.
- Sin dramatismo.
- Sin tecnicismos.
- Sin infantilizar.

### Ejemplos

| En lugar de | Usar |
|---|---|
| “Registrar difunto” | “Añadir persona fallecida” |
| “Eliminar recuerdo” | “Retirar recuerdo” |
| “Usuario dado de baja” | “Acceso retirado” |
| “Publicar memorial” | “Publicar memorial” (con explicación de visibilidad) |
| “Error 403” | “No tienes acceso a esta información” |
| “IA generó esto” | “Borrador generado con IA. Revísalo antes de publicar.” |

### Reglas

- Explicar siempre quién verá el contenido antes de publicar.
- No usar lenguaje que prometa “eternidad” o “inmortalidad”.
- No simular mensajes de la persona fallecida.
- Evitar signos de exclamación y urgencia artificial.

---

## 9. Imágenes y contenido

- Fotografías con tratamiento sobrio.
- Sin filtros agresivos.
- Sin imágenes de stock genéricas en momentos emocionales.
- Ilustraciones minimalistas solo si aportan.
- No usar imágenes de personas sin autorización.
- Los originales no se publican; solo derivados optimizados.
- Mantener proporciones y evitar recortes agresivos de rostros.

---

## 10. Movimiento

- Transiciones suaves y breves (150–250 ms).
- Sin animaciones llamativas.
- Respetar `prefers-reduced-motion`.
- Evitar parallax y efectos innecesarios.
- El movimiento debe orientar, no decorar.

---

## 11. Voz de la marca

Legaria acompaña. No dirige, no dramatiza y no invade.

- “Estamos aquí para ayudarte a organizar la información.”
- “Tú decides quién puede ver este memorial.”
- “Puedes revisar y cambiar esto en cualquier momento.”

---

## 12. Pendiente de validación

- Logotipo y símbolo.
- Fotografía de marca.
- Ilustraciones.
- Guía de tono completa.
- Biblioteca de componentes definitiva.
- Revisión de contraste con herramientas automatizadas.
