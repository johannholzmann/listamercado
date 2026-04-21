<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Contexto del proyecto

quecompramos es una app para mantener siempre disponible una lista de posibles compras del supermercado.

La meta del producto es que varias personas puedan colaborar sobre la misma lista con el menor esfuerzo posible, usando sesiones temporales y un ingreso simple.

## Reglas de trabajo para agentes

- Priorizar siempre la simplicidad del flujo de uso.
- Pensar primero en colaboración compartida, no en cuentas complejas.
- Asumir sesiones temporales como base conceptual salvo que una tarea indique otra cosa.
- Mantener el proyecto orientado a una experiencia rápida para cargar, revisar y completar productos.
- No perder el contexto de que la lista debe ser útil para varias personas al mismo tiempo.

## Qué documentar al extender el proyecto

- Cómo se crea o recupera una sesión temporal.
- Cómo se comparte una lista entre personas.
- Qué significa marcar un producto como agregado, pendiente o resuelto.
- Qué supuestos nuevos se introducen y por qué.

## Referencias

- Leer este archivo antes de empezar cualquier tarea en el repo.
- Mantener alineado `README.md` con cualquier cambio relevante de visión o alcance.
