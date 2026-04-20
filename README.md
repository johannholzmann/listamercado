# ListaMercado

ListaMercado es una app para mantener siempre disponible una lista de compras compartida.

La idea principal es que el uso sea simple, rapido y colaborativo. Cualquier persona con el enlace secreto deberia poder entrar, ver la lista y sumar o marcar productos sin friccion.

## Objetivo del proyecto

- Centralizar una lista viva de compras del supermercado.
- Permitir acceso simple mediante sesiones temporales.
- Hacer posible que varias personas colaboren sobre la misma lista.
- Mantener un flujo liviano para cargar, revisar y completar productos en grupo.

## Concepto de uso

El proyecto esta pensado para escenarios cotidianos:

- una persona crea una lista nueva;
- la lista recibe un enlace secreto estable;
- comparte ese enlace con otras personas;
- cada participante agrega productos que faltan o cambia el estado de los que ya estan comprados o descartados;
- la lista queda persistida para volver cuando haga falta.

## Principios del producto

- Simple antes que complejo.
- Compartido antes que individual.
- Persistente antes que descartable.
- Practico antes que formal.

## Modelo actual

- La lista vive en un store persistente del backend del proyecto.
- La sesion temporal identifica al dispositivo o participante, pero no requiere login.
- Los productos se guardan como texto libre para no frenar la carga rapida.
- Cada item puede pasar por los estados `pendiente`, `agregado` y `resuelto`, que en la interfaz se muestran como `por comprar`, `comprado` y `ya no hace falta`.

## Que deberia resolver en el futuro

- Entrada de usuario sin pasos pesados.
- Sesiones temporales faciles de compartir entre varias personas.
- Experiencia clara para sumar productos rapidamente desde el celular o la compu.
- Base suficiente para sumar un catalogo sugerido sin perder la carga libre.

## Estado del repositorio

La aplicacion ya cuenta con una primera version funcional de listas compartidas, persistencia local y mutaciones del lado del servidor.

## Como trabajar este proyecto

- Antes de cambiar funcionalidades, leer `AGENTS.md` y este `README.md`.
- Mantener el foco en la experiencia colaborativa y en la simplicidad del flujo.
- Evitar decisiones de arquitectura innecesarias mientras el producto siga definiendose.
- Si se agregan reglas nuevas para agentes, reflejarlas tambien en la documentacion principal.

## Proximos pasos naturales

- Reemplazar el store local por una base real cuando el despliegue lo pida.
- Agregar invitaciones o permisos si hace falta controlar el acceso.
- Sumar sugerencias de productos sin bloquear la carga libre.
- Mejorar la experiencia de edicion rapida desde celular.
