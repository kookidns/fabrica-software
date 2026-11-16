<!-- tipo: tarea · origen: bandeja/002-datos-negocio-y-enlace-whatsapp.md · 2026-11-14T16:46:26.813Z -->

---
tipo: tarea
cubre: CA-04.2, CA-04.3, CA-04.4
---
# Archivo de datos del negocio y enlace de reserva por WhatsApp
Crear `src/data/business.ts`, único archivo de datos (D-00), tipado y con todos los valores
ficticios marcados como tal: nombre, eslogan, `es-MX`/`MXN`, menú (bebidas y postres), horario de
lunes a domingo con al menos un día cerrado, dirección, coordenadas y WhatsApp `+52 000 000 0000`
con un mensaje que pide fecha, hora y nº de personas. Crear `src/lib/whatsapp.ts`: construye la URL
`https://wa.me/<dígitos>?text=<mensaje codificado>` (sirve en app móvil y WhatsApp Web, D-05).
Pruebas: número limpio (solo dígitos), mensaje codificado y legible al decodificar, y el mensaje
menciona fecha, hora y personas. Zona sensible: riesgo ALTO.
