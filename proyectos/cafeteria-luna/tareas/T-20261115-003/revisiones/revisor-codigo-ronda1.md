REVISOR: codigo
VEREDICTO: OK
CA cubiertos: CA-1 ✅ (src/lib/maps.test.ts: CA-1) · CA-2 ✅ (maps.test.ts: CA-2) · CA-3 ✅ (maps.test.ts: CA-3) · CA-4 ✅ (maps.test.ts: CA-4) · CA-5 ✅ (maps.test.ts: CA-5) · CA-6 ✅ (src/sections/location.test.ts: CA-6) · CA-7 ✅ (location.test.ts: CA-7) · CA-8 ✅ (location.test.ts: CA-8) · CA-9 ✅ (location.test.ts: CA-9, con sandbox exacto) · CA-10 ✅ (location.test.ts: CA-10) · CA-11 ✅ (location.test.ts: CA-11) · CA-12 ✅ (location.test.ts: CA-12) · CA-13 ✅ (location.test.ts: CA-13) · CA-14 ✅ (src/main.test.ts: CA-14) · CA-15 ✅ (main.test.ts: CA-15) · CA-16 ✅ (main.test.ts: CA-16) · CA-17 ✅ (main.test.ts: CA-17) · CA-18 ✅ (el diff de main.test.ts solo añade líneas; 164 tests pasan) · CA-19 ✅ (src/styles/location.test.ts: a–g) · CA-20 ✅ (el diff no toca main.css, menu.css ni tokens.css) · CA-21 ⚠️ (comprobación manual; no verificable desde el código, no la juzgo) · CA-22 ✅ (verificar.mjs: lint, typecheck, test, build en ok, ninguna omitida)
Hallazgos:
1. [BAJO] src/sections/location.ts:68-70 y 88-90 — las guardias de prefijo de `src` y `href` (decisión 3) no tienen prueba que las ejercite, porque `maps.ts` real nunca produce otro prefijo. Se espera, si se quiere, una prueba con `vi.mock("../lib/maps")` que devuelva `javascript:` y compruebe que lanza. La spec no lo exige como CA, así que no bloquea.
2. [BAJO] src/sections/location.ts:26 — usa el `document` global en vez de recibir el documento. Es coherente con las otras secciones (hero, menu, reserve) y no hay nada que cambiar.

Resto de la revisión sin hallazgos:
- Arquitectura: los archivos están donde dice el brain. `maps.ts` es puro y no importa `business`. `location.ts` usa `import type` y construye todo con `createElement`/`textContent`/`setAttribute`. `main.ts` resuelve `#horario h2` y `renderLocation` antes de pintar (D-09).
- Duplicación: no la hay. La URL de WhatsApp sigue en `whatsapp.ts` y el formato de precio en `formatPrice.ts`.
- Librerías: no se añadió ninguna dependencia.
- Legibilidad: nombres claros, archivos pequeños y comentarios que explican el porqué.
- Tests: no son vacíos. Parsean URLs, comparan conjuntos exactos de tokens de `sandbox` y de parámetros, y comprueban el orden en el documento. Verifican que el contenido viene de `business` y fallan si las coordenadas son inválidas.
