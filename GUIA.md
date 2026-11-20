# Guía de uso: la fábrica en varios chats y varios proyectos

Esta guía explica cómo usar la fábrica día a día desde Claude Code: cómo crear proyectos, cómo se arma el
brain (con la estructura y las imágenes como objetivo), cómo trabajar en varios chats a la vez y qué te toca hacer a ti.

---

## 1. Instalación (una sola vez)

1. **Clona la fábrica en una carpeta permanente**. No uses carpetas temporales:
   ```bash
   git clone https://github.com/kookidns/fabrica-software "%USERPROFILE%\Documents\fabrica-software"
   ```
2. **Requisitos**: Node 22 o superior, Git, Google Chrome (para la evidencia visual) y la app o el CLI de **Codex**
   con tu cuenta de ChatGPT. Comprueba Codex con:
   ```bash
   node scripts/agente-codex.mjs --comprobar
   ```
   Debe decir `Logged in using ChatGPT`. Con esa sesión, Codex hace las revisiones, **crea la estructura
   y genera las imágenes** de cada página, sin claves de API.
3. **Instala la skill `/fabrica`** (una vez por computadora, desde la carpeta de la fábrica):
   ```bash
   node scripts/instalar-skill.mjs
   ```
   Crea `~/.claude/skills/fabrica/SKILL.md` apuntando a esta carpeta. Repítelo si mueves la fábrica.
4. (Opcional) Para seguir con la demo, clona también la app de ejemplo:
   ```bash
   git clone https://github.com/kookidns/cafeteria-luna proyectos/cafeteria-luna/app
   ```

---

## 1b. La skill `/fabrica`: úsala desde cualquier chat nuevo

Con la skill instalada, **abre un chat nuevo de Claude Code donde quieras y escribe `/fabrica`**.
- Si el chat no está en la carpeta de la fábrica, la skill lo mueve allí (en la app de escritorio) y te
  pide que vuelvas a enviar el comando. En la terminal te dice que abras `claude` dentro de la fábrica.
- Ya dentro, te enseña tus proyectos y los comandos, o ejecuta directamente lo que pidas:

| Quieres… | Escribe |
|---|---|
| Ver tus proyectos y qué sigue | `/fabrica` o `/fabrica estado` |
| Empezar una página o app nueva | `/fabrica nuevo tienda-tenis Tienda online de tenis para corredores…` |
| Cambiar la estructura | `/fabrica estructura tienda-tenis añade una sección de opiniones` |
| Rehacer una sola imagen | `/fabrica estructura tienda-tenis --recurso hero-tenis más luminosa` |
| Aprobar estructura e imágenes (lo haces tú) | `node scripts/estructura.mjs aprobar tienda-tenis` |
| Arquitectura, diseño y tareas | `/fabrica planificar tienda-tenis` |
| Construir la siguiente tarea | `/fabrica tienda-tenis` |
| Una tarea o un error suelto | `/fabrica tienda-tenis tarea Añadir preguntas frecuentes` · `/fabrica tienda-tenis error El pago falla en iPhone` |
| Retomar una tarea que esperaba tu aprobación de estructura | `/fabrica tienda-tenis continuar T-20261120-001` |
| Traer la última versión de la fábrica | `/fabrica actualizar` |

Si al crear un proyecto tu idea es corta, la skill te hace primero unas pocas preguntas (público,
páginas, marca, referencias…) para que el brain salga completo. Si prefieres no contestar, el analista
deja lo que falte en `brain/huecos.md`.

---

## 2. La regla de los chats: cada chat se abre EN la carpeta de la fábrica

La fábrica funciona porque Claude Code lee al abrir la sesión, en esa carpeta:
- `CLAUDE.md`: las reglas y el proceso;
- `.claude/commands/`: los comandos `/nuevo-proyecto`, `/estructura`, `/planificar`, `/fabrica` y `/estado`;
- `.claude/agents/`: los roles;
- `.claude/hooks/guardian.mjs`: el guardián, que impide a los agentes aprobar por ti, hacer push o editar `app/`.

Así que **cada chat nuevo debe empezar en la carpeta `fabrica-software`**:
- **App de escritorio (pestaña Code)**: nueva sesión → elige la carpeta `fabrica-software`.
- **Terminal**: `cd fabrica-software` y luego `claude`.

Si abres un chat en otra carpeta, no verá los comandos ni el guardián.

**No hace falta copiar contexto entre chats.** El contexto vive en el **brain** de cada proyecto
(`proyectos/<p>/brain/`), en disco. Un chat nuevo lo lee solo cuando lanzas un comando con el nombre del
proyecto. Puedes cerrar un chat y seguir mañana en otro: el estado está en el brain, la bandeja y `tareas/`.

---

## 3. Crear un proyecto nuevo: tú describes, la fábrica arma el brain

**Sí: la fábrica te crea siempre el brain.** Tú solo describes lo que quieres; el agente **analista**
escribe la visión, la spec y los huecos; ChatGPT crea la estructura en diagrama y las imágenes de la página.

### Paso 1 · Describe la idea (cuanto más detalle, mejor)
```
/nuevo-proyecto tienda-tenis Tienda online de tenis para corredores principiantes en México.
Público: 20-35 años, compra desde el móvil. Objetivo: vender 3 modelos con pago por Mercado Pago.
Páginas: inicio con modelo destacado, catálogo con filtros por talla, ficha de producto, carrito.
Marca: enérgica y cercana, colores naranja y negro, mucho blanco. Referencias: nike.com/mx (limpieza),
pero menos saturado. No queremos cuentas de usuario ni blog por ahora.
```
También puedes adjuntar al chat capturas o imágenes de referencia.

Plantilla de descripción (copia y rellena lo que sepas):
```
Qué es: …
Para quién (público y dispositivo principal): …
Objetivo de negocio (qué debe conseguir): …
Páginas o pantallas: …
Funciones imprescindibles: …
Lo que NO entra todavía: …
Marca y tono (colores, estilo, palabras clave): …
Referencias que te gustan y por qué: …
Datos reales que ya tienes (textos, precios, contacto) o "aún no": …
```

Lo que pasa:
1. `nuevo-proyecto.mjs` crea `proyectos/tienda-tenis/` con su brain vacío y `app/` como repositorio git.
2. El **analista** escribe `brain/vision.md`, `brain/spec.md` y `brain/huecos.md`. Lo que no sabe no lo
   inventa: lo deja como pregunta en `huecos.md`.
3. **ChatGPT crea la estructura y los recursos** (`scripts/estructura.mjs generar`). No dibuja la página
   terminada:
   - `brain/estructura/v1/diagrama.md`: la estructura en diagrama (Mermaid): páginas, navegación, secciones
     en orden, componentes y datos de cada una;
   - `brain/estructura/v1/recursos.md` y `recursos.json`: qué imágenes lleva la página, dónde va cada una y
     su texto alternativo;
   - `brain/estructura/v1/img/<id>.png` y `.webp`: **solo las imágenes que irán dentro de la página**
     (ilustraciones, fotos, fondos), ya optimizadas para la web. Los iconos simples no se generan: los
     dibuja el constructor en SVG.
4. Claude te enseña el resumen, los huecos, el diagrama y las imágenes. **Se detiene.**

### Paso 2 · Revisa la estructura y las imágenes (estación humana)
- **¿Quieres cambios en la estructura?** Pídelos en lenguaje normal:
  ```
  /fabrica estructura tienda-tenis añade una sección de opiniones antes del pie y quita el blog
  ```
- **¿Solo una imagen?** Rehaz esa sin tocar lo demás:
  ```
  /fabrica estructura tienda-tenis --recurso hero-tenis más luminosa y con fondo blanco
  ```
  Cada cambio crea una versión nueva (`v2`, `v3`…) partiendo de la anterior.
- **¿Te gusta?** Apruébala **tú** desde tu terminal, en la carpeta de la fábrica:
  ```bash
  node scripts/estructura.mjs aprobar tienda-tenis
  ```
  En el CLI de Claude Code también puedes escribir `! node scripts/estructura.mjs aprobar tienda-tenis`.
  Claude no puede aprobarla por ti: el guardián lo bloquea, igual que `--aprobar`.

Al aprobar, esa versión se copia a `brain/estructura/aprobado/`. **El diagrama y las imágenes pasan a
formar parte del brain: son el objetivo que hay que alcanzar.** Mientras no exista, la fábrica no deja crear tareas.

### Paso 3 · Resuelve huecos y aprueba la spec
Abre `brain/huecos.md` y responde lo que sepas, editando el archivo o contestando en el chat. Luego:
```
/planificar tienda-tenis
```
Te pregunta si apruebas la spec, comprueba que la estructura esté aprobada y lanza al **arquitecto**
(stack, zonas sensibles y una bandeja de tareas que construye el diagrama sección por sección y coloca las
imágenes) y al **diseñador** (tokens de color, tipografía y espaciado coherentes con la marca y las imágenes).

### Paso 4 · Construir
```
/fabrica tienda-tenis
```
Cada vez procesa la siguiente tarea de la bandeja por toda la línea: spec, constructor, evidencia,
4 revisores, aprobador, riesgo y cierre. Repite hasta vaciar la bandeja. `/estado tienda-tenis` te dice
siempre en qué punto estás y cuál es el siguiente comando.

---

## 4. Trabajar en varios chats a la vez

| Situación | Cómo |
|---|---|
| **Varios proyectos** | Un chat por proyecto, todos abiertos en `fabrica-software`. Cada comando lleva el nombre del proyecto (`/fabrica tienda-tenis`, `/fabrica cafeteria-luna`). Los brains son independientes. |
| **Varias tareas del mismo proyecto** | Abre 2 o 3 chats y lanza `/fabrica <p>` en cada uno. Cada tarea recibe su ID, su rama y su worktree, así que no se pisan. Conviene que no toquen los mismos archivos. |
| **Retomar al día siguiente** | Chat nuevo → `/estado <p>`. Te dice qué espera tu aprobación y qué sigue. |
| **Una tarea suelta o un error** | `/fabrica <p> tarea Cambia el color del pie a gris` o `/fabrica <p> error El botón de pagar no responde en iPhone`. |
| **Una pantalla nueva que no estaba en la estructura** | `/fabrica <p> tarea Añadir página de preguntas frecuentes`. La fábrica genera la estructura de esa pantalla (y sus imágenes, si lleva) y se detiene hasta que la apruebes con `node scripts/estructura.mjs aprobar <p> --tarea <ID>`. Luego sigue con `/fabrica <p> continuar <ID>`. |

Los chats no se comunican entre sí y no lo necesitan: **el brain es la memoria compartida**. Lo que decide
una tarea queda en `brain/decisiones.md`, y la siguiente lo lee.

---

## 5. Lo que te toca a ti (y solo a ti)

| Momento | Qué haces | Comando |
|---|---|---|
| Estructura e imágenes del proyecto | Pides cambios o la apruebas | `/fabrica estructura <p> <cambios>` · `node scripts/estructura.mjs aprobar <p>` |
| Estructura de una pantalla nueva | Igual, con la tarea | `node scripts/estructura.mjs aprobar <p> --tarea <ID>` |
| Spec del proyecto | La apruebas | `/planificar <p>` te lo pregunta |
| Huecos | Respondes lo que sepas | editas `brain/huecos.md` |
| Tarea de riesgo ALTO | Revisas la rama y la integras | `node scripts/cerrar-tarea.mjs <p> <ID> --aprobar` |
| Publicar | Subes la app a GitHub o a tu hosting | `git push` en `proyectos/<p>/app` (los agentes nunca hacen push) |

---

## 6. Dónde está cada cosa de un proyecto

```
proyectos/<p>/
├── brain/                 ← la memoria: lo lee cada agente antes de actuar
│   ├── index.md           ← el mapa del brain
│   ├── vision.md          ← para quién, para qué, marca y tono
│   ├── spec.md            ← alcance y criterios del producto
│   ├── estructura/        ← EL OBJETIVO: vN/ (versiones) y aprobado/ (diagrama.md, recursos.json, img/*.webp)
│   ├── arquitectura.md    ← stack y estructura del código
│   ├── diseno.md          ← tokens visuales coherentes con la marca y las imágenes
│   ├── decisiones.md      ← lo ya decidido (no se rediscute)
│   ├── huecos.md          ← lo que falta saber
│   ├── zonas-sensibles.txt
│   └── log.md             ← historial
├── bandeja/               ← tareas pendientes
├── tareas/<ID>/           ← rastro completo de cada tarea
└── app/                   ← el código (repositorio git propio)
```

---

## 7. Ajustes útiles (`fabrica.config.json`)

- `estructura.max_imagenes`: cuántas imágenes puede generar ChatGPT por versión (6 por defecto).
- `estructura.ancho_max` y `estructura.calidad_webp`: tamaño y calidad de las imágenes optimizadas (1600 px, 0.82).
- `estructura.obligatorio`: `true` (por defecto). Con `false` se puede construir sin estructura (no recomendado).
- `estaciones.<rol>.motor`: `claude` o `codex`, para repartir el trabajo entre tus dos suscripciones.

## 8. Problemas frecuentes

- **"no tiene estructura aprobada"**: falta `node scripts/estructura.mjs aprobar <p>`; ese paso lo haces tú.
- **La estructura o las imágenes no se generan**: ejecuta `node scripts/agente-codex.mjs --comprobar` y mira
  `brain/estructura/vN/logs/codex.log`. Normalmente es que Codex no tiene sesión iniciada.
- **Faltan imágenes al aprobar**: rehazlas con `/fabrica estructura <p> --recurso <id>`.
- **No aparecen los comandos `/fabrica`, etc.**: el chat no está abierto en la carpeta `fabrica-software`.
- **"⛔ Guardián de la fábrica"**: un agente intentó algo que solo puedes hacer tú. Hazlo tú si estás de acuerdo.
