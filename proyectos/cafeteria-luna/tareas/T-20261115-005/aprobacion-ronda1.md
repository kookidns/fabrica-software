VEREDICTO: APROBADO
Ronda: 1
Cambios obligatorios (solo si RECHAZADO), cada uno accionable:
(ninguno)

Hallazgos descartados:
- [BAJO, codigo] src/styles/split.test.ts:281: "las pruebas solo vigilan el CSS, no el render". El propio revisor dice que no pide cambios. Es la limitación asumida en D-03 (sin Playwright en las puertas), y el render lo cubren la medición manual y la evidencia de la fábrica. Queda como observación, no como hallazgo.
- [BAJO, codigo] src/styles/header.css:50: el revisor confirma que los comentarios están bien, que el archivo tiene ~120 líneas (≤ 200), sin literales de color ni duplicados. Es una constatación positiva, no un defecto.
- [seguridad] "No verificado: cabeceras HTTP y CORS en producción". No aplica: el diff solo toca `header.css` y `split.test.ts`, sin red, dependencias ni datos (`npm audit --omit=dev`: 0).
- 404 de `/favicon.ico` en la consola (evidencia de la fábrica y del constructor): ya ocurría en `main` (lo registra `mediciones-ronda1.json` › `consola`, igual en main y en la rama) y no lo introduce esta tarea. No cuenta como "error de consola nuevo" para el CA-5.

Mejoras sugeridas (no bloquean):
1. [MEDIO, aprobador: fidelidad de la evidencia] `capturas-ronda1/{antes,despues}-{375,768,1024}-foco-marca-final.png` (las seis capturas tras hacer scroll) solo muestran el fondo crema de la página: no aparece ni la cabecera ni la marca ni el anillo. Sin embargo, `build-ronda1.md:117-118` afirma que en ellas "falta el lado de arriba" (antes) y que "el anillo se ve por los cuatro lados" (después). Las capturas `-arriba` sí son correctas: a 768 y 1024 px se ve el anillo sin el lado de arriba antes y completo después. Lo más probable es que el `clip` del script de captura se aplique a coordenadas del documento y no de la ventana. No bloquea, porque el CA-1 se define por la medida numérica, que está en el JSON para los 12 casos, y porque el mecanismo no depende del scroll (ver la valoración de abajo). Para próximas tareas: capturar la ventana (`captureBeyondViewport: false` o un `clip` relativo a la ventana) y no describir capturas sin haberlas mirado.
2. [BAJO, codigo] No hay ninguna prueba automática del render del anillo. Es una limitación de D-03; no se pide nada en esta tarea.
3. [Fábrica, fuera de alcance de la tarea] Ampliar `scripts/evidencia.mjs` para recorrer con Tab también a 768 y 1024 px y con la página desplazada, para detectar contornos recortados y para hacer `--comparar-main` a 768 px. Esto ya está pendiente en `log.md`; esta tarea vuelve a mostrar que hace falta (ver la valoración de abajo).

---

## Comprobaciones del aprobador
- **Hallazgos CRÍTICO/ALTO**: ninguno. Los cuatro revisores dan OK. Solo hay dos BAJO (codigo), descartados arriba.
- **Puertas**: pasan. Las ejecutó de forma independiente el revisor de código (`node scripts/verificar.mjs`: lint, typecheck, test 280/280 y build en verde, con los CA-6, CA-7 y CA-8 de `split.test.ts` incluidos). Coinciden con `build-ronda1.md`.
- **Diff leído por mí** (`git diff main...546e405`): solo 2 archivos, los previstos en la spec. `.brand` gana `padding-inline: var(--space-2)` y `margin-inline: calc(-1 * var(--space-2))`, y conserva `min-height: var(--header-height)`. La regla nueva `.brand:focus-visible { outline-offset: -3px; }` no redeclara grosor, estilo ni color. El bloque `@media` y los demás selectores no cambian. Ninguna zona sensible.
- **CA → prueba**:
  - CA-1: medida literal de la spec en 3 vistas × arriba/final, con `focus-visible` comprobado (`mediciones-ronda1.json`). `exterior` = (0, 8|16, 161.09|184.33, 56|64), dentro de W×H. `overflow: visible` en ambos ancestros. Antes: `top` = −6 en las 3 vistas. Se confirma a 375 px con la captura neutral `evidencia-ronda1/tab-02.png`, donde se ven los cuatro lados.
  - CA-2: `anillo` = `["solid","3px","rgb(31, 78, 140)"]`. El texto queda dentro del borde interior, con 5 px de holgura a los lados, en las 6 mediciones de la rama.
  - CA-3: `evidencia-ronda1/resumen.md` dice "idénticas" a 375 y 1024 px. A 768 px, el texto (24, 21, 152.33×22) y `.site-header` (0, 0, 768×65) son iguales en main y en la rama (medición del constructor).
  - CA-4 a–d: pruebas en `split.test.ts` › "T-20261115-005 CA-4". Las he leído: comprueban valores concretos del CSS real (selectores exactos, `@media` sin cambios, offset negativo ≥ grosor global, ninguna propiedad longhand de `outline`, lista cerrada de `:focus-visible` y la regla global intacta). Rojo → verde documentado, con mutaciones.
  - CA-5: puertas en verde. En el recorrido con Tab de la fábrica, el paso 2 (`a.brand`) da `3px solid rgb(31, 78, 140)`, `visible: true`, 153×56. No hay enfocables nuevos de menos de 44×44 ni errores de consola nuevos.

## Valoración explícita: casos que solo midió el constructor
Ni los cuatro revisores ni la evidencia de la fábrica verifican estos casos: CA-1 y CA-2 a 768 y 1024 px y con scroll (también a 375 px con scroll), y la geometría frente a main a 768 px (CA-3). **Mi conclusión: la medición del constructor basta y no bloquea.** Motivos:

1. **La prueba existe y es la que pide la spec.** El CA-1, el CA-2 y la parte de 768 px del CA-3 se definen por una medida numérica en consola, y el constructor ejecutó ese script literal en los 12 casos (3 vistas × antes/después × arriba/final). Antes de medir comprobó `activeElement === .brand && :focus-visible`. Los datos en bruto están en `mediciones-ronda1.json`. No es un "CA sin prueba": es una prueba no replicada por un tercero.
2. **Los números son coherentes con la aritmética del CSS**, así que no parecen inventados. La caja de la rama mide lo de main + 16 px, y su borde izquierdo está 8 px más a la izquierda (padding de 8 compensado con margen de −8). `exterior` coincide con la caja (offset −3 + grosor 3 = 0) e `interior` está 3 px hacia dentro. El texto no se mueve ni un píxel. Los valores de main (−6) reproducen exactamente el defecto descrito en el origen.
3. **El resultado no depende del ancho ni del scroll.** Con `outline-offset: -3px` y un grosor de 3 px, el borde exterior del anillo coincide con el border-box de `.brand`. Ese border-box empieza en y = 0 con o sin scroll, porque la cabecera es sticky con `top: 0` y `.site-header__inner` no tiene padding (también se mide así en main). Además, `--space-2` es el mismo token para el padding y para el margen en las dos vistas: la prueba lo comprueba en `base` y en `md`, así que la caja de margen no cambia. Las reglas de `@media (min-width: 768px)` siguen idénticas (prueba CA-4 a). Lo que vale a 375 px, donde sí hay evidencia neutral (`tab-02.png`), vale por construcción a 768 y 1024 px y tras el scroll.
4. **La evidencia neutral corrobora lo que puede**: no hay desbordamiento horizontal a 375, 768 ni 1024 px (el margen negativo no saca nada del ancho), los 9 enfocables miden ≥ 44×44 en las tres vistas y la página en reposo es idéntica byte a byte a main a 375 y 1024 px. Las capturas `-arriba` del constructor a 768 y 1024 px muestran el antes y el después que describe.
5. **Salvedad**: las capturas `-final` (con scroll) no sirven como evidencia visual (mejora 1). Para el caso con scroll solo quedan los números del JSON y el argumento del punto 3. Lo considero suficiente para un cambio de 2 líneas de CSS que solo afecta al foco, pero queda anotado. Si un humano quiere certeza visual antes de integrar, basta con enfocar la marca a 768 o 1024 px, hacer scroll al final y mirar la cabecera.

## Propuesta para el brain (la registra el orquestador al cerrar)
- **`decisiones.md`, nueva D-12** · Excepción al patrón de foco de `diseno.md` en `.brand` (2026-11-15 · origen: T-20261115-005):
  - `.brand:focus-visible` usa `outline-offset: -3px` (anillo hacia dentro) en vez del +3 px global, porque su caja empieza en el borde superior de la ventana (cabecera sticky con `top: 0`, sin padding) y el anillo hacia fuera se recortaba por arriba.
  - Grosor, estilo y color siguen siendo los globales (`3px solid var(--color-focus)`). Hacia dentro, el anillo cae sobre `--color-surface` de la cabecera (6.97:1, fila 22), nunca sobre `primary`. Si `.brand` recibiera algún día un fondo `primary`, hay que revisar esta excepción.
  - Para que el anillo no tape el texto, `.brand` lleva `padding-inline: var(--space-2)` compensado con `margin-inline: calc(-1 * var(--space-2))` (mismo patrón que `.site-nav__list`). Así quedan 5 px entre el anillo y el texto, la página en reposo no cambia y la zona clicable de la marca crece 8 px por cada lado.
  - Es la única excepción: los únicos `:focus-visible` permitidos en `src/styles/*.css` son el global, `.site-footer :focus-visible` y `.brand:focus-visible`, y `split.test.ts` (CA-4 d) lo vigila.
- **`log.md`**: T-20261115-005 aprobada en la ronda 1 y cierra el pendiente MEDIO de T-20261115-004 (anillo de `.brand` recortado; se confirma que también ocurría a 1024 px). Nota: las capturas `-final` de `capturas-ronda1/` salieron vacías y el informe del constructor las describía como válidas.
- **`huecos.md`**: el hueco del CA de producto sobre foco visible (CA-05.4 frente a un posible CA-05.5) ya está registrado por el spec-writer. No hay que añadir nada.
- **Pendiente de fábrica** (ya está en `log.md`, se refuerza): `evidencia.mjs` debería recorrer con Tab a 768 y 1024 px y con scroll, y hacer `--comparar-main` a 768 px.
