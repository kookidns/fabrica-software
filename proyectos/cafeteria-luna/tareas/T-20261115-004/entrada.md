<!-- tipo: tarea · origen: bandeja/006-pulido-movil-y-accesibilidad.md · 2026-11-15T06:16:12.685Z -->

---
tipo: tarea
cubre: CA-05.1, CA-05.2, CA-05.3, CA-05.4
---
# Pulido móvil, accesibilidad y auditoría Lighthouse
Revisar la página completa a 375 px: sin scroll horizontal ni texto cortado, y zona táctil de al
menos 44×44 px en todos los botones y enlaces (token de tamaño mínimo en `tokens.css`). Asegurar un
encabezado por sección, `alt` en imágenes informativas, foco visible y nombre accesible del botón
de WhatsApp. Pruebas en jsdom: cada `<section>` tiene encabezado, toda `<img>` tiene `alt` y los
enlaces de WhatsApp anuncian su propósito. Ejecutar Lighthouse móvil sobre `npm run preview`
(rendimiento y accesibilidad ≥ 90, D-03) y guardar el resultado en el rastro de la tarea.
