---
name: fabrica
description: Fábrica de software con agentes Claude + Codex para crear páginas web y apps. Crea proyectos nuevos con su brain y un boceto visual dibujado por ChatGPT, y los construye tarea por tarea con revisores y aprobación humana. Úsala cuando el usuario escriba /fabrica o pida crear una página o app nueva "con la fábrica", generar o rehacer un boceto, planificar un proyecto, procesar tareas, corregir un error o ver el estado de un proyecto de la fábrica.
argument-hint: "[nuevo <nombre> <idea> | boceto <p> [ID] [cambios] | planificar <p> | <p> [tarea|error|issue <texto>] | <p> continuar <ID> | estado [p] | actualizar]"
---

# /fabrica: la fábrica de software, desde cualquier chat

La fábrica vive en una carpeta fija:

**FABRICA = `{{FABRICA}}`**

Ahí están las reglas (`CLAUDE.md`), los roles (`.claude/agents/`), los pasos de cada comando
(`.claude/commands/`), el guardián (`.claude/hooks/guardian.mjs`) y los proyectos, cada uno con su
brain (`proyectos/<p>/brain/`). Esta skill es la puerta de entrada: lleva el chat a esa carpeta y sigue
allí el comando que toque.

Argumentos recibidos: `$ARGUMENTS`

## Paso 1 · Trabajar DENTRO de la fábrica (obligatorio)
1. Si no existe FABRICA, ofrece instalarla:
   `git clone https://github.com/kookidns/fabrica-software "{{FABRICA}}"` y después, dentro,
   `node scripts/instalar-skill.mjs`. No sigas hasta que exista.
2. Si el directorio de trabajo de esta sesión NO es FABRICA (ni una carpeta dentro de ella):
   - **App de escritorio de Claude** (existe la herramienta `change_directory`; si está diferida, cárgala
     con ToolSearch): llama a `change_directory` con FABRICA. El cambio se aplica al terminar este turno.
     Dile al usuario en una línea que moviste la sesión a la fábrica y que vuelva a enviar
     `/fabrica $ARGUMENTS` para empezar. **Detente.**
   - **Terminal (CLI)**: dile que abra Claude Code en la fábrica con `cd "{{FABRICA}}"` y luego
     `claude`, y que repita el comando allí. **Detente.**

   Motivo: solo dentro de FABRICA se cargan `CLAUDE.md` y el guardián, que impide a los agentes aprobar
   por el humano, hacer push o editar `app/`. No ejecutes estaciones desde otra carpeta.
3. Ya dentro de FABRICA, sigue al paso 2.

## Paso 2 · Elegir el comando según la primera palabra
Lee el archivo indicado y **síguelo al pie de la letra**, pasándole como `$ARGUMENTS` el resto del texto:

| Primera palabra | Archivo que sigues | Ejemplo |
|---|---|---|
| *(vacío)* o `ayuda` | ninguno: muestra el menú (abajo) | `/fabrica` |
| `nuevo` | `.claude/commands/nuevo-proyecto.md` | `/fabrica nuevo tienda-tenis Tienda online de tenis…` |
| `boceto` | `.claude/commands/boceto.md` | `/fabrica boceto tienda-tenis botón de comprar más grande` |
| `planificar` | `.claude/commands/planificar.md` | `/fabrica planificar tienda-tenis` |
| `estado` | `.claude/commands/estado.md` | `/fabrica estado` · `/fabrica estado tienda-tenis` |
| `actualizar` | ejecuta `git -C "{{FABRICA}}" pull` y luego `node scripts/instalar-skill.mjs` | `/fabrica actualizar` |
| nombre de un proyecto existente en `proyectos/` | `.claude/commands/fabrica.md` (la línea de producción) | `/fabrica tienda-tenis` · `/fabrica tienda-tenis error El pago falla en iPhone` · `/fabrica tienda-tenis continuar T-20261120-001` |

Si la primera palabra no encaja en ninguno, muestra el menú y los proyectos que existen.

### Antes de `nuevo`: una buena descripción
Si la idea tiene menos de unas 3 frases, antes de crear el proyecto pregunta en un solo mensaje lo que
falte. Usa como guía la plantilla de `GUIA.md`: para quién es y en qué dispositivo, objetivo, páginas o
pantallas, funciones imprescindibles, qué no entra, marca y tono, referencias, y datos reales que ya
tenga. Si el usuario prefiere no contestar, sigue: el analista deja lo desconocido en `brain/huecos.md`.
Si adjunta imágenes de referencia, pásalas al analista.

## Menú (cuando no hay argumentos)
Muestra la lista de proyectos de `proyectos/`, con su estado en una línea (`node scripts/boceto.mjs estado <p>`
y si tiene la bandeja vacía), y estos comandos:
- `/fabrica nuevo <nombre> <idea>`: crea el proyecto y su brain, y ChatGPT dibuja el boceto.
- `/fabrica boceto <p> <cambios>`: rehace el boceto con tus cambios.
- `/fabrica planificar <p>`: con el boceto y la spec aprobados, arquitectura, diseño y tareas.
- `/fabrica <p>`: construye la siguiente tarea de la bandeja.
- `/fabrica <p> tarea|error <texto>`: una tarea o un error suelto.
- `/fabrica estado [p]`: en qué punto está todo y qué sigue.

## Lo que SOLO hace el humano (nunca tú)
- Aprobar el boceto: `node scripts/boceto.mjs aprobar <p> [--tarea <ID>]`.
- Integrar una tarea de riesgo ALTO: `node scripts/cerrar-tarea.mjs <p> <ID> --aprobar`.
- Hacer push o publicar.

Cuando llegue uno de esos momentos, enséñale el comando exacto y **detente**. Lo ejecuta en su terminal,
o en el CLI con `!` delante. Dentro de FABRICA el guardián te bloquea si lo intentas.
