```
VEREDICTO: APROBADO
Ronda: 1
Cambios obligatorios (solo si RECHAZADO), cada uno accionable:
(ninguno)
Hallazgos descartados:
- codigo #3 [BAJO] "Alcance de mi revisión": no es un hallazgo, es una nota de alcance. Lo que deja abierto (CA-18 a CA-22) se resuelve abajo con la evidencia de la fábrica y la del constructor.
- ux-ronda1-sin-evidencia #1 [MEDIO] y ui-ronda1-sin-evidencia #1-#3 [MEDIO]: no cuentan como veredicto. Pedían CAMBIOS solo porque no había navegador en el sandbox, no por un defecto. Los sustituyen revisor-ux-ronda1.md y revisor-ui-ronda1.md, ambos OK con la evidencia neutral. Se guardan solo como rastro.
Mejoras sugeridas (no bloquean):
- [MEDIO · ux/ui, lo detecta el constructor y lo confirma la evidencia neutral] src/styles/header.css:50 (.brand): el borde superior del anillo de foco queda fuera de la ventana, porque la marca empieza en y = 0 y el contorno se pinta 3-6 px por encima. Ya pasaba en main (CA-21: 0 píxeles de diferencia). Va a una tarea propia; ver la valoración abajo.
- [BAJO · codigo #1] src/styles/buttons.css:50: un .btn--secondary futuro fuera de .location__place no tendrá margen superior. Es lo que fija la decisión 1. Si aparece otro uso, su sección declarará el suyo.
- [BAJO · codigo #2] src/a11y.test.ts:70-74: la prueba de <img> sin alt hoy recorre 0 elementos. Es una guardia preventiva y así lo pide CA-3. Sin acción.
- [BAJO · proceso] scripts/evidencia.mjs marca la marca como "visible: true" aunque su anillo está recortado: comprueba el elemento, no su contorno. Conviene ampliar la estación (ver Pendientes).
```

## Por qué se aprueba
- **Los 4 revisores dan OK**: seguridad, ux, ui y código. No queda ningún hallazgo CRÍTICO ni ALTO. Los tres hallazgos de código son BAJO.
- **Puertas (CA-23)**: el revisor de código ejecutó `node scripts/verificar.mjs` por su cuenta y salieron lint, typecheck, test (17 archivos, 274 pruebas) y build `ok`, ninguna `omitida`. `git diff --stat` no toca ningún archivo protegido.
- **CA-1 a CA-17**: los verificó el revisor de código, uno a uno, contra las pruebas y el diff (`main.ts` solo con imports y `location.ts` solo con comentarios).
- **CA-18 a CA-22** (manuales): todos tienen prueba. El detalle está abajo. Ninguno se queda sin evidencia, aunque parte de CA-18, CA-20 y CA-21 solo la aporta el constructor.

## CA manuales: qué cubre la evidencia neutral y qué solo el constructor
"Neutral" es `evidencia-ronda1/` (`scripts/evidencia.mjs`, estación de código). "Constructor" es `build-ronda1.md` con `capturas-ronda1/`.

| CA | Cubierto por evidencia neutral | Solo por la palabra (y las capturas) del constructor |
|---|---|---|
| **CA-18** a 375 px | (a) `scrollWidth` 375 en la carga, sin elementos fuera del ancho (también a 768 y 1024). (b) Texto cortado: ninguno, más la captura `pagina-375.png` de la página entera. | (a) El valor de `scrollWidth` en **cada ancla** (tabla con 7 puntos). (c) **El encabezado queda visible bajo la cabecera sticky al saltar a cada ancla** (47/47/78/198 px de margen). La estación no salta a las anclas. Revisé `ca18-375-menu.png` y es coherente. |
| **CA-19** zonas táctiles | **Completo para lo nuestro**: los 8 enlaces propios miden ≥ 44×44 a 375, 768 y 1024 px, y `.skip-link` mide 173×44 con el foco puesto (recorrido con Tab). | Las medidas de los controles **internos** del iframe de OSM (+/− 29×29, atribución de 14 px de alto), que son la excepción de la decisión 3. La estación no entra en el iframe. |
| **CA-20** solo teclado | Orden de Tab idéntico al de la spec (salto → marca → 3 nav → WhatsApp portada → 7 paradas en el mapa → Cómo llegar → WhatsApp Reservar). Anillo `3px solid rgb(31,78,140)` en todos los nuestros. El salto aparece, mide 173×44 y lleva el foco a `main#contenido`. El foco sale del mapa hacia delante. El recorte de `.brand` se ve en `tab-02.png`. | El recorrido **completo con Mayús+Tab** y la salida del mapa **hacia atrás**: la estación solo da un Mayús+Tab, tras el salto. La comprobación con `elementFromPoint` de que ningún foco queda bajo la cabecera, aunque los `top` neutrales (56, 493, 550, 511) ya lo hacen evidente. |
| **CA-21** sin cambios visuales | Página entera en estado normal, main contra la rama, **idénticas byte a byte** a 375 y 1024 px, con terceros bloqueados. | Los estados de **hover y foco** en los dos WhatsApp y en "Cómo llegar", las vistas por sección y la comparación de `getComputedStyle` (solo cambia `min-width` en 3 `.nav-link` y 3 `.btn`). Revisé `ca21-{antes,despues}-375-foco-como-llegar.png` y son iguales. |
| **CA-22** Lighthouse | **Completo**: 3 ejecuciones propias de la fábrica (`evidencia-ronda1/lighthouse/lh-{1,2,3}.json`) con Lighthouse 12.8.2, `formFactor: mobile` y `throttlingMethod: simulate`. Salen 100/100 en las tres, mediana 100/100, con el iframe de OSM cargando en el informe. Coincide con los 3 informes del constructor. | Solo los detalles del rastro que pide la spec: versión de Chrome anotada, opción A y aviso `EPERM`. |

Conclusión: **CA-19 y CA-22 quedan cubiertos del todo por evidencia neutral** en lo que cuenta para el criterio. **CA-18, CA-20 y CA-21 quedan cubiertos en su mayor parte**. La parte que solo aporta el constructor tiene capturas y mediciones en bruto (`mediciones-ronda1.json`), y las capturas que revisé coinciden con lo que dice. No veo motivo para dudar de ella. Aun así, el humano debe saber que esa parte no la ha repetido nadie más.

## Valoración del anillo de foco de `.brand` (desviación del constructor)
Lo he mirado en `evidencia-ronda1/tab-02.png`: el contorno azul se ve en los lados izquierdo, derecho e inferior, y el superior queda fuera del borde de la ventana. **No bloquea.** Se clasifica como MEDIO y va a pendientes, por estos motivos:
1. **No es una regresión**: CA-21 da 0 píxeles de diferencia y estilos calculados idénticos frente a main. La tarea no ha empeorado nada.
2. **El foco sigue siendo inequívoco**: es un anillo de 3 px de alto contraste visible en tres lados, y el elemento no queda tapado por nada. WCAG 2.4.7 (foco visible) se cumple. 2.4.11 (foco no tapado) trata de contenido del autor que oculta el elemento, y aquí no hay ninguno. El anillo completo sería mejor práctica (2.4.13, nivel AAA), pero no es un requisito de HU-05.
3. **Rechazar no sería accionable**: arreglarlo exige una declaración nueva y un cambio visible, y la decisión 1 y CA-21 lo prohíben en esta tarea. Pedírselo al constructor sería pedirle que incumpla la spec. Lo correcto era detenerse y anotarlo, y eso hizo.
4. **Literalidad de CA-20**: "sin quedar recortado" no se cumple al pie de la letra en `.brand`. Lo registro como **desviación conocida y aceptada**, no como un CA sin prueba: la prueba existe y muestra exactamente el estado heredado de main.

No se ha medido a 1024 px. La marca también empieza en y = 0, así que lo más probable es que pase igual. La tarea de seguimiento debe comprobarlo.

## Recomendaciones para el brain al cerrar
**decisiones.md / diseno.md** (las 4 decisiones de la spec, que ahora se aceptan):
- **División de `main.css`** (decisión 1): la tabla de archivos y selectores y el orden de importación en `main.ts` (tokens → main → header → buttons → hero → reserve → footer → menu → location). Cierra el pendiente de D-08 y el de D-10 (`.btn--secondary` vive ahora en `buttons.css`). La anulación `reduce` de `.btn:active` va junto al botón.
- **Zona táctil verificable** (decisión 2): `min-width: var(--tap-min)` en `.nav-link` y `.btn`. Todo elemento enfocable nuevo debe usar `skip-link`, `brand`, `nav-link` o `btn`, y si no, falla CA-5 de `a11y.test.ts`.
- **Procedimiento de Lighthouse** (decisión 4): 3 ejecuciones y mediana, configuración móvil por defecto, `npx` fuera del worktree e informes en `tareas/<ID>/lighthouse/`. **Línea base**: 100/100 con las fuentes del sistema, Lighthouse 12.8.2 y Chrome 157, con el iframe de OSM adelantando su carga (D-10).
- **Proceso de la fábrica**: la estación de evidencia neutral (`scripts/evidencia.mjs`) pasa a ser una entrada obligatoria de los revisores UX y UI en tareas con `Toca interfaz: sí`. La primera pasada sin navegador queda como precedente de por qué existe.

**huecos.md / pendientes**:
- **Anillo de `.brand` recortado por arriba** (a 375 px, probablemente también a 1024): tarea pequeña con decisión de diseño, por ejemplo `.brand:focus-visible { outline-offset: -3px; }` o relleno vertical en la cabecera. Su CA-21 esperará una diferencia solo en el estado de foco de `.brand`.
- **Excepción de la decisión 3** (controles del iframe de OSM < 44 px): pendiente de confirmación humana. **Hay que corregir la cifra**: +/− miden 29×29 y los enlaces de atribución 14 px de alto, no "unos 30 px". Esta medida solo la ha tomado el constructor.
- **Comprobaciones humanas de cierre**:
  - WhatsApp y "Cómo llegar" en un teléfono real;
  - aprobación del cierre por **riesgo ALTO** (`src/main.ts` y `src/sections/location.ts` son zonas sensibles). Este APROBADO es el de la fábrica y no sustituye esa firma.
- **Repetir Lighthouse** si se cargan Google Fonts u otras fuentes, y al publicar (la medida local sobre `vite preview` no garantiza la de producción).
- **Ampliar `scripts/evidencia.mjs`** para que la parte que hoy solo aporta el constructor tenga respaldo neutral:
  - saltos a las anclas, con la posición del encabezado bajo la cabecera sticky;
  - comparación main/rama en estados de hover y foco;
  - recorrido completo con Mayús+Tab;
  - recorrido con Tab también a 1024 px;
  - detectar el contorno de foco recortado por el borde de la ventana.
- Sigue abierto, sin cambios: el marcador del mapa a 768 px (bbox de D-10). El 404 de `favicon.ico` en consola es conocido y queda fuera de alcance.
