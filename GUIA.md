# Guía de uso: la fábrica en varios chats y varios proyectos

Esta guía explica cómo usar la fábrica día a día desde Claude Code: cómo crear proyectos, cómo se arma el
brain (con el boceto como objetivo), cómo trabajar en varios chats a la vez y qué te toca hacer a ti.

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
   Debe decir `Logged in using ChatGPT`. Con esa sesión, Codex hace las revisiones y **genera los
   bocetos**, sin claves de API.
3. (Opcional) Para seguir con la demo, clona también la app de ejemplo:
   ```bash
   git clone https://github.com/kookidns/cafeteria-luna proyectos/cafeteria-luna/app
   ```

---

## 2. La regla de los chats: cada chat se abre EN la carpeta de la fábrica

La fábrica funciona porque Claude Code lee al abrir la sesión, en esa carpeta:
- `CLAUDE.md`: las reglas y el proceso;
- `.claude/commands/`: los comandos `/nuevo-proyecto`, `/boceto`, `/planificar`, `/fabrica` y `/estado`;
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
escribe la visión, la spec y los huecos, y ChatGPT dibuja el boceto.

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
3. **ChatGPT dibuja el boceto** (`scripts/boceto.mjs generar`): versión para móvil y para escritorio, en
   `brain/boceto/v1-*.png`.
4. Claude te enseña el resumen, los huecos y el boceto. **Se detiene.**

### Paso 2 · Revisa el boceto (estación humana)
- **¿Quieres cambios?** Pídelos en lenguaje normal:
  ```
  /boceto tienda-tenis el botón de comprar más grande, quita el banner de descuento y usa fondo blanco
  ```
  ChatGPT genera `v2` partiendo de `v1` y aplicando solo esos cambios. Repite las veces que haga falta.
- **¿Te gusta?** Apruébalo **tú** desde tu terminal, en la carpeta de la fábrica:
  ```bash
  node scripts/boceto.mjs aprobar tienda-tenis
  ```
  En el CLI de Claude Code también puedes escribir `! node scripts/boceto.mjs aprobar tienda-tenis`.
  Claude no puede aprobarlo por ti: el guardián lo bloquea, igual que `--aprobar`.

Al aprobar se crean `brain/boceto/aprobado-movil.png`, `aprobado-escritorio.png` y `aprobado.md`.
**Ese boceto pasa a formar parte del brain: es el objetivo que hay que alcanzar.** Mientras no exista,
la fábrica no deja crear tareas.

### Paso 3 · Resuelve huecos y aprueba la spec
Abre `brain/huecos.md` y responde lo que sepas, editando el archivo o contestando en el chat. Luego:
```
/planificar tienda-tenis
```
Te pregunta si apruebas la spec, comprueba que el boceto esté aprobado y lanza al **arquitecto** (stack,
estructura, zonas sensibles y bandeja de tareas sacadas del boceto) y al **diseñador** (tokens de color,
tipografía y espaciado sacados del boceto).

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
| **Una pantalla nueva que no estaba en el boceto** | `/fabrica <p> tarea Añadir página de preguntas frecuentes`. La fábrica genera el boceto de esa tarea y se detiene hasta que lo apruebes con `node scripts/boceto.mjs aprobar <p> --tarea <ID>`. Luego sigue con `/fabrica <p> continuar <ID>`. |

Los chats no se comunican entre sí y no lo necesitan: **el brain es la memoria compartida**. Lo que decide
una tarea queda en `brain/decisiones.md`, y la siguiente lo lee.

---

## 5. Lo que te toca a ti (y solo a ti)

| Momento | Qué haces | Comando |
|---|---|---|
| Boceto del proyecto | Pides cambios o lo apruebas | `/boceto <p> <cambios>` · `node scripts/boceto.mjs aprobar <p>` |
| Boceto de una pantalla nueva | Igual, con la tarea | `node scripts/boceto.mjs aprobar <p> --tarea <ID>` |
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
│   ├── boceto/            ← EL OBJETIVO VISUAL (vN-*.png, aprobado-*.png, aprobado.md)
│   ├── arquitectura.md    ← stack y estructura
│   ├── diseno.md          ← tokens visuales sacados del boceto
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

- `boceto.formatos`: `ambos` (por defecto), `movil` o `escritorio`. Si haces una app solo móvil, pon `movil`.
- `boceto.obligatorio`: `true` (por defecto). Con `false` se puede construir sin boceto (no recomendado).
- `estaciones.<rol>.motor`: `claude` o `codex`, para repartir el trabajo entre tus dos suscripciones.

## 8. Problemas frecuentes

- **"no tiene boceto aprobado"**: falta `node scripts/boceto.mjs aprobar <p>`; ese paso lo haces tú.
- **El boceto no se genera**: ejecuta `node scripts/agente-codex.mjs --comprobar` y mira
  `brain/boceto/logs/vN.log`. Normalmente es que Codex no tiene sesión iniciada.
- **No aparecen los comandos `/fabrica`, etc.**: el chat no está abierto en la carpeta `fabrica-software`.
- **"⛔ Guardián de la fábrica"**: un agente intentó algo que solo puedes hacer tú. Hazlo tú si estás de acuerdo.
