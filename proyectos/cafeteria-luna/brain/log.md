# Log

Entradas nuevas arriba.

## 2026-11-15 · T-20261115-005 · Anillo de foco de la marca sin recortar (bandeja 007)
- Resultado: aprobada por el aprobador en ronda 1 e integrada en main tras aprobación humana (merge 8c85c1a)
- Cierra el pendiente MEDIO de T-20261115-004 (el recorte también ocurría a 1024 px)
- Revisión: los 4 revisores OK (UX y UI con la evidencia de la fábrica). Aprobador: MEDIO no bloqueante,
  las 6 capturas "-final" (tras scroll) del constructor salieron vacías aunque su informe las daba por válidas.
- Riesgo: script BAJO (2 archivos, 78 líneas, sin zonas sensibles); el clasificador (Codex) lo subió a
  ALTO porque en su sandbox se le denegó git y no pudo ver el diff
- Pruebas: 280 (6 nuevas). Decisiones nuevas: D-12

## 2026-11-15 · T-20261115-004 · Pulido móvil, accesibilidad y Lighthouse (bandeja 006)
- Resultado: aprobada por el aprobador en ronda 1 e integrada en main tras aprobación humana (merge 8e8bca0)
- Revisión: seguridad y código OK. UX y UI pidieron CAMBIOS solo por no poder verificar (sin navegador
  en el sandbox de Codex); la fábrica creó la estación de código `scripts/evidencia.mjs` y, con esa
  evidencia neutral, UX y UI dieron OK (los primeros informes quedan como `*-sin-evidencia.md`).
- Evidencia de la fábrica: sin desbordamiento a 375/768/1024 px, todo lo nuestro ≥ 44×44 px, foco
  visible, página idéntica a main, Lighthouse 100/100 (mediana de 3).
- Riesgo: ALTO (zonas sensibles src/main.ts y src/sections/location.ts; 1143 líneas con pruebas)
- Pruebas: 274 (110 nuevas). Decisiones nuevas: D-11
- Pendientes: anillo de foco de `.brand` recortado por arriba (ya ocurría en main; MEDIO);
  excepción de los controles de OSM (hueco); probar WhatsApp y "Cómo llegar" en un teléfono real;
  ampliar evidencia.mjs (anclas, hover, Mayús+Tab, 1024 px, contornos recortados)

## 2026-11-15 · T-20261115-003 · Horario y ubicación con mapa (bandeja 005)
- Resultado: aprobada por el aprobador en ronda 1 e integrada en main tras aprobación humana (merge 18d695b)
- Zonas sensibles nuevas (decisión humana): src/lib/maps.ts, src/sections/location.ts
- Revisión: UI pidió CAMBIOS (MEDIO: controles de zoom del iframe de OSM ~30 px < 44 px); el aprobador
  lo acepta como excepción porque son de otro origen y no se pueden estilar. Revisar en la tarea 006.
- Riesgo: ALTO (zona sensible src/main.ts; primer recurso de terceros; 863 líneas con pruebas)
- Motores: spec-writer, constructor, revisor-codigo y aprobador → Claude; seguridad/UX/UI y clasificador → Codex
- Pruebas: 164 (63 nuevas). Decisiones nuevas: D-10

## 2026-11-15 · T-20261115-002 · Sección Menú (bandeja 004)
- Resultado: aprobada por el aprobador en ronda 1 e integrada en main tras aprobación humana (merge 966e8e0)
- Riesgo: ALTO (zona sensible: src/main.ts; 437 líneas con pruebas)
- Motores: spec-writer, constructor, revisor-codigo y aprobador → Claude; seguridad/UX/UI y clasificador → Codex
- Pruebas: 101 (30 nuevas). Decisiones nuevas: D-09

## 2026-11-15 · T-20261115-001 · Esqueleto, navegación, portada y sección Reservar (bandeja 003)
- Resultado: aprobada por el aprobador en ronda 1 e integrada en main tras aprobación humana (merge e897944)
- Riesgo: ALTO (zonas sensibles: index.html, src/main.ts, src/sections/hero.ts, src/sections/reserve.ts; 1026 líneas con pruebas)
- Motores: spec-writer, constructor, revisor-codigo y aprobador → Claude; seguridad/UX/UI y clasificador → Codex
- Pruebas: 71 (40 nuevas). Decisiones nuevas: D-08. Hueco nuevo: ¿cargar Google Fonts?
- Pendiente para 006: dividir main.css (317 líneas); comprobar wa.me en un teléfono real

## 2026-11-14 · T-20261114-002 · Datos del negocio y enlace de WhatsApp
- Resultado: aprobada por el aprobador en ronda 1 e integrada en main tras aprobación humana (merge 394365d)
- Riesgo: ALTO (zonas sensibles: src/data/business.ts, src/lib/whatsapp.ts)
- Motores: spec-writer, constructor, revisor-codigo y aprobador → Claude; seguridad/UX/UI y clasificador → Codex

## 2026-11-14 · T-20261114-001 · Inicializar proyecto (Vite + TypeScript)
- Resultado: aprobada por el aprobador en ronda 1 e integrada en main tras aprobación humana (merge dd33872)
- Riesgo: ALTO (dependencias, configuración de build, index.html y src/main.ts)
- Motores: spec-writer, constructor, revisor-codigo y aprobador → Claude; revisores de seguridad/UX/UI y clasificador de riesgo → Codex


<!--
## AAAA-MM-DD · T-xxxx · <título>
- Resultado: integrada automáticamente | aprobada por humano | bloqueada
- Riesgo: BAJO | ALTO (motivo)
- Rondas de revisión:
- Notas:
-->
