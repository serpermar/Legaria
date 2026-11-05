# ADR 0002 — Monolito modular

**Estado:** Propuesto  
**Fecha:** 2026-11-05

## Contexto

El producto tiene dominios claros (expedientes, familias, memoriales, IA) pero un equipo pequeño y un MVP en construcción. Los microservicios añadirían complejidad operativa prematura.

## Decisión

Construir un monolito modular:

- Un despliegue de API.
- Módulos por dominio con routes, controller, service, repository y schemas.
- Dependencias explícitas y prohibición de imports internos entre módulos.
- Worker separado usando el mismo código para tareas en segundo plano.

## Consecuencias

**Positivas**

- Menor complejidad operativa.
- Transacciones sencillas.
- Despliegue y depuración simples.
- Refactorización más barata.

**Negativas**

- Riesgo de acoplamiento si no se respetan límites.
- Escalado por despliegue completo.
- Posible extracción futura de módulos.

## Criterio de extracción futura

Solo se extraerá un servicio cuando exista una necesidad medible de escalado, aislamiento o ciclo de despliegue independiente.
