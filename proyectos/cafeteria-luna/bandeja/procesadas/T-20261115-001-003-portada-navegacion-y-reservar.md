---
tipo: tarea
cubre: CA-01.1, CA-01.2, CA-01.3, CA-04.1
---
# Esqueleto de la página, navegación, portada y sección Reservar
Escribir en `index.html` el esqueleto semántico (D-04): cabecera sticky con navegación a `#menu`,
`#horario` y `#reservar`, `<main>` con las cuatro secciones y sus `<h2>`, y pie. Implementar
`src/sections/hero.ts` (nombre como `<h1>`, eslogan y botón "Reservar mesa por WhatsApp") y
`src/sections/reserve.ts` (texto breve + el mismo botón), montados desde `src/main.ts` con la URL de
la tarea 002. El nombre, el eslogan y el botón deben caber sin scroll a 375 px. Usar los tokens de
`brain/diseno.md` en `tokens.css`. Pruebas: anclas de navegación, botón en portada y en Reservar.
