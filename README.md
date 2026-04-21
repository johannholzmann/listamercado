# quecompramos

quecompramos es una app para mantener siempre disponible una lista de compras compartida.

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

- La lista vive en PostgreSQL a traves de Prisma.
- La sesion temporal identifica al dispositivo o participante, pero no requiere login.
- Cada lista nueva queda asociada al participante que la creo, para que luego pueda volver a verla desde la pantalla principal.
- El participante puede editar su nombre sin crear una cuenta formal.
- Los productos se guardan como texto libre para no frenar la carga rapida.
- Mientras se escribe un producto, la UI sugiere hasta 3 coincidencias de listas anteriores donde esa sesion ya participo.
- Cada item puede pasar por los estados `pendiente`, `agregado` y `resuelto`, que en la interfaz se muestran como `por comprar`, `comprado` y `ya no hace falta`.

## Que deberia resolver en el futuro

- Entrada de usuario sin pasos pesados.
- Sesiones temporales faciles de compartir entre varias personas.
- Experiencia clara para sumar productos rapidamente desde el celular o la compu.
- Base suficiente para sumar un catalogo sugerido sin perder la carga libre.

## Estado del repositorio

La aplicacion ya cuenta con una primera version funcional de listas compartidas, sesiones temporales y mutaciones del lado del servidor sobre Prisma + Postgres.

## Como trabajar este proyecto

- Antes de cambiar funcionalidades, leer `AGENTS.md` y este `README.md`.
- Mantener el foco en la experiencia colaborativa y en la simplicidad del flujo.
- Evitar decisiones de arquitectura innecesarias mientras el producto siga definiendose.
- Si se agregan reglas nuevas para agentes, reflejarlas tambien en la documentacion principal.

## Configuracion de base de datos

- Definir `DATABASE_URL` con la conexion a Neon u otro Postgres compatible.
- Ejecutar `npm run db:generate` cuando cambie `prisma/schema.prisma`.
- Ejecutar `npm run db:migrate` para aplicar el esquema en la base elegida.
- En Vercel, el build ejecuta `npm run vercel-build`, que corre `prisma generate`, `prisma migrate deploy` y luego `next build`.
- Mantener el cliente de Prisma del lado del servidor; no exponer credenciales al browser.

## Acceso a listas propias

- Las listas creadas por una sesion quedan ligadas al `participantId` de esa sesion.
- La pantalla principal muestra un acceso rapido a todas las listas creadas con ese nombre.
- Cambiar el nombre del participante no rompe el acceso a sus listas, porque la relacion se guarda por id y no por texto visible.

## Proximos pasos naturales

- Completar el onboarding de base de datos en desarrollo y Vercel.
- Agregar invitaciones o permisos si hace falta controlar el acceso.
- Sumar sugerencias de productos sin bloquear la carga libre.
- Ampliar las sugerencias hacia historial o catalogo compartido si el uso real lo pide.
- Mejorar la experiencia de edicion rapida desde celular.
