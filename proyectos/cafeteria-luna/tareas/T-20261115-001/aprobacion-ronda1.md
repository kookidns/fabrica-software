VEREDICTO: APROBADO
Ronda: 1
Cambios obligatorios (solo si RECHAZADO), cada uno accionable:
Ninguno.

Resumen de la consolidación:
- Seguridad: OK, sin hallazgos. UX: OK, sin hallazgos. UI: OK, sin hallazgos (sin capturas: Playwright no está instalado). Código: OK, con 2 hallazgos BAJO. No hay ningún hallazgo CRÍTICO ni ALTO.
- CA-1…CA-15: todos tienen prueba automática y el revisor de código lo confirma CA por CA. CA-17: el constructor y el revisor de código informan lint, typecheck, test (71/71) y build `ok`, sin ninguna `omitida`. `business.test.ts` y `whatsapp.test.ts` no cambian.
- CA-16 (manual): el constructor anota en `build-ronda1.md` los puntos (a)–(e) en OK, con medidas a 375×667 en Chromium emulado. El punto (f) es parcial: comprobó en el DOM servido `target="_blank"`, `rel="noopener noreferrer"`, host `wa.me/520000000000`, el mismo `href` en los dos botones y el mensaje decodificado legible, sin doble codificación. No abrió wa.me porque es un sitio externo. No bloquea: el riesgo que la spec señala (doble codificación, `href` peligroso) está cubierto por CA-6/CA-10 y por lo medido. Lo que falta es ver cómo lo presenta WhatsApp, y eso queda para la aprobación humana, que esta tarea exige de todos modos (riesgo ALTO, zonas sensibles).
- Verificación propia del diff (`main...HEAD`, commit 3ae0362):
  - Los archivos cambiados coinciden con los que permite la spec. No se tocan `business.ts`, `whatsapp.ts`, `package*.json` ni la configuración.
  - En `project.test.ts` solo cambian "CA-4" y "CA-5". También se quitó el helper `stripCssComments`, que solo usaba CA-5; sin él, `noUnusedLocals` rompería typecheck, así que el cambio está justificado y no afecta a otras pruebas.
  - `reserve.ts` valida el prefijo `https://wa.me/`, crea el SVG con `createElementNS` y escribe los datos solo con `textContent`/`setAttribute`.
  - `hero.ts` reutiliza `createReserveButton` y no importa `business`.
  - `main.ts` calcula la URL una sola vez y comprueba los contenedores antes de pintar.

Hallazgos descartados:
- codigo #1 [BAJO] `src/main.ts:12`, el mensaje de error dice "#reservar h2": lo descarto. El propio revisor dice que no hace falta actuar. El mensaje nombra el selector que realmente falta y cumple CA-11.

Mejoras sugeridas (no bloquean):
1. `src/styles/main.css` tiene 317 líneas, por encima de la guía de ~200 de `estilo-codigo.md` (origen: codigo, y también lo propone el constructor). Conviene dividirlo con `@import` (base / cabecera / secciones / botón) en la tarea 006 o cuando crezca con Menú y Horario.
2. `src/sections/hero.ts:1` y `src/sections/reserve.ts:1` empiezan con un BOM UTF-8 (U+FEFF) (origen: codigo, observación del aprobador). No rompe las puertas, pero es incoherente con el resto de archivos. Guardarlos en UTF-8 sin BOM la próxima vez que se toquen.
3. `src/styles/main.css` tiene algunos literales: `3px` del anillo de foco, `1px`/`2px` de bordes y del visually-hidden, `150ms` y `768px` en la media query (origen: ui/codigo, observación del aprobador). Los valores coinciden con `diseno.md` y CA-15 no los prohíbe. Si `diseno.md` añade tokens (`--focus-ring-width`, `--duration-fast`, `--border-width`), sustituirlos.
4. CA-16 (f) para el humano: abrir el botón en un móvil real y comprobar cómo presenta WhatsApp el mensaje. Ahora termina en tres líneas con el valor vacío ("Fecha: ", "Hora: ", "Número de personas: "). Si se ve mal, ajustar el mensaje en `business.ts` en una tarea propia (D-00 / huecos.md).
5. Registrar en el brain las decisiones que propone el constructor: cabecera móvil en dos filas con `scroll-margin-top`/`min-height` = `--header-height + --tap-min`, hover con `color-mix`, `min-height` del botón = `--space-7`, y `main[tabindex="-1"]` con `main:focus { outline: none }`.
6. Responsive y foco reales siguen sin una verificación independiente en navegador (origen: ui/ux). Instalar Playwright para los revisores, o incluir capturas en el rastro en la tarea 006.
