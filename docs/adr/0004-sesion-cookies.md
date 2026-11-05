# ADR 0004 — Sesión con cookies httpOnly

**Estado:** Aceptado  
**Fecha:** 2026-11-05

## Contexto

Legaria trata datos sensibles. Guardar el refresh token en `localStorage` amplía el impacto de un XSS. La API y el frontend pueden compartir dominio registrable.

## Decisión

Implementar un patrón BFF:

- El frontend envía credenciales a la API.
- La API usa Supabase Auth y establece cookies `httpOnly`, `Secure` y `SameSite=Lax`.
- El refresh token rota y se revoca centralmente.
- Se añade protección CSRF para métodos mutables.
- Reautenticación para acciones sensibles.

## Consecuencias

**Positivas**

- Tokens no accesibles a JavaScript.
- Revocación y logout global.
- Mejor control de sesión.

**Negativas**

- Más complejidad que usar Supabase JS directamente.
- Necesidad de gestión de CSRF.
- Requiere dominios same-site o proxy.

## Alternativa

SPA con Bearer y Supabase JS. Más simple, pero con mayor exposición ante XSS. Solo se aceptaría con CSP estricta y ausencia total de HTML no confiable.
