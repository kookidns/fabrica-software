# AI Factory — fábrica de software con agentes

Basada en el flujo del video «Programar con agentes ya no basta: monta tu Software Factory»
(Eric Risco), montada sobre Claude Code.

> Entra trabajo por un lado (tarea, error de producción, issue), sale código integrado por el otro.
> En medio, estaciones repetibles y auditables. Tú diseñas el sistema y decides en lo crítico.

## La línea

```
 idea del proyecto
      │
 [A] analista ........... agente   brain: visión, spec y huecos
 [B] estructura ......... agente   ChatGPT (vía Codex): diagrama de la estructura (Mermaid) + solo las
                                   imágenes que irán en la página (→ WebP) → brain/estructura/vN/
 [C] revisas ............ humano   pides cambios (/fabrica estructura <p> <cambios> · --recurso <id>) o
                                   lo apruebas TÚ: node scripts/estructura.mjs aprobar <p> → brain/estructura/aprobado/
 [D] planificar ......... agentes  arquitecto + diseñador, a partir de la estructura aprobada → bandeja/
      │
 bandeja/ o texto
      │
 [0] entrada ............ código   scripts/nueva-tarea.mjs  → ID + rama + worktree (exige estructura aprobada)
 [0b] estructura tarea .. agente   solo si la tarea es una pantalla nueva; también la apruebas tú
 [1] spec-writer ........ agente   consulta el brain → tareas/<ID>/spec.md
 [2] constructor ........ agente   TDD en su worktree → commit, puertas verdes
 [2b] evidencia ......... código   scripts/evidencia.mjs (si toca interfaz): capturas, medidas,
                                   recorrido con Tab, comparación con main, Lighthouse
 [3] 4 revisores ........ agentes  en paralelo y con contexto limpio:
                                   seguridad · UX · UI · código
                                   (no leen al constructor; sí la evidencia de la fábrica)
 [4] aprobador .......... agente   consolida → RECHAZADO vuelve a [2] (máx. 3 rondas)
 [5] riesgo ............. código   scripts/riesgo.mjs (zonas sensibles, tamaño)
                          agente   clasificador-riesgo (solo puede SUBIR el nivel)
 [6] cierre ............. código   BAJO → integra en main solo
                                   ALTO → espera:  node scripts/cerrar-tarea.mjs <p> <ID> --aprobar  (tú)
 [7] brain .............. log y decisiones actualizados
```

Cada estación deja rastro en `proyectos/<p>/tareas/<ID>/`: entrada, spec, informes de cada ronda,
aprobación, riesgo y `traza.jsonl` (quién, cuándo, qué resultado).

## Piezas

| Pieza | Dónde | Para qué |
|---|---|---|
| Constitución | `CLAUDE.md` | Reglas y proceso; Claude lo lee siempre |
| Estándares | `estandares/` | Stack, estilo y "terminado" comunes a todos los proyectos |
| **Brain** | `proyectos/<p>/brain/` | Memoria persistente: visión, spec, arquitectura, diseño, decisiones, huecos, log |
| Bandeja | `proyectos/<p>/bandeja/` | Entradas pendientes, un `.md` por tarea |
| Agentes | `.claude/agents/` | analista, arquitecto, disenador, spec-writer, constructor, 4 revisores, aprobador, clasificador-riesgo |
| Comandos | `.claude/commands/` | `/nuevo-proyecto`, `/estructura`, `/planificar`, `/fabrica`, `/estado` (y la skill `/fabrica` desde cualquier chat) |
| **Estructura y recursos** | `scripts/estructura.mjs` + rol `generador-estructura` | ChatGPT crea el diagrama y las imágenes de la página; el humano lo aprueba; vive en `brain/estructura/` |
| Estaciones de código | `scripts/` | Lo determinista: crear tarea, puertas, riesgo, cierre, traza |
| Guardián | `.claude/hooks/guardian.mjs` | Bloquea a los agentes: push, merge, `--aprobar`, `reset --hard`, editar `app/` o la traza |

## Uso — abre Claude Code en esta carpeta

> **Guía completa** (instalación, varios chats, varios proyectos, cómo se arma el brain): [GUIA.md](GUIA.md)

**Proyecto nuevo (una vez):**
1. `/nuevo-proyecto cafeteria-luna Landing para una cafetería con menú, ubicación y reservas por WhatsApp`
   → el analista crea el brain y ChatGPT crea la estructura (diagrama) y las imágenes de la página.
2. Revisa: `/fabrica estructura cafeteria-luna <qué cambiar>` (o `--recurso <id>` para una imagen) hasta que
   te guste, y apruébalo **tú**: `node scripts/estructura.mjs aprobar cafeteria-luna`.
3. Lee `proyectos/cafeteria-luna/brain/spec.md`, resuelve `brain/huecos.md` y aprueba.
4. `/planificar cafeteria-luna` → arquitectura, diseño y bandeja llena de tareas, a partir de la estructura.

**Día a día:**
- `/fabrica cafeteria-luna` → procesa la siguiente entrada de la bandeja de principio a fin.
- `/fabrica cafeteria-luna error El formulario de reservas da 500 al enviar sin teléfono`
- `/fabrica cafeteria-luna tarea Cambia el botón principal a verde`
- `/estado cafeteria-luna` → qué hay en curso, qué espera tu aprobación y qué sigue.

**En paralelo:** cada tarea tiene su ID, su rama y su worktree, así que puedes abrir varias
sesiones de Claude Code en esta carpeta y lanzar `/fabrica` en cada una a la vez.

## Demo incluida: cafeteria-luna

`proyectos/cafeteria-luna/` es un proyecto real hecho con esta fábrica: landing de una cafetería
(menú, horario con mapa y reservas por WhatsApp), construida en 7 tareas que pasaron por todas las
estaciones. Aquí están su brain, su bandeja procesada y el rastro completo de cada tarea (specs,
informes del constructor, revisiones, aprobaciones, riesgo, evidencia, capturas, Lighthouse y logs).

El código de la app es su propio repositorio, como manda la fábrica:
[github.com/kookidns/cafeteria-luna](https://github.com/kookidns/cafeteria-luna). Para seguir
usando la fábrica con él, clónalo dentro de este repositorio:

```bash
git clone https://github.com/kookidns/cafeteria-luna proyectos/cafeteria-luna/app
cd proyectos/cafeteria-luna/app && npm ci
```

## Dos motores: Claude + Codex (OpenAI)

Cada estación puede correr en **Claude** (subagente de Claude Code) o en **Codex** (OpenAI). Se
decide en [`fabrica.config.json`](fabrica.config.json), sin tocar nada más. Ambos motores leen la
**misma** definición de rol (`.claude/agents/<rol>.md`) y el mismo brain.

Reparto por defecto (el del video):

| Estación | Motor | Por qué |
|---|---|---|
| spec-writer, constructor, aprobador | Claude (Opus) | Planificar y programar |
| revisor-seguridad, revisor-ux | Codex · GPT-6.1-Sol | Otra familia de modelos revisa sin el sesgo de quien programó |
| revisor-ui | Codex · GPT-6.2-Astra | Especializado en interfaces |
| revisor-codigo | Claude (Sonnet) | Tarea acotada, modelo más ligero |
| clasificador-riesgo | Codex · GPT-6.1-Sol | Decisión crítica tomada por otra familia |

Así, la mitad del trabajo de revisión consume tu plan de ChatGPT en vez de tu sesión de Claude.

- Comprobar que Codex está listo: `node scripts/agente-codex.mjs --comprobar`
- Lanzar una estación a mano: `node scripts/agente-codex.mjs revisor-seguridad <p> <ID>`
- Todo lo que hace Codex queda en `tareas/<ID>/logs/<rol>-ronda<n>.log` (prompt + salida completa).

**Cómo se controla a Codex** (el hook guardián solo vigila a Claude):
- **Sandbox por rol**: los revisores solo pueden escribir en `tareas/<ID>/revisiones/`; el
  aprobador y el clasificador, en ningún sitio; el constructor, solo en su worktree.
- **Comprobación de integridad**: si un revisor modifica el código, el script lo detecta y marca ERROR.
- **Fallo seguro**: si el clasificador de riesgo falla o responde algo inválido, el riesgo es ALTO.
- **Diff servido por la fábrica**: antes de cada revisor, aprobador o clasificador, el script guarda
  `tareas/<ID>/diff-ronda<n>.patch` (base...HEAD, con commits y resumen) y se lo indica en el prompt,
  porque en el sandbox de Codex `git` puede fallar. Sin esto, el clasificador subía a ALTO por no ver el diff.
- **Contexto limpio**: ningún revisor lee el informe ni las capturas del constructor. Lo visual lo
  juzgan con la evidencia neutral de `scripts/evidencia.mjs`; lo que no pueden comprobar va en la
  línea "No verificado por mí" y no cuenta como hallazgo.
- El commit del constructor lo hace el script, no Codex.

> Si pasas `revisor-codigo` a Codex, ten en cuenta que su sandbox no deja compilar en el worktree;
> las puertas las vuelven a ejecutar el constructor y `cerrar-tarea.mjs` de todos modos.

## Diferencias con el video (y cómo acercarte más)
- **Entradas automáticas** (Sentry, GitHub, Slack, voz). Aquí entran por la bandeja o por texto.
  Siguiente paso: un webhook que escriba un `.md` en `bandeja/` y lance
  `claude -p "/fabrica <p>"` en modo no interactivo.
- **Pull requests.** Aquí la integración es local (merge a `main`). Con un remoto en GitHub,
  `cerrar-tarea.mjs` puede abrir una PR para los casos de riesgo ALTO en vez de esperar en local.

## Requisitos
- Claude Code (app de escritorio o CLI).
- Node.js 20+ y git (con `user.name` y `user.email` configurados).
- Codex (app de escritorio o CLI) con sesión iniciada, para las estaciones con motor `codex`.
  El script encuentra solo el `codex.exe` de la app de escritorio.
- Opcional: Playwright (`npx playwright install chromium`) para que el revisor de UI tome capturas.
