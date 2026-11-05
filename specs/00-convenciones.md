# Spec 00 — Convenciones comunes

**Estado:** Borrador  
**Aplica a:** todos los módulos

---

## 1. Identificadores

- UUID en todas las entidades.
- No se aceptan identificadores secuenciales expuestos.
- Los identificadores se validan con Zod (`z.string().uuid()`).
- No se confía en un identificador para inferir permisos.

---

## 2. Fechas y horas

- Backend y base de datos en UTC.
- Formato de intercambio: ISO 8601 (`2026-11-05T14:30:00.000Z`).
- Fechas sin hora (`birthDate`, `deathDate`, `eventDate`) en formato `YYYY-MM-DD`.
- El frontend presenta en la zona horaria del usuario.
- No se aceptan fechas inválidas ni rangos incoherentes.

---

## 3. Textos

- UTF-8.
- Longitudes máximas definidas por campo.
- Sin HTML salvo campos expresamente enriquecidos y sanitizados.
- Normalización de espacios.
- No se recortan nombres de forma agresiva.
- No se permiten caracteres de control.

---

## 4. Importes

- No aplica en el MVP.
- En Fase 7: enteros en céntimos y moneda explícita.
- Nunca `float` para dinero.

---

## 5. Errores

Formato basado en RFC 9457:

```json
{
  "type": "https://api.legaria.es/errors/validation",
  "title": "Validation failed",
  "status": 422,
  "code": "VALIDATION_ERROR",
  "detail": "Hay campos inválidos.",
  "instance": "/api/v1/organizations/.../cases",
  "requestId": "req_01...",
  "errors": [
    { "path": "body.reference", "message": "La referencia es obligatoria." }
  ]
}
```

Códigos:

| HTTP | Código | Uso |
|---|---|---|
| 400 | `BAD_REQUEST` | Petición malformada. |
| 401 | `UNAUTHENTICATED` | Sin sesión válida. |
| 403 | `FORBIDDEN` | Autenticado sin permiso. |
| 404 | `NOT_FOUND` | Recurso inexistente o no visible. |
| 409 | `CONFLICT` | Estado incompatible o duplicado. |
| 422 | `VALIDATION_ERROR` | Datos inválidos. |
| 429 | `RATE_LIMITED` | Límite excedido. |
| 500 | `INTERNAL_ERROR` | Error no controlado. |

Reglas:

- No exponer trazas, SQL ni nombres de tablas.
- No revelar la existencia de recursos privados: usar 404 cuando corresponda.
- Incluir `requestId` para soporte.
- Los errores de validación no incluyen valores sensibles.

---

## 6. Paginación

Cursor-based por defecto:

```http
GET /api/v1/organizations/:organizationId/cases?limit=20&cursor=...
```

```json
{
  "data": [],
  "pageInfo": {
    "nextCursor": "opaque-string",
    "hasNextPage": true
  }
}
```

Reglas:

- `limit` entre 1 y 100; por defecto 20.
- El cursor es opaco y no revela identificadores internos.
- No se permite `offset` en listados grandes.
- Todo listado tiene orden estable.

---

## 7. Filtros y ordenación

- Listas blancas de campos.
- Nombres en `camelCase`.
- Ejemplo: `?status=ACTIVE&search=garcia&sort=-openedAt`.
- `-` indica descendente.
- Búsqueda de texto con límite y saneamiento.
- Filtros desconocidos devuelven 422.

---

## 8. Permisos

Formato: `recurso:acción`.

Ejemplos:

- `case:read`
- `memorial:publish`
- `organization:manage_members`

Reglas:

- El permiso se comprueba en backend.
- El permiso puede requerir contexto (organización, expediente, grupo familiar).
- El frontend puede ocultar acciones, pero no es la fuente de autorización.
- Denegación por defecto.

---

## 9. Estados y transiciones

- Los estados se definen con enums.
- Las transiciones inválidas devuelven 409.
- Las transiciones relevantes se auditan.
- No se permite retroceder de estado sin regla explícita.

---

## 10. Auditoría

Se registra:

- Actor.
- Organización.
- Acción.
- Tipo e identificador de recurso.
- Metadatos mínimos.
- `requestId`.
- Fecha.

No se registra:

- Contenido de biografías.
- Mensajes de condolencias.
- Documentos.
- Tokens.
- Contraseñas.
- Datos de salud o creencias.

---

## 11. Validación

- Zod en el borde HTTP.
- Validaciones de negocio en el servicio.
- Restricciones en base de datos como última defensa.
- Mensajes claros y localizables.
- No confiar en validaciones del frontend.

---

## 12. Pruebas mínimas por endpoint

1. Sin autenticación → 401.
2. Con rol insuficiente → 403 o 404.
3. Con recurso de otra organización → 403 o 404.
4. Con datos inválidos → 422.
5. Caso feliz → 2xx.
6. Efecto de auditoría cuando aplique.

---

## 13. Definition of Done

Un módulo está terminado cuando:

- [ ] Especificación validada.
- [ ] Modelo y migraciones aplicadas.
- [ ] Endpoints implementados.
- [ ] Permisos y aislamiento probados.
- [ ] Validaciones y errores cubiertos.
- [ ] Auditoría implementada.
- [ ] UI integrada.
- [ ] Pruebas unitarias, integración y E2E.
- [ ] Accesibilidad revisada.
- [ ] Documentación actualizada.
- [ ] Sin secretos ni datos sensibles en logs.
