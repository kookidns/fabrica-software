REVISOR: ui
VEREDICTO: CAMBIOS
Capturas: revisadas las existentes en `tareas/T-20261115-003/capturas-ronda1/`: `a-375-horario.png`, `a-375-mapa.png`, `g-768-horario.png` y `f-375-foco-como-llegar.png`. Nuevas no disponibles: `npx` falla con MODULE_NOT_FOUND; Playwright no está instalado localmente. Revisión complementada con código.
Hallazgos:
1. [MEDIO] src/sections/location.ts:70 — Los controles de zoom del iframe aparecen de aproximadamente 30×30 px en las capturas móviles, por debajo del mínimo táctil exigido — Se esperan controles de al menos 44×44 px; resolver la limitación del embed o documentar una excepción en el diseño.