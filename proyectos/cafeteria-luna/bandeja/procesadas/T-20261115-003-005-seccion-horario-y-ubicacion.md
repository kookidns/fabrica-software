---
tipo: tarea
cubre: CA-03.1, CA-03.2, CA-03.3, CA-03.4
---
# Sección Horario y ubicación con mapa y "Cómo llegar"
Crear `src/lib/maps.ts` (URL del iframe de OpenStreetMap con marcador y URL de Google Maps
`search/?api=1&query=<lat>,<lng>`, D-05) y `src/sections/location.ts`, que pinta el horario de los
7 días (los cerrados con el texto "Cerrado"), la dirección completa en `<address>`, el mapa en un
`<iframe>` con `title` y `loading="lazy"`, y un enlace "Cómo llegar" que abre la app/web de mapas.
Pruebas: 7 días en orden con los cierres, dirección presente, iframe con marcador en las coordenadas
de `business.ts` y enlace con `rel="noopener noreferrer"`.
