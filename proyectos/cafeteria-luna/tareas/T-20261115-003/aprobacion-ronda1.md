VEREDICTO: APROBADO
Ronda: 1
Cambios obligatorios (solo si RECHAZADO), cada uno accionable:
(ninguno)

Resumen de entradas:
- seguridad: OK, sin hallazgos.
- ux: OK, sin hallazgos.
- ui: CAMBIOS, con un único hallazgo MEDIO (zona táctil de los controles de zoom del mapa).
- codigo: OK. CA-1 a CA-20 y CA-22 cubiertos con prueba; dos hallazgos BAJO.
- Puertas (CA-22): lint, typecheck, test (164 pruebas: 101 previas y 63 nuevas) y build en `ok`, ninguna omitida (build-ronda1.md y revisor de código).
- CA-21 (manual): documentado punto por punto en build-ronda1.md con capturas en capturas-ronda1/. (a), (b), (c), (d), (f) y (g) en ✔. (e) se anotó como pide el CA ("anotar si…"): `lazy` difiere la petición en el navegador integrado, pero Chrome la adelanta con un umbral de unos 1300 px. Ya está registrado como limitación conocida y la fachada "clic para cargar" queda fuera de alcance (tarea 006). No hay ningún CA sin prueba.
- Comprobado en el diff (`main...HEAD`, commit 1b9526a): solo cambian los 8 archivos previstos; `main.css`, `menu.css`, `tokens.css`, `index.html`, `business.ts` y la configuración no se tocan. `location.ts` usa solo `createElement`/`textContent`/`setAttribute`, aplica el `sandbox` exacto de la decisión 2 y pone las guardias de prefijo antes de asignar `src`/`href`.

Hallazgos descartados:
- ui #1 [MEDIO] src/sections/location.ts:70, controles de zoom del iframe de unos 30×30 px, por debajo de 44×44 (CA-05.2). Se confirma en a-375-mapa.png, pero no bloquea y no se pide como cambio, por cuatro motivos. (1) Es MEDIO, y según las reglas del aprobador los MEDIO no bloquean: el "CAMBIOS" del revisor de UI no se apoya en ningún hallazgo CRÍTICO ni ALTO. (2) No es accionable por el constructor: los botones +/− los pinta MapLibre GL dentro del iframe de otro origen (www.openstreetmap.org), y ni CSS ni JS de la página pueden cambiarlos. La línea 70 (`createMap`) solo crea el iframe. (3) Las alternativas que cambiarían esos controles salen de lo que permite la spec: quitar el iframe, cambiar de proveedor (D-05) o poner una fachada "clic para cargar" (fuera de alcance, tarea 006). (4) El mapa es complementario. El objetivo táctil principal de la ubicación, el botón "Cómo llegar", mide 343×48 px a 375 px y cumple. Queda como mejora sugerida, para documentarlo como excepción.

Mejoras sugeridas (no bloquean):
1. diseno.md y decisiones.md (D-10), al cerrar: registrar como excepción conocida que los controles internos del embed de OpenStreetMap (zoom +/− y enlaces de atribución, unos 30 px) no se pueden ajustar al mínimo de 44×44 px de CA-05.2, porque viven dentro de un iframe de terceros, y que la acción táctil equivalente es "Cómo llegar" (48 px). Revisarlo en la auditoría de 44 px y Lighthouse de la tarea 006 junto con la fachada "clic para cargar". Origen: ui. Lo decide el humano o el spec-writer, no el constructor.
2. src/sections/location.ts:24: el comentario dice "Leaflet needs scripts", pero el embed actual es MapLibre GL (WebGL + worker `blob:`), según lo verificado en CA-21 y ya recogido en D-10. Conviene corregirlo en la próxima tarea que toque el archivo. Origen: codigo (observación del aprobador).
3. src/sections/location.ts:72 y 86: añadir una prueba con `vi.mock("../lib/maps")` que devuelva una URL `javascript:` y compruebe que `renderLocation` lanza, para ejercitar las guardias de prefijo. La spec no lo exige como CA. Origen: codigo.
4. src/sections/location.ts:29 y siguientes: usa el `document` global, igual que hero, menu y reserve. Es coherente y no hay nada que cambiar ahora; solo se anota por si en el futuro se pasa el documento como parámetro a todas las secciones. Origen: codigo.
5. Mapa a 768 px (g-768-horario.png): el marcador sale visible pero algo por debajo del centro, cerca de la barra de atribución, porque OSM encaja el `bbox` cuadrado en 16:9. Se puede revisar en la tarea 006 (por ejemplo, un `d` de latitud algo mayor que el de longitud), sin cambiar CA-1 en esta tarea. Origen: ui (observación del constructor en CA-21 g).
6. Pendiente para el humano en el cierre (riesgo ALTO: toca `src/main.ts` y añade el primer recurso de terceros): aprobación humana de la integración y decisión 6 de la spec (añadir `src/lib/maps.ts` y `src/sections/location.ts` a `brain/zonas-sensibles.txt`), que ni el constructor ni el aprobador editan.
