# Constructor · T-20261114-002 · ronda 1 (claude opus)

Cuatro puertas en ok. Commit **87a5a48** en `fabrica/T-20261114-002`: "archivo de datos ficticios tipado (business.ts) y buildWhatsAppUrl con pruebas". Sin merge/push; no se tocó `app/`.

## Archivos (4 nuevos; `src/project.test.ts` sin cambios)
- `src/data/business.ts` — cabecera "DATOS FICTICIOS (decisión D-00)… edita solo este archivo". Tipos exportados `MenuItem`, `OpenDay` (`closed?: never`), `ClosedDay` (`closed: true`, `open?/close?: never`), `DayHours = OpenDay | ClosedDay`, `Business`. `export const business: Business`: 4 bebidas y 3 postres en MXN; lunes cerrado; dirección y coordenadas de ejemplo; `whatsapp.number = "520000000000"`; mensaje en tuteo que pide Fecha, Hora y Número de personas.
- `src/data/business.test.ts` — CA-1..CA-7.
- `src/lib/whatsapp.ts` — `buildWhatsAppUrl(number, message)` pura: `replace(/\D/g, "")`, lanza Error si no quedan dígitos, devuelve `https://wa.me/${digits}?text=${encodeURIComponent(message)}`; no importa `business`.
- `src/lib/whatsapp.test.ts` — CA-8..CA-13.

## CA → prueba (rojo → verde)
Dos fases de rojo: A (módulo inexistente) y B (stub deliberadamente incorrecto para ver cada aserción fallar).
| CA | Prueba | Rojo → verde |
|---|---|---|
| CA-1 | business.test.ts › header comment | A, B → verde |
| CA-2 | business.test.ts › name, slogan, es-MX, MXN | A, B → verde |
| CA-3 | business.test.ts › menu ≥3 bebidas / ≥3 postres válidos | A, B → verde |
| CA-4 | business.test.ts › 7 días en orden; ≥1 cerrado sin open/close; HH:MM y open<close | A, B → verde (HH:MM pasaba en vacío con el stub; el rojo lo dio la de 7 entradas) |
| CA-5 | business.test.ts › dirección y coordenadas válidas | A, B → verde |
| CA-6 | business.test.ts › número D-00 y mensaje con fecha/hora/personas | A, B → verde |
| CA-7 | business.test.ts › anotado como Business, `expectTypeOf`, unión excluyente (3 `@ts-expect-error`) | rojo en vitest y en typecheck (TS2578×3) → verde; extra: quitar `: Business` da TS2344 |
| CA-8 | whatsapp.test.ts › limpia "+52 000 000 0000" / "(52) 000-000-0000" | A, B → verde |
| CA-9 | whatsapp.test.ts › exactamente encodeURIComponent; decodifica al original (tildes, ñ, ¿?, &, #, /, =, salto de línea) | A, B → verde |
| CA-10 | whatsapp.test.ts › https://wa.me/<dígitos> con text como único parámetro | A, B → verde |
| CA-11 | whatsapp.test.ts › lanza Error con "", "+ -", "()" | A, B → verde |
| CA-12 | whatsapp.test.ts › URL desde business.whatsapp | A, B → verde |
| CA-13 | whatsapp.test.ts › fuente sin número ni mensaje (comprueba imports) | A → verde (prueba de guarda; se corrigió un falso positivo por un comentario) |
| CA-14 | puertas + project.test.ts sin cambios | ok |
Total: 31 pruebas en verde (8 previas + 23 nuevas).

## Puertas
lint ok · typecheck ok · test ok · build ok · exit 0. Instalado con `npm ci` (D-07); npm bloqueó el postinstall de esbuild (allowScripts), el build pasó. Sin relajar tsconfig/ESLint ni añadir dependencias.

## Decisiones nuevas
Ninguna que cambie el brain. Valores de ejemplo elegidos dentro de D-00 (siguen como huecos): eslogan "Tu rincón tranquilo para un buen café"; precios 45–80 MXN; lunes cerrado, mar–jue 08:00–20:00, vie 08:00–21:00, sáb 09:00–21:00, dom 09:00–15:00; "Calle Ejemplo 123, Col. Centro, 00000 Ciudad de México"; coordenadas 19.4326, -99.1332 (centro de CDMX); texto del mensaje de WhatsApp.
Riesgo esperado ALTO (business.ts y whatsapp.ts son zonas sensibles).
