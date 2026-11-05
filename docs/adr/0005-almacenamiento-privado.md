# ADR 0005 — Almacenamiento privado por defecto

**Estado:** Propuesto  
**Fecha:** 2026-11-05

## Contexto

La plataforma almacena documentos funerarios, autorizaciones, fotografías y vídeos de personas fallecidas. Un bucket público mal configurado expondría contenido irreversiblemente.

## Decisión

- Todos los originales y documentos se guardan en buckets privados.
- El acceso se concede mediante URLs firmadas de corta duración tras autorización.
- Solo se generan derivados públicos para memoriales `PUBLISHED` + `PUBLIC`.
- Los derivados se guardan en un bucket separado y sin metadatos EXIF.
- Los nombres de archivo se generan; no se usa el nombre original.
- Se validan MIME, extensión y tamaño.

## Consecuencias

**Positivas**

- Reduce el riesgo de exposición accidental.
- Permite revocar acceso.
- Facilita auditoría y control.

**Negativas**

- Más lógica de autorización y generación de URLs.
- Coste de procesamiento de imágenes.
- Necesidad de limpiar derivados al despublicar.

## Regla clave

La autorización se verifica antes de firmar una URL. Nunca se firma una URL para un recurso que el actor no puede ver.
