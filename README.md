# ListaMercado

ListaMercado es una aplicación para mantener siempre disponible una lista de posibles productos para comprar en el supermercado.

La idea principal es que el uso sea simple, rápido y compartible. Cualquier persona debería poder entrar, ver la lista y sumar o marcar productos sin fricción.

## Objetivo del proyecto

- Centralizar una lista viva de productos potenciales para compras del supermercado.
- Permitir el acceso simple mediante usuarios temporales o sesiones temporales.
- Hacer posible que varias personas colaboren sobre la misma lista.
- Mantener un flujo liviano para cargar, revisar y completar productos en grupo.

## Concepto de uso

El proyecto está pensado para escenarios cotidianos:

- una persona crea o abre una sesión temporal;
- comparte esa sesión con otras personas;
- cada participante agrega productos que faltan o marca los que ya están resueltos;
- la lista queda siempre accesible mientras la sesión siga vigente.

## Principios del producto

- Simple antes que complejo.
- Compartido antes que individual.
- Temporal antes que rígido.
- Práctico antes que formal.

## Qué debería resolver en el futuro

- Entrada de usuario sin pasos pesados.
- Sesiones temporales fáciles de compartir entre varias personas.
- Experiencia clara para sumar productos rápidamente desde el celular o la compu.
- Base suficiente para que futuros agentes puedan extender el producto sin perder contexto.

## Estado del repositorio

Por ahora el repositorio conserva una base inicial de Next.js y documentación de orientación para agentes. La lógica de negocio todavía no está implementada.

## Cómo trabajar este proyecto

- Antes de cambiar funcionalidades, leer `AGENTS.md` y este `README.md`.
- Mantener el foco en la experiencia colaborativa y en la simplicidad del flujo.
- Evitar decisiones de arquitectura innecesarias mientras el producto siga definiéndose.
- Si se agregan reglas nuevas para agentes, reflejarlas también en la documentación principal.

## Próximos pasos naturales

- Definir el modelo de sesión temporal.
- Definir cómo se comparte la lista entre personas.
- Diseñar la estructura mínima de productos y estados.
- Implementar la primera versión del flujo de uso simple.
